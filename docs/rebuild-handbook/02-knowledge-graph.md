# 02. Knowledge Graph

## Purpose
This chapter turns the handbook into a dependency map. It tells you what is foundational, what is derived, and which concepts are combinations of earlier ones.

Prerequisites: [01 System Map](./01-system-map.md).  
Follow-up: use this chapter as a routing table while reading the rest of the handbook.

## Foundational Topics
- HTTP request/response thinking
- React component and state basics
- Django app/model/view basics
- Authentication and user identity
- Relational data modeling

These are foundational because almost every later topic depends on them directly.

## Derived Topics
- Protected routing = React routing + authentication state
- Event drafting = shared client state + backend persistence + publish lifecycle
- Marketplace normalization = role model + provider domain modeling
- Scheduling engine = normalized resources + policies + availability + workflow transitions + transactional consistency
- Realtime feedback = domain events + websocket delivery + user-facing UI state
- Operational reliability = lifecycle workflows + failure handling + asynchronous processing

## Dependency Graph

```text
System map
  -> React foundations
  -> Django foundations

React foundations
  -> protected routes
  -> shared workflow state
  -> frontend API integration

Django foundations
  -> role-based APIs
  -> draft/publish workflows
  -> scheduling services
  -> websocket-backed features

Role model
  + provider domain modeling
  -> marketplace normalization

Shared workflow state
  + draft persistence
  -> event creation workflow

Workflow endpoints
  + transactional service logic
  + policy enforcement
  -> scheduling and booking engine

Chat domain
  + notifications
  -> realtime user feedback

Scheduling engine
  + outbox / ops visibility
  -> operational reliability patterns
```

## Prerequisite Table

| Topic | Must understand first | Why |
| --- | --- | --- |
| Protected navigation | React routing, auth state | The route tree depends on identity |
| Event creation wizard | local/shared state, draft persistence | Step flows need state across pages |
| DRF workflow endpoints | serializers, views, URL routing | Actions differ from CRUD |
| Marketplace resource normalization | roles, provider domains, relationships | You cannot normalize what you do not recognize as related |
| Availability slot materialization | rules, time windows, persistence | Slots are derived, not primary |
| Checkout holds | booking requests, policies, time-based validity | Holds exist to guard a transition |
| Webhook/outbox operations | lifecycle transitions, failure modes | Async side effects come after authoritative state changes |

## Core Abstractions That Repeat

### Identity-Scoped Data
- Why it is foundational: most queries, permissions, and dashboards depend on “who is asking.”
- Where it appears: `me` endpoint, dashboard routes, provider-scoped queries, request ownership checks.
- Capability unlocked: you can consistently scope views, queries, and actions.

### Role-Conditioned Behavior
- Why it is foundational: the same object can be viewed differently by organizers and providers.
- Where it appears: route guards, create permissions, booking actions, planner scope selection.
- Capability unlocked: you can design one platform with multiple valid interaction modes.

### Lifecycle State
- Why it is foundational: drafts, requests, bookings, bids, and notifications all move through states.
- Where it appears: publish flow, request approval/countering, booking completion/cancel, notification read/unread.
- Capability unlocked: you can model behavior as transitions, not scattered flags.

### Temporary vs Committed State
- Why it is foundational: workflow correctness depends on distinguishing provisional state from permanent state.
- Where it appears: draft events vs published, booking requests vs confirmed bookings, checkout holds vs completed transactions.
- Capability unlocked: you can design retry-safe workflows and prevent collision-caused data corruption.

### Derived Views of Truth
- Why it is foundational: slots, ops summaries, dashboards, unread counts, and manifests are synthesized from underlying records.
- Where it appears: availability slots, event manifests, summary endpoints, planner views.
- Capability unlocked: you can distinguish source-of-truth tables from convenience views.

## Grounded Example
Small structural example:
- The scheduling system introduces `MarketplaceResource`, `ResourcePolicy`, `AvailabilityRule`, `AvailabilityException`, `AvailabilitySlot`, `BookingRequest`, `Booking`, and `CheckoutSession`.

General pattern:
- This is a layered domain model. Later concepts are built by composing earlier ones rather than inventing disconnected entities.

Intent behind the design:
- The backend wants to isolate stable abstractions: what is being booked, under what rules, at what times, through what lifecycle.

How to recreate without copying:
- Identify the stable nouns in the domain.
- Decide which nouns are primary records and which are derived operational views.
- Build dependency order so the complex workflows can be explained as combinations of simpler concepts.
