# How does Attica actually work, at the level of its running parts?

This pile answers what runs when Attica runs and which part talks to which. The current answer is ten
parts on one machine: a React app in the browser, the Vite dev server, one Django backend under
Daphne, [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub>, SQLite, a media folder on disk, the [outbox](../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker, and three outside services, two of
which only receive traffic when a setting turns them on.

## What is in here

One high-level design diagram (the current version and each dated version), the spec file it is
drawn from, and the stills of its scene page: one light and one dark screenshot per anchor.

## The high-level design

### attica-high-level-design-explainer

![](attica-high-level-design-explainer.svg)

**What it shows**

Ten boxes, read left to right from the browser to the data. The colour and the small word on top of
each box say what kind of part it is (client, dev [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub>, backend, data store, [cache](../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>, worker, third
party), and a logo marks every box that is a named product. A solid arrow is a request that waits for
an answer, a dashed arrow is asynchronous, and a dotted arrow only carries traffic when a setting
enables it. The two arrows leaving the web app are the two ways it reaches the backend: through the
Vite proxy, and straight to `127.0.0.1:8000` from `useAxios`.

**How we got this image**

We read `environment/overview.md` and checked each part against the code on 2026-10-24:
`frontend/package.json`, `frontend/vite.config.js`, `backend/main/main/settings.py`, the chat and
notification consumers, `scheduling/management/commands/run_outbox_worker.py` and the [outbox](../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatch
in `scheduling/services.py`. The parts and arrows were written into
`attica-high-level-design-explainer.json` and drawn by the `hld-diagram` skill's
`draw_hld.py`, which inlines the product logos from Simple Icons 13.21.0. The same picture is
published as a private page at https://claude.ai/artifact/GLg4UBzHQCdY4U9kteM4po, whose closed
disclosure lists the file and line behind every box.

**What it lets you say**

Attica runs as four hand-started processes ([Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub>, the Daphne backend, the Vite dev server, the
outbox worker) around one SQLite file, with Redis carrying both the [websocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> channel layer (db 0)
and the page cache (db 1).

**What it cannot say**

It shows the local development stack only; nothing here is deployed. The [REST API](../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub>, the WebSocket
consumers and the Django admin share the one backend box, so it cannot show which of them a request
reaches. It does not show that the booking-request path writes its notification row without pushing
it to the channel layer; that gap is in `environment/overview.md` under known gaps. [Webhook](../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> targets are
drawn because the delivery code exists, but `SCHEDULING_WEBHOOK_TARGETS` is empty by default. Stripe
has no box because the code only mentions it in comments.

**Where it came from and what judged it**

Built from the repository at commit a85cc0c plus its uncommitted working tree. No review file judged
it.

**Held since 2026-10-24.** Draws the system `environment/overview.md` describes in words; kept until a
one-line link to it lands in that file's index under "Pictures", which this filing was not allowed to
write.

### The scene's stills

The scene page opens every box into its inside, down to code and database rows, and each level has an
anchor. `attica-high-level-design-explainer-stills/` holds one screenshot per anchor in light and dark
(20 anchors, 40 stills), taken headless by the `hld-diagram` skill's `shoot_anchors.py` from the built
page; its own card lists every anchor with what it shows. A runbook step can embed a still and link to
the same anchor of the live page. This one is the inside of the Django backend:

<a href="attica-high-level-design-explainer-stills/attica-high-level-design-explainer__backend-inside-light.png"><img src="attica-high-level-design-explainer-stills/attica-high-level-design-explainer__backend-inside-light.png" width="200" alt="The inside of the Django backend: REST API, WebSocket consumers and Booking services between the Vite dev server and SQLite and Redis"></a>

### The scene, explained

`attica-high-level-design-explainer.md` walks the scene's levels in order, one section a level with its
still linking to the same place on the live page, and says what each part does and where that was
read. It is written by the `hld-diagram` skill's `write_explainer.py` from the built page's own data,
so it cannot disagree with the scene, and concept-link then links its terms (Redis, WebSocket, REST
API, JWT, ORM, outbox, webhook, middleware, cache, foreign key) to their concept cards, each with its
textbook pages, videos and system-design plans. Every term it names now reaches a card: the Django, Channels, channel-layer,
serializer, ASGI, SQLite, Vite, Sentry, OpenStreetMap, SQL join and React cards were built for it on 2026-10-27, so its
"No card yet" section is empty.

### Learning a part on its own

`attica-high-level-design-explainer-learn.md` holds a walk in five stages (get it, read first, start
it alone, poke it, tear it down) for each of Attica's 9 parts that run or that it calls: six get a
`/plumb` walk on a practice copy, and the three outside services (OpenStreetMap, Sentry, the webhook
targets) get a walk that reads their docs and calls a test account. The same stages open on the page
from each panel's "Learn it on its own" button, or straight at `#<box>-learn`. Redis has exact stages
(Docker Desktop with WSL integration, a practice Redis on port 6380, four commands with what each
prints, and the 6 channel-layer groups and 4 cache keys Attica's code uses); the other eight are
drafts whose first steps find the install page and the docs.

<a href="attica-high-level-design-explainer-stills/attica-high-level-design-explainer__redis-learn-light.png"><img src="attica-high-level-design-explainer-stills/attica-high-level-design-explainer__redis-learn-light.png" width="400" alt="The Redis panel with Learn Redis on its own open: four numbered cards to start a practice copy, copy the plumb prompt, come back, and tear it down"></a>


### Versions

Each time a part is added or removed, the diagram is redrawn from the spec file and the new picture
is kept here with its date, so the build's growth stays visible.

**2026-10-24: first version**

![](attica-high-level-design-explainer__2026-10-24.svg)

Ten boxes and ten arrows, drawn from the repository as it stood that day.

**2026-10-27: second version, the scene**

![](attica-high-level-design-explainer__2026-10-27.svg)

The same ten boxes and ten arrows at the top, so the top picture is unchanged; what was added is
everything below it. The picture is now the top level of an interactive page,
`attica-high-level-design-explainer-scene.html`, built by the `hld-diagram` skill's scene mode from
the spec's levels (`attica-high-level-design-explainer.json`), `hld-overrides.json`, the runbook, the
code and the database: a start-up path of five steps read from the runbook, a panel of commands on
every box from 53 of the runbook's 54 code blocks, and 17 levels below the boxes (the inside of the
Django backend, the sequence and the tables of `create_request` read statically from
`scheduling/services.py`, and the inside of SQLite with one level per app, every personal value
hidden).

Published on 2026-10-27 to https://claude.ai/artifact/GLg4UBzHQCdY4U9kteM4po as that page's version
7, replacing the hand-built prototype.
