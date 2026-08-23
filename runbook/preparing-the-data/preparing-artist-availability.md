# 🔧 Preparing artist availability

Making one artist bookable for a date range, by hand, in the Django admin. This is the operator's
path: it works across accounts you do not have passwords for, which is what makes it the right tool
for demo and test data and the wrong tool for anything a real provider should own.

**Why five separate things have to exist before an artist is bookable**, and which field silently
blocks a request, is in [what makes a provider
bookable](../../environment/django-admin/scheduling-availability.md). Read it once; the recipes here
assume it.

## Before any of these

The backend is up (`../running-the-web-app/bringing-the-stack-up.md`), you are logged into
`http://127.0.0.1:8000/admin/` as a superuser, and the artist already exists in the marketplace. If
the admin rejects your login, see [getting into the
admin](../../environment/django-admin/the-admin-site.md#getting-in).

## Contents

- [1. Make an artist bookable from scratch](#1-make-an-artist-bookable-from-scratch)
- [2. Change an artist's recurring availability](#2-change-an-artists-recurring-availability)
- [3. Block out a date range](#3-block-out-a-date-range)
- [4. Unblock a date range](#4-unblock-a-date-range)
- [5. Retire a rule](#5-retire-a-rule)
- [6. Correct one slot by hand](#6-correct-one-slot-by-hand)
- [7. Find out why an artist is not in the search results](#7-find-out-why-an-artist-is-not-in-the-search-results)
- [8. Change the rule for every artist at once](#8-change-the-rule-for-every-artist-at-once)

## 1. Make an artist bookable from scratch

Navigation: 📋 [Contents](#contents) | [Next](#2-change-an-artists-recurring-availability) ➡️

`unverified` (assembled from [the original data-preparation guide](../sources/booking-test-guide-original.md) and the scheduling models; not driven this session)

Use this when the artist is in the catalogue but has never been set up for scheduling. Four screens
and one command, in this order.

**Screen 1, the resource.** `Scheduling > Marketplace resources`. Search for the artist by display
name or owner. If nothing comes back, `Add marketplace resource` and set `owner` to the artist's
user account, `resource_type` to `artist`, `display_name` to the public name, `artist` to the
matching `Artist` record, and check `is_active`. `city`, `country` and `timezone` are optional.

**Screen 2, the policy.** `Scheduling > Resource policies`, `Add resource policy`, select the
resource you just made. Leave the defaults unless you are testing something specific, but know that
`min_notice_hours` starts at 24, so same-day bookings will be refused.

**Screen 3, the rule.** `Scheduling > Availability rules`, `Add availability rule`:

| Field | What to put |
|---|---|
| `resource` | the artist resource |
| `name` | something you will recognise later, like `All week 09:00-22:00` |
| `is_active` | checked |
| `timezone` | `Africa/Johannesburg` |
| `frequency` | `weekly` |
| `weekdays` | `[0, 1, 2, 3, 4, 5, 6]` for every day. Monday is `0` |
| `effective_start_date` / `effective_end_date` | the range you want bookable |
| `local_start_time` / `local_end_time` | `09:00` / `22:00` |
| `capacity` | `1` |

**The command, turning the rule into rows.**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
python manage.py materialize_availability_slots --start-date 2026-04-25 --end-date 2026-05-01
```

Same command as
[Seeding § 3](../preparing-the-data/seeding-and-resetting-data.md#3-materialize-availability-slots),
narrowed to one date range instead of a horizon. `--resource-id` narrows it to one artist.

**Screen 4, checking it worked.** `Scheduling > Availability slots`, filtered to the resource.

✅ Rows exist across the whole range, `is_bookable` checked, `capacity_reserved` below
`capacity_total`.

❌ No rows at all: the rule's `effective_*` dates do not overlap the range you materialized, or
`is_active` is unchecked.

## 2. Change an artist's recurring availability

Navigation: ⬅️ [1. Make an artist bookable](#1-make-an-artist-bookable-from-scratch) | 📋 [Contents](#contents) | [Next](#3-block-out-a-date-range) ➡️

`unverified`

`Scheduling > Availability rules`, filter by the resource, open the rule, change `weekdays`, the
`effective_*` dates, the `local_*` times or `capacity`. Save.

⚠️ **Saving the rule changes nothing a search can see.** The slots already generated still describe
the old schedule. Rerun the command from recipe 1 over the affected range, every time.

✅ The slot list now matches the new times.

## 3. Block out a date range

Navigation: ⬅️ [2. Change recurring availability](#2-change-an-artists-recurring-availability) | 📋 [Contents](#contents) | [Next](#4-unblock-a-date-range) ➡️

`unverified`

Use this when the artist normally works then, but must not be bookable: a public holiday, a travel
day, a private event.

`Scheduling > Availability exceptions`, `Add availability exception`. Set `resource`,
`exception_type` to `blackout`, `start_at`, `end_at` and a `reason`. Leave `is_available_override`
unchecked.

✅ Availability search over that window returns nothing for this artist, while the surrounding days
still return slots.

## 4. Unblock a date range

Navigation: ⬅️ [3. Block out a date range](#3-block-out-a-date-range) | 📋 [Contents](#contents) | [Next](#5-retire-a-rule) ➡️

`unverified`

`Scheduling > Availability exceptions`, find the blocking row, delete it. There is no deactivate:
the model has no active flag, so removing the row is the only way back.

Rematerialize the range afterwards if you are not certain the slots underneath it survived.

## 5. Retire a rule

Navigation: ⬅️ [4. Unblock a date range](#4-unblock-a-date-range) | 📋 [Contents](#contents) | [Next](#6-correct-one-slot-by-hand) ➡️

`unverified`

`Scheduling > Availability rules`. Prefer unchecking `is_active` over deleting, which keeps the
history readable. Delete only when the rule was a mistake.

Either way, rematerialize the affected range so the slot set stops describing a schedule that no
longer exists.

## 6. Correct one slot by hand

Navigation: ⬅️ [5. Retire a rule](#5-retire-a-rule) | 📋 [Contents](#contents) | [Next](#7-find-out-why-an-artist-is-not-in-the-search-results) ➡️

`unverified`

For one-off corrections only: forcing a single date bookable for a demo, or patching a row that is
wrong. `Scheduling > Availability slots`, open the row, change `start_at`, `end_at`,
`capacity_total`, `capacity_reserved` or `is_bookable`. Delete removes the window entirely.

⚠️ **The next rematerialize overwrites your edit**, because it regenerates from the rule. If the
change should outlive that, it belongs in the rule (recipe 2), not here.

## 7. Find out why an artist is not in the search results

Navigation: ⬅️ [6. Correct one slot by hand](#6-correct-one-slot-by-hand) | 📋 [Contents](#contents) | [Next](#8-change-the-rule-for-every-artist-at-once) ➡️

`unverified`

Read-only. Four queries in the order the five rows depend on each other, so the first one that comes
back empty is the answer.

```bash
cd /home/molef/Work/attica/backend/main

# 1. is there a scheduling resource at all?
sqlite3 db.sqlite3 "SELECT id, display_name, artist_id, is_active FROM scheduling_marketplaceresource WHERE resource_type='artist' ORDER BY id;"

# 2. is there an active rule behind it?
sqlite3 db.sqlite3 "SELECT id, resource_id, name, is_active, frequency, weekdays, effective_start_date, effective_end_date, local_start_time, local_end_time FROM scheduling_availabilityrule ORDER BY resource_id, id;"

# 3. is a blackout covering the window?
sqlite3 db.sqlite3 "SELECT id, resource_id, exception_type, start_at, end_at, reason FROM scheduling_availabilityexception ORDER BY resource_id, start_at;"

# 4. did anyone materialize the slots? (edit the dates)
sqlite3 db.sqlite3 "SELECT resource_id, start_at, end_at, is_bookable, capacity_total, capacity_reserved FROM scheduling_availabilityslot WHERE date(start_at) BETWEEN '2026-04-25' AND '2026-05-01' ORDER BY resource_id, start_at;"
```

✅ Query 4 returning rows while the search returns nothing means the problem is the search window,
not the data: the scheduler is asking about different dates than you are.

<details>
<summary><b>Why an empty result is the normal failure here</b></summary>

Availability search reads slots. A missing resource, an inactive rule and an unmaterialized range
all produce the same thing: no slot rows, so no results, and no error anywhere, because "this
artist has nothing free" is a perfectly ordinary answer. The four queries above exist because the
system cannot tell you which of the four it was.
</details>

## 8. Change the rule for every artist at once

Navigation: ⬅️ [7. Why an artist is not in the results](#7-find-out-why-an-artist-is-not-in-the-search-results) | 📋 [Contents](#contents)

`unverified`

A fallback for resetting demo data, not an operating procedure. It writes to every artist resource
in the database at once.

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main

sqlite3 db.sqlite3 "
UPDATE scheduling_availabilityrule
SET effective_start_date = '2026-04-25',
    effective_end_date   = '2026-05-01',
    is_active            = 1
WHERE resource_id IN (
  SELECT id FROM scheduling_marketplaceresource WHERE resource_type = 'artist'
);
"

python manage.py materialize_availability_slots --start-date 2026-04-25 --end-date 2026-05-01
```

⚠️ Run query 2 from recipe 7 first and read what you are about to overwrite. A `UPDATE` with no
`WHERE` on the resource type would hit venues and vendors too.
