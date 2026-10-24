# Design Decisions & Rationale

Architectural choices made in the Attica codebase, with the reasoning behind each.
Intended for new developers who need to understand *why* the system is structured this way
before they modify it.

---

## 1. REST-first + WebSocket Overlay

**Decision:** All writes go through the [REST API](../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, `POST api/v1/data/shorten` taking the long URL an..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. `curl` against two running mocks, reading the status line, headers and ...")</sub>. [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> is used only to broadcast
notifications — it never writes to the database directly.

**Rationale:**
- The database is the source of truth at all times. A client that disconnects mid-session
  does not lose data; on reconnect it re-fetches from REST and resumes from the current state.
- WebSocket connections are inherently unreliable (network drops, tab closes, idle [timeouts](../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Timeout.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=146 "System design interview, chapter 9, Design a web crawler, Short timeout, A crawler gives each web server a maximal wait time and, when a host does not answer..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=362 "System design big archive, How to Debug a Slow API?, Set aggressive timeouts and retries on third-party calls such as Stripe or Google Maps, so one slow prov..."), [▶1](https://www.youtube.com/watch?v=2GAQVXGT_Zw&t=150s "Hussein Nasser, Frontend and Backends Timeouts, Connection Timeout, 2:30 to 5:00, The first of the timeouts a backend sets, before read, wait, usage and resp..."), [▶2](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts set on calls between services..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/14-payment-notification-and-a-timeout.md "Payment, notification, and a timeout, system-design/foundations, plan 14. The order service calls payment with httpx and a 2-second timeout; a card ending 00...")</sub>).
  Coupling writes to an unreliable channel would require complex reconciliation logic.
- REST writes are transactional, atomic, and easily logged. WebSocket broadcasts are fire-and-forget.
- Keeps the consumer [stateless](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Stateless%20Service.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works user A's case: on a stateful server A's session lives on server 1, so a request routed to serve..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=184 "System design interview, chapter 12, Design a chat system, High-level design, One system split into stateless request and response services behind a load bal..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to stateless authentication, A token that carries its own claims, so the server checks a signature instead of looking..."), [▶1](https://www.youtube.com/watch?v=20tpk8A_xa0&t=101s "Hayk Simonyan, Stateful vs Stateless Architectures Explained, Online shopping example, 1:41 to 2:35, The two architectures applied to one shopping cart, foll..."), [▶2](https://www.youtube.com/watch?v=nFPzI_Qg3FU&t=520s "Hussein Nasser, Stateful vs Stateless Applications (Explained by Example), Stateless Application, 8:40 to 14:44, The stateless version of the application the..."), [◆](../../../../../goal-setting/learning/system-design/scalability/MASTER_PLAN.md "System Design: Scalability, system-design/scalability. Its second objective takes a toy service holding sessions in memory, makes it stateless, and runs it b...")</sub> — it joins a [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> group, listens, and broadcasts. No DB logic.

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

**Decision:** SQLite for relational, durable data in development. [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> for ephemeral
[pub/sub](../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Publish-Subscribe.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=196 "System design interview, chapter 12, Design a chat system, Online status fanout, Works one case: user A's presence change is published to three channels, A-B..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=69 "System design big archive, SQS vs SNS vs EventBridge vs Kinesis, SNS as the managed publish/subscribe service that sends one message on a topic to many subsc..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=253 "System design interview, chapter 15, Design Google Drive, Notification service, The notification service as a publisher/subscriber system that tells every re..."), [▶1](https://www.youtube.com/watch?v=O1PgqUqZKTA&t=672s "Hussein Nasser, Publish-Subscribe Architecture (Explained by Example), Pub/sub pattern, 11:12 to 17:50, The pattern drawn on an example system, after the cha..."), [▶2](https://www.youtube.com/watch?v=nH4qjmP2KEE&t=215s "ByteByteGo, Top 7 Most-Used Distributed System Patterns, Pubsub, 3:35 to 4:18, Pub/sub as one of seven distributed system patterns, in under a minute. Chapte..."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. One `group_send` from the shell lands in two open tabs throug...")</sub> and [caching](../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>. The two stores never overlap.

**Rationale:**
- SQLite needs zero installation or configuration. A new developer can run `migrate` and have
  a fully working database in seconds, with no separate database server process.
- Redis is needed for Django Channels' channel layer (pub/sub between server processes) and
  for Django's cache backend. Neither of these requires durability — if Redis restarts,
  connected [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> clients reconnect; cache misses are handled transparently.
- Using Redis for the relational store would have been wrong: no transactions, no joins,
  no [foreign key constraints](../../../../../Obsidian/Information%20Technology/Database%20Systems/Foreign%20Key.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=105 "Database systems textbook, section 3-2b, Types of keys, Defines the foreign key on Figure 3.2's rows: VEND_CODE, the primary key of VENDOR, placed in PRODUCT..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=106 "Database systems textbook, section 3-3, Integrity rules, Table 3.4's entity and referential integrity rules, worked on the CUSTOMER and AGENT tables of Figur..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=283 "Database systems textbook, section 7-2, Data definition commands, The foreign key in SQL: 'FOREIGN KEY (V_CODE) REFERENCES VENDOR ON UPDATE CASCADE' on PRODU..."), [▶1](https://www.youtube.com/watch?v=PQcIfqE85Co&t=159s "Hussein Nasser, Primary Key vs Secondary Key - What you probably didn't know, Primary keys and clustering, 2:39 to 8:01, What a primary key does to how rows ..."), [▶2](https://www.youtube.com/watch?v=5kiMg7GXAsY&t=79s "CockroachDB, What is a Foreign Key Constraint? Understanding Primary & Foreign Keys, What is a foreign key?, 1:19 to 2:02, The foreign key defined, after a c..."), [◆](../../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/04-the-entity-diagram.md "The entity diagram from sentence tests, the foreign key on the many side, the optional relationship drawn, ai-engineering/one-business-end-to-end, plan 04. W...")</sub>.

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

**Decision:** JWT ([JSON Web Tokens](../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub>) via `djangorestframework-simplejwt`, with short-lived
access tokens and longer-lived refresh tokens. The frontend auto-refreshes on 401.

**Rationale:**
- **[Stateless](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Stateless%20Service.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works user A's case: on a stateful server A's session lives on server 1, so a request routed to serve..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=184 "System design interview, chapter 12, Design a chat system, High-level design, One system split into stateless request and response services behind a load bal..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to stateless authentication, A token that carries its own claims, so the server checks a signature instead of looking..."), [▶1](https://www.youtube.com/watch?v=20tpk8A_xa0&t=101s "Hayk Simonyan, Stateful vs Stateless Architectures Explained, Online shopping example, 1:41 to 2:35, The two architectures applied to one shopping cart, foll..."), [▶2](https://www.youtube.com/watch?v=nFPzI_Qg3FU&t=520s "Hussein Nasser, Stateful vs Stateless Applications (Explained by Example), Stateless Application, 8:40 to 14:44, The stateless version of the application the..."), [◆](../../../../../goal-setting/learning/system-design/scalability/MASTER_PLAN.md "System Design: Scalability, system-design/scalability. Its second objective takes a toy service holding sessions in memory, makes it stateless, and runs it b...")</sub>:** Django does not store session state. Any server process can validate any
  token by checking the signature — no shared session store needed. This matters for Channels,
  which runs in separate ASGI worker processes.
- **WebSocket compatibility:** Browsers cannot set custom headers on [WebSocket connections](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub>.
  [Session cookies](../../../../../Obsidian/Information%20Technology/Networking/HTTP%20Cookie.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=322 "System design big archive, Cookies vs Sessions, Data kept in the cookie itself and sent on every request, against a session where the cookie holds only a ses..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=36 "System design big archive, Session, Cookie, JWT, Token, SSO, and OAuth 2.0 Explained in One Diagram, The session ID cookie beside the other ways a site keeps..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Cookies and sessions as one authentication mechanism, with session data on the server refere..."), [▶1](https://www.youtube.com/watch?v=sovAIX4doOE&t=255s "Hussein Nasser, HTTP Cookies Crash Course, Section 1: Creating Cookies, 4:15 to 14:38, Creating cookies, the first section of a course that goes on to their ..."), [▶2](https://www.youtube.com/watch?v=aUF2QCEudPo&t=70s "Hussein Nasser, SameSite Cookie Attribute Explained by Example (Strict, Lax, None & No SameSite), SameSite=Strict, 1:10 to 6:00, The strictest SameSite value..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06, section 6.2. Follows the admin login with `curl -c` and `-b` and a cookie jar file, where the POST ...")</sub> work only if the cookie domain matches the WebSocket host — unreliable in
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
