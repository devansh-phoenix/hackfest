import pytest
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from apps.shops.models import Shop, ShopMembership
from apps.inventory.models import Product, StockMovement
from apps.sales.models import Sale, SaleItem

@pytest.mark.django_db
class TestSalesAndTransactionSafety:
    def setup_method(self):
        self.client = APIClient()

        self.user = User.objects.create_user(username='sale_user', password='Password123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.shop = Shop.objects.create(name='Gupta Provision Store')
        ShopMembership.objects.create(shop=self.shop, user=self.user, role='owner')

        # Create products
        self.rice = Product.objects.create(
            shop=self.shop,
            name='Rice (Kolam)',
            unit='kg',
            current_stock=Decimal('50.000'),
            selling_price=Decimal('60.00')
        )
        self.dal = Product.objects.create(
            shop=self.shop,
            name='Toor Dal 1kg',
            unit='packet',
            current_stock=Decimal('10.000'),
            selling_price=Decimal('145.00')
        )
        self.biscuit = Product.objects.create(
            shop=self.shop,
            name='Good Day 100g',
            unit='packet',
            current_stock=Decimal('2.000'),
            selling_price=Decimal('20.00')
        )

    def test_single_item_sale_success(self):
        """Sale decrements stock and writes audit movement."""
        payload = {
            'items': [
                {'product_id': str(self.dal.id), 'quantity': '2.000'}
            ],
            'payment_mode': 'cash'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sales/', payload, format='json')
        assert res.status_code == 201
        assert Decimal(res.data['total_amount']) == Decimal('290.00')
        assert len(res.data['items']) == 1

        # Check stock decremented
        self.dal.refresh_from_db()
        assert self.dal.current_stock == Decimal('8.000')

        # Check movement created
        mov = StockMovement.objects.filter(product=self.dal, movement_type='sale').first()
        assert mov is not None
        assert mov.quantity_change == Decimal('-2.000')
        assert mov.quantity_after == Decimal('8.000')

    def test_decimal_quantity_sale(self):
        """Kirana stores sell loose items by weight (e.g. 0.750 kg)."""
        payload = {
            'items': [
                {'product_id': str(self.rice.id), 'quantity': '0.750'}
            ],
            'payment_mode': 'upi'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sales/', payload, format='json')
        assert res.status_code == 201
        # 0.750 * 60.00 = 45.00
        assert Decimal(res.data['total_amount']) == Decimal('45.00')

        self.rice.refresh_from_db()
        assert self.rice.current_stock == Decimal('49.250')

    def test_multi_item_sale_success(self):
        """Multi-item cart computes total, decrements each product, and records items."""
        payload = {
            'items': [
                {'product_id': str(self.rice.id), 'quantity': '2.000'},      # 2 * 60 = 120
                {'product_id': str(self.dal.id), 'quantity': '1.000'},       # 1 * 145 = 145
                {'product_id': str(self.biscuit.id), 'quantity': '1.000'}    # 1 * 20 = 20
            ],
            'payment_mode': 'cash'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sales/', payload, format='json')
        assert res.status_code == 201
        # 120 + 145 + 20 = 285.00
        assert Decimal(res.data['total_amount']) == Decimal('285.00')

        self.rice.refresh_from_db()
        self.dal.refresh_from_db()
        self.biscuit.refresh_from_db()

        assert self.rice.current_stock == Decimal('48.000')
        assert self.dal.current_stock == Decimal('9.000')
        assert self.biscuit.current_stock == Decimal('1.000')

    def test_transaction_rollback_on_insufficient_stock(self):
        """
        ATOMIC SAFETY TEST:
        If one item in a multi-item sale has insufficient stock, the entire transaction
        MUST rollback. None of the products should have their stock decremented,
        and no Sale or SaleItem records should be created.
        """
        initial_rice_stock = self.rice.current_stock  # 50
        initial_biscuit_stock = self.biscuit.current_stock  # 2

        # Biscuit only has 2 in stock, but we request 5!
        payload = {
            'items': [
                {'product_id': str(self.rice.id), 'quantity': '10.000'},
                {'product_id': str(self.biscuit.id), 'quantity': '5.000'}
            ],
            'payment_mode': 'cash'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sales/', payload, format='json')
        assert res.status_code == 400
        assert 'Insufficient stock' in res.data['error']

        # Verify database state was completely preserved (no partial stock deduction!)
        self.rice.refresh_from_db()
        self.biscuit.refresh_from_db()
        assert self.rice.current_stock == initial_rice_stock
        assert self.biscuit.current_stock == initial_biscuit_stock

        # Ensure no sale or sale items were persisted
        assert Sale.objects.filter(shop=self.shop).count() == 0
        assert SaleItem.objects.count() == 0
        assert StockMovement.objects.filter(shop=self.shop, movement_type='sale').count() == 0

    def test_sale_with_empty_items_rejected(self):
        """Sale must contain at least one item."""
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sales/', {'items': []}, format='json')
        assert res.status_code == 400

    def test_sale_with_negative_quantity_rejected(self):
        """Sale items must have quantity > 0."""
        payload = {
            'items': [{'product_id': str(self.rice.id), 'quantity': '-2.000'}]
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/sales/', payload, format='json')
        assert res.status_code == 400
