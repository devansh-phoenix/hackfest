import uuid
from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SyncOperationRecord
from apps.shops.models import Shop
from apps.shops.permissions import IsShopMember
from apps.inventory.models import Product, StockMovement
from apps.sales.models import Sale, SaleItem

class BatchSyncView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsShopMember]

    def post(self, request, shop_id):
        shop = get_object_or_404(Shop, id=shop_id)
        operations = request.data.get('operations', [])
        if not isinstance(operations, list):
            return Response({'error': 'operations must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

        results = []

        for op in operations:
            op_id = str(op.get('id', ''))
            entity_type = op.get('entity_type')
            entity_id = str(op.get('entity_id', ''))
            payload = op.get('payload', {})

            if not op_id:
                results.append({
                    'id': op_id,
                    'status': 'FAILED',
                    'error': 'Missing operation id'
                })
                continue

            # 1. Server-side Idempotency Protection:
            # If this operation has already been processed, return the cached result
            existing = SyncOperationRecord.objects.filter(shop=shop, operation_id=op_id).first()
            if existing:
                results.append({
                    'id': op_id,
                    'status': existing.status,
                    'idempotent': True,
                    'data': existing.response_data
                })
                continue

            # 2. Process new operation inside a savepoint transaction
            try:
                with transaction.atomic():
                    op_result = {}

                    if entity_type == 'SALE':
                        # Process offline sale
                        items_data = payload.get('items', [])
                        if not items_data:
                            raise ValueError('Sale payload must contain items.')

                        product_ids = [item['productId'] for item in items_data]
                        products = {
                            str(p.id): p for p in Product.objects.select_for_update().filter(id__in=product_ids, shop=shop)
                        }

                        # Check stock availability
                        for item in items_data:
                            pid = str(item['productId'])
                            if pid not in products:
                                raise ValueError(f"Product {pid} not found in this shop.")
                            qty = Decimal(str(item['quantity']))
                            prod = products[pid]
                            if qty > prod.current_stock:
                                raise ValueError(f"Insufficient stock for {prod.name}. Available: {prod.current_stock}")

                        # Check if sale record exists by client_id
                        sale = Sale.objects.filter(id=entity_id, shop=shop).first()
                        if not sale:
                            sale = Sale.objects.create(
                                id=uuid.UUID(entity_id) if len(entity_id) == 36 else uuid.uuid4(),
                                shop=shop,
                                receipt_number=payload.get('receiptNumber') or f"RCP-{int(timezone.now().timestamp())}",
                                total_amount=Decimal(str(payload.get('totalAmount', '0.00'))),
                                payment_mode=payload.get('paymentMode', 'cash'),
                                timestamp=payload.get('timestamp') or timezone.now(),
                                client_id=op_id
                            )

                            for item in items_data:
                                prod = products[str(item['productId'])]
                                qty = Decimal(str(item['quantity']))
                                unit_price = Decimal(str(item.get('unitPrice', prod.selling_price)))
                                subtotal = (qty * unit_price).quantize(Decimal('0.01'))

                                new_stock = prod.current_stock - qty
                                prod.current_stock = new_stock
                                prod.last_sold_at = sale.timestamp
                                prod.save(update_fields=['current_stock', 'last_sold_at', 'updated_at'])

                                SaleItem.objects.create(
                                    sale=sale,
                                    product=prod,
                                    quantity=qty,
                                    unit_price=unit_price,
                                    subtotal=subtotal
                                )

                                StockMovement.objects.create(
                                    shop=shop,
                                    product=prod,
                                    movement_type='sale',
                                    quantity_change=-qty,
                                    quantity_after=new_stock,
                                    reason=f"Offline Sale {sale.receipt_number}",
                                    timestamp=sale.timestamp,
                                    client_id=op_id
                                )

                        op_result = {'sale_id': str(sale.id), 'receipt': sale.receipt_number}

                    elif entity_type == 'STOCK_MOVEMENT':
                        pid = str(payload.get('productId'))
                        prod = Product.objects.select_for_update().filter(id=pid, shop=shop).first()
                        if not prod:
                            raise ValueError(f"Product {pid} not found.")

                        qty_change = Decimal(str(payload.get('quantityChange', '0')))
                        m_type = payload.get('movementType', 'purchase')
                        new_stock = prod.current_stock + qty_change
                        if new_stock < 0:
                            raise ValueError(f"Adjustment would result in negative stock: {new_stock}")

                        prod.current_stock = new_stock
                        prod.save(update_fields=['current_stock', 'updated_at'])

                        mov = StockMovement.objects.create(
                            shop=shop,
                            product=prod,
                            movement_type=m_type,
                            quantity_change=qty_change,
                            quantity_after=new_stock,
                            reason=payload.get('reason', 'Offline sync update'),
                            timestamp=payload.get('timestamp') or timezone.now(),
                            client_id=op_id
                        )
                        op_result = {'movement_id': str(mov.id), 'new_stock': str(new_stock)}

                    elif entity_type == 'PRODUCT':
                        p_name = payload.get('name', '').strip()
                        prod = Product.objects.filter(shop=shop, name=p_name).first()
                        if not prod:
                            prod = Product.objects.create(
                                id=uuid.UUID(entity_id) if len(entity_id) == 36 else uuid.uuid4(),
                                shop=shop,
                                name=p_name,
                                name_hi=payload.get('nameHi', ''),
                                category=payload.get('category', 'grocery'),
                                unit=payload.get('unit', 'packet'),
                                current_stock=Decimal(str(payload.get('currentStock', '0'))),
                                min_stock_threshold=Decimal(str(payload.get('minStockThreshold', '0'))),
                                selling_price=Decimal(str(payload.get('sellingPrice', '10'))),
                                purchase_price=Decimal(str(payload.get('purchaseCost'))) if payload.get('purchaseCost') else None
                            )
                        op_result = {'product_id': str(prod.id), 'name': prod.name}

                    else:
                        raise ValueError(f"Unknown entity_type: {entity_type}")

                    # Record successful operation for future idempotency
                    SyncOperationRecord.objects.create(
                        shop=shop,
                        operation_id=op_id,
                        entity_type=entity_type or 'UNKNOWN',
                        entity_id=entity_id,
                        status='PROCESSED',
                        response_data=op_result
                    )

                    results.append({
                        'id': op_id,
                        'status': 'PROCESSED',
                        'data': op_result
                    })

            except Exception as e:
                SyncOperationRecord.objects.create(
                    shop=shop,
                    operation_id=op_id,
                    entity_type=entity_type or 'UNKNOWN',
                    entity_id=entity_id,
                    status='FAILED',
                    response_data={'error': str(e)}
                )
                results.append({
                    'id': op_id,
                    'status': 'FAILED',
                    'error': str(e)
                })

        return Response({
            'processed': results,
            'server_time': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
