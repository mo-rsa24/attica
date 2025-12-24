from django.db import models
from django.conf import settings
from common.models import TimeStampedModel

class Ticket(TimeStampedModel):
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='tickets')
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    quantity = models.PositiveIntegerField(default=1)
    payment_status = models.CharField(max_length=20, choices=[('reserved','Reserved'),('paid','Paid')], default='reserved')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event.name} x{self.quantity}"