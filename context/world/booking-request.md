# 🌍 Booking request

A booking request is **an organizer asking a provider for a window**. It is the ask; a
[booking](booking.md#what-a-booking-is) is what exists after the provider says yes.

It is the object that carries a negotiation: it can be countered, withdrawn, or left to expire, and
its status is where the state of that conversation lives.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What a booking request is](#what-a-booking-request-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-booking-request-is) ➡️

- **counter-propose**: the provider answering with different terms rather than accepting or
  declining.
- **withdraw**: the organizer taking the ask back before it is answered.
- **expire**: the request lapsing because nobody answered in time.

## What a booking request is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**One row per ask: who is asking, of which resource, for what window, for how many people.** ✅

It names the organizer, the [marketplace
resource](marketplace-resource.md#what-a-marketplace-resource-is), a `requested_start_at` and
`requested_end_at`, an `attendee_count`, and a free-text `message`. The provider's reply comes back
in `provider_message`.

**Its status is a seven-value conversation, not a yes or no.** ✅

`draft`, `pending`, `approved`, `declined`, `counter_proposed`, `withdrawn`, `expired`. It starts at
`pending`. That value list is the real shape of the negotiation, and it is worth reading before
assuming a request is binary.

**It can hang off an event or off a draft, and neither is required.** ✅

Two nullable foreign keys: `event` and `event_draft`. This is what lets an organizer secure
providers while the event is still being built. See [Event
draft](event-draft.md#what-an-event-draft-is). Nothing in the model requires one of the two to be
set, so a request belonging to neither is legal.

**It can expire on its own.** ✅

`expires_at` is a nullable datetime, and `expire_pending_booking_requests` is a management command.
An unanswered request is not left pending forever, provided someone runs the command.

📊 Drawn in [Seven states, and the provider owns five of them](artifacts/scenes/scheduling-process-flows/figure-explainer.md#figure-2-seven-states-and-the-provider-owns-five-of-them).

## Why the project cares

Navigation: ⬅️ [What a booking request is](#what-a-booking-request-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**It is where the WhatsApp thread was supposed to go.** ✍️

"Are you free on the 14th, for about 200 people" is currently a message in one of five apps, and
the answer is a message back that nobody else can see. The request makes that exchange a row with a
state, visible to both sides and to the event.

**Its status is the honest answer to "where are we".** 🔍

An organizer looking at an event wants to know which providers are confirmed, which are still
thinking, and which said no. That is a query over request statuses, and it is the thing a
spreadsheet does badly.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `status` | where this ask has got to | `pending` (one of seven) | [Dictionary § status](../data/02-dictionary.md#status-bookingrequest) |
| `requested_start_at` | the window the organizer wants, absolute time | `2026-09-14T18:00:00Z` (example) | [Dictionary § requested_start_at](../data/02-dictionary.md#requested_start_at-requested_end_at) |
| `attendee_count` | how many people the organizer expects | `200` (example; defaults to 1) | [Dictionary § attendee_count](../data/02-dictionary.md#attendee_count) |
| `event_id`, `event_draft_id` | what this ask belongs to; both may be null | `event_draft_id = 30`, `event_id` null (example) | [Dictionary § event_id / event_draft_id](../data/02-dictionary.md#event_id-event_draft_id) |
| `expires_at` | when this lapses if unanswered | `null` | [Dictionary § expires_at](../data/02-dictionary.md#expires_at) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Confusing it with `vendors.BookingRequest`, which is a different, vestigial table.** ✅

The live one is `scheduling.BookingRequest`. See [Booking § What people get
wrong](booking.md#what-people-get-wrong) for the full list of duplicated booking models.

**Reading `approved` as meaning a booking exists.** 🔍

Approval is a status on the request. Whether a `Booking` row follows immediately, or after a
checkout session resolves, depends on the path taken. The two are separate rows and a request can
be approved without the booking being final.

**Assuming a request always belongs to an event.** ✅

Both `event` and `event_draft` are nullable. Counting requests per event misses everything still
attached to a draft, which is most of them during planning.

**Missing that an unanswered request expires silently.** ✅

Expiry is a management command, not a database default. If nobody runs
`expire_pending_booking_requests`, requests stay `pending` past their `expires_at`, and the status
stops meaning what it says.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| The seven statuses and the default of `pending` | Read `backend/main/scheduling/models.py:300-341` | 2026-08-22 |
| Both `event` and `event_draft` are nullable | Read the same block | 2026-08-22 |
| Expiry is a management command | Listed `backend/main/scheduling/management/commands/`; `expire_pending_booking_requests.py` present | 2026-08-22 |
| The request creation path is `create_request` | Read `backend/main/scheduling/services.py:386` | 2026-08-22 |
| Whether approval creates a booking directly | Not established; the two paths were not driven | 2026-08-22 |
