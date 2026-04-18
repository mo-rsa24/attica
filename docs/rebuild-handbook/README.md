# Lobola Rebuild Handbook

This handbook is a reverse-engineering curriculum for understanding the Attica system well enough to rebuild a similar product from first principles without copying the original implementation. It is organized as a textbook, not a repo tour: each chapter teaches concepts, explains why they exist in this system, points to where they appear at a high level in the codebase, and shows what capability mastery unlocks.

The system behind this handbook is a role-based marketplace and event platform built with a React single-page application and a Django backend. Its major themes are event drafting, provider discovery, booking and negotiation, scheduling and availability, realtime messaging, and notifications.

## Start Here

**New to the codebase?** Start with [00 Quick Reference](./00-quick-reference.md) for a glossary, decision trees, and antipatterns.

**Short on time?** Skip to [10 Minimal Learning Path](./10-minimal-learning-path.md) for the essential concepts only.

## Reading Order
1. [00 Quick Reference](./00-quick-reference.md) — **START HERE** for glossary and decision trees
2. [01 System Map](./01-system-map.md)
3. [02 Knowledge Graph](./02-knowledge-graph.md)
4. [03 Frontend Foundations](./03-frontend-foundations.md)
4. [04 Backend Foundations](./04-backend-foundations.md)
5. [05 Marketplace and Role Model](./05-marketplace-and-role-model.md)
6. [06 Event Creation and Draft Workflows](./06-event-creation-and-draft-workflows.md)
7. [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md)
8. [08 Realtime and User Feedback](./08-realtime-and-user-feedback.md)
9. [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md)
10. [10 Minimal Learning Path](./10-minimal-learning-path.md)
11. [11 Reconstruction Mental Models](./11-reconstruction-mental-models.md)
12. [12 JavaScript ES6 and Async Patterns](./12-javascript-es6-and-async-patterns.md) — **NEW**
13. [13 Design Patterns and Architectural Decisions](./13-design-patterns-and-architectural-decisions.md) — **NEW**
14. [14 Python Patterns and Django Specifics](./14-python-patterns-and-django-specifics.md) — **NEW**

## How To Use This Handbook
- Read chapters `01` and `02` first to build a system-wide map.
- Use [03 Frontend Foundations](./03-frontend-foundations.md) and [04 Backend Foundations](./04-backend-foundations.md) to fill framework gaps before going deeper into product domains.
- Treat [05](./05-marketplace-and-role-model.md), [06](./06-event-creation-and-draft-workflows.md), and [07](./07-scheduling-and-booking-engine.md) as the core product case studies.
- Use [08](./08-realtime-and-user-feedback.md) and [09](./09-full-stack-integration-patterns.md) to connect the frontend and backend into a working whole.
- Use [10](./10-minimal-learning-path.md) if you need the smallest viable curriculum.
- Finish with [11](./11-reconstruction-mental-models.md) to convert understanding into engineering judgment.
- Reference [12 JavaScript ES6 and Async Patterns](./12-javascript-es6-and-async-patterns.md), [13 Design Patterns and Architectural Decisions](./13-design-patterns-and-architectural-decisions.md), and [14 Python Patterns and Django Specifics](./14-python-patterns-and-django-specifics.md) as deep dives into language-specific and architectural concepts that appear throughout the codebase.

## Pedagogical Table of Contents

### Beginner Layer

#### 1. System Boundaries and Product Domains
- Why it exists: you need a mental map before individual features make sense.
- Where it appears: frontend route tree, Django app layout, API namespaces, websocket endpoints.
- Mastery unlocks: the ability to explain what the system does end to end and choose sensible rebuild boundaries.

#### 2. Role-Based Product Thinking
- Why it exists: organizers, artists, vendors, venue managers, and admins see different slices of the same platform.
- Where it appears: user/profile APIs, dashboards, booking flows, scheduling resources.
- Mastery unlocks: the ability to design one platform that supports multiple personas without duplicating everything.

#### 3. React as a Route-Driven UI Shell
- Why it exists: the frontend is a single-page app organized around pages, protected routes, and shared providers.
- Where it appears: `frontend/src/App.jsx`, auth provider, event-creation context, page components.
- Mastery unlocks: the ability to design the frontend shell and decide where state should live.

#### 4. Django as a Multi-App API Backend
- Why it exists: the backend is a Django project divided into domain apps that expose REST and websocket surfaces.
- Where it appears: `backend/main/main/settings.py`, `main/urls.py`, domain app `views.py` and serializers.
- Mastery unlocks: the ability to structure a backend by domain and expose coherent APIs.

### Intermediate Layer

#### 5. Authentication and Protected API Access
- Why it exists: most workflows depend on the current user, their roles, and access tokens.
- Where it appears: accounts endpoints, token refresh logic, protected routes, authenticated fetches.
- Mastery unlocks: the ability to connect identity to both UI routing and backend authorization.

#### 6. Shared State and Long-Lived Workflows
- Why it exists: multi-step event creation and booking flows cannot live entirely in local component state.
- Where it appears: React context/reducer, local persistence, draft APIs.
- Mastery unlocks: the ability to build resumable workflows instead of fragile forms.

#### 7. REST Surface Design and Workflow Endpoints
- Why it exists: some resources are CRUD-oriented while others are lifecycle transitions.
- Where it appears: DRF `ModelViewSet`s, `APIView`s, router-generated URLs, custom action endpoints.
- Mastery unlocks: the ability to design clean APIs for both data and behavior.

#### 8. Marketplace Normalization
- Why it exists: artists, vendors, and venues share booking-related behavior but still keep domain-specific attributes.
- Where it appears: legacy provider apps and the scheduling subsystem's `MarketplaceResource`.
- Mastery unlocks: the ability to generalize domain variants without erasing their differences.

#### 9. Draft-Publish Content Lifecycles
- Why it exists: events are assembled over time and become public only when sufficiently complete.
- Where it appears: event drafts, wizard steps, publish endpoints, summary screens.
- Mastery unlocks: the ability to model progressive completion and safe publishing.

### Advanced Layer

#### 10. Scheduling as Policy + Availability + Lifecycle State
- Why it exists: provider booking requires more than a single “book now” button.
- Where it appears: scheduling models, services, APIs, planner pages, ops views.
- Mastery unlocks: the ability to design a real scheduling engine with policies, conflicts, and holds.

#### 11. Realtime Feedback Loops
- Why it exists: booking negotiation and notifications need low-latency feedback.
- Where it appears: chat room APIs, websocket routing, notifications endpoints and consumers.
- Mastery unlocks: the ability to decide when polling is enough and when pushed state matters.

#### 12. Operational Reliability Patterns
- Why it exists: a production booking system needs auditability, retries, and visibility into failures.
- Where it appears: outbox events, dead letters, conflict incidents, management commands, ops dashboards.
- Mastery unlocks: the ability to reason about system behavior after the happy path.

## Core Abstractions Reused Across the System
- `current user`: the lens through which permissions, routes, and queries are scoped.
- `role`: the product-level mechanism that changes available actions and surfaces.
- `resource`: the normalized representation of something bookable.
- `draft`: a not-yet-final artifact that can be progressively completed.
- `workflow state`: the distinction between static data and lifecycle transitions.
- `authoritative backend state`: the final source of truth when frontend and backend temporarily diverge.

## Suggested Navigation
- If React patterns feel weak, go directly to [03 Frontend Foundations](./03-frontend-foundations.md), then [12 JavaScript ES6 and Async Patterns](./12-javascript-es6-and-async-patterns.md).
- If Django or DRF patterns feel weak, go directly to [04 Backend Foundations](./04-backend-foundations.md), then [14 Python Patterns and Django Specifics](./14-python-patterns-and-django-specifics.md).
- If you want to understand the architectural reasoning behind decisions, read [13 Design Patterns and Architectural Decisions](./13-design-patterns-and-architectural-decisions.md).
- If the current work is booking-related, pair [06 Event Creation and Draft Workflows](./06-event-creation-and-draft-workflows.md) with [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md).
- If the current work is messaging or alerts, pair [08 Realtime and User Feedback](./08-realtime-and-user-feedback.md) with [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md).
