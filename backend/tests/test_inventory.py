import pytest
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from apps.shops.models import Shop, ShopMembership
from apps.inventory.models import Product, StockMovement

@pytest.mark.django_db
class TestInventoryAndProducts:
    def setup_method(self):
        self.client = APIClient()

        # Create shop and owner
        self.user = User.objects.create_user(username='kirana_owner', password='Password123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.shop = Shop.objects.create(name='Aashirvaad Store')
        ShopMembership.objects.create(shop=self.shop, user=self.user, role='owner')

    def test_create_product_with_valid_units(self):
        """Verify all supported units (piece, packet, bottle, box, kg, g, l, ml) are accepted."""
        valid_units = ['piece', 'packet', 'bottle', 'box', 'kg', 'g', 'l', 'ml']
        for idx, unit in enumerate(valid_units):
            data = {
                'name': f'Test Item {idx} ({unit})',
                'name_hi': f'टेस्ट आइटम {idx}',
                'category': 'grocery',
                'unit': unit,
                'current_stock': '10.500',
                'min_stock_threshold': '2.000',
                'selling_price': '99.50',
                'purchase_price': '80.00'
            }
            res = self.client.post(f'/api/v1/shops/{self.shop.id}/products/', data, format='json')
            assert res.status_code == 201, f"Failed for unit {unit}: {res.data}"
            assert res.data['unit'] == unit
            assert Decimal(res.data['current_stock']) == Decimal('10.500')

    def test_create_product_rejects_invalid_unit(self):
        """Reject invalid unit choices."""
        data = {
            'name': 'Invalid Unit Product',
            'unit': 'carton_box',
            'selling_price': '50.00'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/products/', data, format='json')
        assert res.status_code == 400
        assert 'unit' in res.data

    def test_create_product_rejects_negative_stock(self):
        """Negative stock values must be rejected."""
        data = {
            'name': 'Negative Stock Product',
            'unit': 'packet',
            'current_stock': '-5.000',
            'selling_price': '20.00'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/products/', data, format='json')
        assert res.status_code == 400
        assert 'current_stock' in res.data

    def test_create_product_rejects_zero_or_negative_price(self):
        """Selling price must be strictly positive."""
        data = {
            'name': 'Free Product',
            'unit': 'packet',
            'selling_price': '0.00'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/products/', data, format='json')
        assert res.status_code == 400
        assert 'selling_price' in res.data

    def test_duplicate_product_name_rejected_within_same_shop(self):
        """Unique constraint on (shop, name) prevents duplicates in same shop."""
        Product.objects.create(
            shop=self.shop,
            name='Parle-G Biscuit 100g',
            unit='packet',
            selling_price=10
        )

        data = {
            'name': 'Parle-G Biscuit 100g',
            'unit': 'packet',
            'selling_price': 10
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/products/', data, format='json')
        assert res.status_code == 400

    def test_identical_product_name_allowed_in_different_shop(self):
        """A different shop can have a product with the same name."""
        other_shop = Shop.objects.create(name='Other Store')
        ShopMembership.objects.create(shop=other_shop, user=self.user, role='owner')

        Product.objects.create(
            shop=self.shop,
            name='Parle-G Biscuit 100g',
            unit='packet',
            selling_price=10
        )

        data = {
            'name': 'Parle-G Biscuit 100g',
            'unit': 'packet',
            'selling_price': 10
        }
        res = self.client.post(f'/api/v1/shops/{other_shop.id}/products/', data, format='json')
        assert res.status_code == 201

    def test_opening_stock_creates_movement(self):
        """Creating a product with initial current_stock > 0 automatically creates an opening stock movement."""
        data = {
            'name': 'Atta 10kg',
            'unit': 'packet',
            'current_stock': '5.000',
            'selling_price': '420.00'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/products/', data, format='json')
        assert res.status_code == 201

        product_id = res.data['id']
        mov = StockMovement.objects.filter(product_id=product_id, movement_type='purchase').first()
        assert mov is not None
        assert mov.quantity_change == Decimal('5.000')
        assert mov.quantity_after == Decimal('5.000')

    def test_add_stock_endpoint(self):
        """Adding stock increments current_stock and writes an audit StockMovement."""
        product = Product.objects.create(
            shop=self.shop,
            name='Maggi Noodles 70g',
            unit='packet',
            current_stock=Decimal('10.000'),
            selling_price=14
        )

        payload = {
            'product_id': str(product.id),
            'quantity': '24.000',
            'note': 'Supplier shipment #402',
            'client_id': 'op-add-stock-001'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/inventory/add-stock/', payload, format='json')
        assert res.status_code == 200
        assert Decimal(res.data['new_stock']) == Decimal('34.000')

        # Check DB
        product.refresh_from_db()
        assert product.current_stock == Decimal('34.000')

        mov = StockMovement.objects.get(id=res.data['movement']['id'])
        assert mov.movement_type == 'purchase'
        assert mov.quantity_change == Decimal('24.000')
        assert mov.quantity_after == Decimal('34.000')
        assert mov.client_id == 'op-add-stock-001'

    def test_add_stock_rejects_negative_or_zero_quantity(self):
        """Reject non-positive quantities in add-stock."""
        product = Product.objects.create(
            shop=self.shop,
            name='Sugar 1kg',
            unit='kg',
            current_stock=Decimal('5.000'),
            selling_price=44
        )
        for invalid_qty in ['0', '-5']:
            res = self.client.post(f'/api/v1/shops/{self.shop.id}/inventory/add-stock/', {
                'product_id': str(product.id),
                'quantity': invalid_qty
            }, format='json')
            assert res.status_code == 400

    def test_stock_correction_endpoint(self):
        """Stock correction sets exact physical count and logs adjustment delta."""
        product = Product.objects.create(
            shop=self.shop,
            name='Basmati Rice 1kg',
            unit='kg',
            current_stock=Decimal('20.000'),
            selling_price=110
        )

        # Correct down (e.g. spoilage / missing count)
        payload = {
            'product_id': str(product.id),
            'new_quantity': '17.000',
            'reason': 'Damaged bags removed'
        }
        res = self.client.post(f'/api/v1/shops/{self.shop.id}/inventory/correct-stock/', payload, format='json')
        assert res.status_code == 200
        assert Decimal(res.data['new_stock']) == Decimal('17.000')
        assert Decimal(res.data['delta']) == Decimal('-3.000')

        product.refresh_from_db()
        assert product.current_stock == Decimal('17.000')

        mov = StockMovement.objects.get(id=res.data['movement']['id'])
        assert mov.movement_type == 'adjustment'
        assert mov.quantity_change == Decimal('-3.000')
        assert mov.quantity_after == Decimal('17.000')

    def test_stock_movements_history_endpoint(self):
        """Stock movement list endpoint returns movements for this shop."""
        product = Product.objects.create(
            shop=self.shop,
            name='Milk 500ml',
            unit='packet',
            current_stock=Decimal('5.000'),
            selling_price=30
        )
        StockMovement.objects.create(
            shop=self.shop,
            product=product,
            movement_type='purchase',
            quantity_change=Decimal('5.000'),
            quantity_after=Decimal('5.000'),
            reason='Initial'
        )

        res = self.client.get(f'/api/v1/shops/{self.shop.id}/inventory/movements/')
        assert res.status_code == 200
        assert len(res.data) >= 1
        assert res.data[0]['product_name'] == 'Milk 500ml'
