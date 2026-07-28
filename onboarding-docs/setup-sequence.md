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
| Redis | any | `redis-cli ping` → `PONG` |
| Git | any | `git --version` |

**Redis is required for both Django Channels (WebSocket) and the cache layer.**
Without Redis, `daphne` starts but WebSocket connections will fail silently.

**None of these come preinstalled on a bare machine.** This table only says what
must be *true* before the sequence below starts — it doesn't say how to get there.
For a Windows machine with nothing installed (no WSL2, no Python, no Node, no
Redis), see [guides/00-machine-setup.md](guides/00-machine-setup.md), which
installs all five from scratch via WSL2/Ubuntu.

---

## Backend Setup Sequence

Entry state: repo cloned, Python 3.12 available, Redis running on `:6379`
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
| After Step 2 | `node_modules/` created, no npm errors | Delete `node_modules/`, clear npm cache, retry |
| After Step 3 | `vite.config.js` has all 5 proxy entries | File is pre-configured; if missing, see backend guide |
| After Step 4 | Port 5173 output in terminal | Check port in use: `lsof -i :5173`; change port in vite.config.js |
| After Step 5 | No CORS errors in DevTools console | Proxy not working? Restart Vite. Backend not on :8000? |
| After Step 6 | Redirect after login | Seed not run? `python manage.py seed_e2e` on backend |
| After Step 7 | `tokens` key in localStorage | Check Network tab for failed POST to `/api/accounts/token/` |

---

## External Dependency: Redis

Redis is required before starting the backend. It serves two roles:

| Role | Config in settings.py | DB |
|---|---|---|
| Channel layer (WebSocket pub/sub) | `CHANNEL_LAYERS` → `127.0.0.1:6379` | 0 (default) |
| Django cache | `CACHES` → `redis://127.0.0.1:6379/1` | 1 |

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
- HTTP API still works (DRF does not require Redis)
- WebSocket connections will fail or hang
- Cache-dependent views may error

---

## Complete Dependency Order

```
Redis (external)
    └── Backend (Django / Daphne)  :8000
            └── Frontend (React / Vite)  :5173
```

Redis must be up before Daphne starts.
Backend must be up before the frontend login step.
Frontend's npm install and Vite start are independent of backend state.

---

## Key File Locations

| File | Purpose |
|---|---|
| `backend/main/requirements.txt` | Python package list |
| `backend/main/main/settings.py` | Django config (Redis URLs, JWT lifetimes, INSTALLED_APPS) |
| `backend/main/main/asgi.py` | ASGI entry point; wires WebSocket middleware |
| `backend/main/main/routing.py` | WebSocket URL routing (chat + notifications) |
| `backend/main/events/management/commands/seed_e2e.py` | Seed command source |
| `frontend/package.json` | Node package list |
| `frontend/vite.config.js` | Dev server + proxy config |
| `frontend/src/AuthProvider.jsx` | JWT token management, refresh logic |
| `frontend/src/utils/useAxios.js` | Axios instance + 401 interceptor |
