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
| Start the backend so [websockets](../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> actually work | [Stack § 2](running-the-web-app/bringing-the-stack-up.md#2-start-the-backend-with-websockets) |
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
      the [proxy](../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub>. Save as `images/stack/01-cors-failure-beside-success.png`.
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
the [Redis](../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> and outbox-worker terminals were not exercised in that run.

**Run on 2026-08-22, with real output pasted into the recipe.** Redis answering on `6379`. The
[outbox](../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> count, and the dispatcher clearing a 23-row backlog in one pass. The backend test suite.

**The backend suite is red.** 43 tests, 1 failure and 1 error, both in `events/tests.py`. See
[Tests § 2](running-the-web-app/running-the-tests.md#2-run-the-django-and-pytest-suites) for the
exact output.

**There is no working pytest.** It is installed in none of the project's environments and is not in
`requirements.txt`.

**Everything else here is `unverified`**: assembled from the repository and from the two documents
in [the sources list](sources.md), not run. Each recipe carries its own mark. Apart from the six
wizard recipes above, the browser recipes have never been driven, and the seed commands have not
been run against a clean database.
