import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.shops.models import Shop

UNIT_CHOICES = (
    ('piece', 'Piece'),
    ('packet', 'Packet'),
    ('bottle', 'Bottle'),
    ('box', 'Box'),
    ('kg', 'Kilogram'),
    ('g', 'Gram'),
    ('l', 'Litre'),
    ('ml', 'Millilitre'),
)

PRODUCT_CATEGORIES = (
    ('grocery', 'Grocery & Staples'),
    ('snacks', 'Snacks & Biscuits'),
    ('dairy', 'Dairy & Bakery'),
    ('beverages', 'Tea & Beverages'),
    ('personal_care', 'Personal Care'),
    ('household', 'Household & Cleaning'),
)

MOVEMENT_TYPES = (
    ('purchase', 'Purchase / Stock In'),
    ('sale', 'Sale / Stock Out'),
    ('adjustment', 'Stock Correction'),
    ('return', 'Customer Return'),
)

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    name_hi = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=PRODUCT_CATEGORIES, default='grocery')
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    current_stock = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    min_stock_threshold = models.DecimalField(max_digits=12, decimal_places=3, default=Decimal('0.000'))
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    last_sold_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    server_version = models.IntegerField(default=1)

    class Meta:
        unique_together = ('shop', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.unit}) - {self.shop.name}"

class StockMovement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='stock_movements')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity_change = models.DecimalField(max_digits=12, decimal_places=3)
    quantity_after = models.DecimalField(max_digits=12, decimal_places=3)
    reason = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    client_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.product.name}: {self.quantity_change} ({self.movement_type})"
