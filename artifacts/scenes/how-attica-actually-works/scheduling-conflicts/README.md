# Attica scheduling: availability, holds, and conflicts

## The claim

Availability is materialized into rows with a capacity counter and a unique window, so booking is a bounded counter increment taken under a row lock, not a question asked of history. That makes capacity above one expressible, makes re-running the materializer a no-op, and gives the database somewhere to refuse.

The alternative is one Booking table with a start and an end and an overlap query on every attempt. That is not a strawman: it is `_overlap_q` and `_find_booking_conflict`, and `create_booking` falls back to exactly it whenever a resource has no slots.

And the price: the slot rows have to be manufactured and kept true by a cron job, a DST spring-forward window is skipped entirely, and the second line of defence, the Postgres exclusion constraint `scheduling_booking_no_overlap_active`, is created by a migration that returns immediately on any other vendor. Attica's dev database is SQLite.

## Run it

```bash
npm install
npm run dev        # http://localhost:5176
npm run checks     # 10 live checks over 16,133 runs, outside the browser
```

Port 5176: 5173 is Attica's frontend, 5174 and 5175 are the other two scenes.

## Click this first

On stage 0 the two designs agree, which is the honest starting point: at capacity 1 with the lock held they are the same system. Press **capacity 5** under the lanes and watch them separate:

```
one table, an overlap query      1 booking, 1 incident, refused-application
materialized slots, a counter    2 bookings, 0 incidents, 2 / 5 reserved
```

Then press **no lock** and step the two transactions yourself: A check, B check, A reserve, A insert, A commit, B reserve. The readout you are watching is **collisions unrecorded**.

## What it is grounded in

Every string, line number and excerpt comes from these files. Nothing is paraphrased.

- [backend/main/scheduling/services.py](../../backend/main/scheduling/services.py) — `create_booking` and its two branches, the locks, `_assert_slot_capacity`, `_reserve_capacity`, `_record_conflict_incident`, `_get_or_assert_idempotency`, `materialize_availability_slots`, `_rule_slot_to_utc`, `expire_checkout_sessions`, `get_constraint_monitor_status`
- [backend/main/scheduling/models.py](../../backend/main/scheduling/models.py) — `AvailabilitySlot`'s two constraints, `Booking.ACTIVE_STATES`, `BookingConflictIncident.ConflictSource`, `IdempotencyRecord`
- [backend/main/scheduling/migrations/0003_postgres_booking_overlap_constraint.py](../../backend/main/scheduling/migrations/0003_postgres_booking_overlap_constraint.py) — the GiST exclusion constraint, and the vendor test on line 9
- [backend/main/scheduling/management/commands/](../../backend/main/scheduling/management/commands/) — the three jobs that run this on a schedule

`SPEC.md` is the confirmed design, the honesty notes, and what the browser drive caught.
