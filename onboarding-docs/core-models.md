# Core Models & Relationships

Entity map for the Attica codebase. Focus: the 15 models a new developer will encounter first.
Full model inventory is in `onboarding-source.md § 4`.

---

## Primary Entity Map (ASCII)

```
                         ┌────────────────────────┐
                         │       CustomUser        │
                         │  ─────────────────────  │
                         │  id                     │
                         │  username, email        │
                         │  user_type (legacy)     │
                         │  roles ──────────────────────────► Role (M2M)
                         │  profile ◄── (signal)   │         { EVENT_ORGANIZER,
                         └────────────────────────┘           ARTIST, SERVICE_PROVIDER,
                          │        │        │                  VENUE_MANAGER,
                          │        │        │                  TICKET_BUYER }
            (1-1 user)    │        │ (owner)│
                          ▼        │        ▼
                    ┌──────────┐   │   ┌──────────┐
                    │  Vendor  │   │   │  Artist  │
                    │ ──────── │   │   │ ──────── │
                    │ user(1-1)│   │   │ owner FK │
                    │ category │   │   │ user FK  │
                    │ services ◄── │   │ fee_min/ │
                    └──────────┘   │   │ fee_max  │
                         │         │   └──────────┘
                         │         │        │
                 (vendor FK)        │        │ (artist FK)
                         │         │        │
                         │    (organizer FK)│
                         │         │        │
                         │         ▼        │
                         │    ┌──────────┐  │
                         │    │  Event   │  │
                         │    │ ──────── │  │
                         │    │ user FK  │  │
                         │    │organizer │  │
                         │    │ location │──────────► Location
                         │    │ status   │  │
                         │    │tiered_   │  │         ┌──────────────┐
                         │    │ prices   │  │         │ EventDraft   │
                         │    │ (JSON)   │  │         │ ──────────── │
                         │    └──────────┘  │         │ organizer FK │
                         │         │        │         │ step fields  │
                         │         │        ▼         │ → publish()  │
                         │    (event FK)  ArtistBooking│ → Event     │
                         │         │      ──────────  └──────────────┘
                         │         │      artist FK
                         │         │      event FK
                         │         │      unique(artist, event)
                         │         │
                         └─────────┴──────────────┐
                                                   │
                                    (organizer FK, vendor FK, event FK)
                                                   │
                                                   ▼
                                         ┌──────────────────┐
                                         │    ChatRoom      │
                                         │  ──────────────  │
                                         │  organizer FK    │
                                         │  vendor FK       │
                                         │  event FK (null) │
                                         │  unique(org,     │
                                         │    vend, event)  │
                                         └──────────────────┘
                                           │           │
                              (room FK)    │           │ (room FK)
                                           ▼           ▼
                                      ┌─────────┐  ┌──────────┐
                                      │ Message │  │ ChatBid  │
                                      │ ─────── │  │ ──────── │
                                      │ room FK │  │ room FK  │
                                      │ sender  │  │organizer │
                                      │ TEXT /  │  │ vendor   │
                                      │ SYSTEM /│  │ amount   │
                                      │ BID     │  │ status:  │
                                      │ bid FK  │  │ PENDING  │
                                      │ (null.) │  │ ACCEPTED │
                                      └─────────┘  │ DECLINED │
                                           │        │COUNTERED │
                                  (M2M)    │        └──────────┘
                                           ▼
                                    ChatAttachment
```

---

## Relationship Tables

### CustomUser — the hub

Every entity in the system links back to `CustomUser`.

| Relationship | Type | Related model | Access |
|---|---|---|---|
| `user.profile` | OneToOne (auto) | `UserProfile` | signal auto-creates on save |
| `user.roles` | ManyToMany | `Role` | `user.has_role('EVENT_ORGANIZER')` |
| `user.vendor` | OneToOne (rev) | `Vendor` | vendors app |
| `user.artists` | FK (rev) | `Artist` | artists app (`owner` field) |
| `user.events_created` | FK (rev) | `Event` | `user` field on Event |
| `user.organized_events` | FK (rev) | `Event` | `organizer` field on Event |
| `user.chat_rooms_organizer` | FK (rev) | `ChatRoom` | organizer side |
| `user.chat_rooms_vendor` | FK (rev) | `ChatRoom` | vendor side |

**Note:** `Event` has both a `user` FK and a separate `organizer` FK — both point to
`CustomUser` but with different `related_name` values. This is a legacy duplication;
treat `organizer` as the authoritative field for new code.

---

### Event — the central entity

| Relationship | Type | Related model | Notes |
|---|---|---|---|
| `event.user` | FK | `CustomUser` | legacy creator field |
| `event.organizer` | FK | `CustomUser` | preferred — use this |
| `event.location` | FK (null) | `Location` | venue for the event |
| `event.artist_bookings` | FK (rev) | `ArtistBooking` | artists booked for event |
| `event.vendor_bookings` | FK (rev) | `vendors.Booking` | vendor services booked |
| `event.chat_rooms` | FK (rev) | `ChatRoom` | rooms opened for this event |
| `event.promo_codes` | FK (rev) | `PromoCode` | discount codes |

**JSON fields on Event** (schema-free, require care when querying):
- `tiered_prices` — list of `{ name, price, capacity }` dicts
- `custom_questions` — list of questions shown to ticket buyers at checkout
- `features` — list of feature flags/names for this event

---

### ChatRoom — the negotiation space

A room is the container for all communication between one organizer and one vendor (or
service provider) about one event.

| Field | Type | Notes |
|---|---|---|
| `organizer` | FK → CustomUser | the event organizer side |
| `vendor` | FK → CustomUser | the service provider side (despite name, can be any role) |
| `event` | FK → Event (null) | NULL means a general enquiry not tied to an event |
| `messages` | FK (rev) | `Message` objects in this room |
| `bids` | FK (rev) | `ChatBid` objects in this room |
| `attachments` | FK (rev) | `ChatAttachment` objects |

**Uniqueness:** `unique_together(organizer, vendor, event)` — one room per pair per event.

---

### ChatBid — the price negotiation object

| Field | Type | Notes |
|---|---|---|
| `room` | FK → ChatRoom | which room this bid is in |
| `organizer` | FK → CustomUser | bid initiator or responder |
| `vendor` | FK → CustomUser | bid recipient or initiator |
| `event` | FK → Event (null) | optional event context |
| `amount` | DecimalField | the proposed price |
| `currency` | CharField | default 'ZAR' |
| `status` | CharField | PENDING → ACCEPTED / DECLINED / COUNTERED |
| `initiator` | CharField | 'organizer' or 'vendor' — who sent the first bid |
| `idempotency_key` | CharField | prevents duplicate bids on retry |

**Lifecycle:**
```
Organizer or vendor sends bid → status: PENDING
    │
    ├─ Other party accepts  → status: ACCEPTED → Booking created
    ├─ Other party declines → status: DECLINED
    └─ Other party counters → status: COUNTERED → new ChatBid created
```

---

### Vendor & Service

| Relationship | Type | Notes |
|---|---|---|
| `Vendor.user` | OneToOne → CustomUser | one vendor profile per user |
| `Vendor.category` | FK → Category | primary service category |
| `Vendor.vendorservices` | FK (rev) | Service objects |
| `Service.vendor` | FK → Vendor | owning vendor |
| `Service.amenities` | M2M → Amenity | features offered |
| `Service.regions` | M2M → Region | areas covered |
| `Service.similar_services` | M2M → self | related services (self-referential) |

---

### Artist

| Relationship | Type | Notes |
|---|---|---|
| `Artist.owner` | FK → CustomUser | creator/manager of the artist profile |
| `Artist.user` | FK → CustomUser | the actual artist (may differ from owner) |
| `Artist.bookings` | FK (rev) | `ArtistBooking` records |
| `Artist.portfolio_items` | FK (rev) | `ArtistPortfolioItem` |
| `Artist.followers` | FK (rev) | `Follow` records |
| `ArtistBooking.artist` | FK → Artist | |
| `ArtistBooking.event` | FK → Event | |

**Constraint:** `unique_together(artist, event)` on `ArtistBooking` — an artist can only
be booked once per event.

---

### EventDraft — wizard checkpoint

| Relationship | Type | Notes |
|---|---|---|
| `EventDraft.organizer` | FK → CustomUser | who is creating this event |
| `EventDraft.assets` | FK (rev) | `EventDraftAsset` file uploads |

`EventDraft` does **not** FK to `Event`. On publish, the views layer creates a new `Event`
from draft data, then deletes the draft. The two models are linked only transiently via
the publish action, not via a database FK.

---

## Relationships Not Yet Wired (Gaps to Know About)

| Gap | Note |
|---|---|
| `Location` ↔ `Event` | `Event.location` FK exists but Location has no reverse `events` accessor defined in the location models — `event_set` works via Django default |
| `chat.Booking` vs `vendors.Booking` | Two separate `Booking` models exist in different apps. `chat.Booking` links event + provider + chatroom + accepted bid. `vendors.Booking` links user + service + event. They are not related to each other — different stages of the booking flow. |
| `scheduling` app | Has its own `Booking` and `BookingRequest` models — a third booking layer for slot-based availability. Not yet integrated with the chat or vendor booking flows. |
| `tickets.Ticket` | Exists but is not yet linked to checkout or payment (Phase 5 work). |

---

## Quick Lookup: Which App Owns What

| Concept | App | Key model |
|---|---|---|
| Users, auth, roles | `users` | `CustomUser`, `Role`, `UserProfile` |
| Events | `events` | `Event`, `EventDraft` |
| Vendor marketplace | `vendors` | `Vendor`, `Service`, `Booking` |
| Artist marketplace | `artists` | `Artist`, `ArtistBooking` |
| Venues | `locations` | `Location`, `VenueBooking`, `Quote` |
| Real-time chat | `chat` | `ChatRoom`, `Message`, `ChatBid` |
| Shopping cart | `cart` | `CartItem` |
| Payment / orders | `checkout` | (checkout models) |
| Ticketing | `tickets` | `Ticket` |
| Notifications | `notifications` | `Notification` |
| Availability scheduling | `scheduling` | `MarketplaceResource`, `Booking`, `AvailabilitySlot` |
