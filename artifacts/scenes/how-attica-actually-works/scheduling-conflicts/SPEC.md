# Scene spec: availability, holds, and conflict resolution in Attica's scheduling app

```
ran under:  none
built from: /home/molef/Work/attica (the repository itself)
why:        understand how the database refuses a double booking
depends on: ../../../environment/overview.md, ../../../context/00-INDEX.md
```

The confirmed gate output that produced this app.

## Claim card

```
Claim:        availability is materialized into concrete rows carrying a capacity
              counter and a unique window, so booking is a bounded counter
              increment taken under a row lock, not a question asked of history.
              That makes capacity above 1 expressible, makes re-running
              materialization a no-op, and gives the database somewhere to refuse.

Alternative:  one Booking table with start_at/end_at and an overlap query on every
              attempt. Not hypothetical: it is _overlap_q + _find_booking_conflict,
              and create_booking falls back to exactly that whenever a resource has
              no slots.

Use it:       a vendor with capacity 5 taking five concurrent bookings in one
              window. The overlap query cannot express it; the slot path compares
              capacity_remaining against attendee_count and lets four more through.

Do not:       the slot rows must be manufactured and kept true. Materialization is a
              cron job over a horizon, a DST spring-forward window is skipped
              entirely, and the second line of defence, the Postgres exclusion
              constraint scheduling_booking_no_overlap_active, is added by a
              migration that returns immediately on any other vendor. Attica's dev
              database is SQLite, so the belt is there and the braces are not, and
              get_constraint_monitor_status reports constraint_present as None
              rather than False.

Consequence:  the scene runs two attempts down both designs with a steppable
              interleaving. Overlap query, no lock, SQLite: both read no-conflict,
              both insert, two confirmed bookings and zero incidents. Slots with the
              lock: B waits, reads capacity_remaining = 0, raises the real
              ConflictError and writes an incident tagged application_check. Switch
              to postgresql and a third outcome appears: the exclusion constraint
              catches what the application missed, tagged db_constraint.
```

**Falsification check.** The claim dies if the slot design can double-book while recording nothing. The scene produces it: turn the lock off. Check 2 asserts that such an interleaving exists, and excursion 2 asks the reader to find one.

## What the code actually does

Seven findings that shaped the scene.

1. **`create_booking` has two bodies.** `if slots:` compares a counter; `else:` runs the overlap query with the comment "treat the resource as single-capacity". The naive alternative is the fallback branch, not a strawman.
2. **Two locks, in order**: `MarketplaceResource.objects.select_for_update()` then `_lock_overlapping_slots`, commented "so concurrent approvals are serialised at the DB level".
3. **`conflict_source` names the layer.** `application_check` at three call sites, `db_constraint` in the `except IntegrityError` around the INSERT.
4. **The second layer is Postgres-only.** [Migration 0003](../../backend/main/scheduling/migrations/0003_postgres_booking_overlap_constraint.py) returns on line 9 for any other vendor. Its status list duplicates `Booking.ACTIVE_STATES` in SQL, kept in sync by hand.
5. **`_reserve_capacity` sits outside the one try/except.** So a `capacity_reserved_lte_total` violation is an uncaught IntegrityError: a 500, and no incident. It can only happen without the lock.
6. **Materialization is [idempotent](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of 'POST /payments' with an 'Idempotency-Key': a new key ...")</sub> by construction**: `get_or_create` over `uniq_resource_slot_window`, and `target_capacity = max(slot.capacity_reserved, desired_capacity)`.
7. **Paying does not finalize.** `complete_checkout_mock_deposit` sets `paid_at` and leaves the status ACTIVE without extending `hold_expires_at`; `expire_checkout_sessions` never reads `paid_at`, and `release_checkout_session` refuses only a FINALIZED session.

## Model

**Shape: dynamic.** `step(world, event, config) → world`. `create_booking` is decomposed into its real phases so the reader chooses the order:

```
lock -> check -> reserve -> insert -> commit
```

A blocked `SELECT FOR UPDATE` returns when the holder commits, so the waiting transaction acquires the lock at that moment, as it would in the database.

**Outcome variants**: `booked`, `refused-application`, `refused-db-constraint`, `double-booked-silently`, `crash-uncaught`, `idempotent-replay`, `hold-expired-after-payment`.

## State

`design`, `vendor`, `locking`, `slotCapacity`, `attendees`, `idem`, `dst`, `blackout`, `holdMinutes`. Each maps to a named line of Attica.

## Atlas

Four levels: ECOSYSTEM (application, database, jobs, incident log), SYSTEM (the two pipelines inside the application), COMPONENT (the constraints, the commands), MECHANISM (the five phases inside one transaction). **Entry: argument-first**, because the request asks to start from "why not just check availability with a query". The map joins the bench from stage 1.

## Stages

| Stage | Medium | Content |
|---|---|---|
| 0. why not just query | visual | the two designs, the same schedule, and the two settings that make them diverge |
| 1. one rule, one row | visual + code | materialization, the DST policy, the four columns |
| 2. the mechanism | visual | the two locks, the branch, capacity, the two constraints, the incident tag, [idempotency](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of 'POST /payments' with an 'Idempotency-Key': a new key ...")</sub> |
| 3. where it costs you | prose + visual | six failures, two of them quiet, closing on the flagged note |
| 4. build it | code | seven steps, SQL first then Django, each opening with the previous step's race |

## Workspace

Anchored surface: the phase stepper with the three tables and the readouts directly beneath it, plus the map from stage 1. Popovers on nodes, edges and parts. Three drawers behind a toolbar: probes, history, compare.

## Engagement

**Tour**: 8 steps at the cap: five surfaces plus the three parts the claim turns on (`design`, `lock`, `vendor`). Dropped, all with a stage 3 failure card: `capacity`, `attendees`, `idem`, `dst`, `blackout`, `hold`.

**Predictions**: five, from the model's seven variants.

**Excursions**: three. Two machine-checked (the status count shared between `ACTIVE_STATES` and the constraint; a schedule that double-books silently, through the state round trip). One unverified: run `get_constraint_monitor_status()` on your own database.

## Live checks

Ten, over **16,133 runs**: 64 configurations crossed with all 252 interleavings of two five-phase transactions. That is the complete schedule space for two transactions of this shape, C(10,5), not a [sample](../../../../../../Obsidian/Mathematics/Statistics/Sampling%20From%20A%20Distribution.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/pattern-recognition-and-machine-learning.pdf#page=539 "Pattern recognition and machine learning, chapter 11, Why expectations need samples, ancestral sampling of a directed graph (page 541), standard distribution..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=245 "Introduction to probability for data science, section 4.8, Generates random numbers for any PDF by running a uniform through the inverse CDF, in Python, with..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/deep-learning-textbook.pdf#page=606 "Deep learning textbook, section 17.1, Why machine learning samples at all (Monte Carlo estimates of sums and integrals, and sampling as the goal of a generat..."), [▶1](https://www.youtube.com/watch?v=9ixzzPQWuAY&t=474s "ritvikmath, Inverse Transform Sampling, 7:54 to 10:04, Inverts the exponential CDF and turns a uniform draw into an exponential one. Chapter-timed, from the ..."), [▶2](https://www.youtube.com/watch?v=OXDqjdVVePY&t=232s "ritvikmath, Accept-Reject Sampling, 3:52 to 7:45, An easy proposal g scaled by M into an envelope above f, then each draw accepted with probability f/(M g). ..."), [◆](../../../../../../goal-setting/learning/deep-learning/diffusion-models/00-from-scratch-to-sdxl/textbook/l3-stochastic-processes/13-drawing-samples-by-hand.md "Drawing samples by hand: Monte Carlo, inverse transform and accept-reject, deep-learning/diffusion-models/00-from-scratch-to-sdxl, volume L3, section 13. Thr...")</sub>.

1. with slots and the lock, no interleaving overbooks
2. without the lock, some interleaving double books silently (the falsifier, asserted to exist)
3. every refusal leaves an incident
4. the uncaught IntegrityError records nothing, and only happens without the lock
5. materializing twice creates nothing the second time
6. materializing never drops capacity_total below capacity_reserved
7. a retry with the same key and payload creates no second booking
8. the same key with a different payload refuses and books nothing
9. a local time that does not exist produces no slot
10. a paid hold still expires and gives its seats back

## Stack

React, TypeScript, Vite, Zustand, Motion, Shiki (python and sql only). No KaTeX, no Mafs, no 3D, no React Flow.

## Honesty notes

- **The scene models one window and two actors.** Attica's materializer walks a 180-day horizon over many rules; the scene shows one slot because the [concurrency](../../../../../../Obsidian/Information%20Technology/Concurrency/Concurrency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=429 "System design big archive, System Performance Metrics Every Engineer Should Know, Works concurrency as a number: 100 requests a second that each take 5 secon..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=185 "System design interview, chapter 12, Design a chat system, Scalability, Sizes concurrent connections: 1 million concurrent users at about 10 KB of server mem..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=280 "System design big archive, Concurrency is NOT Parallelism, Concurrency as tasks overlapping in time on one core through context switching, good for I/O waits..."), [▶1](https://www.youtube.com/watch?v=I8FeITQvLAk&t=114s "Gaurav Sen, How 100 milliseconds cost Amazon 3 BILLION DOLLARS: Latency, Concurrency and Parallelism, Concurrency Example, 1:54 to 2:28, A worked example of ..."), [▶2](https://www.youtube.com/watch?v=RlM9AfWf1WU&t=13s "ByteByteGo, Concurrency Vs Parallelism!, Concurrency, 0:13 to 1:03, Concurrency defined before parallelism and practical examples of both. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/09-reproduce-the-race.md "Reproduce the race against Attica, projects/attica/architecture-decisions, plan 09. Two concurrent accepts fired at the same provider and date against a runn...")</sub> lesson does not need more, and says so.
- **The `crash-uncaught` outcome is a reading of the code, not an observed traceback.** `_reserve_capacity`'s UPDATE is outside the try, and `capacity_reserved_lte_total` is a real CheckConstraint that SQLite enforces; the scene asserts the consequence follows.
- **`expire_and_materialize` is reported as broken on the evidence of a missing symbol**, verified by parsing services.py for the name it imports.

## What the browser drive found

- With the lock on and capacity 1 the two lanes are identical, so stage 0's comparison showed nothing. That is the truth, and the fix was to say it: the stage now opens by stating the two designs agree until one of two settings changes, with both controls under the lanes. It is a better opening than a rigged race.
- A blocked `SELECT FOR UPDATE` was modelled as a no-op the reader had to retry, so a scripted serialized schedule stalled and the naive lane looked correct. Now the waiting transaction acquires the lock when the holder commits.
- Check 6 was passing vacuously: it ran the whole fold at capacity 1, so nothing was ever reserved and the assertion compared 1 against 0. It now reserves at capacity 5 and applies the lowered rule with `step()` directly, which is the only way to change a rule mid-history.
- Vite exhausted WSL2's inotify watchers with three scene `node_modules` trees present. All three scenes now watch by [polling](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub>, which is what Attica's own `frontend/vite.config.js` already does for the same reason.
