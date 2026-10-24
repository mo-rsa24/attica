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
- Why they exist: booking systems face retries, [race conditions](../../../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub>, and overlapping time windows.
- Where they appear: service-layer request hashing, [idempotency](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub> records, overlap queries, checkout hold conflict detection.
- Mastery unlocks: you can design APIs that remain correct under repeated or concurrent calls.

### Outbox, Webhooks, Dead Letters, and Ops Visibility
- Why they exist: some side effects should happen after the core write succeeds, and failures need visibility.
- Where they appear: [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event models, [webhook](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> targets, dead letters, ops summary endpoints and viewsets.
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
- [Outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> and ops tooling externalize and observe important transitions.

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
- Scheduling services compute request hashes, store [idempotency](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub> records, enforce policy windows, detect checkout conflicts, create audit records, and emit [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> events.

General pattern:
- When a workflow coordinates many correctness-sensitive steps, it deserves an explicit domain service.

Intent behind the design:
- Booking logic should stay readable and testable under failure and retry conditions.

How to recreate without copying:
- Treat workflow orchestration as a first-class layer. Define inputs, outputs, side effects, and failure cases explicitly.
