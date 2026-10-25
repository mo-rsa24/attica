# 🌍 Availability

Availability is **when a provider can be booked**, published once so organizers can search it
instead of asking. It is the answer to the question a venue or an artist currently fields five
times a week in five different inboxes.

It is stored in two layers: rules that say what is normally true, and slots that write out actual
bookable windows. Understanding why there are two is most of understanding the scheduling system.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What availability is](#what-availability-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-availability-is) ➡️

- **rule**: a repeating pattern, such as "every Saturday from 10:00 to 18:00 from March onwards".
- **exception**: a one-off override of a rule, such as a public holiday closure.
- **slot**: one concrete bookable window with a real start and end, written out as a row.
- **materialize**: to turn a repeating rule into the individual slot rows it implies.
- **capacity**: how many separate bookings one window can hold at once.

## What availability is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**A rule says what is normally true, in the provider's own local time.** ✅

`AvailabilityRule` carries a frequency of `daily` or `weekly`, the weekdays it applies to as a list
of integers 0 to 6, a date range it is effective across, a local start and end time, a capacity,
and its own timezone. Its `clean()` refuses an end before a start, an end time not after the start
time, and a weekly rule with no weekdays.

**An exception overrides a rule for a specific occasion.** 🔍

`AvailabilityException` exists for the closures and one-offs a repeating rule cannot express.

**A slot is one real window, written out as a row.** ✅

`AvailabilitySlot` carries an absolute `start_at` and `end_at`, the rule it came from, a
`capacity_total`, a `capacity_reserved`, and whether it is bookable. The database enforces that no
two slots on one resource share the same window, and that reserved never exceeds total.

**Slots are produced from rules by a command someone runs.** ✅

`materialize_availability_slots` and `expire_and_materialize` are Django management commands. Slots
do not appear on their own.

📊 Drawn in [A slot's spare capacity is the whole hold](artifacts/scenes/scheduling-process-flows/figure-explainer.md#figure-1-a-slots-spare-capacity-is-the-whole-hold).

## Why the project cares

Navigation: ⬅️ [What availability is](#what-availability-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**It converts asking into searching, which is the product's core move.** ✍️

Publishing availability is what lets an organizer find a free Saturday rather than message eight
people. Everything else in the marketplace depends on providers doing it.

**The two layers exist so [double-booking](../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub> can be prevented in the database.** ✅

You cannot enforce "this window is taken" against a recurrence rule; there is no row to lock. By
materializing slots into real rows with a [unique constraint](../../../../Obsidian/Information%20Technology/Database%20Systems/Unique%20Constraint.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=288 "Database systems textbook, section 7-2f, SQL constraints, Works it on the LINE table: the primary key is '(INV_NUMBER, LINE_NUMBER)', and 'CONSTRAINT LINE_UI..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=289 "Database systems textbook, section 7-2g, SQL indexes, 'CREATE UNIQUE INDEX P_CODEX ON PRODUCT(P_CODE)' and the 'duplicate value in index' error it raises, th..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=286 "Database systems textbook, section 7-2f, SQL constraints, UNIQUE in the ANSI list beside NOT NULL, DEFAULT and CHECK, then 'CONSTRAINT CUS_UI1 UNIQUE (CUS_LN..."), [▶1](https://www.youtube.com/watch?v=w6GzQa9R7-4&t=114s "Hussein Nasser, Concurrent Requests and Unique Keys on Web Applications, Duplicate a key, 1:54 to 2:15, A second insert of the same key refused on a live tab..."), [▶2](https://www.youtube.com/watch?v=w6GzQa9R7-4&t=213s "Hussein Nasser, Concurrent Requests and Unique Keys on Web Applications, Spice things up, 3:33 to 8:29, The same key inserted from concurrent transactions, w..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/03-constraints.md "Database constraints: UNIQUE, CHECK, NOT NULL, foreign keys, projects/attica/architecture-decisions, plan 03. Reads 'unique_provider_date' in Attica's models...")</sub> on `(resource, start_at, end_at)` and a
check constraint on capacity, the guarantee becomes something the database holds rather than
something the application hopes for.

**Capacity is why a venue is not just free or busy.** ✅

A slot can hold more than one booking. A venue with three function rooms, or a caterer who can
serve two events in an evening, is expressed as `capacity_total` above 1 rather than as multiple
resources.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `weekdays` | which days a weekly rule covers | `[5, 6]` for Saturday and Sunday (example) | [Dictionary § weekdays](../data/02-dictionary.md#weekdays) |
| `local_start_time` | the daily start, in the rule's own timezone | `10:00:00` (example) | [Dictionary § local_start_time](../data/02-dictionary.md#local_start_time-local_end_time) |
| `capacity_total` | how many bookings this window can hold | `1` (the default) | [Dictionary § capacity_total](../data/02-dictionary.md#capacity_total-capacity_reserved) |
| `capacity_reserved` | how many it currently holds | `0` | [Dictionary § capacity_reserved](../data/02-dictionary.md#capacity_total-capacity_reserved) |
| `is_bookable` | whether this slot can be taken at all | `true` | [Dictionary § is_bookable](../data/02-dictionary.md#is_bookable) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Expecting a provider to be searchable as soon as they set a rule.** ✅

A rule alone does not make anything bookable. Until `materialize_availability_slots` has been run,
there are no slot rows, and a search that reads slots finds nothing. A provider who has published
their hours and appears unavailable is the symptom, and the cause is a command nobody ran.

**Reading a slot's window as being in the provider's local time.** ✅

`start_at` and `end_at` are absolute datetimes. The local times live on the rule. Timezone is
carried in two places (the resource and the rule) and neither is on the slot, so the conversion has
already happened by the time a slot exists.

**Treating `weekdays` as names or as one-indexed.** ✅

They are integers 0 to 6, validated by `clean()`. Which integer means which day is not stated in
the model, and Python's own convention (Monday is 0) is not universal.

**There is a second availability system on the artist, and the booking engine does not read it.** ✅

`Artist.availability` is a `JSONField` mapping dates to strings, documented in the model as
`{"2024-07-25": "unavailable"}`. It is entirely separate from the rules and slots described here.
Two answers to "when is this artist free" exist in two places, and nothing keeps them in agreement.
See [Artist § What people get wrong](artist.md#what-people-get-wrong).

**Assuming an empty `capacity_remaining` means unbookable.** 🔍

`capacity_remaining` is a computed property, not a column, so it cannot be filtered in a database
query. Code that needs it in a query has to express it as `capacity_reserved` against
`capacity_total`.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| Rule fields, frequencies and the `clean()` validations | Read `backend/main/scheduling/models.py:133-177` | 2026-08-22 |
| Slot fields, the [unique constraint](../../../../Obsidian/Information%20Technology/Database%20Systems/Unique%20Constraint.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=288 "Database systems textbook, section 7-2f, SQL constraints, Works it on the LINE table: the primary key is '(INV_NUMBER, LINE_NUMBER)', and 'CONSTRAINT LINE_UI..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=289 "Database systems textbook, section 7-2g, SQL indexes, 'CREATE UNIQUE INDEX P_CODEX ON PRODUCT(P_CODE)' and the 'duplicate value in index' error it raises, th..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=286 "Database systems textbook, section 7-2f, SQL constraints, UNIQUE in the ANSI list beside NOT NULL, DEFAULT and CHECK, then 'CONSTRAINT CUS_UI1 UNIQUE (CUS_LN..."), [▶1](https://www.youtube.com/watch?v=w6GzQa9R7-4&t=114s "Hussein Nasser, Concurrent Requests and Unique Keys on Web Applications, Duplicate a key, 1:54 to 2:15, A second insert of the same key refused on a live tab..."), [▶2](https://www.youtube.com/watch?v=w6GzQa9R7-4&t=213s "Hussein Nasser, Concurrent Requests and Unique Keys on Web Applications, Spice things up, 3:33 to 8:29, The same key inserted from concurrent transactions, w..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/03-constraints.md "Database constraints: UNIQUE, CHECK, NOT NULL, foreign keys, projects/attica/architecture-decisions, plan 03. Reads 'unique_provider_date' in Attica's models...")</sub> and the capacity check constraint | Read `backend/main/scheduling/models.py:206-253` | 2026-08-22 |
| Slots are produced by management commands | Listed `backend/main/scheduling/management/commands/` | 2026-08-22 |
| `capacity_remaining` is a property, not a column | Read the model | 2026-08-22 |
| Whether the commands are scheduled or run by hand | Not established. `environment/overview.md` records that nothing auto-starts | 2026-08-22 |
