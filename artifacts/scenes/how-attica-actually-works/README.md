# How does Attica actually work, once you have been away from it?

Five interactive scenes, each tracing one real path through the running system using only what is in
the repository: real endpoints, real file and line numbers, real payloads, real error strings.

They exist for re-orientation. Reading `App.jsx`'s route list and `events/models.py` tells you what
someone intended; these show what the code does today, including the parts that are broken.

## What is in here

Five scenes, each a small Vite app you run locally and operate. Each opens with a claim about the
running system and lets you sever or vary the thing the claim depends on.

Screenshots of two of them are in [the matching
figures](../../figures/how-attica-actually-works/).

## The scenes

### attica-organizer-journey

**What it shows**

One organizer going end to end: log in, look for a profile, build and resume an event, book an
artist. Every request in it is real. It runs two readings over the same four stages side by side,
what the route table and model names say happens, against what a per-request trace shows happens,
and every stage diverges. Each divergence is clickable into the request that proved it.

**How we got this scene**

Built from a trace of the running application at `/home/molef/Work/attica`, with every file, line
number, payload and error string copied out of the repository rather than described. Its `SPEC.md`
records the three places the build corrected the original brief.

**What it lets you say**

A per-request trace across all four layers tells you what the system does.

**What it cannot say**

Nothing about what the system was intended to do. It shows `OrganizerProfilePage` as dead weight
and says nothing about whether it should be wired up. Names carry intent; the trace does not.

**Where it came from and what judged it**

The repository at `/home/molef/Work/attica`. Nothing judged it: no review file exists.
**Held since 2026-08-22.** No plan in the tree names this scene yet; kept because it is the fastest
route back into the codebase after time away, and because plan 04 of `onboarding-docs` will draw
diagrams of the same flows and should check itself against it.

### attica-runtime-topology

**What it shows**

The four independently-failing processes behind what the browser experiences as one instant: Vite,
Django and DRF under Daphne, [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub>, and SQLite. Thirteen interactive edges, solid for durable and
dashed for best-effort, most of which can be severed to watch what degrades.

**How we got this scene**

Read from the repository's configuration and routing: `frontend/vite.config.js`,
`backend/main/main/routing.py`, and the channel-layer and [cache](../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> settings.

**What it lets you say**

Which paths are droppable and which are not. Severing `redis` degrades notification [latency](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Latency.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=784 "AI engineering, chapter 9, Inference performance metrics, Works latency as a distribution with numbers: ten time-to-first-token values whose mean of 390 ms i..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=36 "System design interview, chapter 2, Latency numbers every programmer should know, Jeff Dean's 2010 table of how long typical computer operations take, with i..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=358 "System design big archive, Latency vs. throughput, Latency as the delay per packet, what a user feels after clicking a button, set against throughput as the ..."), [▶1](https://www.youtube.com/watch?v=3JdQOExKtUY&t=129s "Hussein Nasser, Percentile Tail Latency Explained (95%, 99%), Calculating Percentile, 2:09 to 5:20, How a p95 or p99 is calculated from a set of request time..."), [▶2](https://www.youtube.com/watch?v=FqR5vESuKe0&t=63s "ByteByteGo, Latency Numbers Programmer Should Know: Crash Course System Design #1, Time Units, 1:03 to 2:50, The units the latency numbers are written in, be..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/22-prometheus-grafana-and-the-alert.md "Prometheus, Grafana, and the alert, system-design/foundations, plan 22. Every service gets a metrics endpoint and Grafana draws request rate, errors and p95 ...")</sub>;
severing `write` is refused, because cutting the source of truth is a different scene.

**What it cannot say**

Anything about production. Every process here is a local development process on one machine.

**Where it came from and what judged it**

The repository, and [the environment overview](../../../environment/overview.md), which carries
the same facts as prose. **Held since 2026-08-22.** No plan names it; kept because it is the picture behind
the environment file.

### attica-realtime-overlay

**What it shows**

That the database row is committed and serialized before anything is broadcast, so every real-time
path can be dropped without losing data.

**What it lets you say**

Dropping the real-time layer moves latency from about 16 ms to as much as 8 s. Correctness does not
move.

**What it cannot say**

Whether the broadcast happens at all on a given path. It does not, on the booking-request write
path, which never calls `group_send`; see [what a booking
is](../../../context/world/booking.md).

**Where it came from and what judged it**

The repository's chat and scheduling code. **Held since 2026-08-22.** No plan names it.

### event-wizard-machine

**What it shows**

Every Next writes the whole accumulated draft to the server and moves `current_step`, so the wizard
survives a closed tab, a dead battery, and a different machine.

**What it lets you say**

You resume exactly where you left off.

**What it cannot say**

What happens to the draft at publish. That is [what an event draft
is](../../../context/world/event-draft.md), and it is the thing most often got wrong: the draft is
kept, not deleted.

**Where it came from and what judged it**

The repository's `events` app and the wizard routes in `frontend/src/App.jsx`.
**Held since 2026-08-22.** No plan names it; plan 04 of `onboarding-docs` draws the same state
machine and should check against this.

### scheduling-conflicts

**What it shows**

Availability materialized into rows with a capacity counter and a unique window, so booking is a
bounded counter increment taken under a [row lock](../../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Locking.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=525 "Database systems textbook, section 10-3b, Lock types, Table 10.12 traces two transactions updating PROD_QOH under a binary lock, so the second cannot read un..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=522 "Database systems textbook, section 10-3a, Lock granularity, Locks at the database, table, page, row and field level, each drawn as a time sequence of two tra..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=529 "Database systems textbook, section 10-5, Concurrency control with optimistic methods, Optimistic concurrency control's read, validation and write phases: upd..."), [▶1](https://www.youtube.com/watch?v=nuBi2XbHH18&t=0s "Hussein Nasser, Row-Level Database Locks Explained - (Read vs Exclusive), 0:00 to 8:20, Row-level locks and the difference between a read lock and an exclusi..."), [▶2](https://www.youtube.com/watch?v=URwmzTeuHdk&t=1800s "Hussein Nasser, All Postgres Locks Explained ∣ A Deep Dive, FOR UPDATE, 30:00 to 33:00, The 'FOR UPDATE' row lock in Postgres, the first of four row-lock mod..."), [◆](../../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/10-pessimistic-lock.md "Pessimistic locking: SELECT FOR UPDATE, projects/attica/architecture-decisions, plan 10. Works it on Attica: 'select_for_update()' on the availability read, ...")</sub> rather than a question asked of history.

**What it lets you say**

That shape makes capacity above one expressible, makes re-running the materializer a no-op, and
gives the database somewhere to refuse.

**What it cannot say**

Whether the materializer has been run. It is a management command nobody schedules; until it runs
there are no slot rows and nothing is bookable. See [what availability
means](../../../context/world/availability.md).

**Where it came from and what judged it**

`backend/main/scheduling/models.py`, its constraints and its management commands.
**Held since 2026-08-22.** No plan names it.
