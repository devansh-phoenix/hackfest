import uuid
from django.db import models
from apps.shops.models import Shop

class SyncOperationRecord(models.Model):
    STATUS_CHOICES = (
        ('PROCESSED', 'Processed'),
        ('FAILED', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='sync_records')
    operation_id = models.CharField(max_length=100, db_index=True)
    entity_type = models.CharField(max_length=50)
    entity_id = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROCESSED')
    response_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('shop', 'operation_id')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.shop.name} | {self.entity_type} {self.operation_id} ({self.status})"
