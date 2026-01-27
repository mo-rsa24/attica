from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_MESSAGE = 'new_message', 'New Message'
        NEW_BID = 'new_bid', 'New Bid'
        BID_ACCEPTED = 'bid_accepted', 'Bid Accepted'
        BID_DECLINED = 'bid_declined', 'Bid Declined'
        BID_COUNTERED = 'bid_countered', 'Bid Countered'
        BOOKING_REQUEST = 'booking_request', 'Booking Request'
        BOOKING_CONFIRMED = 'booking_confirmed', 'Booking Confirmed'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_notifications',
        null=True,
        blank=True
    )
    notification_type = models.CharField(
        max_length=32,
        choices=NotificationType.choices
    )
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)

    # Deep link data
    link_type = models.CharField(max_length=32, blank=True)  # 'chat', 'booking', etc.
    link_id = models.PositiveIntegerField(null=True, blank=True)  # room_id, booking_id, etc.

    # Metadata
    data = models.JSONField(default=dict, blank=True)

    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', '-created_at']),
        ]

    def __str__(self):
        return f"{self.notification_type} for {self.recipient_id}"

    def mark_read(self):
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
