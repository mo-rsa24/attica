import logging
from typing import Optional
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model

from .models import Notification

User = get_user_model()
logger = logging.getLogger(__name__)


def create_notification(
    recipient,
    notification_type: str,
    title: str,
    message: str = '',
    sender=None,
    link_type: str = '',
    link_id: Optional[int] = None,
    data: dict = None
) -> Notification:
    """
    Create a notification and optionally broadcast it via WebSocket.
    """
    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        link_type=link_type,
        link_id=link_id,
        data=data or {}
    )

    # Try to broadcast via WebSocket
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'notifications_{recipient.id}',
                {
                    'type': 'notification.new',
                    'notification': {
                        'id': notification.id,
                        'notification_type': notification.notification_type,
                        'title': notification.title,
                        'message': notification.message,
                        'link_type': notification.link_type,
                        'link_id': notification.link_id,
                        'sender_username': sender.username if sender else None,
                        'created_at': notification.created_at.isoformat(),
                    }
                }
            )
    except Exception as exc:
        logger.warning(f'Failed to broadcast notification: {exc}')

    return notification


def notify_new_message(room, sender, message_text: str):
    """Notify the other participant of a new message."""
    recipient = room.vendor if sender == room.organizer else room.organizer
    create_notification(
        recipient=recipient,
        sender=sender,
        notification_type=Notification.NotificationType.NEW_MESSAGE,
        title=f'New message from {sender.username}',
        message=message_text[:100] if message_text else 'Sent an attachment',
        link_type='chat',
        link_id=room.id
    )


def notify_new_bid(room, bid):
    """Notify vendor of a new bid from organizer."""
    create_notification(
        recipient=room.vendor,
        sender=room.organizer,
        notification_type=Notification.NotificationType.NEW_BID,
        title=f'New bid from {room.organizer.username}',
        message=f'Bid amount: {bid.currency} {bid.amount}',
        link_type='chat',
        link_id=room.id,
        data={'bid_id': bid.id, 'amount': str(bid.amount)}
    )


def notify_bid_response(room, bid, action: str):
    """Notify organizer of bid acceptance/decline/counter."""
    type_map = {
        'accepted': Notification.NotificationType.BID_ACCEPTED,
        'declined': Notification.NotificationType.BID_DECLINED,
        'countered': Notification.NotificationType.BID_COUNTERED,
    }
    notification_type = type_map.get(action, Notification.NotificationType.BID_ACCEPTED)

    message = f'Your bid of {bid.currency} {bid.amount} was {action}'
    if action == 'countered' and bid.counter_amount:
        message += f' with {bid.currency} {bid.counter_amount}'

    create_notification(
        recipient=room.organizer,
        sender=room.vendor,
        notification_type=notification_type,
        title=f'Bid {action} by {room.vendor.username}',
        message=message,
        link_type='chat',
        link_id=room.id,
        data={'bid_id': bid.id}
    )
