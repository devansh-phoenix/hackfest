from decimal import Decimal
from rest_framework import serializers
from .models import Product, StockMovement, UNIT_CHOICES, PRODUCT_CATEGORIES

class ProductSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'shop', 'name', 'name_hi', 'category', 'unit',
            'current_stock', 'min_stock_threshold', 'purchase_price',
            'selling_price', 'is_active', 'last_sold_at', 'created_at',
            'updated_at', 'server_version'
        ]
        read_only_fields = ['shop', 'created_at', 'updated_at', 'server_version']

    def validate_current_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Current stock cannot be negative.")
        return value

    def validate_min_stock_threshold(self, value):
        if value < 0:
            raise serializers.ValidationError("Minimum stock threshold cannot be negative.")
        return value

    def validate_selling_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Selling price must be greater than zero.")
        return value

    def validate_unit(self, value):
        valid_units = [u[0] for u in UNIT_CHOICES]
        if value not in valid_units:
            raise serializers.ValidationError(f"Invalid unit '{value}'. Valid choices: {valid_units}")
        return value

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'shop', 'product', 'product_name', 'product_unit',
            'movement_type', 'quantity_change', 'quantity_after',
            'reason', 'timestamp', 'client_id'
        ]
        read_only_fields = ['shop', 'timestamp']

class AddStockSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    note = serializers.CharField(required=False, allow_blank=True, default='')
    client_id = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_quantity(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("Quantity to add must be greater than zero.")
        return value

class StockCorrectionSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    new_quantity = serializers.DecimalField(max_digits=12, decimal_places=3)
    reason = serializers.CharField(max_length=255)
    client_id = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_new_quantity(self, value):
        if value < Decimal('0'):
            raise serializers.ValidationError("Physical stock quantity cannot be negative.")
        return value
