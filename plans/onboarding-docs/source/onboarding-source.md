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
| [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> | Django Channels + Daphne | 4.2.2 / 4.2.1 |
| Channel layer | channels_redis | 4.2.1 |
| Auth | djangorestframework-simplejwt | 5.5.0 |
| Frontend | React + Vite | 19.1 / 7.0 |
| UI | Material-UI + TailwindCSS | 7.1 / 3.4 |
| [HTTP](../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> client | Axios | (latest) |
| Database | SQLite (dev) | — |
| Cache/broker | [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> | localhost:6379 |
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

**Decision:** All writes go through [REST API](../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub>. [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> is broadcast-only.

**Why:** Database is the source of truth. If a client disconnects during a WebSocket session, they haven't lost any data — they re-fetch from REST on reconnect. Real-time feel without real-time risk.

**How it works:**
1. Client sends message: `POST /api/chat/messages/`
2. Django saves to DB → returns 201
3. Django simultaneously calls `channel_layer.group_send('chat_room_<id>', {...})`
4. All connected WebSocket clients receive the broadcast
5. React updates state → message appears on screen

### 5.2 SQLite + Redis split

**Decision:** SQLite for relational data (dev), [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> for ephemeral channel-layer state.

**Why:** SQLite needs zero setup for local dev. Redis handles [pub/sub](../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Publish-Subscribe.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=196 "System design interview, chapter 12, Design a chat system, Online status fanout, Works one case: user A's presence change is published to three channels, A-B..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=69 "System design big archive, SQS vs SNS vs EventBridge vs Kinesis, SNS as the managed publish/subscribe service that sends one message on a topic to many subsc..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=253 "System design interview, chapter 15, Design Google Drive, Notification service, The notification service as a publisher/subscriber system that tells every re..."), [▶1](https://www.youtube.com/watch?v=O1PgqUqZKTA&t=672s "Hussein Nasser, Publish-Subscribe Architecture (Explained by Example), Pub/sub pattern, 11:12 to 17:50, The pattern drawn on an example system, after the cha..."), [▶2](https://www.youtube.com/watch?v=nH4qjmP2KEE&t=215s "ByteByteGo, Top 7 Most-Used Distributed System Patterns, Pubsub, 3:35 to 4:18, Pub/sub as one of seven distributed system patterns, in under a minute. Chapte..."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. One 'group_send' from the shell lands in two open tabs throug...")</sub> (channel layer) and [caching](../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> — things that don't need durable storage. The two never overlap.

**In production:** SQLite would be replaced with PostgreSQL (psycopg2-binary is already in requirements). Redis stays.

### 5.3 JWT authentication

**Decision:** [JWT](../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> (access + refresh tokens), not [session cookies](../../../../../Obsidian/Information%20Technology/Networking/HTTP%20Cookie.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=138 "Computer networking: a top-down approach, section 2.2.4, User-server interaction: cookies, The four parts of cookie technology, then Susan's visits to Amazon..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=322 "System design big archive, Cookies vs Sessions, Data kept in the cookie itself and sent on every request, against a session where the cookie holds only a ses..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=36 "System design big archive, Session, Cookie, JWT, Token, SSO, and OAuth 2.0 Explained in One Diagram, The session ID cookie beside the other ways a site keeps..."), [▶1](https://www.youtube.com/watch?v=sovAIX4doOE&t=255s "Hussein Nasser, HTTP Cookies Crash Course, Section 1: Creating Cookies, 4:15 to 14:38, Creating cookies, the first section of a course that goes on to their ..."), [▶2](https://www.youtube.com/watch?v=aUF2QCEudPo&t=70s "Hussein Nasser, SameSite Cookie Attribute Explained by Example (Strict, Lax, None & No SameSite), SameSite=Strict, 1:10 to 6:00, The strictest SameSite value..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06, section 6.2. Follows the admin login with 'curl -c' and '-b' and a cookie jar file, where the POST ...")</sub>.

**Why:** [Stateless](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Stateless%20Service.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works user A's case: on a stateful server A's session lives on server 1, so a request routed to serve..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=184 "System design interview, chapter 12, Design a chat system, High-level design, One system split into stateless request and response services behind a load bal..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to stateless authentication, A token that carries its own claims, so the server checks a signature instead of looking..."), [▶1](https://www.youtube.com/watch?v=20tpk8A_xa0&t=101s "Hayk Simonyan, Stateful vs Stateless Architectures Explained, Online shopping example, 1:41 to 2:35, The two architectures applied to one shopping cart, foll..."), [▶2](https://www.youtube.com/watch?v=nFPzI_Qg3FU&t=520s "Hussein Nasser, Stateful vs Stateless Applications (Explained by Example), Stateless Application, 8:40 to 14:44, The stateless version of the application the..."), [◆](../../../../../goal-setting/learning/system-design/scalability/MASTER_PLAN.md "System Design: Scalability, system-design/scalability. Its second objective takes a toy service holding sessions in memory, makes it stateless, and runs it b...")</sub> — Django can scale across processes without shared session storage. Also required for WebSocket auth (cookies don't work reliably across WS connections in all browsers).

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

**Prerequisites:** Python 3.12, [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> running on localhost:6379

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

**Verify:** Frontend loads, login works, API calls return data, [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> connected.

---

## 7. Key URLs (dev)

| URL | What it is |
|---|---|
| `http://localhost:8000/api/` | DRF browsable API root |
| `http://localhost:8000/admin/` | Django admin |
| `http://localhost:8000/api/token/` | Login (POST → access + refresh) |
| `http://localhost:8000/api/accounts/token/refresh/` | Refresh access token |
| `http://localhost:5173/` | React frontend |
| `ws://localhost:8000/ws/chat/rooms/<id>/?token=<jwt>` | [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> chat room |

---

## 8. Where to Go Next

After setup is complete:

- **Chat system deep-dive** → `Chat.md` in repo root
- **API exploration** → `http://localhost:8000/api/` (DRF browsable)
- **Models** → `backend/main/<app>/models.py` for each app
- **E2E tests** → `frontend/tests/e2e/` (Playwright)
- **Run backend tests** → `cd backend/main && pytest`
- **[WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> routing** → `backend/main/main/routing.py` + `chat/routing.py`
- **Frontend auth** → `frontend/src/AuthProvider.jsx` + `src/utils/useAxios.js`
