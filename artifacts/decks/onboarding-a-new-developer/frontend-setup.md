---
marp: true
theme: gaia
size: 16:9
paginate: true
footer: 'Attica Onboarding — Frontend Setup'
---

# Frontend Setup
## React 19 · Vite 7 · Material-UI

Get the frontend running at `localhost:5173` and talking to the backend.

---

## What You're Setting Up

```
Your machine
┌─────────────────────────────────────────┐
│  Node 16+  ·  npm 8+                    │
│                                         │
│  ┌───────────────────┐                  │
│  │  Vite dev server  │  :5173           │
│  │  React 19 + MUI   │ ◄── you're here  │
│  │  TailwindCSS      │                  │
│  └─────────┬─────────┘                  │
│            │ proxy (/api, /ws …)        │
│  ┌─────────▼─────────┐                  │
│  │  Django + Daphne  │  :8000           │
│  │  (must be running)│                  │
│  └───────────────────┘                  │
└─────────────────────────────────────────┘
```

**Prerequisite:** backend running on `:8000` before the login step.

---

## Why These Tools?

| Tool | Role | Why |
|---|---|---|
| **React 19** | UI framework | Component model, hooks, fast reconciler |
| **Vite 7** | Dev server + bundler | Sub-second HMR; proxy built in |
| **Material-UI 7** | Component library | Pre-built accessible components |
| **TailwindCSS 3** | Utility CSS | Fine-grained layout without custom CSS |
| **Axios** | HTTP client | Interceptor API for auto-refresh on 401 |
| **react-router-dom 7** | Client routing | SPA navigation without page reloads |

---

## Step 1 — Install Dependencies

```bash
cd frontend
npm install
```

**What this does:**
- Reads `package.json` (what to install) + `package-lock.json` (exact versions)
- Downloads ~200 packages into `node_modules/`

**Why `package-lock.json` matters:**
Two developers running `npm install` at different times get identical versions.
Without it, a minor version bump in a transitive dependency can break the build silently.

**Verify:** `node_modules/` folder exists, no red errors in terminal.

---

## Step 2 — The Vite Proxy

The most important thing to understand before starting the dev server.

```
Problem:
  Browser on :5173 → fetch('/api/events/') → backend on :8000
  ✗  CORS error — browser blocks cross-origin requests

Solution (already in vite.config.js):
  Browser on :5173 → fetch('/api/events/')
                          ↓
                    Vite intercepts
                          ↓
                    forwards to http://localhost:8000/api/events/
                          ↓
                    returns response to browser
  ✓  Browser only ever talks to :5173 — no cross-origin request
```

**No code change needed.** Proxy is pre-configured. This slide explains why it exists.

---

## Vite Proxy Config (for reference)

`frontend/vite.config.js`:

```javascript
proxy: {
  '/api':      'http://localhost:8000',   // REST API
  '/vendors':  'http://localhost:8000',   // vendor endpoints
  '/cart':     'http://localhost:8000',   // cart endpoints
  '/checkout': 'http://localhost:8000',   // checkout endpoints
  '/ws': {
    target: 'http://localhost:8000',
    ws: true,                             // enables WebSocket proxy
  },
}
```

`/ws` with `ws: true` is critical — without it, WebSocket connections to
`ws://localhost:5173/ws/...` fail silently. The browser opens the socket;
Vite upgrades the protocol and forwards to Django Channels on `:8000`.

---

## Step 3 — Start the Dev Server

```bash
npm run dev
```

Expected output:
```
  VITE v7.0.0  ready in 312 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**Hot Module Replacement (HMR):** Edit any `.jsx` or `.css` file — the browser
updates instantly without a full reload. State is preserved across most edits.

Now open **http://localhost:5173** in your browser.

---

## Step 4 — Auth & JWT

Login with the seeded credentials:

```
Username: e2e-organizer
Password: E2eOrganizerPass!23
```

**What happens under the hood:**

```
Login form
  │ POST /api/accounts/token/
  │ (proxied → backend :8000)
  ▼
Django returns:
  { access: "eyJ...", refresh: "eyJ..." }
  │
  ▼
AuthProvider stores in localStorage:
  key "tokens" = { access: "...", refresh: "..." }
  │
  ▼
Every subsequent API call:
  Authorization: Bearer <access_token>   ← added by Axios interceptor
```

**Access token:** 30 min · **Refresh token:** 7 days

---

## Step 5 — Verify

Open **DevTools (F12)** and check:

**Application → Local Storage → `tokens`**
```json
{ "access": "eyJhbGciOiJIUzI1NiIsInR5...", "refresh": "eyJhbGciO..." }
```

**Network → any API request → Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
```

**Network → WS tab**
```
ws://localhost:8000/ws/chat/rooms/<id>/?token=<jwt>   ← connected
```

If you see **401 on all requests:** access token expired → interceptor auto-refreshes
(check Network for a POST to `/api/accounts/token/refresh/`).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| CORS error in console | Proxy not active | Restart Vite: `Ctrl+C → npm run dev` |
| `net::ERR_CONNECTION_REFUSED` | Backend not running | `daphne -b 0.0.0.0 -p 8000 main.asgi:application` |
| Login returns 401 | `seed_e2e` not run | `python manage.py seed_e2e` on backend |
| `tokens` not in localStorage | Login POST failed silently | Check Network tab for POST to `/api/accounts/token/` |
| Port 5173 in use | Another Vite instance | Add `port: 5174` to `server:` in `vite.config.js` |
| WebSocket not connecting | `/ws` proxy missing | Check `vite.config.js` for `ws: true` entry |
