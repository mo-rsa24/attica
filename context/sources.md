# 📚 Sources: Attica

Everything outside this repository that this folder draws on. Cited from provenance tables as
`sources.md § N`.

## 1. The event-creation flow map

**What it is.** A step-by-step recording of the event-creation wizard driven live in a browser on
2026-08-16: the click path, every background request with its method, endpoint, payload and status,
the backend handler as `file:line`, and the services each handler touches.

**Where it lives.** `/home/molef/goal-setting/learning/attica-event-creation/flow-map.md`, in the
learning journey about this repository. Outside this git repository and not under version control.

**Who wrote it.** Produced by an automated mapping session, reviewed by the product owner.

**How far to trust it.** Good on code location, and checked: 40 of its 41 `file:line` references
resolve to exactly the function or class it names. The remaining one is a filename written without
its app prefix and resolves elsewhere in the same document.

**One claim in it is wrong.** Step 0 states that `frontend/vite.config.js` has no `/ws` [proxy](../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> rule
and that [websockets](../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> are therefore dead in development. That rule has been in the file since
2026-01-27. Anything read from this document is worth a spot check against the repository before it
is marked verified.

**Read on** 2026-08-22.

## 2. The onboarding source documents

**What it is.** Four documents written for a developer joining the project cold: a consolidated
reference, the setup command sequence, the design decisions behind the architecture, and an entity
map of the core models.

**Where it lives.** `plans/onboarding-docs/` in this repository. Inside the repo rather than outside it,
registered here because this folder cites it and because it is a written account rather than code.

**How far to trust it.** Written by reading the codebase, not by driving the system. Its `Django
5.1` claim is wrong in four places; the version is 5.2.3.

**Read on** 2026-08-22.

## 3. The repository itself

**What it is.** `/home/molef/Work/attica` at commit `d53df63`.

**How far to trust it.** It is the system. Anything marked ✅ in this folder from a code read names
the file and line, and anything marked 🔍 was read out of the schema and confirmed by nobody.

**Read on** 2026-08-22.
