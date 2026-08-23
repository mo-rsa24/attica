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

## Why the project cares

Navigation: ⬅️ [What availability is](#what-availability-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**It converts asking into searching, which is the product's core move.** ✍️

Publishing availability is what lets an organizer find a free Saturday rather than message eight
people. Everything else in the marketplace depends on providers doing it.

**The two layers exist so double-booking can be prevented in the database.** ✅

You cannot enforce "this window is taken" against a recurrence rule; there is no row to lock. By
materializing slots into real rows with a unique constraint on `(resource, start_at, end_at)` and a
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
| Slot fields, the unique constraint and the capacity check constraint | Read `backend/main/scheduling/models.py:206-253` | 2026-08-22 |
| Slots are produced by management commands | Listed `backend/main/scheduling/management/commands/` | 2026-08-22 |
| `capacity_remaining` is a property, not a column | Read the model | 2026-08-22 |
| Whether the commands are scheduled or run by hand | Not established. `environment/overview.md` records that nothing auto-starts | 2026-08-22 |
