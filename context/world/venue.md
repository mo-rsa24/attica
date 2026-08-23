# 🌍 Venue

A venue is **the place an event happens**: a hall, a stadium, a garden, a studio. In the database
it is a `Location`, and it is the richest of the three bookable kinds, because a place has physical
properties (capacity, parking, wheelchair access, a map position) that a performer or a caterer
does not.

## Table of contents

- [Words this file uses](#words-this-file-uses)
- [What a venue is](#what-a-venue-is)
- [Why the project cares](#why-the-project-cares)
- [How it shows up in the data](#how-it-shows-up-in-the-data)
- [What people get wrong](#what-people-get-wrong)
- [Where this came from](#where-this-came-from)

## Words this file uses

Navigation: 📋 [TOC](#table-of-contents) | [Next](#what-a-venue-is) ➡️

- **agent**: the person who handles enquiries for a venue, who may not be the account that owns it.
- **variable pricing**: a venue that quotes per enquiry rather than publishing a price.
- **amenity**: a facility the venue has, such as parking or a bar.

## What a venue is

Navigation: ⬅️ [Words this file uses](#words-this-file-uses) | 📋 [TOC](#table-of-contents) | [Next](#why-the-project-cares) ➡️

**A place with a name, an address, a capacity and a price.** ✅

Plus a rating, images, an optional virtual tour link, and a latitude and longitude so it can be put
on a map. Capacity is required, which makes sense: it is the first thing an organizer filters on.

**Some venues do not have a price, and the model says so explicitly.** ✅

`has_variable_pricing` marks venues that quote per enquiry. There are also
`budget_estimate_min` and `budget_estimate_max` for giving an organizer a range without committing.

**Venues are approved before they are live.** ✅

`is_approved` defaults to `false`. Someone lets a venue onto the platform; it does not list itself.

**A venue carries an agent, who may not be the owner.** ✅

`agent` is a foreign key to a user, alongside `agent_name`, `agent_avatar_url` and
`agent_organization` as plain text. So the contact person can be recorded even when they have no
account.

**It has physical accessibility and facility detail.** ✅

`parking_info`, `is_wheelchair_accessible`, and a many-to-many to `Amenity`. Also `FloorPlan` and
`Feature` as separate models, and a `WaitlistEntry` for when a venue is taken.

## Why the project cares

Navigation: ⬅️ [What a venue is](#what-a-venue-is) | 📋 [TOC](#table-of-contents) | [Next](#how-it-shows-up-in-the-data) ➡️

**The venue is usually the first booking and it constrains everything after it.** ✍️

Date, guest count and budget are largely settled once the place is. An organizer who has a venue
has an event; an organizer who does not has an intention.

**An empty Saturday is the seller-side problem the platform exists to solve.** ✍️

A venue with unsold dates has no way to reach the people looking for exactly those dates. That is
the same disintegration described in [the problem](../purpose/01-the-problem.md#what-it-costs-them-today),
seen from the other side.

## How it shows up in the data

Navigation: ⬅️ [Why the project cares](#why-the-project-cares) | 📋 [TOC](#table-of-contents) | [Next](#what-people-get-wrong) ➡️

| Column | Stands for | Example | Entry |
|---|---|---|---|
| `capacity` | how many people the place holds | `2000` (example; required) | [Dictionary § capacity](../data/02-dictionary.md#capacity) |
| `is_approved` | whether this venue is live on the platform | `false` (the default) | [Dictionary § is_approved](../data/02-dictionary.md#is_approved) |
| `has_variable_pricing` | this venue quotes rather than publishes a price | `false` | [Dictionary § has_variable_pricing](../data/02-dictionary.md#has_variable_pricing) |
| `latitude`, `longitude` | where it is, for the map | `-26.234813`, `27.982273` (example) | [Dictionary § latitude / longitude](../data/02-dictionary.md#latitude-longitude) |
| `preferred_dates` | date ranges the venue would rather fill | `[{"start": "2026-12-20", "end": "2026-12-25"}]` (example) | [Dictionary § preferred_dates](../data/02-dictionary.md#preferred_dates) |

## What people get wrong

Navigation: ⬅️ [How it shows up in the data](#how-it-shows-up-in-the-data) | 📋 [TOC](#table-of-contents) | [Next](#where-this-came-from) ➡️

**The model is called `Location`, not `Venue`.** ✅

`locations.Location` is the venue. `locations.VenueBooking` also exists and is vestigial; see
[Booking § What people get wrong](booking.md#what-people-get-wrong).

**`Location.search_vector` is a PostgreSQL field on a SQLite database.** ✅

It is a `SearchVectorField` from `django.contrib.postgres`. This project runs on SQLite (see
[../../environment/overview.md](../../environment/overview.md)). Full-text search built on that field cannot work as
written on the current database.

**An event records its venue twice, in two different ways.** ✅

`Event.location` is a foreign key to `Location`, and `Event.venue` is a free-text `CharField`.
Both exist on the same row and nothing keeps them consistent.

**The `agent` help text names a real person.** ✅

The field's `help_text` reads "The primary contact or agent for this venue (e.g., Shaun Bird)". A
real name in a schema docstring is a small privacy and maintenance issue, worth replacing with a
shaped example that belongs to nobody.

**A venue is not bookable until a resource points at it.** ✅

Same as for artists: the `Location` row is the listing, and booking goes through a linked
[marketplace resource](marketplace-resource.md#what-a-marketplace-resource-is).

## Where this came from

Navigation: ⬅️ [What people get wrong](#what-people-get-wrong) | 📋 [TOC](#table-of-contents)

| What | How it was established | When |
|---|---|---|
| Venue fields, including approval, agent and accessibility | Read `backend/main/locations/models.py:14-68` | 2026-08-22 |
| `search_vector` is a `SearchVectorField` | Read the same block; the database is SQLite per `backend/main/main/settings.py:156-160` | 2026-08-22 |
| `Event` carries both `location` and `venue` | Read `backend/main/events/models.py:24,31` | 2026-08-22 |
| Eleven models live in the `locations` app | Counted classes in `backend/main/locations/models.py` | 2026-08-22 |
| Who performs the approval, and by what process | Not established | 2026-08-22 |
