# Attica Feature Roadmap

Track implementation progress by checking off items as they ship.

---

## Phase 1 — Follow Graph + Social Feed

### Backend
- [x] `Follow` model (follower → following, unique constraint) — pre-existing in `artists` app
- [ ] `GET /api/users/<id>/followers/` — list followers
- [ ] `GET /api/users/<id>/following/` — list following
- [x] `POST /api/artists/<id>/follow/` — follow/unfollow toggle
- [x] Follower / following counts exposed on artist serializer (`follower_count`, `is_following`)
- [x] `GET /api/accounts/social-posts/?following=true` — posts from followed artists
- [x] `NEW_FOLLOWER` notification fired when artist is followed
- [x] `POST_LIKED` notification fired when post is liked
- [x] `POST_COMMENTED` notification fired when post is commented on

### Frontend
- [x] Follow button on artist profile pages (with optimistic update)
- [ ] Follow button on venue profile pages
- [ ] Follow button on organizer public profiles
- [x] Follower count display on artist profile stats bar
- [ ] Followers / following modal lists
- [x] Home feed "For You" / "Following" tabs (filter to followed artists)

---

## Phase 2 — Payments

### Backend
- [ ] Payment provider integration (Stripe / Peach Payments / Yoco)
- [ ] `Payment` model linked to `Booking`
- [ ] `POST /api/checkout/booking/<id>/pay/` — initiate payment
- [ ] Webhook handler for payment confirmation / failure
- [ ] Booking status auto-advances on payment success
- [ ] Invoices / receipts (PDF or email)

### Frontend
- [ ] Payment step on booking confirmation
- [ ] Payment status badge on booking detail
- [ ] Receipt / invoice download link

---

## Phase 3 — Global Search

### Backend
- [x] `GET /api/search/?q=<query>&type=<all|artists|events|services>` — unified search endpoint
- [x] Search across artists (name, bio, genres), events (name, location, category), services

### Frontend
- [x] Search bar in NavBar (desktop + mobile hamburger)
- [x] `⌘K` keyboard shortcut to focus search
- [x] `/search` results page with tabs: All | Artists | Events | Services
- [ ] Highlighted match snippets in results

---

## Phase 4 — Book Venue / Book Vendor Pages

### Frontend
- [ ] `/venues` — venue catalogue (mirrors `/artists`)
- [ ] `/venues/<id>` — venue profile with availability + "Book Venue" button
- [ ] `/venues/<id>/book` — booking request form for venues
- [ ] `/vendors` catalogue with direct "Book Vendor" flow
- [ ] `/vendors/<id>/book` — booking request form for vendors

---

## Phase 5 — Artist Media Portfolio

### Backend
- [x] `ArtistPortfolioItem` model (artist, image, caption) — pre-existing
- [x] `POST /api/artists/<id>/portfolio/` — upload portfolio item (owner only)
- [x] `DELETE /api/artists/<id>/portfolio/<item_pk>/` — delete item (owner only)
- [x] Portfolio items included in artist profile serializer

### Frontend
- [x] Portfolio grid on artist profile (Portfolio tab)
- [x] Upload photo button visible when viewing own profile
- [ ] Lightbox viewer for media items
- [ ] Video link / audio embed support

---

## Phase 6 — Event Ticket Purchase

### Backend
- [ ] Ticket inventory model (capacity, tiers, price)
- [ ] `POST /api/tickets/purchase/` — purchase tickets
- [ ] QR code generation for tickets
- [ ] `GET /api/tickets/my-tickets/` — buyer's ticket list

### Frontend
- [ ] Ticket tiers display on event detail page
- [ ] Purchase flow (quantity select → payment)
- [ ] My Tickets page with QR codes
- [ ] Ticket check-in scanner (organizer view)

---

## Phase 7 — Chat from Booking Context

### Backend
- [x] `POST /api/chat/rooms/with/<username>/` — find or create room between two users (pre-existing)
- [x] `resource_owner_username` added to `BookingSerializer` and `BookingRequestSerializer`

### Frontend
- [x] "Message the other party" button on booking detail page (`/booking-detail/:id`)
- [ ] "Message organizer" button on provider dashboard booking row
- [ ] Pre-populated room context showing booking summary in chat sidebar

---

## Phase 8 — Onboarding Flows

### Frontend
- [x] `/onboarding` — role-aware multi-step wizard (Artist / Venue / Service / Organizer flows)
- [x] Step-by-step: Basics (name, photo) → Role-specific details → Done
- [x] Profile picture upload in Basics step
- [x] Organizer: preferred event types selector
- [x] Artist: bio + genres step
- [ ] Direct navigation from `/onboarding` after registration (auto-redirect)
- [ ] Profile completeness indicator (progress bar / percentage)
- [ ] "Complete your profile" prompt on dashboard when incomplete

---

## Phase 9 — Social Notification Types

### Backend
- [x] `NEW_FOLLOWER` — fires on follow action
- [x] `POST_LIKED` — fires on like toggle (when liking, not unliking)
- [x] `POST_COMMENTED` — fires on comment create
- [ ] `EVENT_REMINDER` notification N hours before event
- [ ] Notification preferences model (opt in/out per type)

### Frontend
- [ ] Notification preference settings page

---

## Phase 10 — Public Organizer Profiles

### Backend
- [x] `GET /api/accounts/users/<id>/` — public user profile endpoint (any user)

### Frontend
- [x] `/organizers/:id` — public profile page (name, roles, posts)
- [ ] Past events grid on organizer profile
- [ ] Follow button on organizer profile
- [ ] "Events by this organizer" section on event detail page

---

## Completed

_(Phase items move here once fully done and tested)_
