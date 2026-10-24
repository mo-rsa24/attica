# Where we landed

Everything worth keeping from the planning session, in one place, so planning can resume without
re-deriving it. Three companion files sit beside this one: `WHAT-WE-ARE-BUILDING.md` is the
specification, `PLAN_WALK.md` is the walk that produced the first scope cut, and
`chatgpt-review/` is the slot for the three architecture reviews this was checked against, which are
**not yet saved there**.

## 1. Settled

**One parent scope.** `plans/create-event-end-to-end`, with a single definition of done.

**`fixing-create-event` is a sub-scope of it**, not a sibling. It lives at
`plans/create-event-end-to-end/plans/fixing-create-event/`, its links resolve from there, and its
running order is a pointer to the parent's.

**Three planes, not one list.** Domain, Performance, Experience, weighted equally. Domain work gates
the other two; after it lands they can run in parallel because they need different skills.

**Build order is by risk, not by dependency between symptoms.** Truth first, screens late. The event
builder polish lands seventh of ten, not third.

**Two blockers come before all of it.** Working credentials for five roles, and a test harness that
authenticates. Neither is architecture and both gate everything after them.

**Every scope carries a runbook pair**: how to walk it by hand, how to prove it works.

**Art direction is inherited, not invented.** The existing flow map carries eleven prompts in one
style. New diagrams adopt it so the whole set reads as one.

**Scope fence.** The target is Airbnb-level interaction quality on deliberately simpler
architecture. Explicitly not being solved: fraud, chargebacks, tax, currency, multi-region,
large-scale abuse.

## 2. The state of the world

The picture changed three times during the session. This is where it ended.

### Built and working

52 indexes on the scheduling models. An [outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> with dead-lettering, [webhook](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> targets, an audit log
and conflict-incident recording that distinguishes an application catch from a database one. An
[idempotency](../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub> table with a unique constraint on `(owner, endpoint, key)`. A checkout hold:
`checkout_hold_minutes` defaulting to 30, `hold_expires_at` indexed with status, and
`draft_hold_expires_at` on the request. `cancel_booking` as a service with an idempotency key, wired
to a view, emitting a cancellation notification. `MockCheckoutSheet`, `CounterProposalModal` and
`BookingStatusBadge` on the frontend. [WebSocket](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> transport with a working `/ws` [proxy](../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> rule and a chat
consumer that does publish. `framer-motion` 12 already installed. `ResourcePolicy.BookingMode`
carrying `instant`, `approval_required` and `hybrid`.

### Built and inert

**All ten scheduling management commands.** One materialiser, four expiry commands, two outbox
commands, three seeds. Nothing runs any of them. Two of the ten are broken as well as inert:
`expire_draft_holds` is a byte-for-byte copy of `expire_checkout_holds`, and
`expire_and_materialize` never materialises and writes an inline update that skips the outbox.

**The notification channel, for everything except chat.** Clients subscribe to a per-user group and
two different functions write notification rows into it. `create_notification`
(`backend/main/notifications/utils.py:24`), which chat uses, writes the row and pushes.
`_create_in_app_notification` (`backend/main/scheduling/services.py:2658`), which every outbox
dispatch uses, writes the row and stops. So the socket is wired at both ends for chat and at one end
for the whole booking journey, and the fix is to copy the writer that already works.

**Half of the real-time envelope.** Four scheduling models carry a `version` field
(`ResourcePolicy`, `AvailabilityRule`, `AvailabilitySlot` and `Booking`) and five serializer field
lists expose it, and `OutboxEvent` carries `aggregate_type` and `aggregate_id` as real columns. None
of it travels over a socket: every push carries a notification row with a title and a message string
and no version at all. `BookingRequest`, the entity the journey turns on, has no version field, and
the two sites that bump a version use `F("version") + 1`, so the code that just saved the row cannot
read the new number back without a second query.

Most of the booking journey described in the third review is in this category: implemented, correct
looking, and doing nothing because no worker runs and no event is pushed.

### Missing

A payment provider interface, so the mock is a field rather than an adapter. Cancellation policy and
refund tiers. Screen-shaped read endpoints. An event-convergence projection. One server-state layer
on the client, where today there is no data layer at all and 132 fetch call sites across 38 of the
110 client files. Design
tokens, a typography scale and a motion language. Client-side draft persistence. Direct-to-storage
upload and image variants. Connection pooling. Any deployment mechanism at all. An activity or inbox
surface.

### Broken

Five roles are gated on and two are ever granted. Nine seeded users have no role, so three of the
five dashboards are unreachable. The browser suite runs logged out. Capacity 250 becomes
`attendee_count: 1`. Every field is sent twice, camelCase and snake_case. The draft is fetched four
times on mount. A screen claims 100MB against a 50MB limit. One route never renders and the step
counter disagrees with the routes. The idempotency key is generated per click. `select_for_update`
does not lock on SQLite. Resume works from one entrance only. No loading indicator exists in any of
the eight step files. Three components open their own WebSocket with three different reconnect
policies, one of which is no reconnect at all, and none of the three refetches after a reconnect, so
whatever changed during a gap is simply absent. Four live representations of a booking, of which the
chat one is the most referenced. An outbox event claimed into `processing` is stranded for good, because the dispatcher
only ever selects `pending` and `failed` and no reaper returns it. [Continuous integration](../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> has failed
on both of the two runs in its history, and its frontend job dies before installing anything because
`frontend/package-lock.json` is excluded by `.gitignore:45` and has never been committed, while
`ci.yml` asks the Node setup step to [cache](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> against it. The database engine, the [Redis](../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> host, the cache
location and the media root are literals in `settings.py`, so none of them can move without a code
change. The client reads no environment variable anywhere: 142 relative call sites resolve only
through the Vite dev proxy, and two more hardcode `127.0.0.1:8000`.

## 3. Open decisions

**D1. Which booking representation survives.** Four are live. The scheduling one is the most
complete; the chat one is the most used by reference count. They disagree about money as well as
about state: `chat/models.py:187` and `events/models.py:54` default `currency` to `ZAR` and
`chat/models.py:76` defaults it to `USD`, in an application whose interface writes `ZAR` at 48 sites.
Everything else is downstream of this.
Recommendation: scheduling survives, and the chat migration is costed honestly rather than assumed
away.

**D2. When the hold starts.** The two reviews contradict each other. The first says contention must
resolve at request time. The third says the time stays open until the provider accepts, which is
what the code does today. Recommendation: `ResourcePolicy.BookingMode` decides. `instant` gets the
first semantics, `approval_required` keeps the current ones. The field already exists for this.

**D3. Whether an event is a set.** What happens to nine outstanding requests when a critical one is
refused, and whether an event can publish without a venue.

**D4. Slot invalidation.** Recommended mechanism: stamp each projected slot with a version, and have
the booking write path revalidate transactionally so a search result is never trusted as still true.

**D5. Two user classifications.** `Role` with five values and `CustomUser.user_type` with five
different ones. Which is authoritative.

**D6. PostgreSQL.** Recommendation: yes, on correctness rather than speed, with the non-overlap
invariant enforced by a range exclusion constraint rather than only in Python.

**D7. Scheduled execution.** Expiry, materialisation and [outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatch are one infrastructure
decision, not three.

**D8. Media.** Direct-to-storage upload with derived variants, versus the current synchronous path
to local disk.

**D9. Deployment.** [Continuous integration](../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> exists and has never passed: two runs, on 2026-07-28 and
2026-08-23, both failing in both jobs, and the frontend build it produces is discarded at the end of
the job. There is no deployment mechanism, so no rollout strategy is currently expressible.

**D10. Frontend stack.** Cheaper than it reads: Material UI appears in 10 of 110 files, the data
layer is 9 files, and the motion library is already installed. Tailwind is on 3.4.17, so v4 is a
real major upgrade but a one-file config surface.

## 4. Corrections to earlier positions

**Indexes were closed too early.** 52 declared indexes says someone indexed, not that they indexed
the journeys. The test is [composite indexes](../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Index.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=552 "Database systems textbook, section 11-3, Indexes and query optimization, Works it on a 14,786-row CUSTOMER table: with the index STATE_NDX on CUS_STATE, find..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=129 "Database systems textbook, section 3-8, Indexes, An index as an index key plus pointers: Figure 3.31's painter 123 pointing at rows 1, 2 and 4 of PAINTING, a..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=289 "Database systems textbook, section 7-2g, SQL indexes, 'CREATE INDEX', 'CREATE UNIQUE INDEX' and 'DROP INDEX' on PRODUCT, and a unique composite index on '(EM..."), [▶1](https://www.youtube.com/watch?v=Jemuod4wKWo&t=170s "Hussein Nasser, what is a database index?, Heap vs index lookup, 2:50 to 4:44, Reading rows from the table's heap against finding them through an index, afte..."), [▶2](https://www.youtube.com/watch?v=BHCSL_ZifI0&t=138s "Hello Interview, DB Indexing in System Design Interviews, B-tree index, 2:18 to 4:01, The B-tree index, right after the chapter on the problem with full scan..."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/20-index-at-scale.md "An index at scale, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 20. Works it with numbers: a million-row table queried with and without...")</sub> derived from access patterns. Reopened.

**Media delivery was closed too early.** The argument is not traffic volume, it is serving an 8MB
image into a 240x180 card. That needs no load test to justify.

**Instant booking was called missing.** The policy field already models it.

**The third review was read as a proposal.** Most of it is already implemented and inert.

## 5. What the plans have to cover

Grouped by plane. This is the content, not yet the scope structure.

**Blockers.** Grant the three ungranted roles and give the nine seeded users theirs. Fix the login
helper so the browser suite authenticates. Verify each role reaches its own dashboard.

**Domain.** Choose the surviving booking model and migrate. Move to PostgreSQL and enforce
non-overlap in the database. Decide and implement the hold semantics per booking mode. Run the
schedulers and workers. Version and invalidate availability slots, revalidate on write. One state
machine, drawn. Payment behind a provider interface. Cancellation policy. Event convergence as a
server-computed projection. Publish as an [idempotent](../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub> transaction.

**Performance.** Screen-shaped read endpoints so a dashboard is one call. Query budgets per screen,
under ten, zero N+1, checked in development. [Composite indexes](../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Index.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=552 "Database systems textbook, section 11-3, Indexes and query optimization, Works it on a 14,786-row CUSTOMER table: with the index STATE_NDX on CUS_STATE, find..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=129 "Database systems textbook, section 3-8, Indexes, An index as an index key plus pointers: Figure 3.31's painter 123 pointing at rows 1, 2 and 4 of PAINTING, a..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=289 "Database systems textbook, section 7-2g, SQL indexes, 'CREATE INDEX', 'CREATE UNIQUE INDEX' and 'DROP INDEX' on PRODUCT, and a unique composite index on '(EM..."), [▶1](https://www.youtube.com/watch?v=Jemuod4wKWo&t=170s "Hussein Nasser, what is a database index?, Heap vs index lookup, 2:50 to 4:44, Reading rows from the table's heap against finding them through an index, afte..."), [▶2](https://www.youtube.com/watch?v=BHCSL_ZifI0&t=138s "Hello Interview, DB Indexing in System Design Interviews, B-tree index, 2:18 to 4:01, The B-tree index, right after the chapter on the problem with full scan..."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/20-index-at-scale.md "An index at scale, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 20. Works it with numbers: a million-row table queried with and without...")</sub> from real access patterns. [Cache](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> what
tolerates staleness and never cache bookability. Keep the critical path to persist-and-commit, with
everything else after the transaction. Connection pooling. Image variants and direct-to-storage
upload.

**Experience.** One server-state layer that [WebSocket](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> events patch rather than a parallel state
tree, replacing 132 fetch call sites across 38 of the 110 client files with no cache between them. A real-time envelope with versions and gap recovery. A persistent application shell so the
wizard reads as one object. Wizard step as navigation state, separate from completion state, so
resume works from any entrance. Autosave with a visible save state. Optimistic everywhere except
scarce inventory. Design tokens, typography roles, a motion language with duration bands, container
queries. Skeletons that preserve geometry, and explicit status text for actions. Deep-linked
notifications. Mobile as its own layout rather than a shrunk desktop.

**Defects.** The eight items under Broken that are not blockers.

## 6. Acceptance

**The two-browser test.** Organizer in one, provider in the other. Request, receive without refresh,
accept, see the acceptance without refresh, the window becomes unavailable, complete the mock
payment, both show confirmed, both calendars show the booking, cancel, both show cancelled, the time
is released. Nobody refreshes and nobody sees contradictory state.

**Refresh should be boring.** Press F5 immediately after payment and see the same state.

**The full convergence walk.** One person plays every role: creates an event, requests three
artists, three venues and three vendors, converses with each, logs in as each to answer, returns and
watches it converge and publish.

**Architecture tests, not UI tests.** Two organizers compete for the same venue. A provider is
offline when a request arrives. [Redis](../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> is unavailable during approval. Publish is sent five times.
The browser crashes mid-creation. Availability changes while the organizer is looking at it. A
request expires while the organizer is offline. A [WebSocket](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> disconnects and reconnects. A worker
crashes after commit and before notification.

## 7. Next

The sub-scope structure is written: twelve scopes as three planes over the build order, every item
marked decide, build, wire up or fix, in [the scopes](THE-SCOPES.md).

What runs next: `init-master-plan` for `plans/create-event-end-to-end`, then `decompose-plan` once
per scope in that file's running order, then `populate-plans` per scope against template v4.3.
`fixing-create-event` moves in as scope 1 in a separate operation, which re-levels its relative links
and swaps its running-order table for a pointer to the parent's.
