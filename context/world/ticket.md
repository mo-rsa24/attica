# 🌍 Ticket

A ticket is **a guest's admission to a published event**. It is the object the whole
Ticketmaster half of the ambition rests on, and it is the least built thing in the system.

This file is short because the model is short, and saying so plainly is more useful than
elaborating four fields into a page.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What a ticket is](#what-a-ticket-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-ticket-is) ➡️

- **buyer**: the user account that holds the ticket. Called a ticket buyer or an attendee
  depending on which role list you read.
- **reserved**: held but not paid for.

## What a ticket is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**One row: which event, which buyer, how many, and whether it is paid.** ✅

That is the entire model. `payment_status` is `reserved` or `paid`, defaulting to `reserved`.

**It carries no price.** ✅

The prices live on the [event](event.md#what-an-event-is) (`base_price`, `tiered_prices`). The
ticket does not record what was actually charged, so a later price change on the event leaves no
trace of what a past buyer paid.

**It does not record which tier was bought.** ✅

An event can define named tiers such as general and VIP. A ticket has `quantity` and nothing
naming which tier the quantity is of.

## Why the project cares

Navigation: ⬅️ [What a ticket is](#what-a-ticket-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**It is half the stated ambition and it is the half that is not built.** ✍️

Attica is meant to be Ticketmaster crossed with Airbnb. The Airbnb half (finding and booking
providers) has 16 models behind it. This half has one, with four fields.

**It is the only place a guest appears in the system.** 🔍

The organizer, the artist, the venue and the vendor all have profiles, posts, ratings and
calendars. The guest has a row saying they hold two admissions.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `quantity` | how many admissions this row covers | `2` (example; defaults to 1) | [Dictionary § quantity](../data/02-dictionary.md#quantity) |
| `payment_status` | whether it has been paid for | `reserved` (one of two) | [Dictionary § payment_status](../data/02-dictionary.md#payment_status) |
| `buyer_id` | the user holding the ticket | `48` (example) | [Dictionary § buyer_id](../data/02-dictionary.md#buyer_id) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Reading `payment_status = paid` as meaning money changed hands.** ✅

No payment integration exists in this repository. The field can be set to `paid` and nothing in the
system can take a payment to justify it. `.env.example` carries an empty `STRIPE_TEST_KEY` and
`CLAUDE.md` names Stripe as future work.

**Expecting the `checkout` app to handle ticket purchase.** ✅

`checkout/models.py` is empty. The app has views, URLs and templates but no models of its own.
Separately, `scheduling.CheckoutSession` exists and is about holding a provider booking while
payment resolves, not about buying tickets.

**Expecting the cart to hold tickets.** ✅

`CartItem` points at a `VendorPost` and an `Event`. The cart is for assembling vendor services onto
an event, not for buying admission.

**Assuming a ticket limits itself.** 🔍

`Event.max_tickets_per_buyer` defaults to 10. Nothing in the `Ticket` model enforces it; whether
anything else does was not checked.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| The entire `Ticket` model, four fields, no price, no tier | Read `backend/main/tickets/models.py` in full, 12 lines | 2026-08-22 |
| `checkout/models.py` holds no models | Read the file, 3 lines; listed the app directory | 2026-08-22 |
| `CartItem` points at a `VendorPost`, not a ticket | Read `backend/main/cart/models.py:9-20` | 2026-08-22 |
| No payment integration exists | Searched the tree; `.env.example` carries an empty `STRIPE_TEST_KEY` | 2026-08-22 |
| Whether `max_tickets_per_buyer` is enforced anywhere | Not checked | 2026-08-22 |
