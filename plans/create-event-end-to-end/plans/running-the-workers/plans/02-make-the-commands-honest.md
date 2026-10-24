# 🔧 Make The Commands Honest

Step 2 of 5 in this scope. Waits on nothing inside this scope, so it can run at the same time as
[01](01-take-the-execution-decision.md).
Next: [03-build-the-runner.md](03-build-the-runner.md).

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

Scope: [running the workers](../MASTER_PLAN.md). Second of five, and second only because the
decision plan is worth starting first. It needs nothing from
[01](01-take-the-execution-decision.md) and the two can run at the same time.

It goes before [03](03-build-the-runner.md) for one reason: putting a command on a schedule does not
make it correct, and a command that is wrong on a clock is wrong more often.

**This plan owns one half of a Definition-of-Done item and not the other.** Replacing
`expire_and_materialize`'s inline update with the service call is required whatever else happens, so
it is here. Whether that daemon should also materialise, or be renamed, depends on how
[01](01-take-the-execution-decision.md) grouped the jobs, so it is in
[03](03-build-the-runner.md).

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Two of the ten scheduling commands are wrong as well as inert, and one of them is the only place in
the codebase that breaks the rule this scope exists to make universal.

**`expire_draft_holds` is a byte-for-byte copy of `expire_checkout_holds`.** Both call
`expire_checkout_sessions` (`backend/main/scheduling/services.py:1744`). Nothing anywhere sweeps
`draft_hold_expires_at`. The command is named for a job it does not do.

**`expire_and_materialize` does not materialise, and its expiry skips the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>.** It imports
`materialize_slots_for_resource`
(`backend/main/scheduling/management/commands/expire_and_materialize.py:20`) and never calls it. Its
loop body is a single inline `BookingRequest.objects.filter(...).update(status=EXPIRED)`, which
bypasses `expire_pending_requests` (`backend/main/scheduling/services.py:2633`) and therefore emits
no `request.expired` outbox event. The same request expiring through the service is not silent.

**The draft hold does expire, lazily, and nobody is told.** Contention queries exclude a lapsed hold
(`backend/main/scheduling/services.py:167`) and the status projection reports
`checkout_hold_expired` (`backend/main/scheduling/services.py:319`), so the time really is released
without any job running. What is missing is that the organizer whose hold ran out finds out by
looking.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- The Python environment is `/home/molef/lobola`. Activate it with
  `source /home/molef/lobola/bin/activate` before anything with `manage.py`.
- The database is SQLite at `backend/main/db.sqlite3`, one file, no server. It shows as modified in
  `git status` after the app runs, which is normal here.
- Two of the 43 backend tests already fail, both in `events/tests.py`, so a red
  `python manage.py test` does not mean this plan broke something. Know the two by name before
  reading a run, per
  [the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints).
- The outbox worker is not running unless somebody started it. This plan checks [outbox rows](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> in the
  `pending` state, which is what an emitted-and-undispatched event looks like, so it does not need
  the worker running and should not have it running while counting.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**One of these two fixes is settled and the other is a fork. Do not let them merge.**

Replacing the inline update with the service call is not a judgement: it is the rule this scope
exists to make universal, and the daemon is the only place breaking it. What `expire_draft_holds`
should become is a judgement, and it needs D2, which is open. The reasoning is in
[the decisions taken here](../decisions-taken-here.md#expire_and_materialize-gets-the-same-treatment-for-a-different-reason).
Splitting them means the settled part cannot be lost inside the unsettled one.

**D2 is open, and this plan is written for that.**

D2 decides when a hold starts. If it lands on request time, the draft hold becomes load-bearing and
needs a real timer, so the command must exist and do its job. If it keeps acceptance-time holds,
today's lazy expiry is enough and the command is redundant. **The one thing both answers need is
the same**: when a draft hold lapses, somebody is told. So this plan builds the telling, which is
required either way, and hands the command's existence to `contention-and-holds` with the criterion
attached rather than guessing.

**Prove the duplication before fixing it.**

`diff` the two command files and paste the output. "They are identical" is a claim, and one
`diff` is its evidence. If they have diverged since 2026-08-23, the fix changes and the plan needs
re-reading rather than following.

**Count outbox rows before and after, every time.**

The whole point of this plan is which paths emit an event and which do not. A change that "works"
and emits nothing looks exactly like a change that works. The count is the evidence, and
[Stack § 4](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
already carries the query to get it.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**After this plan there is no expiry path in the codebase that changes a booking without emitting
the event that says so.** That is what makes persist-then-push a rule rather than a habit that
nineteen call sites happen to follow.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

A rule with one exception is not a rule, it is a convention plus a bug that nobody has hit yet.

Nineteen call sites in `scheduling/services.py` already write the business change and the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>
event in one transaction. One daemon writes its own update inline and emits nothing. Left alone,
that daemon becomes the thing somebody copies the next time a background job is needed, because it
is the shortest example in the file.

The second command is a different failure and a worse one to leave. `expire_draft_holds` will pass
any review that reads its name, run without error, print a plausible number, and sweep a table it
was never pointed at. Putting it on a schedule would make it a job that reports success for work it
does not do, on an interval.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  TWO EXPIRY PATHS, ONE OF THEM SILENT

  expire_pending_booking_requests ──► expire_pending_requests() ──► row + outbox event
                                                                          │
  expire_and_materialize ──► .update(status=EXPIRED)  ──►  row  ──►   (nothing)
                             ^^^^^^^^^^^^^^^^^^^^^^^                      ▲
                             this plan deletes this line                  │
                             and calls the service instead ───────────────┘


  expire_checkout_holds ──┐
                          ├──► expire_checkout_sessions()   both call the same thing
  expire_draft_holds   ───┘

  draft_hold_expires_at ──► swept by nothing. Noticed on read. Nobody told.
                            this plan builds the telling; D2 decides the sweeper.
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is drawn from what this plan establishes.

**Subject: the command named for a job it does not do.** The two command glyphs pointing at one
service, and the field with no arrow arriving, are exactly what task 1.1 proves and task 3.1 fixes.
[Piece 2](../diagram-prompts.md#piece-2-the-command-named-for-a-job-it-does-not-do-planned--not-rendered).
Save as `../diagrams/subject-02-named-for-a-job-it-does-not-do.png`. *(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Three changes to `backend/main/scheduling/`, and one section appended to the scope's decision record.

1. **`expire_and_materialize`'s expiry goes through the service.** The inline
   `BookingRequest.objects.filter(...).update(status=EXPIRED)` at
   `backend/main/scheduling/management/commands/expire_and_materialize.py` is replaced by a call to
   `expire_pending_requests`, which is what `expire_pending_booking_requests` already calls. The
   daemon keeps its loop, its interval argument and its signal handling.
2. **A lapsed draft hold emits an event.** One new [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event type for the moment
   `draft_hold_expires_at` passes, emitted from wherever the lapse is recognised, so the organizer
   is told rather than discovering it. Required under both D2 answers.
3. **`expire_draft_holds` is resolved, or handed over with the criterion written.** Three outcomes
   are acceptable and the plan records which one it took: it expires draft holds and emits the
   event; or it is deleted and the lazy read-path expiry is documented as intended; or, while D2 is
   open, it is handed to `contention-and-holds` with the criterion that decides it written into the
   decision record.
4. **A section in `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md`** naming
   which outcome was taken and why, so [03](03-build-the-runner.md)'s job table knows whether the
   command exists.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 4](../MASTER_PLAN.md#objectives), making persist-then-push the only
path, and close the half of [objective 3](../MASTER_PLAN.md#objectives) that is a silent expiry
rather than a silent delivery.

**Goal.** No expiry path in `backend/main/scheduling/` changes a booking's status without emitting
the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event for it, proved by a row count taken before and after each command is run; and a
lapsed draft hold produces an outbox row where today it produces nothing.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/02-make-the-commands-honest.md`

▶ **Next: [task 1.1](#1--prove-what-is-wrong-before-changing-it)**.

### 1. 🔬 Prove what is wrong before changing it

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Prove the two expiry commands are the same file**
  ```
  cd /home/molef/Work/attica/backend/main/scheduling/management/commands
  diff expire_checkout_holds.py expire_draft_holds.py && echo "IDENTICAL"
  ```
  - Produces: either the word `IDENTICAL` or a diff.
  - Done when: the output is pasted into the notes. `IDENTICAL` confirms the master plan's claim.
    A diff means they have moved since 2026-08-23, and then the rest of this plan is read again
    before it is followed.

- [ ] **1.2 Prove nothing sweeps the draft hold**
  ```
  cd /home/molef/Work/attica/backend/main
  grep -rn "draft_hold_expires_at" --include=*.py . | grep -v migrations | grep -v tests.py
  ```
  - Produces: every site that reads or writes the field, split into three groups: set it, clear it,
    read it.
  - Done when: it is written down that no site selects rows *by* an elapsed
    `draft_hold_expires_at` in order to act on them, which is what a sweeper would look like. The
    read sites at `services.py:167`, `:276` and `:319` are the lazy expiry and are not a sweeper.

- [ ] **1.3 Prove the daemon's expiry emits nothing, with a count**
  ```
  cd /home/molef/Work/attica/backend/main
  python3 -c "
  import sqlite3
  c = sqlite3.connect('db.sqlite3')
  for r in c.execute(\"select event_type, status, count(*) from scheduling_outboxevent where event_type='request.expired' group by event_type, status\"):
      print(r)
  "
  ```
  - Then read `expire_pending_requests` at `scheduling/services.py:2633` and find its
    `record_outbox_event` call for `request.expired`, and read
    `expire_and_materialize.py`'s loop body, which has none.
  - Produces: the current count of `request.expired` events, and the two code paths side by side.
  - Done when: the difference is stated as a sentence with both line numbers, because this is the
    single counter-example the whole scope's rule rests on.
  - 💡 `/unpack backend/main/scheduling/services.py:2600-2660`: `expire_pending_requests` and
    `_create_in_app_notification` sit next to each other, and the second is what
    [04](04-close-the-two-silent-losses.md) fixes. Reading both once now saves reading either twice.

▶ **Next: [task 2.1](#2--make-the-daemons-expiry-go-through-the-service)**.

### 2. 🛠️ Make the daemon's expiry go through the service

◀ **Needs: [task 1](#1--prove-what-is-wrong-before-changing-it)**, so the before-count exists.

- [ ] **2.1 Replace the inline update with the service call**
  - In `backend/main/scheduling/management/commands/expire_and_materialize.py`, delete the
    `BookingRequest.objects.filter(...).update(status=...)` block and call `expire_pending_requests`
    instead, keeping the printed count.
  - Remove the now-unused `BookingRequest` and `timezone` imports if nothing else uses them. Leave
    `materialize_slots_for_resource` alone: whether the daemon materialises is
    [03](03-build-the-runner.md)'s to settle, and deleting the import now would erase the evidence
    that it was meant to.
  - Produces: a daemon whose expiry path is the same one the one-shot command uses.
  - Done when: `grep -n "objects.filter" expire_and_materialize.py` returns nothing, and the only
    expiry in the file is the service call.

- [ ] **2.2 Prove the change with a count that moved**
  ```
  source /home/molef/lobola/bin/activate
  cd /home/molef/Work/attica/backend/main
  python manage.py expire_and_materialize --interval 1   # let one cycle run, then Ctrl-C
  ```
  - Then re-run the count query from [task 1.3](#1--prove-what-is-wrong-before-changing-it).
  - Produces: the two counts, before and after, in the notes.
  - Done when: either the `request.expired` count rose by exactly the number of requests the
    command said it expired, or the command expired zero and the count did not move, and it is
    written down which of those two happened. A zero-expiry run proves nothing about emission, so
    say so rather than reporting it as a pass.
  - ❌ If there is nothing to expire, seed one: create a `BookingRequest` with
    `status=PENDING` and `expires_at` in the past through the Django shell, and say in the notes
    that the row was made for the test.

▶ **Next: [task 3.1](#3--tell-somebody-when-a-draft-hold-lapses)**.

### 3. 📨 Tell somebody when a draft hold lapses

◀ **Needs: [task 1.2](#1--prove-what-is-wrong-before-changing-it)**, so the read sites are known.

This is the part both D2 answers need, which is why it is built now rather than waited on.

- [ ] **3.1 Emit an [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event at the moment the lapse is recognised**
  - The lapse is recognised at `backend/main/scheduling/services.py:319`, where the status
    projection reports `checkout_hold_expired`. A projection is a read and must not write, so the
    emit goes wherever the lapse is *acted on* rather than merely observed. Establish that site
    from [task 1.2](#1--prove-what-is-wrong-before-changing-it)'s three groups and name it in the
    notes before writing any code.
  - Follow the shape the other nineteen emit sites use: the business change and
    `record_outbox_event` in one transaction.
  - Produces: one new event type, named for what happened to the hold, following the existing
    `<aggregate>.<past tense>` convention visible in `request.created` and `request.expired`.
  - Done when: the event type is registered wherever the dispatcher maps types to notifications, so
    it produces a notification rather than a row the dispatcher skips. Check
    `_dispatch_notification_for_event` at `backend/main/scheduling/services.py:2683` for the mapping
    and confirm the new type has a branch there.
  - ⚠️ Do not add an emit site to any booking representation other than the one D1 kept. Per
    [the decisions taken here](../decisions-taken-here.md#what-this-scope-does-not-touch-and-why-that-is-a-decision),
    this scope adds no emit site to a representation that may not survive.

- [ ] **3.2 Prove one lapse produces one event**
  - Create a request whose `draft_hold_expires_at` is one minute in the past through the Django
    shell, then trigger the path that acts on the lapse.
  - Produces: the outbox row, with its `event_type` and `payload` pasted into the notes.
  - Done when: exactly one row appears for one lapse. Two rows means the emit is on a read path and
    fires every time somebody looks, which is the failure mode this task is most likely to have.

▶ **Next: [task 4.1](#4--resolve-expire_draft_holds-or-hand-it-over-in-writing)**.

### 4. ⚖️ Resolve `expire_draft_holds`, or hand it over in writing

◀ **Needs: [task 3](#3--tell-somebody-when-a-draft-hold-lapses)** done, so the telling exists
whichever way this goes.

- [ ] **4.1 Read D2's state and take the branch it allows**
  - Read `plans/create-event-end-to-end/plans/contention-and-holds/` for a taken decision.
  - **If D2 landed on request-time holds**: the command becomes a real sweeper. Select requests
    whose `draft_hold_expires_at` has passed and act on them through a service function that emits
    the event from [task 3.1](#3--tell-somebody-when-a-draft-hold-lapses).
  - **If D2 landed on acceptance-time holds**: delete the command, and write the lazy read-path
    expiry into the notes as the intended behaviour, naming `services.py:167` and `:319` as where
    it happens.
  - **If D2 is open**, which is the expected answer: leave the command untouched and write the
    handover, next task.
  - Produces: one of the three outcomes, named in the notes with the date and D2's state.
  - Done when: the notes say which branch was taken and why, and `git log` shows the code change
    matching it, or shows no change with the handover written.

- [ ] **4.2 Write the handover, if that is the branch**
  - A section in `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md` naming:
    that `expire_draft_holds` is today a copy of `expire_checkout_holds` with the `diff` output from
    [task 1.1](#1--prove-what-is-wrong-before-changing-it) pasted in; that the lapse now emits an
    event whichever way D2 goes; and the criterion, which is that request-time holds need the
    sweeper and acceptance-time holds do not.
  - Produces: something `contention-and-holds` can act on without re-reading this codebase.
  - Done when: the section names the scope that owns the decision, the two branches, and what each
    one costs in one line.
  - ⚠️ **Do not delete the command while D2 is open**, even though deleting is reversible in git.
    A command deleted under an unmade decision is a decision taken by whoever had the editor open.

▶ **Next: [instruction 5.1](#5--watch-an-expiry-happen-and-a-notification-not-arrive)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 5](#5--watch-an-expiry-happen-and-a-notification-not-arrive)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
  - A command named for a job it does not do is a pattern worth a catalog entry: this repository has
    at least two, and the second was only found by reading the file rather than the name.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 5. 👀 Watch an expiry happen, and a notification not arrive

◀ **Needs: [task 4](#4--resolve-expire_draft_holds-or-hand-it-over-in-writing)**.

The row counts prove an event was written. They do not prove anybody would ever receive it, and this
is the moment to see that gap with your own eyes, because [04](04-close-the-two-silent-losses.md) is
the plan that closes it and it is much easier to build a fix for something you have watched fail.

5.1 **Bring the stack up, with the worker deliberately not started**
   - Follow [bringing the stack up § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up).
   - Use Daphne, not `runserver`: `daphne -b 0.0.0.0 -p 8000 main.asgi:application`.
   - Do **not** start `run_outbox_worker`. This instruction is about what happens without it.
   - ✅ The Vite banner reads `http://localhost:5173/`: continue.
   - ❌ It reads 5174: stop and free 5173. `CORS_ALLOWED_ORIGINS` does not name 5174, so every
     request fails on [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> and looks exactly like a wrong password.

5.2 **Run the expiry and read the [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> in the admin**
   - In a terminal: `python manage.py expire_pending_booking_requests`.
   - Open `http://localhost:8000/admin/` and go to Scheduling → Outbox events. You need a staff
     account; how to get one is in
     [the Django admin site](../../../../../environment/django-admin/the-admin-site.md).
   - Filter by Status → pending.
   - Expected result: one or more rows with `event_type` `request.expired` sitting in `pending`.
   - ✅ Rows are there: the event was persisted. This is persist-then-push working on the persist
     half.
   - ❌ No rows and the command reported expiring some: the emit is missing on the path you ran.
     That is a finding, not a mistake. Write down which command you ran and what it printed.

5.3 **Confirm nobody was told**
   - Log in to the app as the organizer those requests belong to.
   - Open Chrome DevTools → Network → filter **WS**, and find the row whose name begins
     `notifications`. Leave it selected on the Messages tab.
   - Reload the notifications area of the app.
   - Expected result: no frame arrives for the expiry, and the bell shows nothing new until the
     outbox is drained by hand.
   - ✅ Nothing arrives: this is the gap [04](04-close-the-two-silent-losses.md) exists for. Write
     down that the row existed and the frame did not, because "nothing happened" and "the row was
     written and never pushed" are different problems with the same appearance.
   - ❌ A frame does arrive: then something already pushes on this path and
     [04](04-close-the-two-silent-losses.md)'s premise needs re-checking before it is built. Record
     the frame's `type` field verbatim and say which action produced it.

▶ **Next: the close out**, which records what this taught.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when no expiry path in `scheduling/` can change a booking without leaving an
> [outbox row](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> behind it, and that is shown by a count rather than asserted.

Pass:

- `grep -n "objects.filter" backend/main/scheduling/management/commands/expire_and_materialize.py`
  returns nothing, and the file's only expiry is the service call.
- A `request.expired` count taken before and after a real run, with the two numbers written down and
  the number the command reported beside them.
- One lapsed draft hold produces exactly one outbox row, with the row pasted into the notes.
- `expire_draft_holds` has one of the three outcomes recorded, with D2's state and the date.

Fail, and what it means:

- The count did not move and the run reported zero expiries, reported as a pass. That run proves
  nothing about emission and the plan is not done.
- Two rows for one lapse. The emit is on a read path and fires whenever somebody looks, which will
  flood the outbox in a way that only shows up under real use.
- `expire_draft_holds` deleted while D2 is open. That is a decision taken outside the scope that
  owns it.

Partial pass is acceptable on [task 4](#4--resolve-expire_draft_holds-or-hand-it-over-in-writing)
alone, and the handover branch is a complete answer rather than a deferral, as long as the criterion
is written down.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The daemon's expiry going through the service | `backend/main/scheduling/management/commands/expire_and_materialize.py` | — | not started |
| The lapsed-draft-hold event and its dispatch branch | `backend/main/scheduling/services.py` | — | not started |
| The `expire_draft_holds` outcome, one of three | recorded in `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md` | — | not started |
| Before-and-after `request.expired` counts | in the same notes file | — | not started |
| What you saw in instruction 5.3 | in the same notes file | — | not started |
| The command named for a job it does not do | [piece 2](../diagram-prompts.md#piece-2-the-command-named-for-a-job-it-does-not-do-planned--not-rendered) → `../diagrams/subject-02-named-for-a-job-it-does-not-do.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/02-make-the-commands-honest.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the two functions that sit together | `/unpack backend/main/scheduling/services.py:2600-2660` | task 1.3 | The expiry service and the notification writer read once, not twice |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers` | the close out | Statuses and running order match reality |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

**`expire_and_materialize.py::Command.handle`** as it stands, and what replaces it.

```python
# today: an inline update that no outbox event follows
expired = BookingRequest.objects.filter(
    status=BookingRequest.Status.PENDING,
    expires_at__lt=timezone.now(),
).update(status=BookingRequest.Status.EXPIRED)

# after task 2.1: the same path the one-shot command already uses
expired = expire_pending_requests(limit=<the limit this daemon should carry>)
```

**`scheduling/services.py::expire_pending_requests`** (line 2633) is what the replacement calls, and
it is where the `request.expired` [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event is recorded. Read it before changing the daemon, so
the daemon's printed count means the same thing it meant before.

**`scheduling/services.py::_dispatch_notification_for_event`** (line 2683) is the type-to-notification
mapping. A new event type with no branch there is a row that dispatches successfully and notifies
nobody, which is the same shape of silence this scope exists to remove.

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[03-build-the-runner.md](03-build-the-runner.md), which builds whatever
[01](01-take-the-execution-decision.md) chose and puts these commands on it, now that they do what
their names say.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. This is a small, specific code change in one Django app, and the closest
matches do the wrong job: `/code-audit` looks for problems that are already named here, and
`/write-tests` would add a suite this scope has no way to run green
(two backend tests already fail and there is no working pytest).
   also: `/unpack backend/main/scheduling/services.py:2600-2660` before task 2.1, for the two
   functions this plan and the next one both change.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A command reports success for work it never did | `expire_draft_holds`, which sweeps checkout sessions and is named for draft holds | Read the file, not the name. `diff` against its neighbour settles it in one command. |
| A background job changes state and no notification follows | `expire_and_materialize`'s inline update, which bypasses the service that emits | Route every state change through the service layer. The rule is nineteen call sites strong and had exactly one exception. |
| A login attempt fails with a [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> error that reads like bad credentials | The browser, when Vite bound 5174 because 5173 was taken | `CORS_ALLOWED_ORIGINS` names 5173 and 3000 only. Free 5173 and restart Vite. |
