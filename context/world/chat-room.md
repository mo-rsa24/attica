# 🌍 Chat room, and the bids inside it

A chat room is **a direct conversation between an organizer and a provider**. It is where the
haggling happens, and it carries a structured object the other messaging apps cannot: a **bid**, a
priced offer with a state, sitting in the thread alongside the words.

The bid is the point. Without it this is a messaging feature; with it, the negotiation that
currently happens on WhatsApp becomes a record the system can act on.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What a chat room is](#what-a-chat-room-is)
- [What a bid is](#what-a-bid-is)
- [Why the project cares](#why-the-project-cares)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-chat-room-is) ➡️

- **bid**: a priced offer made inside a conversation, which can be accepted, declined or countered.
- **idempotency key**: a value the sender generates so that the same offer submitted twice
  (a double-tap, a retry after a dropped connection) creates one row rather than two.

## What a chat room is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#what-a-bid-is) ➡️

**A conversation between two users, holding messages, file attachments and bids.** 🔍

Messages are rows. Attachments are rows pointing at uploaded files. Bids are rows with their own
lifecycle. The database is the record; the live updating is a layer on top of it, which is a system
fact and lives in [the environment overview](../../environment/overview.md).

## What a bid is

Navigation: ⬅️ [What a chat room is](#what-a-chat-room-is) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**A priced offer from an organizer to a provider, with a state.** ✅

It carries an `amount`, a `currency`, an optional `tier` (which package or level is being offered),
free-text `notes`, and a status of `pending`, `accepted`, `declined` or `countered`. Where the
provider counters, `counter_amount` holds their number, so both sides of the haggle sit on one row.

**It names which kind of provider it is aimed at.** ✅

`provider_type` is `vendor`, `artist` or `venue`, defaulting to `vendor`. This mirrors the three
[marketplace resource](marketplace-resource.md#what-a-marketplace-resource-is) kinds but is a
separate field on a separate model, not a link to one.

**It can carry the event it is about, and does not have to.** ✅

`event` is a nullable foreign key. A bid with no event is a price agreed without a specific
occasion attached.

**Submitting the same bid twice creates one row.** ✅

A unique constraint on `(organizer, vendor, idempotency_key)` enforces it at the database level.
This is a real guarantee, not a convention.

> 📷 **Picture wanted**: the chat panel with a bid card in the thread, showing the amount and the
> accept and counter controls. Save as `images/world/03-bid-in-thread.png`.

## Why the project cares

Navigation: ⬅️ [What a bid is](#what-a-bid-is) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

**Price is the reason the conversation leaves other platforms and it is the reason it must not.** ✍️

Two people agreeing a number in a chat thread is exactly what happens today on WhatsApp, and it is
why the state of an event lives in someone's memory. Making the offer a structured object with a
status is what lets the platform know what was agreed without reading the words.

**It is the measurable signal for one specific failure.** ✍️

If the chat table grows while the bookings table stays thin, the platform has become where
conversations start and somewhere else is where they finish. See [what working
means](../purpose/03-what-working-means.md#what-a-bad-result-looks-like).

## What people get wrong

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Bids default to `USD` while events default to `ZAR`.** ✅

`ChatBid.currency` defaults to `'USD'`; `Event.currency` defaults to `'ZAR'`. On a South African
platform, a bid created without an explicit currency is denominated in the wrong one, and nothing
reconciles the two fields.

**The field named `vendor` on a bid is a user, and may be an artist or a venue.** ✅

`ChatBid.vendor` is a foreign key to `CustomUser`, holding whoever is receiving the offer. The
actual kind is in `provider_type`. Reading `vendor` as meaning the `vendors.Vendor` model is wrong,
and it is a natural mistake given the name.

**An accepted bid is not a booking.** 🔍

Acceptance sets a status on the bid. A [booking](booking.md#what-a-booking-is) is a row in
`scheduling_booking`, produced by the scheduling path. The chat app has its own vestigial `Booking`
model, which makes this easy to get backwards.

**A bid does not point at a marketplace resource.** ✅

It points at two users and optionally an event. So a bid cannot be joined to availability, slots,
or the resource it is really about, without going through the users.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| Bid fields, the four statuses and the three provider types | Read `backend/main/chat/models.py:47-92` | 2026-08-22 |
| The idempotency unique constraint | Read the model's `Meta.constraints` | 2026-08-22 |
| `ChatBid.currency` defaults to `USD`, `Event.currency` to `ZAR` | Read `chat/models.py:76` and `events/models.py:54` | 2026-08-22 |
| `ChatBid.vendor` is a `CustomUser`, not a `Vendor` | Read `chat/models.py:60` | 2026-08-22 |
| Chat is database-first with live updates layered on | Recorded in the repository's own `Chat.md`; not driven live in this session | 2026-08-22 |
