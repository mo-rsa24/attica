# Running The Workers

> **This scope's plans interleave with the parent's.** They are not done as a block. The one
> ordering that matters is the running-order table in [the parent master plan](../../MASTER_PLAN.md#running-order).
> The Plans list below is this folder's contents, not a sequence to follow top to bottom.

## Mission

Attica has an execution tier that runs, so a change to a booking reaches the person waiting for it
without anybody typing a command.

Ten management commands live in `backend/main/scheduling/management/commands/`. Nothing schedules
any of them, nothing supervises the two that are written as daemons, and the environment overview
already admits that the outbox worker is the process a plan forgets. The consequence is not an
error: every write succeeds, every API response looks correct, and the notification is a row in a
table nobody reads.

This scope decides what runs the recurring work, makes it run, and closes the two places where an
event that was safely persisted still fails to reach a screen.

---

## What this scope is, in one line per mark

The marks come from [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#6-running-the-workers),
and this scope is the whole of item 6 there.

**decide** One infrastructure decision, not three. Expiry, availability materialisation and outbox
dispatch all need the same thing: something that starts a process, restarts it when it dies, and
runs a job on a clock. This is D7 in
[the open decisions](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions),
and this scope is where it gets taken.

**wire up** The ten scheduling management commands, none of which anything runs.

**wire up** The outbox worker, with retries and dead-lettering, both of which already have tables
and neither of which has an operator.

**build** Persist first and push second as the rule: a business change and its outbox event commit
in one transaction, and delivery may then fail without losing the event. Nineteen call sites in
`scheduling/services.py` already do this. The rule is not new; making it the only path is.

---

## What is true today, with a line number on every claim

Read before planning anything here. Each of these was read out of the repository on 2026-08-23 and
several of them contradict what the programme's own planning notes say.

**There are ten scheduling commands, not eleven.** One materialiser, four expiry commands, two
outbox commands, three seeds. [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#6-running-the-workers)
says eleven, arriving at it as "one materialiser, five expiry commands, two outbox workers, three
seeds". The fifth expiry command does not exist. The count that matters is smaller still: **three
seeds must never be on a schedule**, so the number of commands wanting a runner is seven, and two
of those seven are daemons that already wrap the other five.

**`expire_draft_holds` is a byte-for-byte copy of `expire_checkout_holds`.** Both call
`expire_checkout_sessions` (`backend/main/scheduling/services.py:1744`). Nothing anywhere expires
`draft_hold_expires_at`. The command is named for a job it does not do.

**The draft hold expires lazily on read, and nobody is told.** Contention queries exclude a lapsed
hold (`backend/main/scheduling/services.py:167`) and the status projection reports
`checkout_hold_expired` (`backend/main/scheduling/services.py:319`), so the time really is released.
No outbox event is emitted when it lapses, so the organizer whose hold ran out learns by looking.
This is the gap `expire_draft_holds` was presumably meant to close.

**`expire_and_materialize` does not materialise.** It imports `materialize_slots_for_resource`
(`backend/main/scheduling/management/commands/expire_and_materialize.py:20`) and never calls it. Its
loop body is a single inline `.update(status=EXPIRED)` on `BookingRequest`, which bypasses
`expire_pending_requests` (`backend/main/scheduling/services.py:2633`) and therefore emits no
`request.expired` outbox event. A request expiring through this daemon is silent, where the same
request expiring through the service is not. The daemon's own docstring says it runs both jobs.

**The scheduling path writes notification rows and pushes nothing.**
`_create_in_app_notification` (`backend/main/scheduling/services.py:2658`) calls
`Notification.objects.create` and stops. The chat path does it properly:
`create_notification` (`backend/main/notifications/utils.py:24`) writes the row and then
`group_send`s to `notifications_{recipient.id}`. The consumer for that group exists
(`backend/main/notifications/consumers.py:19`), it is routed at `ws/notifications/`
(`backend/main/notifications/routing.py:6`), and the frontend connects to it
(`frontend/src/components/notifications/useNotifications.js:83`). So the socket is wired at both
ends for chat and at one end for everything the outbox dispatches. Two writers, one of which is
correct.

**`processing` is a terminal state with no reaper.** The dispatcher claims an event by moving it to
`PROCESSING` (`backend/main/scheduling/services.py:3355`) and only ever selects rows whose status is
`PENDING` or `FAILED` (`backend/main/scheduling/services.py:3342`). A worker that dies between the
claim and the outcome leaves that event stranded for good. This is exactly the ninth architecture
test in [the acceptance list](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#6-acceptance),
"a worker crashes after commit and before notification".

**There is no scheduler of any kind in the repository.** No Celery, no cron file, no systemd unit,
no supervisor config, no Dockerfile, no Procfile. `run_outbox_worker`'s own docstring names systemd,
supervisord and a Docker CMD as the thing that should restart it, and none of the three exists here.
Continuous integration exists at `.github/workflows/ci.yml`.

**The dispatcher itself works.** [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
was run on 2026-08-22 against a real backlog: 23 pending, one pass, `processed=23 failed=0
dead_lettered=0`. Nothing in this scope is a fix to the dispatch code. What is missing is the thing
that calls it without being asked.

---

## What this scope may build while D1 and D2 are open

Two of the programme's open decisions reach into this scope, and they reach differently. Both are in
[the open decisions](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions).

**D1 is which of the four live booking representations survives**, and the parent's running order
answers it before this scope starts: scope 6 waits on scope 4, `one-booking-truth`. It still bites
the plans, because these plans are being written while it is open. It decides which of the two
notification writers above is the one to keep and which is the one to migrate: the chat path pushes
and the scheduling path does not, and the more complete representation is the one with the broken
delivery. **The rule this scope works under: read the answer, never assume it.** The first thing
this scope does is read what scope 4 decided, and no plan here presumes the scheduling
representation won.

**D2 is when a hold starts**, and it stays open for the whole of this scope. Scope 5,
`contention-and-holds`, is where it is taken, and scope 5 and scope 6 both wait on scope 4 and on
nothing else, so they run at the same time. D2 changes what has to be expired and how fast: a hold
taken at request time needs a tighter timer and a new expiry job, a hold taken at acceptance keeps
the two that exist. **The rule this scope works under: what runs and how often is configuration, not
structure.** The runner is built so `contention-and-holds` adds a job to it with a line of config
rather than a change to the runner, and this scope does not implement either hold semantics.

**What this scope does not touch.** It adds no new outbox emit site to any booking representation,
because adding one to a representation that may not survive is work that gets deleted. It fixes the
delivery of the events that are already emitted.

**D7 is this scope's own to take**, and it is not pre-answered anywhere in this folder. The plan
that takes it lays out the candidates and the criteria; the answer is a person's.

**D9, deployment, constrains D7 and is not this scope's.** Whatever supervises these workers has to
exist wherever Attica eventually runs, and there is no deployment mechanism at all
(`getting-it-out`, scope 13, owns that). The D7 plan states which of its candidates survive a
deployment decision and which would have to be redone, rather than waiting for one.

---

## Objectives

1. **Take one infrastructure decision instead of three.** Expiry, materialisation and outbox
   dispatch differ in cadence and in nothing else. Solving them separately buys three things to
   operate where one would do.
2. **Make the recurring work recurring.** A command that a person has to remember is not a feature
   of the system, it is a fact about that person.
3. **Close the two silent losses.** An event stranded in `processing` and a notification row that
   never reaches a socket both look exactly like success from every angle the application offers.
4. **Make persist-then-push the only path.** The pattern is already right in nineteen places and
   wrong in the one daemon that writes its own update inline. One path, so the exception cannot come
   back.
5. **Leave the operator something to read.** Whoever is on the other end of this at midnight needs
   to answer "is it moving", "what is stuck" and "what died and why" without reading Python.

---

## Goals

1. Every non-seed scheduling command has a runner that starts it, and the three seeds are excluded
   from that runner on purpose rather than by omission.
2. Killing the worker process mid-dispatch loses no event: the stranded `processing` row is
   reclaimed and delivered on the next cycle.
3. A booking change made by one person appears on the other person's screen with no refresh, driven
   by the outbox rather than by a poll.
4. `expire_draft_holds` either expires draft holds or stops existing, and a lapsed draft hold emits
   an event the organizer receives.
5. `expire_and_materialize` either materialises or is renamed, and every expiry path emits the
   outbox event its service-layer twin emits.
6. The dead-letter table has a way to be read and a way to be replayed, both written down.
7. [The environment overview](../../../../environment/overview.md)'s execution model describes what
   "running Attica" means after this scope, which is no longer four processes started by hand.

---

## Expected Outcome

Someone starts Attica the way the runbook says and the recurring work is already running. An
organizer sends a request and the provider's screen changes while both are looking at it. A hold
lapses and the organizer is told rather than discovering it. Somebody kills the worker in the middle
of a dispatch and, a cycle later, the notification arrives anyway.

---

## Definition of Done

- [ ] D7 taken and written down: what runs the recurring work, with the candidates that lost and the
      reason each lost, and a statement of which candidates a future deployment decision would
      invalidate
- [ ] Every non-seed scheduling command is either on the runner, folded into one that is, or deleted
      with the reason recorded. `seed_marketplace`, `seed_booking_workflow` and
      `seed_booking_summary_demo` are excluded by name
- [ ] A reaper returns stranded `processing` events to `pending` after a stated timeout, with the
      timeout named and its value justified
- [ ] The scheduling notification path pushes as well as persists, over the same
      `notifications_{user_id}` group the chat path already uses, so there is one delivery mechanism
      and not two
- [ ] `expire_draft_holds` resolved: it expires draft holds and emits an event, or it is deleted and
      the lazy read-path expiry is documented as the intended behaviour
- [ ] `expire_and_materialize` resolved: it materialises, or it is renamed to what it does. Its
      inline `BookingRequest.objects.update` is replaced by the service call, so no expiry path
      exists that skips the outbox
- [ ] ⚠️ The worker-crash test performed by hand: start the runner, send a booking request, kill the
      worker process between the write and the dispatch, confirm the row is `processing`, wait for
      the reaper, confirm the notification arrives `[owner: human]`
- [ ] ⚠️ The no-refresh test performed by hand in two browsers, with Chrome DevTools open on the
      Network tab filtered to WS in both: organizer sends a request in one, the provider's
      notification frame arrives in the other with nobody pressing anything, and the frame is read
      in the WS Messages panel rather than inferred from the UI `[owner: human]`
- [ ] ⚠️ The dead-letter path walked by hand: force a dispatch failure past
      `SCHEDULING_OUTBOX_MAX_ATTEMPTS`, find the row in the Django admin at `:8000/admin/` under
      scheduling, read `error_message`, and replay it `[owner: human]`
- [ ] ⚠️ The runner started and stopped from a cold terminal following only the new runbook recipe,
      by someone who does not have this plan open, and both its questions answered from the recipe
      alone `[owner: human]`
- [ ] The runbook pair written with `/drip-runbook` and checked with `/runbook-pulse`: how to start
      and stop the recurring work, and how to find out what is stuck. The second is the one nothing
      covers: [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
      already answers "how many are pending" and answers neither "what dead-lettered and why" nor
      "what is stranded in processing"
- [ ] [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
      updated rather than duplicated: its ❌ branch names the `group_send` gap as a known gap, and
      that stops being true in this scope
- [ ] `/env-pulse` run, because this scope changes the execution model. The four-hand-started-processes
      fact in [the execution model](../../../../environment/overview.md#execution-model) and the
      no-push gap in [the known gaps](../../../../environment/overview.md#known-gaps--non-obvious-constraints)
      are both rewritten to what is true afterwards
- [ ] Close out: `/ingest-error-pattern` for anything that bit, then
      `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers`

---

## Sub-Scopes

(none)

---

## Plans

(none yet. `populate-plans` authors this folder's plan files. The order they run in is the
[parent's running order](../../MASTER_PLAN.md#running-order), which carries a placeholder row for
this scope until then.)

---

## Decisions taken while writing this scope

Every choice made without asking, with its reason, is in
[the decisions taken here](decisions-taken-here.md). Read it before changing anything above: several
lines above are one of two defensible readings rather than the only one, and three of them correct
a count or a claim the programme's own planning notes make.

---

## Environment Context

Inherited from the parent. Environment and architecture facts live in
[the environment index](../../../../environment/00-INDEX.md). Read
[the overview](../../../../environment/overview.md) first, because in this scope the execution model
it describes is both the starting point and one of the deliverables.

Four facts decide whether work here lands or silently does nothing.

**Running Attica is four processes started by hand and none supervises another**, per
[the execution model](../../../../environment/overview.md#execution-model). The fourth is the outbox
worker, and the overview already names it as the one a plan forgets. This scope is the reason that
sentence stops being true, so it is the sentence to rewrite at close out rather than to add to.

**Redis is one server carrying two unrelated logical databases**: the websocket channel layer uses
the default and the page cache uses database 1. A worker that pushes to a channel group is using the
first. Flushing the wrong one drops live websocket groups without an error.

**Daphne, not `runserver`.** Anything that touches websockets needs
`daphne -b 0.0.0.0 -p 8000 main.asgi:application`. Under `runserver` the push this scope builds
fails with no clear error, which is indistinguishable from the bug it is fixing.

**`select_for_update` does not lock on SQLite**, per
[the known gaps](../../../../environment/overview.md#known-gaps--non-obvious-constraints). The outbox
dispatcher does not rely on it (it claims with a conditional `UPDATE`, which is safe on SQLite), but
any second worker process added here would be running on a database that cannot arbitrate between
them. PostgreSQL is D6 and belongs to `contention-and-holds`, so this scope states the single-worker
assumption rather than assuming the database will have changed.

**Two backend tests already fail**, so a red `python manage.py test` does not mean this scope broke
something. The check here is the two-browser walk and the outbox row counts, not a green suite.

Where a fact this scope needs is not written there, stop and ask rather than inferring it.

---

## Runbook

The by-hand recipes live in [the runbook index](../../../../runbook/00-INDEX.md). Bringing the stack
up and draining the outbox once are recipes there, and this scope links them rather than restating
them.

This scope writes back a pair. **How to start and stop the recurring work** does not exist because
the recurring work does not exist yet. **How to find out what is stuck** partly exists and stops
short: [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
answers "how many events are pending" with a real run pasted in, and answers neither "what
dead-lettered and why" nor "what is stranded in `processing`". The second recipe finishes that
question rather than opening a new file beside it.

---

## Context

What Attica means in the real world lives in [the context index](../../../../context/00-INDEX.md).
This scope reads it and owes it nothing, and the reason is worth stating because the words it
introduces are real ones.

`outbox`, `dead letter`, `worker` and `reaper` describe how this repository moves a message from one
process to another. They are facts about the machinery, not about weddings, venues or bookings, so
they belong in `environment/`, which is where this scope already owes a fact, rather than in
`context/`, which answers what something means to a person using Attica. The domain words this scope
touches (`hold`, `claim`, the checkout session) are owed by the scopes that introduce them:
`contention-and-holds` and `the-booking-journey`, per
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md).

---

## Diagram Prompts

This scope's illustrated map is [the illustrated map](diagram-prompts.md). It inherits the parent's
art direction, palette, glyph vocabulary and tiers, and reading axes exactly, and adds no vocabulary
of its own. It is the zoom-in on the workers glyph in
[the parent's subject capstone](../../diagram-prompts.md), which keeps it as one glyph in the domain
panel.
