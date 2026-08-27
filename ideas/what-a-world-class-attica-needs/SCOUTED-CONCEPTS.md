# What the system design canon says, and what Attica already has

Twelve sources were read on 2026-08-27: six X posts, one X long-form article, one freeCodeCamp
article, three case studies, and the roadmap.sh system design taxonomy. Six are concept checklists, so most of their
content is the same list written four ways. Two are case studies with a mechanism in them. The
twelfth is a taxonomy rather than a list, and it is the one that adds two whole catalogues the
others only gesture at: the named performance antipatterns, and the cloud and reliability pattern
set.

This file is the deduplicated inventory and the verdict per cluster: **owned** by an existing
sub-scope of [create event end to end](../../plans/create-event-end-to-end/MASTER_PLAN.md),
**unowned** and load-bearing, or **not applicable** with the reason.

It is reference material. The work it implies has no plan yet.

## The sources

| # | What it is | What it added |
|---|---|---|
| 1 | [A twelve-stage path to system design](https://x.com/suraj_sharma14/status/2092597934512587137) | Stage ordering: protocols, single node, APIs, data, cache, scale, shard, queues, theory, reliability, observability, practice |
| 2 | [Backend concepts ranked by difficulty](https://x.com/MentorWebDev/status/2092526315924586586) | Twenty concepts in four difficulty bands |
| 3 | [REST against gRPC against event-driven messaging](https://www.freecodecamp.org/news/service-to-service-communication-when-to-use-rest-grpc-and-event-driven-messaging/) | A decision table, and the outbox pattern |
| 4 | [Tackling an unknown design problem](https://x.com/system_monarch/status/2092245688830824764) | Phase 1 of four: start with what the system must never get wrong. Phases 2 to 4 sit in a reply that could not be read |
| 5 | [A system design roadmap for freshers](https://x.com/AvinashSingh_20/status/2015075875193340319) | An eight-week ordering, and the interview loop: clarify, estimate, design high, dive deep, trade off |
| 6 | [A ten-branch roadmap tree](https://x.com/techyoutbe/status/2091878944765034761) | Foundations, networking, APIs, databases, caching, messaging, reliability, observability, deployment, advanced |
| 7 | [Airbnb's booking system](https://newsletter.systemdesign.one/p/airbnb-system-design) | Idempotency keys, reservation and inventory in one database for local ACID, strong consistency as non-negotiable, search split out to Elasticsearch |
| 8 | [Uber's ETA system](https://newsletter.systemdesign.one/p/uber-eta) | Graph partitioning with precomputed intra-partition paths, Kalman and Viterbi for map matching |
| 9 | [Eighty concepts a backend engineer should know](https://x.com/CodeWithSravya/status/2092441063348936729) | Adds isolation levels, optimistic against pessimistic concurrency, OWASP, load testing |
| 10 | [A hundred things vibe coders skip](https://x.com/Sakshi50038/status/2090047385506664711) | The operations tail: dead letter queues, error budgets, clock skew, tail latency, postmortems |
| 11 | [A hotel reservation system](https://bytebytego.com/courses/system-design-interview/hotel-reservation-system) | Attica's exact problem, worked. Four named mechanisms against double-booking, inventory as a counter per date, a five-state reservation machine, and an estimation walked from business facts to requests per second |
| 12 | [The roadmap.sh system design taxonomy](https://roadmap.sh/system-design) | 150 nodes in 16 sections. Adds ten named performance antipatterns, the Azure cloud design pattern catalogue, a reliability pattern set, a monitoring sub-taxonomy, and availability arithmetic |

## Owned: the tree already has these

Every row names the sub-scope that owns it, or the code that already implements it. Where a row
carries a gap inside something otherwise built, the gap is stated in the row rather than moved, so
the mechanism and its hole stay readable together.

**Concurrency and double-booking, and the four mechanisms.** Sources 7 and 11 are both about this,
and source 11 is the one that separates the options instead of picking one. It names four ways to
stop two people taking the last unit, and Attica has already built three and a half of them in
[the scheduling models](../../backend/main/scheduling/models.py):

| Mechanism | State in Attica |
|---|---|
| Idempotency key, unique per owner and endpoint | Built and used. `IdempotencyRecord` is read and written in [the service layer](../../backend/main/scheduling/services.py) |
| Pessimistic locking, `SELECT ... FOR UPDATE` | Built, twenty call sites, and inert. SQLite has no row-level locking, so Django's `select_for_update()` has no effect |
| Optimistic locking, a `version` column checked on write | Half built. `version` exists on `AvailabilitySlot`, `AvailabilityRule`, `ResourcePolicy` and `Booking`, and it is incremented with `F("version") + 1`, but no update anywhere filters on the expected version. A counter that nothing compares against guards nothing |
| A database constraint that cannot be violated | Built and working. `CheckConstraint(capacity_reserved <= capacity_total)` is enforced by SQLite as well as by Postgres |

So the honest position today: the only mechanism actually defending the invariant on SQLite is the
check constraint. That is not nothing, and it is one mechanism where the design assumes two.

**Inventory as a counter, not a flag.** Source 11 models availability as one row per resource per
date carrying `total_inventory` and `total_reserved`, because a boolean cannot express "two of the
five are taken". Attica already does this: `AvailabilitySlot` carries `capacity_total` and
`capacity_reserved` with a `capacity_remaining` property, and `materialize_availability_slots`
populates it ahead of time, which is source 11's pre-populated inventory table and source 12's
**Materialized View** pattern under two names.

**The outbox pattern.** Built. `OutboxEvent` and `OutboxDeadLetter` are models, and
`dispatch_scheduling_outbox` and `run_outbox_worker` are management commands. Whether anything runs
them is the question `running-the-workers` exists to answer, and the parent master plan already says
ten scheduling commands have no runner.

**Transactions, ACID, database locking.** Sources 2, 7 and 9. Owned by `one-booking-truth` and
`contention-and-holds`.

**Caching strategies and invalidation.** Sources 1, 6, 9. Owned by `performance-architecture`, whose
objective in the parent is caching "that never answers a question it must not".

**N+1 queries and query budgets.** Source 10. Owned by `performance-architecture`. The parent's
Goal 6 is the number: a dashboard loads in one call, under ten queries.

**WebSockets, reconnect, event ordering.** Sources 2, 9, 10. Owned by `one-client-truth`, plans 17
to 21: the envelope, the apply rule, one socket with one reconnect policy.

**Background jobs and scheduled work.** Sources 2, 9. Owned by `running-the-workers`, which exists
because ten scheduling commands have no runner.

**Docker, CI/CD, deployment strategy.** Sources 6, 9, 10. Owned by `getting-it-out`.
[The CI workflow](../../.github/workflows/ci.yml) already runs Django's system check, migrations and
both test suites against a Redis service on every push and pull request.

**Authentication, JWT, session management.** Sources 2, 9. Owned by `getting-in`.

**Database migrations and schema versioning.** Source 10. Already practised: 79 migration files
across 17 Django apps.

## The thirteen gaps, and where each landed

Thirteen clusters had no owner when this file was first written. Checking each against
[the scopes](../enhancing-create-event-end-to-end/THE-SCOPES.md) and against `getting-it-out`'s four
authored plans moved five of them into work that already existed, and the remaining eight are now
placed. Nothing below is unowned any more; the entries stay because they carry the evidence, and the
table says where each one went.

| Cluster | Where it lives now |
|---|---|
| The lock does not lock, and the `version` columns guard nothing | `contention-and-holds`, as a `fix` and a `decide` in [the scopes](../enhancing-create-event-end-to-end/THE-SCOPES.md) |
| Connection pooling | `performance-architecture`, which already listed it |
| Load and performance testing | `performance-architecture`, **declined** on purpose: it chooses a query budget checked in development instead |
| Reverse proxy, TLS, static and media | `getting-it-out` plans 01 and 04, which already cover them |
| Which reads may be stale | `availability-that-is-true`, for the availability half, which is the half that matters |
| Every endpoint is public by default | [Close the open door](../../plans/create-event-end-to-end/plans/getting-in/plans/04-close-the-open-door.md) |
| Nothing is rate limited | The same plan, tasks 3.1 and 3.2 |
| There are no numbers | [Read the system before drawing it](../../plans/create-event-end-to-end/plans/the-system-in-layers/plans/01-read-the-system-before-drawing-it.md), task 5.4 |
| No health route | `getting-it-out`'s definition of done, built in its plan 06 |
| Backups, disaster recovery, restore | The same, plus a by-hand restore onto an empty machine |
| Nothing is paginated | `performance-architecture`, as a `build` |
| Every view is synchronous under an asynchronous server | `performance-architecture`, as a `decide` |
| Security beyond the login | Parked. See below |

The five roadmap.sh clusters were invisible in the six checklists, which is the argument for reading
a taxonomy rather than a fifth list.

**The lock does not lock, and the fallback is half wired.**
[The scheduling service](../../backend/main/scheduling/services.py) calls `select_for_update` twenty
times and [the database is SQLite](../../backend/main/main/settings.py), where Django's
`select_for_update()` has no effect. `psycopg2-binary` is already in
[the requirements](../../backend/main/requirements.txt) and unused, and
[the repository's own instructions](../../CLAUDE.md) say the Postgres tooling arrives "when we
migrate off SQLite".

Source 11 changes what this costs. Three of its four mechanisms need no row-level locking at all,
so Postgres is one route to the invariant rather than the only one, and the `version` columns are
the route that is already half built: adding the missing compare-and-swap filter to the writes that
matter is a change inside `services.py` with no migration and no infrastructure. Postgres is still
the right destination for other reasons, including a concurrent test that can actually be written.
The point is that `contention-and-holds` is choosing between four mechanisms, and its plans should
say which and why, rather than inheriting `select_for_update` because it is what the code happens to
call.

**Nothing is rate limited.** No Django REST Framework throttle class is configured or referenced
anywhere in the backend. Sources 1, 2, 6, 9 and 10 all name rate limiting, and four of them put it in
the easy or moderate band. The login endpoint and the availability search are the two that matter
first.

**There are no numbers.** Sources 1 and 5 both end on back-of-the-envelope estimation, and source 5's
loop puts "estimate scale" second. Nothing in this repository states an expected user count, a
bookings-per-day figure, a read-to-write ratio, or a target latency. Source 7 works because it opens
with 1.5 million bookings a day, 17 writes a second against 1,000 reads a second, and 620 million
inventory rows. Without Attica's version of those three numbers, every capacity and storage argument
here is a preference.

**Observability stops at errors.** [Sentry is wired](../../backend/main/main/settings.py) and opt-in,
with a trace sample rate of 0.1, and it is the only telemetry. No metrics, no service level
objectives, no error budgets, no alerting, and no health endpoint in
[the URL configuration](../../backend/main/main/urls.py). Sources 1, 6, 9 and 10 all carry
observability as its own branch, and source 1 pairs it with capacity planning in one stage.

**Security beyond the login.** Source 9 names OWASP Top 10 and secrets management; source 10 adds
cross-site request forgery, cross-site scripting, server-side request forgery, encryption at rest and
in transit, and token rotation. `getting-in` settles what a role is, which is authorization, not the
same question. Attica will hold South African organizers' contact details and, once Phase 2 of
[the roadmap](../../ROADMAP.md) lands, payment records.

**Load and performance testing.** Sources 9 and 10. `perf-test` exists as a skill and nothing in the
repository has been load tested. The parent's Goal 6 sets a query budget but no concurrency target,
so "works" currently means "works for one person".

**Search is a database query.** Attica has a global search endpoint and an availability search, both
running as SQLite queries. Source 7 splits discovery out to Elasticsearch precisely because search
and booking have opposite consistency needs: search may be stale, booking may not. Whether Attica
needs that split is a decision nobody has taken, and the honest answer at current scale is probably
not yet, which is a decision worth writing down rather than drifting past.

**Backups, disaster recovery, failover.** Source 10. `getting-it-out` covers getting a deployment up;
nothing covers getting it back.

**Every endpoint is public by default.** `REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES']` is
`AllowAny` in [the settings](../../backend/main/main/settings.py), so a view is open unless it sets
its own permission class. Across the backend there are 95 view classes and 79 `permission_classes`
declarations, and the gap is not evenly spread: `scheduling`, which owns booking, has 35 view
classes against 14 declarations. Some of those inherit permissions from a base class, so this is a
signal rather than a proven hole, and the audit is one pass over the views. Source 12 names this as
the **Gatekeeper** pattern; the safe default is `IsAuthenticated` globally with `AllowAny` declared
explicitly on the handful of endpoints that need it.

**Nothing is paginated.** One mention of pagination exists in the whole backend, and no
`DEFAULT_PAGINATION_CLASS` is set. Every list endpoint returns the full table. Sources 1, 9 and 12
all name pagination under API design, and source 12 names the consequence twice in its antipattern
catalogue, as **Extraneous Fetching** and **Chatty I/O**. It also gets worse with success: the
artist list is fine at 50 artists and is a denial of service at 50,000.

**Every view is synchronous under an asynchronous server.** Daphne runs the whole application, the
chat consumers are `async def`, and there are zero async views. Source 12 calls this
**Synchronous I/O** and it is on its antipattern list for a reason: a slow database call in a view
holds a worker for its whole duration, and the WebSocket connections share that process.

**There is no reverse proxy, and no story for static files.** `STATIC_ROOT` is set, `whitenoise` is
not installed, and nothing terminates TLS, serves media, or routes the WebSocket upgrade separately
from the HTTP traffic. The `/api`, `/vendors`, `/cart`, `/checkout` and `/ws` rules in
[the Vite config](../../frontend/vite.config.js) are a development stand-in for exactly this, and
they stop existing at `npm run build`. Sources 6, 9 and 12 all separate the load balancer from the
reverse proxy; Attica needs the second one first, and the first one not yet. This belongs to
`getting-it-out` and its master plan does not currently name it.

**No connection pooling, and no request-level transaction default.** Neither `CONN_MAX_AGE` nor
`ATOMIC_REQUESTS` is set. Both are inert on SQLite, which is why nobody has noticed, and both
become live on the day the Postgres decision lands. Sources 9 and 12 name connection pooling;
source 12 names the absence as the **Busy Database** antipattern.

## Not applicable, and why

Saying so matters as much as the list above, because a checklist read uncritically turns a Django
monolith into a microservice diagram nobody needs.

**Microservices, service mesh, multi-region.** Sources 2, 6, 9 and 10. Source 2 ranks the last two
"very hard" and they solve problems Attica does not have. Splitting the monolith now would buy
coordination cost and nothing else. The transport and discovery questions that come with them are
handled one section down, because they are worth understanding even though they are not worth
planning.

**Sharding, partitioning, consistent hashing, read replicas.** Sources 1, 6, 9, 10. The first
database decision is SQLite to Postgres. Sharding is several orders of magnitude away.

**Kafka.** Sources 1, 6, 9. Redis is already present and running as both the channel layer and the
cache. A queue on Redis is the proportionate next step if `running-the-workers` decides it needs one.

**Uber's routing machinery.** Source 8's graph partitioning, Kalman filtering and Viterbi decoding
solve map matching from noisy GPS. Attica books providers by date, not by route. The one transferable
idea is precomputation: Uber precomputes best paths within a partition so a query touches boundaries
rather than every node, and Attica's equivalent is
`materialize_availability_slots`, which precomputes bookable windows so search reads rows instead of
computing them. That already exists.

**Kubernetes, serverless, edge computing, cold starts.** Sources 6, 9, 10. `getting-it-out` has to
answer where a deployed Attica runs before any of these is a question rather than a preference.

## Parked, and what would unpark each

Three things are real and are deliberately not planned. Each says what would change that, because a
gap with no trigger is a gap that gets rediscovered rather than resolved.

**The broad security work.** Secrets management, encryption at rest and in transit, token rotation,
and the rest of the OWASP list. Every one of them is a statement about a deployed environment, and
the deployment decision has not been taken:
[take the deployment decision](../../plans/create-event-end-to-end/plans/getting-it-out/plans/01-take-the-deployment-decision.md)
is step 1 of that scope and waits on `one-booking-truth`. Planning encryption at rest before knowing
what the machine is would be planning against a guess. **Unparks when** that decision lands. The one
piece not waiting is the permission default, which is why it was split out and planned.

**Metrics, service level objectives, alerting.** An objective is a number, and Attica has none: no
expected user count, no bookings per day, no latency target. A target set today would be invented and
then defended. **Unparks when** task 5.4 of
[read the system before drawing it](../../plans/create-event-end-to-end/plans/the-system-in-layers/plans/01-read-the-system-before-drawing-it.md)
produces the four figures, or records who would settle them. The health route is planned separately
because whether a process can serve is a yes-or-no question that needs no target.

**Splitting search out of the booking database.** Source 7 separates them because search may be stale
and booking may not. `availability-that-is-true` already answers that for availability, with a version
stamp on every projected slot and transactional revalidation on the write path, which is the same
guarantee without the second system. **Unparks when** a measured search query is the thing making a
page slow, which nobody has measured.

## The concepts worth knowing, and what each is worth here

These come up in every list. A verdict of "not now" is not the same as "not worth understanding",
so each says what it would buy, and what would have to change for it to become a live question.

**REST against gRPC against GraphQL.** Attica is REST over Django REST Framework and should stay
that way. gRPC needs two services that call each other and there is one process. GraphQL solves
over-fetching and under-fetching, which is a real Attica problem: the parent's Goal 6 is that a
dashboard loads in one call under ten queries. The answer already chosen is the other answer to
that problem, and the tree names it without using the term. Objective 3 says "reads shaped like
screens", which is the **Backends for Frontend** pattern in source 12's catalogue: one endpoint per
screen, assembled server-side. Worth knowing GraphQL to understand why the endpoint-per-screen
route was the right call, and it becomes a live question only if a second client with different
data needs appears, such as a native mobile app.

The one piece of source 3 that does transfer whole is the **outbox pattern**, and Attica has already
built it: the event is written to the database in the same transaction as the business change, and a
separate relay publishes it. What is unsettled is whether the relay runs, which belongs to
`running-the-workers`, and whether `one-client-truth` plan 18 sends its envelope through the outbox
or around it.

**API gateway.** A gateway does four jobs: authentication, rate limiting, routing, and aggregation.
Attica does the first in Django, does not do the second at all, does the third in `urls.py`, and
does the fourth per endpoint. None of those need a separate box yet. The jobs are real and the box
is not, and confusing the two is how a monolith acquires infrastructure it cannot staff. Revisit
when there is a second backend service.

**Reverse proxy.** Different question, and this one is a gap, listed above under the unowned
clusters. A reverse proxy terminates TLS, serves static and media files, and routes the WebSocket
upgrade. Attica has none, and the Vite dev proxy hides that until the first deployment.

**Load balancing.** Layer 4 against layer 7, and the algorithms, matter when there is more than one
application process. There is one. The thing that makes more than one possible is already in place
and worth understanding: the Redis channel layer means a message published by one Daphne process
reaches a socket held by another. Without it, adding a second process would silently break chat for
half the users, which is the kind of failure that looks like a bug rather than a topology mistake.

**Service discovery.** Needs several services to discover. Not a question for one Django project,
and even after `getting-it-out` picks a deployment, container DNS covers it. Understand it, do not
plan it.

**CAP theorem.** Single node, so there is no partition to tolerate and CAP has nothing to say about
Attica today. It becomes a real question the day Postgres gets a read replica, and the answer is
already implied by the parent's Goal 4: booking is the consistent side, and stale reads there are
not acceptable. What is live now is the layer below CAP, source 12's **consistency patterns**:
which reads may be stale and which may not. Booking and availability are strong; search results,
the social feed and notification counts are eventual. Nobody has written that split down, and it
decides every caching question `performance-architecture` will face.

**Scaling.** Vertical against horizontal is not yet a decision because the deployment target is not
yet a decision. `getting-it-out` asks the first question, and this one follows it rather than
preceding it.

## The two catalogues source 12 adds

The checklists name concepts. Source 12 names **failure shapes**, and those are diagnostic rather
than aspirational: you read the list and check whether you have each one.

**The performance antipatterns, and the five Attica has.** Ten are named. Five are present:
**Extraneous Fetching** and **Chatty I/O** from the missing pagination, **Synchronous I/O** from
sync views under an ASGI server, **Busy Database** from every query landing on one SQLite file, and
**Monolithic Persistence** from all 17 apps writing to that same file. Three are unknown without
measurement: **No Caching**, **Retry Storm**, **Improper Instantiation**. Two do not apply on a
single machine: **Noisy Neighbor** and **Busy Frontend**.

**The cloud and reliability patterns, and the seven that bite.** The catalogue runs to about forty.
Most are for distributed systems Attica is not. Seven describe work already planned or already
needed, and naming them gives the plans a vocabulary and a reference implementation to compare
against:

| Pattern | Where it already lives here |
|---|---|
| Backends for Frontend | Objective 3's "reads shaped like screens", and Goal 6's one-call dashboard |
| Cache-Aside | The caching decision `performance-architecture` has to take |
| Materialized View | `materialize_availability_slots`, which precomputes bookable windows |
| Health Endpoint Monitoring | Missing. No health endpoint exists in the URL configuration |
| Throttling | Missing. No rate limiting anywhere |
| Gatekeeper | The `AllowAny` default, and the per-view permission audit it implies |
| Queue-Based Load Leveling | The shape `running-the-workers` will need if it picks a queue |

Two more are worth reading before the relevant decision rather than after: **Compensating
Transaction** when `contention-and-holds` designs what happens to a hold that is never confirmed,
and **Leader Election** if `running-the-workers` ever runs on more than one machine, since two
schedulers running the same command is a corruption rather than a slowdown.

**Where source 12 disagrees with the six checklists, and is right.** The checklists put monitoring
as one item. Source 12 splits it into health, availability, performance, security and usage
monitoring, then instrumentation, then visualisation and alerts. Attica has error reporting, which
is one corner of one of those seven. Stating it that way makes the gap specific enough to plan
instead of a word to nod at.

## What source 4 says, and the part that is missing

Only phase 1 of its four-phase approach could be read: **start with what the system must never get
wrong, before drawing anything.** For Attica that sentence has a specific answer, and it is the one
this inventory keeps returning to: two organizers must never hold the same provider for the same
window. Everything else here (rate limits, metrics, backups, search) degrades gracefully. That one
corrupts the product.

Phases 2 to 4 sit in a reply that the X token could not reach. Worth retrieving.
