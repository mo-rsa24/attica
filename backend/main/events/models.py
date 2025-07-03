from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Event(models.Model):
    user = models.ForeignKey(User, related_name='events_created', on_delete=models.CASCADE)
    partner_user = models.ForeignKey(User, related_name='events_partnered', on_delete=models.SET_NULL, null=True,
                                     blank=True)
    name = models.CharField(max_length=255)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255)
    venue = models.CharField(max_length=255, blank=True, null=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    guest_count = models.IntegerField(null=True, blank=True)
    theme = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # New fields for richer event data
    image_url = models.URLField(max_length=255, blank=True, null=True,
                                help_text="A URL for the event's poster or main image.")
    category = models.CharField(max_length=100, blank=True, null=True,
                                help_text="The category of the event, e.g., 'Music', 'Food & Drink'.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.name} by {self.user.username}'

    class Meta:
        ordering = ['-date']