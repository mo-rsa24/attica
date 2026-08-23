# 🔌 Put The Envelope On The Wire

Step 3 of 6 in this scope. Waits on [02](02-define-the-envelope.md). Runs at the same time as
[04](04-build-the-one-cache.md). Next: [04-build-the-one-cache.md](04-build-the-one-cache.md).

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

Scope: [one client truth](../MASTER_PLAN.md). Third of six, and the server half of the pair.

It waits on [02](02-define-the-envelope.md) because it sends what that document specifies, and on
nothing else. [04](04-build-the-one-cache.md) is the client half and reads the same document, so the
two can be done at the same time by two people who never speak. That is the arrangement
[02](02-define-the-envelope.md) exists to make possible.

[05](05-one-transport-that-recovers.md) needs both halves before its recovery claim can be tested,
which is why it sits after them rather than beside them.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

The version fields exist and never leave the REST layer. Four scheduling models carry
`version = models.PositiveIntegerField(default=1)`: `ResourcePolicy`
(`backend/main/scheduling/models.py:114`), `AvailabilityRule` (line 153), `AvailabilitySlot`
(line 224) and `Booking` (line 458). Five serializer field lists expose it. Nothing puts one on a
socket.

**Three specific things stand between the fields and the wire, and each needs different work.**

**The version cannot be read back after it is bumped.** Both bump sites use `version=F("version") + 1`
(`backend/main/scheduling/services.py:2189` on a rescheduled booking, and `:2549` inside a queryset
`update()` on availability slots). An `F()` expression is resolved by the database, so after the
save the in-memory instance holds the expression rather than the number. A handler that wants to put
the new version into a payload cannot read it off the object it just saved.

**`BookingRequest` has no version field at all** (`backend/main/scheduling/models.py:300`), and it is
the entity the whole booking journey turns on. Whether it gets one depends on D1, which
[01](01-read-the-answer-and-choose-the-cache.md) has read by the time this plan runs.

**The outbox payload is an identifier, not a state.** `_emit_outbox`
(`backend/main/scheduling/services.py:70`) writes `payload={"request_id": request_id}`, so the event
says which row changed and nothing about what it changed to. `aggregate_type` and `aggregate_id` are
already real columns (`backend/main/scheduling/models.py:605` to `:606`), so the identity half is
modelled and the version is what is missing.

**And one thing that is not this plan's, named here so it is not fixed twice.** The scheduling
notification writer `_create_in_app_notification`
(`backend/main/scheduling/services.py:2658`) persists a row and never pushes.
[The sibling scope](../../running-the-workers/MASTER_PLAN.md#definition-of-done) claims that line.
This plan owns what is inside a message; that one owns whether a message is sent.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **Daphne, not `runserver`**:
  `daphne -b 0.0.0.0 -p 8000 main.asgi:application`, per
  [the execution model](../../../../../environment/overview.md#execution-model). Every check in this
  plan reads a frame, and under `runserver` there are no frames and no error saying so.
- **The Python environment is `/home/molef/lobola`.** `source /home/molef/lobola/bin/activate`
  before anything with `manage.py`.
- **Redis carries the websocket channel layer on the default logical database** and the page cache
  on database 1. Every push here goes through the first.
- **The database is SQLite at `backend/main/db.sqlite3`**, one file, no server. This matters for one
  thing in this plan: reading a version back after a bump is a second query on SQLite as much as on
  anything else, and the fix is to stop using `F()` at the two sites rather than to rely on a
  database feature. PostgreSQL is D6 and belongs to `contention-and-holds`.
- **Two backend tests already fail**, so a red `python manage.py test` does not mean this plan broke
  something. Record which two are red before starting, so the comparison after is honest.

Where a fact this plan needs is not written there, stop and ask rather than inferring it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Resolve the bump sites before adding any field.**

The `F()` constraint is the one that makes everything else in this plan possible or impossible, and
it is invisible from a feature list. A version field added to `BookingRequest` and then bumped with
`F()` reproduces the exact problem the other four models have. Do the constraint first.

**A version field goes only on an entity D1 settled.**

[01](01-read-the-answer-and-choose-the-cache.md) produced two lists: settled and unsettled. Adding a
version to something on the second list means writing a migration for a representation that may be
migrated away from, which is work that gets deleted and a schema that has to be explained.

**Push after commit, not during it.**

`transaction.on_commit` appears nowhere in `backend/main`. Every `group_send` runs inline in the
call that wrote the row (`backend/main/notifications/utils.py:41`, `backend/main/chat/utils.py:18`,
`backend/main/chat/consumers.py:125`), so a transaction that rolls back after the push has already
told a client about a thing that does not exist. That is a one-line-per-site change and it is in
this plan because it is the same line the envelope work touches, so doing it separately means
touching all three sites twice.

**A push that fails is not an error to raise.**

`_safe_group_send` (`backend/main/chat/utils.py:10`) already swallows channel-layer errors so a REST
handler survives Redis being down, and that is correct: the row is persisted, and a client that
missed the push recovers by refetching, which is what [05](05-one-transport-that-recovers.md)
builds. Keep that behaviour and say so in the code, because the natural instinct when adding an
envelope is to make delivery feel more reliable, and reliability here comes from the client's
recovery rather than from the server trying harder.

**Do not touch the scheduling notification writer.**

`_create_in_app_notification` at `backend/main/scheduling/services.py:2658` is
`running-the-workers`' line. If this plan's envelope work makes it obvious what that fix is, write
the observation into that scope's plan rather than doing it here. One line owned by two scopes is
one line fixed twice, or, more likely, one line each scope assumes the other did.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**Four version fields that never leave the REST layer become four version fields a client can act
on**, and the work that makes it possible is two lines that currently cannot be read back.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

A client that receives a title and a message string can render it and nothing else. It cannot tell a
duplicate from a new fact, which is why the notification badge double-counts when the outbox
dispatcher retries, and it cannot tell a gap from quiet, which is why a dropped socket needs a
person pressing F5.

The number that fixes both is already in the database. It stops at the REST boundary for a reason
nobody chose: the two places that bump it do so in a form the calling code cannot read, so putting
it on a message would cost an extra query and nobody paid it. This plan pays it once, properly, and
then every message the server sends carries something a cache can compare.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  TODAY                                    AFTER THIS PLAN

  row.version = F("version") + 1           row.version = row.version + 1
       │                                        │
       ▼                                        ▼
  save()                                   save(), and the number is
       │                                   readable on the instance
       │  instance holds an expression          │
       ▼                                        ▼
  push  { title, message }                 push  { entity, id, version, type, at }
       │                                        │
       │  before commit                         │  transaction.on_commit
       ▼                                        ▼
  a client that can render it              a client that can compare it
  and nothing else                         and therefore ignore, apply, or
                                           notice it missed something

  three push sites change:  notifications/utils.py
                            chat/utils.py
                            chat/consumers.py

  one push site does NOT:   scheduling/services.py:2658
                            (running-the-workers owns it)
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

Two pieces in this scope's map are drawn from what this plan changes.

**Subject: a message with nothing to compare.** The empty version chip on the purple dashed arrow is
this plan's target, and the filled chip on the blue dashed arrow beside it is what already works
over REST.
[Piece 3](../diagram-prompts.md#piece-3-a-message-with-nothing-to-compare-planned--not-rendered).
Save as `../diagrams/subject-03-nothing-to-compare.png`. *(image not yet generated)*

**Subject capstone: the client-truth glyph, opened up.** The bottom panel of that picture, the two
paths that both end carrying an envelope with three filled chips, is exactly what this plan builds.
[The capstone](../diagram-prompts.md#the-client-truth-glyph-opened-up-planned--not-rendered).
Save as `../diagrams/subject-capstone-the-client-truth-glyph-opened-up.png`.
*(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Four changes in `backend/main`, in this order.

1. **The two bump sites resolved.** `backend/main/scheduling/services.py:2189` and `:2549` stop
   using `F("version") + 1` in a form that cannot be read back. Each becomes a bump whose new value
   is available to the code that just performed it, with the concurrency behaviour stated in a
   comment rather than assumed.
2. **One version field added, if and only if D1 settled the entity that needs it.** On today's
   reading that is `BookingRequest` (`backend/main/scheduling/models.py:300`), with a migration and
   a default of 1 matching the other four models.
3. **One envelope builder, in one place.** A single function that takes an entity, its id, its
   version and an event type and returns the payload shape
   [the contract](../../../../../docs/realtime_event_envelope.md) specifies. Three push sites call
   it and none of them builds a payload by hand.
4. **Three push sites moved behind `transaction.on_commit`**:
   `backend/main/notifications/utils.py:41`, `backend/main/chat/utils.py`, and
   `backend/main/chat/consumers.py:125`. The third is inside a consumer rather than a request, so it
   gets the same treatment only where it writes before it sends.

Plus the outbox payload carrying the version, so an event dispatched later still says what version
the change produced.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objectives 2 and 3](../MASTER_PLAN.md#objectives): give the client something to
reason about, and make at-least-once delivery safe by putting the comparison on the wire.

**Goal.** Every frame read in the DevTools WS Messages panel on
`ws/notifications/` and `ws/chat/rooms/<id>/` carries the entity, its id, its version and the event
type; both bump sites yield a number the emitting code can read without a second query;
`grep -rn "transaction.on_commit" backend/main` returns the three push sites; and no payload in
those three files is built by hand.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/03-put-the-envelope-on-the-wire.md`

▶ **Next: [task 1.1](#1--record-the-starting-state-so-after-means-something)**.

### 1. 📋 Record the starting state, so "after" means something

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Record which two backend tests are already red**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  python manage.py test 2>&1 | tail -30
  ```
  - Produces: the names of the failing tests and the totals, written into the working notes with the
    date.
  - Done when: two names are written down. A red suite after this plan means nothing unless the red
    before it is on record, and the environment overview says two are already failing.

- [ ] **1.2 Confirm the four claims this plan is built on, by reading them**
  ```
  cd /home/molef/Work/attica/backend/main
  grep -n 'version = models.PositiveIntegerField' scheduling/models.py
  grep -n 'F("version")' scheduling/services.py
  grep -n 'class BookingRequest' scheduling/models.py
  grep -rn "transaction.on_commit" . | wc -l
  ```
  - Produces: four answers. Expected on 2026-08-23: four version fields, two `F("version")` sites,
    `BookingRequest` at line 300 with no version among its fields, and zero `on_commit` calls.
  - Done when: each answer either matches or is written down as having changed. A plan built on a
    line number that moved is a plan that edits the wrong line.

- [ ] **1.3 Read D1's settled entity list**
  - Open `artifacts/notes/one-client-truth/what-owns-remote-state.md` and take the settled list and
    the unsettled list.
  - Done when: it is written down which entity, if any, this plan adds a version field to.
  - ❌ If the entity that needs a version is on the unsettled list, do not add the field. Write down
    that it was deferred and why, and carry on with the rest of this plan. The envelope works for the
    four entities that already have versions.

▶ **Next: [task 2.1](#2--resolve-the-two-bump-sites)**.

### 2. 🔧 Resolve the two bump sites

◀ **Needs: [task 1](#1--record-the-starting-state-so-after-means-something)**.

- [ ] **2.1 Make `backend/main/scheduling/services.py:2189` yield a readable version**
  - Today: `locked_booking.version = F("version") + 1` inside a block that already holds the row
    under `select_for_update`, then `save(update_fields=[...])`.
  - The row is already locked, so incrementing in Python is safe here and the lock is what makes it
    safe, not the `F()`. Write that reason in a comment on the line.
  - ❌ `select_for_update` does not lock on SQLite, per
    [the environment overview](../../../../../environment/overview.md). So the comment says the lock
    is what makes it safe *and* names SQLite as the reason that guarantee is currently weaker than
    it reads, pointing at `contention-and-holds` for D6. Do not silently rely on a lock this
    database does not take.
  - Produces: a bump whose new value is on the instance after the save.
  - Done when: the code that saves can read `locked_booking.version` and get a number.

- [ ] **2.2 Make `backend/main/scheduling/services.py:2549` yield readable versions**
  - Today: a queryset `AvailabilitySlot.objects.filter(id=slot.id).update(..., version=F("version") + 1, ...)`
    inside a loop over slots.
  - This one is a queryset update, so there is no instance to read from at all. Either refetch the
    versions the loop touched in one query after the loop, or change the loop to save instances.
  - Produces: the loop knows, by the time it finishes, which slot ids ended at which versions.
  - Done when: the ids and versions are available to whatever emits the availability event, without
    a query per slot. A per-slot query inside a materialisation loop is a performance defect this
    scope would be creating, and `performance-architecture` would then have to find it.

- [ ] **2.3 Add the version field, if D1 settled the entity**
  - On today's reading: `BookingRequest` (`backend/main/scheduling/models.py:300`) gets
    `version = models.PositiveIntegerField(default=1)`, matching the four models that already have
    one.
  - Then the migration:
    ```
    cd /home/molef/Work/attica/backend/main
    source /home/molef/lobola/bin/activate
    python manage.py makemigrations scheduling
    python manage.py migrate
    ```
  - Produces: a migration file, and a field that defaults to 1 on every existing row.
  - Done when: `python manage.py shell -c "from scheduling.models import BookingRequest; print(BookingRequest.objects.first().version)"`
    prints `1`, and every site that changes a `BookingRequest` status bumps it. A version field that
    nothing increments is worse than no field, because a client will trust it.

▶ **Next: [task 3.1](#3--build-the-envelope-once-and-call-it-three-times)**.

### 3. 📦 Build the envelope once, and call it three times

◀ **Needs: [task 2](#2--resolve-the-two-bump-sites)**.

- [ ] **3.1 Write one envelope builder**
  - Location: a new module beside the writers that use it, so both apps import from one place rather
    than one importing from the other. `backend/main/realtime/envelope.py` is the shape to aim at,
    and if a smaller placement is obviously right, say why in the commit.
  - Signature and return shape come from
    [the envelope contract](../../../../../docs/realtime_event_envelope.md), not from this plan.
  - Produces: one function every push site calls.
  - Done when: `grep -rn "group_send" backend/main --include=*.py` shows every remaining call site
    passing a payload the builder returned, except `backend/main/scheduling/services.py:2658`, which
    belongs to `running-the-workers` and is out of scope here.

- [ ] **3.2 Send the envelope from the notification writer**
  - `backend/main/notifications/utils.py:41`, currently eight fields and no version.
  - Keep the fields a person's notification panel renders, and add the envelope alongside them
    rather than replacing them. A client mid-migration must not lose its notification text because
    the envelope arrived.
  - Done when: a frame captured in the DevTools WS Messages panel shows both the old fields and the
    envelope, and [instruction 5](#5--read-the-frames-and-confirm-the-envelope-is-really-there)
    confirms it.

- [ ] **3.3 Send the envelope from both chat paths**
  - `backend/main/chat/utils.py` (`broadcast_room_event`, the request-side path) and
    `backend/main/chat/consumers.py:125` (`_broadcast`, the socket-side path).
  - Both end up in the same group, so both must carry the same shape or a client will branch on
    which path a message came from, which is a distinction no client should be able to see.
  - Done when: a message sent through the REST API and a message sent through the socket produce
    frames with the same envelope fields.

- [ ] **3.4 Put the version into the outbox payload**
  - `_emit_outbox` (`backend/main/scheduling/services.py:70`) writes
    `payload={"request_id": request_id}` at its call sites.
  - Add the version of the aggregate at the moment the event was emitted, so an event dispatched
    minutes later still says what version the change produced rather than what the row holds now.
  - Produces: an outbox event whose payload can be turned into an envelope by the dispatcher without
    re-reading the row.
  - Done when: a row in `scheduling_outboxevent` shows a payload carrying both the id and the
    version. Read one:
    ```
    cd /home/molef/Work/attica/backend/main
    source /home/molef/lobola/bin/activate
    python manage.py shell -c "from scheduling.models import OutboxEvent; print(OutboxEvent.objects.order_by('-id').first().payload)"
    ```

- [ ] **3.5 Move the three push sites behind `transaction.on_commit`**
  - The three: `backend/main/notifications/utils.py:41`, `backend/main/chat/utils.py`,
    `backend/main/chat/consumers.py:125`.
  - Keep `_safe_group_send`'s swallow-and-log behaviour. A push that fails after a successful commit
    is a gap the client recovers from, and raising would turn a recoverable gap into a failed
    request.
  - Done when: `grep -rn "transaction.on_commit" backend/main --include=*.py | wc -l` returns 3, and
    a deliberately rolled-back transaction sends no frame. Prove the second in
    [instruction 5.4](#5--read-the-frames-and-confirm-the-envelope-is-really-there).

▶ **Next: [instruction 5.1](#5--read-the-frames-and-confirm-the-envelope-is-really-there)**, because
a frame is the only evidence that any of this reached a browser.

### 4. 🧪 Prove the shape, not the plumbing

◀ **Needs: [task 3](#3--build-the-envelope-once-and-call-it-three-times)**.

- [ ] **4.1 Run the following prompt:** `/write-tests backend/main/realtime/envelope.py unit`
  - Produces: unit tests for the envelope builder in the repo's existing Django test style, covering
    every field the contract marks required and the behaviour when a version is missing.
  - Output goes to: wherever the repo's convention puts backend tests, which
    `/write-tests` detects rather than this plan asserting.
  - Reference: [the envelope contract](../../../../../docs/realtime_event_envelope.md) is the source
    of what "correct" means; hand it to the skill as the specification.

- [ ] **4.2 Re-run the backend suite and compare against the two known reds**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  python manage.py test 2>&1 | tail -30
  ```
  - Done when: the failure list is the same two names from
    [task 1.1](#1--record-the-starting-state-so-after-means-something), or every new failure has a
    written explanation. A third red is a finding, not a rounding error.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 4](#4--prove-the-shape-not-the-plumbing)** and
[instruction 5](#5--read-the-frames-and-confirm-the-envelope-is-really-there).

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 5. 🔍 Read the frames, and confirm the envelope is really there

◀ **Needs: [task 3](#3--build-the-envelope-once-and-call-it-three-times)** done, so there is
something new to look at.

A passing unit test proves the builder returns the right dictionary. Only a frame proves the
dictionary reached a browser.

5.1 **Bring the stack up with Daphne and open the frames panel**
   - ```bash
     cd /home/molef/Work/attica/backend/main
     source /home/molef/lobola/bin/activate
     daphne -b 0.0.0.0 -p 8000 main.asgi:application
     ```
   - In a second terminal: `cd /home/molef/Work/attica/frontend && npm run dev`.
   - Chrome at `http://localhost:5173`, log in, F12, **Network** tab, **WS** filter, click the
     `rooms/` row, then the **Messages** tab.
   - ✅ Frames are listed: carry on.
   - ❌ No WS row: Daphne is not running, or the socket URL has no `?token=`. The websocket
     authenticates by query parameter, so a missing token fails the handshake with no message on the
     page.

5.2 **Send a chat message and read the frame**
   - Type a message and send it.
   - Expected result: a frame carrying the entity name, the id, the version and the event type.
   - ✅ All four present: the chat path is done. Copy the frame into the working notes.
   - ❌ The frame has the old shape only: the push site is still building its payload by hand, or
     the request went through the path you did not change. There are two chat paths
     (`chat/utils.py` and `chat/consumers.py`); check which one this message took by whether it was
     sent over the socket or through the REST API.

5.3 **Trigger a notification and read that frame**
   - From a second browser logged in as the other party, send a message that notifies you.
   - Expected result: a frame on the notifications socket carrying both the eight rendering fields
     and the envelope.
   - ✅ Both present: nothing a panel renders was lost, which is the failure this step is checking
     for.
   - ❌ The old fields are gone: the envelope replaced them instead of joining them. The panel will
     render blank rows and the cause will look like a frontend bug. Fix it here.

5.4 **Prove the push waits for the commit**
   - In a Django shell, wrap a notification-creating call in a transaction that raises before it
     commits:
     ```bash
     cd /home/molef/Work/attica/backend/main
     source /home/molef/lobola/bin/activate
     python manage.py shell
     ```
     Then, in the shell, open `transaction.atomic()`, call the notification writer, and raise.
   - Expected result: no frame in the Messages panel, and no notification row in the database.
   - ✅ Nothing arrives: `transaction.on_commit` is doing its job.
   - ❌ A frame arrives for a notification that was rolled back: the push is still inline. That is
     the exact defect this plan closes, and it is invisible in every normal run because normal runs
     commit.

5.5 **Write the four frames into the working notes**
   - The chat frame, the notification frame, the rolled-back non-frame, and the outbox payload from
     [task 3.4](#3--build-the-envelope-once-and-call-it-three-times).
   - These are what [06](06-prove-it-and-write-it-down.md) turns into the runbook recipe for
     watching events arrive, so capturing them now saves doing this twice.

▶ **Next: [task 4.1](#4--prove-the-shape-not-the-plumbing)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when a frame read in the browser carries a number a cache can compare, and a
> rolled-back transaction sends nothing.

Pass:

- Both bump sites yield a version the emitting code can read without a second query, and the
  concurrency reasoning is in a comment naming SQLite.
- A frame on `ws/chat/rooms/<id>/` and a frame on `ws/notifications/` each carry the entity, the id,
  the version and the event type, captured and pasted into the notes.
- The notification frame still carries everything the panel renders.
- A rolled-back transaction produces no frame.
- The outbox payload carries the version as well as the id.
- The backend suite fails the same two tests it failed before, or every new failure is explained.

Fail, and what it means:

- A version field added to an entity D1 left unsettled. Then this plan wrote a migration for a
  representation that may not survive, and the schema now has to be explained to whoever does the
  migration.
- A version bumped with `F()` anywhere new. Then the new field has the same defect as the four
  existing ones and nothing was learned.
- The envelope proved by a unit test and never seen in a frame. That is the failure this plan is
  most exposed to, because the builder is easy to test and the wire is where the shape actually has
  to arrive.
- `_create_in_app_notification` at `backend/main/scheduling/services.py:2658` edited here. That is
  `running-the-workers`' line, and fixing it twice is the outcome that boundary exists to prevent.

Partial pass is acceptable on the outbox payload. The three live push sites carrying the envelope is
the load-bearing half; the outbox payload matters when the dispatcher runs, which is another scope's
condition.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| Two bump sites that can be read back | `backend/main/scheduling/services.py:2189`, `:2549` | — | not started |
| The version field and its migration, if D1 settled it | `backend/main/scheduling/models.py`, `scheduling/migrations/` | — | not started |
| One envelope builder | `backend/main/realtime/envelope.py` | — | not started |
| Three push sites sending the envelope after commit | `notifications/utils.py`, `chat/utils.py`, `chat/consumers.py` | — | not started |
| The outbox payload carrying the version | `backend/main/scheduling/services.py:70` and its call sites | — | not started |
| Unit tests for the builder | wherever the repo puts backend tests | — | not started |
| Four captured frames | this plan's working notes, reused by [06](06-prove-it-and-write-it-down.md) | — | not started |
| A message with nothing to compare | [piece 3](../diagram-prompts.md#piece-3-a-message-with-nothing-to-compare-planned--not-rendered) → `../diagrams/subject-03-nothing-to-compare.png` | subject | ⏳ not rendered |
| The client-truth glyph, opened up | [the capstone](../diagram-prompts.md#the-client-truth-glyph-opened-up-planned--not-rendered) → `../diagrams/subject-capstone-the-client-truth-glyph-opened-up.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/03-put-the-envelope-on-the-wire.md` | task 0, before any work | Conformance and thin instructions reported |
| Test the builder | `/write-tests backend/main/realtime/envelope.py unit` | task 4.1 | Unit tests in the repo's existing style |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth` | the close out | Statuses and running order match reality |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

`backend/main/scheduling/services.py:2189` — the booking bump, inside a `select_for_update` block:

```python
locked_booking.status = Booking.Status.CONFIRMED
locked_booking.version = F("version") + 1        # after save(), this holds an expression
locked_booking.save(update_fields=["start_at", ...])
```

`backend/main/scheduling/services.py:2549` — the slot bump, a queryset update with no instance:

```python
AvailabilitySlot.objects.filter(id=slot.id).update(
    source_rule=rule, capacity_total=target_capacity,
    is_bookable=is_bookable, version=F("version") + 1, updated_at=timezone.now(),
)
```

`backend/main/scheduling/services.py:70` — `_emit_outbox`, the identity-only payload:

```python
OutboxEvent.objects.create(
    event_type=event_type, aggregate_type=aggregate_type,
    aggregate_id=str(aggregate_id), payload=payload,   # payload={"request_id": request_id}
)
```

`backend/main/chat/utils.py:10` — `_safe_group_send`, which swallows channel-layer errors so the
REST handler survives Redis being down. Keep this. Recovery from a missed push is the client's job,
built in [05](05-one-transport-that-recovers.md).

`backend/main/scheduling/models.py:300` — `BookingRequest`, whose fields run from `event` at 310 to
`expires_at` at 340 with no `version` among them.

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[04-build-the-one-cache.md](04-build-the-one-cache.md), the client half of the same contract. It
waits on [01](01-read-the-answer-and-choose-the-cache.md) and [02](02-define-the-envelope.md) and
not on this plan, so the two can be done at the same time by two people.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/write-tests backend/main/realtime/envelope.py unit` ✅ — writes the builder's tests in the repo's
existing Django test style and stops there, which is the right size: the plumbing is proved by a
frame in a browser, not by a test.
   alt: `/error-handling backend/main/chat/utils.py log` if the push sites need their swallow-and-log
   behaviour made explicit rather than inherited.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A version read back as `CombinedExpression` rather than a number | Any code reading `.version` after an `F()` bump | The instance holds the expression until it is refetched. That is what task 2 removes at the two existing sites, and what task 2.3 must not reintroduce. |
| A frame arrives for a change that was rolled back | Any push site not behind `transaction.on_commit` | Move the push into `transaction.on_commit`. Normal runs commit, so this is invisible until a rollback happens in front of a user. |
| A booking action produces no notification frame at all | The scheduling notification path | `_create_in_app_notification` persists and never pushes. That is `running-the-workers`' criterion. Do not fix it here. |
| The WS filter in DevTools shows no row | The stack, with `runserver` instead of Daphne | Start Daphne. Under `runserver` every socket fails silently. |
