# 📡 Close The Two Silent Losses

Step 4 of 5 in this scope. Waits on [03](03-build-the-runner.md), because both fixes here are only
observable once something runs on a clock.
Next: [05-prove-it-and-write-it-down.md](05-prove-it-and-write-it-down.md).

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

Scope: [running the workers](../MASTER_PLAN.md). Fourth of five. It waits on
[03](03-build-the-runner.md) for a real reason rather than a tidiness one: a reaper is a job on a
clock, and the crash test needs a worker that was started by something other than the person running
the test.

Two of the nine architecture tests in
[the acceptance list](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#6-acceptance)
are settled here: "a worker crashes after commit and before notification", and the no-refresh half
of the two-browser test.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

The recurring work runs now. Every event that gets written gets dispatched. Two places still lose an
event that was safely persisted, and both look exactly like success from every angle the application
offers.

**`processing` is a state with no way out.** The dispatcher claims an event by moving it to
`PROCESSING` (`backend/main/scheduling/services.py:3355`) and only ever selects rows whose status is
`PENDING` or `FAILED` (`backend/main/scheduling/services.py:3342`). A worker that dies between the
claim and the outcome leaves that event stranded for good. Nothing reaps it, and no count anywhere
reports it.

**Two functions write a notification row and only one tells anybody.** `create_notification`
(`backend/main/notifications/utils.py:24`), which chat uses, writes the row and then `group_send`s
to `notifications_{recipient.id}`. `_create_in_app_notification`
(`backend/main/scheduling/services.py:2658`), which every outbox dispatch uses, calls
`Notification.objects.create` and stops. The consumer exists
(`backend/main/notifications/consumers.py:19`), it is routed at `ws/notifications/`
(`backend/main/notifications/routing.py:6`), and the frontend connects to it
(`frontend/src/components/notifications/useNotifications.js:83`). The socket is wired at both ends
for chat and at one end for everything the outbox dispatches.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **Daphne, not `runserver`.** Under `runserver` the push this plan builds fails with no clear
  error, which is indistinguishable from the bug it is fixing. Use
  `daphne -b 0.0.0.0 -p 8000 main.asgi:application` for every check in this plan.
- **Redis carries two unrelated logical databases**: the channel layer on the default, the page
  cache on database 1. The push goes to the first. Flushing the wrong one drops live websocket
  groups without an error.
- **`select_for_update` does not lock on SQLite.** The dispatcher does not rely on it, claiming with
  a conditional `UPDATE` instead, which is safe on SQLite for one worker. The reaper this plan adds
  must use the same conditional-update shape for the same reason.
- **The two failing backend tests are in `events/tests.py`**, so a red `python manage.py test` does
  not mean this plan broke something. The evidence here is the two by-hand walks, not a green suite.
- **The known-gaps entry naming this exact defect** is
  [the booking-request write path never pushes](../../../../../environment/overview.md#known-gaps--non-obvious-constraints).
  It stops being true in this plan, and [05](05-prove-it-and-write-it-down.md) rewrites it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**One delivery mechanism, not two.**

The fix is not "add a `group_send` to the scheduling writer". Two functions that both write a
notification row and both push will drift, and the drift will be invisible until one of them stops
pushing. There is already a function that does it right. The scheduling path uses it, or there is
one function and both call it.

**D1 decides which booking representation survives; it does not decide this.**

The push belongs to the notifications app, which is downstream of every booking representation. So
this fix holds whichever way D1 went. What D1 does decide is which caller sites exist afterwards,
and [task 1.1](#1--establish-the-two-writers-and-the-stranded-rows) reads the answer rather than
assuming it, per the rule in
[the decisions taken here](../decisions-taken-here.md#whether-this-scope-waits-on-d1-or-is-written-against-it).

**The reaper's timeout is a number, and a number needs its arithmetic.**

Too short and it reaps a worker that is alive and mid-dispatch, producing a duplicate notification.
Too long and a stranded event sits for hours. Derive it from the worst case you can measure rather
than picking a round number: the webhook timeout is 5 seconds
(`SCHEDULING_WEBHOOK_TIMEOUT_SECONDS`, `backend/main/main/settings.py:241`), a cycle handles up to
`--limit` events, and the dispatch interval is whatever
[03](03-build-the-runner.md)'s job list says. Write the multiplication down next to the value.

**At-least-once, never exactly-once.**

A reaper that returns an event to `pending` may cause a second delivery of something that was
actually sent just before the worker died. That is correct behaviour for this design and it must be
said out loud, because the alternative is losing events. Where a duplicate notification would be
visibly wrong to a user, that is a finding for `one-client-truth`, scope 10, which owns the event
envelope and its version.

**Watch the frames, not the interface.**

A bell that updates could be a push or could be a poll. The evidence for this plan is the frame in
the DevTools WS Messages panel, read directly. The chat system already runs both a websocket and an
eight-second poll, so an interface that updates proves nothing about which one did it.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**After this plan, killing the worker mid-dispatch costs a delay and not an event, and a booking
change reaches the other person's screen while they are looking at it.** Those are the two things
this system currently cannot claim.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Both defects here have the same shape and it is the worst shape a defect can have: the system
reports success and the person waiting is never told.

The stranded event is the purer case. Everything worked. The booking was written, the event was
recorded in the same transaction, the worker picked it up. Then the process died, and because the
claim survived the worker, the event is now invisible to the only query that would find it. No
error, no retry, no count. It is a row that will still be there next year.

The unpushed notification is the more common one, because it happens on every booking change rather
than only when a process dies. The row is written and the socket is open and nothing connects them.
The chat path proves the connection works, which makes this a missing call rather than a missing
capability.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  LOSS 1: THE STATE YOU CANNOT LEAVE

  pending ──claim──► processing ──► sent
                          │
                     worker dies
                          │
                          ▼
                     (selected by nothing: the query reads pending + failed)
                          │
                     this plan adds:  processing + older than T  ──► pending


  LOSS 2: TWO WRITERS, ONE SOCKET

  chat ──► create_notification ──► row ──► group_send ──► browser  ✅
                                              ▲
  outbox ──► _create_in_app_notification ──► row      ✗ stops here
                                              │
                             this plan joins the second to the first
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

Two pieces in this scope's map are exactly this plan's two halves.

**Subject: two writers, one socket.** The lower track's browser card with no arrow arriving is what
[task 3](#3--make-the-scheduling-path-push) fixes.
[Piece 3](../diagram-prompts.md#piece-3-two-writers-one-socket-planned--not-rendered).
Save as `../diagrams/subject-03-two-writers-one-socket.png`. *(image not yet generated)*

**Subject: the state you cannot leave.** The holding pen with no arrow out, and the empty frame
where the reaper goes, are what [task 2](#2--build-the-reaper) fills.
[Piece 4](../diagram-prompts.md#piece-4-the-state-you-cannot-leave-planned--not-rendered).
Save as `../diagrams/subject-04-the-state-you-cannot-leave.png`. *(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Three changes to `backend/main/`, and one job added to the runner's list.

1. **A reaper**, returning `PROCESSING` rows older than a stated timeout to `PENDING`, using the same
   conditional-`UPDATE` claim shape the dispatcher already uses so it is safe on SQLite. It reports
   how many it reclaimed, and it never touches a row younger than the timeout.
2. **A job entry for it** in [03](03-build-the-runner.md)'s job list, with its cadence and the
   one-line reason, added the way that file expects rather than by changing the runner.
3. **One notification delivery path.** The scheduling writer stops being a second implementation:
   either it calls `create_notification` from `notifications/utils.py`, or both call one function
   that writes and pushes. There is one `group_send` to `notifications_{user_id}` in the codebase
   afterwards, not two.
4. **A statement of at-least-once delivery**, written where somebody would otherwise assume
   exactly-once: beside the reaper, in one comment, naming what a duplicate means and which scope
   owns making duplicates harmless.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 3](../MASTER_PLAN.md#objectives), closing the two silent losses, and
[goals 2 and 3](../MASTER_PLAN.md#goals): killing the worker mid-dispatch loses no event, and a
booking change made by one person appears on the other person's screen with no refresh.

**Goal.** A stranded `processing` row is reclaimed and delivered on the next cycle, watched
happening; and one `group_send` to the per-user notification group exists in the codebase, with a
frame read in the DevTools WS Messages panel to prove it arrives.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/04-close-the-two-silent-losses.md`

▶ **Next: [task 1.1](#1--establish-the-two-writers-and-the-stranded-rows)**.

### 1. 🔬 Establish the two writers and the stranded rows

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read D1's answer and list the notification call sites it leaves standing**
  - Take the quoted answer from
    `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md`, written by
    [01](01-take-the-execution-decision.md).
  ```
  cd /home/molef/Work/attica/backend/main
  grep -rn "_create_in_app_notification" --include=*.py . | grep -v tests.py
  grep -rn "create_notification\|notify_" --include=*.py . | grep -v tests.py | grep -v migrations
  ```
  - Produces: two lists of call sites, one per writer, each labelled with the booking representation
    it serves.
  - Done when: it is written down which sites survive D1 and which are on a representation being
    migrated. A push added to a call site that is about to be deleted is work that gets deleted.

- [ ] **1.2 Count what is stranded right now**
  ```
  cd /home/molef/Work/attica/backend/main
  python3 -c "
  import sqlite3
  c = sqlite3.connect('db.sqlite3')
  for r in c.execute('select status, count(*) from scheduling_outboxevent group by status'):
      print(r[0], r[1])
  for r in c.execute(\"select id, event_type, attempts, updated_at from scheduling_outboxevent where status='processing' order by updated_at\"):
      print(r)
  "
  ```
  - Produces: the count per status, and every `processing` row with its age.
  - Done when: the number is written down, whatever it is. Zero is a fine answer and it is the
    before-number the crash test moves.

- [ ] **1.3 Read the claim and the selection side by side, and write the timeout's arithmetic**
  - `backend/main/scheduling/services.py:3342` is the selection (`PENDING` or `FAILED` only).
    `:3355` is the claim (`update(status=PROCESSING)`).
  - The inputs to the timeout: `SCHEDULING_WEBHOOK_TIMEOUT_SECONDS` is 5
    (`backend/main/main/settings.py:241`); `--limit` defaults to 100; the dispatch interval comes
    from [03](03-build-the-runner.md)'s job list.
  - Produces: one line of arithmetic ending in the timeout value, and one sentence saying what
    happens if it is too short and what happens if it is too long.
  - Done when: the value is derived rather than chosen. A round number with no arithmetic beside it
    is a guess that will be defended as a decision.

▶ **Next: [task 2.1](#2--build-the-reaper)**.

### 2. ♻️ Build the reaper

◀ **Needs: [task 1](#1--establish-the-two-writers-and-the-stranded-rows)**, for the timeout.

- [ ] **2.1 Write the reclaim, using the dispatcher's own claim shape**
  - A service function in `backend/main/scheduling/services.py` beside `dispatch_outbox_events`,
    selecting `status=PROCESSING` and `updated_at` older than the timeout, and returning each row to
    `PENDING` with a conditional `UPDATE` that names `PROCESSING` in its filter.
  - Do not use `select_for_update`: it does not lock on SQLite, and the conditional update is what
    the dispatcher already relies on for the same reason.
  - Produces: a function returning the number of rows reclaimed.
  - Done when: it reclaims a row older than the timeout, leaves a row younger than the timeout
    alone, and both cases are demonstrated by setting `updated_at` by hand in the Django shell and
    running it.

- [ ] **2.2 State at-least-once where somebody would assume otherwise**
  - One comment beside the reclaim: a reclaimed event may be delivered twice if the worker died
    after sending and before recording, and that is the intended trade against losing it. Name
    `one-client-truth`, scope 10, as the scope that makes duplicates harmless with an entity version
    on the event envelope.
  - Done when: a reader who arrives at this function expecting exactly-once is told otherwise in the
    file rather than in a plan.

- [ ] **2.3 Add the reaper to the runner's job list**
  - Edit only the job list file from [03](03-build-the-runner.md)'s task 2.1: name, command,
    cadence, enabled, reason. Do not change the runner.
  - Produces: one new entry, and a runner start that names it in the output.
  - Done when: restarting the runner prints the reaper's line among the jobs. If adding a job needed
    a change to the runner, the configuration promise from
    [01](01-take-the-execution-decision.md) is not real and that is a finding worth going back for.

▶ **Next: [task 3.1](#3--make-the-scheduling-path-push)**.

### 3. 🔊 Make the scheduling path push

◀ **Needs: [task 1.1](#1--establish-the-two-writers-and-the-stranded-rows)**, so the surviving call
sites are known.

- [ ] **3.1 Reduce two writers to one**
  - `_create_in_app_notification` (`backend/main/scheduling/services.py:2658`) either calls
    `create_notification` (`backend/main/notifications/utils.py:24`), or both are replaced by one
    function that writes the row and pushes.
  - Keep `create_notification`'s existing failure behaviour: it wraps the `group_send` in a
    try/except and logs a warning, so a Redis outage degrades to no-push rather than to a failed
    booking. That is correct and must survive the change.
  - Produces: exactly one `group_send` to `notifications_{...}` in the backend.
  - Done when: `grep -rn "notifications_" --include=*.py backend/main | grep group_send` returns one
    line. Two lines means the second implementation is still there.

- [ ] **3.2 Confirm the payload the consumer and the frontend already expect**
  - The consumer is `backend/main/notifications/consumers.py:19`; the frontend handler is
    `frontend/src/components/notifications/useNotifications.js:83`.
  - Produces: the field list the existing push sends, checked against what the frontend reads.
  - Done when: any field the scheduling notifications carry and the chat ones do not (a `link_type`,
    a `link_id`, a booking id) is either in the payload or explicitly not needed, said in one line.
    A frame that arrives and renders blank is a worse outcome than no frame, because it looks fixed.

- [ ] **3.3 Prove one dispatch produces one frame, from the server side**
  - Drive one booking change with the runner running, and check both: the outbox row moved to
    `sent`, and the log line from the push (or its absence) in the backend output.
  - Produces: the two observations, written down together.
  - Done when: the row is `sent` and no warning was logged. A `Failed to broadcast notification`
    warning means Redis or the channel layer, not this change, and it is on the default logical
    database.

▶ **Next: [instruction 4.1](#4--kill-the-worker-mid-dispatch-and-watch-the-event-survive)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 5](#5--the-two-browser-no-refresh-walk)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern --from-run-log` for anything that bit
  - A row claimed into a state the reader never selects is a pattern worth a catalog entry. It is
    not specific to this table and it will be built again.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 💀 Kill the worker mid-dispatch, and watch the event survive

◀ **Needs: [task 2](#2--build-the-reaper)**.

This is the ninth architecture test in
[the acceptance list](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#6-acceptance).
It cannot be done by reading code, because the thing being tested is what survives a process that no
longer exists.

4.1 **Start everything, including the runner**
   - Follow the recipe [03](03-build-the-runner.md) wrote for starting the recurring work.
   - Confirm with `redis-cli ping` returning `PONG` and the runner naming its jobs on start.
   - ✅ All jobs named, Redis up: continue.
   - ❌ Anything missing: fix it now. A crash test on a stack that was already half-down proves
     nothing.

4.2 **Create work, then kill the worker in the window**
   - Drive one booking request through the app so an outbox row is written
     (follow [driving the booking flow](../../../../../runbook/driving-the-app/driving-the-booking-flow.md)).
   - Find the worker process: `pgrep -af "outbox"`.
   - Kill it during a dispatch: `kill -9 <pid>`. `-9` on purpose, because SIGTERM is handled
     gracefully and a graceful shutdown is not what is being tested.
   - Expected result: the process disappears without a shutdown message.
   - ✅ It is gone from `pgrep`: continue immediately, before the runner restarts it.

4.3 **Confirm the row is stranded**
   - Open `http://localhost:8000/admin/` → Scheduling → Outbox events → filter Status =
     `processing`.
   - Expected result: at least one row sitting in `processing`, with an `updated_at` of moments ago.
   - ✅ A row is there: this is the loss, visible. Note its id and its `updated_at`.
   - ❌ No row: the kill missed the window between the claim and the outcome. That window is short.
     Lower the dispatch limit or add several requests at once, and try again. Write down how many
     attempts it took, because that number tells the next person how likely this is in real use.

4.4 **Wait for the timeout, then watch it come back**
   - Wait the reaper's timeout plus one reaper cycle. Both numbers are in the job list; write the
     wall-clock time you expect it by.
   - Refresh the admin list.
   - Expected result: the row's status is `pending`, then `sent`.
   - ✅ It reaches `sent`, and the notification arrives: the event survived a process that did not.
     Screenshot the admin row at `processing` and at `sent`, and save both to
     `artifacts/figures/running-the-workers/`.
   - ❌ It stays `processing` past the deadline: the reaper is not running, or its filter does not
     match. Check the runner named it on start before checking the code, because a job that was
     never started fails in exactly this way.

▶ **Next: [instruction 5.1](#5--the-two-browser-no-refresh-walk)**.

### 5. 🖥️🖥️ The two-browser no-refresh walk

◀ **Needs: [task 3](#3--make-the-scheduling-path-push)**.

The point of this walk is one frame arriving in a panel, not an interface that updates. Chat already
runs a websocket and an eight-second poll at the same time, so a bell that changes proves nothing
about which of the two did it.

5.1 **Two browsers, two roles, both with DevTools open on WS**
   - Window one: log in as the organizer. Window two: a separate browser or a private window, logged
     in as the provider who owns the resource. Two profiles, because one browser shares the session.
   - In **both** windows: DevTools → Network → filter **WS** → find the row whose name begins
     `notifications` → click it → **Messages** tab. Leave both open.
   - Expected result: both rows show `101 Switching Protocols` in Headers.
   - ✅ Both are 101: the sockets are up at both ends and anything that fails now is delivery.
   - ❌ A row is red or absent: check Redis, then check the backend is Daphne rather than
     `runserver`. Under `runserver` websockets fail with no clear error, which is the exact
     appearance of the bug this plan is fixing.

5.2 **Send a request from window one and touch nothing in window two**
   - Organizer sends one booking request to that provider.
   - Watch window two's Messages panel. Do not refresh, do not click, do not switch tabs.
   - Expected result: within one dispatch interval, a frame appears.
   - ✅ A frame appears: read it. Record its `type` field and the notification's `title` verbatim
     into `artifacts/notes/running-the-workers/`. This is the evidence for
     [goal 3](../MASTER_PLAN.md#goals), and the frame is the evidence rather than the bell.
   - ❌ No frame within two dispatch intervals: check the outbox row's status in the admin first.
     `sent` with no frame is a push problem; `pending` is a runner problem; `processing` is a
     stranded row and instruction 4's reaper should collect it. Three different faults, one
     appearance, and the admin tells them apart in one look.

5.3 **Answer from window two and watch window one**
   - Provider accepts. Watch window one's Messages panel, untouched.
   - Expected result: a frame in window one.
   - ✅ Both directions deliver: the no-refresh half of the two-browser test passes.
   - ❌ Only one direction works: note which. The two directions can use different call sites, and
     [task 1.1](#1--establish-the-two-writers-and-the-stranded-rows)'s list says which.

5.4 **Screenshot both panels with the frames visible**
   - Save to `artifacts/figures/running-the-workers/` with a README entry per
     `~/.claude/ARTIFACT_TREE_FORMAT.md` saying what was done and what the frame shows.
   - A screenshot of a bell is not evidence. A screenshot of the frame is.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody killed the worker in the middle of a dispatch and the notification
> arrived anyway, and when a request sent in one browser appeared as a frame in another with nobody
> pressing anything.

Pass:

- `grep -rn "notifications_" --include=*.py backend/main | grep group_send` returns exactly one line.
- The reaper's timeout has its arithmetic written beside it, and both cases were demonstrated: a row
  older than the timeout reclaimed, a row younger left alone.
- The crash walk reached `sent`, with the two admin screenshots saved and carded.
- A frame was read in the WS Messages panel in both directions, with its `type` recorded verbatim.

Fail, and what it means:

- Two `group_send` lines. There are still two delivery mechanisms and they will drift.
- The bell updated but no frame was found. That is a poll, and the plan has proved nothing. The chat
  system's eight-second poll is the most likely explanation and it is not this scope's to remove.
- The reaper reclaimed a row that was younger than the timeout. It is racing a live worker and will
  produce duplicate notifications under normal operation, not just after a crash.
- A round-numbered timeout with no arithmetic. The number will be wrong the first time the limit or
  the interval changes and nobody will know which way to move it.

Partial pass is acceptable on instruction 4.3 alone: if the kill window proves hard to hit by hand,
set a row to `processing` with a stale `updated_at` in the Django shell and say in the notes that the
strand was manufactured rather than caught. That still tests the reaper. It does not test the claim,
so say which one you tested.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The reaper and its at-least-once comment | `backend/main/scheduling/services.py` | — | not started |
| The reaper's job entry | the job list from [03](03-build-the-runner.md) | — | not started |
| One notification delivery path | `backend/main/scheduling/services.py` and `backend/main/notifications/utils.py` | — | not started |
| The timeout's arithmetic | `artifacts/notes/running-the-workers/what-runs-the-recurring-work.md` | — | not started |
| Admin screenshots: the row at `processing` and at `sent` | `artifacts/figures/running-the-workers/` | — | not started |
| WS Messages screenshots, both directions, frames visible | `artifacts/figures/running-the-workers/` | — | not started |
| Two writers, one socket | [piece 3](../diagram-prompts.md#piece-3-two-writers-one-socket-planned--not-rendered) → `../diagrams/subject-03-two-writers-one-socket.png` | subject | ⏳ not rendered |
| The state you cannot leave | [piece 4](../diagram-prompts.md#piece-4-the-state-you-cannot-leave-planned--not-rendered) → `../diagrams/subject-04-the-state-you-cannot-leave.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/running-the-workers/plans/04-close-the-two-silent-losses.md` | task 0, before any work | Conformance and thin instructions reported |
| Card the evidence | `~/.claude/ARTIFACT_TREE_FORMAT.md` | instruction 5.4 | Four screenshots with provenance in prose |
| Capture patterns | `/ingest-error-pattern --from-run-log` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers` | the close out | Statuses and running order match reality |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

**`scheduling/services.py::dispatch_outbox_events`** is where both halves of loss 1 live, and the
reaper is its mirror image:

```python
# the selection, line 3342: processing is not in this list
OutboxEvent.objects.filter(
    status__in=[OutboxEvent.Status.PENDING, OutboxEvent.Status.FAILED],
    next_attempt_at__lte=now,
)

# the claim, line 3355: safe on SQLite because it is conditional, not a row lock
OutboxEvent.objects.filter(
    id=event_id, status__in=[PENDING, FAILED], next_attempt_at__lte=timezone.now(),
).update(status=OutboxEvent.Status.PROCESSING, updated_at=timezone.now())

# the reaper, task 2.1: the same shape, in the other direction
OutboxEvent.objects.filter(
    status=OutboxEvent.Status.PROCESSING, updated_at__lt=timezone.now() - <the timeout>,
).update(status=OutboxEvent.Status.PENDING, updated_at=timezone.now())
```

**`notifications/utils.py::create_notification`** (line 24) is the writer that already does it
right: `Notification.objects.create`, then `async_to_sync(channel_layer.group_send)` to
`notifications_{recipient.id}`, wrapped so a channel-layer failure logs a warning and returns the
notification rather than raising. Keep that wrapping.

**`scheduling/services.py::_create_in_app_notification`** (line 2658) is the writer that stops at
`Notification.objects.create`. Its argument list is already a superset match for
`create_notification`'s, which is what makes [task 3.1](#3--make-the-scheduling-path-push) a small
change rather than a refactor.

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[05-prove-it-and-write-it-down.md](05-prove-it-and-write-it-down.md), which gives the dead-letter
table a way to be read and replayed, and rewrites the two folders whose facts this plan just made
untrue.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits the plan as a whole: it is two small backend changes plus two by-hand walks
that only a person at two browsers can do.
   also: `/demonstrate` after instruction 5, if the frames and the admin rows are wanted as one
   piece of evidence rather than four loose screenshots.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| Websockets fail with no clear error | The backend started with `runserver` instead of Daphne | `daphne -b 0.0.0.0 -p 8000 main.asgi:application`. This failure looks identical to a missing push. |
| A notification row exists and nothing arrives | `_create_in_app_notification`, which writes and returns | One delivery path: the scheduling writer goes through `create_notification`, which pushes. |
| An event claimed into `processing` is never seen again | The dispatcher's selection, which reads `pending` and `failed` only | A reaper returns stale `processing` rows to `pending` after a stated timeout. |
| `Failed to broadcast notification` in the backend log | The channel layer, with Redis down or the wrong logical database flushed | Redis carries the channel layer on the default database and the page cache on database 1. |
