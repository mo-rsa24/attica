# 01. System Map

## Purpose
This chapter gives you the minimum mental map needed to reason about the system before studying any single feature. The codebase is large enough that reading files in isolation hides the architecture. You need to see the product as a set of interacting domains first.

Prerequisites: basic HTTP, component-based frontend thinking, relational data modeling.  
Follow-up: [02 Knowledge Graph](./02-knowledge-graph.md), [03 Frontend Foundations](./03-frontend-foundations.md), [04 Backend Foundations](./04-backend-foundations.md).

## Runtime Boundaries

### React SPA
- Why it exists: the frontend needs page transitions, protected screens, dashboard views, and long-lived interaction state without full page reloads.
- Where it appears: `frontend/src/App.jsx`, page components, auth provider, event creation context, scheduling planner.
- Capability unlocked: you can reason about the UI as a route tree plus shared client state instead of unrelated screens.

### Django Monolith + API Surface
- Why it exists: the backend groups related domains into apps while serving both HTML-era pieces and modern API endpoints from one project.
- Where it appears: `backend/main/main/settings.py`, `backend/main/main/urls.py`, app-level `views.py`, `api_urls.py`, serializers, models.
- Capability unlocked: you can identify which logic belongs to domain apps and how those apps are stitched into one platform.

### Realtime Layer
- Why it exists: chat and notifications are better expressed as pushed events than repeated full-page reloads.
- Where it appears: Channels routing, chat consumers, notifications routing, websocket endpoints.
- Capability unlocked: you can separate synchronous CRUD work from event-driven user feedback.

### Operational/Background Layer
- Why it exists: holds expire, slots are materialized, webhooks need retry paths, and ops needs visibility.
- Where it appears: scheduling management commands, outbox and dead-letter models, ops APIs.
- Capability unlocked: you can think beyond request/response and design for system maintenance.

## Product Domains

### Identity and Roles
- Why it exists: the same account system supports organizers, artists, vendors, venue managers, and admins.
- Where it appears: users APIs, profile pages, dashboard routing, permission checks in provider apps.
- Mastery unlocks: you can rebuild the platform around personas instead of separate products.

### Marketplace Discovery
- Why it exists: users browse artists, venues, services, and events before they book or plan anything.
- Where it appears: artist/vendor/location listings, popular endpoints, search views, public detail pages.
- Mastery unlocks: you can distinguish catalog-style read models from workflow-heavy write models.

### Event Planning and Drafting
- Why it exists: organizers assemble an event over several steps, not in one form submission.
- Where it appears: event drafts, listing wizard pages, event creation context, publish logic.
- Mastery unlocks: you can model progressive completion and resumed sessions.

### Booking and Negotiation
- Why it exists: providers and organizers need structured requests, status transitions, and discussion around terms.
- Where it appears: chat booking APIs, scheduling requests and bookings, review flows.
- Mastery unlocks: you can reason about workflows as state transitions rather than plain CRUD.

### Scheduling and Availability
- Why it exists: provider booking requires explicit availability windows, exceptions, capacities, and policy checks.
- Where it appears: scheduling models, services, planner UI, ops pages.
- Mastery unlocks: you can separate “is this resource visible?” from “is this resource actually bookable now?”.

### Realtime Communication and Notifications
- Why it exists: booking activity creates conversational and informational feedback loops.
- Where it appears: chat rooms, messages, bids, notification list/unread endpoints, websocket routes.
- Mastery unlocks: you can connect workflow events to user-facing feedback.

## Main Data-Flow Loops

### Browse → Inspect → Shortlist
- User sees listing data, detail pages, and recommendations.
- Mostly read-heavy, cache-friendly, and public or lightly personalized.
- Appears in event, artist, vendor, and location list/detail endpoints.

### Create Event → Enrich Draft → Publish
- Organizer starts an event, moves through wizard steps, persists partial progress, and eventually publishes.
- Appears in event draft APIs and React context-backed step pages.
- This is the main “long-lived content workflow” in the system.

### Search Availability → Request/Approve → Hold → Confirm Booking
- Organizer selects time/resource combinations, creates requests, handles approval or countering, starts checkout, then completes a booking.
- Appears strongly in the scheduling subsystem.
- This is the main “lifecycle workflow with correctness constraints.”

### Message → Notify → Act
- User sends message or bid, other participant receives notification, action produces another state transition.
- Appears in chat views, notification utilities, websocket broadcasts.
- This is the main “feedback loop” binding human negotiation to structured workflow state.

## Grounded Example
Small structural example:
- The frontend route tree includes dashboards, booking pages, a listing wizard, search, and scheduling pages.
- The backend URL tree includes separate app namespaces for events, users, vendors, artists, locations, chat, notifications, and scheduling.

General pattern:
- The system is not one giant booking feature. It is a platform with multiple read-oriented domains and several workflow-oriented domains sharing identity and roles.

Intent behind the design:
- Different product surfaces can evolve independently while still reusing auth, profiles, and domain models.

How to recreate without copying:
- Start by defining product domains and user journeys.
- Then decide which journeys are mostly catalog reads, which are long-lived drafts, and which are stateful workflows with correctness rules.
- Only after that choose routes, apps, and API boundaries.
