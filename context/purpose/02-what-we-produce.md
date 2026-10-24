# 🌍 What Attica produces

Attica is not a model and it does not produce a prediction. It produces a **published event with
its providers booked**, and the record of how that happened. This file says what that record is,
who reads it, and what each reader does differently because it exists.

## Table of contents

- [The output, concretely](#the-output-concretely)
- [Who reads it](#who-reads-it)
- [What they do differently](#what-they-do-differently)
- [Where this came from](#where-this-came-from)

## The output, concretely

Navigation: 📋 [TOC](#table-of-contents) | [Next](#who-reads-it) ➡️

**A published event.** ✅

One row in `events_event`, promoted out of a draft when the organizer publishes. It carries the
name, the date, the location, the budget, the guest count, the ticket pricing and the amenities
chosen in the wizard. Until publish it is a
[draft](../world/event-draft.md#what-an-event-draft-is), which is a different thing in a different
table.

**A set of confirmed bookings against it.** ✅

One `scheduling_booking` row per provider the organizer secured, each pointing at the
[marketplace resource](../world/marketplace-resource.md#what-a-marketplace-resource-is) booked and
the window it covers. This is the answer to "who is doing what at this event", and it is the part
that today lives in a spreadsheet.

**A trail of how each booking was agreed.** ✅

The [booking request](../world/booking-request.md#what-a-booking-request-is) that preceded it, and
where a price was negotiated, the [chat thread and its bids](../world/chat-room.md#what-a-bid-is).
A record of the ask, the counter and the acceptance, in the system rather than in someone's phone.

**A provider calendar that fills up.** 🔍

From the other side, the same bookings are the provider's diary. `scheduling_calendarevent` holds
what is committed, and the availability rules underneath it stop the same window being sold twice.

## Who reads it

Navigation: ⬅️ [The output, concretely](#the-output-concretely) | 📋 [TOC](#table-of-contents) | [Next](#what-they-do-differently) ➡️

**The organizer, while planning.** ✍️

They are the primary reader and they read it constantly, because it is the thing that replaces
their memory of six conversations. The question they arrive with is almost always "where are we",
and the event plus its bookings is the answer.

**The provider, deciding whether to accept.** 🔍

A venue, artist or vendor reads an incoming booking request: which event, which window, what is
being offered. They accept, decline, or counter with a bid.

**The guest, eventually.** 🔍

A published event is meant to be something an attendee browses and buys a ticket to. This reader is
the least served today; see [what working means](03-what-working-means.md#what-this-cannot-tell-you).

## What they do differently

Navigation: ⬅️ [Who reads it](#who-reads-it) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**The organizer stops being the integration layer.** ✍️

Today the state of an event exists only in the organizer's head. With a published event and its
bookings, "has the caterer confirmed" is a question the system answers rather than a thread to
re-read. That is the whole change, and everything else is in service of it.

**The provider answers availability once instead of five times.** ✍️

Publishing availability rules replaces fielding the same date question across five inboxes.
An organizer searches for a free Saturday instead of asking who has one.

**The [double-booking](../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub> argument stops happening.** 🔍

Two organizers cannot both secure the same provider for the same window, because the booking path
holds the slot rather than trusting two conversations to stay consistent. `BookingConflictIncident`
exists to record it when the system believes this has failed anyway.

## Where this came from

Navigation: ⬅️ [What they do differently](#what-they-do-differently) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| A published event is a row in `events_event` promoted from a draft | Read `backend/main/events/models.py:19-125` and the publish action at `events/views.py:496` | 2026-08-22 |
| Bookings point at a marketplace resource, not at a venue or artist directly | Read `backend/main/scheduling/models.py:396-479` | 2026-08-22 |
| Bids live in the chat thread | Read `backend/main/chat/models.py:47-92` | 2026-08-22 |
| The organizer is the primary reader and the question is "where are we" | Stated by the product owner in conversation | 2026-08-22 |
| A conflict incident table exists | Read `backend/main/scheduling/models.py:688-736`. Whether it has ever fired was not checked | 2026-08-22 |
