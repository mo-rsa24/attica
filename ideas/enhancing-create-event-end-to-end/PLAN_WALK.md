# Plan walk: enhancing create event end to end

**Compiled.** Seven scopes, twenty plan files, under one parent. The runbook is at the end of this
file. `fixing-create-event` finishes before any of it starts.

## The intention

Every step of the create-event flow works well from the backend, the frontend and under load; a
person can log in as any role using credentials written down in one place; availability and booking
requests behave predictably; and there are runbooks covering every role's path through the flow and
every way to test it.

## Verb set

enhance · new scope · fold in · runbook only · measure first · look first

Every group leaves with its own runbook pair: how to walk it by hand, and how to prove it works.

## Groups

| # | Group | Count | The one question that decides it | State |
|---|---|---|---|---|
| 1 | Credentials and roles: the way in | 5 gated, 2 assigned | Which roles exist, and who is seeded for each? | settled |
| 2 | The eight steps as they stand | 11 screens | What does each step already do, back and front? | settled |
| 3 | Availability and the booking request, end to end | 10 models | Where does an availability answer come from, and is it right? | settled |
| 4 | The gaps: what must exist for the flow to be seamless | 3 plans | Which missing thing blocks a person moving from one step to the next? | settled |
| 5 | Moving through it: navigation, resuming a draft, and what the interface does while it waits | 3 plans | Can a person leave, come back, go back a step, and see where they are? | settled |
| 6 | What it runs on: indexes, queues, [caching](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>, delivery | 3 plans | Which measured problem demands this, and what is the number? | settled |
| 7 | The system drawn in layers | 1 map | What are the tiers, and what crosses between them? | settled |

## Ledger

### Group 6: what it runs on — **new scope, small, mostly measure first**

**What was found.** `scheduling/models.py` alone declares 52 indexes, so indexing is not a gap. The
[outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> queue is already implemented (`run_outbox_worker`, `dispatch_scheduling_outbox`) and [Redis](../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> is
already the channel layer and the [cache](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>, so the missing piece is a runner, not a queue technology. A
[CDN](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Content%20Delivery%20Network.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=17 "System design interview, chapter 1, Content delivery network (CDN), Works one image request step by step (miss at the CDN, fetch from the origin, cache with ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=302 "System design big archive, Where do we cache data?, The CDN as the second caching layer after the browser, serving static resources from a nearby node."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=248 "System design big archive, 8 system design concepts explained in 1 diagram, A CDN named as the way to cut latency, the delay a user feels, by serving from se..."), [▶1](https://www.youtube.com/watch?v=RI9np1LWzqw&t=0s "ByteByteGo, What Is A CDN? How Does It Work?, 0:00 to 4:23, A short animated explainer of what a CDN is and how a request reaches the edge. Whole video."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=306s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Pull-based and Push-based CDNs, 5:06 to 5:51, The two ways files reach the edge: fetched on the first ..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache standing in for the CDN answers the catalogue page itself on the second r...")</sub> has no measured problem: the dev database is 2.2MB and media is on local disk. Nothing points at
NoSQL.

**One real finding, correctness rather than speed.** `finalize_draft_bookings` and
`_lock_overlapping_slots` guard against [double-booking](../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub> with `select_for_update`. SQLite has no
row-level locking, so that guard is weaker than it reads.

**Plan A, get the numbers first.** Query counts per wizard step, the cost of the four-times fetch,
and enriched availability search behaviour at realistic data volume rather than nine seeded
providers.

**Plan B, the database that can actually lock.** Postgres, then a concurrent test proving the
double-booking guard holds. Justified now, on correctness, without waiting for Plan A.

**Plan C, a holding file for the rest.** NoSQL, CDN, networking, caching: one line each naming the
measured number that would justify it. Nothing planned until a number appears.

**Not here on purpose.** Running the outbox worker is group 3's Plan A.

### Group 5: moving through it — **new scope, three plan files**

Definition of done: a person always knows where they are and whether their work is safe.

**What was found.** `framer-motion` is used in seventeen files including five of the eight step
files; steps 6, 7 and 8 have none. No `CircularProgress` or `Skeleton` in any step file or in the
layout. Saving state is shown on some buttons (`disabled={isSaving}` in steps 3 and 5) and not
others (`disabled={nextDisabled}` in step 1). `ListingWizardLayout.jsx:80` resumes from
`current_step` only when the URL carries no step, so a direct link to `/listing/35/step5` renders
step 5 wherever the draft is. No client-side persistence, so a refresh between saves loses typing.
Fifteen Back controls and three `onBack` handlers exist, and whether Back rewinds `current_step` is
not answerable without running it. Failures go to twelve toasts and one Alert with no convention.

**Plan A, the same behaviour on every step.** One loading, saving and transition treatment on all
eight rather than five.

**Plan B, leaving and coming back.** Resume from any entrance; settle what Back does to
`current_step`.

**Plan C, when something goes wrong.** One way to show a failure, and a failed save that stays
visible.

**Sequencing risk.** This scope and group 2's edit the same eight files. Group 2 goes first, because
a spinner on a step that sends the wrong data is polish on a defect.

### Group 4: the gaps, what must exist for the flow to be seamless — **new scope, three plan files**

Definition of done: an organizer can leave, return, and see the current truth without refreshing or
retyping.

**What was found.** On the booking path `_create_in_app_notification` writes a row and never touches
the channel layer, so a provider's answer never reaches the organizer's screen and the bell changes
only on a fetch. Three realtime models coexist: [WebSockets](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> are wired and the Vite [proxy](../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> does carry a
`/ws` rule (`vite.config.js:19-21`, `ws: true`), chat ignores it and polls every eight seconds
(`ChatRoom.jsx:46`), direct messages poll, and booking uses neither. The wizard has no client-side
persistence, so a refresh between saves discards typing. Capacity is collected at step 1 and the
booking request sends `attendee_count: 1`, because nothing owns the event's shape as one fact.

**Plan A, one way a change reaches a screen.** Choose push or poll once, apply it to bookings.

**Plan B, work that survives leaving the page.** Client persistence plus a save the organizer sees.

**Plan C, one source of truth for the event's shape.** Capacity, dates and headcount travel once.

**Not here on purpose.** Who runs the scheduled commands is group 3's Plan A.

**Correction to file.** The flow map's Step 0 says the Vite proxy has no `/ws` rule. It does.
`CLAUDE.md` already flags the claim as wrong; now confirmed by reading the config.

### Group 3: availability and the booking request — **new scope, four plan files**

Definition of done, roughly: an availability answer is provably current, and a booking request
cannot be duplicated or silently lost.

**What was found.** Availability is a materialised row, not a live calculation: rules expand into
`AvailabilitySlot` via `python manage.py materialize_availability_slots`, so an answer is only as
fresh as the last run. Eleven management commands sit under `scheduling/` (one materialiser, five
expiry commands, two outbox workers, three seeds) and nothing found so far runs any of them. Four
separate functions answer the overlap question (`_find_checkout_hold_conflict`, `_request_overlap_q`,
`_find_booking_conflict`, `_has_active_overlap`) plus `_lock_overlapping_slots` on the write path,
and read-versus-write agreement is untested. [Idempotency](../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub> is correct server-side, with a unique
constraint on `(owner, endpoint, key)`, and defeated client-side by a fresh key per click at
`schedulingApi.js:80`.

**Plan A, who runs the eleven commands.** Look first, then decide. Its answer feeds group 6 rather
than group 6 guessing at a queue.

**Plan B, one conflict answer instead of four.** `/write-tests` first to pin current behaviour, then
prove the read and write paths agree, then collapse.

**Plan C, the double-click.** Derive the idempotency key from the request, not the click.

**Plan D, the 48-hour clock made visible.** A request expires and the interface never says so.

### Group 2: the eight steps as they stand — **new scope, four plan files**

Eleven traced screens, not eight. Route `step2` never renders (`App.jsx:122` redirects to `step1`)
and the on-screen counter disagrees with the route numbering. Source: the recorded live trace at
`/home/molef/goal-setting/learning/attica-event-creation/flow-map.md`.

Cut by what decides the fix, not one plan per step.

**Plan A, information lost between steps.** Step 1 collects capacity 250; step 4 sends
`attendee_count: 1` to the booking request. Step 2 sends every field twice, camelCase for the form
and snake_case for the publish-time reader.

**Plan B, what the screen says versus what is true.** Upload screen claims 100MB, `settings.py:230`
enforces 50MB. Step counter wrong on at least two routes. A dead route still in the router.

**Plan C, work the page does and does not need.** The draft is fetched four times on mount: React
StrictMode double-invokes, and both the layout and the page trigger a load.

**Plan D, steps that carry nothing.** Route `step6` is a splash with no form whose only job is to
tick `current_step`. A design decision, not a bug.

Sits beside `fixing-create-event`; no overlap with that scope's six bugs, and that scope goes first.

### Group 7: the system drawn in layers — **new scope, small** (locked)

Every scope already gets a `diagram-prompts.md` seeded by `init-master-plan`. Four architecture
diagrams are already planned and undrawn in `plans/onboarding-docs/plans/04-architecture-diagrams.md`
(WebSocket handshake, [REST](../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, `POST api/v1/data/shorten` taking the long URL an..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. `curl` against two running mocks, reading the status line, headers and ...")</sub> versus WebSocket, [JWT](../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> refresh, wizard state machine). All four are
mechanism diagrams. Nothing draws the system as tiers.

One system-in-layers map, filed beside `environment/overview.md`, which is already the whole system
in one pass and is missing its picture. Group 6 references it rather than inventing a topology in
prose, so this comes before group 6.

Also open: the flow map carries eleven storyboard prompts and
`artifacts/figures/walking-the-event-creation-flow/` is empty. Eight images exist repo-wide.

### Group 5 renamed (locked)

Now "Moving through it: navigation, resuming a draft, and what the interface does while it waits".
Facts already gathered: no `localStorage` or `sessionStorage` anywhere in the wizard, so the server
draft is the only persistence and a refresh loses anything not yet PATCHed.
`ListingWizardLayout.jsx:80` resumes from `current_step` only when the URL carries no step, so a
direct link to `/listing/35/step5` renders step 5 wherever the draft actually is. Wizard state lives
in a reducer at `context/reactContext.jsx:35`.

### Group 1: credentials and roles, the way in — **new scope, small**

Two plan files, not a master plan tree. Groups 2 to 5 depend on it: a vendor's path through
create-event cannot be walked without a working vendor login.

**What was found.** The app gates on five roles (`EVENT_ORGANIZER`, `ARTIST`, `SERVICE_PROVIDER`,
`VENUE_MANAGER`, `TICKET_BUYER`, `users/models.py:12`). Eleven frontend `roles.includes` checks and
`has_role` calls in `vendors/views.py`, `artists/views.py`, `locations/views.py` read them. Only two
are ever assigned: `seed_booking_workflow` grants organizer and artist, `seed_sa_artists` grants
artist. `SERVICE_PROVIDER`, `VENUE_MANAGER` and `TICKET_BUYER` are granted nowhere.
`seed_marketplace` creates nine users (password `seed_pass_123!`) and assigns no role at all, so
`seed_vendor_feast` fails every vendor gate.

**Plan one.** Look first at whether the frontend reads `roles` or `CustomUser.user_type`, which is a
second role system with different values. Then fix the seeds so every gated role is granted, and
prove each login reaches its own side of the app.

**Plan two.** The verified credentials table and a login recipe per role, replacing the `unverified`
mark at `runbook/preparing-the-data/seeding-and-resetting-data.md:122` and adding the three missing
rows (`seed_vendor_petal`, `seed_venue_atrium`, `seed_venue_horizon`).

**Runs.** `/init-master-plan`, then `/populate-plans` against template v4.3, then `/drip-runbook`
for the per-role recipe.



---

## The runbook

Curated flow 6 in `~/.claude/skills/WORKFLOWS.md`, spliced: its front half (replicate,
learn-codebase, codebase-prune) is skipped because this walk did that work.

Run one at a time, from `/home/molef/Work/attica`.

1. Finish `plans/create-event-end-to-end/plans/fixing-create-event` first. Its second bug is what makes the browser suite honest.
2. `/init-master-plan` for the parent scope `plans/create-event-end-to-end`.
3. `/decompose-plan` seven times, one per scope, in the order below.
4. `/populate-plans` per scope, template v4.3.
5. `/drip-runbook` per scope, for the walk-it and prove-it pair.
6. `/todoist-bridge` then `/todoist-publish`.
7. Manual gate: do the work.
8. `/sync-plan-tree @plans/create-event-end-to-end`.

Scope order and why:

| # | Scope | Plans | Waits on |
|---|---|---|---|
| 1 | credentials-and-roles | 2 | nothing |
| 2 | the-system-in-layers | 1 | nothing |
| 3 | the-eight-steps | 4 | 1 |
| 4 | availability-and-booking | 4 | 1 |
| 5 | the-seamless-gaps | 3 | 4 |
| 6 | moving-through-it | 3 | 3, same files |
| 7 | what-it-runs-on | 3 | 2, and scope 4's plan A |
