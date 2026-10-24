# ⚙️ Build The Runner

Step 3 of 5 in this scope. Waits on [01](01-take-the-execution-decision.md) for the decision and on
[02](02-make-the-commands-honest.md) for commands worth scheduling.
Next: [04-close-the-two-silent-losses.md](04-close-the-two-silent-losses.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to build](#description-what-to-build)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [Code references](#code-references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [running the workers](../MASTER_PLAN.md). Third of five. It waits on both plans before it,
for different things: [01](01-take-the-execution-decision.md) says what to build, and
[02](02-make-the-commands-honest.md) makes sure the thing being scheduled does what its name says.

It also settles the half of a Definition-of-Done item that [02](02-make-the-commands-honest.md)
deliberately left: whether `expire_and_materialize` materialises or is renamed. That question is
about how the jobs are grouped, and the job table is what groups them.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

D7 has been taken and signed, and the job table exists in
`artifacts/notes/running-the-workers/what-runs-the-recurring-work.md`. The commands have been made
honest. Nothing runs any of them yet, and running Attica is still four processes started by hand.

**This is the plan that changes what "running Attica" means.** After it,
[the execution model](../../../../../environment/overview.md#execution-model)'s sentence about four
hand-started processes is wrong, which is why [05](05-prove-it-and-write-it-down.md) rewrites it.

**Three of the ten commands must never end up on a schedule.** `seed_marketplace`,
`seed_booking_workflow` and `seed_booking_summary_demo` write test data. A seed on a clock rewrites
the development database on an interval, and that gets discovered at the end of a long debugging
session. They are excluded by name, not by omission, and the reason is in
[the decisions taken here](../decisions-taken-here.md#three-of-the-ten-must-never-be-on-a-runner).

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority,
plus the three answers [01](01-take-the-execution-decision.md)'s instruction 4 established about
this machine.

- Running Attica today is four processes started by hand, none supervising another, per
  [the execution model](../../../../../environment/overview.md#execution-model).
- The Python environment is `/home/molef/lobola`, and every job this runner starts needs it
  activated. A runner that starts a process outside the virtual environment fails on the first
  import, which reads as a broken job rather than a broken runner.
- Daphne, not `runserver`, for the backend:
  `daphne -b 0.0.0.0 -p 8000 main.asgi:application`.
- [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> is one server carrying two unrelated logical databases: the [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> channel layer on the
  default, the page [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> on database 1. A worker that pushes to a channel group uses the first.
- The database is SQLite and `select_for_update` does not lock on it. **This runner starts one
  worker process, not two**, and says so where somebody would otherwise scale it. PostgreSQL is D6
  and belongs to `contention-and-holds`.
- Whether this machine has systemd, [Docker](../../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub> or a cron daemon is written in
  `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md`, established by running
  three commands rather than assumed.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Build what was decided, not what is convenient once you are in the editor.**

If the implementation turns out to be worse than the candidate table implied, that is a finding that
goes back to [01](01-take-the-execution-decision.md)'s notes and gets the decision retaken with a
signature. Quietly building the runner-up is how a decision record stops describing the system.

**The job list is configuration, and this is the whole reason D2 does not reopen this plan.**

Adding a job is an edit to one file. `contention-and-holds` will add an expiry job when D2 lands,
and it must not have to change the runner to do it. Removing a job from the schedule must not delete
the command.

**A job that fails must be visible without reading Python.**

Whoever is on the other end of this at midnight needs to answer "is it moving", "what is stuck" and
"what died and why", which is [objective 5](../MASTER_PLAN.md#objectives). This plan owns the first
of those three; [05](05-prove-it-and-write-it-down.md) owns the other two. What that means here: the
runner prints what it started, what each cycle did, and what threw, to somewhere a person can read
without attaching a debugger.

**One worker process, said out loud in the code.**

The [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatcher claims an event with a conditional `UPDATE`, which is safe on SQLite for one
worker and unproven for two. Whatever this runner starts, it starts one, and the place where
somebody would add a second carries a comment naming D6 as the thing that has to land first.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**A command that a person has to remember is not a feature of the system, it is a fact about that
person.** This plan is where the recurring work stops depending on anybody's memory.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Every piece of scheduling machinery in this repository already works. The dispatcher cleared 23
pending events in one pass on 2026-08-22. The expiry services emit their events. The materialiser
turns rules into slots. All of it sits still, because the only thing that ever starts it is a person
who remembered.

The cost of that is not an error message. Every write succeeds, every API response looks correct,
and the notification is a row in a table nobody reads. It is the failure shape the environment
overview has to warn readers about, and warning readers is what you do instead of fixing it.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  BEFORE                              AFTER

  person ──► terminal ──► command     runner (from 01's decision)
  person ──► terminal ──► command        │
  person ──► terminal ──► command        ├── job: dispatch outbox   every 30s
     (and the person forgets)            ├── job: expire requests   every 5m
                                         ├── job: materialise slots  daily
                                         │
                                         └── never: the three seeds, by name
                                                    │
                                         one file lists all of it,
                                         and D2 adds its job with a line
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

Two pieces in this scope's map are what this plan turns from a statement of the problem into a
statement of the answer.

**Subject: ten commands and nothing that starts them.** The empty outlined gear in that picture is
what this plan fills, and the ten command glyphs are the job table.
[Piece 1](../diagram-prompts.md#piece-1-ten-commands-and-nothing-that-starts-them-planned--not-rendered).
Save as `../diagrams/subject-01-nothing-starts-them.png`. *(image not yet generated)*

**Subject capstone: the workers glyph, opened up.** Its bottom panel is this plan's deliverable, and
its middle three lanes are the jobs the runner starts.
[The subject capstone](../diagram-prompts.md#the-workers-glyph-opened-up-planned--not-rendered).
Save as `../diagrams/subject-capstone-the-workers-glyph-opened-up.png`. *(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Four things, and the first two are the ones that outlive the third.

1. **One job list, in one file.** Every job the recurring work consists of: its name, the management
   command it runs, its cadence, whether it is enabled, and a one-line reason for the cadence. All
   ten commands appear. The three seeds appear with `enabled: false` and the reason written next to
   them, so a reader can see they were considered and excluded rather than forgotten.
2. **A guard that makes the exclusion structural.** The runner refuses to start any job whose
   command begins `seed_`, and says so when it refuses. A convention in a config file is a comment;
   a refusal is a rule.
3. **The runner itself**, exactly as [01](01-take-the-execution-decision.md) decided: something that
   starts the jobs, restarts one when it dies, and runs each on its cadence. What that is depends on
   the decision and is not pre-answered here.
4. **The recipe for starting and stopping it**, written with `/drip-runbook` while it is being done
   for the first time, so the recipe is true because it was just run rather than because it was
   just written.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 2](../MASTER_PLAN.md#objectives), making the recurring work recurring,
and the first third of [objective 5](../MASTER_PLAN.md#objectives), which is the operator being able
to answer "is it moving".

**Goal.** Every non-seed scheduling command is on the runner, folded into one that is, or deleted
with the reason recorded; the three seeds are excluded by name and the runner refuses to run them;
and a person who has never seen this plan can start and stop the whole thing from the runbook alone.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/03-build-the-runner.md`

▶ **Next: [task 1.1](#1--read-the-decision-before-building-anything)**.

### 1. 📖 Read the decision before building anything

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read the signed decision and the job table**
  - Open `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md`.
  - Produces: the chosen candidate, quoted; the job table's ten rows; and the file shape
    [01](01-take-the-execution-decision.md)'s task 3.2 specified for the job list.
  - Done when: the decision is signed and dated. An unsigned record is a proposal, and building from
    it makes it a decision by default.
  - ❌ If it is unsigned or missing, stop and finish
    [01](01-take-the-execution-decision.md) instead. This is the one dependency in this plan that
    cannot be worked around.

▶ **Next: [task 2.1](#2--write-the-job-list-and-the-guard)**.

### 2. 📋 Write the job list and the guard

◀ **Needs: [task 1](#1--read-the-decision-before-building-anything)**.

- [ ] **2.1 Create the job list at the path the decision named**
  - One entry per job: name, management command, cadence, enabled, and the one-line reason for the
    cadence.
  - All ten commands appear. Confirm the ten against the directory rather than the table:
    ```
    ls /home/molef/Work/attica/backend/main/scheduling/management/commands/*.py
    ```
  - Produces: a file whose ten entries account for every command in that directory.
  - Done when: `ls` and the job list have the same ten names, and any command in one and not the
    other is explained in the file rather than dropped.

- [ ] **2.2 Exclude the three seeds by name, with the reason beside them**
  - `seed_marketplace`, `seed_booking_workflow` and `seed_booking_summary_demo` carry
    `enabled: false` and a one-line reason: they write test data, and a seed on a clock rewrites the
    development database on an interval.
  - Produces: three entries that are visibly excluded rather than absent.
  - Done when: a reader can tell the difference between "considered and excluded" and "forgotten".

- [ ] **2.3 Make the exclusion structural, not conventional**
  - The runner refuses to start a job whose command name begins `seed_`, whatever the config says,
    and prints why it refused.
  - Produces: a guard with a message a person can act on.
  - Done when: flipping `seed_marketplace` to `enabled: true` and starting the runner produces a
    refusal naming the command, and the seed does not run. Try it, then flip it back.

▶ **Next: [task 3.1](#3--build-the-runner-and-settle-the-daemon-grouping)**.

### 3. 🏗️ Build the runner, and settle the daemon grouping

◀ **Needs: [task 2](#2--write-the-job-list-and-the-guard)**.

- [ ] **3.1 Implement the runner as decided**
  - Build exactly the candidate named in the signed decision. Its shape, its files and its start
    command all come from there.
  - Every job starts with `/home/molef/lobola` active and `backend/main` as the working directory. A
    job started outside the virtual environment fails on its first import and reads as a broken job.
  - One worker process for the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>, with a comment at the place a second would be added naming
    D6 and `contention-and-holds` as what has to land first.
  - Produces: something that can be started with one command and stopped with one command.
  - Done when: starting it prints, for each job, the job name and the cadence it will run at; and
    each cycle prints what it did. Silence on start is indistinguishable from not having started.

- [ ] **3.2 Settle whether `expire_and_materialize` materialises or is renamed**
  - This is the half of the Definition-of-Done item [02](02-make-the-commands-honest.md) left,
    and the job table is what decides it. If the table gives materialisation its own row with its
    own cadence, the daemon does not need to do it and its name is wrong. If the table groups them,
    the daemon calls `materialize_slots_for_resource`, whose import already sits unused at
    `backend/main/scheduling/management/commands/expire_and_materialize.py:20`.
  - Produces: one of the two, plus a line in the decision record saying which and why.
  - Done when: the command's name matches what it does, and the unused import is either used or
    gone. An import that exists to hint at intent is a comment that the linter will eventually
    delete.

- [ ] **3.3 Account for every command the job list does not schedule**
  - For each non-seed command not on the runner: folded into one that is (name it), or deleted with
    the reason recorded.
  - Produces: seven non-seed commands, each with one of three states.
  - Done when: no command is in the "we did not get to it" state. That state is what this scope was
    created to remove.

▶ **Next: [instruction 5.1](#5--start-it-yourself-and-watch-one-cycle)**, because a recipe is
written from a run and not from an intention.

### 4. 📓 Write the start-and-stop recipe

◀ **Needs: [instruction 5](#5--start-it-yourself-and-watch-one-cycle)** done, so the recipe records
what actually happened.

- [ ] **4.1 Run the following prompt:** `/drip-runbook starting and stopping the recurring work in Attica`
  - Walk it in `weave` mode with the terminal open beside you, so each step is written as it is
    done and every pasted output is real.
  - Produces: a recipe in `runbook/running-the-web-app/`, per `~/.claude/RUNBOOK_FORMAT.md`, marked
    `ran` rather than `unverified`.
  - Output goes to: `runbook/running-the-web-app/`, and the index row into
    `runbook/00-INDEX.md`.
  - Done when: the recipe answers, with real pasted output: how to start it, how to confirm it
    started, how to stop it, how to confirm it stopped, and what to do when it will not start.
  - ⚠️ This is the first half of the runbook pair this scope owes. The second, how to find out what
    is stuck, is [05](05-prove-it-and-write-it-down.md)'s, and it finishes
    [Stack § 4](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
    rather than opening a file beside it.

- [ ] **4.2 Point the stack recipe at the new one**
  - [Bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md)
    describes four hand-started processes. Add the runner where it belongs in that order and link
    the new recipe.
  - Done when: someone following the stack recipe from the top ends up with the recurring work
    running, without having read this plan.

▶ **Next: [instruction 6.1](#6--have-somebody-else-start-it-from-the-recipe-alone)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 6](#6--have-somebody-else-start-it-from-the-recipe-alone)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern --from-run-log` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 5. ▶️ Start it yourself, and watch one cycle

◀ **Needs: [task 3](#3--build-the-runner-and-settle-the-daemon-grouping)**.

The runner is a process, and a process is judged by what it prints when it is doing its job and what
it prints when it is not. This is where you find out which.

5.1 **Bring the stack up first**
   - Follow [bringing the stack up § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up),
     with Daphne rather than `runserver`.
   - Confirm [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> answers: `redis-cli ping` prints `PONG`.
   - ✅ `PONG` and the backend is up: continue.
   - ❌ Redis is down: start it first. Every job that pushes to a channel group needs it, and a
     worker that cannot reach Redis logs a warning and keeps going, which looks like working.

5.2 **Start the runner and read what it prints**
   - Run the start command from [task 3.1](#3--build-the-runner-and-settle-the-daemon-grouping).
   - Expected result: one line per enabled job, naming the job and its cadence, then the process
     stays up.
   - ✅ Every enabled job in the list is named in the output: continue. Count them against the file.
   - ❌ Fewer lines than enabled jobs: a job failed to start and the runner did not say so. That is
     the failure this whole scope exists to remove, appearing in the thing built to remove it. Fix
     it before going further.

5.3 **Watch one [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> cycle do something**
   - In a second terminal, create work for it: drive one booking request through the app
     (follow [driving the booking flow](../../../../../runbook/driving-the-app/driving-the-booking-flow.md)).
   - Watch the runner's output.
   - Expected result: within one dispatch interval, a line reporting a processed count above zero.
   - ✅ A processed count appears: the runner is doing the job a person used to do by hand. Write
     the line down verbatim; [05](05-prove-it-and-write-it-down.md) pastes it into the runbook.
   - ❌ Nothing appears and the outbox has pending rows: the job is scheduled and not running. Check
     the working directory and the virtual environment first, in that order, because those are the
     two that fail silently.

5.4 **Stop it and confirm it stopped**
   - Send it the stop command from [task 3.1](#3--build-the-runner-and-settle-the-daemon-grouping).
   - Expected result: a shutdown line, then the process exits.
   - ✅ It exits within a few seconds: the existing daemons already handle SIGINT and SIGTERM by
     sleeping in half-second increments, so a clean stop is expected.
   - ❌ It hangs: note how long you waited and what you had to do. That belongs in the recipe's ❌
     branch, and it is exactly the thing nobody writes down.

▶ **Next: [task 4.1](#4--write-the-start-and-stop-recipe)**, which turns this run into the recipe.

### 6. 🧊 Have somebody else start it from the recipe alone

◀ **Needs: [task 4](#4--write-the-start-and-stop-recipe)**, so there is a recipe to test.

A recipe written by the person who built the thing is a recipe with the author's memory filling its
gaps. This is the only way to find out where those gaps are.

6.1 **Find a cold reader and give them one link**
   - Someone who does not have this plan open. Give them the runbook recipe and nothing else.
   - Ask them to do two things: start the recurring work, and find out whether it is running.

6.2 **Watch without helping, and write down every question they ask**
   - Do not answer questions during the walk. Write each one down.
   - ✅ They start it and confirm it is running, asking nothing: the recipe is done.
   - ❌ They ask anything: that question is a missing step. Add it to the recipe, in their words,
     at the point they asked it. A question answered in person and not written down will be asked
     again by the next person and by you in six months.

6.3 **Record the result in the decision record**
   - One line: who walked it, what they asked, and what changed in the recipe.
   - This is the Definition-of-Done criterion about a cold terminal, and it is only satisfied by
     somebody who did not write the plan.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when starting Attica the way the runbook says leaves the recurring work already
> running, and nobody had to remember anything.

Pass:

- The job list accounts for all ten commands, and `ls` of the commands directory matches it name for
  name.
- The three seeds carry `enabled: false` with their reason, and the runner refuses to start a
  `seed_` job even when the config says otherwise. This was tried, not assumed.
- The runner prints one line per enabled job on start, and a real dispatch cycle was watched
  processing something above zero.
- A person who did not write the plan started it, confirmed it was running, and stopped it, from the
  recipe alone.
- Every non-seed command is on the runner, folded into one that is, or deleted with the reason
  recorded.

Fail, and what it means:

- The runner starts silently. Then "is it running" is answered by `ps`, and the operator objective
  is not met.
- A seed enabled by accident and nothing stopped it. The guard is the whole difference between a
  convention and a rule.
- The cold-terminal walk done by the person who wrote the recipe. That proves the author remembers
  what they wrote.

Partial pass is acceptable on [task 3.2](#3--build-the-runner-and-settle-the-daemon-grouping)
alone: renaming the daemon is a complete answer and so is making it materialise, but leaving its
name describing a job it does not do is not.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The job list, ten entries | the path named in the decision record | — | not started |
| The `seed_` guard and its refusal message | in the runner | — | not started |
| The runner itself | as the signed decision specifies | — | not started |
| The start-and-stop recipe, marked `ran` | `runbook/running-the-web-app/` | — | not started |
| The cold reader's questions and what changed | `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md` | — | not started |
| Ten commands and nothing that starts them | [piece 1](../diagram-prompts.md#piece-1-ten-commands-and-nothing-that-starts-them-planned--not-rendered) → `../diagrams/subject-01-nothing-starts-them.png` | subject | ⏳ not rendered |
| The workers glyph, opened up | [the subject capstone](../diagram-prompts.md#the-workers-glyph-opened-up-planned--not-rendered) → `../diagrams/subject-capstone-the-workers-glyph-opened-up.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/03-build-the-runner.md` | task 0, before any work | Conformance and thin instructions reported |
| Write the recipe while doing it | `/drip-runbook starting and stopping the recurring work in Attica` | task 4.1, after instruction 5 | A recipe marked `ran`, with real output pasted in |
| Capture patterns | `/ingest-error-pattern --from-run-log` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers` | the close out | Statuses and running order match reality |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

**`run_outbox_worker.py::Command.handle`** is the shape a daemon here already takes, and whatever
the runner starts should not fight it. It handles SIGINT and SIGTERM, sleeps in half-second
increments so a stop is prompt, catches exceptions per cycle so one failure does not kill the loop,
and prints only when something happened:

```python
if result["processed"] or result["failed"]:
    self.stdout.write(f"[outbox] processed=… failed=… dead_lettered=…")
```

That last line is worth keeping and worth extending: a cycle that did nothing prints nothing today,
which is fine for a log and not fine for the question "is it moving". Decide which of the two the
runner's output serves, and say which in the recipe.

**The guard from [task 2.3](#2--write-the-job-list-and-the-guard)** belongs wherever the runner
reads the job list, before anything is started:

```python
if command_name.startswith("seed_"):
    raise <the runner's own configuration error>(
        f"{command_name} writes test data and must never be scheduled."
    )
```

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[04-close-the-two-silent-losses.md](04-close-the-two-silent-losses.md), which makes the events this
runner dispatches actually reach a screen, and returns the ones a dying worker stranded.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/drip-runbook starting and stopping the recurring work in Attica` ✅ : it is
[task 4.1](#4--write-the-start-and-stop-recipe) outright, and running it during instruction 5 rather
than after is what makes the recipe true.
   alt: `/runbook-pulse @runbook --capture` when the walk has already happened and the terminal
   history is still open.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A scheduled job fails on its first import and looks like a broken job | Any process started without `/home/molef/lobola` active | The runner activates the environment and sets `backend/main` as the working directory for every job. |
| A worker cannot reach [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub>, logs a warning, and keeps going | The notification push path, with Redis down | `redis-cli ping` before starting anything. A warning in a log nobody reads is the same as silence. |
| A backlog in `scheduling_outboxevent` read as a broken dispatcher | The [outbox table](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>, 2026-08-22 | The dispatcher cleared 23 pending in one pass. A backlog means nobody ran the worker, which is what this plan ends. |
