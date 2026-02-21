# Scheduling Calendar System Architecture and Implementation Plan

This document operationalizes the calendar/booking/request architecture for the Attica marketplace and maps to backend implementation in `backend/main/scheduling`.

## 1. High-Level Architecture

### Modules
- `scheduling.models`: core domain entities (resource, policy, availability, request, booking, audit, outbox, idempotency).
- `scheduling.services`: transactional orchestration, policy checks, conflict prevention, state transitions, calendar query composition.
- `scheduling.views`: REST endpoints for search, create booking/request, approve/decline, cancel/reschedule, calendar views.
- `scheduling.permissions`: RBAC + ownership helpers.

### Data Flow
1. Organizer searches availability (`GET /api/scheduling/availability/search/`).
2. Organizer creates either instant booking or approval request.
3. Provider approves/declines pending requests.
4. Booking lifecycle updates generate audit records + outbox events.
5. Calendar endpoint aggregates booking + request timelines by scope.

## 2. Core Domain Model

Implemented models:
- `MarketplaceResource` (venue/artist/vendor abstraction).
- `ResourcePolicy` (booking mode, notice, horizon, buffers, cancellation/reschedule rules).
- `AvailabilityRule` + `AvailabilityException` + `AvailabilitySlot` (hybrid availability strategy).
- `BookingRequest` and `Booking` (separate lifecycle state machines).
- `CalendarEvent` (projection model scaffold).
- `IdempotencyRecord` (safe retries).
- `AuditLog` (traceability).
- `OutboxEvent` (event-driven integration anchor).

## 3. API Surface

Management CRUD (provider/admin):
- `GET/POST /api/scheduling/resources/`
- `GET/POST /api/scheduling/resource-policies/`
- `GET/POST /api/scheduling/availability-rules/`
- `GET/POST /api/scheduling/availability-exceptions/`
- `GET/POST /api/scheduling/availability-slots/`

Workflow APIs:
- `GET /api/scheduling/availability/search/`
- `POST /api/scheduling/bookings/create/`
- `POST /api/scheduling/requests/create/`
- `POST /api/scheduling/requests/{id}/approve/`
- `POST /api/scheduling/requests/{id}/decline/`
- `POST /api/scheduling/bookings/{id}/cancel/`
- `POST /api/scheduling/bookings/{id}/reschedule/`
- `GET /api/scheduling/calendar/`

## 4. Data Consistency and Race Handling

Implemented approach:
- Transactional orchestration (`transaction.atomic`).
- Overlap detection against active booking states.
- Slot-level row locks (`select_for_update`) where available.
- Capacity reservation/release through atomic field updates.
- Idempotency replay protection (`IdempotencyRecord`) keyed by owner+endpoint+key+request hash.

Planned hardening (V1):
- PostgreSQL exclusion constraints for overlap prevention at DB level.
- Distributed locks for high-contention resources.
- Hold-expiry cleanup workers.

## 5. Calendar Computation Strategy

Hybrid strategy implemented:
- Use explicit `AvailabilitySlot` when materialized.
- Fallback to rule generation from `AvailabilityRule` when slots are absent.
- Apply `AvailabilityException` as blackout/override filter.
- Remove windows that overlap active bookings.

Planned V1:
- Background materialization horizon (e.g., 180 days).
- Cache search windows by query key + invalidation.

Implemented now:
- DST-aware local-time conversion policy in rule expansion:
  - ambiguous local times resolve to fold=0 (earlier occurrence),
  - nonexistent local times are skipped.
- Slot materialization service + command:
  - `python manage.py materialize_availability_slots --start-date YYYY-MM-DD --end-date YYYY-MM-DD`
- PostgreSQL hardening migration:
  - exclusion constraint to block overlapping active bookings per resource.

## 6. Lifecycle State Machines

`BookingRequest.status`
- `draft -> pending -> approved`
- `pending -> declined | withdrawn | expired`

`Booking.status`
- `hold -> confirmed -> in_progress -> completed`
- `confirmed -> cancelled | reschedule_pending | disputed`
- `hold -> expired`

Current implementation supports key transitions:
- request create, approve, decline.
- booking create, cancel, reschedule.

## 7. Permissions Model

Implemented policy:
- Organizer must own event for booking/request creation.
- Provider must own resource for availability and request review.
- Admin (`is_staff`/`is_superuser`) bypasses ownership restrictions.
- Read list scopes include organizer-owned or provider-owned entities.

## 8. Event-Driven Components

Implemented foundation:
- Outbox records emitted for request/booking lifecycle changes.
- Audit records captured for every mutation.
- Outbox dispatcher now supports:
  - in-app notification fanout,
  - webhook fanout from `SCHEDULING_WEBHOOK_URLS`,
  - HMAC webhook signing headers + delivery idempotency key headers,
  - exponential retry backoff,
  - circuit-breaker controls per webhook endpoint,
  - dead-letter persistence (`OutboxDeadLetter`) after max retries.
- Worker command options:
  - `python manage.py dispatch_scheduling_outbox --notifications-only`
  - `python manage.py dispatch_scheduling_outbox --webhooks-only`

Planned V1 consumers:
- Notification fanout (email/push/in-app).
- Reminder scheduler.
- Webhook dispatcher with retry + DLQ.

## 9. Scalability and Temporal Correctness

Current baseline:
- Indexed time-window query paths.
- UTC storage for datetimes.
- Rule-level timezone conversion via `zoneinfo`.

Planned V1:
- Redis caching for search windows.
- cursor pagination for wide calendar windows.
- explicit DST edge-case policies for ambiguous/nonexistent local times.
- per-endpoint rate limiting.

## 10. Implementation Plan (MVP -> V1)

### MVP (in progress)
1. Domain models and migrations.
2. Core workflow services and API endpoints.
3. Basic role/ownership checks and idempotency.
4. Initial automated tests for idempotency, approval flow, and double-book prevention.
5. Operational commands:
   - `python manage.py expire_pending_booking_requests`
   - `python manage.py dispatch_scheduling_outbox`
6. Frontend integration:
   - `/scheduling` planner page for organizer/provider workflows.
   - availability search, request/booking actions, provider approve/decline inbox, and calendar timeline rendering.
   - step-3 selection pages deep-link into scheduler with prefilled `event_id` + selected `artist_ids`/`vendor_ids`/`venue_ids`.
   - optional `auto_request=1` trigger for bulk request creation from preselected listing items.

### V1
1. Slot materialization jobs + scheduled recomputation.
2. Notification/webhook workers consuming outbox events.
3. DB-level overlap constraints (Postgres) and stronger concurrency controls.
4. richer calendar projection and frontend calendar integration.
5. observability (metrics, traces, dead-letter replay tooling).

## Test Strategy

Implemented tests in `backend/main/scheduling/tests.py`:
- instant booking idempotency.
- request approval to confirmed booking.
- conflict rejection for double-book attempts.
- cancellation window enforcement for non-admin users.
- reschedule conflict rejection against existing bookings.
- DST/timezone edge cases:
  - nonexistent local times (spring-forward gap) skipped,
  - ambiguous local times (fall-back overlap) deterministic fold handling,
  - cross-timezone UTC search alignment.
- outbox worker reliability:
  - notification dispatch success path,
  - retry progression to dead-letter after max attempts.
  - webhook signing/idempotency headers validation.
  - webhook circuit-breaker open/skip behavior.
- permission integration:
  - booking/request event ownership rules,
  - approve/decline resource ownership rules,
  - cancel/reschedule participant/owner rules,
  - calendar admin/resource scope restrictions,
  - list scope filtering for organizer/provider,
  - availability search authentication.

Planned tests:
- PostgreSQL exclusion-constraint integration (run on PostgreSQL CI target).
