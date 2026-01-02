# Real-time direct messaging flow

This document captures the end-to-end direct messaging flow for two participants (e.g., `tfuller` and `bkirk`) using the React client, Django REST API, and Django Channels WebSockets. The implementation is **REST-first** (database persistence is the source of truth) with WebSockets providing realtime fan-out when the channel layer (Redis) is available.

## A) Process flow

1. **User authentication (React)**
   - Users sign in through the existing login form; `AuthProvider` stores JWT access/refresh tokens in `localStorage`.
   - REST calls send `Authorization: Bearer <access>` and WebSockets append `?token=<access>` to the URL.
2. **Room discovery/creation**
   - Use `POST /api/chat/rooms/with/<username>/` to get-or-create the 1:1 room for the current user and the target username (e.g., `bkirk`). The response includes `id`, `organizer`, and `vendor` so both participants can navigate to `/dm/<room_id>`.
   - Existing flows (e.g., vendor profile DM button) still call `POST /api/chat/rooms/` with explicit organizer/vendor ids.
3. **Open a WebSocket scoped to the room**
   - Client connects to `ws(s)://<host>/ws/chat/rooms/<room_id>/?token=<access>`.
   - On connect, the consumer verifies membership, joins `chat_room_<room_id>`, and may emit a warning payload when realtime is unavailable.
4. **Send a message**
   - **Persistence (source of truth):** `POST /api/chat/rooms/<room_id>/messages/` with `{ text, attachment_ids?, message_type? }`.
   - **Optimistic UI:** The sender appends the REST response locally; the same payload is broadcast to other participants via WebSocket when possible.
   - **WebSocket broadcast:** Server-side `broadcast_room_event` sends `{ type: "message", message: <MessageSerializer data> }` to the group; failures are logged and do **not** break the REST request.
5. **Receive a message event**
   - The WebSocket client listens for `type === "message"` (or `type === "bid"` for bid-related messages) and merges the payload into local state with de-duplication by `id`.
6. **Refresh/history**
   - When a room opens (and on polling fallback), the client calls `GET /api/chat/rooms/<room_id>/messages/` to hydrate message history, ensuring ordering by `created_at`.
7. **Failure behavior (Redis/WebSocket unavailable)**
   - Backend: `broadcast_room_event` and consumer broadcasts swallow channel-layer errors after logging; REST responses still return success, so messages are stored.
   - Frontend: WebSocket disconnects set a warning banner and start an 8s polling loop against the REST history; manual refresh always reloads messages.

## B) Architecture & design

- **Source of truth:** REST-first persistence (`Message` rows) with WebSocket fan-out for realtime delivery.
- **Room identification:** `ChatRoom` records (`organizer_id`, `vendor_id`) keyed by `id`; rooms are fetched via explicit ids or `POST /api/chat/rooms/with/<username>/`.
- **Events broadcast:** Group name `chat_room_<room_id>` emits envelopes handled by `chat.event` in the consumer:
  - `{"type": "message", "message": <MessageSerializer payload>}`
  - `{"type": "bid", "message": <MessageSerializer>, "bid": <ChatBidSerializer>}`
  - `{"type": "read_receipt", "message_id": <int>, "read_at": <iso8601>}`
  - `{"type": "warning", "detail": "..."}`
- **Message schema (payload contract)**
  - `id`, `room`, `sender`, `sender_username`, `text`, `message_type`, `attachments` (array with `id`, `file`, `original_name`, `size`), `delivered_at`, `read_at`, `created_at`, optional `bid_details`.
- **Authentication (WebSockets):** JWT access token via `?token=<access>` (or `Authorization: Bearer <access>` header); middleware resolves the token and populates `scope["user"]`.
- **Redis/channel-layer dependency & fallback:** Channel layer is used when available. Failures during `group_add`/`group_send` are caught and logged; clients receive a warning and rely on REST polling.
- **Backend components**
  - Models: `ChatRoom`, `Message`, `ChatAttachment`, `ChatBid`.
  - Serializers: `ChatRoomSerializer`, `MessageSerializer`, `ChatAttachmentSerializer`, `ChatBidSerializer`.
  - REST endpoints: list rooms, ensure room by username, room detail, list/create messages, upload attachments, bid create/update.
  - Channels: route `ws/chat/rooms/<room_id>/` to `ChatConsumer`; shared utility `broadcast_room_event` wraps `group_send`.
  - Utilities: deterministic group naming (`chat_room_<room_id>`), safe broadcast helper that logs instead of crashing when Redis is down.

## Manual verification with two browsers

1. Open two sessions (e.g., normal + incognito). Sign in as `tfuller` in one and `bkirk` in the other using the existing login form.
2. In one session, ensure the DM room exists:
   - From UI: use the "DM" button on the target's profile **or**
   - API: `POST /api/chat/rooms/with/<other_username>/` (requires auth header). Copy the returned `id`.
3. In both sessions, navigate to `/dm/<room_id>`.
4. Send messages from either side:
   - Sender sees the message immediately from the REST response.
   - The other participant receives it in realtime via WebSocket (when available); otherwise it appears on the next poll/refresh.
5. Refresh either page; the full history loads from the REST endpoint, confirming persistence.