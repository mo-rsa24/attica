# 02. Knowledge Graph

## Purpose
This chapter turns the handbook into a dependency map. It tells you what is foundational, what is derived, and which concepts are combinations of earlier ones.

Prerequisites: [01 System Map](./01-system-map.md).  
Follow-up: use this chapter as a routing table while reading the rest of the handbook.

## Foundational Topics
- [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> request/response thinking
- React component and state basics
- Django app/model/view basics
- [Authentication](../../../../../../Obsidian/Information%20Technology/Security/Authentication.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works a concrete case: user A's session data lives on server 1, so a request routed to server 2 fails..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=403 "System design big archive, 5 REST API Authentication Methods, Basic authentication, session cookies, signed tokens, OAuth access tokens and API keys side by ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=36 "System design big archive, Session, Cookie, JWT, Token, SSO, and OAuth 2.0 Explained in One Diagram, How a login is remembered: a server-side session with a ..."), [▶1](https://www.youtube.com/watch?v=_t8EPImx9LI&t=240s "Hussein Nasser, Five Password Authentications From Least to Most Secure, Auth Method 1: Authentication password plain text, 4:00 to 8:00, The first of five p..."), [▶2](https://www.youtube.com/watch?v=fyTxwIa-1U0&t=18s "ByteByteGo, Session Vs JWT: The Differences You May Not Know!, Session authentication, 0:18 to 1:23, Session authentication, before the chapter on the JSON W..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06. Section 6.2 logs in to the Django admin with curl, carrying the session cookie and the `csrftoken` ...")</sub> and user identity
- Relational data modeling

These are foundational because almost every later topic depends on them directly.

## Derived Topics
- Protected routing = React routing + [authentication](../../../../../../Obsidian/Information%20Technology/Security/Authentication.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works a concrete case: user A's session data lives on server 1, so a request routed to server 2 fails..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=403 "System design big archive, 5 REST API Authentication Methods, Basic authentication, session cookies, signed tokens, OAuth access tokens and API keys side by ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=36 "System design big archive, Session, Cookie, JWT, Token, SSO, and OAuth 2.0 Explained in One Diagram, How a login is remembered: a server-side session with a ..."), [▶1](https://www.youtube.com/watch?v=_t8EPImx9LI&t=240s "Hussein Nasser, Five Password Authentications From Least to Most Secure, Auth Method 1: Authentication password plain text, 4:00 to 8:00, The first of five p..."), [▶2](https://www.youtube.com/watch?v=fyTxwIa-1U0&t=18s "ByteByteGo, Session Vs JWT: The Differences You May Not Know!, Session authentication, 0:18 to 1:23, Session authentication, before the chapter on the JSON W..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06. Section 6.2 logs in to the Django admin with curl, carrying the session cookie and the `csrftoken` ...")</sub> state
- Event drafting = shared client state + backend persistence + publish lifecycle
- Marketplace normalization = role model + provider domain modeling
- Scheduling engine = normalized resources + policies + availability + workflow transitions + transactional consistency
- Realtime feedback = domain events + [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> delivery + user-facing UI state
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
