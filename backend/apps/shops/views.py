from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Shop, ShopMembership
from .serializers import ShopSerializer
from .permissions import IsShopMember

class ShopViewSet(viewsets.ModelViewSet):
    serializer_class = ShopSerializer
    permission_classes = [permissions.IsAuthenticated, IsShopMember]

    def get_queryset(self):
        # Multi-tenant isolation: Users only see shops they are members of
        return Shop.objects.filter(memberships__user=self.request.user)

    def perform_create(self, serializer):
        with transaction.atomic():
            shop = serializer.save()
            ShopMembership.objects.create(
                shop=shop,
                user=self.request.user,
                role='owner'
            )
