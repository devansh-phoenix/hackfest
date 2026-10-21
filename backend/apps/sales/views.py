import uuid
from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Sale, SaleItem
from .serializers import SaleSerializer, CreateSaleInputSerializer
from apps.inventory.models import Product, StockMovement
from apps.shops.models import Shop
from apps.shops.permissions import IsShopMember

class SaleListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsShopMember]

    def get(self, request, shop_id):
        shop = get_object_or_404(Shop, id=shop_id)
        sales = Sale.objects.filter(shop=shop).prefetch_related('items__product')[:100]
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)

    def post(self, request, shop_id):
        shop = get_object_or_404(Shop, id=shop_id)
        serializer = CreateSaleInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        client_id = data.get('client_id')
        sale_uuid = data.get('id')

        # Server-side Idempotency check:
        # If client supplied a unique ID and it already exists, return existing sale
        if sale_uuid:
            existing = Sale.objects.filter(id=sale_uuid, shop=shop).first()
            if existing:
                return Response(SaleSerializer(existing).data, status=status.HTTP_200_OK)
        if client_id:
            existing = Sale.objects.filter(client_id=client_id, shop=shop).first()
            if existing:
                return Response(SaleSerializer(existing).data, status=status.HTTP_200_OK)

        items_data = data['items']

        with transaction.atomic():
            # 1. Fetch and row-lock products to prevent race conditions
            product_ids = [item['product_id'] for item in items_data]
            products = {
                p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids, shop=shop)
            }

            # 2. Validate all products exist and have sufficient stock
            for item in items_data:
                pid = item['product_id']
                if pid not in products:
                    return Response({
                        'error': f'Product not found in this shop: {pid}'
                    }, status=status.HTTP_400_BAD_REQUEST)

                prod = products[pid]
                qty = item['quantity']
                if qty > prod.current_stock:
                    return Response({
                        'error': f'Insufficient stock for {prod.name}. Available: {prod.current_stock} {prod.unit}, requested: {qty}'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # 3. Create the Sale record
            sales_count = Sale.objects.filter(shop=shop).count()
            receipt = data.get('receipt_number') or f"RCP-{1000 + sales_count + 1}"
            now = timezone.now()

            sale = Sale.objects.create(
                id=sale_uuid or uuid.uuid4(),
                shop=shop,
                receipt_number=receipt,
                total_amount=Decimal('0.00'),
                payment_mode=data.get('payment_mode', 'cash'),
                timestamp=now,
                client_id=client_id or None
            )

            total_amount = Decimal('0.00')

            # 4. Process line items, decrement stock, and record audit movements
            for item in items_data:
                prod = products[item['product_id']]
                qty = item['quantity']
                unit_price = item.get('unit_price') or prod.selling_price
                subtotal = (qty * unit_price).quantize(Decimal('0.01'))
                total_amount += subtotal

                # Decrement stock
                new_stock = prod.current_stock - qty
                prod.current_stock = new_stock
                prod.last_sold_at = now
                prod.save(update_fields=['current_stock', 'last_sold_at', 'updated_at'])

                # Create Sale Item
                SaleItem.objects.create(
                    sale=sale,
                    product=prod,
                    quantity=qty,
                    unit_price=unit_price,
                    subtotal=subtotal
                )

                # Create Stock Movement
                StockMovement.objects.create(
                    shop=shop,
                    product=prod,
                    movement_type='sale',
                    quantity_change=-qty,
                    quantity_after=new_stock,
                    reason=f"Sale {receipt}",
                    timestamp=now,
                    client_id=client_id or None
                )

            # Update final total
            sale.total_amount = total_amount
            sale.save(update_fields=['total_amount'])

            return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)
