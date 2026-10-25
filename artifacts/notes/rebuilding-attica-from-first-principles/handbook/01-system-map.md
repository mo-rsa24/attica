# 01. System Map

## Purpose
This chapter gives you the minimum mental map needed to reason about the system before studying any single feature. The codebase is large enough that reading files in isolation hides the architecture. You need to see the product as a set of interacting domains first.

Prerequisites: basic [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub>, component-based frontend thinking, relational data modeling.  
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
- Where it appears: Channels routing, chat consumers, notifications routing, [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> endpoints.
- Capability unlocked: you can separate synchronous CRUD work from event-driven user feedback.

### Operational/Background Layer
- Why it exists: holds expire, slots are materialized, [webhooks](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> need retry paths, and ops needs visibility.
- Where it appears: scheduling management commands, [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> and dead-letter models, ops APIs.
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
- Where it appears: chat rooms, messages, bids, notification list/unread endpoints, [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> routes.
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
- Appears in chat views, notification utilities, [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> broadcasts.
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
- Then decide which journeys are mostly catalog reads, which are long-lived drafts, and which are [stateful](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Stateless%20Service.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works user A's case: on a stateful server A's session lives on server 1, so a request routed to serve..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=184 "System design interview, chapter 12, Design a chat system, High-level design, One system split into stateless request and response services behind a load bal..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to stateless authentication, A token that carries its own claims, so the server checks a signature instead of looking..."), [▶1](https://www.youtube.com/watch?v=20tpk8A_xa0&t=101s "Hayk Simonyan, Stateful vs Stateless Architectures Explained, Online shopping example, 1:41 to 2:35, The two architectures applied to one shopping cart, foll..."), [▶2](https://www.youtube.com/watch?v=nFPzI_Qg3FU&t=520s "Hussein Nasser, Stateful vs Stateless Applications (Explained by Example), Stateless Application, 8:40 to 14:44, The stateless version of the application the..."), [◆](../../../../../../goal-setting/learning/system-design/scalability/MASTER_PLAN.md "System Design: Scalability, system-design/scalability. Its second objective takes a toy service holding sessions in memory, makes it stateless, and runs it b...")</sub> workflows with correctness rules.
- Only after that choose routes, apps, and API boundaries.
