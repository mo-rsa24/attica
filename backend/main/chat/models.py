from django.db import models
from django.conf import settings
from users.models import CustomUser
from django.utils import timezone


class ChatRoom(models.Model):
    organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_rooms_organizer')
    vendor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_rooms_vendor')
    # Optional event context - allows separate chat contexts per event
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chatrooms'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            # Allow multiple rooms per pair if different events (or null event)
            models.UniqueConstraint(
                fields=['organizer', 'vendor', 'event'],
                name='unique_room_per_pair_event'
            ),
        ]

    def __str__(self) -> str:
        event_str = f" (Event: {self.event_id})" if self.event_id else ""
        return f"Room {self.pk}: {self.organizer_id} <> {self.vendor_id}{event_str}"


class ChatAttachment(models.Model):
    file = models.FileField(upload_to='chat_attachments/')
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='chat_attachments')
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='attachments')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    original_name = models.CharField(max_length=255, blank=True)
    size = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.original_name or f"Attachment {self.pk}"


class ChatBid(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        COUNTERED = 'countered', 'Countered'

    class ProviderType(models.TextChoices):
        VENDOR = 'vendor', 'Vendor'
        ARTIST = 'artist', 'Artist'
        VENUE = 'venue', 'Venue'

    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='bids')
    organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bids_made')
    vendor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bids_received')
    # Optional event context for the bid
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bids'
    )
    provider_type = models.CharField(
        max_length=20,
        choices=ProviderType.choices,
        default=ProviderType.VENDOR
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default='USD')
    tier = models.CharField(max_length=64, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    counter_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    idempotency_key = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['organizer', 'vendor', 'idempotency_key'], name='unique_bid_idempotency'),
        ]

    def __str__(self):
        return f"Bid {self.pk} {self.organizer_id}->{self.vendor_id} {self.amount} {self.currency}"

class Message(models.Model):
    class MessageType(models.TextChoices):
        TEXT = 'text', 'Text'
        SYSTEM = 'system', 'System'
        BID = 'bid', 'Bid'
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField(blank=True, null=True)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    message_type = models.CharField(max_length=16, choices=MessageType.choices, default=MessageType.TEXT)
    bid = models.ForeignKey(ChatBid, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    delivered_at = models.DateTimeField(blank=True, null=True)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    attachments = models.ManyToManyField(ChatAttachment, related_name='messages', blank=True)

    def mark_delivered(self):
        if not self.delivered_at:
            self.delivered_at = timezone.now()
            self.save(update_fields=['delivered_at'])

    def mark_read(self):
        if not self.read_at:
            self.read_at = timezone.now()
            self.save(update_fields=['read_at'])

    def __str__(self):
        return f"Message {self.pk} in room {self.room_id}"


class Booking(models.Model):
    """
    Represents a booking request from an Event Organizer to a Provider.
    Links an event with a provider through the chat/bid system.
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING = 'pending', 'Pending'
        SUCCESSFUL = 'successful', 'Successful'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'

    class ProviderType(models.TextChoices):
        VENDOR = 'vendor', 'Vendor'
        ARTIST = 'artist', 'Artist'
        VENUE = 'venue', 'Venue'

    # Core relationships
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings_created'
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings_received'
    )
    chatroom = models.ForeignKey(
        ChatRoom,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )

    # Provider identification
    provider_type = models.CharField(max_length=20, choices=ProviderType.choices)
    # ID of the actual provider entity (Vendor.id, Artist.id, or Location.id)
    provider_entity_id = models.PositiveIntegerField(null=True, blank=True)

    # Booking details
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    bid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    final_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    currency = models.CharField(max_length=8, default='ZAR')

    # Scheduling
    proposed_date = models.DateField(null=True, blank=True)
    proposed_start_time = models.TimeField(null=True, blank=True)
    proposed_end_time = models.TimeField(null=True, blank=True)

    # Metadata
    notes = models.TextField(blank=True)
    accepted_bid = models.OneToOneField(
        ChatBid,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booking'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['event', 'provider', 'provider_type'],
                name='unique_booking_per_event_provider'
            ),
        ]
        indexes = [
            models.Index(fields=['organizer', 'status']),
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['event', 'status']),
        ]

    def __str__(self):
        return f"Booking {self.pk}: {self.event_id} - {self.provider_type} ({self.status})"


class ProviderAvailability(models.Model):
    """
    Tracks blocked dates for providers from accepted bookings.
    When a booking is accepted (SUCCESSFUL), the provider's calendar
    is blocked for that date to prevent double-booking.
    """
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocked_dates'
    )
    date = models.DateField()
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='blocked_slots'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['provider', 'date'],
                name='unique_provider_date'
            ),
        ]
        indexes = [
            models.Index(fields=['provider', 'date']),
        ]

    def __str__(self):
        return f"Blocked: {self.provider_id} on {self.date}"