"""
Chat signals — sync accepted bid amounts to the corresponding scheduling BookingRequest.

When a ChatBid is accepted (status → ACCEPTED), find the matching BookingRequest in the
scheduling module (same organizer + provider + event) and update its estimated_total_amount
to the accepted bid amount. This makes the scheduling system the single source of truth for
the final agreed price.
"""
import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


def _sync_bid_to_booking_request(bid):
    """
    Attempt to find a scheduling BookingRequest that corresponds to the accepted bid
    and update its estimated_total_amount.

    Match criteria:
      - organizer matches bid.organizer
      - resource.owner matches bid.vendor
      - event matches bid.event (if the bid has event context)
      - status is not terminal (not WITHDRAWN, DECLINED, EXPIRED)
    """
    try:
        from scheduling.models import BookingRequest

        terminal_statuses = {
            BookingRequest.Status.WITHDRAWN,
            BookingRequest.Status.DECLINED,
            BookingRequest.Status.EXPIRED,
        }

        qs = BookingRequest.objects.filter(
            organizer=bid.organizer,
            resource__owner=bid.vendor,
        ).exclude(status__in=terminal_statuses)

        # Narrow by event if the bid carries event context
        if bid.event_id:
            qs = qs.filter(event_id=bid.event_id)

        candidates = list(qs)

        if not candidates:
            logger.debug(
                "ChatBid %s accepted but no matching BookingRequest found "
                "(organizer=%s, vendor=%s, event=%s).",
                bid.pk, bid.organizer_id, bid.vendor_id, bid.event_id,
            )
            return

        # If multiple candidates, prefer the one with the most recent activity
        request = sorted(candidates, key=lambda r: r.updated_at, reverse=True)[0]

        # Determine the agreed amount (counter_amount if set, otherwise original amount)
        agreed_amount = bid.counter_amount if bid.counter_amount is not None else bid.amount

        if request.estimated_total_amount != agreed_amount:
            request.estimated_total_amount = agreed_amount
            request.save(update_fields=["estimated_total_amount", "updated_at"])
            logger.info(
                "Synced ChatBid %s accepted amount %s to BookingRequest %s.",
                bid.pk, agreed_amount, request.pk,
            )

    except Exception:
        # Never let a sync failure break the chat flow
        logger.exception("Failed to sync ChatBid %s to BookingRequest.", bid.pk)


@receiver(post_save, sender="chat.ChatBid")
def on_chat_bid_saved(sender, instance, created, **kwargs):
    """Sync accepted bid price to the corresponding scheduling BookingRequest."""
    if instance.status == "accepted":
        _sync_bid_to_booking_request(instance)
