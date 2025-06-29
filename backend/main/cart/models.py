from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

from events.models import Event
from vendors.models import VendorPost


class CartItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart_items')
    post = models.ForeignKey(VendorPost, on_delete=models.CASCADE, related_name='cart_items', null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post', 'event')

    def __str__(self):
        return f"Post: {self.post.caption} (Vendor: {self.post.vendor.name})"
