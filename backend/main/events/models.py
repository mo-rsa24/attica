from django.conf import settings
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model

from locations.models import Location

User = get_user_model()


class Event(models.Model):
    user = models.ForeignKey(User, related_name='events_created', on_delete=models.CASCADE)
    partner_user = models.ForeignKey(User, related_name='events_partnered', on_delete=models.SET_NULL, null=True,
                                     blank=True)
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organized_events', blank=True, null=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    date = models.DateField()
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    start_time = models.DateTimeField(default=timezone.now) # Add default=timezone.now
    end_time = models.TimeField(null=True, blank=True)
    venue = models.CharField(max_length=255, blank=True, null=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    guest_count = models.IntegerField(null=True, blank=True)
    theme = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # New fields for richer event data
    image_url = models.URLField(max_length=255, blank=True, null=True,
                                help_text="A URL for the event's poster or main image.")
    banner_image = models.URLField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True,
                                help_text="The category of the event, e.g., 'Music', 'Food & Drink'.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.name} by {self.user.username}'

    class Meta:
        ordering = ['-date']