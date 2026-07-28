# Design Decisions & Rationale

Architectural choices made in the Attica codebase, with the reasoning behind each.
Intended for new developers who need to understand *why* the system is structured this way
before they modify it.

---

## 1. REST-first + WebSocket Overlay

**Decision:** All writes go through the REST API. WebSocket is used only to broadcast
notifications — it never writes to the database directly.

**Rationale:**
- The database is the source of truth at all times. A client that disconnects mid-session
  does not lose data; on reconnect it re-fetches from REST and resumes from the current state.
- WebSocket connections are inherently unreliable (network drops, tab closes, idle timeouts).
  Coupling writes to an unreliable channel would require complex reconciliation logic.
- REST writes are transactional, atomic, and easily logged. WebSocket broadcasts are fire-and-forget.
- Keeps the consumer stateless — it joins a Redis group, listens, and broadcasts. No DB logic.

**How it works in practice (sending a chat message):**
```
Vendor frontend
  │
  ├─ POST /api/chat/messages/  ────────────► Django MessageViewSet.create()
  │   { room_id, text }                           │
  │                                               ├─ Validates auth + room membership
  │   ◄─── 201 Created ─────────────────────────  ├─ Saves Message to SQLite
  │        { id, text, created_at, ... }          └─ channel_layer.group_send(
  │                                                     'chat_room_101',
  │                                                     { type: 'message', ... }
  │                                                  )
  │                                                        │
  │  ws://localhost:8000/ws/chat/rooms/101/                │
  ◄──── WebSocket broadcast ──────────────────────────────
       { type: 'message', text: '...', sender: 7 }
       (received by ALL connected clients in room 101)
```

**Key constraint:** If a client's WebSocket is offline when the broadcast happens, they miss
the real-time push — but not the data. They fetch missing messages via REST when they reconnect.

---

## 2. SQLite + Redis: Lightweight Storage, Fast Broadcasts

**Decision:** SQLite for relational, durable data in development. Redis for ephemeral
pub/sub and caching. The two stores never overlap.

**Rationale:**
- SQLite needs zero installation or configuration. A new developer can run `migrate` and have
  a fully working database in seconds, with no separate database server process.
- Redis is needed for Django Channels' channel layer (pub/sub between server processes) and
  for Django's cache backend. Neither of these requires durability — if Redis restarts,
  connected WebSocket clients reconnect; cache misses are handled transparently.
- Using Redis for the relational store would have been wrong: no transactions, no joins,
  no foreign key constraints.

**The split in settings.py:**
```python
# Durable relational data — SQLite file on disk
DATABASES = {
    'default': { 'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3' }
}

# Ephemeral pub/sub — Redis DB 0
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': { 'hosts': [('127.0.0.1', 6379)] },
    }
}

# Cache — Redis DB 1 (separate DB to avoid key collisions)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

**Production path:** `psycopg2-binary` is already in `requirements.txt`. Switching to
PostgreSQL requires one settings change (`ENGINE`, `NAME`, `USER`, `PASSWORD`, `HOST`).
The channel layer and cache stay on Redis unchanged.

---

## 3. JWT Authentication: Stateless, Frontend-Friendly, Auto-Refresh

**Decision:** JWT (JSON Web Tokens) via `djangorestframework-simplejwt`, with short-lived
access tokens and longer-lived refresh tokens. The frontend auto-refreshes on 401.

**Rationale:**
- **Stateless:** Django does not store session state. Any server process can validate any
  token by checking the signature — no shared session store needed. This matters for Channels,
  which runs in separate ASGI worker processes.
- **WebSocket compatibility:** Browsers cannot set custom headers on WebSocket connections.
  Session cookies work only if the cookie domain matches the WebSocket host — unreliable in
  development where frontend (`:5173`) and backend (`:8000`) are on different ports. JWT
  as a query param (`?token=<jwt>`) works universally.
- **Frontend control:** The access token is stored in `localStorage`, not in a cookie.
  The frontend explicitly manages refresh, giving full control over the auth flow.

**Token details (verified from `settings.py:214-217`):**
| Token | Lifetime | Where stored |
|---|---|---|
| Access token | **30 minutes** | `localStorage` → key `tokens` → `.access` |
| Refresh token | **7 days** | `localStorage` → key `tokens` → `.refresh` |

**Auto-refresh flow (in `src/utils/useAxios.js` and `src/AuthProvider.jsx`):**
```
Frontend makes request
  │
  ├─ Axios adds: Authorization: Bearer <access_token>
  │
  ▼
Backend validates token
  │
  ├─ Token valid → 200 OK ──────────────────────────────── response returned
  │
  └─ Token expired → 401 Unauthorized
         │
         ▼
    Axios interceptor catches 401
         │
         ├─ POST /api/accounts/token/refresh/
         │   body: { refresh: <refresh_token> }
         │
         ├─ Backend returns: { access: <new_access_token> }
         │
         ├─ localStorage updated: tokens.access = new token
         │
         └─ Original request retried with new token → 200 OK
              (user sees no interruption)

    If refresh also fails (7-day token expired):
         └─ localStorage cleared → redirect to /login
```

**Note on endpoint:** The refresh endpoint the frontend calls is
`/api/accounts/token/refresh/` (via `users.urls`), not `/api/token/refresh/` (which also
exists in `main/urls.py`). Both point to the same simplejwt view; the frontend uses the
accounts-namespaced path.

---

## 4. Multi-Role CustomUser

**Decision:** A single user account can hold multiple roles simultaneously via a
Many-to-Many relationship between `CustomUser` and `Role`.

**Rationale:**
- Real users often occupy multiple roles. A musician who also organizes gigs needs
  organizer and artist capabilities in a single account. Requiring separate accounts
  for each role creates friction and data duplication.
- Roles are checked with `user.has_role('EVENT_ORGANIZER')` — a single query, not a
  type-switch on a char field.
- UI shows different dashboards and navigation based on `currentRole` in `localStorage`
  (set on login or role-switch), so the experience is role-specific even for multi-role users.

**Available roles (from `users/models.py`):**
```
EVENT_ORGANIZER   — creates and manages events
ARTIST            — lists artist profile, accepts bookings
SERVICE_PROVIDER  — (vendor-like) lists services
VENUE_MANAGER     — manages location/venue listings
TICKET_BUYER      — purchases event tickets
```

**Model structure:**
```python
class Role(models.Model):
    name = models.CharField(max_length=50)   # 'EVENT_ORGANIZER', etc.

class CustomUser(AbstractUser):
    user_type = models.CharField(...)        # legacy single-role char field
    roles     = models.ManyToManyField(Role) # current multi-role M2M
    profile   → UserProfile (1-1, auto-created via signal)
```

**`user_type` vs `roles`:** `user_type` is a legacy single-value char field that predates
the M2M `roles`. New code should use `roles` and `has_role()`. `user_type` is kept for
backwards compatibility with older views.

---

## 5. EventDraft State Machine (Multi-Step Wizard)

**Decision:** Event creation is split across 5 steps. Each step PATCHes an `EventDraft`
record. A separate Publish action validates the complete draft and creates the live `Event`.

**Rationale:**
- Long single-form submission has high abandonment. Saving incrementally means an organizer
  who stops at Step 3 can return and resume from Step 3 — no work lost.
- Validation is deferred to Publish, not spread across steps. An incomplete draft can exist;
  an incomplete Event cannot.
- Draft and Event are separate models. A draft is mutable, provisional, and owned by the
  wizard session. An Event is immutable once published (organizers edit via update, not
  re-draft).

**Step pattern:**
```
POST /api/events/drafts/              → creates draft, returns { id: 42 }
PATCH /api/events/drafts/42/          → step 1: name, category, description
PATCH /api/events/drafts/42/          → step 2: date, time, duration
PATCH /api/events/drafts/42/          → step 3: location, capacity
PATCH /api/events/drafts/42/          → step 4: pricing, promo codes, questions
POST  /api/events/drafts/42/publish/  → validates, creates Event(id=42), deletes draft
```

---

## 6. ChatRoom Uniqueness Constraint

**Decision:** A `ChatRoom` is uniquely identified by `(organizer, vendor, event)`.

**Rationale:**
- Prevents duplicate rooms between the same pair of users for the same event.
- Allows the same two users to have separate rooms for different events (the `event` FK is
  nullable, so a general-purpose room can also exist where `event=NULL`).
- Room discovery is deterministic: the frontend can compute whether a room exists by
  querying `GET /api/chat/rooms/?organizer=X&vendor=Y&event=Z` rather than storing a room ID.

**Constraint in model:**
```python
class Meta:
    constraints = [
        UniqueConstraint(
            fields=['organizer', 'vendor', 'event'],
            name='unique_room_per_pair_event'
        )
    ]
```
