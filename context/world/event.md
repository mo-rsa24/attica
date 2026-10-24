# 🌍 Event

An event is **the occasion everything else on Attica exists to serve**: a wedding, a concert, a
conference, a launch. Once published it is the thing guests see and buy tickets to. Before publish
it is an [event draft](event-draft.md#what-an-event-draft-is), which is a separate row in a
separate table.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What an event is](#what-an-event-is)
- [What it looks like](#what-it-looks-like)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-an-event-is) ➡️

- **listing**: the published event as an attendee sees it.
- **tiered pricing**: several named ticket levels at different prices, such as general and VIP.
- **access type**: whether anyone can attend or only invited people.

## What an event is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#what-it-looks-like) ➡️

**The occasion: a name, a date, a place, a budget, an expected guest count and a theme.** ✅

Plus a category (`Music`, `Food & Drink`), a poster image and a banner. These are the fields an
organizer fills in the wizard's early steps.

**It carries its own ticketing terms.** ✅

`base_price`, a `currency` defaulting to `ZAR`, `tiered_prices` as a JSON list of named levels with
prices and quantities, a `refund_policy`, and `max_tickets_per_buyer` defaulting to 10.

**It carries seating and access rules.** ✅

`is_seated` with an uploadable `seating_chart` file, `is_age_restricted`, an `access_type` of
`public` or `private` (invite-only), and `custom_questions` as JSON for things the organizer wants
to ask at registration, such as a shirt size.

**Amenities chosen in the wizard are a JSON list.** ✅

`features`, holding names such as food trucks, VIP area or bar. Not a relation to the `Amenity`
models that exist in two other apps.

## What it looks like

Navigation: ⬅️ [What an event is](#what-an-event-is) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

> 📷 **Picture wanted**: a published event listing as an attendee sees it, showing the poster, date,
> venue and ticket tiers. Save as `images/world/01-event-listing.png`.

## Why the project cares

Navigation: ⬅️ [What it looks like](#what-it-looks-like) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**It is what holds the state that currently lives in the organizer's head.** ✍️

Every booking, every request and every bid hangs off an event. That is what makes "where are we" a
query rather than a memory exercise, which is the whole point of the product.

**It is the join between the two halves of the ambition.** 🔍

The marketplace half books providers onto it. The ticketing half sells admission to it. The event
row is where those meet, and it carries fields for both even though only one half is built. See
[what working means](../purpose/03-what-working-means.md#what-this-cannot-tell-you).

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `status` | whether the listing is live | `draft` (one of two) | [Dictionary § status](../data/02-dictionary.md#status-event) |
| `currency` | what the prices on this event are in | `ZAR` (the default) | [Dictionary § currency](../data/02-dictionary.md#currency) |
| `tiered_prices` | named ticket levels and their prices | `[{"name": "VIP", "price": 500.00, "quantity": 50}]` (example) | [Dictionary § tiered_prices](../data/02-dictionary.md#tiered_prices) |
| `access_type` | open to anyone, or invite only | `public` (one of two) | [Dictionary § access_type](../data/02-dictionary.md#access_type) |
| `features` | amenities chosen in the wizard | `["Bar Available", "VIP Area"]` (example) | [Dictionary § features](../data/02-dictionary.md#features) |
| `guest_count` | how many people the organizer expects | `200` (example) | [Dictionary § guest_count](../data/02-dictionary.md#guest_count) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Three separate [foreign keys](../../../../Obsidian/Information%20Technology/Database%20Systems/Foreign%20Key.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=105 "Database systems textbook, section 3-2b, Types of keys, Defines the foreign key on Figure 3.2's rows: VEND_CODE, the primary key of VENDOR, placed in PRODUCT..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=106 "Database systems textbook, section 3-3, Integrity rules, Table 3.4's entity and referential integrity rules, worked on the CUSTOMER and AGENT tables of Figur..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=283 "Database systems textbook, section 7-2, Data definition commands, The foreign key in SQL: 'FOREIGN KEY (V_CODE) REFERENCES VENDOR ON UPDATE CASCADE' on PRODU..."), [▶1](https://www.youtube.com/watch?v=PQcIfqE85Co&t=159s "Hussein Nasser, Primary Key vs Secondary Key - What you probably didn't know, Primary keys and clustering, 2:39 to 8:01, What a primary key does to how rows ..."), [▶2](https://www.youtube.com/watch?v=5kiMg7GXAsY&t=79s "CockroachDB, What is a Foreign Key Constraint? Understanding Primary & Foreign Keys, What is a foreign key?, 1:19 to 2:02, The foreign key defined, after a c..."), [◆](../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/04-the-entity-diagram.md "The entity diagram from sentence tests, the foreign key on the many side, the optional relationship drawn, ai-engineering/one-business-end-to-end, plan 04. W...")</sub> on one row point at users.** ✅

`user` (related name `events_created`), `partner_user` (`events_partnered`), and `organizer`
(`organized_events`). `organizer` is nullable while `user` is not. Which one is the real owner is
not stated anywhere, and code reading the wrong one will attribute events to the wrong person.

**The date and time fields do not agree with each other.** ✅

`date` is a `DateField`. `start_date` is a `DateTimeField`. `end_date` is a `DateField`.
`start_time` is a **`DateTimeField`**, defaulting to now. `end_time` is a `TimeField`. So a field
called `start_time` carries a full datetime and a field called `end_time` carries only a clock
time. Anything reading these as a matched pair is wrong.

**`is_draft` and `status` encode the same fact twice.** ✅

A boolean and a two-value choice field on the same row, with nothing keeping them consistent.
`EventDraft` has its own `status` as well, meaning something different again. See
[Event draft § What people get wrong](event-draft.md#what-people-get-wrong).

**`venue` is free text and `location` is a foreign key.** ✅

Both on the same row. The text one can say anything.

**`features` does not join to either `Amenity` model.** ✅

It is a JSON list of names. `locations.Amenity` and `vendors.Amenity` both exist as real tables and
neither is what this field points at.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| All event fields and their types | Read `backend/main/events/models.py:19-86` in full | 2026-08-22 |
| Three user [foreign keys](../../../../Obsidian/Information%20Technology/Database%20Systems/Foreign%20Key.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=105 "Database systems textbook, section 3-2b, Types of keys, Defines the foreign key on Figure 3.2's rows: VEND_CODE, the primary key of VENDOR, placed in PRODUCT..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=106 "Database systems textbook, section 3-3, Integrity rules, Table 3.4's entity and referential integrity rules, worked on the CUSTOMER and AGENT tables of Figur..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=283 "Database systems textbook, section 7-2, Data definition commands, The foreign key in SQL: 'FOREIGN KEY (V_CODE) REFERENCES VENDOR ON UPDATE CASCADE' on PRODU..."), [▶1](https://www.youtube.com/watch?v=PQcIfqE85Co&t=159s "Hussein Nasser, Primary Key vs Secondary Key - What you probably didn't know, Primary keys and clustering, 2:39 to 8:01, What a primary key does to how rows ..."), [▶2](https://www.youtube.com/watch?v=5kiMg7GXAsY&t=79s "CockroachDB, What is a Foreign Key Constraint? Understanding Primary & Foreign Keys, What is a foreign key?, 1:19 to 2:02, The foreign key defined, after a c..."), [◆](../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/04-the-entity-diagram.md "The entity diagram from sentence tests, the foreign key on the many side, the optional relationship drawn, ai-engineering/one-business-end-to-end, plan 04. W...")</sub>, one of them nullable | Read lines 20-23 of the same file | 2026-08-22 |
| The date and time field type mismatch | Read lines 26-30 | 2026-08-22 |
| `currency` defaults to `ZAR` | Read line 54 | 2026-08-22 |
| Which user foreign key is authoritative | Not established | 2026-08-22 |
