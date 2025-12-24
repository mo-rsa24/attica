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
    location = models.ForeignKey('locations.Location', on_delete=models.SET_NULL, null=True, blank=True)
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
    is_draft = models.BooleanField(default=True, help_text="If 4true, this event is a draft and not yet published.")

    # 1. Ticket Options
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default='ZAR')
    # Use JSONField to store flexible tiered pricing data
    # Example: [{"name": "VIP", "price": 500.00, "quantity": 50}, ...]
    tiered_prices = models.JSONField(null=True, blank=True)
    refund_policy = models.TextField(blank=True,
                                     help_text="Stores refund policy details, e.g., 'Full', 'None', or custom text.")
    max_tickets_per_buyer = models.PositiveIntegerField(default=10,
                                                        help_text="Limits how many tickets one person can buy.")

    # 2. Seating Options
    is_seated = models.BooleanField(default=False)
    seating_chart = models.FileField(upload_to='seating_charts/', null=True, blank=True)

    # 3. Audience & Access Controls
    is_age_restricted = models.BooleanField(default=False)
    access_type = models.CharField(max_length=10, choices=[('public', 'Public'), ('private', 'Invite-Only')],
                                   default='public')
    # Use JSONField for flexible registration questions
    # Example: [{"question": "T-Shirt Size?", "type": "dropdown", "options": ["S", "M", "L"]}, ...]
    custom_questions = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.name} by {self.user.username}'

    class Meta:
        ordering = ['-date']

class PromoCode(models.Model):
    event = models.ForeignKey(Event, related_name='promo_codes', on_delete=models.CASCADE)
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Code {self.code} for {self.event.name}"
