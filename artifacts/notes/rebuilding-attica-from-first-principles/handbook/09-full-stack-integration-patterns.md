# 09. Full-Stack Integration Patterns

## Purpose
This chapter explains how the frontend and backend fit together in practice. It focuses on ownership of state, request patterns, error handling, and the line between optimistic UI convenience and backend authority.

Prerequisites: [03 Frontend Foundations](./03-frontend-foundations.md), [04 Backend Foundations](./04-backend-foundations.md), [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md).  
Follow-up: [10 Minimal Learning Path](./10-minimal-learning-path.md), [11 Reconstruction Mental Models](./11-reconstruction-mental-models.md).

## Core Concepts

### API Consumption Strategy
- Why it exists: the frontend mostly calls backend endpoints directly with thin helpers, not a large abstraction-heavy data layer.
- Where it appears: many page-level `fetch` calls and the scheduling API helper module.
- Mastery unlocks: you can choose a lightweight client architecture when the app does not need a full query cache framework.

### Token Refresh and Authenticated Requests
- Why it exists: protected endpoints depend on JWTs that expire.
- Where it appears: auth provider refresh flow and authenticated request headers.
- Mastery unlocks: you can connect session continuity to normal data loading.

### Frontend State vs Backend Truth
- Why it exists: drafts, filters, selected records, and loading flags live in the browser, but bookings, policies, and permissions belong to the server.
- Where it appears: event creation persistence, planner selections, booking detail loads.
- Mastery unlocks: you can decide what can be optimistic and what must be re-read from the server.

### Error Surfaces and Retries
- Why it exists: network failures, permission failures, and policy conflicts are different classes of problems.
- Where it appears: page-level error state, HTTP responses from scheduling and chat actions.
- Mastery unlocks: you can design error handling that respects domain meaning rather than showing one generic failure path.

## Grounded Example
Small example:
- The scheduling planner bootstraps from both `/api/events/my-events/` and scheduling resource endpoints, then uses selected scope and date range to fetch calendar or availability data. The auth token is threaded through the request headers.

General pattern:
- Frontend pages compose several backend read models to create one usable screen.

Intent behind the design:
- The backend exposes domain-oriented APIs; the frontend assembles them into user-oriented workflows.

How to recreate without copying:
- Keep backend contracts domain-shaped.
- Let frontend pages compose them into screen-shaped state.
- Avoid inventing a global “everything store” prematurely.
