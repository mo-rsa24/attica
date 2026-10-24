# 🌍 Vendor (service provider)

A vendor is **a business selling a service into an event**: catering, sound, décor, photography,
security, transport. They are the third bookable kind, and the most varied, because "a service"
covers things that are priced, delivered and scheduled in completely different ways.

The product calls this role a service provider; the database calls the model `Vendor`. Both words
appear and they mean the same thing.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What a vendor is](#what-a-vendor-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-vendor-is) ➡️

- **category**: the kind of service sold, such as catering or sound.
- **service**: a specific offering a vendor sells, as opposed to the vendor themselves.
- **vendor post**: something a vendor publishes to be discovered, which an organizer can add to
  their cart.

## What a vendor is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**A business profile: name, category, description, price range, rating and a portfolio image.** ✅

The category is a [foreign key](../../../../Obsidian/Information%20Technology/Database%20Systems/Foreign%20Key.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=437 "Systems analysis and design, chapter 11, Relational databases, Works it on real rows: Cust ID is the primary key of a Customer table and a foreign key in an ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=445 "Systems analysis and design, chapter 11, Moving from logical to physical data models, Adding primary keys (unique per row, a system-generated `cust_id` where..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=187 "System design interview, chapter 12, Data models, A chat system's message tables: `message_id` as the primary key for one-to-one chat, and the composite prim..."), [▶1](https://www.youtube.com/watch?v=PQcIfqE85Co&t=159s "Hussein Nasser, Primary Key vs Secondary Key - What you probably didn't know, Primary keys and clustering, 2:39 to 8:01, What a primary key does to how rows ..."), [▶2](https://www.youtube.com/watch?v=5kiMg7GXAsY&t=79s "CockroachDB, What is a Foreign Key Constraint? Understanding Primary & Foreign Keys, What is a foreign key?, 1:19 to 2:02, The foreign key defined, after a c..."), [◆](../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/04-the-entity-diagram.md "The entity diagram from sentence tests, the foreign key on the many side, the optional relationship drawn, ai-engineering/one-business-end-to-end, plan 04. W...")</sub>, so the list of service kinds is data rather than code. `price_range`
is a single decimal despite the name.

**A vendor sells named services, and those are separate rows.** ✅

`Service` is its own model with its own images. So "Thabo's Catering" is the vendor and "buffet for
150" is a service.

**Their rating is computed from their services, not set by hand.** ✅

`update_rating()` averages the ratings of the vendor's services and writes the result back. So the
number on a vendor is derived, and stale until that method runs.

**The vendors app carries fourteen models.** ✅

Including its own `Booking`, `BookingRequest`, `Review`, `Reservation`, `Policy` and `Amenity`,
several of which duplicate models in other apps. See what people get wrong, below.

## Why the project cares

Navigation: ⬅️ [What a vendor is](#what-a-vendor-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**Services are the long tail that makes an event actually happen.** ✍️

An organizer books one venue and one or two performers, and then five or six services. Volume of
coordination sits here, which is where the spreadsheet gets long and the disintegration hurts most.

**The cart exists for vendors specifically.** ✅

`CartItem` points at a `VendorPost` and an `Event`, not at a ticket. So the shopping-cart metaphor
in this system is for assembling services onto an event, not for buying admission.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `category_id` | which kind of service this vendor sells | a row in `vendors_category` (example) | [Dictionary § category_id](../data/02-dictionary.md#category_id) |
| `price_range` | a single price figure, despite the name | `12500.00` (example) | [Dictionary § price_range](../data/02-dictionary.md#price_range) |
| `rating` | average of this vendor's service ratings | `4.20` (example; defaults to `0.0`) | [Dictionary § rating](../data/02-dictionary.md#rating) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**`price_range` is one number, not a range.** ✅

A `DecimalField(max_digits=10, decimal_places=2)`. The name says range and the type says a single
price. Anything reading it as a bound will be wrong.

**The vendors app duplicates several concepts that live elsewhere.** ✅

`vendors.Booking` and `vendors.BookingRequest` are vestigial duplicates of the live scheduling
models. `vendors.Amenity` duplicates `locations.Amenity`. `vendors.Review` is one of three review
models (`scheduling.Review` and `locations.LocationReview` are the others). Only the scheduling ones
are wired into the booking engine.

**Eight permission checks in `vendors/views.py` reference a constant that does not exist.** ✅

They write `Role.SERVICE_PROVIDER`, which is on `Role.Names`, not on `Role`. Verified live:
`hasattr(Role, "SERVICE_PROVIDER")` returns `False`, so those lines raise `AttributeError`. See
[Organizer § What people get wrong](organizer.md#what-people-get-wrong).

**`Vendor.user` is nullable, so a vendor may belong to no account.** ✅

A one-to-one to `CustomUser` with `null=True, blank=True`. A vendor row with no user cannot log in
to answer anything, which matters for seeded demonstration data.

**A vendor is not bookable until a resource points at it.** ✅

Same rule as venues and artists.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| Vendor fields, including `price_range` as a single decimal and nullable `user` | Read `backend/main/vendors/models.py:16-38` | 2026-08-22 |
| `update_rating()` averages service ratings | Read the same block | 2026-08-22 |
| The vendors app carries 14 models, several duplicating other apps | Counted classes in `backend/main/vendors/models.py` | 2026-08-22 |
| `CartItem` points at a `VendorPost` and an `Event` | Read `backend/main/cart/models.py:9-20` | 2026-08-22 |
| Eight `Role.SERVICE_PROVIDER` call sites in `vendors/views.py` | Grepped the file; ran `hasattr(Role, "SERVICE_PROVIDER")` in the Django shell | 2026-08-22 |
| Whether the vendor duplicates are intentional | Not established. On the [Still open list](../00-INDEX.md#still-open) | 2026-08-22 |
