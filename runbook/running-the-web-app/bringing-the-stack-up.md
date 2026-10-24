# 🔧 Bringing the stack up

Four processes, started by hand, in order. Nothing starts itself and nothing tells you when a piece
is missing, which is why two of these recipes are about diagnosing silence rather than starting
something.

Where these processes live and why there are four is in
[Environment § Execution model](../../environment/overview.md#execution-model).

## Contents

- [1. Bring the whole stack up](#1-bring-the-whole-stack-up)
- [2. Start the backend with websockets](#2-start-the-backend-with-websockets)
- [3. Find out why half the app is failing](#3-find-out-why-half-the-app-is-failing)
- [4. Drain the outbox](#4-drain-the-outbox)

## 1. Bring the whole stack up

Navigation: 📋 [Contents](#contents) | [Next](#2-start-the-backend-with-websockets) ➡️

`unverified` (assembled from the repository and [the original QA guide](../sources/booking-test-guide-original.md); not run end to end this session)

Four terminals. Order matters: [Redis](../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> first, or the backend fails on its first cached read rather
than at startup.

**Terminal 1, Redis**

```bash
redis-server
```

✅ It prints a banner ending `Ready to accept connections`. Check it from another shell with
`redis-cli ping`, which answers `PONG`.

❌ `Could not create server TCP listening socket *:6379: bind: Address already in use` means it is
already running. That is fine; carry on.

**Terminal 2, the backend**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
daphne -b 0.0.0.0 -p 8000 main.asgi:application
```

✅ `Listening on TCP address 0.0.0.0:8000`.

Use `daphne`, not `runserver`. See [recipe 2](#2-start-the-backend-with-websockets) for why.

**Terminal 3, the frontend**

```bash
cd /home/molef/Work/attica/frontend
npm run dev
```

✅ Vite prints `Local: http://localhost:5173/`.

⚠️ **Read the port it actually printed.** If 5173 was taken, Vite silently uses 5174 and part of the
app will fail with no useful error. See [recipe 3](#3-find-out-why-half-the-app-is-failing).

**Terminal 4, the outbox worker, only when you are exercising bookings**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
python manage.py run_outbox_worker
```

Skip it and everything still appears to work. Notifications just never arrive. See
[recipe 4](#4-drain-the-outbox).

<details>
<summary><b>Why four processes and not one</b></summary>

Django serves [HTTP](../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub>, Daphne adds the ASGI layer that carries [websockets](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub>, Vite serves the frontend
and proxies to Django, and Redis carries both the websocket channel layer and the page [cache](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>. The
[outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker is a fifth thing: a plain management command that turns queued rows into
notifications. None of them supervises any other, so a missing one is silent by construction.
</details>

## 2. Start the backend with websockets

Navigation: ⬅️ [1. Bring the whole stack up](#1-bring-the-whole-stack-up) | 📋 [Contents](#contents) | [Next](#3-find-out-why-half-the-app-is-failing) ➡️

`unverified`

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
daphne -b 0.0.0.0 -p 8000 main.asgi:application
```

✅ `Listening on TCP address 0.0.0.0:8000`, and a browser at `http://localhost:8000/api/events/`
returns JSON.

❌ Chat and notifications connect and immediately drop, with nothing useful in the server log. You
started `python manage.py runserver`, which serves [HTTP](../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> only. There is no error message for this;
the symptom is the diagnosis.

❌ `ConnectionRefusedError` on the first request that touches the [cache](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> means [Redis](../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> is not up. Start
it (recipe 1) and restart the backend.

<details>
<summary><b>What Daphne adds</b></summary>

`main/asgi.py` wires a `ProtocolTypeRouter` with two branches: `http` goes to Django's normal
handler, `websocket` goes through `WebSocketJWTAuthMiddleware` into the chat and notification
consumers. `runserver` only ever serves the first branch.
</details>

## 3. Find out why half the app is failing

Navigation: ⬅️ [2. Start the backend with websockets](#2-start-the-backend-with-websockets) | 📋 [Contents](#contents) | [Next](#4-drain-the-outbox) ➡️

`unverified`

**The symptom.** Most of the app works. Some pages fail to load data. The browser console shows
[CORS](../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> errors on a few requests and nothing wrong with the rest.

**The cause, almost always.** Vite bound a port that is not in the backend's allowed origins.

**Check it, read-only**

```bash
# what port did Vite actually take?
ss -ltn | grep -E '5173|5174'
```

Then in Chrome DevTools, Network tab, filtered to Fetch/XHR with Preserve log on, reload and look
at the failing requests.

✅ You will see two kinds of request: relative ones (`/api/...`) that succeed through the [proxy](../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub>, and
at least one to `http://127.0.0.1:8000` that fails CORS. That split is the diagnosis.

**The fix, either one**

Free port 5173 and restart Vite, or extend the allowed origins:

```bash
export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000"
```

then restart the backend.

> 📷 **Screenshot wanted**: the Network tab showing one CORS-failed request beside one that
> succeeded through the proxy. Save as `images/stack/01-cors-failure-beside-success.png`.

<details>
<summary><b>Why only some requests fail</b></summary>

The frontend has two [HTTP](../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> clients. Most of the app calls relative URLs that the Vite proxy
forwards, so the browser never sees a cross-origin request. But `useAxios` hardcodes
`baseURL = 'http://127.0.0.1:8000'` and bypasses the proxy, so those calls are cross-origin and need
an explicit CORS allowance. The default allows ports 5173 and 3000 only. Full detail in
[Environment § Access paths](../../environment/overview.md#access-paths).
</details>

## 4. Drain the outbox

Navigation: ⬅️ [3. Find out why half the app is failing](#3-find-out-why-half-the-app-is-failing) | 📋 [Contents](#contents)

`ran 2026-08-22`

**The symptom.** Bookings and scheduling actions succeed, every API response looks right, and no
notification ever arrives. There is no error anywhere.

**Check first, read-only**

```bash
cd /home/molef/Work/attica/backend/main
python3 -c "
import sqlite3
c = sqlite3.connect('db.sqlite3')
for r in c.execute('select status, count(*) from scheduling_outboxevent group by status'):
    print(r[0], r[1])
"
```

Anything above zero in `pending` means rows are queued and nobody is consuming them.

**Then drain it**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
python manage.py dispatch_scheduling_outbox     # one pass
# or, to keep consuming:
python manage.py run_outbox_worker
```

✅ Real run, 2026-08-22. Before, 23 pending and 8 sent. Then:

```
Outbox dispatched: processed=23 failed=0 dead_lettered=0
```

After: 31 sent, nothing pending. **The dispatcher works.** A backlog here means nobody ran it, not
that anything is broken, which is worth knowing before you go looking for a fault.

❌ If `pending` does not move, the dispatch path itself is the problem, not the worker. Note that
the booking-request write path never calls `group_send` at all: `_create_in_app_notification`
(`backend/main/scheduling/services.py:2658`) writes a database row and stops. That is a known gap,
recorded in [Environment § Known gaps](../../environment/overview.md#known-gaps--non-obvious-constraints).

<details>
<summary><b>Why there is a queue at all</b></summary>

Writes append a row to `scheduling_outboxevent` inside the same transaction as the booking, so a
notification can never be sent for a booking that rolled back. A separate process turns those rows
into notifications afterwards. The cost of that safety is that the second process is a thing
someone has to remember to start.
</details>

📊 Drawn in [Every event is written and none is sent](artifacts/scenes/scheduling-process-flows/figure-explainer.md#figure-5-every-event-is-written-and-none-is-sent).
