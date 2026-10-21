from decimal import Decimal
from rest_framework import serializers
from .models import Sale, SaleItem, PAYMENT_MODES
from apps.inventory.models import Product

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'product_unit', 'quantity', 'unit_price', 'subtotal']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = ['id', 'shop', 'receipt_number', 'total_amount', 'payment_mode', 'timestamp', 'client_id', 'items']
        read_only_fields = ['shop', 'timestamp']

class CreateSaleItemInputSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate_quantity(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

class CreateSaleInputSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    client_id = serializers.CharField(required=False, allow_blank=True, default='')
    payment_mode = serializers.ChoiceField(choices=PAYMENT_MODES, default='cash')
    receipt_number = serializers.CharField(required=False, allow_blank=True)
    items = CreateSaleItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Sale must contain at least one item.")
        return value
