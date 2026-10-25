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
| **Vite 7** | Dev server + bundler | Sub-second HMR; [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> built in |
| **Material-UI 7** | Component library | Pre-built accessible components |
| **TailwindCSS 3** | Utility CSS | Fine-grained layout without custom CSS |
| **Axios** | [HTTP](../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> client | Interceptor API for auto-refresh on 401 |
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

**No code change needed.** [Proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> is pre-configured. This slide explains why it exists.

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

`/ws` with `ws: true` is critical — without it, [WebSocket connections](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> to
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
| [CORS](../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> error in console | [Proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> not active | Restart Vite: `Ctrl+C → npm run dev` |
| `net::ERR_CONNECTION_REFUSED` | Backend not running | `daphne -b 0.0.0.0 -p 8000 main.asgi:application` |
| Login returns 401 | `seed_e2e` not run | `python manage.py seed_e2e` on backend |
| `tokens` not in localStorage | Login POST failed silently | Check Network tab for POST to `/api/accounts/token/` |
| Port 5173 in use | Another Vite instance | Add `port: 5174` to `server:` in `vite.config.js` |
| [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> not connecting | `/ws` proxy missing | Check `vite.config.js` for `ws: true` entry |
