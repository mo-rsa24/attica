# 🌍 Artist

An artist is **a performer an organizer books for an event**: a musician, a DJ, a speaker, a
dancer. On Attica they are one of the three things that can be booked, and the one whose
discovery is most social: organizers find performers by seeing their work, not by filtering a list.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What an artist is](#what-an-artist-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-an-artist-is) ➡️

- **booking fee**: what the artist charges to perform, either a single figure or a range.
- **portfolio item**: a piece of past work an artist shows to be found and judged by.

## What an artist is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**A profile row: name, biography, genres, a rating, and what they charge.** ✅

The fee can be a single `booking_fee` or a `booking_fee_min` and `booking_fee_max` range, which is
how most performers actually price. There is also a `general_ticket_price`, for artists who
headline rather than support.

**They carry their own touring information.** ✅

`tour_start_date`, `tour_end_date`, `tour_cities` and `tour_clubs`. An artist on tour is
findable by where they already are, which is a different question from whether they are free.

**They are followed, not just booked.** ✅

`Follow` joins a user to an artist, one row per follow, uniqueness enforced. This is the social
half of the product: an organizer who follows an artist sees their posts.

**They publish posts and portfolio items.** ✅

`ArtistPost` and `ArtistPortfolioItem`. Both exist so an artist can be discovered by their work
rather than by a search filter.

## Why the project cares

Navigation: ⬅️ [What an artist is](#what-an-artist-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**Booking a performer is the transaction that most needs negotiation.** ✍️

A venue has a price. A performer has a price that depends on the date, the audience, the other acts
and how much they want the gig. That is why the [bid](chat-room.md#what-a-bid-is) exists, and
artists are its main subject.

**Artists are the reason the social layer is not decoration.** ✍️

Discovery through posts and follows rather than through search is the difference between Attica and
a directory. See [what working means](../purpose/03-what-working-means.md#what-a-good-result-looks-like).

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `genres` | what kind of act this is | `Amapiano, House` (example; free text, not a list) | [Dictionary § genres](../data/02-dictionary.md#genres) |
| `booking_fee_min`, `booking_fee_max` | the range they charge | `15000.00` to `40000.00` (example) | [Dictionary § booking_fee](../data/02-dictionary.md#booking_fee-booking_fee_min-booking_fee_max) |
| `rating` | their average review score | `4.50` (example; defaults to `0.0`) | [Dictionary § rating](../data/02-dictionary.md#rating) |
| `is_popular` | whether they are surfaced as popular | `false` | [Dictionary § is_popular](../data/02-dictionary.md#is_popular) |
| `availability` | a JSON map of dates to states | `{"2026-09-14": "unavailable"}` (example) | [Dictionary § availability](../data/02-dictionary.md#availability-artist) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**`Artist.availability` is a second, unrelated availability system.** ✅

It is a `JSONField` mapping dates to strings, with a docstring example of
`{"2024-07-25": "unavailable"}`. It has nothing to do with the
[availability rules and slots](availability.md#what-availability-is) in `scheduling`, which is what
the booking engine actually reads. Two answers to "when is this artist free" exist, in two places,
with no mechanism keeping them in agreement.

**An artist has two [foreign keys](../../../../Obsidian/Information%20Technology/Database%20Systems/Foreign%20Key.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=437 "Systems analysis and design, chapter 11, Relational databases, Works it on real rows: Cust ID is the primary key of a Customer table and a foreign key in an ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=445 "Systems analysis and design, chapter 11, Moving from logical to physical data models, Adding primary keys (unique per row, a system-generated `cust_id` where..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=187 "System design interview, chapter 12, Data models, A chat system's message tables: `message_id` as the primary key for one-to-one chat, and the composite prim..."), [▶1](https://www.youtube.com/watch?v=PQcIfqE85Co&t=159s "Hussein Nasser, Primary Key vs Secondary Key - What you probably didn't know, Primary keys and clustering, 2:39 to 8:01, What a primary key does to how rows ..."), [▶2](https://www.youtube.com/watch?v=5kiMg7GXAsY&t=79s "CockroachDB, What is a Foreign Key Constraint? Understanding Primary & Foreign Keys, What is a foreign key?, 1:19 to 2:02, The foreign key defined, after a c..."), [◆](../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/04-the-entity-diagram.md "The entity diagram from sentence tests, the foreign key on the many side, the optional relationship drawn, ai-engineering/one-business-end-to-end, plan 04. W...")</sub> to the user model, both required.** ✅

`owner` and `user`, with different related names, both non-nullable, both pointing at
`CustomUser`. Nothing in the model says how they differ or enforces any relationship between them.

**`genres` is free text, not a list.** ✅

A `CharField(max_length=255)`. Filtering by genre means string matching, and two artists in the
same genre may have spelled it differently.

**Being an artist and being a bookable resource are separate rows.** ✅

The `Artist` row is the profile. Booking goes through a
[marketplace resource](marketplace-resource.md#what-a-marketplace-resource-is) linked to it. An
artist with no resource has a profile and cannot be booked.

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| All artist fields, including the two user [foreign keys](../../../../Obsidian/Information%20Technology/Database%20Systems/Foreign%20Key.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=437 "Systems analysis and design, chapter 11, Relational databases, Works it on real rows: Cust ID is the primary key of a Customer table and a foreign key in an ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=445 "Systems analysis and design, chapter 11, Moving from logical to physical data models, Adding primary keys (unique per row, a system-generated `cust_id` where..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=187 "System design interview, chapter 12, Data models, A chat system's message tables: `message_id` as the primary key for one-to-one chat, and the composite prim..."), [▶1](https://www.youtube.com/watch?v=PQcIfqE85Co&t=159s "Hussein Nasser, Primary Key vs Secondary Key - What you probably didn't know, Primary keys and clustering, 2:39 to 8:01, What a primary key does to how rows ..."), [▶2](https://www.youtube.com/watch?v=5kiMg7GXAsY&t=79s "CockroachDB, What is a Foreign Key Constraint? Understanding Primary & Foreign Keys, What is a foreign key?, 1:19 to 2:02, The foreign key defined, after a c..."), [◆](../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/04-the-entity-diagram.md "The entity diagram from sentence tests, the foreign key on the many side, the optional relationship drawn, ai-engineering/one-business-end-to-end, plan 04. W...")</sub> | Read `backend/main/artists/models.py:5-36` | 2026-08-22 |
| `availability` is a JSON date map, separate from scheduling | Read the field and its `help_text`; compared against `scheduling/models.py:133-253` | 2026-08-22 |
| `Follow` enforces one follow per user per artist | Read `backend/main/artists/models.py:52-64`, `unique_together` | 2026-08-22 |
| Which of `owner` and `user` is authoritative | Not established. Nothing in the model or its docstring says | 2026-08-22 |
