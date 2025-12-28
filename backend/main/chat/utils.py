from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def broadcast_room_event(room_id: int, payload: dict) -> None:
    """Send a payload to all websocket subscribers for the given room.

    The websocket consumer expects an event with the shape {"payload": ...}
    under the `chat.event` handler. If Channels is not configured, the
    function exits silently to keep API handlers resilient in non-ASGI
    environments.
    """

    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    async_to_sync(channel_layer.group_send)(
        f"chat_room_{room_id}",
        {
            "type": "chat.event",
            "payload": payload,
        },
    )