# 10. Minimal Learning Path

## Purpose
This chapter extracts the smallest set of topics required to rebuild a functional version of the system without overlearning. It is intentionally pragmatic.

Prerequisites: none beyond general programming ability.  
Recommended companion: keep [02 Knowledge Graph](./02-knowledge-graph.md) open while using this chapter.

## Smallest Viable Curriculum

### Stage 1: React Essentials
Must know:
- components, props, and state
- `useEffect`
- `useContext`
- React Router nested routes
- Fetch API and `localStorage`

Why it matters here:
- these concepts are sufficient to understand protected pages, auth state, multi-step routes, and browser persistence

Recommended sources:
- React docs on components, state, effects, and context
- React Router docs on nested routes and params
- MDN docs on Fetch API and localStorage

### Stage 2: Django Essentials
Must know:
- models and relationships
- migrations
- URL routing
- DRF serializers and viewsets
- `APIView` for custom workflows
- [JWT](../../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> auth basics

Why it matters here:
- these concepts are sufficient to understand domain apps, [API contracts](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/API%20Contract.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, The rules a contract writes down: resource paths with the right HTTP verbs, a vers..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=168 "System design big archive, The 5 Pillars of API Design, API design as defining the inputs and outputs first, then the style, the relationships between entiti..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods must be idempotent, an idempotency key kept in Redis or a database so a retry gets the..."), [▶1](https://www.youtube.com/watch?v=DQ57zYedMdQ&t=239s "Hello Interview, API Design in System Design Interviews w/ Meta Staff Engineer, REST, 3:59 to 12:44, Resources as plural nouns in the path, the HTTP methods ..."), [▶2](https://www.youtube.com/watch?v=1LpItQ3vPeQ&t=29s "Nerdi Coda, Use contract-first approach and generate code with OpenAPI, Contract-first methodology, 0:29 to 1:25, Writing the contract before the code, so do..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md "The API contract on paper, system-design/foundations, chapter 02. Works the corner shop's four routes with their request and response JSON, every status code...")</sub>, custom workflow actions, and authenticated access

Recommended sources:
- Django docs on models, queries, and URL routing
- DRF docs on serializers, viewsets, generic views, and `APIView`
- SimpleJWT docs on access and refresh tokens

### Stage 3: System-Specific Concepts
Must know:
- draft workflows
- role-based marketplace modeling
- booking lifecycle
- scheduling policy and availability logic

Why it matters here:
- these are the product-specific abstractions that turn a generic React/Django stack into this system

Recommended reading order:
1. [03 Frontend Foundations](./03-frontend-foundations.md)
2. [04 Backend Foundations](./04-backend-foundations.md)
3. [05 Marketplace and Role Model](./05-marketplace-and-role-model.md)
4. [06 Event Creation and Draft Workflows](./06-event-creation-and-draft-workflows.md)
5. [07 Scheduling and Booking Engine](./07-scheduling-and-booking-engine.md)

## What You Can Skip Initially
- advanced UI libraries beyond what is needed to read route and state architecture
- deployment details
- deep [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> internals
- detailed ops workflows such as [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dead-letter handling

These matter later, but they are not required to build a functional first reconstruction.

## What Functional Rebuild Competence Looks Like
You can:
- create a React route shell with protected pages
- maintain auth and shared draft state in providers
- design a Django project with domain apps and DRF endpoints
- model providers, events, requests, and bookings
- express a basic scheduling workflow with policies and availability windows
- write async code that handles network errors, [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> errors, and domain errors correctly
- distinguish when to use optimistic updates vs server authority
- place business logic in services, not in views
- validate data at the right layer (models, serializers, services)

You are not yet optimizing for:
- production [observability](../../../../../../Obsidian/Information%20Technology/DevOps/Observability.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=885 "AI engineering, chapter 10, Logs and traces, Works a debugging session: metrics say something broke five minutes ago, the logs from that moment say what happ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=877 "AI engineering, chapter 10, Monitoring and Observability, What monitoring is for, the three numbers that grade it (mean time to detection, mean time to respo..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=26 "System design interview, chapter 1, Logging, metrics, automation, Error logs aggregated in one place, and host, tier-level and business metrics, as the tools..."), [▶1](https://www.youtube.com/watch?v=f4W_eEJC-20&t=284s "KodeKloud, How Prometheus Monitoring Works: Explaining Prometheus Architecture, Prometheus Architecture, 4:44 to 10:50, Prometheus's parts, before the chapte..."), [▶2](https://www.youtube.com/watch?v=zZcxdWJ_tRc&t=220s "Rayan Slim, Prometheus FULL Course: Docker/K8s, PromQL, Grafana & MORE!, Prometheus & Grafana: Docker Compose Monitoring (Module 1), 3:40 to 13:28, Prometheu..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/23-one-order-one-trace.md "One order, one trace, system-design/foundations, plan 23. Every service instrumented with OpenTelemetry and one order's trace opened in Jaeger as a waterfall...")</sub>
- rich realtime behavior
- advanced [concurrency](../../../../../../Obsidian/Information%20Technology/Concurrency/Concurrency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=429 "System design big archive, System Performance Metrics Every Engineer Should Know, Works concurrency as a number: 100 requests a second that each take 5 secon..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=185 "System design interview, chapter 12, Design a chat system, Scalability, Sizes concurrent connections: 1 million concurrent users at about 10 KB of server mem..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=280 "System design big archive, Concurrency is NOT Parallelism, Concurrency as tasks overlapping in time on one core through context switching, good for I/O waits..."), [▶1](https://www.youtube.com/watch?v=I8FeITQvLAk&t=114s "Gaurav Sen, How 100 milliseconds cost Amazon 3 BILLION DOLLARS: Latency, Concurrency and Parallelism, Concurrency Example, 1:54 to 2:28, A worked example of ..."), [▶2](https://www.youtube.com/watch?v=RlM9AfWf1WU&t=13s "ByteByteGo, Concurrency Vs Parallelism!, Concurrency, 0:13 to 1:03, Concurrency defined before parallelism and practical examples of both. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/09-reproduce-the-race.md "Reproduce the race against Attica, projects/attica/architecture-decisions, plan 09. Two concurrent accepts fired at the same provider and date against a runn...")</sub> hardening
- deep profiling and query optimization

Those come later through [08](./08-realtime-and-user-feedback.md), [09](./09-full-stack-integration-patterns.md), [11](./11-reconstruction-mental-models.md), and the deep-dive references [12](./12-javascript-es6-and-async-patterns.md), [13](./13-design-patterns-and-architectural-decisions.md), [14](./14-python-patterns-and-django-specifics.md).
