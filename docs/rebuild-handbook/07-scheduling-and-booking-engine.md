# 07. Scheduling and Booking Engine

## Purpose
This chapter explains the most structurally advanced subsystem in the repo: the scheduling engine. It shows how the system transforms provider data into bookable resources governed by policies, availability logic, lifecycle transitions, and operational tooling.

Prerequisites: [04 Backend Foundations](./04-backend-foundations.md), [05 Marketplace and Role Model](./05-marketplace-and-role-model.md), [06 Event Creation and Draft Workflows](./06-event-creation-and-draft-workflows.md).  
Follow-up: [08 Realtime and User Feedback](./08-realtime-and-user-feedback.md), [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md), [11 Reconstruction Mental Models](./11-reconstruction-mental-models.md).

## Core Concepts

### Resource Normalization
- Why it exists: venues, artists, and vendors need one bookable abstraction for scheduling workflows.
- Where it appears: `MarketplaceResource`.
- Mastery unlocks: you can build cross-provider workflows without duplicating scheduling logic three times.

### Policy Enforcement
- Why it exists: not every theoretically available time should be bookable.
- Where it appears: `ResourcePolicy` and service-level checks for notice windows, booking horizon, deposits, and rescheduling behavior.
- Mastery unlocks: you can distinguish business policy from raw time availability.

### Availability Rules, Exceptions, and Materialized Slots
- Why they exist: recurring availability and one-off exceptions are human-friendly, while discrete slots are system-friendly.
- Where it appears: `AvailabilityRule`, `AvailabilityException`, `AvailabilitySlot`.
- Mastery unlocks: you can think in both authoring-friendly and booking-friendly representations of time.

### Requests vs Bookings vs Checkout Sessions
- Why they exist:
  - requests represent intent and negotiation
  - bookings represent confirmed commitments
  - checkout sessions represent temporary completion windows
- Where they appear: scheduling models and workflow endpoints.
- Mastery unlocks: you can model pre-commitment, commitment, and temporary hold as separate lifecycle states.

### Conflict Detection and Idempotency
- Why they exist: booking systems face retries, race conditions, and overlapping time windows.
- Where they appear: service-layer request hashing, idempotency records, overlap queries, checkout hold conflict detection.
- Mastery unlocks: you can design APIs that remain correct under repeated or concurrent calls.

### Outbox, Webhooks, Dead Letters, and Ops Visibility
- Why they exist: some side effects should happen after the core write succeeds, and failures need visibility.
- Where they appear: outbox event models, webhook targets, dead letters, ops summary endpoints and viewsets.
- Mastery unlocks: you can extend the system safely without coupling external side effects directly to request success.

## Concept Cluster: Minimum Knowledge To Rebuild
- generalized resource identity
- policy model
- recurrence and exception modeling
- slot derivation
- request lifecycle
- booking confirmation lifecycle
- temporary hold model
- operational side-effect delivery

How they combine into working features:
- Provider-specific models map into a shared resource.
- Resource policy constrains what counts as a legal booking.
- Rules and exceptions generate bookable time windows.
- Requests negotiate intent.
- Checkout holds reserve temporary commitment windows.
- Confirmed bookings become the durable commitment.
- Outbox and ops tooling externalize and observe important transitions.

## Grounded Examples

### Resource + Policy Pattern
Small example:
- `MarketplaceResource` ties one normalized bookable object to an owner and optionally to a venue, artist, or vendor. `ResourcePolicy` controls lead time, horizon, buffers, deposits, and rescheduling rules.

General pattern:
- First define what can be booked, then define the rules governing bookings of that thing.

Intent behind the design:
- Availability alone does not decide whether a booking is valid.

How to recreate without copying:
- Separate bookable identity from booking rules. Expect those rules to evolve independently.

### Rules/Exceptions/Slots Pattern
Small example:
- The models support recurring availability, one-off blackout or override windows, and a slot table with capacity totals and reserved counts.

General pattern:
- Human maintainers express schedules in recurrence language; the system serves searches using more concrete windows.

Intent behind the design:
- Recurrence is compact for authors, but slot records are easier for conflict checks and planner displays.

How to recreate without copying:
- Decide whether you need only dynamic computation or whether materialized slots justify their storage cost for search and operations.

### Workflow-Service Pattern
Small example:
- Scheduling services compute request hashes, store idempotency records, enforce policy windows, detect checkout conflicts, create audit records, and emit outbox events.

General pattern:
- When a workflow coordinates many correctness-sensitive steps, it deserves an explicit domain service.

Intent behind the design:
- Booking logic should stay readable and testable under failure and retry conditions.

How to recreate without copying:
- Treat workflow orchestration as a first-class layer. Define inputs, outputs, side effects, and failure cases explicitly.
