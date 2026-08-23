# Attica Onboarding Source

Canonical reference extracted from the live codebase. Use this as the source of truth for all onboarding docs (guides, slides, diagrams). Verified against: `backend/main/`, `frontend/src/`, commit `2ea72d0`.

---

## 1. What Is Attica

An event management and marketplace platform. Organizers create events; vendors, artists, and service providers list themselves; the platform connects them via a marketplace with real-time direct messaging and a bid system.

**Core flows:**
1. Organizer creates an event (multi-step wizard → draft → publish)
2. Vendors/artists list services and respond to organizer enquiries
3. Both parties communicate via chat with price bids
4. Attendees buy tickets (Phase 5 — not yet built out)

---

## 2. Tech Stack (verified)

| Layer | Technology | Version |
|---|---|---|
| Backend framework | Django + DRF | 5.2.3 / 3.16.0 |
| WebSocket | Django Channels + Daphne | 4.2.2 / 4.2.1 |
| Channel layer | channels_redis | 4.2.1 |
| Auth | djangorestframework-simplejwt | 5.5.0 |
| Frontend | React + Vite | 19.1 / 7.0 |
| UI | Material-UI + TailwindCSS | 7.1 / 3.4 |
| HTTP client | Axios | (latest) |
| Database | SQLite (dev) | — |
| Cache/broker | Redis | localhost:6379 |
| ASGI server | Daphne | 4.2.1 |

---

## 3. Django Apps (11 installed)

From `settings.py` INSTALLED_APPS (verified):

| App | Purpose |
|---|---|
| `users` | CustomUser, roles, profiles, social posts |
| `events` | Event, EventDraft (wizard), PromoCode |
| `vendors` | Vendor profiles, services, bookings, reviews |
| `artists` | Artist profiles, portfolio, bookings, follows |
| `locations` | Venue/location listings, quotes, bookings |
| `chat` | ChatRoom, Message, ChatBid, real-time messaging |
| `cart` | CartItem (shopping cart) |
| `checkout` | Orders and payment |
| `tickets` | Ticket model |
| `notifications` | Notification model |
| `scheduling` | Resource availability, booking slots, audit logs |

**Not a Django app:** `common/` — contains shared base classes (`TimeStampedModel`, `OwnedModel`). Not in INSTALLED_APPS. Import directly.

**Legacy artifact:** `serializers/` directory (contains `serailizers.py` with typo). Not a Django app. Safe to ignore.

---

## 4. Core Models

### users app
- **`Role`** — name string (EVENT_ORGANIZER, ARTIST, SERVICE_PROVIDER, VENUE_MANAGER, TICKET_BUYER)
- **`CustomUser`** (extends AbstractUser) — `user_type` char, `roles` M2M to Role, `has_role(role_name)` method
- **`UserProfile`** — 1-1 with CustomUser, bio, avatar, phone; auto-created via signal
- **`SocialPost`**, **`SocialPostComment`** — user feed

### events app
- **`Event`** — organizer FK, status (draft/published), `tiered_prices` JSON, `custom_questions` JSON, `features` JSON, `base_price`, `max_tickets_per_buyer`
- **`EventDraft`** — multi-step form state; each wizard step PATCHes this; Publish action creates Event and deletes draft
- **`PromoCode`** — discount codes linked to events
- **`EventDraftAsset`** — file uploads for drafts

### chat app
- **`ChatRoom`** — unique_together (organizer, vendor, event). The three-way key prevents duplicate rooms.
- **`ChatBid`** — amount, status (PENDING/ACCEPTED/DECLINED/COUNTERED), `idempotency_key`
- **`Message`** — TEXT/SYSTEM/BID type, FK to ChatRoom and sender
- **`ChatAttachment`** — file attached to a message
- **`Booking`**, **`ProviderAvailability`** — also in chat app (availability negotiation)

### vendors app
- **`Vendor`** — 1-1 with CustomUser
- **`Service`** — M2M to amenities + regions, self-referential `similar_services`
- **`Booking`**, **`BookingRequest`** — separate from chat.Booking
- **`Review`** — auto-updates Vendor rating via signal
- **`VendorPost`**, **`VendorProfile`**, **`Policy`**

### artists app
- **`Artist`** — `booking_fee_min/max`, `availability` JSON, `tour_cities/clubs` JSON
- **`ArtistPortfolioItem`**, **`Follow`** (unique_together user+artist), **`ArtistBooking`** (unique_together artist+event), **`ArtistPost`**

### locations app
- **`Location`** — extends TimeStampedModel + OwnedModel, `search_vector` SearchVectorField (PostgreSQL full-text, unused in SQLite dev), `has_variable_pricing`
- **`VenueBooking`**, **`Quote`** (PENDING/QUOTED/ACCEPTED/REJECTED), **`WaitlistEntry`**, **`LocationReview`**, **`Question`**, **`Wish`**, **`LocationImage`**, **`Feature`**, **`FloorPlan`**, **`Amenity`**

### Other apps
- `cart`: **`CartItem`**
- `notifications`: **`Notification`**
- `tickets`: **`Ticket`** (extends TimeStampedModel)
- `scheduling`: 15 models — **`MarketplaceResource`**, **`BookingRequest`**, **`Booking`**, **`AvailabilityRule`**, **`AvailabilitySlot`**, **`CheckoutSession`**, **`CalendarEvent`**, **`AuditLog`**, **`OutboxEvent`**, **`Review`**, and more

**Total models:** ~50 across 11 apps.

---

## 5. Design Decisions

### 5.1 REST-first + WebSocket overlay

**Decision:** All writes go through REST API. WebSocket is broadcast-only.

**Why:** Database is the source of truth. If a client disconnects during a WebSocket session, they haven't lost any data — they re-fetch from REST on reconnect. Real-time feel without real-time risk.

**How it works:**
1. Client sends message: `POST /api/chat/messages/`
2. Django saves to DB → returns 201
3. Django simultaneously calls `channel_layer.group_send('chat_room_<id>', {...})`
4. All connected WebSocket clients receive the broadcast
5. React updates state → message appears on screen

### 5.2 SQLite + Redis split

**Decision:** SQLite for relational data (dev), Redis for ephemeral channel-layer state.

**Why:** SQLite needs zero setup for local dev. Redis handles pub/sub (channel layer) and caching — things that don't need durable storage. The two never overlap.

**In production:** SQLite would be replaced with PostgreSQL (psycopg2-binary is already in requirements). Redis stays.

### 5.3 JWT authentication

**Decision:** JWT (access + refresh tokens), not session cookies.

**Why:** Stateless — Django can scale across processes without shared session storage. Also required for WebSocket auth (cookies don't work reliably across WS connections in all browsers).

**Token details (verified from settings.py):**
- Access token: **30 minutes** lifetime
- Refresh token: **7 days** lifetime
- `ROTATE_REFRESH_TOKENS`: False (refresh token does not change on use)

**Token storage (verified from AuthProvider.jsx):**
- Stored in `localStorage` under key `tokens` as a JSON object: `{ access: "...", refresh: "..." }`
- NOT as separate `access_token` / `refresh_token` keys

### 5.4 WebSocket authentication via middleware

**Decision:** A dedicated `WebSocketJWTAuthMiddleware` class handles JWT decoding before the consumer is reached.

**Why:** Keeps consumers clean. Auth logic is in one place. JWT is passed as query param `?token=<jwt>` because browsers cannot set custom headers on WebSocket connections.

**Flow:**
1. Client opens `ws://localhost:8000/ws/chat/rooms/101/?token=<access_token>`
2. `WebSocketJWTAuthMiddleware.__call__` extracts token from query string
3. Validates via `UntypedToken(token)` (simplejwt)
4. Sets `scope['user']` to the authenticated user (or AnonymousUser)
5. Consumer's `connect()` checks `scope['user'].is_anonymous` — rejects if true
6. If valid, consumer joins the Redis channel group `chat_room_<id>`

### 5.5 Multi-role users

**Decision:** One user account can hold multiple roles simultaneously via M2M.

**Why:** A person might be both an event organizer and an artist (e.g., a musician who also organizes gigs). Enforcing one role would require multiple accounts.

**How:** `CustomUser.roles` is M2M to `Role`. UI shows different dashboards based on current role. `has_role()` method checks membership.

### 5.6 Multi-step event wizard (EventDraft)

**Decision:** Event creation is split across 5 steps, each saving to an `EventDraft` record via PATCH.

**Why:** Long forms have high abandonment rates. Saving each step means work is never lost. Publish is a separate action that validates the complete draft and creates the live Event.

**Endpoint pattern:**
- Step 1 (new draft): `POST /api/events/drafts/` → creates draft, returns `id`
- Steps 2–5: `PATCH /api/events/drafts/<id>/` → updates draft fields
- Publish: `POST /api/events/drafts/<id>/publish/` → creates Event, deletes draft

---

## 6. Canonical Setup Sequence

### 6.1 Backend Setup (9 steps)

**Prerequisites:** Python 3.12, Redis running on localhost:6379

```
Step 1: Clone repo
  git clone <repo> && cd attica

Step 2: Create virtual environment
  python -m venv backend/venv

Step 3: Activate venv
  source backend/venv/bin/activate           # Linux/Mac
  backend\venv\Scripts\activate              # Windows

Step 4: Install Python dependencies
  cd backend/main
  pip install -r requirements.txt

Step 5: Configure environment (if needed)
  # settings.py uses python-decouple; .env optional in dev
  # Defaults: SQLite DB, Redis on localhost:6379

Step 6: Run migrations
  python manage.py migrate

Step 7: Seed test data
  python manage.py seed_e2e
  # Creates: e2e-organizer / E2eOrganizerPass!23
  # Creates: sample events, vendors, artists

Step 8: Verify Redis is running
  redis-cli ping          # should return PONG

Step 9: Start server (with WebSocket support)
  daphne -b 0.0.0.0 -p 8000 main.asgi:application
  # OR (HTTP only, no WebSocket):
  python manage.py runserver
```

**Verify:** Open http://localhost:8000/api/ — should see DRF browsable API. Open http://localhost:8000/admin/ — should see Django admin.

**Key file locations:**
- Requirements: `backend/main/requirements.txt`
- Settings: `backend/main/main/settings.py`
- ASGI entry: `backend/main/main/asgi.py`
- Migrations: each app's `migrations/` folder

---

### 6.2 Frontend Setup (7 steps)

**Prerequisites:** Node.js 16+, backend running on localhost:8000

```
Step 1: Go to frontend directory
  cd frontend

Step 2: Install dependencies
  npm install
  # Installs: React 19, Vite 7, MUI 7, Axios, react-router-dom, etc.

Step 3: Verify Vite proxy config
  # Open frontend/vite.config.js — should see:
  proxy: {
    '/api': 'http://localhost:8000',
    '/vendors': 'http://localhost:8000',
    '/cart': 'http://localhost:8000',
    '/checkout': 'http://localhost:8000',
    '/ws': { target: 'http://localhost:8000', ws: true },
  }
  # No changes needed — this is pre-configured

Step 4: Start Vite dev server
  npm run dev
  # Server starts at http://localhost:5173

Step 5: Open in browser
  http://localhost:5173
  # Should see login page (no CORS errors)

Step 6: Login with seeded credentials
  Username: e2e-organizer
  Password: E2eOrganizerPass!23
  # App POSTs to /api/accounts/token/refresh/ (proxied to backend)
  # Tokens stored in localStorage as: { access: "...", refresh: "..." }

Step 7: Verify
  - Navigate to Events page → should see seeded events
  - DevTools → Network → check Authorization header on API calls
  - DevTools → Application → localStorage → key: "tokens" → JSON object
  - DevTools → Network → WS tab → should see WebSocket connection
```

**Verify:** Frontend loads, login works, API calls return data, WebSocket connected.

---

## 7. Key URLs (dev)

| URL | What it is |
|---|---|
| `http://localhost:8000/api/` | DRF browsable API root |
| `http://localhost:8000/admin/` | Django admin |
| `http://localhost:8000/api/token/` | Login (POST → access + refresh) |
| `http://localhost:8000/api/accounts/token/refresh/` | Refresh access token |
| `http://localhost:5173/` | React frontend |
| `ws://localhost:8000/ws/chat/rooms/<id>/?token=<jwt>` | WebSocket chat room |

---

## 8. Where to Go Next

After setup is complete:

- **Chat system deep-dive** → `Chat.md` in repo root
- **API exploration** → `http://localhost:8000/api/` (DRF browsable)
- **Models** → `backend/main/<app>/models.py` for each app
- **E2E tests** → `frontend/tests/e2e/` (Playwright)
- **Run backend tests** → `cd backend/main && pytest`
- **WebSocket routing** → `backend/main/main/routing.py` + `chat/routing.py`
- **Frontend auth** → `frontend/src/AuthProvider.jsx` + `src/utils/useAxios.js`
