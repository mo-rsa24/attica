# 📖 Prove It And Write It Down

Step 5 of 5 in this scope. Waits on [04](04-close-the-two-silent-losses.md), because it writes down
what is true only after the last change has landed.
Next: the scope's close out.

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

Scope: [running the workers](../MASTER_PLAN.md). Fifth of five, and last for a reason that is not
tidiness: every sentence it writes describes the system after plans
[01](01-take-the-execution-decision.md) to [04](04-close-the-two-silent-losses.md) have landed, and
a sentence written earlier would describe a system that no longer exists by the time anyone reads it.

It owns two of the three questions from [objective 5](../MASTER_PLAN.md#objectives). "Is it moving"
is [03](03-build-the-runner.md)'s, and it is answered by the runner's own logging. "What is stuck"
and "what died and why" are here, and neither has an answer today.

It also owns the two folders this scope made untrue.
[03](03-build-the-runner.md) made the four-hand-started-processes sentence wrong, and
[04](04-close-the-two-silent-losses.md) made the never-pushes gap wrong. Both are rewritten here,
once, rather than four times as each plan lands.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

The recurring work runs, every non-seed command is on it, stranded events come back, and a booking
change reaches a screen without a refresh. All of that is true and none of it is written down
anywhere a person would look.

**Three statements in two folders are now false**, and each was true when it was written.

[The execution model](../../../../../environment/overview.md#execution-model) opens with
"Running Attica means four processes, started by hand, in this order", and lists the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker
as the fourth with a note that it is the one a plan forgets. After [03](03-build-the-runner.md) that
is wrong in both directions: something starts the recurring work, and the list of things a person
starts by hand has changed.

[The known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints) says
the booking-request write path never pushes to the channel layer, and that [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> is "fully
configured, running, and unused on this path". After [04](04-close-the-two-silent-losses.md) it
pushes, over the same group the chat path uses.

[Stack § 4](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
carries the same claim in its ❌ branch, pointing at the known gap that is about to stop existing.

**And one question nothing answers.** That recipe tells you how many events are pending, with a real
run pasted in from 2026-08-22. It does not tell you what is stranded in `processing`, and it does not
tell you what dead-lettered or why. Those are the two things a person needs at midnight, and both
now have a real answer for the first time: the reaper gives `processing` a [timeout](../../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Timeout.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=146 "System design interview, chapter 9, Design a web crawler, Short timeout, A crawler gives each web server a maximal wait time and, when a host does not answer..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=362 "System design big archive, How to Debug a Slow API?, Set aggressive timeouts and retries on third-party calls such as Stripe or Google Maps, so one slow prov..."), [▶1](https://www.youtube.com/watch?v=2GAQVXGT_Zw&t=150s "Hussein Nasser, Frontend and Backends Timeouts, Connection Timeout, 2:30 to 5:00, The first of the timeouts a backend sets, before read, wait, usage and resp..."), [▶2](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts set on calls between services..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/14-payment-notification-and-a-timeout.md "Payment, notification, and a timeout, system-design/foundations, plan 14. The order service calls payment with httpx and a 2-second timeout; a card ending 00...")</sub> worth reporting,
and the dead-letter table has rows in it that can be read and replayed.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

**The two stale statements live in one file.** Both are sections of
[the environment overview](../../../../../environment/overview.md), which is the file a session is
told to read before planning anything. That is what makes them worth a plan rather than a footnote:
a wrong sentence there is read first and believed.

**Stack § 4 already exists and is marked `ran 2026-08-22`**, with real pasted output: 23 pending and
8 sent before, `processed=23 failed=0 dead_lettered=0`, 31 sent and nothing pending after. It gets
finished, never duplicated. A second recipe answering the same question with different numbers is
how a runbook stops being trusted.

**The runbook index lists every recipe as the question it answers**, per
[the runbook index](../../../../../runbook/00-INDEX.md). A new answer needs a new question in that
table or nobody finds it.

**[Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> is one server carrying two unrelated logical databases**: the channel layer on the default,
the page [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> on database 1. Any "what is stuck" answer that says "restart Redis" or "flush it"
without saying which one is an instruction to silently drop live [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> groups.

**Two of the 43 backend tests already fail**, per
[the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints), so a
green suite is not available as a check that a document is right. The check here is a person
following the document from a cold terminal.

**The Django admin is on the backend port and needs a staff account no seed creates**, per
[the admin site](../../../../../environment/django-admin/the-admin-site.md). Instruction 4 reads a
dead-lettered row there, so that account has to exist before it starts.

Where a fact this plan needs is not written in that folder, stop and ask rather than inferring it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Finish the recipe, do not write a new one.**

The temptation is a fresh file called something like "finding out what is stuck", because it is
easier to write a clean page than to edit someone else's. Stack § 4 is already the page a person
lands on when notifications do not arrive, it already has a real run in it, and the questions this
plan answers are the next two that person asks. Splitting them across two files means the second is
found by whoever already knew it existed.

**`/env-pulse` audits, it does not author.**

The rewrite is a task in this plan with the new sentences written by hand. The pulse is the check
that runs afterwards and reports what still disagrees. Running the pulse and expecting it to fix the
sentences is the most likely way this plan produces nothing.

**A recipe can only be tested by somebody who cannot see the plan.**

Anyone holding this file will fill a gap from memory without noticing they filled it, and then
record that the recipe worked. That is why instruction 5 is written as a cold terminal with only the
recipe open, and why it is better still if another person does it.

**Do not invent a monitoring surface.**

"What is stuck" is a status count against `scheduling_outboxevent`, and "what died and why" is a row
in the Django admin with an `error_message` on it. Both exist. A dashboard, a new management command
that only prints, or a metrics endpoint would all be this scope quietly growing a sixth plan.

**Write the number the reaper actually uses.**

[04](04-close-the-two-silent-losses.md) sets a [timeout](../../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Timeout.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=146 "System design interview, chapter 9, Design a web crawler, Short timeout, A crawler gives each web server a maximal wait time and, when a host does not answer..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=362 "System design big archive, How to Debug a Slow API?, Set aggressive timeouts and retries on third-party calls such as Stripe or Google Maps, so one slow prov..."), [▶1](https://www.youtube.com/watch?v=2GAQVXGT_Zw&t=150s "Hussein Nasser, Frontend and Backends Timeouts, Connection Timeout, 2:30 to 5:00, The first of the timeouts a backend sets, before read, wait, usage and resp..."), [▶2](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts set on calls between services..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/14-payment-notification-and-a-timeout.md "Payment, notification, and a timeout, system-design/foundations, plan 14. The order service calls payment with httpx and a 2-second timeout; a card ending 00...")</sub> and writes its arithmetic down. The recipe
quotes that number and says where it is set, so that when it changes the recipe is wrong in an
obvious way rather than a subtle one.

**One thing here is deliberately left open.** Whether the runner survives a reboot depends on D9,
the deployment decision, which is not this scope's. Say that in the environment rewrite rather than
implying the recurring work is now permanent.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

> Somebody who was not here can start the recurring work, stop it, find out what is stuck and read
> why something died, from the runbook alone. The environment folder describes what actually runs,
> and says which part of it a deployment decision has not been taken about yet.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

A scope that changes what "running Attica" means, and leaves the sentence that says what running
Attica means untouched, has not finished. It has planted something worse than a gap: a confident,
specific, wrong instruction in the file every session is told to read first. Somebody will follow it,
start four processes, and be missing the one that now matters.

The runbook half is the same argument from the other end. Plan [03](03-build-the-runner.md) gives
the recurring work a way to be started and a log that says it is moving. That covers the good case.
The two questions left over are the ones asked when something has already gone wrong, by somebody
who did not build any of this, and an unanswered question at that moment costs the whole scope its
value. The machinery worked and nobody could tell.

This is also where the scope's evidence stops being screenshots in a folder and becomes something a
stranger can act on.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
what this scope changed          what it made false             what this plan writes
-----------------------          ------------------             ---------------------
03: something runs the       →   "four processes,           →   the execution model, rewritten:
    recurring work               started by hand"               what starts what, what is still
                                 (execution model)              by hand, what D9 has not decided

04: the scheduling path      →   "never pushes to the       →   the gap deleted, and the one
    pushes as well as            channel layer"                 delivery path named in its place
    persists                     (known gaps)
                             →   the ❌ branch in           →   the branch rewritten to the
                                 Stack § 4                      failure that is still possible

04: stranded rows come       →   nothing false; nothing     →   Stack § 4 § "what is stuck":
    back after a timeout         written either                  the status count, the timeout,
                                                                 and the row that is still moving

04: dead-lettering has       →   nothing false; nothing     →   Stack § 4 § "what died and why":
    rows in it now                written either                 the admin path, error_message,
                                                                 and the replay


                    the check that any of it worked
                    -------------------------------
        cold terminal, only the recipe open, somebody else if possible
                                   |
              start it ─ confirm ─ stop it ─ confirm ─ answer both questions
                                   |
                  any gap filled from memory  →  the recipe is wrong, not the reader
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

**No subject piece in [this scope's map](../diagram-prompts.md) belongs to this plan**, and that is
correct rather than an omission. The five subject pieces draw the system this scope changes; what
this plan produces is two documents, and a picture of a document that has been corrected teaches
nothing the corrected document does not teach faster.

The plan that does carry this one is the map's process lane, which draws the scope as its five
stages and is outstanding. Nothing here is blocked on it.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Two documents, edited rather than created, plus the index row that makes the second findable.

**In the runbook**, Stack § 4 grows two answers and loses one stale branch. The first answer is what
is stranded in `processing` and what the reaper will do about it. The second is what dead-lettered,
where to read why, and how to replay it. Both carry a real pasted run, because that is the standard
the rest of that recipe already sets. The ❌ branch that points at the never-pushes gap is rewritten
to describe the failure that can still happen.

**In the environment folder**, the execution model says what starts the recurring work, what a person
still starts by hand, and what a deployment decision has not settled. The known-gaps section loses
the never-pushes entry and gains whatever plan [01](01-take-the-execution-decision.md)'s decision
left open. The provenance table gets a row for each, with the date and how it was established.

Nothing in `backend/` or `frontend/` changes in this plan. If a code change looks necessary here, it
belongs in one of the four plans before it and this one is being used to paper over it.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** The work this scope did survives the person who did it.

**Goal.** Three false statements corrected, two unanswered questions answered in the recipe that
already owns them, and both proved by somebody working from the documents alone.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/05-prove-it-and-write-it-down.md`
  - Conformance, thin instructions, and whether the handoff pointers below still resolve.

▶ **Next: [task 1.1](#1--finish-the-recipe-that-already-owns-these-questions)**.

### 1. 📖 Finish the recipe that already owns these questions

◀ **Needs: [04](04-close-the-two-silent-losses.md) complete**, because both answers describe
behaviour that does not exist until the reaper and the one delivery path are in.

- [ ] **1.1 Get the real status counts, with the runner running**
  - Command, from `/home/molef/lobola` in `backend/main/`:
    ```bash
    python3 -c "
    import sqlite3
    c = sqlite3.connect('db.sqlite3')
    for r in c.execute('select status, count(*) from scheduling_outboxevent group by status'):
        print(r[0], r[1])
    "
    ```
  - Expected: every status the table uses, including `processing` and `dead_lettered`, which the
    existing recipe's version never surfaces because it was written before either mattered.
  - Write the output down verbatim with its date. It is the pasted run the new sections need.
  - ❌ If `processing` never appears, the reaper may be reclaiming faster than you can look. That is
    the good failure. Say so, and use the manufactured row from
    [04](04-close-the-two-silent-losses.md)'s partial-pass route instead.

- [ ] **1.2 Write the "what is stranded" answer into Stack § 4**
  - Output goes to:
    [Stack § 4](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox),
    as a new labelled block inside the existing section, under the existing pending check.
  - It must say: how to see the count, what `processing` means, the reaper's [timeout](../../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Timeout.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=146 "System design interview, chapter 9, Design a web crawler, Short timeout, A crawler gives each web server a maximal wait time and, when a host does not answer..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=362 "System design big archive, How to Debug a Slow API?, Set aggressive timeouts and retries on third-party calls such as Stripe or Google Maps, so one slow prov..."), [▶1](https://www.youtube.com/watch?v=2GAQVXGT_Zw&t=150s "Hussein Nasser, Frontend and Backends Timeouts, Connection Timeout, 2:30 to 5:00, The first of the timeouts a backend sets, before read, wait, usage and resp..."), [▶2](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts set on calls between services..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/14-payment-notification-and-a-timeout.md "Payment, notification, and a timeout, system-design/foundations, plan 14. The order service calls payment with httpx and a 2-second timeout; a card ending 00...")</sub> as a number
    with the setting it comes from, and how to tell a genuinely stranded row from one a live worker
    is holding right now.
  - Done when a reader can tell those two apart without opening a Python file.

▶ **Next: [instruction 4](#4--force-a-dead-letter-and-read-it-in-the-admin)**, which produces the
row task 1.3 documents. Do not write 1.3 from the code.

- [ ] **1.3 Write the "what died and why" answer, from the row instruction 4 produced**
  - ◀ **Needs: [instruction 4](#4--force-a-dead-letter-and-read-it-in-the-admin)**.
  - It must say: the admin path to the dead-letter rows, which column carries the reason, what
    `SCHEDULING_OUTBOX_MAX_ATTEMPTS` is and where it is set, and the replay step with its real
    output pasted in.
  - Quote the actual `error_message` string you saw, not a plausible one. A made-up error message is
    the thing a reader pattern-matches against and fails to find.

- [ ] **1.4 Rewrite the ❌ branch that names the never-pushes gap**
  - The current branch says the booking-request write path never calls `group_send` and points at
    the known gap. Both stop being true in [04](04-close-the-two-silent-losses.md).
  - Replace it with the failure that is still possible: the row was written, the push was attempted,
    and the channel layer refused it. Name the log line and say which [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> database is involved.
  - ⚠️ Do not delete the branch. A recipe with no failure branch reads as a recipe that cannot fail.

- [ ] **1.5 Add the index row so the second question is findable**
  - Output goes to: [the runbook index](../../../../../runbook/00-INDEX.md), as questions, matching
    the phrasing style already there.
  - Two questions, not one: "what is stuck?" and "what died, and why?" both land on Stack § 4.
  - ⚠️ This completes the runbook pair this scope owes. The first half, starting and stopping the
    recurring work, is [03](03-build-the-runner.md)'s.

▶ **Next: [task 2.1](#2--rewrite-the-two-statements-this-scope-made-false)**.

### 2. ✍️ Rewrite the two statements this scope made false

- [ ] **2.1 Rewrite the execution model**
  - Output goes to:
    [the execution model](../../../../../environment/overview.md#execution-model).
  - It must say: what starts the recurring work now, named as whatever
    [01](01-take-the-execution-decision.md) chose; which processes a person still starts by hand and
    in what order; and that the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker is no longer the one a plan forgets, with what
    replaced that risk.
  - Write it in the present tense as the current state. Do not layer a correction on the old
    paragraph or leave the four-process list struck through beside the new one.

- [ ] **2.2 Say what D9 has not decided, in the same section**
  - One short paragraph: the recurring work runs on this machine because something on this machine
    starts it, and whether it survives a reboot or a deploy is
    [D9](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions),
    which belongs to `getting-it-out`.
  - Why it is here: without it the rewritten section reads as a promise of durability this scope
    never made.

- [ ] **2.3 Delete the never-pushes gap and put the truth in its place**
  - Output goes to:
    [the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints).
  - The entry saying `_create_in_app_notification` writes a row and stops, and that Redis is
    "fully configured, running, and unused on this path", is removed rather than amended.
  - What replaces it is a one-line statement of the delivery path that exists: one writer, one
    group, used by chat and by scheduling alike.

- [ ] **2.4 Fold in the three answers plan 01 wrote down**
  - ◀ **Needs:** the notes file from [01](01-take-the-execution-decision.md) task 4.4, which holds
    three commands with their real output and dates. Those are environment facts sitting in an
    artifact note.
  - Put each where it belongs in the environment folder rather than pasting the notes file in.
  - ❌ If a claim in that file no longer reproduces, do not copy it. Re-run it, and if it now
    disagrees, that disagreement is the finding.

- [ ] **2.5 Add a provenance row for every fact you changed**
  - Output goes to: [the provenance table](../../../../../environment/provenance.md), one row each,
    with the date and how it was established.

▶ **Next: [instruction 5](#5--the-cold-terminal-test)**, which is the only real check on any of the
above.

### 3. 🔎 Run the two pulses and act on what they report

◀ **Needs: [instruction 5](#5--the-cold-terminal-test)** and
[instruction 6](#6--read-both-folders-back-as-a-stranger), because a pulse over a document nobody
has walked reports formatting and misses meaning.

- [ ] **Run the following prompt:** `/env-pulse @environment`
  - Expected: no finding naming the execution model or the never-pushes gap. Anything it does report
    is a real disagreement and gets fixed here, not deferred.
- [ ] **Run the following prompt:** `/runbook-pulse @runbook`
  - Expected: Stack § 4 marked `ran` with a current date, and both new questions present in the
    index.
- [ ] **Run the following prompt:** `/drip-runbook` for anything the cold-terminal test showed was
  missing rather than merely unclear.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 3](#3--run-the-two-pulses-and-act-on-what-they-report)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern --from-run-log` for anything that bit
  - A document that was true when written and false three commits later is a pattern, not an
    accident, and it will happen again in every scope that changes how something runs.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers`
  - This is the scope's last plan, so this run is also the scope's roll-up to the parent.

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 💀 Force a dead letter and read it in the admin

◀ **Needs: [task 1.2](#1--finish-the-recipe-that-already-owns-these-questions)**.

- [ ] **4.1 Make a dispatch fail on purpose, past the attempt limit**
  - Point a [webhook](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> target at a port nothing listens on, or stop the service the dispatch calls.
  - Let the runner retry it until it exceeds `SCHEDULING_OUTBOX_MAX_ATTEMPTS`.
  - Write down how long that took in real time. The recipe needs it, because a reader who waits 40
    seconds and sees nothing will conclude the mechanism is broken.
- [ ] **4.2 Open the Django admin and find the row**
  - Browser: `http://localhost:8000/admin/`, log in with the staff account, go to the scheduling
    section, open the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> events list, filter to the dead-lettered status.
  - ✅ You should see the row you just made, with an attempt count at the limit.
  - ❌ No admin login: the account is one no seed creates. Make it per
    [the admin site](../../../../../environment/django-admin/the-admin-site.md) before continuing.
- [ ] **4.3 Read the reason and copy it out exactly**
  - Open the row, find `error_message`, and copy the string verbatim into your notes, including any
    exception class name in it.
  - Screenshot the list view with the row visible, saved to
    `artifacts/figures/running-the-workers/`.
- [ ] **4.4 Replay it and watch it land**
  - Undo the failure you caused, replay the row, and confirm it reaches `sent`.
  - Paste the command and its output. This is the half of the answer that turns a diagnosis into a
    fix, and a recipe that stops at "here is why it died" leaves the reader where they started.

▶ **Next: [task 1.3](#1--finish-the-recipe-that-already-owns-these-questions)**, which writes this
down while it is still in front of you.

### 5. 🧑‍💻 The cold terminal test

◀ **Needs: [task 2](#2--rewrite-the-two-statements-this-scope-made-false)**.

- [ ] **5.1 Set up so you cannot cheat**
  - Close this plan and every plan in this scope. Open a new terminal in a directory you have not
    been working in. Have only the runbook recipe open.
  - Better: hand it to somebody else and watch without speaking. Every question they ask out loud is
    a defect in the recipe, and you write it down instead of answering it.
- [ ] **5.2 Start the recurring work from the recipe alone**
  - ✅ Pass: it starts, and the recipe told you how to confirm it started rather than leaving you to
    guess from an absence of errors.
  - ❌ Fail: any step where you filled in a path, an environment, or a command name from memory.
    Note exactly which, because that is the edit.
- [ ] **5.3 Stop it, and confirm it stopped**
  - The same standard. "Press Ctrl-C" is not a confirmation that it stopped.
- [ ] **5.4 Answer both questions from the recipe alone**
  - What is stuck right now, and what has died and why. Answer them out loud, with the commands in
    front of you and nothing else.
  - ✅ Pass: both answered, including the number the reaper uses, without opening a source file.
  - ❌ Fail: either question sends you to Python. Say which, and fix the recipe rather than the
    reader.
- [ ] **5.5 Write the verdict down**
  - Into `artifacts/notes/running-the-workers/`, with the date, who did it, and every gap found.
  - A pass with no gaps found is suspicious if you did it yourself. Say who did it.

▶ **Next: [instruction 6](#6--read-both-folders-back-as-a-stranger)**.

### 6. 📚 Read both folders back as a stranger

◀ **Needs: [instruction 5](#5--the-cold-terminal-test)**.

- [ ] **6.1 Read the execution model start to finish, out loud**
  - You are somebody who has been away two months. Does it tell you what to start, in what order,
    and what starts itself?
  - ❌ If any sentence only makes sense to somebody who watched this scope happen, rewrite it. That
    includes any sentence that refers to what the section used to say.
- [ ] **6.2 Check the known gaps section lists nothing this scope closed**
  - This is a parent Definition-of-Done item, so it is checked here rather than assumed.
- [ ] **6.3 Follow every link you added**
  - Both directions: the runbook rows reach the recipe, and the recipe's references reach the
    environment sections. A pair of documents that point at each other and one broken anchor is
    worse than neither.

▶ **Next: [task 3](#3--run-the-two-pulses-and-act-on-what-they-report)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody who could not see it started the recurring work, stopped it, and
> answered "what is stuck" and "what died and why" from the runbook alone.

Pass:

- The cold-terminal walk was completed by somebody without this plan open, and its verdict is
  written down with a name and a date on it.
- Stack § 4 answers all three questions, each with a real pasted run, and is marked `ran` with the
  current date.
- `grep -n "never calls" environment/overview.md` and a search for "four processes, started by hand"
  both return nothing.
- `/env-pulse` reports no finding against the execution model or the known gaps.
- The dead-letter walk quoted a real `error_message` and a real replay, not a described one.

Fail, and what it means:

- The cold-terminal walk was done by the person who wrote the recipe, and passed. That is not
  evidence; it is the author reading their own mind. Redo it or record it as unverified.
- The recipe answers "what is stuck" by telling the reader to run a management command that prints
  it. Then the answer lives in code that can change silently, and the recipe has deferred rather
  than answered.
- The environment rewrite reads as a correction: "this previously said four processes". Rewrite it
  as the current state. The reader does not need the history and cannot act on it.
- A new file was created beside Stack § 4 instead of finishing it. Two pages now answer overlapping
  questions with different dates, and the older one keeps being found first.
- Both pulses were run before instruction 5. They passed on a document nobody had walked, which is
  the shape of a green check that means nothing.

Partial pass is acceptable on instruction 4.1 alone: if a real dispatch cannot be driven past the
attempt limit in reasonable time, set the attempt count directly in the Django shell and say in the
notes that the dead letter was manufactured. That still proves the row can be read and replayed. It
does not prove the retry ladder reaches the limit, so say which one you tested.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| "What is stuck" and "what died and why", with real runs | `runbook/running-the-web-app/bringing-the-stack-up.md` § 4 | — | not started |
| The rewritten ❌ branch | the same section | — | not started |
| Two new question rows | `runbook/00-INDEX.md` | — | not started |
| The rewritten execution model, including what D9 has not decided | `environment/overview.md` | — | not started |
| The never-pushes gap removed, the delivery path stated | `environment/overview.md` | — | not started |
| A provenance row per changed fact | `environment/provenance.md` | — | not started |
| The cold-terminal verdict, with who did it | `artifacts/notes/running-the-workers/` | — | not started |
| The dead-lettered row in the admin, and its replay | `artifacts/figures/running-the-workers/` | — | not started |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/05-prove-it-and-write-it-down.md` | task 0, before any work | Conformance and thin instructions reported |
| Write what is missing | `/drip-runbook` | task 3, for gaps instruction 5 found | The recipe gains what a cold reader needed |
| Audit the environment folder | `/env-pulse @environment` | task 3, after instruction 6 | Stale facts reported against reality |
| Audit the runbook | `/runbook-pulse @runbook` | task 3, after instruction 6 | Recipes checked for run marks and index rows |
| Card the evidence | `~/.claude/ARTIFACT_TREE_FORMAT.md` | instruction 4.3 | Screenshots with provenance in prose |
| Capture patterns | `/ingest-error-pattern --from-run-log` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers` | the close out | The scope rolls up to the parent |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

This plan changes no code. These are the places the documents it writes must describe correctly.

**`scheduling/services.py::dispatch_outbox_events`** is what the "what is stuck" answer describes.
Its selection reads `PENDING` and `FAILED`; its claim moves a row to `PROCESSING`. After
[04](04-close-the-two-silent-losses.md) the reaper returns stale `PROCESSING` rows, and the recipe
quotes that [timeout](../../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Timeout.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=146 "System design interview, chapter 9, Design a web crawler, Short timeout, A crawler gives each web server a maximal wait time and, when a host does not answer..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=362 "System design big archive, How to Debug a Slow API?, Set aggressive timeouts and retries on third-party calls such as Stripe or Google Maps, so one slow prov..."), [▶1](https://www.youtube.com/watch?v=2GAQVXGT_Zw&t=150s "Hussein Nasser, Frontend and Backends Timeouts, Connection Timeout, 2:30 to 5:00, The first of the timeouts a backend sets, before read, wait, usage and resp..."), [▶2](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts set on calls between services..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/14-payment-notification-and-a-timeout.md "Payment, notification, and a timeout, system-design/foundations, plan 14. The order service calls payment with httpx and a 2-second timeout; a card ending 00...")</sub> as a number.

**`SCHEDULING_OUTBOX_MAX_ATTEMPTS`** is the limit past which a row dead-letters. The recipe names
its value and where it is set, because a reader who does not know the limit cannot tell a row that is
still retrying from one that has given up.

**`notifications/utils.py::create_notification`** (line 24) is the one writer after
[04](04-close-the-two-silent-losses.md): it creates the row and `group_send`s to
`notifications_{recipient.id}`, logging a warning rather than raising if the channel layer refuses.
That warning is the failure the rewritten ❌ branch describes, so quote the log line as it appears.

**The runner from [03](03-build-the-runner.md)** is what the execution model now names. Take its
name, its start command and its stop command from that plan's runbook recipe rather than from
memory, so the two documents cannot disagree.

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

None inside this scope. This is the last plan, so its close out is the scope's close out and
`/sync-plan-tree` rolls the whole thing up to
[the parent's running order](../../../MASTER_PLAN.md#running-order).

What unblocks next is elsewhere: `availability-that-is-true` and `the-booking-journey` both need
something that runs on a clock, and after this scope they have one.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

`/drip-runbook` for the recipe half, because the two new answers are exactly what it authors and it
already knows the format Stack § 4 is written in.
   also: `/env-pulse` and `/runbook-pulse` as the checks, never as the authors.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A recipe passes for its author and fails for everybody else | The author fills gaps from memory without noticing | Cold terminal, recipe only, somebody else if possible. Every question asked out loud is an edit. |
| A document is true when written and false three commits later | Facts written before the change that invalidates them | Write the folders last, in the scope that changed them, not at the end of the programme. |
| [Websockets](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> fail with no clear error | The backend started with `runserver` instead of Daphne | `daphne -b 0.0.0.0 -p 8000 main.asgi:application`. Relevant here because the rewritten gap section must not reintroduce it. |
| Flushing [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> silently drops live websocket groups | One server, two logical databases: channel layer on the default, page [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> on database 1 | Any recipe step touching Redis names which database. |
| The admin cannot be opened | The staff account is one no seed creates | Create it per the admin site environment file before instruction 4. |
