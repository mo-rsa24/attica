# 🌱 Seeding and resetting data

The development database is demonstration data, written by management commands. When it gets into a
state you cannot reason about, these put it back.

Every command runs from `backend/main` with `/home/molef/lobola` activated.

## Contents

- [1. Seed the marketplace providers](#1-seed-the-marketplace-providers)
- [2. Seed the booking scenarios](#2-seed-the-booking-scenarios)
- [3. Materialize availability slots](#3-materialize-availability-slots)
- [4. The test accounts](#4-the-test-accounts)
- [5. Reset the database completely](#5-reset-the-database-completely)

## 1. Seed the marketplace providers

Navigation: 📋 [Contents](#contents) | [Next](#2-seed-the-booking-scenarios) ➡️

`unverified` (from [the original QA guide](../sources/booking-test-guide-original.md))

Creates the bookable providers: artists, vendors and their availability rules.

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
python manage.py seed_marketplace
```

✅ Providers appear in the marketplace at `http://localhost:5173`. It creates
`MarketplaceResource` rows with `AvailabilityRule` rows behind them.

Run [recipe 3](#3-materialize-availability-slots) afterwards, or nothing will be searchable.

<details>
<summary><b>What a marketplace resource is</b></summary>

One row per bookable thing, whichever of the three kinds it is. Everything in scheduling talks to
it and never to the underlying venue, artist or vendor.
See [what a marketplace resource is](../../context/world/marketplace-resource.md).
</details>

## 2. Seed the booking scenarios

Navigation: ⬅️ [1. Seed the marketplace providers](#1-seed-the-marketplace-providers) | 📋 [Contents](#contents) | [Next](#3-materialize-availability-slots) ➡️

`unverified` (from [the original QA guide](../sources/booking-test-guide-original.md))

Creates the two interactive test users and seven booking requests, one per status, so every state
in the flow has something to look at.

```bash
python manage.py seed_booking_workflow

# for a clean slate first:
python manage.py seed_booking_workflow --clear && python manage.py seed_booking_workflow
```

✅ Real output:

```
User [created]: test_organizer  (EVENT_ORGANIZER)
User [created]: test_artist     (ARTIST)
Artist resource [created]: Test Artist
Scenario [pending]          request [created]: Afrobeats Night [seed]         → Zola & The Band
Scenario [counter_proposed] request [created]: Jazz Under the Stars [seed]    → Nandi Dlamini
Scenario [confirmed]        request [created]: House Music Festival [seed]     → DJ Karabo
Scenario [completed]        request [created]: New Year's Eve Gala [seed]     → The Brass Co.
Scenario [declined]         request [created]: Corporate Gala Dinner [seed]   → Feast Cape Town
Scenario [withdrawn]        request [created]: Tech Conference Afterparty [seed] → Luminary Productions
Scenario [live]             request [created]: Demo Event – Live Test [seed]  → Test Artist
```

❌ Providers missing from the scenario lines means [recipe 1](#1-seed-the-marketplace-providers) has
not run. Run it, then run this again.

## 3. Materialize availability slots

Navigation: ⬅️ [2. Seed the booking scenarios](#2-seed-the-booking-scenarios) | 📋 [Contents](#contents) | [Next](#4-the-test-accounts) ➡️

`unverified`

**This is the step that gets forgotten, and its symptom looks like a bug.** Without it the
availability search returns nothing and the calendar timeline is empty, even though providers exist
and look correct.

```bash
python manage.py materialize_availability_slots --days 90
```

✅ It writes `AvailabilitySlot` rows from the `AvailabilityRule` rows that `seed_marketplace`
created. Confirm by searching availability at `/scheduling` and getting results.

The expected-output block that used to sit here in [the original QA guide](../sources/booking-test-guide-original.md) was the output of
`seed_booking_workflow`, pasted under the wrong command. It has been removed rather than guessed
at; fill it in the next time you run this.

❌ Search still returns nothing: check that `seed_marketplace` actually created rules, since this
command has nothing to materialize without them.

<details>
<summary><b>Why availability is two layers</b></summary>

A rule says what is normally true ("every Saturday, 10:00 to 18:00"). A slot is one concrete
bookable window written out as a row. You cannot enforce "this window is taken" against a
recurrence rule, because there is no row to lock. Materializing turns the rule into rows with a
[unique constraint](../../../../Obsidian/Information%20Technology/Database%20Systems/Unique%20Constraint.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=288 "Database systems textbook, section 7-2f, SQL constraints, Works it on the LINE table: the primary key is '(INV_NUMBER, LINE_NUMBER)', and 'CONSTRAINT LINE_UI..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=289 "Database systems textbook, section 7-2g, SQL indexes, 'CREATE UNIQUE INDEX P_CODEX ON PRODUCT(P_CODE)' and the 'duplicate value in index' error it raises, th..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=286 "Database systems textbook, section 7-2f, SQL constraints, UNIQUE in the ANSI list beside NOT NULL, DEFAULT and CHECK, then 'CONSTRAINT CUS_UI1 UNIQUE (CUS_LN..."), [▶1](https://www.youtube.com/watch?v=w6GzQa9R7-4&t=114s "Hussein Nasser, Concurrent Requests and Unique Keys on Web Applications, Duplicate a key, 1:54 to 2:15, A second insert of the same key refused on a live tab..."), [▶2](https://www.youtube.com/watch?v=w6GzQa9R7-4&t=213s "Hussein Nasser, Concurrent Requests and Unique Keys on Web Applications, Spice things up, 3:33 to 8:29, The same key inserted from concurrent transactions, w..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/03-constraints.md "Database constraints: UNIQUE, CHECK, NOT NULL, foreign keys, projects/attica/architecture-decisions, plan 03. Reads 'unique_provider_date' in Attica's models...")</sub> on `(resource, start_at, end_at)`, which is what makes [double-booking](../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub> a database
guarantee rather than an application hope.
See [what availability means](../../context/world/availability.md).
</details>

📊 Drawn in [Steps 1 to 3, the search that reserves](artifacts/scenes/scheduling-process-flows/figure-explainer.md#figure-7-steps-1-to-3-the-search-that-reserves).

## 4. The test accounts

Navigation: ⬅️ [3. Materialize availability slots](#3-materialize-availability-slots) | 📋 [Contents](#contents) | [Next](#5-reset-the-database-completely) ➡️

`unverified`

These are seeded local fixtures, not secrets. The values are set by the seed commands in
`backend/main/scheduling/management/commands/seed_booking_workflow.py` and
`seed_marketplace.py`; if any password below stops working, read the current value there.

| Username | Password | What they are for |
|---|---|---|
| `test_organizer` | `Test123!` | The organizer side: submit, withdraw, respond to counters, review |
| `test_artist` | `Test123!` | The provider side: approve, decline, counter, complete |
| `seed_artist_zola` | `seed_pass_123!` | An artist provider in the seeded scenarios |
| `seed_artist_nandi` | `seed_pass_123!` | An artist provider |
| `seed_artist_dj_karabo` | `seed_pass_123!` | An artist provider |
| `seed_artist_brass_co` | `seed_pass_123!` | An artist provider |
| `seed_vendor_feast` | `seed_pass_123!` | A vendor provider |
| `seed_vendor_luminary` | `seed_pass_123!` | A vendor provider |
| `e2e-organizer` | `E2eOrganizerPass!23` | The deterministic fixture the Playwright suite uses. Created by `python manage.py seed_e2e` |

> 📷 **Screenshot wanted**: the login screen with `test_organizer` filled in. Save as
> `images/seeding/01-login-as-test-organizer.png`.

## 5. Reset the database completely

Navigation: ⬅️ [4. The test accounts](#4-the-test-accounts) | 📋 [Contents](#contents)

`unverified`

⚠️ **This destroys the development database.** `backend/main/db.sqlite3` is one file and it is
committed to the repository, so a reset shows up as a large diff. Anything you created by hand and
have not exported is gone.

**Check first, read-only.** See what you would be losing:

```bash
cd /home/molef/Work/attica/backend/main
python3 -c "
import sqlite3
c = sqlite3.connect('db.sqlite3')
for t in ['events_event','events_eventdraft','scheduling_booking','scheduling_bookingrequest']:
    print(t, c.execute(f'select count(*) from {t}').fetchone()[0])
"
```

**Then reset**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
mv db.sqlite3 db.sqlite3.bak          # keep it; the file is small
python manage.py migrate
python manage.py seed_marketplace
python manage.py seed_booking_workflow
python manage.py materialize_availability_slots --days 90
python manage.py seed_e2e
```

✅ Every command completes without a traceback, and logging in as `test_organizer` shows the seven
scenarios from [Booking § 3](../driving-the-app/driving-the-booking-flow.md#3-inspect-the-seven-pre-built-scenarios).

Move the backup aside rather than deleting it. If the reset was a mistake, `mv db.sqlite3.bak
db.sqlite3` puts it back; a `git checkout` would only restore the last committed state.
