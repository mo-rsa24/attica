# 🌍 Marketplace resource

A marketplace resource is **anything an organizer can book for a window of time**. A venue, an
artist, or a service provider. It is the one idea that makes the rest of Attica readable: three
commercially different things are one bookable thing, so searching, availability, requesting and
booking are written once instead of three times.

If you read nothing else in this folder, read this file. Everything in `scheduling` talks to
resources and never to venues, artists or vendors directly.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What a marketplace resource is](#what-a-marketplace-resource-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-marketplace-resource-is) ➡️

- **resource**: the bookable thing, whichever of the three kinds it is. Used on its own throughout
  the scheduling code to mean a marketplace resource.
- **linked entity**: the venue, artist or vendor record a resource stands for. A resource has
  exactly one, or none.
- **owner**: the user account that controls the resource and answers its booking requests.

## What a marketplace resource is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**One row for one bookable thing, carrying which kind it is and who owns it.** ✅

The row holds a `resource_type` of `venue`, `artist` or `vendor`, a `display_name`, a `timezone`,
a city and country, and an `is_active` flag. Those are the things every bookable thing has
regardless of kind, and they are all the scheduling side needs.

**It points at exactly one detailed record, and the database refuses more.** ✅

Three nullable one-to-one links hang off it: `venue` to a
[Location](venue.md#what-a-venue-is), `artist` to an [Artist](artist.md#what-an-artist-is),
`vendor` to a [Vendor](vendor.md#what-a-vendor-is). The model's `clean()` raises a validation error
if more than one is set, and raises again if the link does not match the `resource_type`. So an
artist resource cannot be secretly pointing at a venue.

**All three links may be empty.** 🔍

Nothing forces a resource to have a linked entity. A resource with a `display_name`, a type and no
link is legal, and would be a bookable thing with no profile behind it. Whether that is intended or
an oversight was not established.

**The timezone lives here, not on the underlying venue or artist.** ✅

Each resource carries its own `timezone`, defaulting to `UTC`. Availability windows are meaningful
only against it, which is why it sits on the row that availability attaches to.

## Why the project cares

Navigation: ⬅️ [What a marketplace resource is](#what-a-marketplace-resource-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**It is what makes one search return venues, artists and caterers together.** 🔍

An organizer looking for a free Saturday does not want three separate searches. Because
availability, slots and bookings all attach to the resource rather than to the three underlying
tables, one query covers everything bookable.

**It is why the booking engine was worth building once.** ✅

Availability rules, exceptions, materialized slots, checkout sessions, booking requests, bookings,
calendar events and conflict incidents are all defined against a resource. Had the three kinds
stayed separate, each of those would exist three times, and the [double-booking](../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub> guarantee would
have to hold in three places.

**It is the seam where the marketplace half meets the profile half.** 🔍

Everything about *who a provider is* (their posts, their portfolio, their followers, their reviews)
lives on the venue, artist or vendor record. Everything about *when they can be booked* lives on
the resource. The one-to-one link is the join between the social product and the scheduling
product.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `resource_type` | which of the three kinds this is | `venue` (one of exactly three) | [Dictionary § resource_type](../data/02-dictionary.md#resource_type) |
| `display_name` | what an organizer sees in a search result | `FNB Stadium` (example) | [Dictionary § display_name](../data/02-dictionary.md#display_name) |
| `timezone` | the zone every availability window on this resource is read in | `Africa/Johannesburg` (example; the field defaults to `UTC`) | [Dictionary § timezone](../data/02-dictionary.md#timezone) |
| `is_active` | whether this resource appears in searches at all | `true` | [Dictionary § is_active](../data/02-dictionary.md#is_active) |
| `owner_id` | the user account that answers this resource's booking requests | `21` (example) | [Dictionary § owner_id](../data/02-dictionary.md#owner_id) |
| `venue_id`, `artist_id`, `vendor_id` | the linked entity; at most one is set | `venue_id = 7`, others null (example) | [Dictionary § linked entity](../data/02-dictionary.md#venue_id-artist_id-vendor_id) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**Looking for bookings on the venue, the artist or the vendor table.** ✅

They are not there. A booking points at a resource, and the resource points at the venue. Joining
`locations_location` straight to anything in `scheduling` finds nothing, and the natural next move
(assuming bookings are not implemented) is wrong.

**Assuming `owner` is the same as the linked entity's own user.** 🔍

A resource's `owner` is a [foreign key](../../../../Obsidian/Information%20Technology/Database%20Systems/Foreign%20Key.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=105 "Database systems textbook, section 3-2b, Types of keys, Defines the foreign key on Figure 3.2's rows: VEND_CODE, the primary key of VENDOR, placed in PRODUCT..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=106 "Database systems textbook, section 3-3, Integrity rules, Table 3.4's entity and referential integrity rules, worked on the CUSTOMER and AGENT tables of Figur..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=283 "Database systems textbook, section 7-2, Data definition commands, The foreign key in SQL: 'FOREIGN KEY (V_CODE) REFERENCES VENDOR ON UPDATE CASCADE' on PRODU..."), [▶1](https://www.youtube.com/watch?v=PQcIfqE85Co&t=159s "Hussein Nasser, Primary Key vs Secondary Key - What you probably didn't know, Primary keys and clustering, 2:39 to 8:01, What a primary key does to how rows ..."), [▶2](https://www.youtube.com/watch?v=5kiMg7GXAsY&t=79s "CockroachDB, What is a Foreign Key Constraint? Understanding Primary & Foreign Keys, What is a foreign key?, 1:19 to 2:02, The foreign key defined, after a c..."), [◆](../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/04-the-entity-diagram.md "The entity diagram from sentence tests, the foreign key on the many side, the optional relationship drawn, ai-engineering/one-business-end-to-end, plan 04. W...")</sub> in its own right. Nothing in the model constrains it to match
the user who owns the underlying venue or artist record. Whether those can diverge in practice was
not checked, and code that assumes they cannot is making an unenforced assumption.

**Reading `resource_type` as decorative.** ✅

It is load-bearing twice over: `clean()` validates the link against it, and the model's own index
is on `(resource_type, is_active)`. A row whose type disagrees with its link cannot be saved
through a path that calls `clean()`, but Django does not call `clean()` on `save()`, so a direct
`objects.create()` bypasses the check entirely.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| The three resource types and the exactly-one-link rule | Read `backend/main/scheduling/models.py:14-76`, including `clean()` | 2026-08-22 |
| Everything in scheduling attaches to the resource | Read `backend/main/scheduling/models.py` in full, 16 models | 2026-08-22 |
| The index is on `(resource_type, is_active)` and `(owner, is_active)` | Read the model's `Meta.indexes` | 2026-08-22 |
| Django does not call `clean()` on `save()` | General Django behaviour, not specific to this repo. Not probed here | 2026-08-22 |
| Whether a resource may have no linked entity | Read the schema: all three links are `null=True, blank=True`. Intent not established | 2026-08-22 |
