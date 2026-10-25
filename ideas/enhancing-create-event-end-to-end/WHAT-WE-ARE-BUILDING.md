# Attica create-event: system specification

## 1. Purpose of this document

Attica is a two-sided marketplace for putting on events. This document states what the create-event
path is meant to do, how it is meant to behave, and what is true about it today. It is written for
people who will make architectural decisions about it and who have no [prior](../../../../Obsidian/Mathematics/Statistics/Bayesian%20Inference/Prior%20Distribution.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/machine-learning/probabilistic-machine-learning-an-introduction.pdf#page=150 "Probabilistic machine learning: an introduction, sections 4.6.1 and 4.6.2, Works with numbers: a conjugate prior keeps the posterior in the prior's own famil..."), [2](../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=519 "Introduction to probability for data science, sections 8.3.1 and 8.3.2, The trio of likelihood, prior and posterior, the prior that ML lacks and MAP adds (pa..."), [3](../../../../Obsidian/Mathematics/references/textbooks/machine-learning/mathematics-for-machine-learning.pdf#page=191 "Mathematics for machine learning, section 6.3, The prior p(x) as what is known about an unobserved variable before observing y, inside Bayes' theorem."), [▶1](https://www.youtube.com/watch?v=5Vawq2b5F7c&t=560s "TileStats, Bayesian statistics, the basics, 9:20 to 12:47, The prior distribution, in the chapter of that name, between Bayes' theorem and computing the post..."), [▶2](https://www.youtube.com/watch?v=-1dYY43DRMA&t=786s "ritvikmath, What the Heck is Bayesian Stats ??, 13:06 to 16:07, Updating prior beliefs with the data. Chapter-timed."), [◆](../../../../goal-setting/learning/deep-learning/generative-models/03-sampling-from-a-graph/plans/25-map-derived.md "Derive MAP, and draw the prior as a parent of θ, deep-learning/generative-models/03-sampling-from-a-graph, plan 25. A Beta(2, 2) prior on a coin's θ, drawn a...")</sub> exposure to the
codebase.

It deliberately stops short of implementation. It names domain entities and states because those are
the vocabulary, not because they are prescriptions.

## 2. The product in one paragraph

An organizer describes an event, sees which venues, artists and vendors are free in their window,
asks the ones they want to work it, negotiates with them by message, and publishes once enough of
them have agreed. Providers manage their own availability, receive those requests, and accept,
decline, or counter. The waiting in the middle is the product: an event is a set of independent
agreements that have to converge before it is real.

## 3. Actors

| Actor | What they do |
|---|---|
| Organizer | Creates events, requests providers, negotiates, publishes |
| Artist | Performs. Manages availability, answers requests |
| Vendor | Supplies catering, drinks, equipment. Same lifecycle as artist |
| Venue manager | Owns a place. Same lifecycle, different scale of commitment |
| Ticket buyer | Buys into a published event |

Five roles are enforced at both the API and the interface layer. The system also carries a second,
older user classification that overlaps these five and does not agree with them. Reconciling the two
is an open question in section 12.

## 4. Domain model

**Resources and their availability.** A `MarketplaceResource` is the bookable thing: a venue, an
artist, or a vendor. A `ResourcePolicy` attached to it declares its booking mode, which is already
modelled as `instant`, `approval_required`, or `hybrid`, and its deposit terms. An
`AvailabilityRule` is a recurring pattern the provider sets, daily or weekly. An
`AvailabilityException` is a blackout or an override on a specific date. An `AvailabilitySlot` is a
concrete bookable window derived from those, and it is what a search actually reads.

**The transaction.** A `BookingRequest` is an organizer asking. Its lifecycle is `draft`, `pending`,
`approved`, `declined`, `counter_proposed`, `withdrawn`, `expired`. A `CheckoutSession` (`active`,
`finalized`, `released`, `expired`) covers payment. A `Booking` is the committed result, with its own
eight states from `hold` through `confirmed` to `completed`, `cancelled` or `disputed`, and a source
of `instant`, `request` or `admin_override`. A `CalendarEvent` projects all of this onto a calendar
as `available`, `pending`, `booked`, `blackout` or `hold`.

**The event itself.** An `EventDraft` holds everything the organizer has entered as a single
document, plus a pointer to which step they are on. It becomes an `Event` at publish. Assets attach
to the draft, not to the event.

**Conversation.** A `ChatRoom` per pairing, `Message`, `ChatAttachment`, and `ChatBid`, which is an
offer embedded in a conversation. Negotiation happens here, not in a form.

**Integrity and delivery.** An `IdempotencyRecord` keyed on owner, endpoint and key. An `OutboxEvent`
with `pending`, `processing`, `sent`, `failed`, `dead_letter`, plus a dead-letter table and [webhook](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub>
targets. An `AuditLog`. A `BookingConflictIncident` recording every conflict and whether it was
caught by an application check or a database constraint. A `Notification`. A `Review`.

**The most important structural fact in this document.** There are four separate representations of
"someone booked something", all of them live and all served through different endpoints: the
scheduling one described above, a second one inside the chat app with its own five states and its own
provider-availability table, and two more scoped to venues and artists respectively. By reference
count in their own views and serializers, the chat one is currently the most used. They do not share
a state machine, a conflict check, or a notion of availability.

## 5. The create-event flow

The organizer's path is a long walk with a draft behind it, resumable at any point. Grouped by
purpose it is seven stages.

1. **Describe.** What the event is, its type, its size, its dates and times.
2. **Schedule and discover.** Pick the window, then search who is free in it across venues, artists
   and vendors, with price and typical response time shown per provider.
3. **Request.** Send a request to book to each chosen provider. These are independent and
   asynchronous. One event typically means many outstanding at once.
4. **Place.** Search and pick a location on a map. Deliberately separate from booking a venue,
   because many events happen somewhere unlisted.
5. **Price.** Ticket price, purchase limits, refund policy, seating, age restriction, visibility.
6. **Dress.** Amenities, images, video, seating chart. Media can be large.
7. **Publish.** The draft becomes an event and approved requests become bookings.

**On the count.** A live trace of the current implementation found eleven distinct stages across
eight screen components, one of which never renders, and the on-screen step counter does not agree
with either number. Three of the eleven are not screens at all: one is an action inside another
screen, one advances a counter and nothing else, one is a splash with no input. The seven above are
the purposeful grouping. Making the counts agree is in scope.

## 6. How availability is derived

Providers express availability as a pattern, not as dates. The system expands that pattern into
concrete slots, converts them to UTC, and stores them. Search reads the stored slots.

This is a materialised projection. Its correctness therefore depends on two things that are
currently unaddressed: something must run the expansion on a schedule, and something must invalidate
or regenerate slots when the underlying rule or exception changes. Neither is in place.

## 7. Booking lifecycle and contention

A request is created, sits pending, and is answered. Capacity is reserved at booking creation and at
checkout start. **It is not reserved when the request is made.** Two organizers can hold pending
requests against the same resource and window simultaneously, and neither is informed.

Conflict detection exists in several forms across the read path and the write path, backed by a
[uniqueness constraint](../../../../Obsidian/Information%20Technology/Database%20Systems/Unique%20Constraint.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=288 "Database systems textbook, section 7-2f, SQL constraints, Works it on the LINE table: the primary key is '(INV_NUMBER, LINE_NUMBER)', and 'CONSTRAINT LINE_UI..."), [2](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=289 "Database systems textbook, section 7-2g, SQL indexes, 'CREATE UNIQUE INDEX P_CODEX ON PRODUCT(P_CODE)' and the 'duplicate value in index' error it raises, th..."), [3](../../../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=286 "Database systems textbook, section 7-2f, SQL constraints, UNIQUE in the ANSI list beside NOT NULL, DEFAULT and CHECK, then 'CONSTRAINT CUS_UI1 UNIQUE (CUS_LN..."), [▶1](https://www.youtube.com/watch?v=w6GzQa9R7-4&t=114s "Hussein Nasser, Concurrent Requests and Unique Keys on Web Applications, Duplicate a key, 1:54 to 2:15, A second insert of the same key refused on a live tab..."), [▶2](https://www.youtube.com/watch?v=w6GzQa9R7-4&t=213s "Hussein Nasser, Concurrent Requests and Unique Keys on Web Applications, Spice things up, 3:33 to 8:29, The same key inserted from concurrent transactions, w..."), [◆](../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/03-constraints.md "Database constraints: UNIQUE, CHECK, NOT NULL, foreign keys, projects/attica/architecture-decisions, plan 03. Reads 'unique_provider_date' in Attica's models...")</sub> on the slot window and by conflict-incident recording that distinguishes an
application-level catch from a database-level one. Whether the read path and the write path agree has
not been established.

Requests carry a 48-hour expiry. Nothing currently runs the expiry.

## 8. Real-time surfaces

Four things should reach a screen without it asking: a request arriving for a provider, an answer
arriving for an organizer, a message in a conversation, and the summary of where an event stands.

Today the transport exists and is used unevenly. [WebSockets](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> are configured, proxied, and carry chat.
A per-user notification channel exists and clients subscribe to it, but nothing ever publishes to
it, so that socket is connected at one end only. Conversations additionally poll on a fixed interval
alongside the socket. The booking path uses neither: it writes a notification row and stops.

## 9. Functional requirements

**FR-1.** Every role can authenticate and reach its own surfaces, with known-good credentials.

**FR-2.** Data entered at any stage remains correct and available at every later stage, entered once.

**FR-3.** Availability presented to an organizer reflects the provider's real availability at the
moment of presentation.

**FR-4.** A request against a resource and window resolves contention at request time, not at
approval or checkout time.

**FR-5.** An organizer can see, in one place, the status of every outstanding request, what has been
agreed, what has been refused, what is expiring, and whether the event is viable.

**FR-6.** A provider can see, answer, decline or counter every request addressed to them, and manage
their own availability.

**FR-7.** Organizer and provider can converse, and an offer can be carried inside that conversation.

**FR-8.** A draft survives departure and resumes from any entry point, not only the default one.

**FR-9.** Publishing is [idempotent](../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of 'POST /payments' with an 'Idempotency-Key': a new key ...")</sub> and converts exactly the agreements that are ready.

**FR-10.** Every state change that a waiting party cares about reaches them without a manual refresh.

**FR-11.** Every path through the system, for every role and every outcome, has a written recipe for
walking it and a written recipe for proving it works.

## 10. Non-functional requirements

**NFR-1. Correctness under contention.** Concurrent attempts on the same resource and window resolve
deterministically and identically every time, and both parties are told. This is the highest priority
property in the system. The current storage engine does not provide the row-level locking the code
assumes, which makes this presently unmet rather than merely untested.

**NFR-2. Liveness.** State changes reach interested parties without [polling](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub>, with a defined behaviour
for a recipient who is offline. Where push is genuinely unavailable, the interface states what it is
doing rather than appearing idle.

**NFR-3. Perceived responsiveness.** Every interaction produces visible feedback immediately,
independent of round-trip completion. Long operations show progress.

**NFR-4. Durability of in-progress work.** No user input is lost to a refresh, a crash, or a week of
absence.

**NFR-5. Consistency of interaction.** One loading treatment, one failure treatment, one navigation
model, across every screen.

**NFR-6. Visible failure.** Failures are surfaced, are legible, and persist until acknowledged.
Silent failure is unacceptable in a system whose core experience is waiting.

**NFR-7. Single source of truth per concept.** One representation of a booking, one of availability,
one state machine. Section 4 records four and four respectively.

**NFR-8. Measured performance.** Targets are set from measurement of the real path under a realistic
multi-provider scenario. No capacity or delivery work is undertaken without a number that showed a
problem.

**NFR-9. [Observability](../../../../Obsidian/Information%20Technology/DevOps/Observability.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=885 "AI engineering, chapter 10, Logs and traces, Works a debugging session: metrics say something broke five minutes ago, the logs from that moment say what happ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=877 "AI engineering, chapter 10, Monitoring and Observability, What monitoring is for, the three numbers that grade it (mean time to detection, mean time to respo..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=26 "System design interview, chapter 1, Logging, metrics, automation, Error logs aggregated in one place, and host, tier-level and business metrics, as the tools..."), [▶1](https://www.youtube.com/watch?v=f4W_eEJC-20&t=284s "KodeKloud, How Prometheus Monitoring Works: Explaining Prometheus Architecture, Prometheus Architecture, 4:44 to 10:50, Prometheus's parts, before the chapte..."), [▶2](https://www.youtube.com/watch?v=zZcxdWJ_tRc&t=220s "Rayan Slim, Prometheus FULL Course: Docker/K8s, PromQL, Grafana & MORE!, Prometheus & Grafana: Docker Compose Monitoring (Module 1), 3:40 to 13:28, Prometheu..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/23-one-order-one-trace.md "One order, one trace, system-design/foundations, plan 23. Every service instrumented with OpenTelemetry and one order's trace opened in Jaeger as a waterfall...")</sub>.** Conflicts, failed deliveries and state transitions are recorded and
inspectable. Partially present already, through conflict incidents, an audit log and a dead-letter
table.

**NFR-10. Verifiability.** Every claim about behaviour is backed by an executed test or an observed
walkthrough.

## 11. Invariants

**I-1.** A resource is never committed to two overlapping bookings.

**I-2.** A slot presented as available is derivable from a currently valid rule.

**I-3.** A request in a terminal state never transitions again.

**I-4.** A published event's confirmed bookings are exactly the requests that were approved and
ready at publish time.

**I-5.** A retried operation with the same [idempotency key](../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of 'POST /payments' with an 'Idempotency-Key': a new key ...")</sub> produces the same outcome and no
additional side effects.

**I-6.** No user is shown, or able to act on, a surface their role does not grant.

## 12. Open design questions

1. **Convergence of the four booking representations.** Which survives, what migrates, and in what
   order. Every other decision here is downstream of this one.
2. **What a pending request holds.** A soft hold, a queue position, or nothing, and what the
   organizer is shown either way. The booking-mode field already anticipates instant, approval and
   hybrid, so the policy hook exists and the semantics do not.
3. **Event-level viability.** Whether an event is a set that succeeds or fails as a whole, and what
   happens to the remaining requests when a critical one is refused.
4. **Slot invalidation.** How a rule change propagates to already-materialised slots and to pending
   requests standing on them.
5. **Reconciliation of the two user classifications.**
6. **Storage engine.** Required by NFR-1, independent of any performance argument.
7. **Scheduled execution.** Expiry, materialisation and [outbox](../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatch all exist as commands with
   nothing running them. This is one decision, not three.
8. **Delivery.** Whether the media path is uploaded through the application or direct to storage.
   Currently synchronous through the application to local disk, with no derived variants.
9. **Release.** [Continuous integration](../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../goal-setting/learning/system-design/devops-and-deployment/plans/07-two-remotes-two-branch-rules.md "Two remotes, two branch rules, a refused push, system-design/devops-and-deployment, plan 07. Branch protection on GitHub and a branch policy on Azure Repos c...")</sub> exists. There is no deployment mechanism, so no progressive
   rollout strategy is currently expressible.

## 13. Technology

Django and Django [REST](../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> Framework on the backend, with Channels for [WebSockets](../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>. React on the front.
SQLite as the datastore. [Redis](../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> for [caching](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> and as the channel layer. Everything runs on one machine
today.

These are surface facts, not commitments. Section 12 contains the ones already known to be
load-bearing.

## 14. Acceptance

One person, playing every role in sequence, creates an event, requests a set of artists, venues and
vendors, converses with each, logs in as each provider to answer, and returns to watch the event
converge and publish.

Nothing is lost, nothing surprises them, nothing requires explanation, and at no point do they
refresh a page to discover what happened.
