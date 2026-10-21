from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product, StockMovement
from .serializers import (
    ProductSerializer,
    StockMovementSerializer,
    AddStockSerializer,
    StockCorrectionSerializer
)
from apps.shops.models import Shop
from apps.shops.permissions import IsShopMember

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsShopMember]

    def get_queryset(self):
        shop_id = self.kwargs['shop_id']
        return Product.objects.filter(shop_id=shop_id, is_active=True)

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        shop = get_object_or_404(Shop, id=self.kwargs['shop_id'])
        name = serializer.validated_data.get('name')
        if Product.objects.filter(shop=shop, name=name).exists():
            raise ValidationError({'name': 'A product with this name already exists in this shop.'})

        with transaction.atomic():
            product = serializer.save(shop=shop)
            # If product created with opening stock, record movement
            if product.current_stock > 0:
                StockMovement.objects.create(
                    shop=shop,
                    product=product,
                    movement_type='purchase',
                    quantity_change=product.current_stock,
                    quantity_after=product.current_stock,
                    reason='Opening inventory (शुरुआती स्टॉक)'
                )

    def perform_update(self, serializer):
        from rest_framework.exceptions import ValidationError
        shop = get_object_or_404(Shop, id=self.kwargs['shop_id'])
        name = serializer.validated_data.get('name')
        instance = self.get_object()
        if name and Product.objects.filter(shop=shop, name=name).exclude(id=instance.id).exists():
            raise ValidationError({'name': 'A product with this name already exists in this shop.'})
        serializer.save()

class AddStockView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsShopMember]

    def post(self, request, shop_id):
        shop = get_object_or_404(Shop, id=shop_id)
        serializer = AddStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        note = serializer.validated_data.get('note', '')
        client_id = serializer.validated_data.get('client_id', '')

        with transaction.atomic():
            product = Product.objects.select_for_update().filter(id=product_id, shop=shop).first()
            if not product:
                return Response({'error': 'Product not found in this shop.'}, status=status.HTTP_404_NOT_FOUND)

            new_stock = product.current_stock + quantity
            product.current_stock = new_stock
            product.save(update_fields=['current_stock', 'updated_at'])

            movement = StockMovement.objects.create(
                shop=shop,
                product=product,
                movement_type='purchase',
                quantity_change=quantity,
                quantity_after=new_stock,
                reason=note or 'Stock received from supplier',
                client_id=client_id or None
            )

            return Response({
                'message': 'Stock added successfully.',
                'product_id': str(product.id),
                'new_stock': str(product.current_stock),
                'movement': StockMovementSerializer(movement).data
            }, status=status.HTTP_200_OK)

class StockCorrectionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsShopMember]

    def post(self, request, shop_id):
        shop = get_object_or_404(Shop, id=shop_id)
        serializer = StockCorrectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product_id']
        new_quantity = serializer.validated_data['new_quantity']
        reason = serializer.validated_data['reason']
        client_id = serializer.validated_data.get('client_id', '')

        with transaction.atomic():
            product = Product.objects.select_for_update().filter(id=product_id, shop=shop).first()
            if not product:
                return Response({'error': 'Product not found in this shop.'}, status=status.HTTP_404_NOT_FOUND)

            delta = new_quantity - product.current_stock
            product.current_stock = new_quantity
            product.save(update_fields=['current_stock', 'updated_at'])

            movement = StockMovement.objects.create(
                shop=shop,
                product=product,
                movement_type='adjustment',
                quantity_change=delta,
                quantity_after=new_quantity,
                reason=reason,
                client_id=client_id or None
            )

            return Response({
                'message': 'Stock corrected successfully.',
                'product_id': str(product.id),
                'new_stock': str(product.current_stock),
                'delta': str(delta),
                'movement': StockMovementSerializer(movement).data
            }, status=status.HTTP_200_OK)

class StockMovementListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsShopMember]

    def get(self, request, shop_id):
        shop = get_object_or_404(Shop, id=shop_id)
        movements = StockMovement.objects.filter(shop=shop).select_related('product')[:100]
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)
