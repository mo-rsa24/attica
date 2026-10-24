# 🌍 Booking

A booking is **a provider committed to an event for a window of time**. It is the thing an
organizer is trying to accumulate, and the thing a provider's calendar fills up with. It is the
settled state; the ask that preceded it is a
[booking request](booking-request.md#what-a-booking-request-is).

**Five tables in this codebase are called some variation of Booking and only one is live.** That is
the single most expensive confusion in the repository, and it has its own section below.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What a booking is](#what-a-booking-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-booking-is) ➡️

- **hold**: a claim on a window that stops anyone else taking it while an agreement is being
  finished. Expires on its own if nothing completes it.
- **materialized slot**: a bookable window written out as an actual row, rather than computed on
  demand from a recurrence rule. See [Availability](availability.md#what-availability-is).

## What a booking is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**A commitment between an organizer and one provider, for one window, tied to one event.** 🔍

It names the [marketplace resource](marketplace-resource.md#what-a-marketplace-resource-is) booked,
the time it covers, and the event it belongs to. Once it exists, that window is spoken for and the
provider's calendar shows it.

**It is the end of a sequence, not the start of one.** 🔍

An organizer does not create a booking directly. They make a request, the provider accepts, and a
booking is what that acceptance produces. Where money is involved, a checkout session sits between
the two, holding the window while payment resolves.

**Bookings against a draft become real only at publish.** ✅

`finalize_draft_bookings` at `backend/main/scheduling/services.py:1814` takes a draft, the event it
was published into, and the organizer, and settles the draft's bookings against the real event.
Before publish, what the organizer has accumulated is provisional.

📊 Drawn in [Two doors in, one line through](artifacts/scenes/scheduling-process-flows/figure-explainer.md#figure-3-two-doors-in-one-line-through).

## Why the project cares

Navigation: ⬅️ [What a booking is](#what-a-booking-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**It is the spreadsheet row that the whole product exists to replace.** ✍️

"Who is doing what at this event, and have they confirmed" is the organizer's constant question,
and today it lives in a spreadsheet kept beside six chat threads. The set of bookings on an event
is the system's answer.

**It is where [double-booking](../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub> has to be prevented or the marketplace is not trustworthy.** 🔍

Two organizers must not both secure the same provider for the same window. The machinery around
this model (holds, checkout sessions, [idempotency](../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub> records, conflict incidents) exists for that one
guarantee, which is why there is so much of it for such a simple-sounding object.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

The live table is `scheduling_booking`, defined at `backend/main/scheduling/models.py:396`. Its
neighbours in the same app are the ones that matter: `scheduling_bookingrequest` (the ask),
`scheduling_checkoutsession` (the hold while payment resolves), `scheduling_calendarevent` (the
provider's diary entry), and `scheduling_bookingconflictincident` (the record when the guarantee is
believed to have failed).

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Five tables are called Booking. Only `scheduling.Booking` is live.** ✅

| Model | State | Evidence |
|---|---|---|
| `scheduling.Booking` | **live** | Used across 9 files in `scheduling/`: services, views, serializers, admin, tests, and four seed commands |
| `vendors.Booking` | vestigial | Referenced only by `vendors/management/commands/load_bookings.py` and `events/admin.py` |
| `artists.ArtistBooking` | vestigial | Referenced only by `events/admin.py` |
| `locations.VenueBooking` | vestigial | Referenced only by `events/admin.py`, where the comment calls it "the new VenueBooking model" |
| `chat.Booking` | vestigial | One lazy import inside a function at `events/views.py:133` |

**The admin makes all five look equally real, which is how the day gets lost.** ✅

`events/admin.py` imports and registers the four vestigial ones alongside the live one. Someone
orienting themselves through the Django admin sees five booking tables and no indication that four
of them are dead. There is also a `vendors.BookingRequest`, unrelated to the live
`scheduling.BookingRequest`.

**Whether the four are kept deliberately is not established.** 🔍

They may be an earlier design nobody removed, or they may be intended for something. Nothing in the
repository says. This is on the [index's Still open list](../00-INDEX.md#still-open).

**Expecting a booking to appear the moment a provider says yes in chat.** 🔍

Agreement in a [chat thread](chat-room.md#what-a-bid-is) is not a booking. A bid being accepted and
a booking row existing are different events, and the chat models carry their own `Booking` (the
vestigial one above), which makes this easy to get backwards.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| Five models are named some variant of Booking | Listed every `class` in every `models.py` under `backend/main/` | 2026-08-22 |
| `scheduling.Booking` is the live one | Grepped for importers of each; counted 9 files in `scheduling/` against 1 or 2 elsewhere | 2026-08-22 |
| All four vestigial ones are registered in the admin | Read `backend/main/events/admin.py:4-6` | 2026-08-22 |
| `finalize_draft_bookings` settles draft bookings at publish | Read `backend/main/scheduling/services.py:1814` | 2026-08-22 |
| The ordering request, then acceptance, then booking | Inferred from the model set and the service names. Not driven live | 2026-08-22 |
