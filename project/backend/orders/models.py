from django.db import models

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True)
    customer_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField()

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['customer_name']),
            models.Index(fields=['amount']),
            models.Index(fields=['status']),
        ]
        ordering = ['-created_at']