# Canonical Setup Sequence

Source of truth for all setup procedure diagrams, slides, and guides.
Verified against live codebase at commit `2ea72d0`.

---

## External Prerequisites

These must exist before either backend or frontend setup begins.

| Dependency | Minimum version | Verify |
|---|---|---|
| Python | 3.12 | `python --version` |
| Node.js | 16 | `node --version` |
| npm | 8 | `npm --version` |
| [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> | any | `redis-cli ping` → `PONG` |
| Git | any | `git --version` |

**Redis is required for both Django Channels (WebSocket) and the cache layer.**
Without Redis, `daphne` starts but [WebSocket connections](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> will fail silently.

**None of these come preinstalled on a bare machine.** This table only says what
must be *true* before the sequence below starts — it doesn't say how to get there.
For a Windows machine with nothing installed (no WSL2, no Python, no Node, no
Redis), see [the machine setup guide](../../../artifacts/notes/onboarding-a-new-developer/00-machine-setup.md), which
installs all five from scratch via WSL2/Ubuntu.

---

## Backend Setup Sequence

Entry state: repo cloned, Python 3.12 available, [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> running on `:6379`
Exit state: Django running on `:8000`, seeded with test data, WebSocket-capable

```
┌──────────────────────────────────────────────────────────┐
│  ENTRY: repo cloned, Python 3.12, Redis on :6379         │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 1 · Create virtual environment        │
│                                             │
│  python -m venv backend/venv               │
│                                             │
│  Creates: backend/venv/                    │
│  Purpose: isolates Python packages from     │
│           system Python                     │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 2 · Activate venv                     │
│                                             │
│  source backend/venv/bin/activate           │
│  (Windows: backend\venv\Scripts\activate)   │
│                                             │
│  Verify: prompt shows (venv) prefix         │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 3 · Install Python dependencies       │
│                                             │
│  cd backend/main                            │
│  pip install -r requirements.txt            │
│                                             │
│  Key packages installed:                    │
│  · Django 5.2.3                             │
│  · djangorestframework 3.16.0               │
│  · channels 4.2.2 + channels_redis 4.2.1   │
│  · daphne 4.2.1                             │
│  · djangorestframework-simplejwt 5.5.0      │
│  · django-redis 6.0.0                       │
│                                             │
│  Source file: backend/main/requirements.txt │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 4 · Run database migrations           │
│                                             │
│  python manage.py migrate                   │
│                                             │
│  Creates: backend/main/db.sqlite3           │
│  Applies: all 11 apps' migration files      │
│  Result: empty but schema-complete database │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 5 · Seed test data                    │
│                                             │
│  python manage.py seed_e2e                  │
│                                             │
│  Creates:                                   │
│  · User: e2e-organizer / E2eOrganizerPass!23│
│  · Sample events, vendors, artists          │
│                                             │
│  Source: events/management/commands/        │
│          seed_e2e.py                        │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 6 · Verify Redis connection           │
│                                             │
│  redis-cli ping   →  PONG                  │
│                                             │
│  Settings: CHANNEL_LAYERS uses              │
│  127.0.0.1:6379 (settings.py:96)           │
│  CACHE uses redis://127.0.0.1:6379/1       │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 7 · Start ASGI server (Daphne)        │
│                                             │
│  daphne -b 0.0.0.0 -p 8000 \               │
│    main.asgi:application                    │
│                                             │
│  Why Daphne (not runserver):                │
│  · runserver is HTTP-only                   │
│  · Daphne handles both HTTP + WebSocket     │
│  · asgi.py routes WS to ChatConsumer via   │
│    WebSocketJWTAuthMiddleware               │
│                                             │
│  Entry point: main/asgi.py → main/routing.py│
└─────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  EXIT: Django on :8000, seeded, WebSocket-capable        │
│                                                          │
│  Verify:                                                 │
│  · http://localhost:8000/api/        → DRF browser       │
│  · http://localhost:8000/admin/      → Django admin      │
│  · ws://localhost:8000/ws/chat/...   → WS available      │
└──────────────────────────────────────────────────────────┘
```

### Decision Points (for procedure diagram)

| Gate | Check | Fail path |
|---|---|---|
| After Step 2 | `(venv)` prefix visible in shell | Re-run activate command |
| After Step 3 | No pip errors; `daphne --version` works | Check Python version; retry pip |
| After Step 4 | No migration errors | Check `db.sqlite3` permissions; check settings |
| After Step 5 | Seed command prints "Done" or similar | Run `python manage.py createsuperuser` as fallback |
| After Step 6 | `redis-cli ping` → `PONG` | Install/start Redis: `sudo systemctl start redis` |
| After Step 7 | Browser reaches `/api/` | Check port 8000 not in use; check ASGI settings |

---

## Frontend Setup Sequence

Entry state: backend running on `:8000`, Node 16+ available
Exit state: React on `:5173`, logged in as `e2e-organizer`, API calls succeeding

```
┌──────────────────────────────────────────────────────────┐
│  ENTRY: backend on :8000, Node 16+, npm 8+               │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 1 · Go to frontend directory          │
│                                             │
│  cd frontend                                │
│                                             │
│  Contains: package.json, vite.config.js,   │
│  src/ (React components), public/          │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 2 · Install dependencies              │
│                                             │
│  npm install                                │
│                                             │
│  Reads: package.json + package-lock.json    │
│  Creates: node_modules/ (~200+ packages)    │
│                                             │
│  Key packages installed:                    │
│  · react 19.1 + react-dom                  │
│  · vite 7.0 + @vitejs/plugin-react         │
│  · @mui/material 7.1 (Material-UI)         │
│  · tailwindcss 3.4                          │
│  · axios (HTTP client)                      │
│  · react-router-dom 7.6                     │
│  · jwt-decode                               │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 3 · Inspect Vite proxy config         │
│                                             │
│  File: frontend/vite.config.js              │
│                                             │
│  proxy: {                                   │
│    '/api':      'http://localhost:8000',    │
│    '/vendors':  'http://localhost:8000',    │
│    '/cart':     'http://localhost:8000',    │
│    '/checkout': 'http://localhost:8000',    │
│    '/ws': {                                 │
│      target: 'http://localhost:8000',       │
│      ws: true,                              │
│    },                                       │
│  }                                          │
│                                             │
│  Why this exists:                           │
│  Browser blocks cross-origin requests       │
│  (CORS). Frontend on :5173, backend on      │
│  :8000 = different origins. Vite intercepts │
│  /api/* requests and forwards them to       │
│  backend — browser never sees the cross-   │
│  origin request, no CORS error.            │
│                                             │
│  '/ws' with ws:true routes WebSocket        │
│  connections through the same proxy.        │
│                                             │
│  No changes needed — pre-configured.        │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 4 · Start Vite dev server             │
│                                             │
│  npm run dev                                │
│                                             │
│  Expected output:                           │
│  VITE v7.0.0  ready in X ms               │
│  ➜  Local:   http://localhost:5173/         │
│                                             │
│  Features active:                           │
│  · Hot Module Replacement (HMR) — edit a   │
│    file, browser updates instantly          │
│  · Proxy active for /api, /ws, etc.        │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 5 · Open in browser                   │
│                                             │
│  http://localhost:5173                      │
│                                             │
│  Should see: login page                     │
│  Should NOT see: CORS errors in console     │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 6 · Login with seeded credentials     │
│                                             │
│  Username: e2e-organizer                    │
│  Password: E2eOrganizerPass!23              │
│                                             │
│  What happens:                              │
│  1. Form POSTs to /api/accounts/token/      │
│     (proxied → backend :8000)               │
│  2. Django returns access + refresh token   │
│  3. AuthProvider stores in localStorage:    │
│     key "tokens" = { access, refresh }      │
│  4. App redirects to dashboard / events     │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│  Step 7 · Verify everything works           │
│                                             │
│  DevTools (F12) checks:                     │
│  · Application → Local Storage → "tokens"  │
│    should be a JSON object with access +   │
│    refresh fields                           │
│  · Network → API calls show 200 OK         │
│  · Network → each request has header:      │
│    Authorization: Bearer <access_token>     │
│  · Network → WS tab → connection to         │
│    ws://localhost:8000/ws/chat/...          │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  EXIT: React on :5173, logged in, API + WS working       │
└──────────────────────────────────────────────────────────┘
```

### Decision Points (for procedure diagram)

| Gate | Check | Fail path |
|---|---|---|
| After Step 2 | `node_modules/` created, no npm errors | Delete `node_modules/`, clear npm [cache](../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>, retry |
| After Step 3 | `vite.config.js` has all 5 [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> entries | File is pre-configured; if missing, see backend guide |
| After Step 4 | Port 5173 output in terminal | Check port in use: `lsof -i :5173`; change port in vite.config.js |
| After Step 5 | No [CORS](../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> errors in DevTools console | Proxy not working? Restart Vite. Backend not on :8000? |
| After Step 6 | Redirect after login | Seed not run? `python manage.py seed_e2e` on backend |
| After Step 7 | `tokens` key in localStorage | Check Network tab for failed POST to `/api/accounts/token/` |

---

## External Dependency: Redis

[Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> is required before starting the backend. It serves two roles:

| Role | Config in settings.py | DB |
|---|---|---|
| Channel layer ([WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> [pub/sub](../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Publish-Subscribe.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=196 "System design interview, chapter 12, Design a chat system, Online status fanout, Works one case: user A's presence change is published to three channels, A-B..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=69 "System design big archive, SQS vs SNS vs EventBridge vs Kinesis, SNS as the managed publish/subscribe service that sends one message on a topic to many subsc..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=253 "System design interview, chapter 15, Design Google Drive, Notification service, The notification service as a publisher/subscriber system that tells every re..."), [▶1](https://www.youtube.com/watch?v=O1PgqUqZKTA&t=672s "Hussein Nasser, Publish-Subscribe Architecture (Explained by Example), Pub/sub pattern, 11:12 to 17:50, The pattern drawn on an example system, after the cha..."), [▶2](https://www.youtube.com/watch?v=nH4qjmP2KEE&t=215s "ByteByteGo, Top 7 Most-Used Distributed System Patterns, Pubsub, 3:35 to 4:18, Pub/sub as one of seven distributed system patterns, in under a minute. Chapte..."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. One `group_send` from the shell lands in two open tabs throug...")</sub>) | `CHANNEL_LAYERS` → `127.0.0.1:6379` | 0 (default) |
| Django [cache](../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> | `CACHES` → `redis://127.0.0.1:6379/1` | 1 |

**Start Redis (Linux):**
```bash
sudo systemctl start redis
redis-cli ping    # → PONG
```

**Start Redis (Mac with Homebrew):**
```bash
brew services start redis
redis-cli ping    # → PONG
```

**Start Redis (Windows / WSL2):**
```bash
sudo service redis-server start
redis-cli ping    # → PONG
```

If Redis is not running:
- [HTTP](../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> API still works (DRF does not require Redis)
- WebSocket connections will fail or hang
- Cache-dependent views may error

---

## Complete Dependency Order

```
Redis (external)
    └── Backend (Django / Daphne)  :8000
            └── Frontend (React / Vite)  :5173
```

[Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> must be up before Daphne starts.
Backend must be up before the frontend login step.
Frontend's npm install and Vite start are independent of backend state.

---

## Key File Locations

| File | Purpose |
|---|---|
| `backend/main/requirements.txt` | Python package list |
| `backend/main/main/settings.py` | Django config ([Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> URLs, [JWT](../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> lifetimes, INSTALLED_APPS) |
| `backend/main/main/asgi.py` | ASGI entry point; wires [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> [middleware](../../../../../Obsidian/Information%20Technology/System%20Design/APIs/Middleware.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=53 "System design interview, chapter 4, Design a rate limiter, Works a rate limiter middleware with numbers: an API allows 2 requests a second, a client sends 3,..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=310 "Systems analysis and design, chapter 8, Architecture design, client-server architectures, The older, wider sense of the word: system software installed on bo..."), [▶1](https://www.youtube.com/watch?v=lY6icfhap2o&t=470s "Web Dev Simplified, Learn Express Middleware In 14 Minutes, Authentication middleware, 7:50 to 14:48, An authentication middleware written in Express, after ..."), [▶2](https://www.youtube.com/watch?v=lY6icfhap2o&t=130s "Web Dev Simplified, Learn Express Middleware In 14 Minutes, What is middleware, 2:10 to 3:20, What middleware is, before the examples. Chapter-timed."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/12-traefik-routes-and-tokens.md "Traefik: routes and tokens, system-design/foundations, plan 12. A ForwardAuth middleware attached to the gateway's four routers hands each request's headers ...")</sub> |
| `backend/main/main/routing.py` | WebSocket URL routing (chat + notifications) |
| `backend/main/events/management/commands/seed_e2e.py` | Seed command source |
| `frontend/package.json` | Node package list |
| `frontend/vite.config.js` | Dev server + [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> config |
| `frontend/src/AuthProvider.jsx` | JWT token management, refresh logic |
| `frontend/src/utils/useAxios.js` | Axios instance + 401 interceptor |
