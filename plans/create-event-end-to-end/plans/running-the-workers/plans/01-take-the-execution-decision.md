# 🧭 Take The Execution Decision

Step 1 of 5 in this scope. Waits on `one-booking-truth`, which is the parent's condition for the
whole scope. Next: [02-make-the-commands-honest.md](02-make-the-commands-honest.md).

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

Scope: [running the workers](../MASTER_PLAN.md). First of five, and it must go first: plans
[03](03-build-the-runner.md), [04](04-close-the-two-silent-losses.md) and
[05](05-prove-it-and-write-it-down.md) all build on top of whatever this plan decides, and a runner
built before the decision is a candidate that won by being written first.

[02](02-make-the-commands-honest.md) is the exception. It depends on nothing this plan produces and
can be done at the same time.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing in this scope is built. Ten management commands exist in
`backend/main/scheduling/management/commands/` and nothing runs any of them. There is no scheduler
of any kind in the repository: no Celery, no cron file, no systemd unit, no supervisor config, no
[Dockerfile](../../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub>, no Procfile.

**This plan takes D7**, the seventh of the programme's
[open decisions](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions):
what runs the recurring work. It is deliberately not pre-answered anywhere in this folder, and the
reason is in [the decisions taken here](../decisions-taken-here.md#d7-is-left-open-rather-than-answered-here).

**Two other decisions reach in, and this plan reads them rather than guessing them.** D1 decides
which booking representation survives, and the parent's running order answers it before this scope
starts. D2 decides when a hold starts, and it stays open for the whole of this scope, which is why
the job list this plan writes is configuration rather than structure.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- Running Attica today is four processes started by hand, and none supervises another, per
  [the execution model](../../../../../environment/overview.md#execution-model). The fourth is the
  [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker, and the overview already names it as the one a plan forgets. This plan is where
  that sentence starts to stop being true.
- The Python environment is `/home/molef/lobola`. Activate it with
  `source /home/molef/lobola/bin/activate` before anything with `manage.py`.
- Daphne, not `runserver`, for anything touching [websockets](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>:
  `daphne -b 0.0.0.0 -p 8000 main.asgi:application`.
- The database is SQLite at `backend/main/db.sqlite3`, one file, no server. `select_for_update` does
  not lock on it. PostgreSQL is D6 and belongs to `contention-and-holds`, so this plan assumes one
  worker process and says so rather than assuming the database will have changed.

**One fact this plan needs is not written in `environment/` and must not be inferred**: what this
machine can supervise. This is WSL2, where systemd is present in some configurations and absent in
others, and [Docker](../../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub> may or may not be reachable. [Instruction 4](#4--find-out-what-this-machine-can-actually-supervise)
establishes it by running two commands and reading their output, because a candidate that does not
exist on the machine is not a candidate.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This is a deciding plan, not a building plan.**

Nothing here starts a process, writes a unit file or edits a command. The deliverable is a written
decision with the losers and their reasons, plus a job table. [03](03-build-the-runner.md) builds
whatever this plan chose. Resist starting the implementation: a half-built runner is the strongest
argument in the room for the candidate it happens to be, and it is not an argument about merit.

**The decision is a person's, and the plan says where the person makes it.**

[Instruction 5](#5--take-the-decision-and-sign-it) is where it is taken. Everything before it is
evidence-gathering, and everything after it is transcription. A decision record written before the
person has read the table is a record of what the writer preferred.

**Three jobs, one problem.**

Expiry, availability materialisation and [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatch differ in cadence and in nothing else. All
three need something that starts a process, restarts it when it dies, and runs work on a clock.
Solving them separately buys three things to operate where one would do, which is
[objective 1](../MASTER_PLAN.md#objectives).

**Cadence is configuration, and this is what makes D2 survivable.**

D2 changes which expiry jobs exist and how fast they run. It changes nothing else about a runner. So
the job list lands in one place a person can edit, and `contention-and-holds` adds its job with a
line rather than a rewrite. Hard-coding today's two expiry jobs would look correct and would need
undoing the moment D2 landed on request-time holds. The reasoning is in
[the decisions taken here](../decisions-taken-here.md#what-written-against-d2-being-unmade-means-concretely).

**A candidate that a deployment decision would delete is still allowed to win.**

D9, deployment, does not exist yet: [continuous integration](../../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/07-two-remotes-two-branch-rules.md "Two remotes, two branch rules, a refused push, system-design/devops-and-deployment, plan 07. Branch protection on GitHub and a branch policy on Azure Repos c...")</sub> exists and nothing ships
(`getting-it-out`, scope 13). The rule this plan works under is to label each candidate by what a
future deployment decision would do to it, not to wait for one. A candidate marked "would be redone"
can still be the right answer for a machine that is the only machine today, as long as the label is
written down where the person taking D9 will see it.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**One decision, written down with its losers, is worth more than the runner it produces**, because
the runner will be replaced when Attica gets a deployment mechanism and the reasoning will not.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

The scheduling work is already written. Ten commands, a dispatcher that provably works
([Stack § 4](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox),
run on 2026-08-22: 23 pending, `processed=23 failed=0 dead_lettered=0`), an [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> with retries and
dead-lettering, and two daemons that wrap five of the other commands. None of it runs, because
nothing was ever chosen to run it.

The temptation is to pick the nearest thing that works, which on this machine would be a terminal
somebody remembers to open. That is what happens today, and it is why the environment overview has
to warn readers about the process a plan forgets. Choosing deliberately, once, and writing down what
lost, is the difference between an execution tier and a habit.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  THREE JOBS THAT LOOK LIKE THREE PROBLEMS

  expire      ─┐
  materialize ─┼──►  all three need: start it, restart it, run it on a clock
  dispatch    ─┘                          │
                                          ▼
                              ┌───────  D7  ───────┐
                              │  candidates, each  │
                              │  labelled by what  │
                              │  D9 would do to it │
                              └─────────┬──────────┘
                                        │  a person chooses
                                        ▼
                          decision record  +  job table
                                        │
                            03 builds exactly this
                            and nothing it did not say
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-establish) ➡️

Two pieces in this scope's map are drawn from what this plan establishes.

**Subject: ten commands and nothing that starts them.** The state this plan opens in, and the
picture whose empty gear this plan fills.
[Piece 1](../diagram-prompts.md#piece-1-ten-commands-and-nothing-that-starts-them-planned--not-rendered).
Save as `../diagrams/subject-01-nothing-starts-them.png`. *(image not yet generated)*

**Subject: one clock, three cadences, and the one still open.** The three intervals on that picture
are the ones task 3.1 writes into the job table, and the empty fourth is D2's.
[Piece 5](../diagram-prompts.md#piece-5-one-clock-three-cadences-and-the-one-still-open-planned--not-rendered).
Save as `../diagrams/subject-05-one-clock-three-cadences.png`. *(image not yet generated)*

## Description: what to establish

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

One markdown file, `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md`, holding
four sections.

1. **What the two open decisions say today.** D1's answer as `one-booking-truth` recorded it, and
   D2's state, which is expected to be open. Each with the file it was read from and the date.
2. **The job table.** One row per job the recurring work consists of: what it does, which command
   runs it, the cadence, and why that cadence. Three rows carry `never` in the cadence column and
   name the seeds by name.
3. **The candidates, with what each costs.** One row per candidate, scored against the criteria in
   [task 2.2](#2--build-the-candidate-table), each carrying the deployment-fragility label from
   [task 2.3](#2--build-the-candidate-table) and a line saying whether it exists on this machine.
4. **The decision, and every loser with its reason.** One paragraph per losing candidate. A loser
   with no reason is a candidate somebody forgot rather than rejected.

## Purpose and goal

Navigation: ⬅️ [Description: what to establish](#description-what-to-establish) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 1](../MASTER_PLAN.md#objectives), taking one infrastructure decision
instead of three, and give [03](03-build-the-runner.md) something to build that is not the writer's
preference.

**Goal.** `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md` exists, its job
table names all ten commands with the three seeds carrying `never`, every candidate carries a
deployment-fragility label and an exists-on-this-machine answer, and the chosen one is signed and
dated by a person.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/01-take-the-execution-decision.md`

▶ **Next: [task 1.1](#1--read-the-answers-this-plan-is-not-allowed-to-guess)**.

### 1. 📖 Read the answers this plan is not allowed to guess

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read what `one-booking-truth` decided about D1, and write it down verbatim**
  - The scope lives at `plans/create-event-end-to-end/plans/one-booking-truth/` once it is
    decomposed. Read its master plan and its decision record.
  - Produces: one paragraph naming the surviving booking representation, the file the answer was
    read from, and the date.
  - Done when: the answer is quoted, not summarised. This decides which of the two notification
    writers [04](04-close-the-two-silent-losses.md) keeps and which it migrates, and a summary of a
    summary is how the wrong one gets kept.
  - ❌ If the scope does not exist yet or has taken no decision, write "D1 unanswered on
    `<date>`" and stop this plan. The parent's running order has this scope waiting on
    `one-booking-truth`; if that is not true yet, the wait is real and not a formality.

- [ ] **1.2 Record D2's state, whichever it is**
  - Read `plans/create-event-end-to-end/plans/contention-and-holds/` if it exists.
  - Produces: one line, either "D2 taken on `<date>`: holds start at `<request time | acceptance>`,
    per `<file>`" or "D2 open as of `<date>`".
  - Done when: the line exists either way. D2 being open is the expected answer and it is a fact to
    record, not a blocker: it is why the job list is configuration.

▶ **Next: [instruction 4.1](#4--find-out-what-this-machine-can-actually-supervise)**, because the
candidate table cannot be built without knowing what exists on the machine.

### 2. 📊 Build the candidate table

◀ **Needs: [instruction 4](#4--find-out-what-this-machine-can-actually-supervise)** done, so each
candidate carries a real exists-here answer rather than an assumption.

- [ ] **2.1 List every job, its command, and its cadence today**
  ```
  cd /home/molef/Work/attica/backend/main
  ls scheduling/management/commands/*.py
  grep -n "default=" scheduling/management/commands/run_outbox_worker.py \
                     scheduling/management/commands/expire_and_materialize.py
  ```
  - Produces: ten rows. Command name, what it does, whether it is a one-shot or a daemon, and the
    interval default where it has one.
  - Known starting points, to be confirmed rather than trusted: `run_outbox_worker` defaults to
    `--interval 30 --limit 100`; `expire_and_materialize` defaults to `--interval 300`; the other
    five non-seed commands are one-shots taking `--limit 500` or a date range.
  - Done when: the table has ten rows, the three seeds (`seed_marketplace`, `seed_booking_workflow`,
    `seed_booking_summary_demo`) are marked `never` in the cadence column, and the two daemons are
    marked as wrapping which other commands.

- [ ] **2.2 Write the candidate table against five criteria**
  - The criteria, in this order: does it exist on this machine today (from
    [instruction 4](#4--find-out-what-this-machine-can-actually-supervise)); does it restart a dead
    process without a person; can a job's cadence be changed without editing Python; how many new
    things does it add to operate; what does it cost to learn for someone who has never run it.
  - The candidates to score, at minimum. Add any the reading turns up rather than treating this as
    closed:
    - **A process supervisor on the host**, running the two existing daemon commands. This is what
      `run_outbox_worker`'s own docstring names (systemd, supervisord, a [Docker](../../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub> CMD).
    - **Cron entries, one per one-shot command.** No daemon, no restart problem, no supervision.
    - **Celery with beat**, which `run_outbox_worker`'s docstring names as the thing not introduced
      yet. Adds a broker and two more processes.
    - **An in-process scheduler** (`django-q`, `APScheduler`, or similar) started with the ASGI app,
      so there is nothing extra to start.
    - **A single foreground script** that runs the loop, meant to be started by whatever eventually
      deploys Attica.
  - Produces: one row per candidate with a plain answer in each of the five columns. Not a score out
    of ten.
  - Done when: no cell says "depends". Where a candidate genuinely cannot be judged on a criterion
    without D9, write "needs the deployment answer" in that cell, which is a different statement.

- [ ] **2.3 Label every candidate by what a deployment decision would do to it**
  - Three labels only: `survives` (works wherever Attica ends up), `reconfigured` (the same tool,
    different wiring), `redone` (thrown away and replaced).
  - Produces: one label per candidate, with the sentence justifying it.
  - Done when: every row has a label, including the winner. The winner's label is the one thing
    `getting-it-out` will want and the one thing nobody will remember to write later.
  - 💡 `/unpack` the docstrings at `backend/main/scheduling/management/commands/run_outbox_worker.py:1-18`
    and `expire_and_materialize.py:1-13`: both name the supervision they expect, and both are
    evidence for the table rather than a decision already taken.

▶ **Next: [instruction 5.1](#5--take-the-decision-and-sign-it)**, which is where a person chooses.

### 3. ✍️ Write the decision record

◀ **Needs: [instruction 5](#5--take-the-decision-and-sign-it)** done, so there is a decision to
record rather than a preference to justify.

- [ ] **3.1 Write `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md`**
  - Four sections, in the order given in [Description](#description-what-to-establish).
  - Open it with the date and the commit: `git rev-parse --short HEAD`.
  - Every losing candidate gets its own paragraph naming why it lost. "Not chosen" is not a reason.
  - Done when: a person who was not in the room can say what was chosen, what it beat, and what
    would have to be true for a different answer to win.

- [ ] **3.2 Write down where the job list will live**
  - One section naming the file [03](03-build-the-runner.md) will create, and the shape of one
    entry: the job's name, the command, the cadence, and whether it is enabled.
  - Produces: the contract [03](03-build-the-runner.md) implements and `contention-and-holds` later
    adds a line to.
  - Done when: it is stated plainly that adding a job is an edit to one file and nothing else, and
    that removing a job from the schedule does not delete the command.

- [ ] **3.3 Write the grouping's card**
  - Create `artifacts/notes/running-the-workers/README.md` per `~/.claude/ARTIFACT_TREE_FORMAT.md`,
    with one entry for the decision record: what it holds, how it was established, what it lets you
    say, what it cannot say.
  - Done when: the provenance is in the card as prose, so no folder or filename has to carry it.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 3](#3--write-the-decision-record)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 🖥️ Find out what this machine can actually supervise

◀ **Needs: [task 1](#1--read-the-answers-this-plan-is-not-allowed-to-guess)**.

This is WSL2. Systemd is available in some WSL configurations and absent in others, and nothing in
`environment/` records which this is. A candidate scored without this answer is scored against a
machine nobody has.

4.1 **Ask whether systemd is running**
   - Open a terminal in WSL and run:
     ```bash
     systemctl is-system-running
     ```
   - Expected result: one word.
   - ✅ `running` or `degraded`: systemd is up. User units are available, so
     `systemctl --user` is a real candidate. Also run `systemctl --user status` and note whether it
     answers, because the user manager can be absent while the system one is up.
   - ❌ `Failed to connect to bus`, `offline`, or command not found: systemd is not managing this
     machine. Any systemd candidate is `redone` on this host, whatever a future deployment does.
     Write the exact error text into the notes; "systemd did not work" is not reproducible and the
     error is.

4.2 **Ask whether [Docker](../../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub> is reachable**
   ```bash
   docker info --format '{{.ServerVersion}}'
   ```
   - Expected result: a version string, or an error saying the daemon is not reachable.
   - ✅ A version prints: a Docker CMD candidate exists here.
   - ❌ Anything else: it does not, today. Record the error text.

4.3 **Ask whether cron is running**
   ```bash
   pgrep -a cron || echo "no cron daemon"
   ```
   - Expected result: a process line, or the fallback text.
   - ✅ A process line: a crontab entry would actually fire.
   - ❌ `no cron daemon`: a crontab can be written and nothing will run it, which is the worst
     failure shape in this whole scope because it looks exactly like success. Write it down.

4.4 **Write the three answers into the notes file, verbatim**
   - Three lines, each with the command, its output, and the date. These are environment facts and
     [05](05-prove-it-and-write-it-down.md) hands them to `/env-pulse @environment`.

▶ **Next: [task 2.1](#2--build-the-candidate-table)**, which scores the candidates against what you
just found.

### 5. ⚖️ Take the decision and sign it

◀ **Needs: [task 2](#2--build-the-candidate-table)** done, so there is a table to read.

This is D7. Nobody else takes it, and no plan in this folder pre-answers it.

5.1 **Read the candidate table end to end before forming a view**
   - Open `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md`.
   - Read the exists-here column first, because it removes candidates without any argument.
   - ✅ At least one candidate exists on this machine and restarts a dead process: choose among
     those.
   - ❌ No candidate does both: that is a real finding and the answer is the least-bad candidate
     plus a written statement of what it does not do. Do not invent a candidate to escape it.

5.2 **Say the decision out loud in one sentence, then write it**
   - The sentence has this shape: "The recurring work runs under `<candidate>`, because
     `<the criterion that decided it>`, and a deployment decision would `<label>` it."
   - ✅ You can say it without reading the table: the decision is clear enough to build from.
   - ❌ You cannot say it in one sentence: the table is missing a criterion. Go back to
     [task 2.2](#2--build-the-candidate-table) and add it rather than deciding around it.

5.3 **Sign and date it**
   - Write your name and the date under the decision in the notes file.
   - This is what makes it a decision rather than a proposal, and it is what
     [03](03-build-the-runner.md)'s first task reads.

▶ **Next: [task 3.1](#3--write-the-decision-record)**, which writes it down in full.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when someone can build the runner from the notes file without asking anybody
> what was chosen or why.

Pass:

- The job table has ten rows and the three seeds carry `never` and are named.
- Every candidate carries an exists-here answer taken from a command that was run, a
  deployment-fragility label, and, if it lost, a paragraph saying why.
- The decision is signed and dated by a person.
- D1's answer is quoted from the file it was read from, and D2's state is recorded whichever it is.

Fail, and what it means:

- A candidate scored on the exists-here criterion without
  [instruction 4](#4--find-out-what-this-machine-can-actually-supervise) having been run. That is
  the failure this plan is most exposed to, because every candidate is plausible on a machine
  nobody checked.
- A decision record written before instruction 5. Then the record is the writer's preference with a
  table attached, and the table will be read as evidence for it.
- D1 summarised rather than quoted. The two notification writers belong to two different booking
  representations and [04](04-close-the-two-silent-losses.md) keeps one of them.

Partial pass is acceptable on the candidate list alone. Four candidates scored honestly beats six
where two were scored from memory.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The decision record, four sections | `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md` | — | not started |
| The grouping's card | `artifacts/notes/running-the-workers/README.md` | — | not started |
| The job table, ten rows | inside the decision record | — | not started |
| What this machine can supervise, three commands and their output | inside the decision record, from instruction 4 | — | not started |
| Ten commands and nothing that starts them | [piece 1](../diagram-prompts.md#piece-1-ten-commands-and-nothing-that-starts-them-planned--not-rendered) → `../diagrams/subject-01-nothing-starts-them.png` | subject | ⏳ not rendered |
| One clock, three cadences, and the one still open | [piece 5](../diagram-prompts.md#piece-5-one-clock-three-cadences-and-the-one-still-open-planned--not-rendered) → `../diagrams/subject-05-one-clock-three-cadences.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/01-take-the-execution-decision.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the docstrings that name their own supervisor | `/unpack backend/main/scheduling/management/commands/run_outbox_worker.py` | task 2.3 | The evidence read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the scope's master plan](../MASTER_PLAN.md): what is true today, with a line number on every claim.
- [the decisions taken here](../decisions-taken-here.md): why D7 is left open for this plan and why D9 is a constraint rather than a dependency.
- [the open decisions](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions): D1, D2, D6, D7 and D9 in their own words.
- [the execution model](../../../../../environment/overview.md#execution-model): the four processes started by hand, and the one a plan forgets.
- [drain the outbox](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox): the real run proving the dispatcher works, which is why this scope is about the runner and not the dispatch.
- `backend/main/scheduling/management/commands/run_outbox_worker.py:1`: the docstring naming systemd, supervisord and a [Docker](../../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub> CMD.
- `backend/main/scheduling/management/commands/expire_and_materialize.py:1`: the docstring claiming a single supervised process group.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[02-make-the-commands-honest.md](02-make-the-commands-honest.md), which fixes the two commands that
are wrong as well as inert, so nothing dishonest goes onto the runner
[03](03-build-the-runner.md) builds. It waits on nothing from here and can be done at the same time
as this plan.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. The work is a decision taken by a person against evidence gathered by
hand, and the two skills that come closest do the wrong half:
`/experiment-planner` designs runs, `/refine-plan` edits plan text.
   also: `/env-pulse @environment` in [05](05-prove-it-and-write-it-down.md) is where instruction 4's
   three answers become environment facts, so they do not have to be rediscovered.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A booking request produces no notification anywhere and no error | The app, with the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker not started | Nothing supervises the workers. Start `run_outbox_worker` by hand per the execution model, then repeat the action. This scope is why that stops being the answer. |
| A backlog in `scheduling_outboxevent` read as a broken dispatcher | The outbox table, 2026-08-22 | The dispatcher cleared 23 pending in one pass. A backlog means nobody ran the worker, not that dispatch is broken. |
