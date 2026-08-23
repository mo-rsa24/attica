# Attica create-event: system specification

## 1. Purpose of this document

Attica is a two-sided marketplace for putting on events. This document states what the create-event
path is meant to do, how it is meant to behave, and what is true about it today. It is written for
people who will make architectural decisions about it and who have no prior exposure to the
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
with `pending`, `processing`, `sent`, `failed`, `dead_letter`, plus a dead-letter table and webhook
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
uniqueness constraint on the slot window and by conflict-incident recording that distinguishes an
application-level catch from a database-level one. Whether the read path and the write path agree has
not been established.

Requests carry a 48-hour expiry. Nothing currently runs the expiry.

## 8. Real-time surfaces

Four things should reach a screen without it asking: a request arriving for a provider, an answer
arriving for an organizer, a message in a conversation, and the summary of where an event stands.

Today the transport exists and is used unevenly. WebSockets are configured, proxied, and carry chat.
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

**FR-9.** Publishing is idempotent and converts exactly the agreements that are ready.

**FR-10.** Every state change that a waiting party cares about reaches them without a manual refresh.

**FR-11.** Every path through the system, for every role and every outcome, has a written recipe for
walking it and a written recipe for proving it works.

## 10. Non-functional requirements

**NFR-1. Correctness under contention.** Concurrent attempts on the same resource and window resolve
deterministically and identically every time, and both parties are told. This is the highest priority
property in the system. The current storage engine does not provide the row-level locking the code
assumes, which makes this presently unmet rather than merely untested.

**NFR-2. Liveness.** State changes reach interested parties without polling, with a defined behaviour
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

**NFR-9. Observability.** Conflicts, failed deliveries and state transitions are recorded and
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

**I-5.** A retried operation with the same idempotency key produces the same outcome and no
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
7. **Scheduled execution.** Expiry, materialisation and outbox dispatch all exist as commands with
   nothing running them. This is one decision, not three.
8. **Delivery.** Whether the media path is uploaded through the application or direct to storage.
   Currently synchronous through the application to local disk, with no derived variants.
9. **Release.** Continuous integration exists. There is no deployment mechanism, so no progressive
   rollout strategy is currently expressible.

## 13. Technology

Django and Django REST Framework on the backend, with Channels for WebSockets. React on the front.
SQLite as the datastore. Redis for caching and as the channel layer. Everything runs on one machine
today.

These are surface facts, not commitments. Section 12 contains the ones already known to be
load-bearing.

## 14. Acceptance

One person, playing every role in sequence, creates an event, requests a set of artists, venues and
vendors, converses with each, logs in as each provider to answer, and returns to watch the event
converge and publish.

Nothing is lost, nothing surprises them, nothing requires explanation, and at no point do they
refresh a page to discover what happened.
