import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.shops.models import Shop
from apps.inventory.models import Product

PAYMENT_MODES = (
    ('cash', 'Cash'),
    ('upi', 'UPI / Online'),
    ('credit', 'Credit / Udhaar'),
)

class Sale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='sales')
    receipt_number = models.CharField(max_length=50)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODES, default='cash')
    timestamp = models.DateTimeField(default=timezone.now)
    client_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.receipt_number}: ₹{self.total_amount} ({self.shop.name})"

class SaleItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='sale_items')
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} = ₹{self.subtotal}"
