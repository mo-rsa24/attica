# 🔍 Read The System Before Drawing It

Step 1 of 4 in this scope. Waits on nothing.
Next: [02-draw-the-layers-map.md](02-draw-the-layers-map.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to establish](#description-what-to-establish)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [References](#references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [the-system-in-layers](../MASTER_PLAN.md). First of four, and it must go first: every brief in
[02](02-draw-the-layers-map.md) and [03](03-brief-the-other-eight.md) is written from what this plan
establishes, and a brief written from prose instead is how a wrong diagram gets rendered.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing is started. This scope owes nine diagrams, and the sources describing what they should show
disagree with the code in at least two places that are already known.

**This whole plan is inferred.** `[inferred]` The scope's Definition of Done says the briefs are
"checked against the code" and never says the reading is its own deliverable. It is, because the
alternative is nine briefs each independently re-deriving the same facts, and four of them getting a
different answer.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- The Python environment is `/home/molef/lobola`. Activate it with
  `source /home/molef/lobola/bin/activate` before running anything with `manage.py`.
- The database is SQLite at `backend/main/db.sqlite3`, one file, no server. It shows as modified in
  `git status` after the app runs, which is normal here.
- Two tests already fail, so `python manage.py test` reporting red does not mean this plan broke
  something. This plan runs no tests anyway; its evidence is reading.
- [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> must be running before the backend starts, and it carries two unrelated logical databases:
  the channel layer on the default, the page [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> on database 1.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This is a reading plan, not a changing plan.**

Nothing here edits a model, a service or a diagram. The deliverable is a file of established facts,
each carrying the path and line it came from. Resist fixing anything you notice: write it into the
findings file as a finding and let the scope that owns it act.

**Two claims in the planning notes are already suspect, and one is already known wrong.**

[Where we landed](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md) says the
notification channel is "wired at one end only" and that nothing publishes to it. That is too broad:
`notifications/utils.py` publishes to the per-user group, and it is called from `chat/views.py`.
Whether the scheduling path does the same is the question task 3.2 settles, and the real-time
delivery diagram is wrong in a different way depending on the answer.

Separately, this repository's own instructions record that the event-creation flow map's Step 0 claim
about the Vite [proxy](../../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> having no `/ws` rule is wrong. Do not copy that claim into anything.

**A count you did not compute is a count you may not write.**

The reference counts and state counts in the briefs decide which booking representation looks most
complete and which looks most used, and those two facts are the evidence D1 gets decided on. Run the
command, paste the number it printed, and say what it counted. Do not estimate, and do not carry a
number forward from a planning document.

**Where a fact is genuinely unknown, write "unknown".**

A plausible invented fact in a findings file becomes a confident wrong line in a diagram two plans
later, and by then nobody remembers it was a guess.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

One file of established, referenced facts is worth more than any of the nine diagrams, because it is
what makes all nine of them true rather than plausible.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

A diagram is believed without being checked. That is the whole reason to draw one, and it is why a
wrong one costs more than no diagram at all: the reader stops asking the question the picture
answered.

The sources this scope could draw from are three planning documents, one flow map with a known-wrong
claim in it, and the code. Only one of those is authoritative. This plan reads it once, writes down
what it found, and lets the eight briefs after it cite a single file instead of re-deriving.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  THREE SOURCES, ONE AUTHORITY

  planning notes ─┐
  the flow map ───┤   (one known-wrong claim)
  the code ───────┴──►  read it  ──►  findings file
                                          │
                            every brief cites this,
                            not the notes it came from
                                          │
                            ┌─────────────┼─────────────┐
                            ▼             ▼             ▼
                       02 layers     03 the other   04 render
                          map            eight        and check
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-establish) ➡️

Two pieces in this scope's map are drawn from what this plan establishes.

**Subject: one concept, four state machines.** The state counts and reference counts this plan
computes are the chips on that picture.
[Piece 2](../diagram-prompts.md#piece-2-one-concept-four-state-machines-planned--not-rendered).
Save as `../diagrams/subject-02-one-concept-four-machines.png`. *(image not yet generated)*

**Subject: two answers to when a hold starts.** The lower, solid bar is what tasks 2.1 and 2.2 read
out of the code.
[Piece 3](../diagram-prompts.md#piece-3-two-answers-to-when-a-hold-starts-planned--not-rendered).
Save as `../diagrams/subject-03-two-answers-one-hold.png`. *(image not yet generated)*

## Description: what to establish

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

One markdown file, `artifacts/notes/how-a-booking-happens/what-the-code-does-today.md`, holding six
sections, each answering one question the nine diagrams need answered, each line carrying the path
and line number it came from and the date it was read.

1. **Every booking representation that is live**, with its state list, its state count, and the
   count of places it is referenced from.
2. **What `workflow_state` is**, and how its values relate to the status field it sits beside.
3. **What happens between two organizers wanting the same window**, read out of the approval path
   rather than out of a review.
4. **When a hold starts, in the code**, and which policy value chooses which behaviour.
5. **What reaches a screen when a booking changes**, split by path, because the chat path and the
   scheduling path do not behave the same way.
6. **Whether anything computes event convergence today**, or whether the client does it.

## Purpose and goal

Navigation: ⬅️ [Description: what to establish](#description-what-to-establish) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 1 and objective 2](../MASTER_PLAN.md#objectives) by making the eight
briefs after this one correct rather than plausible.

**Goal.** `artifacts/notes/how-a-booking-happens/what-the-code-does-today.md` exists, every claim in
it carries a `path:line`, every count in it was printed by a command that is written beside it, and
anything not established says "unknown".

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-system-in-layers/plans/01-read-the-system-before-drawing-it.md`

▶ **Next: [task 1.1](#1--establish-what-a-booking-is-today)**.

### 1. 📚 Establish what a booking is today

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 List every live booking representation with its states**
  ```
  cd /home/molef/Work/attica/backend/main
  grep -rn "^class .*Booking\|^class .*Reservation\|^class .*Request" --include=models.py . 
  ```
  - Then open each hit and copy its state list verbatim, with the line range.
  - Known starting points, to be confirmed rather than trusted: `scheduling/models.py:300`
    (`BookingRequest`, 7 states), `scheduling/models.py:396` (`Booking`, 8 states),
    `chat/models.py:123` (5 states), `vendors/models.py:227` (3 states),
    `artists/models.py:66` and `locations/models.py:99` (a free-text `status` with no choices at all,
    defaulting to `pending`).
  - Produces: one table, one row per representation, columns model, path:line, state list, state
    count.
  - Done when: the table names every model with a booking-shaped status field, and the two with no
    choices list are marked as having no enumerable states rather than being left blank.

- [ ] **1.2 Count how often each one is referenced**
  ```
  cd /home/molef/Work/attica/backend/main
  for m in "chat.models import.*Booking" "scheduling.models import" "ArtistBooking" "VenueBooking"; do
    echo "== $m"; grep -rn "$m" --include=*.py . | grep -v migrations | grep -v tests.py | wc -l
  done
  ```
  - Then repeat over `frontend/src` for the API paths each one is reached by, since a model nothing
    in the interface calls is not "used" in the sense that matters.
  - Produces: a reference count per representation, with the exact command that produced it written
    beside the number.
  - Done when: every number in the table can be reproduced by running the line printed next to it.
    A number without its command is a number that gets disputed and cannot be defended.

- [ ] **1.3 Write down what `workflow_state` is and how it relates to `status`**
  ```
  cd /home/molef/Work/attica/backend/main
  sed -n '303,332p' scheduling/services.py
  grep -rn "workflow_state" --include=*.py . | grep -v tests.py
  ```
  - Produces: the full list of values `get_booking_request_workflow_state` can return, and a note on
    which of them are derived from `status`, which from a checkout session, and which from a
    timestamp.
  - Done when: it is written plainly whether `workflow_state` is a projection of `status` or a
    second, independent state machine. This is what decides whether the state-machine diagram draws
    one machine or two.

▶ **Next: [task 2.1](#2--establish-what-happens-under-contention)**.

### 2. ⚖️ Establish what happens under contention

◀ **Needs: [task 1](#1--establish-what-a-booking-is-today)**.

- [ ] **2.1 Read the approval path end to end and write the sequence down**
  ```
  cd /home/molef/Work/attica/backend/main
  sed -n '701,915p' scheduling/services.py
  ```
  - Produces: an ordered list of what `approve_request` does, naming each lock it takes, the branch
    on `ResourcePolicy.BookingMode`, where `checkout_hold_minutes` is read, and where
    `hold_expires_at` and `draft_hold_expires_at` are set.
  - Done when: you can state in one sentence what happens to the second organizer when the first is
    approved, and cite the line that makes it happen.

- [ ] **2.2 Establish when the hold actually starts, per policy value** `[inferred]`
  - Read `ResourcePolicy.BookingMode` at `scheduling/models.py:77` onward for its three values.
  - Find every branch on it: `grep -rn "booking_mode" --include=*.py . | grep -v migrations`.
  - Produces: one line per policy value saying what the code does today for that value, and a plain
    "no branch exists for this value" where one does not.
  - Done when: the answer distinguishes what the field can express from what the code acts on. The
    field existing is not the same as the behaviour existing, and the hold diagram must not draw a
    branch nothing takes.
  - 💡 `/unpack backend/main/scheduling/services.py:701-915`: this is the densest path in the scope
    and it decides two of the nine diagrams. Worth reading at your own pace rather than skimming.

- [ ] **2.3 Record what `select_for_update` does here, and say so plainly**
  - `scheduling/services.py:349` and `:576` and `:713` take it. The database is SQLite.
  - Produces: one line saying whether the lock is real on this database, with the environment fact
    that settles it.
  - Done when: the contention diagram has an honest answer to "is this guard load-bearing today", so
    it can draw the guard without implying it holds.

▶ **Next: [task 3.1](#3--establish-what-reaches-a-screen)**.

### 3. 📡 Establish what reaches a screen

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**. Independent of tasks 1
and 2, so it can be done at the same time.

- [ ] **3.1 Trace the chat path from write to socket**
  ```
  cd /home/molef/Work/attica/backend/main
  sed -n '25,60p' notifications/utils.py
  grep -n "notify_new_message\|notify_booking_request\|notify_booking_accepted" chat/views.py
  ```
  - Produces: the sequence for a chat-originated change: what row is written, what group is sent to,
    what the client receives.
  - Done when: it is written down that `notifications/utils.py` does call `group_send`, with the
    line, because the planning notes say nothing does.

- [ ] **3.2 Trace the scheduling path from write to socket, and find where it stops**
  ```
  cd /home/molef/Work/attica/backend/main
  grep -n "def _create_in_app_notification" -A 24 scheduling/services.py
  grep -n "def _dispatch_notification_for_event" scheduling/services.py
  grep -n "def dispatch_outbox_events" -A 20 scheduling/services.py
  ```
  - Produces: the same sequence for a booking-originated change, ending at whatever the last step
    actually is.
  - Done when: the file states, with the line, whether `_create_in_app_notification` reaches the
    channel layer or writes a row and returns. If it writes and returns, that is the single most
    important fact in the real-time delivery diagram and it goes in bold.

- [ ] **3.3 Establish which scheduling commands have a runner**
  ```
  cd /home/molef/Work/attica/backend/main
  ls scheduling/management/commands/
  cd /home/molef/Work/attica && grep -rn "run_outbox_worker\|dispatch_scheduling_outbox\|expire_\|materialize_availability" --include='*.sh' --include='*.yml' --include='*.yaml' --include='*.service' --include='*.cfg' . | grep -v node_modules
  ```
  - Produces: the command list, and the search that looked for anything scheduling them.
  - Done when: it says how many were found scheduled and by what, or states that the search found
    nothing and names what it searched. "Nothing runs them" is a claim, and this is its evidence.

▶ **Next: [task 4.1](#4--establish-whether-convergence-exists)**.

### 4. 🧩 Establish whether convergence exists

◀ **Needs: [task 1](#1--establish-what-a-booking-is-today)**, for the vocabulary.

- [ ] **4.1 Look for a server-computed answer to "is this event ready"**
  ```
  cd /home/molef/Work/attica/backend/main
  grep -rn "ready_for_publish\|is_booking_request_ready" --include=*.py . | grep -v tests.py
  cd /home/molef/Work/attica/frontend
  grep -rn "ready\|canPublish\|convergen" src --include=*.jsx | head -30
  ```
  - Produces: what the server computes per request, what the client computes across requests, and
    which of the two decides whether the publish button is enabled.
  - Done when: it is written plainly whether an event-level projection exists at all. If the client
    invents its own definition of ready, say which file does it.

▶ **Next: [task 5.1](#5--write-the-findings-file)**.

### 5. ✍️ Write the findings file

◀ **Needs: [tasks 1 to 4](#1--establish-what-a-booking-is-today)**, all of them, since the file is
their union.

- [ ] **5.1 Write `artifacts/notes/how-a-booking-happens/what-the-code-does-today.md`**
  - Six sections, in the order given in [Description](#description-what-to-establish).
  - Every claim carries `path:line`. Every count carries the command that printed it.
  - Open it with the date it was read and the commit hash: `git rev-parse --short HEAD`.
  - Anything not established says "unknown", not a guess.
  - Done when: a person who has not opened this codebase can write a diagram brief from this file
    alone, without opening a source file to check.

- [ ] **5.2 Write the grouping's card**
  - Create `artifacts/notes/how-a-booking-happens/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`, with one entry for the findings file: what it shows, how it
    was established, what it lets you say, what it cannot say.
  - Done when: the card explains the provenance in prose, so no folder or filename has to carry it.

- [ ] **5.3 Record every disagreement between this file and the planning notes**
  - A section at the end of the findings file, one line per disagreement: what the note says, what
    the code does, and the line that settles it.
  - Done when: the two already known are in it, plus anything else found. This section is what
    [03](03-brief-the-other-eight.md) reads before writing a single brief.

- [ ] **5.4 Record what Attica's scale is, or that nobody knows it**
  - A section at the end of the findings file answering four questions: how many users are expected,
    how many bookings a day, how many reads per write, and what counts as too slow.
  - Nothing in this repository states any of them, so the expected answer to all four is "unknown",
    and this task's output is a recorded gap with a named owner rather than an invented figure. Say
    who would settle each: the product owner for the first two, a decision for the fourth.
  - Where a number *can* be derived from what exists, derive it and show the command. Row counts in
    the seeded database, and the 478 media files across 51 MB, are real and are the only figures
    available today.
  - Why it sits in this plan: every [caching](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>, indexing and capacity argument downstream is a
    preference until these exist, and this is the plan that establishes facts. The two throttle rates
    picked in
    [close the open door](../../getting-in/plans/04-close-the-open-door.md) are explicitly guesses
    waiting on this section.
  - Done when: four questions, four answers, and no answer is a guess presented as a figure.

▶ **Next: [instruction 6.1](#6--check-the-two-suspect-claims-in-a-browser)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 6.2](#6--check-the-two-suspect-claims-in-a-browser)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
  - A planning document that contradicts the code is a pattern worth a catalog entry, because this
    scope will not be the last one written from those notes.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 6. 🌐 Check the two suspect claims in a browser

◀ **Needs: [task 3](#3--establish-what-reaches-a-screen)**, so you know which claim you are testing.

Reading the code says what it could do. This says what it does, and these two claims are the ones a
wrong answer would put into three diagrams.

6.1 **Bring the stack up and confirm the port**
   - Follow [bringing the stack up § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up).
   - Look at the Vite banner in its terminal. It must read `http://localhost:5173/`.
   - ✅ 5173: continue.
   - ❌ 5174: stop and free 5173 first. `CORS_ALLOWED_ORIGINS` does not name 5174, so every request
     from there fails on [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> and looks exactly like a wrong password.

6.2 **Confirm the [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> actually connects, against the flow map's claim that it cannot**
   - Log in at `http://localhost:5173/login` with Chrome DevTools open.
   - DevTools → Network → filter **WS**. Look for a row whose name begins `notifications`.
   - Click it → Headers. Read the Status.
   - Expected result: `101 Switching Protocols`, meaning the proxy forwarded it and the [middleware](../../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/Middleware.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=53 "System design interview, chapter 4, Design a rate limiter, Works a rate limiter middleware with numbers: an API allows 2 requests a second, a client sends 3,..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=310 "Systems analysis and design, chapter 8, Architecture design, client-server architectures, The older, wider sense of the word: system software installed on bo..."), [▶1](https://www.youtube.com/watch?v=lY6icfhap2o&t=470s "Web Dev Simplified, Learn Express Middleware In 14 Minutes, Authentication middleware, 7:50 to 14:48, An authentication middleware written in Express, after ..."), [▶2](https://www.youtube.com/watch?v=lY6icfhap2o&t=130s "Web Dev Simplified, Learn Express Middleware In 14 Minutes, What is middleware, 2:10 to 3:20, What middleware is, before the examples. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/12-traefik-routes-and-tokens.md "Traefik: routes and tokens, system-design/foundations, plan 12. A ForwardAuth middleware attached to the gateway's four routers hands each request's headers ...")</sub>
     accepted the token from the query string.
   - ✅ 101: the flow map's Step 0 claim is wrong, as the repository instructions say. Write the
     [status code](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> and the full request URL into the findings file's disagreements section.
   - ❌ The row is red, or there is no WS row at all: check the Console for a [proxy](../../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> error, then check
     [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> is running with `redis-cli ping`. A websocket that fails because Redis is down is a
     different fact from one that fails because the proxy has no rule, and the diagram is different
     for each. Write down which one you saw.

6.3 **Watch what arrives when a booking request is created**
   - Keep the WS row selected and open its **Messages** tab, so frames appear as they arrive.
   - In a second tab, drive the wizard far enough to send one booking request to a provider
     (follow [driving the booking flow](../../../../../runbook/driving-the-app/driving-the-booking-flow.md)).
   - Expected result: either a frame appears in the Messages tab within a second or two, or none
     does and the bell only updates after a page reload.
   - ✅ A frame arrives: the scheduling path does reach the socket. Record the frame's `type` field
     verbatim.
   - ✅ No frame arrives, and the notification row appears in the database: the path stops at the
     row, which is what task 3.2 predicted. Record that it stopped, and that the row exists, because
     "nothing happened" and "the row was written and never pushed" are different diagrams.
   - ❌ Nothing arrives and no row is written either: the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker is not running. Start it per
     [the execution model](../../../../../environment/overview.md#execution-model) and repeat. This
     is the failure the overview calls silent, and seeing it once is worth more than reading about
     it.

▶ **Next: [task 5.1](#5--write-the-findings-file)**, which writes down what you saw.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when someone can write a diagram brief from the findings file without opening a
> source file to check it.

Pass:

- Every one of the six sections has content, and anything unestablished says "unknown".
- Every claim carries a `path:line`; every count carries the command that printed it.
- The disagreements section names at least the two already known, each with the line that settles it.
- The [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> [status code](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> from instruction 6.2 is written down verbatim, whatever it was.

Fail, and what it means:

- A section written from the planning notes rather than the code. That is the exact failure this plan
  exists to prevent, and it is invisible later, because a wrong fact with a confident tone reads the
  same as a right one.
- A count with no command beside it. Remove the number rather than keeping it; an uncheckable number
  is decoration.

Partial pass is acceptable on section 6 alone. If convergence genuinely does not exist server-side,
that section is two lines saying so, with the client file that computes it instead, and that is a
complete answer rather than a thin one.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The six-section findings file | `artifacts/notes/how-a-booking-happens/what-the-code-does-today.md` | — | not started |
| The grouping's card | `artifacts/notes/how-a-booking-happens/README.md` | — | not started |
| The disagreements section | inside the findings file | — | not started |
| The scale section: four questions, answered or recorded unknown with an owner | inside the findings file | — | not started |
| The observed [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> [status code](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> | recorded in instruction 6.2, written into the findings file | — | not started |
| One concept, four state machines | [piece 2](../diagram-prompts.md#piece-2-one-concept-four-state-machines-planned--not-rendered) → `../diagrams/subject-02-one-concept-four-machines.png` | subject | ⏳ not rendered |
| Two answers to when a hold starts | [piece 3](../diagram-prompts.md#piece-3-two-answers-to-when-a-hold-starts-planned--not-rendered) → `../diagrams/subject-03-two-answers-one-hold.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-system-in-layers/plans/01-read-the-system-before-drawing-it.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the dense path | `/unpack backend/main/scheduling/services.py:701-915` | task 2.2 | The approval path understood rather than skimmed |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-system-in-layers` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the environment overview](../../../../../environment/overview.md): the four processes, the two access paths, the two [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> databases, the two failing tests.
- [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md): all four terminals, in order.
- [where we landed](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md): the state of the world these findings are checked against, including the claim this plan tests.
- `backend/main/scheduling/models.py:300` and `:396`: the two scheduling representations and their states.
- `backend/main/scheduling/services.py:303`: `get_booking_request_workflow_state`, the projection sitting beside `status`.
- `backend/main/scheduling/services.py:701`: `approve_request`, the contention and hold path.
- `backend/main/notifications/utils.py:25`: the one place a notification reaches the channel layer.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[02-draw-the-layers-map.md](02-draw-the-layers-map.md), which writes the environment folder's first
picture from the facts this plan established.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/learn-codebase /home/molef/Work/attica --focus scheduling` ✅ : produces a rebuild guide over the
booking path, which is most of what sections 1 to 4 of the findings file need, structured rather than
grepped.
   alt: `/unpack backend/main/scheduling/services.py` for the single densest file, when the whole-app
   sweep is more than this plan needs.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A login attempt fails with a [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> error that reads like bad credentials | The browser, when Vite bound 5174 because 5173 was taken | `CORS_ALLOWED_ORIGINS` names 5173 and 3000 only. Free 5173 and restart Vite. |
| A booking request produces no notification anywhere and no error | The app, with the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker not started | Nothing supervises the workers. Start `run_outbox_worker` by hand per the execution model, then repeat the action. |
