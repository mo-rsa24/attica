# 🗺️ The Django admin site

The admin is the only surface in Attica that writes scheduling data directly. Everything the app
does through the API, the admin can do around it, which is what makes it useful for preparing data
and what makes it dangerous.

What to click, once you know these facts, is [preparing artist
availability](../../runbook/preparing-the-data/preparing-artist-availability.md).

## Table of contents

- [Getting in](#getting-in)
- [What is registered](#what-is-registered)
- [What the admin does not do](#what-the-admin-does-not-do)

## Getting in

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-is-registered) ➡️

**The admin lives at `http://127.0.0.1:8000/admin/`, on the backend port, not the Vite port.**

It is served by Django itself, so it is reachable whenever the backend is up and it does not care
whether Vite is running. A session that opens `http://localhost:5173/admin/` gets the React app's
404, not the admin, and the fix is the port rather than the route.

**Only a user with `is_staff` can log in, and only a superuser sees everything.**

The seeded artist accounts are created with `is_staff: False`
(`backend/main/artists/management/commands/seed_sa_artists.py:226`), and so are the seeded location
owners, so none of them can get in. The login form rejects them with a message that does not say
why. Make an account that works with `python manage.py createsuperuser`.

## What is registered

Navigation: ⬅️ [Getting in](#getting-in) | 📋 [TOC](#table-of-contents) | [Next](#what-the-admin-does-not-do) ➡️

**Ten scheduling models are registered, under `Scheduling`** (`backend/main/scheduling/admin.py`):
`MarketplaceResource`, `ResourcePolicy`, `AvailabilityRule`, `AvailabilityException`,
`AvailabilitySlot`, `BookingRequest`, `Booking`, `CalendarEvent`, `IdempotencyRecord` and
`AuditLog`.

The five that matter for making a provider bookable are covered in [what makes a provider
bookable](scheduling-availability.md).

**A model that is not registered is invisible here, not absent.** The row exists in the database
and the API can see it. When something you expect to edit has no admin page, the answer is the
registration, not the data.

## What the admin does not do

Navigation: ⬅️ [What is registered](#what-is-registered) | 📋 [TOC](#table-of-contents)

**Writing a row here does not run the code the API runs.** The scheduling service layer does the
validating, the [outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> append and the notification. An admin save writes the row and stops. So a
booking created in the admin never notifies anybody, and a rule changed in the admin does not
regenerate the slots that were built from it.

That second one is the trap: the rule reads correctly on screen and the search still returns
nothing, because the slots are stale rows from the old rule. Rematerializing is a separate step,
every time.
