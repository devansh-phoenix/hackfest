import uuid
import pytest
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from apps.shops.models import Shop, ShopMembership
from apps.inventory.models import Product, StockMovement
from apps.sales.models import Sale, SaleItem
from apps.sync.models import SyncOperationRecord

@pytest.mark.django_db
class TestIdempotencyAndSync:
    def setup_method(self):
        self.client = APIClient()

        self.user = User.objects.create_user(username='sync_owner', password='Password123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.shop = Shop.objects.create(name='Pooja General Store')
        ShopMembership.objects.create(shop=self.shop, user=self.user, role='owner')

        self.product = Product.objects.create(
            shop=self.shop,
            name='Detergent Powder 1kg',
            unit='packet',
            current_stock=Decimal('20.000'),
            selling_price=Decimal('120.00')
        )

    def test_direct_sale_idempotency_protection(self):
        """
        When the client retries a sale request with the same client_id or id,
        the server MUST return the existing sale and NOT double-decrement inventory.
        """
        client_op_id = str(uuid.uuid4())
        payload = {
            'client_id': client_op_id,
            'items': [
                {'product_id': str(self.product.id), 'quantity': '2.000'}
            ],
            'payment_mode': 'cash'
        }

        # First request: Creates sale, stock 20 -> 18
        res1 = self.client.post(f'/api/v1/shops/{self.shop.id}/sales/', payload, format='json')
        assert res1.status_code == 201
        sale_id = res1.data['id']

        self.product.refresh_from_db()
        assert self.product.current_stock == Decimal('18.000')
        assert Sale.objects.filter(shop=self.shop).count() == 1
        assert StockMovement.objects.filter(shop=self.shop, movement_type='sale').count() == 1

        # Second request (Network retry with same client_id):
        res2 = self.client.post(f'/api/v1/shops/{self.shop.id}/sales/', payload, format='json')
        assert res2.status_code == 200
        assert res2.data['id'] == sale_id

        # CRITICAL IDEMPOTENCY CHECK: stock is still 18.000, NOT 16.000!
        self.product.refresh_from_db()
        assert self.product.current_stock == Decimal('18.000')
        assert Sale.objects.filter(shop=self.shop).count() == 1
        assert StockMovement.objects.filter(shop=self.shop, movement_type='sale').count() == 1

    def test_batch_sync_offline_sale_and_idempotency(self):
        """
        Batch sync processes offline sales and protects against duplicate executions
        using SyncOperationRecord.
        """
        op_id = f"sync-sale-{uuid.uuid4()}"
        offline_sale_id = str(uuid.uuid4())

        batch_payload = {
            'operations': [
                {
                    'id': op_id,
                    'entity_type': 'SALE',
                    'entity_id': offline_sale_id,
                    'payload': {
                        'receiptNumber': 'RCP-OFFLINE-001',
                        'paymentMode': 'cash',
                        'totalAmount': '360.00',
                        'items': [
                            {
                                'productId': str(self.product.id),
                                'quantity': '3.000',
                                'unitPrice': '120.00'
                            }
                        ]
                    }
                }
            ]
        }

        # 1. Process batch for the first time
        res1 = self.client.post(f'/api/v1/shops/{self.shop.id}/sync/batch/', batch_payload, format='json')
        assert res1.status_code == 200
        assert res1.data['processed'][0]['status'] == 'PROCESSED'
        assert not res1.data['processed'][0].get('idempotent')

        # Stock should decrease from 20 to 17
        self.product.refresh_from_db()
        assert self.product.current_stock == Decimal('17.000')

        # Check sync record created
        record = SyncOperationRecord.objects.get(shop=self.shop, operation_id=op_id)
        assert record.status == 'PROCESSED'

        # 2. Resend the exact same batch operation (simulating duplicate sync push)
        res2 = self.client.post(f'/api/v1/shops/{self.shop.id}/sync/batch/', batch_payload, format='json')
        assert res2.status_code == 200
        assert res2.data['processed'][0]['status'] == 'PROCESSED'
        assert res2.data['processed'][0]['idempotent'] is True

        # Stock MUST REMAIN 17.000 (no duplicate deduction!)
        self.product.refresh_from_db()
        assert self.product.current_stock == Decimal('17.000')

        # Only 1 sale created in total
        assert Sale.objects.filter(shop=self.shop).count() == 1

    def test_batch_sync_stock_movement_operation(self):
        """Offline stock movement operation applies inventory adjustment."""
        op_id = f"sync-mov-{uuid.uuid4()}"
        batch_payload = {
            'operations': [
                {
                    'id': op_id,
                    'entity_type': 'STOCK_MOVEMENT',
                    'entity_id': str(uuid.uuid4()),
                    'payload': {
                        'productId': str(self.product.id),
                        'quantityChange': '15.000',
                        'movementType': 'purchase',
                        'reason': 'Direct wholesale delivery'
                    }
                }
            ]
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sync/batch/', batch_payload, format='json')
        assert res.status_code == 200
        assert res.data['processed'][0]['status'] == 'PROCESSED'

        self.product.refresh_from_db()
        assert self.product.current_stock == Decimal('35.000')

    def test_batch_sync_product_creation_operation(self):
        """Offline product creation creates new product in shop."""
        op_id = f"sync-prod-{uuid.uuid4()}"
        prod_uuid = str(uuid.uuid4())
        batch_payload = {
            'operations': [
                {
                    'id': op_id,
                    'entity_type': 'PRODUCT',
                    'entity_id': prod_uuid,
                    'payload': {
                        'name': 'Haldi Powder 200g',
                        'nameHi': 'हल्दी पाउडर 200 ग्राम',
                        'category': 'grocery',
                        'unit': 'packet',
                        'currentStock': '15.000',
                        'minStockThreshold': '3.000',
                        'sellingPrice': '55.00'
                    }
                }
            ]
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sync/batch/', batch_payload, format='json')
        assert res.status_code == 200
        assert res.data['processed'][0]['status'] == 'PROCESSED'

        new_prod = Product.objects.get(shop=self.shop, name='Haldi Powder 200g')
        assert new_prod.current_stock == Decimal('15.000')
        assert new_prod.selling_price == Decimal('55.00')

    def test_batch_sync_handles_failure_gracefully(self):
        """When an offline operation is invalid (e.g. stock shortfall), status is recorded as FAILED."""
        op_id = f"sync-fail-{uuid.uuid4()}"
        batch_payload = {
            'operations': [
                {
                    'id': op_id,
                    'entity_type': 'SALE',
                    'entity_id': str(uuid.uuid4()),
                    'payload': {
                        'items': [
                            {
                                'productId': str(self.product.id),
                                'quantity': '999.000'  # Far exceeds stock of 20
                            }
                        ]
                    }
                }
            ]
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sync/batch/', batch_payload, format='json')
        assert res.status_code == 200
        assert res.data['processed'][0]['status'] == 'FAILED'
        assert 'Insufficient stock' in res.data['processed'][0]['error']

        # Ensure stock was not altered
        self.product.refresh_from_db()
        assert self.product.current_stock == Decimal('20.000')
