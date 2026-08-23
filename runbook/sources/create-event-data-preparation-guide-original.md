# Create Event Data Preparation Guide

This guide explains how to prepare data for the event creation flow, with emphasis on making sure artists are available for booking before you continue the wizard.

Current wizard entry point:

- `http://127.0.0.1:5173/listing/:eventId/step1`

Example:

- `http://127.0.0.1:5173/listing/30/step1`

The relevant routes are defined in [frontend/src/App.jsx](../../frontend/src/App.jsx), the wizard step state is managed in [frontend/src/context/reactContext.jsx](../../frontend/src/context/reactContext.jsx), and the scheduling search is driven from [frontend/src/pages/SchedulingPlannerPage.jsx](../../frontend/src/pages/SchedulingPlannerPage.jsx).

## What the wizard expects

The event creation wizard does not book artists directly from step 1. The flow is:

1. Create or open an event draft.
2. Save the core event schedule in step 1.
3. Move to step 3 and choose artists.
4. Open the scheduler from the artist selection page.
5. Search scheduling availability for the selected event time window.
6. Create booking requests for the matching artist resources.

The active step sequence in the app is:

- `step1`
- `step3`
- `step4`
- `step5`
- `step6`
- `step7`
- `step8`
- `review`

That sequence is defined in [frontend/src/context/reactContext.jsx](../../frontend/src/context/reactContext.jsx).

## Minimum data to prepare before selecting artists

Before artists can be searched and requested properly, the event draft should have these fields saved in step 1:

- `name`
- `notes`
- `category`
- `theme`
- `start_date`
- `end_date`
- `start_time`
- `end_time`
- `guest_count`
- `date`

These are the step-1 fields persisted by the wizard. See `STEP_FIELD_WHITELIST.step1` in [frontend/src/context/reactContext.jsx](../../frontend/src/context/reactContext.jsx).

## Step 1: Prepare the event schedule correctly

At `/listing/30/step1`, make sure you save:

- Event name
- Description
- Region
- Start date
- Start time
- End date
- End time
- Capacity

Why this matters:

- Step 3 derives the initial event time block from the data saved in step 1.
- The scheduler then uses that time range to search provider availability.

The step-1 save logic is in [frontend/src/ListingStep1.jsx](../../frontend/src/ListingStep1.jsx). The step-3 calendar reads that saved range in [frontend/src/ListingStep3.jsx](../../frontend/src/ListingStep3.jsx).

### Recommended rule

Do not leave the event with only a date and no usable time range if you plan to request artists immediately after. The scheduler requires a valid `start_at` and `end_at` datetime window.

## Step 2 note

There is no separate active step 2 in the current implementation.

- `/listing/:eventId/step2` redirects to `step1`

That redirect is defined in [frontend/src/App.jsx](../../frontend/src/App.jsx).

## Step 3: Select artists

Artist selection happens at:

- `/listing/:eventId/step3/artists`

From there:

- artists are loaded from `/api/artists/artists`
- the selected artist list is stored in the event creation context as `selectedArtists`
- clicking `Open Scheduler` or `Request to Book All` sends you to `/scheduling`

That behavior is implemented in [frontend/src/pages/SelectArtists.jsx](../../frontend/src/pages/SelectArtists.jsx).

The scheduler URL is prefilled with:

- `event_id`
- `artist_ids`
- optional `auto_request=1`

## What must exist for an artist to be bookable

An artist showing in the artist catalogue is not enough. For the scheduler to treat that artist as bookable, the following scheduling data must exist:

1. A `MarketplaceResource` row linked to the artist.
2. A `ResourcePolicy` row for that resource.
3. At least one active `AvailabilityRule`.
4. Materialized `AvailabilitySlot` rows for the time range you are searching.
5. No blackout `AvailabilityException` blocking the requested range.

These scheduling models are defined in [backend/main/scheduling/models.py](../../backend/main/scheduling/models.py).

## How availability is intended to be managed

There are two possible management surfaces in this project:

1. Provider self-service UI at `/provider-availability`
2. Django admin for staff or superusers

### Is `/provider-availability` intended for the logged-in artist?

Yes. The page is designed as a provider-facing workflow for the logged-in owner of the scheduling resource.

Relevant implementation details:

- the page reads the logged-in user and derives a provider type in [frontend/src/ProviderAvailabilityPage.jsx](../../frontend/src/ProviderAvailabilityPage.jsx)
- the scheduling API endpoints require authentication
- create and update actions also check resource ownership before saving

The permission checks are implemented in:

- [backend/main/scheduling/permissions.py](../../backend/main/scheduling/permissions.py)
- [backend/main/scheduling/views.py](../../backend/main/scheduling/views.py)

That means the intended usage is:

- artist logs in
- artist manages only their own scheduling resource, policy, rules, exceptions, and slots

If you are seeing the page usable when not logged in, that is not the intended operational model and should be treated as a frontend access-control issue to verify separately.

## Recommended admin workflow

For reliable operational setup, especially when preparing data for demos, QA, or internal support, Django admin is the easiest controlled workflow.

The required models are already registered in Django admin in [backend/main/scheduling/admin.py](../../backend/main/scheduling/admin.py):

- `MarketplaceResource`
- `ResourcePolicy`
- `AvailabilityRule`
- `AvailabilityException`
- `AvailabilitySlot`

### Admin URL

- `http://127.0.0.1:8000/admin/`

### Admin models you will use most often

- `Scheduling > Marketplace resources`
- `Scheduling > Resource policies`
- `Scheduling > Availability rules`
- `Scheduling > Availability exceptions`
- `Scheduling > Availability slots`

## Django admin: step-by-step cases

This section is the recommended way to manage artist booking availability.

### Case 1: Create a new artist availability setup from scratch

Use this when an artist exists in the marketplace but has never been configured for scheduling.

#### Step 1. Create or verify the marketplace resource

1. Open Django admin.
2. Go to `Scheduling > Marketplace resources`.
3. Search for the artist by display name or owner.
4. If no resource exists, click `Add marketplace resource`.
5. Set:
   - `owner`: the artist's user account
   - `resource_type`: `artist`
   - `display_name`: the public artist name
   - `is_active`: checked
   - `artist`: select the matching `Artist` record
   - optional: `city`, `country`, `timezone`
6. Save.

#### Step 2. Create the booking policy

1. Go to `Scheduling > Resource policies`.
2. Click `Add resource policy`.
3. Select the artist resource created above.
4. Set the fields most likely to affect request creation:
   - `booking_mode`
   - `min_notice_hours`
   - `max_horizon_days`
   - `cancellation_window_hours`
   - `allow_reschedule`
   - `require_message_for_request`
5. Save.

Notes:

- if `require_message_for_request` is enabled, requests without a message can fail
- if `min_notice_hours` is too high, near-term requests can fail

#### Step 3. Create recurring availability rules

1. Go to `Scheduling > Availability rules`.
2. Click `Add availability rule`.
3. Set:
   - `resource`: the artist resource
   - `name`: a descriptive label such as `All week 09:00-22:00`
   - `is_active`: checked
   - `timezone`: usually `Africa/Johannesburg`
   - `frequency`: `weekly`
   - `weekdays`: the required day indices
   - `effective_start_date`
   - `effective_end_date`
   - `local_start_time`
   - `local_end_time`
   - `capacity`: usually `1`
4. Save.

Weekday mapping:

- `0` Monday
- `1` Tuesday
- `2` Wednesday
- `3` Thursday
- `4` Friday
- `5` Saturday
- `6` Sunday

Example for all days:

- `[0, 1, 2, 3, 4, 5, 6]`

#### Step 4. Materialize slots

Rules alone are not always enough for search results. Generate slots for the event window.

```bash
cd /mnt/c/users/molef/playground/attica/lobola/backend/main
python manage.py materialize_availability_slots --start-date 2026-04-25 --end-date 2026-05-01
```

#### Step 5. Verify

1. Open `Scheduling > Availability slots`.
2. Filter or search by the artist resource.
3. Confirm rows exist for the target date range.
4. Confirm `is_bookable` is checked and `capacity_reserved` is less than `capacity_total`.

### Case 2: Update an artist's recurring availability

Use this when the artist already has availability, but the date window or time window is wrong.

#### Update the rule

1. Open `Scheduling > Availability rules`.
2. Filter by the artist resource.
3. Open the existing rule.
4. Change any of:
   - `is_active`
   - `weekdays`
   - `effective_start_date`
   - `effective_end_date`
   - `local_start_time`
   - `local_end_time`
   - `capacity`
5. Save.

#### Re-materialize slots

After changing a rule, rebuild the slots for the affected range.

```bash
cd /mnt/c/users/molef/playground/attica/lobola/backend/main
python manage.py materialize_availability_slots --start-date 2026-04-25 --end-date 2026-05-01
```

#### Verify the result

1. Open `Scheduling > Availability slots`.
2. Confirm the generated rows now match the updated schedule.

### Case 3: Add blackout time when the artist is unavailable

Use this when the artist normally works on a day, but must not be bookable during a specific period.

1. Open `Scheduling > Availability exceptions`.
2. Click `Add availability exception`.
3. Set:
   - `resource`: the artist resource
   - `exception_type`: `blackout`
   - `start_at`
   - `end_at`
   - `reason`
   - leave `is_available_override` unchecked
4. Save.

Use examples:

- public holiday
- travel day
- private event
- maintenance block

### Case 4: Remove a blackout so the artist becomes bookable again

1. Open `Scheduling > Availability exceptions`.
2. Find the blocking blackout record.
3. Delete it.
4. Re-test the artist in scheduling search.

If you want to be extra safe, rematerialize slots again for the relevant date range.

### Case 5: Delete an availability rule

Use this when the recurring schedule should no longer exist.

1. Open `Scheduling > Availability rules`.
2. Find the rule.
3. Decide whether to:
   - uncheck `is_active`, or
   - delete the rule completely
4. Save or delete.

Recommendation:

- prefer setting `is_active = false` if you may need the rule history
- delete only when you are sure the rule is obsolete

Afterward, rematerialize the affected date range to make the slot set consistent.

### Case 6: Edit or delete materialized slots directly

This is an advanced admin operation and should be used carefully.

Direct slot editing is useful when:

- you need a one-off correction
- you are patching demo data quickly
- you want to force a date to become bookable or unbookable

#### Update a slot

1. Open `Scheduling > Availability slots`.
2. Find the slot.
3. Change:
   - `start_at`
   - `end_at`
   - `capacity_total`
   - `capacity_reserved`
   - `is_bookable`
4. Save.

#### Delete a slot

1. Open `Scheduling > Availability slots`.
2. Select the incorrect slot row.
3. Delete it.

Recommendation:

- use slot edits only for one-off corrections
- use rule edits for recurring schedule changes

## Example admin workflow for 25 April 2026 to 1 May 2026

If you want an artist to be bookable from `2026-04-25` to `2026-05-01`, this is the clean admin workflow:

1. Verify the artist has a `MarketplaceResource`.
2. Verify the resource has a `ResourcePolicy`.
3. Create or update an `AvailabilityRule` with:
   - `frequency = weekly`
   - `weekdays = [0, 1, 2, 3, 4, 5, 6]`
   - `effective_start_date = 2026-04-25`
   - `effective_end_date = 2026-05-01`
   - `local_start_time = 09:00`
   - `local_end_time = 22:00`
4. Confirm there is no blocking `AvailabilityException`.
5. Run:

```bash
cd /mnt/c/users/molef/playground/attica/lobola/backend/main
python manage.py materialize_availability_slots --start-date 2026-04-25 --end-date 2026-05-01
```

6. Verify the slots in Django admin.

## Example: make artists available for 25 April 2026 to 1 May 2026

If the event should be bookable during `2026-04-25` to `2026-05-01`, the artist resources need an availability rule that covers that date range and includes the intended booking times.

Example weekly rule:

- weekdays: all days
- start time: `09:00`
- end time: `22:00`
- effective start date: `2026-04-25`
- effective end date: `2026-05-01`

After rules exist, generate slots for that date range:

```bash
cd /mnt/c/users/molef/playground/attica/lobola/backend/main
python manage.py materialize_availability_slots --start-date 2026-04-25 --end-date 2026-05-01
```

The command is defined in [backend/main/scheduling/management/commands/materialize_availability_slots.py](../../backend/main/scheduling/management/commands/materialize_availability_slots.py).

## How the scheduler uses your event draft data

When you open `/scheduling` from the artist selection page:

1. The selected event id is loaded.
2. The selected artist ids are matched to scheduling resources.
3. The event date can autofill the search range if no explicit range is passed.
4. The scheduler searches availability using `start_at` and `end_at`.
5. Booking requests are created against the matched resource ids.

Search endpoint:

- `/api/scheduling/availability/search/`

Request creation endpoint:

- `/api/scheduling/requests/create/`

The scheduler API helpers are in [frontend/src/api/schedulingApi.js](../../frontend/src/api/schedulingApi.js).

## Recommended preparation checklist before continuing from step 1

- Save the draft at `/listing/30/step1`
- Confirm the event has valid start and end date/time values
- Go to `/listing/30/step3/artists`
- Select the artists you want
- Open the scheduler
- Confirm matching artist resources appear in availability search results
- Create booking requests

If artists do not appear in scheduler results, check the troubleshooting steps below before assuming the artist record itself is wrong.

## Troubleshooting

### Problem: artist exists in the catalogue but is not bookable

Likely causes:

- no scheduling resource for that artist
- no active availability rule
- slots were never materialized
- blackout exception overlaps the event range
- scheduler search dates do not match the event window you expect

### Check scheduling resources

```bash
sqlite3 backend/main/db.sqlite3 "
SELECT id, display_name, artist_id, owner_id, is_active
FROM scheduling_marketplaceresource
WHERE resource_type='artist'
ORDER BY id;
"
```

### Check availability rules

```bash
sqlite3 backend/main/db.sqlite3 "
SELECT id, resource_id, name, is_active, frequency, weekdays,
       effective_start_date, effective_end_date,
       local_start_time, local_end_time
FROM scheduling_availabilityrule
ORDER BY resource_id, id;
"
```

### Check blackout exceptions

```bash
sqlite3 backend/main/db.sqlite3 "
SELECT id, resource_id, exception_type, start_at, end_at, reason
FROM scheduling_availabilityexception
ORDER BY resource_id, start_at;
"
```

### Check materialized slots for the event window

```bash
sqlite3 backend/main/db.sqlite3 "
SELECT resource_id, start_at, end_at, is_bookable, capacity_total, capacity_reserved
FROM scheduling_availabilityslot
WHERE date(start_at) BETWEEN '2026-04-25' AND '2026-05-01'
ORDER BY resource_id, start_at;
"
```

### Rebuild slots for a known date range

```bash
cd backend/main
python manage.py materialize_availability_slots --start-date 2026-04-25 --end-date 2026-05-01
```

## Practical workflow for your current draft

For draft `30`, use this order:

1. Finish and save `step1` with the real event dates and times.
2. Go to `/listing/30/step3/artists`.
3. Select the artists you want to request.
4. Click `Open Scheduler`.
5. Verify the scheduler search window matches the event timing.
6. If no artists appear, prepare provider availability in `/provider-availability`.
7. Materialize availability slots if rules were added recently.
8. Return to `/scheduling` and run the search again.
9. Create the requests once the artists appear as available.

## If you need to edit the database directly

Direct DB edits should be a fallback. If you use them, update the rule date range and then rebuild slots.

Example:

```bash
cd /mnt/c/users/molef/playground/attica/lobola/backend/main

sqlite3 db.sqlite3 "
UPDATE scheduling_availabilityrule
SET effective_start_date = '2026-04-25',
    effective_end_date   = '2026-05-01',
    is_active            = 1
WHERE resource_id IN (
  SELECT id
  FROM scheduling_marketplaceresource
  WHERE resource_type = 'artist'
);
"

python manage.py materialize_availability_slots --start-date 2026-04-25 --end-date 2026-05-01
```

Use this only when you understand which artists should inherit that rule change. For normal operation, prefer the provider availability UI.
