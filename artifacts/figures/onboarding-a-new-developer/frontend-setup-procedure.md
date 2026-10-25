# Frontend Setup — Procedure Diagram

How the Attica React/Vite frontend goes from a fresh clone to a logged-in browser session.
One fork point: whether the backend is already running. Three decision gates: Node version,
[proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> config, and login credentials. The Vite proxy is highlighted because it is the most
commonly misunderstood step.

```mermaid
flowchart TD
    START([Start\ngit clone done · backend on :8000\nNode 16+ installed])

    START --> CDFE[cd frontend]

    CDFE --> NODECHECK{node --version\n≥ 16?}

    NODECHECK -->|No| INSTALLNODE[Install Node 16+\nnodejs.org or nvm]
    NODECHECK -->|Yes| NPMI

    INSTALLNODE --> NPMI[Install dependencies\nnpm install\nReads package.json + package-lock.json\n→ creates node_modules/]

    NPMI --> PROXY[Inspect Vite proxy config\nopen frontend/vite.config.js]

    PROXY --> PROXYCHECK{Proxy entries\npresent?}

    PROXYCHECK -->|Missing| PROXYNOTE["Add to vite.config.js:\nproxy: {\n  '/api':     'http://localhost:8000',\n  '/vendors': 'http://localhost:8000',\n  '/cart':    'http://localhost:8000',\n  '/checkout':'http://localhost:8000',\n  '/ws':      { target: 'http://localhost:8000', ws: true }\n}"]
    PROXYCHECK -->|Present — no change needed| VITESTART

    PROXYNOTE --> VITESTART[Start Vite dev server\nnpm run dev\n→ http://localhost:5173\nHMR + proxy active]

    VITESTART --> BROWSER[Open browser\nhttp://localhost:5173]

    BROWSER --> CORSCHECK{Console errors?\nCORS / network fail?}

    CORSCHECK -->|Yes| CORSFIX["Backend not running or proxy misconfigured\n① Check: daphne running on :8000\n② Restart Vite: Ctrl+C → npm run dev"]
    CORSCHECK -->|No| LOGIN

    CORSFIX --> LOGIN

    LOGIN["Login\nUsername: e2e-organizer\nPassword: E2eOrganizerPass!23\n\nPOSTs to /api/accounts/token/\n(proxied → backend :8000)"]

    LOGIN --> LOGINCHECK{Login\nsucceeds?}

    LOGINCHECK -->|No — 401| SEEDFIX[Run on backend:\npython manage.py seed_e2e]
    LOGINCHECK -->|Yes| TOKENS

    SEEDFIX --> LOGIN

    TOKENS["Tokens stored in localStorage\nkey: 'tokens'\n{ access: '...jwt...', refresh: '...jwt...' }\n\nAccess token: 30 min\nRefresh token: 7 days"]

    TOKENS --> VERIFY["Verify in DevTools (F12)\n\nApplication → Local Storage → 'tokens'\nNetwork → API calls → 200 OK\nNetwork → each request has:\n  Authorization: Bearer <access_token>\nNetwork → WS tab → WebSocket connected"]

    VERIFY --> DONE([Frontend running\nlocalhost:5173\nLogged in · API + WebSocket working])
```

---

## Proxy Inset — Why This Step Exists

```
WITHOUT proxy:                        WITH Vite proxy:

Browser (5173)                        Browser (5173)
  │                                     │
  ├─ fetch('/api/events/')              ├─ fetch('/api/events/')
  │                                     │        │
  │  ← CORS ERROR                       │   Vite dev server intercepts
  │    "blocked by CORS policy"         │   forwards to http://localhost:8000/api/events/
  │    (browser sees cross-origin       │        │
  │     5173 → 8000 request)            │   Django responds 200
  ✗                                     │        │
                                        │   Vite returns response to browser
                                        ✓   (browser only ever talks to :5173)
```

**The fix is already in `vite.config.js` — no code change is needed.** This step is
"inspect" not "configure". A new developer needs to understand it exists so they know
where to look when something breaks.

**The `/ws` [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> entry** is equally important: [WebSocket connections](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> to
`ws://localhost:5173/ws/chat/rooms/<id>/` are forwarded to `ws://localhost:8000/ws/...`
with `ws: true` enabling protocol upgrade. Without it, WebSocket connections fail silently
in the Channels consumer.

---

**Caption:** Frontend setup from a fresh clone. Two fork points: Node version check (install
if needed) and proxy presence (already correct in the repo). Two failure recovery loops:
[CORS](../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> error → check backend/restart Vite; login failure → re-run seed_e2e. The linear spine
is: npm install → npm run dev → login → verify.
