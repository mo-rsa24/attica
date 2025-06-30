from datetime import datetime

from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.db.models import Model

class Event(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_events") # organizer
    partner_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="partnered_events",null=True,blank=True)
    name = models.CharField(max_length=100)  # Name of the event
    date = models.DateField()  # Date of the event
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=100)  # Location of the event
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)  # Event budget
    guest_count = models.IntegerField(default=0)  # Number of guests
    theme = models.CharField(max_length=50, choices=[
        ('Traditional', 'Traditional'),
        ('Modern', 'Modern'),
        ('Bohemian', 'Bohemian'),
        ('Classic', 'Classic'),
        ('Rustic', 'Rustic'),
    ],default='Traditional' )  # Theme of the event
    notes = models.TextField(blank=True, null=True)  # Additional notes about the event
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(default=datetime.now, blank=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"

