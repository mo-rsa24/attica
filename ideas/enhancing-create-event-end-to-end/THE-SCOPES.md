# The scopes

Twelve sub-scopes under `plans/create-event-end-to-end`, arranged as three planes over a build order
that goes by risk rather than by dependency between symptoms. The findings behind every item are in
[where we landed](WHERE-WE-LANDED.md); this file is only the structure.

**Twelve is a lot, and that is the honest number.** The work spans a data migration, a [concurrency](../../../../Obsidian/Information%20Technology/Concurrency/Concurrency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=429 "System design big archive, System Performance Metrics Every Engineer Should Know, Works concurrency as a number: 100 requests a second that each take 5 secon..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=185 "System design interview, chapter 12, Design a chat system, Scalability, Sizes concurrent connections: 1 million concurrent users at about 10 KB of server mem..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=280 "System design big archive, Concurrency is NOT Parallelism, Concurrency as tasks overlapping in time on one core through context switching, good for I/O waits..."), [▶1](https://www.youtube.com/watch?v=I8FeITQvLAk&t=114s "Gaurav Sen, How 100 milliseconds cost Amazon 3 BILLION DOLLARS: Latency, Concurrency and Parallelism, Concurrency Example, 1:54 to 2:28, A worked example of ..."), [▶2](https://www.youtube.com/watch?v=RlM9AfWf1WU&t=13s "ByteByteGo, Concurrency Vs Parallelism!, Concurrency, 0:13 to 1:03, Concurrency defined before parallelism and practical examples of both. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/09-reproduce-the-race.md "Reproduce the race against Attica, projects/attica/architecture-decisions, plan 09. Two concurrent accepts fired at the same provider and date against a runn...")</sub>
model, an execution tier that does not run, a real-time protocol, and a design system. Collapsing it
into five would hide which parts can run at the same time and which cannot.

**Every item carries a mark.** **decide** is an open question with no correct implementation until
it is answered. **build** does not exist. **wire up** exists and is inert. **fix** exists and is
wrong.

**Every scope also says what it owes the three folders that outlive it**, on an `Owes` line. A scope
that adds a process or moves an access path owes `environment/` a fact and runs `env-pulse`. One that
introduces a word nobody has defined owes `context/` an entry and runs `context-pulse`. One that adds
something a person operates by hand owes `runbook/` its pair, written with `drip-runbook` and checked
with `runbook-pulse`. The pulse runs in that scope's close out, not at the end of the programme,
because the moment the fact is known is the only cheap moment to write it down.

**Every scope also carries its own `diagram-prompts.md`**, inheriting the parent's art direction,
palette, glyph vocabulary and reading axes exactly, and adding no vocabulary of its own. `decompose-plan`
writes it as one of its commit writes, so the ten scopes not yet decomposed get theirs automatically.
The two that exist already have one.

**The catch is the parent capstone.** A child map is the zoom-in on one glyph in the parent's picture,
so a scope with no glyph there amends the capstone in the same commit as its decomposition. The
capstone now names the five domain scopes, the three experience scopes, and the two that run
alongside, which leaves `performance-architecture` as the only scope without its own glyph: it is one
scope drawn as a whole panel, so the panel is its glyph and decomposing it amends nothing. Every
amendment this prediction was written for has been made.

## Running order

| # | Scope | Plane | Waits on |
|---|---|---|---|
| 1 | fixing-create-event | blocker | nothing |
| 2 | getting-in | blocker | nothing |
| 3 | the-system-in-layers | cross | nothing |
| 4 | one-booking-truth | domain | 1, 2 |
| 5 | contention-and-holds | domain | 4 |
| 6 | running-the-workers | domain | 4 |
| 7 | availability-that-is-true | domain | 5, 6 |
| 8 | the-booking-journey | domain | 5, 6 |
| 9 | performance-architecture | performance | 7, 8 |
| 10 | one-client-truth | experience | 6 |
| 11 | the-event-workspace | experience | 8, 10 |
| 12 | the-design-system | experience | nothing after 2 |
| 13 | getting-it-out | cross | 4 |

Scopes 1, 2, 3 and 12 can all start immediately. After 8 lands, the performance and experience planes
run in parallel.

---

## Stage 0: the blockers

Neither is architecture. Both gate everything, because no claim about this system is checkable until
they are done.

### 1. fixing-create-event

Already exists, moves in as a sub-scope. Four plans, six confirmed bugs.

**Owes.** `runbook/` its pair: it already writes every bug and its fix into the recipes, which is plan 3 of that scope. Nothing new for `environment/` or `context/`.

**fix** The login helper writes the wrong storage key, so every browser test runs logged out. Until
this lands, no test result anywhere in this program is evidence.

**fix** The five other confirmed defects, per that scope's own plans.

### 2. getting-in

**fix** Three of five gated roles are granted by nothing. Grant `SERVICE_PROVIDER`, `VENUE_MANAGER`
and `TICKET_BUYER`.

**Owes.** `context/` the decision on what a role is, since two classifications disagree and nobody has said which wins. `runbook/` a pair: becoming each of the five roles, and the check that all five still reach their own dashboards after a seed changes.

**fix** Nine seeded marketplace users have no role at all, so a vendor login fails every vendor gate.

**decide** `Role` and `CustomUser.user_type` are two classifications with different values. Which is
authoritative.

**build** A verified credentials table and a login recipe per role, replacing the `unverified` mark
on the existing one and adding the three missing rows.

**Done when** each of the five roles logs in by hand and reaches its own dashboard, with a screenshot
per role.

---

## Cross-cutting, startable now

### 3. the-system-in-layers

**build** One system-in-layers map filed beside `environment/overview.md`, in the art direction the
existing flow map already uses.

**Owes.** `environment/` the layers map itself, filed beside `overview.md`, which is the picture that file has always been missing.

**build** The diagrams the reviews call for and the repo lacks: the booking state machine on its own
page, the contention sequence, the real-time delivery path, event convergence, and a failure diagram
beside every happy path.

Four architecture diagrams are already planned and undrawn in `onboarding-docs`; they fold in here
rather than being drawn twice.

### 13. getting-it-out

**decide** There is no deployment mechanism. [Continuous integration](../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../goal-setting/learning/system-design/devops-and-deployment/plans/07-two-remotes-two-branch-rules.md "Two remotes, two branch rules, a refused push, system-design/devops-and-deployment, plan 07. Branch protection on GitHub and a branch policy on Azure Repos c...")</sub> exists and nothing ships.

**Owes.** `environment/` a whole new section, because a deployment mechanism changes what "running Attica" means. `runbook/` a pair: shipping a change, and confirming it landed.

**build** Whatever that decision produces, with the topology logically separable from day one even
while it runs on one machine.

The continuous integration that exists has never passed. It has run twice, on 2026-07-28 and
2026-08-23, and both runs failed in both jobs, so it is not yet a gate a release could be built on.
The frontend build it produces is discarded at the end of the job.

Positioned late in the table and worth starting early, because nothing above is real until it can be
deployed.

---

## The domain plane

This plane gates the other two. Nothing in performance or experience is worth building on a booking
model that is about to be replaced.

### 4. one-booking-truth

**decide** Which of the four live booking representations survives. The scheduling one is the most
complete, the chat one is the most referenced. Everything else in this program is downstream.

**Owes.** `context/` a rewrite of `booking.md` and `booking-request.md`, since three of the four representations stop existing and the surviving vocabulary changes.

**build** The migration away from the three that lose, costed honestly rather than assumed.

**build** One state machine, drawn and enforced, replacing five separate status fields and a
`workflow_state` alongside one of them.

**decide** Which read projections may exist. Many are fine; many things able to change state are not.

### 5. contention-and-holds

**decide** When a hold starts. The reviews contradict each other: at request time, or at acceptance.
The code does the latter today. Recommendation on the table is that `ResourcePolicy.BookingMode`
decides per resource, since `instant`, `approval_required` and `hybrid` already exist as values.

**Owes.** `environment/` a rewritten access-paths section, because PostgreSQL replaces SQLite and that is the fact most likely to make a command fail. `context/` entries for `hold` and `claim`, neither of which is defined anywhere today.

**build** PostgreSQL, with time modelled as a range and non-overlap enforced by a database exclusion
constraint rather than by application checks alone. `select_for_update` does not lock on SQLite, so
the current guard is weaker than it reads.

**fix** The [idempotency key](../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of 'POST /payments' with an 'Idempotency-Key': a new key ...")</sub> is generated fresh per click, which protects against a network retry and
not against a double click. Derive it from the request.

**build** A [concurrency](../../../../Obsidian/Information%20Technology/Concurrency/Concurrency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=429 "System design big archive, System Performance Metrics Every Engineer Should Know, Works concurrency as a number: 100 requests a second that each take 5 secon..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=185 "System design interview, chapter 12, Design a chat system, Scalability, Sizes concurrent connections: 1 million concurrent users at about 10 KB of server mem..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=280 "System design big archive, Concurrency is NOT Parallelism, Concurrency as tasks overlapping in time on one core through context switching, good for I/O waits..."), [▶1](https://www.youtube.com/watch?v=I8FeITQvLAk&t=114s "Gaurav Sen, How 100 milliseconds cost Amazon 3 BILLION DOLLARS: Latency, Concurrency and Parallelism, Concurrency Example, 1:54 to 2:28, A worked example of ..."), [▶2](https://www.youtube.com/watch?v=RlM9AfWf1WU&t=13s "ByteByteGo, Concurrency Vs Parallelism!, Concurrency, 0:13 to 1:03, Concurrency defined before parallelism and practical examples of both. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/09-reproduce-the-race.md "Reproduce the race against Attica, projects/attica/architecture-decisions, plan 09. Two concurrent accepts fired at the same provider and date against a runn...")</sub> test that proves two simultaneous requests on the same window resolve the
same way every time, and that both parties are told.

**fix** The `version` columns guard nothing. `AvailabilitySlot`, `AvailabilityRule`, `ResourcePolicy`
and `Booking` each carry one and each increments it with `F("version") + 1`, and no update anywhere
filters on the version it expected to find. [Optimistic locking](../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Locking.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=525 "Database systems textbook, section 10-3b, Lock types, Table 10.12 traces two transactions updating PROD_QOH under a binary lock, so the second cannot read un..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=522 "Database systems textbook, section 10-3a, Lock granularity, Locks at the database, table, page, row and field level, each drawn as a time sequence of two tra..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=529 "Database systems textbook, section 10-5, Concurrency control with optimistic methods, Optimistic concurrency control's read, validation and write phases: upd..."), [▶1](https://www.youtube.com/watch?v=nuBi2XbHH18&t=0s "Hussein Nasser, Row-Level Database Locks Explained - (Read vs Exclusive), 0:00 to 8:20, Row-level locks and the difference between a read lock and an exclusi..."), [▶2](https://www.youtube.com/watch?v=URwmzTeuHdk&t=1800s "Hussein Nasser, All Postgres Locks Explained ∣ A Deep Dive, FOR UPDATE, 30:00 to 33:00, The 'FOR UPDATE' row lock in Postgres, the first of four row-lock mod..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/10-pessimistic-lock.md "Pessimistic locking: SELECT FOR UPDATE, projects/attica/architecture-decisions, plan 10. Works it on Attica: 'select_for_update()' on the availability read, ...")</sub> is declared in the schema and absent
from the writes.

**decide** Which of the four mechanisms enforces the invariant, said out loud with the three that
lost. They are the idempotency key (built and used), the pessimistic lock (built, inert on SQLite),
the version compare-and-swap (half built, above) and the check constraint on
`capacity_reserved <= capacity_total` (built, and the only one working today). Three of the four need
no row-level locking, so PostgreSQL is one route to the invariant rather than the only one, and that
changes what this scope is allowed to assume about its own dependency.

### 6. running-the-workers

**decide** One infrastructure decision, not three: expiry, availability materialisation and [outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>
dispatch all need the same thing.

**Owes.** `environment/` a new execution-model fact: "running Attica" stops meaning four hand-started processes. `runbook/` a pair: how to start and stop the recurring work, and how to find out what is stuck. Only part of the second exists. The drain-the-outbox recipe answers "how many events are pending" with a real run pasted in, and answers neither "what dead-lettered and why" nor "what is stranded in `processing`", so the recipe gets finished rather than duplicated.

**wire up** Ten scheduling management commands exist and nothing runs any of them. Three of the ten are seeds and must stay off any schedule, so seven want a runner, and two of those seven are daemons already wrapping the other five.

**wire up** The outbox worker, with retries and dead-lettering, both of which already have tables.

**build** Persist first and push second as the rule: a business change and its outbox event commit in
one transaction, and delivery may then fail without losing the event.

### 7. availability-that-is-true

**build** A version stamp on every projected slot, so search never treats a stale projection as
current.

**Owes.** `context/` an update to `availability.md`, which currently describes rules and slots without the version that decides whether a slot is still current.

**build** Transactional revalidation on the booking write path, so a search result three seconds old
is never trusted as still true.

**build** Regeneration when a rule or exception changes, driven through the outbox.

### 8. the-booking-journey

**build** A payment provider interface. The mock is currently a reference field on the checkout
session rather than an adapter, so swapping in a real gateway means touching the booking path.

**Owes.** `context/` three entries that do not exist: convergence, the checkout session, and the cancellation policy. `runbook/` a pair: driving a booking from request to payment to cancellation, and proving the time was released.

**build** Cancellation policy. The cancellation *action* exists; refund tiers and notice windows do
not.

**build** Event convergence as a server-computed projection: confirmed, pending, countered,
expiring, blocking requirements, next actions, and whether the event can publish. The client must
never invent its own definition of ready.

**decide** Whether an event is a set. What happens to nine outstanding requests when a critical one
is refused, and whether an event may publish without a venue.

**build** Publish as one idempotent transaction that converts exactly the agreements that are ready.

Most of the hold, expiry and cancellation machinery this scope needs already exists and is inert.
Much of this scope is wiring rather than writing.

---

## The performance plane

### 9. performance-architecture

**build** Screen-shaped read endpoints, so a dashboard is one call rather than eleven. Commands
follow the domain; reads follow the experience.

**Owes.** `environment/` an access-path change, since media stops going to local disk. `runbook/` the query-budget check, because a budget nobody knows how to run is not a budget.

**build** A query budget per screen, under ten queries, zero N+1, zero full scans, checked in
development rather than in a load test.

**build** [Composite indexes](../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Index.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=552 "Database systems textbook, section 11-3, Indexes and query optimization, Works it on a 14,786-row CUSTOMER table: with the index STATE_NDX on CUS_STATE, find..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=129 "Database systems textbook, section 3-8, Indexes, An index as an index key plus pointers: Figure 3.31's painter 123 pointing at rows 1, 2 and 4 of PAINTING, a..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=289 "Database systems textbook, section 7-2g, SQL indexes, 'CREATE INDEX', 'CREATE UNIQUE INDEX' and 'DROP INDEX' on PRODUCT, and a unique composite index on '(EM..."), [▶1](https://www.youtube.com/watch?v=Jemuod4wKWo&t=170s "Hussein Nasser, what is a database index?, Heap vs index lookup, 2:50 to 4:44, Reading rows from the table's heap against finding them through an index, afte..."), [▶2](https://www.youtube.com/watch?v=BHCSL_ZifI0&t=138s "Hello Interview, DB Indexing in System Design Interviews, B-tree index, 2:18 to 4:01, The B-tree index, right after the chapter on the problem with full scan..."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/20-index-at-scale.md "An index at scale, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 20. Works it with numbers: a million-row table queried with and without...")</sub> derived from real access patterns. Fifty-two indexes exist, which says
someone indexed, not that they indexed the journeys.

**build** A [caching](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> rule: [Redis](../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> may accelerate anything that tolerates staleness and may never answer
whether a resource is bookable.

**build** Connection pooling.

**build** Direct-to-storage upload with derived image variants. An eight megabyte image is currently
served into a card that displays it at a fraction of that size, and a large upload occupies an
application worker for its duration.

**build** [Pagination](../../../../Obsidian/Information%20Technology/System%20Design/APIs/Pagination.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Pagination with a concrete request, '?limit=10&offset=20', among the habits of a well-designed API."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Why APIs paginate (performance bottlenecks and payload bloat) and the three strate..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=270 "System design big archive, Best Practices in API Design, Offset-based and cursor-based pagination beside sorting, filtering and versioning."), [▶1](https://www.youtube.com/watch?v=zwDIN04lIpc&t=317s "PlanetScale, Pagination in MySQL - offset vs. cursor, Shifting records in offset pagination, 5:17 to 6:12, The failure offset pagination has when rows move, ..."), [▶2](https://www.youtube.com/watch?v=14K_a2kKTxU&t=85s "ByteByteGo, API Pagination: Making Billions of Products Scrolling Possible, Cursor based pagination, 1:25 to 2:12, Cursor pagination as the fix for the probl..."), [◆](../../../../goal-setting/learning/system-design/api-design-and-contracts/MASTER_PLAN.md "System Design: API Design and Contracts, system-design/api-design-and-contracts. Its goal implements cursor and offset pagination on the same dataset and dem...")</sub>. No `DEFAULT_PAGINATION_CLASS` is set and one mention of pagination exists in
the whole backend, so every list endpoint returns its full table. This one gets worse with success:
the artist list is fine at fifty artists and is an outage at fifty thousand.

**decide** Whether the request path stays synchronous. Every view is a `def` under an ASGI server,
while the chat consumers are `async def` in the same process, so a slow query holds a worker for its
whole duration and the [websocket connections](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> share that process with it. Either the slow paths become
async, or the decision is that they stay sync and the process count absorbs it, but it is currently
neither: it is what the code happened to be.

---

## The experience plane

### 10. one-client-truth

**build** One server-state layer that owns remote state, with [WebSocket](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> events patching that [cache](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>
rather than a parallel state tree. Without this the client keeps several disagreeing copies of the
truth however good the server protocol is.

**Owes.** `context/` an entry for the event envelope and its version, because a word that appears in every real-time message needs one definition. `runbook/` how to watch events arrive and how to force a reconnect.

**build** An event envelope carrying a monotonic entity version, so a client can tell apply from
ignore from gap-detected-and-refetch. Delivery is at-least-once, never exactly-once.

**build** Reconnect and snapshot recovery, so a dropped socket degrades to slow rather than to wrong.

**fix** The eight-second poll is a fallback that runs only after the socket errors, and in
`ChatRoom` it is permanent, because that component never reconnects. One shared transport with one
reconnect policy, rather than three components each answering the question their own way.

### 11. the-event-workspace

**build** A persistent application shell, so the seven stages read as one continuous object rather
than seven pages.

**Owes.** `runbook/` a pair: walking the seven stages, and the resume check from every entry point.

**fix** The wizard step currently carries both navigation state and business state, which is why
resume only works from one entrance. Separate completion flags from the last visited route.

**build** Autosave with a visible save state. Nothing currently survives a refresh, and no step file
contains a loading indicator.

**build** Optimistic updates everywhere except scarce inventory, which must never be claimed before
the server commits.

**build** The convergence dashboard: after requests are sent the organizer leaves the wizard and
enters a command centre that updates live.

**build** Deep-linked notifications that land on the relevant booking with its panel open.

**fix** The eight defects under Broken that are not blockers, including capacity 250 arriving as an
attendee count of 1, every field being sent twice, the draft being fetched four times on mount, and a
step counter that disagrees with the routes.

### 12. the-design-system

**build** Semantic tokens first: colour, spacing, radius, elevation. Components consume tokens and
pages never invent styles.

**Owes.** `runbook/` how to add a component without inventing a style. Nothing for `environment/` or `context/`.

**build** A typography scale with named roles rather than utility classes chosen ad hoc.

**build** A motion language with duration bands, and an explicit statement of what does not animate.

**build** Container queries, so a provider card responds to its container rather than the viewport.
This app is full of drawers, sidebars and split panes.

**decide** The stack. Cheaper than it reads: Material UI appears in 10 of 110 files, the data layer
is 9 files, and the motion library is already installed. Tailwind is on 3.4.17, so v4 is a genuine
major upgrade with a one-file config surface.

**build** Skeletons that preserve geometry, and explicit status text for actions. Mobile as its own
layout rather than a shrunk desktop.

---

## Acceptance, across the whole parent scope

The two-browser test, refresh-should-be-boring, the full convergence walk, and the nine architecture
tests. All four are written out in [where we landed](WHERE-WE-LANDED.md#6-acceptance).

Every scope also carries its own runbook pair: how to walk it by hand, and how to prove it works.
