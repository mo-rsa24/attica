# 🔧 Walking the event wizard

Driving the create-event flow in the browser from an empty draft to booking requests sent. One
place your hands are: `http://localhost:5173`, logged in as an organizer.

The step-by-step recording of what each click sends to the backend is in the learning journey at
`/home/molef/goal-setting/learning/attica-event-creation/flow-map.md`. This is the shorter thing:
what to do, in order, and where it stops working.

## Before any of these

All four processes up (`../running-the-web-app/bringing-the-stack-up.md`), the marketplace seeded
(`../preparing-the-data/seeding-and-resetting-data.md`), and at least one artist actually bookable
(`../preparing-the-data/preparing-artist-availability.md`), which is not the same as visible in the
catalogue.

## Contents

- [1. Fill step 1 so the scheduler has something to search](#1-fill-step-1-so-the-scheduler-has-something-to-search)
- [2. Select artists and open the scheduler](#2-select-artists-and-open-the-scheduler)
- [3. Search availability and send the requests](#3-search-availability-and-send-the-requests)

## 1. Fill step 1 so the scheduler has something to search

Navigation: 📋 [Contents](#contents) | [Next](#2-select-artists-and-open-the-scheduler) ➡️

`unverified` (assembled from [the original data-preparation guide](../sources/booking-test-guide-original.md) and the wizard source; not driven this session)

Open `http://localhost:5173/listing/<draft-id>/step1` and save all of: name, description, region,
start date, start time, end date, end time, capacity.

⚠️ **A date with no usable time range is the failure that shows up two steps later.** Step 3 derives
its time block from what step 1 saved, and the scheduler searches on `start_at` and `end_at`. Saved
without times, the search has no window and returns nothing, and nothing on screen connects that
back to step 1.

✅ Reloading the page brings the values back. The fields that persist are
`STEP_FIELD_WHITELIST.step1` in `frontend/src/context/reactContext.jsx`; anything outside that list
is dropped on save without a message.

**There is no step 2.** `/listing/:eventId/step2` redirects to `step1`, and the live sequence is
step 1, 3, 4, 5, 6, 7, 8, review.

## 2. Select artists and open the scheduler

Navigation: ⬅️ [1. Fill step 1](#1-fill-step-1-so-the-scheduler-has-something-to-search) | 📋 [Contents](#contents) | [Next](#3-search-availability-and-send-the-requests) ➡️

`unverified`

Go to `/listing/<draft-id>/step3/artists`. The catalogue loads from `/api/artists/artists`. Tick the
artists you want, then `Open Scheduler` (or `Request to Book All`, which does the same thing and
sets `auto_request=1`).

✅ The URL you land on carries `event_id` and `artist_ids`, which is how the scheduler knows what to
search for. If either is missing from the query string, the selection did not register.

## 3. Search availability and send the requests

Navigation: ⬅️ [2. Select artists](#2-select-artists-and-open-the-scheduler) | 📋 [Contents](#contents)

`unverified`

On `/scheduling`, check the search window matches your event before searching. It autofills from the
event date when no explicit range was passed, and the autofill is the thing to distrust.

Search hits `/api/scheduling/availability/search/`; sending the requests hits
`/api/scheduling/requests/create/`.

❌ **No artists in the results.** Almost never the artist record. Work through
[Preparing artist availability § 7](../preparing-the-data/preparing-artist-availability.md#7-find-out-why-an-artist-is-not-in-the-search-results),
which walks the five things that have to exist, in dependency order.

❌ **Results appear, and creating the request fails.** That is the policy, not the availability:
`min_notice_hours` defaults to 24, so a request for tomorrow is refused after the slot showed as
free. See [the fields that silently block a
request](../../environment/django-admin/scheduling-availability.md#the-fields-that-silently-block-a-request).

✅ Requests created. What the provider sees next, and how to answer as them, is
[Driving the booking flow § 2](driving-the-booking-flow.md#2-answer-a-request-as-a-provider).

⚠️ Nobody is notified unless the outbox worker is running. See
[Stack § 4](../running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox).
