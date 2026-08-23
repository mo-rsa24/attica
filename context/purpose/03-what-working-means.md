# 🌍 What working means

The ambition is a social platform for events, somewhere between Ticketmaster and Airbnb, web first
and mobile later. That is the destination. This file separates it from where the system actually
is, because a folder that reports the ambition as the state is the kind of document that gets built
on and then found out.

## Table of contents

- [The test](#the-test)
- [What a good result looks like](#what-a-good-result-looks-like)
- [What a bad result looks like](#what-a-bad-result-looks-like)
- [What this cannot tell you](#what-this-cannot-tell-you)
- [Where this came from](#where-this-came-from)

## The test

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-good-result-looks-like) ➡️

**One organizer plans one real event end to end without leaving the platform.** ✍️

They create it, find a venue with a free date, ask to book it and settle its price, do the same
with an artist and with a caterer, publish, and sell a ticket. No WhatsApp, no spreadsheet, no
email thread. If any step forces them back out to another tool, that step is the product's real
boundary and the rest is decoration.

**The sharper version: the organizer stops keeping a parallel spreadsheet.** ✍️

People keep a shadow copy of anything they do not trust. A spreadsheet still open beside Attica
means the system is not yet the record, whatever the feature list says.

## What a good result looks like

Navigation: ⬅️ [The test](#the-test) | 📋 [TOC](#table-of-contents) | [Next](#what-a-bad-result-looks-like) ➡️

**Both sides come back without being asked.** ✍️

An organizer who plans a second event on it, and a provider who keeps their availability current
between bookings. The provider half is the harder one and the better signal: publishing
availability is unpaid work that only pays off if bookings actually arrive.

**Discovery happens through the social layer rather than through search.** ✍️

An organizer books an artist because they saw the artist's post, not because they filtered a list.
That is the difference between the platform Attica intends to be and a directory with a calendar.

## What a bad result looks like

Navigation: ⬅️ [What a good result looks like](#what-a-good-result-looks-like) | 📋 [TOC](#table-of-contents) | [Next](#what-this-cannot-tell-you) ➡️

**One side of the marketplace shows up and the other does not.** 🔍

Organizers with nobody to book, or providers with nobody booking them. This is the standard way a
two-sided marketplace fails and neither half is visible as a problem from inside the other.

**The platform becomes where the conversation starts and somewhere else is where it finishes.** ✍️

Users meet on Attica and move to WhatsApp to actually agree. The bookings table stays thin while
the chat table grows, which would be measurable and is not currently measured.

## What this cannot tell you

Navigation: ⬅️ [What a bad result looks like](#what-a-bad-result-looks-like) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**There is no measurable definition of a successful event yet.** ✍️

The mission is that Attica facilitates one. Nobody has said what that means in numbers, so no
test above can currently be run as a check rather than read as a judgement. This is the first
`Still open` item on the [index](../00-INDEX.md#still-open).

**The two halves of the ambition are not equally built, and the gap is large.** ✅

The Airbnb half is substantially engineered: 16 models in `scheduling`, covering resources,
availability rules and exceptions, materialized slots, checkout sessions, booking requests,
bookings, calendar events, idempotency records, an outbox, dead letters, webhook targets, conflict
incidents and reviews.

The Ticketmaster half is close to absent. `tickets` holds one model with four fields
(`event`, `buyer`, `quantity`, `payment_status`) and no price. `checkout` holds no models at all.
The `Event` row carries `base_price`, `currency` (defaulting to `ZAR`), `tiered_prices` and
`max_tickets_per_buyer`, so the intent is modelled on the selling side and nothing implements the
buying side. See [Ticket § What people get wrong](../world/ticket.md#what-people-get-wrong).

**No payment integration exists.** ✅

`payment_status` can be set to `paid`, and nothing in the repository can take money to make that
true. Stripe is named as a future dependency in `CLAUDE.md` and `.env.example` carries an empty
`STRIPE_TEST_KEY`.

**Nothing here says whether anyone outside the builder has used it.** 🔍

The database contains seeded demonstration data (South African artists and venues loaded by
management commands). Real usage would be indistinguishable from seed data by reading the schema,
and was not checked.

## Where this came from

Navigation: ⬅️ [What this cannot tell you](#what-this-cannot-tell-you) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| The ambition is a social events platform, Ticketmaster crossed with Airbnb, web first | Stated by the product owner in conversation | 2026-08-22 |
| Scheduling carries 16 models; tickets carries 1; checkout carries none | Counted in `backend/main/*/models.py` | 2026-08-22 |
| `Ticket` has no price field | Read `backend/main/tickets/models.py` in full, 12 lines | 2026-08-22 |
| `Event` carries `base_price`, `currency` defaulting to `ZAR`, and `tiered_prices` | Read `backend/main/events/models.py:52-60` | 2026-08-22 |
| No payment integration exists | Searched the tree for Stripe and payment handling; `.env.example` carries an empty `STRIPE_TEST_KEY` | 2026-08-22 |
| The measurable definition of a successful event does not exist | Asked the product owner; the answer given was the mission, not a measure | 2026-08-22 |
