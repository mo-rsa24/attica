# 🔧 Runbook: Attica

How to do the recurring things here by hand. You have done these before; this is where the
forgettable detail lives so you do not rediscover it.

What the system *is* lives in the [environment index](../environment/00-INDEX.md). What any of it
*means* lives in the [context index](../context/00-INDEX.md). This folder is only what to type and
where to click.

## I want to...

| The question | The recipe |
|---|---|
| Get everything running from a cold terminal | [Stack § 1](running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up) |
| Start the backend so websockets actually work | [Stack § 2](running-the-web-app/bringing-the-stack-up.md#2-start-the-backend-with-websockets) |
| Work out why part of the app broke when the rest is fine | [Stack § 3](running-the-web-app/bringing-the-stack-up.md#3-find-out-why-half-the-app-is-failing) |
| Deliver the notifications that are stuck | [Stack § 4](running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox) |
| Run the browser tests | [Tests § 1](running-the-web-app/running-the-tests.md#1-run-the-playwright-suite) |
| Run the backend tests | [Tests § 2](running-the-web-app/running-the-tests.md#2-run-the-django-and-pytest-suites) |
| Put the marketplace test data back | [Seeding § 1](preparing-the-data/seeding-and-resetting-data.md#1-seed-the-marketplace-providers) |
| Get the seven booking scenarios back | [Seeding § 2](preparing-the-data/seeding-and-resetting-data.md#2-seed-the-booking-scenarios) |
| Make availability search return anything | [Seeding § 3](preparing-the-data/seeding-and-resetting-data.md#3-materialize-availability-slots) |
| Log in as a test user | [Seeding § 4](preparing-the-data/seeding-and-resetting-data.md#4-the-test-accounts) |
| Start again from an empty database | [Seeding § 5](preparing-the-data/seeding-and-resetting-data.md#5-reset-the-database-completely) |
| Make one artist bookable for a date range | [Availability § 1](preparing-the-data/preparing-artist-availability.md#1-make-an-artist-bookable-from-scratch) |
| Change when an artist is available | [Availability § 2](preparing-the-data/preparing-artist-availability.md#2-change-an-artists-recurring-availability) |
| Block out a holiday or a travel day | [Availability § 3](preparing-the-data/preparing-artist-availability.md#3-block-out-a-date-range) |
| Work out why an artist never appears in search | [Availability § 7](preparing-the-data/preparing-artist-availability.md#7-find-out-why-an-artist-is-not-in-the-search-results) |
| Fill in event details so availability search has a window to work on | [Wizard § 1](driving-the-app/walking-the-event-wizard.md#1-fill-step-1-so-the-scheduler-has-something-to-search) |
| Send a real booking request while walking the wizard | [Wizard § 4](driving-the-app/walking-the-event-wizard.md#4-send-a-booking-request-from-the-step3-marketplace) |
| Work out which wizard screen a `/listing/.../stepN` URL actually shows | [Wizard § The route numbers](driving-the-app/walking-the-event-wizard.md#the-route-numbers-do-not-match-the-screen-numbers) |
| See what one Request to Book click writes to the database | [Wizard § 4](driving-the-app/walking-the-event-wizard.md#4-send-a-booking-request-from-the-step3-marketplace) |
| Set the event location when the map keeps changing my address | [Wizard § 5](driving-the-app/walking-the-event-wizard.md#5-set-the-location-on-route-step4) |
| Set a ticket price, and know which numbers are actually stored | [Wizard § 6](driving-the-app/walking-the-event-wizard.md#6-set-the-ticket-price-on-route-step5) |
| Control which uploaded image becomes the poster and which the banner | [Wizard § 7](driving-the-app/walking-the-event-wizard.md#7-add-features-and-media-before-review) |
| Publish a draft and check what the event actually got | [Wizard § 8](driving-the-app/walking-the-event-wizard.md#8-publish-the-draft-and-check-what-the-event-got) |
| Work out why review says my event has no title or capacity | [Wizard § 8](driving-the-app/walking-the-event-wizard.md#8-publish-the-draft-and-check-what-the-event-got) |
| Find a booking request that disappeared after publishing | [Wizard § 8](driving-the-app/walking-the-event-wizard.md#8-publish-the-draft-and-check-what-the-event-got) |
| Walk a booking request end to end by hand | [Booking § 1](driving-the-app/driving-the-booking-flow.md#1-submit-a-booking-request-as-an-organizer) |
| See what a provider sees when a request arrives | [Booking § 2](driving-the-app/driving-the-booking-flow.md#2-answer-a-request-as-a-provider) |
| Check the seven pre-built scenarios render | [Booking § 3](driving-the-app/driving-the-booking-flow.md#3-inspect-the-seven-pre-built-scenarios) |

## The themes

Grouped by the kind of work. Every question above already points straight at its recipe; this table
is for when you want to read a whole theme.

**Running the web app**

| File | One place your hands are | Recipes |
|---|---|---|
| [bringing-the-stack-up.md](running-the-web-app/bringing-the-stack-up.md) | four terminals | 4 |
| [running-the-tests.md](running-the-web-app/running-the-tests.md) | the terminal, in `frontend/` and `backend/main/` | 3 |

**Preparing the data**

| File | One place your hands are | Recipes |
|---|---|---|
| [seeding-and-resetting-data.md](preparing-the-data/seeding-and-resetting-data.md) | the terminal, in `backend/main` | 5 |
| [preparing-artist-availability.md](preparing-the-data/preparing-artist-availability.md) | the Django admin at `:8000/admin/` | 8 |

**Driving the app**

| File | One place your hands are | Recipes |
|---|---|---|
| [walking-the-event-wizard.md](driving-the-app/walking-the-event-wizard.md) | the browser, as an organizer, with `sqlite3` beside it | 8 |
| [driving-the-booking-flow.md](driving-the-app/driving-the-booking-flow.md) | the browser, as both parties | 3 |

Where these recipes came from is in [the sources list](sources.md).

## Screenshots wanted

The wizard theme has nine, captured while driving it on 2026-08-28 and stored in
`images/wizard/`. These four are still missing, and each earns one because it is hard to describe
and easy to recognise.

- [ ] 📷 [Booking § 3](driving-the-app/driving-the-booking-flow.md#3-inspect-the-seven-pre-built-scenarios):
      the Marketplace Requests tab showing all seven scenario rows with their status badges. Save as
      `images/booking/01-seven-scenarios.png`.
- [ ] 📷 [Booking § 2](driving-the-app/driving-the-booking-flow.md#2-answer-a-request-as-a-provider):
      the provider dashboard with an incoming request and its action buttons. Save as
      `images/booking/02-provider-dashboard.png`.
- [ ] 📷 [Stack § 3](running-the-web-app/bringing-the-stack-up.md#3-find-out-why-half-the-app-is-failing):
      Chrome DevTools Network tab showing one CORS-failed request beside one that succeeded through
      the proxy. Save as `images/stack/01-cors-failure-beside-success.png`.
- [ ] 📷 [Availability § 1](preparing-the-data/preparing-artist-availability.md#1-make-an-artist-bookable-from-scratch):
      the `Availability rules` add form with the weekly rule filled in, since the `weekdays` field
      is the one nobody remembers. Save as `images/seeding/02-availability-rule-form.png`.

## What has been run, and what has not

**The whole event wizard driven in a browser on 2026-08-28, with real output pasted into each
recipe.** Wizard recipes 1 and 4 to 8, end to end as `e2e-organizer`: draft 45 created and filled,
booking request 38 sent against Rise Rooftop, Sandton, then carried through location, pricing,
features and media and published as event 48. Each screen is paired with the `sqlite3` read of the
rows it wrote.

**Bringing the stack up was run for real on 2026-08-28**, when daphne and Vite were found dead
mid-session. [Stack § 1](running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up)'s
backend and frontend commands both worked as written. Its recipe still carries `unverified` because
the Redis and outbox-worker terminals were not exercised in that run.

**Run on 2026-08-22, with real output pasted into the recipe.** Redis answering on `6379`. The
outbox count, and the dispatcher clearing a 23-row backlog in one pass. The backend test suite.

**The backend suite is red.** 43 tests, 1 failure and 1 error, both in `events/tests.py`. See
[Tests § 2](running-the-web-app/running-the-tests.md#2-run-the-django-and-pytest-suites) for the
exact output.

**There is no working pytest.** It is installed in none of the project's environments and is not in
`requirements.txt`.

**Everything else here is `unverified`**: assembled from the repository and from the two documents
in [the sources list](sources.md), not run. Each recipe carries its own mark. Apart from the six
wizard recipes above, the browser recipes have never been driven, and the seed commands have not
been run against a clean database.
