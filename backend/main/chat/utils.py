import logging
from typing import Any, Dict, Optional

from asgiref.sync import async_to_sync
from channels.layers import BaseChannelLayer, get_channel_layer

logger = logging.getLogger(__name__)


def _safe_group_send(channel_layer: BaseChannelLayer, group_name: str, payload: Dict[str, Any]) -> None:
    """Attempt to send to a group but swallow channel-layer errors.

    If Redis or the configured channel layer is unavailable, we log the failure
    and return without raising so that REST/API handlers can continue and the
    message remains persisted in the database.
    """
    try:
        async_to_sync(channel_layer.group_send)(group_name, payload)
    except Exception as exc:  # pragma: no cover - defensive safety
        logger.warning("Chat broadcast skipped: %s", exc)


def broadcast_room_event(room_id: int, payload: dict) -> None:
    """Send a payload to all websocket subscribers for the given room.

    The websocket consumer expects an event with the shape {"payload": ...}
    under the `chat.event` handler. If Channels is not configured, the
    function exits silently to keep API handlers resilient in non-ASGI
    environments.
    """

    channel_layer: Optional[BaseChannelLayer] = get_channel_layer()
    if not channel_layer:
        logger.info("Chat broadcast skipped: no channel layer configured")
        return
    _safe_group_send(
        channel_layer,
        f"chat_room_{room_id}",
        {
            "type": "chat.event",
            "payload": payload,
        },
    )