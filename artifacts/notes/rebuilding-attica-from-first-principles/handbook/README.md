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
15. [15 Operations and Production Concerns](./15-operations-and-production-concerns.md) — **NEW**

## How To Use This Handbook
- Read chapters `01` and `02` first to build a system-wide map.
- Use [03 Frontend Foundations](./03-frontend-foundations.md) and [04 Backend Foundations](./04-backend-foundations.md) to fill framework gaps before going deeper into product domains.
- Treat [05](./05-marketplace-and-role-model.md), [06](./06-event-creation-and-draft-workflows.md), and [07](./07-scheduling-and-booking-engine.md) as the core product case studies.
- Use [08](./08-realtime-and-user-feedback.md) and [09](./09-full-stack-integration-patterns.md) to connect the frontend and backend into a working whole.
- Use [10](./10-minimal-learning-path.md) if you need the smallest viable curriculum.
- Finish with [11](./11-reconstruction-mental-models.md) to convert understanding into engineering judgment.
- Reference [12 JavaScript ES6 and Async Patterns](./12-javascript-es6-and-async-patterns.md), [13 Design Patterns and Architectural Decisions](./13-design-patterns-and-architectural-decisions.md), [14 Python Patterns and Django Specifics](./14-python-patterns-and-django-specifics.md), and [15 Operations and Production Concerns](./15-operations-and-production-concerns.md) as deep dives into language-specific, architectural, and operational concepts.

## Pedagogical Table of Contents

### Beginner Layer

#### 1. System Boundaries and Product Domains
- Why it exists: you need a mental map before individual features make sense.
- Where it appears: frontend route tree, Django app layout, API namespaces, [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> endpoints.
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
- Why it exists: the backend is a Django project divided into domain apps that expose [REST](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, `POST api/v1/data/shorten` taking the long URL an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. `curl` against two running mocks, reading the status line, headers and ...")</sub> and websocket surfaces.
- Where it appears: `backend/main/main/settings.py`, `main/urls.py`, domain app `views.py` and serializers.
- Mastery unlocks: the ability to structure a backend by domain and expose coherent APIs.

### Intermediate Layer

#### 5. Authentication and Protected API Access
- Why it exists: most workflows depend on the current user, their roles, and access tokens.
- Where it appears: accounts endpoints, token refresh logic, protected routes, authenticated fetches.
- Mastery unlocks: the ability to connect identity to both UI routing and backend [authorization](../../../../../../Obsidian/Information%20Technology/Security/Authorization.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=322 "Systems analysis and design, chapter 8, Access control requirements, Works example requirements: only department managers may change inventory in their own d..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=324 "System design big archive, Access Control Clearly Explained, Role-based access control, attribute-based access control and access control lists, with what ea..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, An API gateway checking a user's JWT claims, or a developer's API key against a key store, before it forwards ..."), [▶1](https://www.youtube.com/watch?v=DT6Zy1X3ytM&t=174s "Hayk Simonyan, Authorization Explained: When to Use RBAC, ABAC, ACL & More, RBAC: Role-Based Access Control, 2:54 to 3:58, Role-based access control, after t..."), [▶2](https://www.youtube.com/watch?v=ZV5yTm4pT8g&t=0s "ByteByteGo, OAuth 2 Explained In Simple Terms, 0:00 to 4:32, OAuth 2, the delegated form, where one site gets limited access to your data on another without ..."), [◆](../../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/16-the-permission-filter.md "Filter by role before ranking, and measure what it changed, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan...")</sub>.

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
- Mastery unlocks: the ability to decide when [polling](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub> is enough and when pushed state matters.

#### 12. Operational Reliability Patterns
- Why it exists: a production booking system needs auditability, retries, and visibility into failures.
- Where it appears: [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> events, dead letters, conflict incidents, management commands, ops dashboards.
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
- If you're planning to deploy to production, read [15 Operations and Production Concerns](./15-operations-and-production-concerns.md) and [what stands between this and production](../../what-stands-between-this-and-production/README.md).
- If the current work is booking-related, pair [06 Event Creation and Draft Workflows](./06-event-creation-and-draft-workflows.md) with [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md).
- If the current work is messaging or alerts, pair [08 Realtime and User Feedback](./08-realtime-and-user-feedback.md) with [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md).
