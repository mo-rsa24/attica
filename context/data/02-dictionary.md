# 🌍 Dictionary

One entry per field whose meaning is not obvious from its name, or whose name is misleading. Fields
that say exactly what they are (`name`, `address`, `created_at`) are not listed; listing them buries
the ones that matter.

Every example value is real-shaped and belongs to nobody.

## Table of contents

**Marketplace resource**: [`resource_type`](#resource_type) · [`display_name`](#display_name) ·
[`timezone`](#timezone) · [`is_active`](#is_active) · [`owner_id`](#owner_id) ·
[`venue_id` / `artist_id` / `vendor_id`](#venue_id-artist_id-vendor_id)

**Event draft**: [`status` (EventDraft)](#status-eventdraft) · [`current_step`](#current_step) ·
[`data`](#data) · [`organizer_id`](#organizer_id) · [`published_at`](#published_at)

**Event**: [`status` (Event)](#status-event) · [`currency`](#currency) ·
[`tiered_prices`](#tiered_prices) · [`access_type`](#access_type) · [`features`](#features) ·
[`guest_count`](#guest_count)

**Booking request**: [`status` (BookingRequest)](#status-bookingrequest) ·
[`requested_start_at` / `requested_end_at`](#requested_start_at-requested_end_at) ·
[`attendee_count`](#attendee_count) · [`event_id` / `event_draft_id`](#event_id-event_draft_id) ·
[`expires_at`](#expires_at)

**Availability**: [`weekdays`](#weekdays) ·
[`local_start_time` / `local_end_time`](#local_start_time-local_end_time) ·
[`capacity_total` / `capacity_reserved`](#capacity_total-capacity_reserved) ·
[`is_bookable`](#is_bookable)

**People and providers**: [`user_type`](#user_type) · [`roles`](#roles) · [`genres`](#genres) ·
[`booking_fee` / `booking_fee_min` / `booking_fee_max`](#booking_fee-booking_fee_min-booking_fee_max) ·
[`rating`](#rating) · [`is_popular`](#is_popular) · [`availability` (Artist)](#availability-artist) ·
[`category_id`](#category_id) · [`price_range`](#price_range)

**Venue**: [`capacity`](#capacity) · [`is_approved`](#is_approved) ·
[`has_variable_pricing`](#has_variable_pricing) · [`latitude` / `longitude`](#latitude-longitude) ·
[`preferred_dates`](#preferred_dates)

**Tickets and social**: [`quantity`](#quantity) · [`payment_status`](#payment_status) ·
[`buyer_id`](#buyer_id) · [`likes`](#likes) · [`shares_count`](#shares_count)

---

### `resource_type`

Navigation: 📋 [TOC](#table-of-contents) | [Next](#display_name) ➡️

**What it means in the world** ✅

Which of the three bookable kinds this is: a place, a performer, or a service business.

**Example** `venue` (one of exactly three: `venue`, `artist`, `vendor`)

**Type and shape** text, at most 16 characters, constrained by `TextChoices`

**Stands for** the kind of a [marketplace resource](../world/marketplace-resource.md#what-a-marketplace-resource-is)

**Watch out** it is validated against the linked entity by `clean()`, but Django does not call
`clean()` on `save()`, so a direct `objects.create()` can write a row whose type and link disagree ✅

---

### `display_name`

Navigation: ⬅️ [`resource_type`](#resource_type) | 📋 [TOC](#table-of-contents) | [Next](#timezone) ➡️

**What it means in the world** ✅

What an organizer sees in a search result. Held on the resource rather than read from the linked
venue or artist, so it can differ from that record's own name.

**Example** `FNB Stadium`

**Type and shape** text, at most 255 characters

---

### `timezone`

Navigation: ⬅️ [`display_name`](#display_name) | 📋 [TOC](#table-of-contents) | [Next](#is_active) ➡️

**What it means in the world** ✅

The zone every availability window on this resource is read in. Availability times are meaningless
without it.

**Example** `Africa/Johannesburg`. The field defaults to `UTC`, which for a South African platform
means an unedited resource is an hour off (SAST is UTC+2, with no daylight saving).

**Type and shape** text, at most 64 characters

**Watch out** a timezone is stored on the resource **and** separately on each availability rule.
Which one governs a given calculation was not established 🔍

---

### `is_active`

Navigation: ⬅️ [`timezone`](#timezone) | 📋 [TOC](#table-of-contents) | [Next](#owner_id) ➡️

**What it means in the world** ✅

Whether this resource appears in searches at all. A provider taking a break sets this false rather
than deleting anything.

**Example** `true`

**Type and shape** boolean, defaults to `true`

---

### `owner_id`

Navigation: ⬅️ [`is_active`](#is_active) | 📋 [TOC](#table-of-contents) | [Next](#venue_id-artist_id-vendor_id) ➡️

**What it means in the world** ✅

The user account that controls this resource and answers its booking requests.

**Example** `21`

**Watch out** nothing constrains it to match the user who owns the underlying venue, artist or
vendor record 🔍

---

### `venue_id`, `artist_id`, `vendor_id`

Navigation: ⬅️ [`owner_id`](#owner_id) | 📋 [TOC](#table-of-contents) | [Next](#status-eventdraft) ➡️

**What it means in the world** ✅

The detailed profile this resource stands for. At most one is set; `clean()` rejects more than one
and rejects a link that disagrees with `resource_type`.

**Example** `venue_id = 7`, the other two null

**Watch out** all three may be null, giving a bookable thing with no profile behind it. Whether that
is intended was not established 🔍

---

### `status` (EventDraft)

Navigation: ⬅️ [`venue_id`, `artist_id`, `vendor_id`](#venue_id-artist_id-vendor_id) | 📋 [TOC](#table-of-contents) | [Next](#current_step) ➡️

**What it means in the world** ✅

Whether this draft has been published yet.

**Example** `draft` (one of two: `draft`, `published`)

**Stands for** a property of the [draft](../world/event-draft.md#what-an-event-draft-is), not of the
event it produces

**Watch out** `Event` has its own `status` field with the same two values meaning something
different: whether the listing is live ✅

---

### `current_step`

Navigation: ⬅️ [`status` (EventDraft)](#status-eventdraft) | 📋 [TOC](#table-of-contents) | [Next](#data) ➡️

**What it means in the world** ✅

The wizard screen the organizer last reached, used to send them back to the right place.

**Example** `step3`

**Type and shape** free text, at most 100 characters, **with no `choices`**

**Watch out** nothing at the database level restricts it to real steps, so a typo is a legal value
and will route a returning organizer nowhere ✅

---

### `data`

Navigation: ⬅️ [`current_step`](#current_step) | 📋 [TOC](#table-of-contents) | [Next](#organizer_id) ➡️

**What it means in the world** ✅

Everything the organizer has typed into the wizard so far, held whole.

**Example** a JSON object whose shape is set by the frontend, not by the database

**Watch out** wizard fields are keys in here, not columns. A query filtering events by guest count
works against `events_event` and cannot work against a draft ✅

---

### `organizer_id`

Navigation: ⬅️ [`data`](#data) | 📋 [TOC](#table-of-contents) | [Next](#published_at) ➡️

**What it means in the world** ✅

The user building this draft.

**Example** `21`

**Watch out** `Event` has three separate user foreign keys (`user`, `partner_user`, `organizer`) and
which is authoritative is not established. The draft has only this one ✅

---

### `published_at`

Navigation: ⬅️ [`organizer_id`](#organizer_id) | 📋 [TOC](#table-of-contents) | [Next](#status-event) ➡️

**What it means in the world** ✅

When publish happened. Null until it does.

**Example** `null`

---

### `status` (Event)

Navigation: ⬅️ [`published_at`](#published_at) | 📋 [TOC](#table-of-contents) | [Next](#currency) ➡️

**What it means in the world** ✅

Whether the listing is live for other people to see.

**Example** `draft` (one of two: `draft`, `published`)

**Watch out** the same row also carries `is_draft`, a boolean encoding the same fact, with nothing
keeping the two consistent ✅

---

### `currency`

Navigation: ⬅️ [`status` (Event)](#status-event) | 📋 [TOC](#table-of-contents) | [Next](#tiered_prices) ➡️

**What it means in the world** ✅

What the prices on this event are denominated in.

**Example** `ZAR` (the default, South African rand)

**Watch out** `ChatBid.currency` defaults to `USD` instead. A bid and the event it is about can be
in different currencies with nothing reconciling them ✅

---

### `tiered_prices`

Navigation: ⬅️ [`currency`](#currency) | 📋 [TOC](#table-of-contents) | [Next](#access_type) ➡️

**What it means in the world** ✅

Named ticket levels and what each costs, for events selling more than one kind of admission.

**Example** `[{"name": "VIP", "price": 500.00, "quantity": 50}]`

**Type and shape** JSON list, nullable, shape not enforced

**Watch out** a [ticket](../world/ticket.md#what-a-ticket-is) does not record which tier was bought,
so tiers can be defined and not attributed ✅

---

### `access_type`

Navigation: ⬅️ [`tiered_prices`](#tiered_prices) | 📋 [TOC](#table-of-contents) | [Next](#features) ➡️

**What it means in the world** ✅

Whether anyone may attend or only invited people.

**Example** `public` (one of two: `public`, `private`)

---

### `features`

Navigation: ⬅️ [`access_type`](#access_type) | 📋 [TOC](#table-of-contents) | [Next](#guest_count) ➡️

**What it means in the world** ✅

Amenities the organizer selected in the wizard.

**Example** `["Bar Available", "VIP Area"]`

**Watch out** a JSON list of names. It does **not** join to `locations.Amenity` or `vendors.Amenity`,
both of which exist as real tables ✅

---

### `guest_count`

Navigation: ⬅️ [`features`](#features) | 📋 [TOC](#table-of-contents) | [Next](#status-bookingrequest) ➡️

**What it means in the world** ✅

How many people the organizer expects. Distinct from a venue's `capacity`, which is how many it can
hold, and from a booking request's `attendee_count`, which is how many that one provider is being
asked to serve.

**Example** `200`

---

### `status` (BookingRequest)

Navigation: ⬅️ [`guest_count`](#guest_count) | 📋 [TOC](#table-of-contents) | [Next](#requested_start_at-requested_end_at) ➡️

**What it means in the world** ✅

Where the ask has got to. This is a negotiation, not a yes or no.

**Example** `pending` (the default; one of seven: `draft`, `pending`, `approved`, `declined`,
`counter_proposed`, `withdrawn`, `expired`)

**Watch out** expiry is a management command, not a database default. If nobody runs
`expire_pending_booking_requests`, a request stays `pending` past its `expires_at` ✅

---

### `requested_start_at`, `requested_end_at`

Navigation: ⬅️ [`status` (BookingRequest)](#status-bookingrequest) | 📋 [TOC](#table-of-contents) | [Next](#attendee_count) ➡️

**What it means in the world** ✅

The window the organizer wants, as absolute datetimes.

**Example** `2026-09-14T18:00:00Z`

**Watch out** absolute, not local. Provider-local times live on the availability rule ✅

---

### `attendee_count`

Navigation: ⬅️ [`requested_start_at`, `requested_end_at`](#requested_start_at-requested_end_at) | 📋 [TOC](#table-of-contents) | [Next](#event_id-event_draft_id) ➡️

**What it means in the world** ✅

How many people this one provider is being asked to serve. A caterer's number and the event's total
guest count need not match.

**Example** `200` (defaults to `1`)

---

### `event_id`, `event_draft_id`

Navigation: ⬅️ [`attendee_count`](#attendee_count) | 📋 [TOC](#table-of-contents) | [Next](#expires_at) ➡️

**What it means in the world** ✅

What this request belongs to. Both are nullable, which is what lets an organizer secure providers
while the event is still being built.

**Example** `event_draft_id = 30`, `event_id` null

**Watch out** neither is required, so counting requests per event misses everything still attached
to a draft ✅

---

### `expires_at`

Navigation: ⬅️ [`event_id`, `event_draft_id`](#event_id-event_draft_id) | 📋 [TOC](#table-of-contents) | [Next](#weekdays) ➡️

**What it means in the world** ✅

When this request lapses if nobody answers.

**Example** `null`

---

### `weekdays`

Navigation: ⬅️ [`expires_at`](#expires_at) | 📋 [TOC](#table-of-contents) | [Next](#local_start_time-local_end_time) ➡️

**What it means in the world** ✅

Which days a weekly availability rule covers.

**Example** `[5, 6]`

**Type and shape** JSON list of integers 0 to 6, validated by `clean()`, required for weekly rules

**Watch out** the model does not say which integer means which day, and the convention is not
universal 🔍

---

### `local_start_time`, `local_end_time`

Navigation: ⬅️ [`weekdays`](#weekdays) | 📋 [TOC](#table-of-contents) | [Next](#capacity_total-capacity_reserved) ➡️

**What it means in the world** ✅

The daily start and end, in the rule's own timezone. `clean()` refuses an end not after the start.

**Example** `10:00:00` and `18:00:00`

---

### `capacity_total`, `capacity_reserved`

Navigation: ⬅️ [`local_start_time`, `local_end_time`](#local_start_time-local_end_time) | 📋 [TOC](#table-of-contents) | [Next](#is_bookable) ➡️

**What it means in the world** ✅

How many bookings one window can hold, and how many it currently holds. A venue with three function
rooms is one slot with a total of 3, not three resources.

**Example** `capacity_total = 1` (the default), `capacity_reserved = 0`

**Watch out** `capacity_remaining` is a computed property, not a column, so it cannot appear in a
database filter ✅

---

### `is_bookable`

Navigation: ⬅️ [`capacity_total`, `capacity_reserved`](#capacity_total-capacity_reserved) | 📋 [TOC](#table-of-contents) | [Next](#user_type) ➡️

**What it means in the world** ✅

Whether this slot can be taken at all, independent of whether it has capacity left.

**Example** `true`

---

### `user_type`

Navigation: ⬅️ [`is_bookable`](#is_bookable) | 📋 [TOC](#table-of-contents) | [Next](#roles) ➡️

**What it means in the world** ✅

A single hat, stored on the user row.

**Example** `organizer` (the default; one of five: `organizer`, `vendor`, `artist`, `venue`,
`attendee`)

**Stands for** a property of a [user](../world/organizer.md#what-an-organizer-is)

**Watch out** this is one of **two** role systems and it is singular, so it cannot express a user who
is both an artist and an organizer, which is the case the product is built around. `scheduling`
gates on this field; `artists` and `vendors` gate on `roles` instead ✅

---

### `roles`

Navigation: ⬅️ [`user_type`](#user_type) | 📋 [TOC](#table-of-contents) | [Next](#genres) ➡️

**What it means in the world** ✅

Many hats, through a join table to `users_role`.

**Example** a user holding both `EVENT_ORGANIZER` and `ARTIST` (values: `EVENT_ORGANIZER`,
`ARTIST`, `SERVICE_PROVIDER`, `VENUE_MANAGER`, `TICKET_BUYER`)

**Watch out** the value list overlaps `user_type` without matching it. Eleven call sites read these
through `Role.<NAME>`, which does not exist; the values are on `Role.Names` ✅

---

### `genres`

Navigation: ⬅️ [`roles`](#roles) | 📋 [TOC](#table-of-contents) | [Next](#booking_fee-booking_fee_min-booking_fee_max) ➡️

**What it means in the world** ✅

What kind of act an artist is.

**Example** `Amapiano, House`

**Type and shape** free text, at most 255 characters, **not a list**

**Watch out** filtering by genre is string matching, and two artists in the same genre may have
spelled it differently ✅

---

### `booking_fee`, `booking_fee_min`, `booking_fee_max`

Navigation: ⬅️ [`genres`](#genres) | 📋 [TOC](#table-of-contents) | [Next](#rating) ➡️

**What it means in the world** ✅

What an artist charges: either a single figure or a range, since most performers price as a range.

**Example** `booking_fee_min = 15000.00`, `booking_fee_max = 40000.00`

**Watch out** all three are nullable and nothing enforces that the single value sits inside the
range, or that either form is filled 🔍

---

### `rating`

Navigation: ⬅️ [`booking_fee`, `booking_fee_min`, `booking_fee_max`](#booking_fee-booking_fee_min-booking_fee_max) | 📋 [TOC](#table-of-contents) | [Next](#is_popular) ➡️

**What it means in the world** ✅

An average review score. On a vendor it is computed from that vendor's services by
`update_rating()`; on an artist and a venue it is a stored decimal.

**Example** `4.50` (defaults to `0.0`)

**Watch out** `0.0` means "no reviews yet", not "rated zero". The two are indistinguishable ✅

---

### `is_popular`

Navigation: ⬅️ [`rating`](#rating) | 📋 [TOC](#table-of-contents) | [Next](#availability-artist) ➡️

**What it means in the world** ✅

Whether an artist is surfaced as popular. The model's own comment says it replaced mock data logic.

**Example** `false`

**Watch out** set by hand, not derived from any measure of popularity ✅

---

### `availability` (Artist)

Navigation: ⬅️ [`is_popular`](#is_popular) | 📋 [TOC](#table-of-contents) | [Next](#category_id) ➡️

**What it means in the world** ✅

A map of dates to states, on the artist profile.

**Example** `{"2026-09-14": "unavailable"}`

**Watch out** this is a **second, unrelated availability system**. The booking engine reads
`AvailabilityRule` and `AvailabilitySlot` in `scheduling` and never reads this field. Nothing keeps
the two in agreement ✅

---

### `category_id`

Navigation: ⬅️ [`availability` (Artist)](#availability-artist) | 📋 [TOC](#table-of-contents) | [Next](#price_range) ➡️

**What it means in the world** ✅

Which kind of service a vendor sells. A foreign key, so the list of kinds is data rather than code.

**Example** a row in `vendors_category`

---

### `price_range`

Navigation: ⬅️ [`category_id`](#category_id) | 📋 [TOC](#table-of-contents) | [Next](#capacity) ➡️

**What it means in the world** ✅

What a vendor charges.

**Example** `12500.00`

**Type and shape** a single decimal, 10 digits, 2 decimal places

**Watch out** the name says range and the type is one number. It is not a bound ✅

---

### `capacity`

Navigation: ⬅️ [`price_range`](#price_range) | 📋 [TOC](#table-of-contents) | [Next](#is_approved) ➡️

**What it means in the world** ✅

How many people a venue holds. Required, because it is the first thing an organizer filters on.

**Example** `2000`

**Watch out** distinct from an event's `guest_count` (how many are expected) and from a slot's
`capacity_total` (how many bookings a window holds) ✅

---

### `is_approved`

Navigation: ⬅️ [`capacity`](#capacity) | 📋 [TOC](#table-of-contents) | [Next](#has_variable_pricing) ➡️

**What it means in the world** ✅

Whether a venue has been let onto the platform. Venues do not list themselves.

**Example** `false` (the default)

**Watch out** who approves, and by what process, was not established 🔍

---

### `has_variable_pricing`

Navigation: ⬅️ [`is_approved`](#is_approved) | 📋 [TOC](#table-of-contents) | [Next](#latitude-longitude) ➡️

**What it means in the world** ✅

This venue quotes per enquiry rather than publishing a price.

**Example** `false`

---

### `latitude`, `longitude`

Navigation: ⬅️ [`has_variable_pricing`](#has_variable_pricing) | 📋 [TOC](#table-of-contents) | [Next](#preferred_dates) ➡️

**What it means in the world** ✅

Where a venue is, for the map.

**Example** `-26.234813`, `27.982273`

**Where it comes from** OpenStreetMap's Nominatim service, called directly from the browser when
someone picked a point. See
[Where it comes from § The one external source](01-where-it-comes-from.md#the-one-external-source)

---

### `preferred_dates`

Navigation: ⬅️ [`latitude`, `longitude`](#latitude-longitude) | 📋 [TOC](#table-of-contents) | [Next](#quantity) ➡️

**What it means in the world** ✅

Date ranges a venue would rather fill.

**Example** `[{"start": "2026-12-20", "end": "2026-12-25"}]`

**Watch out** unrelated to the availability rules the booking engine reads ✅

---

### `quantity`

Navigation: ⬅️ [`preferred_dates`](#preferred_dates) | 📋 [TOC](#table-of-contents) | [Next](#payment_status) ➡️

**What it means in the world** ✅

How many admissions one ticket row covers.

**Example** `2` (defaults to `1`)

**Watch out** it does not say which tier the admissions are for, even when the event defines tiers ✅

---

### `payment_status`

Navigation: ⬅️ [`quantity`](#quantity) | 📋 [TOC](#table-of-contents) | [Next](#buyer_id) ➡️

**What it means in the world** ✅

Whether a ticket has been paid for.

**Example** `reserved` (the default; one of two: `reserved`, `paid`)

**Watch out** no payment integration exists in this repository. `paid` can be set and nothing can
take money to justify it ✅

---

### `buyer_id`

Navigation: ⬅️ [`payment_status`](#payment_status) | 📋 [TOC](#table-of-contents) | [Next](#likes) ➡️

**What it means in the world** ✅

The user holding the ticket. The only place a guest appears in the system.

**Example** `48`

---

### `likes`

Navigation: ⬅️ [`buyer_id`](#buyer_id) | 📋 [TOC](#table-of-contents) | [Next](#shares_count) ➡️

**What it means in the world** ✅

Which users liked a post, as a many-to-many join table. A like is a row, so it can be traced and
undone.

**Example** a set of user ids

---

### `shares_count`

Navigation: ⬅️ [`likes`](#likes) | 📋 [TOC](#table-of-contents)

**What it means in the world** ✅

How many times a post was shared.

**Example** `0` (the default)

**Watch out** a plain integer someone increments, with no share records behind it. Unlike `likes`,
it cannot be audited or undone ✅
