# Booking System — QA Test Guide

Full end-to-end test guide covering every state of the booking workflow across all user roles.

---

## 1. Setup

### 1.1 Start the servers

```bash
# Terminal 1 — Django (with WebSockets)
cd backend/main
source ../venv/bin/activate
daphne -b 0.0.0.0 -p 8000 main.asgi:application

# Terminal 2 — React
cd frontend
npm run dev
```

### 1.2 Seed the marketplace providers

```bash
cd backend/main
python manage.py seed_marketplace
```

### 1.3 Seed the booking workflow test data

```bash
python manage.py seed_booking_workflow
# Add --clear first if you want a clean slate:
# python manage.py seed_booking_workflow --clear && python manage.py seed_booking_workflow
```

### 1.4 Materialize availability slots (required for calendar and availability search)

```bash
python manage.py materialize_availability_slots --days 90
```

This generates `AvailabilitySlot` records from the `AvailabilityRule` data created by `seed_marketplace`.
Without this step the `/scheduling` availability search returns no results and the calendar timeline is empty.

Expected output:

```
User [created]: test_organizer  (EVENT_ORGANIZER)
User [created]: test_artist     (ARTIST)
Artist resource [created]: Test Artist
Scenario [pending]          request [created]: Afrobeats Night [seed]         → Zola & The Band
Scenario [counter_proposed] request [created]: Jazz Under the Stars [seed]    → Nandi Dlamini
Scenario [confirmed]        request [created]: House Music Festival [seed]     → DJ Karabo
Scenario [completed]        request [created]: New Year's Eve Gala [seed]     → The Brass Co.
Scenario [declined]         request [created]: Corporate Gala Dinner [seed]   → Feast Cape Town
Scenario [withdrawn]        request [created]: Tech Conference Afterparty [seed] → Luminary Productions
Scenario [live]             request [created]: Demo Event – Live Test [seed]  → Test Artist
```

---

## 2. Test Accounts

| Username | Password | Role |
|---|---|---|
| `test_organizer` | `Test123!` | Event Organizer (books artists/vendors) |
| `test_artist` | `Test123!` | Artist (receives and manages bookings) |
| `seed_artist_zola` | `seed_pass_123!` | Artist provider |
| `seed_artist_nandi` | `seed_pass_123!` | Artist provider |
| `seed_artist_dj_karabo` | `seed_pass_123!` | Artist provider |
| `seed_artist_brass_co` | `seed_pass_123!` | Artist provider |
| `seed_vendor_feast` | `seed_pass_123!` | Vendor provider |
| `seed_vendor_luminary` | `seed_pass_123!` | Vendor provider |

---

## 3. Pre-built Scenarios (inspect existing state)

Open `http://localhost:5173` and log in as **test_organizer**.

Click **My Bookings** in the navbar (desktop) or hamburger menu → **Marketplace Requests** tab. You should see all 7 scenarios:

| Label | Event | Provider | Expected status |
|---|---|---|---|
| A – pending | Afrobeats Night | Zola & The Band | `Pending` |
| B – counter_proposed | Jazz Under the Stars | Nandi Dlamini | `Counter Proposed` |
| C – confirmed | House Music Festival | DJ Karabo | confirmed booking |
| D – completed | New Year's Eve Gala | The Brass Co. | completed + review ★★★★★ |
| E – declined | Corporate Gala Dinner | Feast Cape Town | `Declined` |
| F – withdrawn | Tech Conference Afterparty | Luminary Productions | `Withdrawn` |
| G – live | Demo Event – Live Test | Test Artist | `Pending` |

Click each row to confirm the detail page renders correctly with the right status badge and available actions.

---

## 4. Interactive Tests — Organizer Role

Log in as **test_organizer**.

### 4.1 Submit a new booking request from the artist catalogue

1. Go to `/artists`
2. Click on any artist card (e.g. "Zola & The Band")
3. Click **"Book Artist"** button on the artist profile page
4. Fill in:
   - Start date/time: any future date
   - End date/time: 2–3 hours after start
   - Attendee count: 150
   - Message: any text
5. Submit → you should land on the `/bookings/<id>` request detail page
6. **Verify**: status badge shows `Pending`, provider info shown, no action buttons for the organizer at this stage

### 4.2 Withdraw a pending request

1. From the Marketplace Requests tab, open **Afrobeats Night** (scenario A – pending)
2. At the bottom, click **"Withdraw request"**
3. Confirm the withdrawal
4. **Verify**: status changes to `Withdrawn`, withdraw button disappears

### 4.3 Respond to a counter-proposal (accept)

1. From the Marketplace Requests tab, open **Jazz Under the Stars** (scenario B – counter_proposed)
2. You should see the **"Review & Respond"** panel with the provider's counter-proposal details (new dates, rate, message)
3. Click **"Accept counter-proposal"**
4. **Verify**: request status → `Approved`, redirect to booking detail page (`/booking-detail/<id>`)
5. **Verify**: booking status shows `Confirmed`

### 4.4 Respond to a counter-proposal (reject)

Re-seed or use a fresh counter_proposed request (you can re-run `--clear`).

1. Open the counter_proposed request
2. Click **"Decline counter-proposal"**
3. **Verify**: request status → `Declined`

### 4.5 View a confirmed booking and request cancellation

1. From the Marketplace Requests tab, open **House Music Festival** (scenario C – confirmed)
2. The confirmed booking detail page should show dates, provider, attendee count
3. Click **"Cancel booking"**
4. Enter a cancellation reason, confirm
5. **Verify**: booking status → `Cancelled`

### 4.6 Reschedule a confirmed booking

1. Open the confirmed booking detail page (scenario C before cancelling)
2. Click **"Reschedule"**
3. Pick new start/end times
4. Submit
5. **Verify**: booking status → `Reschedule Pending` (provider must confirm)

### 4.7 Leave a review on a completed booking

1. Open **New Year's Eve Gala** booking detail (scenario D – completed)
2. Click **"Leave a review"**
3. Select a star rating and write a comment
4. Submit
5. **Verify**: "Review submitted" confirmation, stars visible on the booking detail

> Note: scenario D already has a review pre-seeded. Either run `--clear` to reset,
> or use a freshly completed booking created via the live flow (section 5).

### 4.8 Notifications

1. Click the 🔔 bell icon in the navbar
2. **Verify** the following unread notifications appear:
   - `Counter-proposal received` → links to Jazz Under the Stars request
   - `Booking confirmed!` → links to House Music Festival booking detail
   - `Booking request declined` → links to Corporate Gala Dinner request
3. Click each notification → verify it navigates to the correct page
4. Mark as read → verify the unread badge count decreases

---

## 5. Interactive Tests — Provider Role (test_artist)

Open a second browser/incognito window and log in as **test_artist**.

### 5.1 View incoming requests on provider dashboard

1. Navigate to `/provider-dashboard`
2. **Requests** tab should show the pending "Demo Event – Live Test" booking request from test_organizer
3. **Verify**: requester name, event name, dates, attendee count, message are all visible

### 5.2 Approve a request

1. On the Demo Event request, click **"Approve"**
2. **Verify**:
   - Request status → `Approved`
   - Redirect to `/booking-detail/<booking_id>`
   - New booking appears in the **Bookings** tab of the provider dashboard with status `Confirmed`

Switch back to **test_organizer** browser:
3. **Verify**: notification appears: "Booking confirmed!"
4. Click notification → lands on booking detail page

### 5.3 Decline a request

Re-seed a fresh pending request (run `seed_booking_workflow --clear` or submit a new request via 4.1).

1. On the incoming request, click **"Decline"**
2. Optionally enter a decline message
3. **Verify**: request status → `Declined`

Switch back to **test_organizer** browser:
4. **Verify**: notification "Booking request declined" appears

### 5.4 Send a counter-proposal

Re-seed a fresh pending request.

1. On the incoming request, click **"Counter-propose"**
2. Fill in:
   - New start date/time (different from original)
   - New end date/time
   - Proposed rate (e.g. R8,000)
   - Counter message explaining the change
3. Submit
4. **Verify**: request status → `Counter Proposed`

Switch back to **test_organizer** browser:
5. **Verify**: "Counter-proposal received" notification appears
6. Open the request → "Review & Respond" panel visible with your proposed terms
7. Accept or reject (see 4.3 / 4.4)

### 5.5 Complete a confirmed booking

1. On the provider dashboard **Bookings** tab, find a `Confirmed` booking
2. Click **"Mark as Complete"**
3. **Verify**: booking status → `Completed`

Switch back to **test_organizer** browser:
4. **Verify**: "Leave a review" button is now visible on the booking detail page

### 5.6 Manage availability

1. Navigate to `/provider-availability`
2. **Step 1 – Resource**: verify test_artist's resource card is shown
3. **Step 2 – Policy**: set booking mode, min notice, max horizon → save
4. **Step 3 – Availability**: add a weekly availability rule (e.g. Monday–Friday 10:00–20:00)
5. **Step 4 – Blackouts**: add a blackout date range (e.g. next public holiday)
6. **Verify**: rules and blackouts appear in the list

---

## 6. Full End-to-End Flow (Happy Path)

This test walks through the complete lifecycle from first contact to review.

| Step | Who | Action | Expected result |
|---|---|---|---|
| 1 | Organizer | Browse `/artists`, click Test Artist | Artist profile loads with genres, bio, booking_mode badge |
| 2 | Organizer | Click "Book Artist" | `/artists/<id>/book` form loads |
| 3 | Organizer | Submit booking request | Lands on `/bookings/<id>` — status: `Pending` |
| 4 | Artist | Check `/provider-dashboard` → Requests tab | New request visible |
| 5 | Artist | Click "Counter-propose", change times, add rate | Status → `Counter Proposed` |
| 6 | Organizer | Check notification bell → click counter-proposal alert | Lands on request page, sees "Review & Respond" panel |
| 7 | Organizer | Click "Accept counter-proposal" | Redirect to `/booking-detail/<id>` — status: `Confirmed` |
| 8 | Artist | View booking on dashboard | Status: `Confirmed`, dates show counter-proposal times |
| 9 | Artist | Click "Mark as Complete" | Status: `Completed` |
| 10 | Organizer | Open booking detail | "Leave a review" button visible |
| 11 | Organizer | Submit 5-star review | Review saved, stars visible on artist profile |
| 12 | Artist profile | Refresh `/artists/<id>` | Review appears in "Reviews" section with correct rating |

---

## 7. Edge Case Tests

### 7.1 Duplicate booking prevention

1. Submit two requests to the same artist for overlapping times
2. **Verify**: second request is created (providers can have multiple pending requests; conflict is surfaced only on approval)

### 7.2 Venue exclusivity

1. Submit a venue booking request (use seed_venue_atrium or seed_venue_horizon)
2. Submit a second venue request for an overlapping time window
3. **Verify**: second request returns a `409 Conflict` error: "Overlapping venue request already pending"

### 7.3 Policy — min notice hours

If you modify a resource policy to `min_notice_hours = 24`:
1. Try to submit a booking request with start time < 24 hours from now
2. **Verify**: 400 error "Requested start violates min_notice_hours policy"

### 7.4 Counter-proposal on already-withdrawn request

1. Organizer submits a request
2. Organizer immediately withdraws it (test 4.2)
3. Provider attempts to approve via API: `POST /api/scheduling/requests/<id>/approve/`
4. **Verify**: 409 or 400 error — cannot act on a withdrawn request

### 7.5 Review on non-completed booking

Attempt to submit a review against a `Confirmed` (not yet completed) booking via:
`POST /api/scheduling/reviews/` with the booking id

**Verify**: validation error — reviews only allowed on completed bookings

---

## 8. API Smoke Tests (curl / Postman)

First, get a token:

```bash
curl -X POST http://localhost:8000/api/users/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test_organizer","password":"Test123!"}'
# Copy the "access" token
TOKEN=<paste access token here>
```

### List scheduling requests (organizer view)
```bash
curl http://localhost:8000/api/scheduling/requests/?role=organizer \
  -H "Authorization: Bearer $TOKEN"
```

### List confirmed bookings (organizer view)
```bash
curl http://localhost:8000/api/scheduling/bookings/?role=organizer \
  -H "Authorization: Bearer $TOKEN"
```

### Submit a new booking request
```bash
# Get your event id first
curl http://localhost:8000/api/events/my-events/ -H "Authorization: Bearer $TOKEN"
EVENT_ID=<your_event_id>
RESOURCE_ID=<test_artist_resource_id>

curl -X POST http://localhost:8000/api/scheduling/requests/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"resource_id\": $RESOURCE_ID,
    \"event_id\": $EVENT_ID,
    \"start_at\": \"$(date -u -d '+30 days 18:00' '+%Y-%m-%dT%H:%M:%SZ')\",
    \"end_at\":   \"$(date -u -d '+30 days 21:00' '+%Y-%m-%dT%H:%M:%SZ')\",
    \"attendee_count\": 150,
    \"message\": \"API smoke test request\"
  }"
```

### Provider actions (switch to artist token)
```bash
curl -X POST http://localhost:8000/api/users/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test_artist","password":"Test123!"}'
ARTIST_TOKEN=<paste artist access token>
REQUEST_ID=<id of the request created above>

# Approve
curl -X POST http://localhost:8000/api/scheduling/requests/$REQUEST_ID/approve/ \
  -H "Authorization: Bearer $ARTIST_TOKEN"

# Or counter-propose
curl -X POST http://localhost:8000/api/scheduling/requests/$REQUEST_ID/counter/ \
  -H "Authorization: Bearer $ARTIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"counter_start_at\": \"$(date -u -d '+32 days 18:00' '+%Y-%m-%dT%H:%M:%SZ')\",
    \"counter_end_at\":   \"$(date -u -d '+32 days 20:00' '+%Y-%m-%dT%H:%M:%SZ')\",
    \"counter_rate\": \"7500.00\",
    \"counter_message\": \"API counter test\"
  }"
```

---

## 9. Checklist

Copy this for your QA sign-off sheet:

### Organizer flows
- [ ] Browse artist catalogue, open profile, see booking_mode badge and reviews
- [ ] Submit a booking request from artist profile
- [ ] View request on Organizer Dashboard → Marketplace Requests tab
- [ ] Withdraw a pending request
- [ ] View and respond to a counter-proposal (accept)
- [ ] View and respond to a counter-proposal (reject)
- [ ] View confirmed booking detail
- [ ] Cancel a confirmed booking
- [ ] Reschedule a confirmed booking
- [ ] Leave a review on a completed booking
- [ ] Receive and click through all notification types

### Provider (test_artist) flows
- [ ] View incoming requests on Provider Dashboard
- [ ] Approve a request → redirect to booking detail
- [ ] Decline a request
- [ ] Send a counter-proposal with custom times and rate
- [ ] Mark a confirmed booking as complete
- [ ] Configure availability rules
- [ ] Add blackout dates

### Pre-seeded scenario inspection
- [ ] Scenario A — pending request shows `Pending` badge
- [ ] Scenario B — counter_proposed shows counter terms + "Review & Respond" panel
- [ ] Scenario C — confirmed booking detail page loads
- [ ] Scenario D — completed booking shows review and "Leave a review" is gone
- [ ] Scenario E — declined request shows `Declined` badge and provider message
- [ ] Scenario F — withdrawn request shows `Withdrawn` badge, no actions

### Notifications
- [ ] Counter-proposal notification links to correct request
- [ ] Booking confirmed notification links to `/booking-detail/<id>` (not `/bookings/<id>`)
- [ ] Booking declined notification links to request
- [ ] Mark as read clears badge count

### API
- [ ] `GET /api/scheduling/requests/?role=organizer` returns organizer's requests
- [ ] `GET /api/scheduling/requests/?role=provider` returns provider's requests
- [ ] `GET /api/scheduling/bookings/?role=organizer` returns organizer's bookings
- [ ] `POST /api/scheduling/requests/create/` succeeds with valid payload
- [ ] `POST /api/scheduling/requests/<id>/approve/` succeeds as provider
- [ ] `POST /api/scheduling/requests/<id>/counter/` succeeds as provider
- [ ] `POST /api/scheduling/requests/<id>/accept-counter/` succeeds as organizer
- [ ] `POST /api/scheduling/requests/<id>/withdraw/` succeeds as organizer
- [ ] `POST /api/scheduling/bookings/<id>/complete/` succeeds as provider
- [ ] `POST /api/scheduling/bookings/<id>/cancel/` succeeds as organizer or provider
- [ ] `POST /api/scheduling/reviews/` succeeds on a completed booking
