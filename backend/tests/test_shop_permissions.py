import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from apps.shops.models import Shop, ShopMembership
from apps.inventory.models import Product

@pytest.mark.django_db
class TestShopAuthorizationAndIsolation:
    def setup_method(self):
        self.client = APIClient()

        # Create two distinct shop owners
        self.owner1 = User.objects.create_user(username='ramesh', password='Password123')
        self.token1 = Token.objects.create(user=self.owner1)

        self.owner2 = User.objects.create_user(username='suresh', password='Password123')
        self.token2 = Token.objects.create(user=self.owner2)

        # Create two distinct shops
        self.shop1 = Shop.objects.create(name='Ramesh Kirana Store', phone='9876543210')
        ShopMembership.objects.create(shop=self.shop1, user=self.owner1, role='owner')

        self.shop2 = Shop.objects.create(name='Suresh General Store', phone='9876500000')
        ShopMembership.objects.create(shop=self.shop2, user=self.owner2, role='owner')

        # Product in shop 1
        self.product1 = Product.objects.create(
            shop=self.shop1,
            name='Fortune Oil 1L',
            category='grocery',
            unit='bottle',
            current_stock=10,
            selling_price=160
        )

        # Product in shop 2
        self.product2 = Product.objects.create(
            shop=self.shop2,
            name='Tata Salt 1kg',
            category='grocery',
            unit='packet',
            current_stock=25,
            selling_price=28
        )

    def test_unauthenticated_requests_rejected(self):
        """Unauthenticated requests must be rejected with 401 Unauthorized."""
        response = self.client.get(f'/api/v1/shops/{self.shop1.id}/products/')
        assert response.status_code == 401

    def test_shop_isolation_in_shop_list(self):
        """Owner 1 should only see Shop 1 in /api/v1/shops/, not Shop 2."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get('/api/v1/shops/')
        assert response.status_code == 200
        shops = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        shop_ids = [s['id'] for s in shops]
        assert str(self.shop1.id) in shop_ids
        assert str(self.shop2.id) not in shop_ids

    def test_cross_shop_access_forbidden_for_products(self):
        """Owner 1 must receive 403 Forbidden when trying to view or modify Shop 2 products."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')

        # Attempt to list Shop 2's products
        response = self.client.get(f'/api/v1/shops/{self.shop2.id}/products/')
        assert response.status_code == 403

        # Attempt to create a product in Shop 2
        create_payload = {
            'name': 'Hacked Product',
            'unit': 'piece',
            'selling_price': 50,
            'current_stock': 5
        }
        post_response = self.client.post(
            f'/api/v1/shops/{self.shop2.id}/products/',
            create_payload,
            format='json'
        )
        assert post_response.status_code == 403

    def test_cross_shop_access_forbidden_for_sales(self):
        """Owner 1 must receive 403 Forbidden when trying to access or create sales in Shop 2."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')

        # List sales of Shop 2
        response = self.client.get(f'/api/v1/shops/{self.shop2.id}/sales/')
        assert response.status_code == 403

        # Create sale in Shop 2
        sale_data = {
            'items': [{'product_id': str(self.product2.id), 'quantity': 1}]
        }
        create_response = self.client.post(
            f'/api/v1/shops/{self.shop2.id}/sales/',
            sale_data,
            format='json'
        )
        assert create_response.status_code == 403

    def test_cross_shop_access_forbidden_for_inventory_and_sync(self):
        """Owner 1 must receive 403 Forbidden for inventory changes and batch sync in Shop 2."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')

        # Add stock in Shop 2
        res = self.client.post(f'/api/v1/shops/{self.shop2.id}/inventory/add-stock/', {
            'product_id': str(self.product2.id),
            'quantity': 5
        }, format='json')
        assert res.status_code == 403

        # Stock movements in Shop 2
        res = self.client.get(f'/api/v1/shops/{self.shop2.id}/inventory/movements/')
        assert res.status_code == 403

        # Batch sync in Shop 2
        res = self.client.post(f'/api/v1/shops/{self.shop2.id}/sync/batch/', {
            'operations': []
        }, format='json')
        assert res.status_code == 403

    def test_authorized_owner_has_full_access_to_own_shop(self):
        """Owner 1 has full access to products in their own shop."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get(f'/api/v1/shops/{self.shop1.id}/products/')
        assert response.status_code == 200
        products = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        assert len(products) == 1
        assert products[0]['name'] == 'Fortune Oil 1L'
