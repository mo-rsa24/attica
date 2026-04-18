from django.conf import settings
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model
from locations.models import Location
from pathlib import Path
import uuid

User = get_user_model()


def event_draft_asset_upload_to(instance, filename):
    ext = Path(filename).suffix
    asset_name = f"{uuid.uuid4().hex}{ext}"
    organizer_id = instance.draft.organizer_id or "unknown"
    return f"event_draft_assets/organizer_{organizer_id}/draft_{instance.draft_id}/{instance.asset_type}/{asset_name}"


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
    is_draft = models.BooleanField(default=True, help_text="If true, this event is a draft and not yet published.")
    status = models.CharField(
        max_length=20,
        default='draft',
        choices=[('draft', 'Draft'), ('published', 'Published')],
        help_text="High level state of the listing that controls organizer actions."
    )
    published_at = models.DateTimeField(null=True, blank=True)

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

    # 4. Event features / amenities (e.g. Food Trucks, VIP Area, Bar Available)
    features = models.JSONField(null=True, blank=True, help_text="List of amenity/feature names selected in the wizard.")

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

class EventDraft(models.Model):
    """
    Organizer-managed event workflow draft.
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_drafts",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    current_step = models.CharField(max_length=100)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Draft #{self.pk} ({self.get_status_display()})"

    class Meta:
        ordering = ["-updated_at", "-created_at"]


class EventDraftAsset(models.Model):
    class AssetType(models.TextChoices):
        MEDIA = "media", "Media"
        SEATING_CHART = "seating_chart", "Seating chart"

    draft = models.ForeignKey(
        EventDraft,
        on_delete=models.CASCADE,
        related_name="assets",
    )
    asset_type = models.CharField(max_length=32, choices=AssetType.choices)
    name = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to=event_draft_asset_upload_to)
    mime_type = models.CharField(max_length=255, blank=True)
    size = models.PositiveBigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_asset_type_display()} for draft #{self.draft_id}"

    class Meta:
        ordering = ["created_at", "id"]
