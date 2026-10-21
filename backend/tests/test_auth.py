import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from apps.shops.models import Shop, ShopMembership

@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()

    def test_register_creates_user_and_token(self):
        data = {
            'username': 'ramesh_kirana',
            'password': 'StrongPassword123',
            'email': 'ramesh@kirana.com',
            'first_name': 'Ramesh'
        }
        response = self.client.post('/api/v1/auth/register/', data, format='json')
        assert response.status_code == 201
        assert 'token' in response.data
        assert response.data['user']['username'] == 'ramesh_kirana'

        user = User.objects.get(username='ramesh_kirana')
        assert user.check_password('StrongPassword123')
        assert Token.objects.filter(user=user, key=response.data['token']).exists()

    def test_register_rejects_duplicate_username(self):
        User.objects.create_user(username='existing_user', password='Password123')
        data = {
            'username': 'existing_user',
            'password': 'StrongPassword123'
        }
        response = self.client.post('/api/v1/auth/register/', data, format='json')
        assert response.status_code == 400
        assert 'username' in response.data

    def test_login_returns_token_and_accessible_shops(self):
        user = User.objects.create_user(username='suresh', password='Password123')
        shop = Shop.objects.create(name='Suresh General Store')
        ShopMembership.objects.create(shop=shop, user=user, role='owner')

        response = self.client.post('/api/v1/auth/login/', {
            'username': 'suresh',
            'password': 'Password123'
        }, format='json')

        assert response.status_code == 200
        assert 'token' in response.data
        assert len(response.data['shops']) == 1
        assert response.data['shops'][0]['name'] == 'Suresh General Store'

    def test_login_fails_with_invalid_credentials(self):
        User.objects.create_user(username='valid_user', password='CorrectPassword')
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'valid_user',
            'password': 'WrongPassword'
        }, format='json')
        assert response.status_code == 400

    def test_logout_invalidates_token(self):
        user = User.objects.create_user(username='logout_user', password='Password123')
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        response = self.client.post('/api/v1/auth/logout/')
        assert response.status_code == 200
        assert not Token.objects.filter(user=user).exists()
