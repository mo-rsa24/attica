# Where we landed

Everything worth keeping from the planning session, in one place, so planning can resume without
re-deriving it. Three companion files sit beside this one: `WHAT-WE-ARE-BUILDING.md` is the
specification, `PLAN_WALK.md` is the walk that produced the first scope cut, and
`chatgpt-review/` is the slot for the three architecture reviews this was checked against, which are
**not yet saved there**.

## 1. Settled

**One parent scope.** `plans/create-event-end-to-end`, with a single definition of done.

**`fixing-create-event` is a sub-scope of it**, not a sibling. It lives at
`plans/create-event-end-to-end/plans/fixing-create-event/`, its links resolve from there, and its
running order is a pointer to the parent's.

**Three planes, not one list.** Domain, Performance, Experience, weighted equally. Domain work gates
the other two; after it lands they can run in parallel because they need different skills.

**Build order is by risk, not by dependency between symptoms.** Truth first, screens late. The event
builder polish lands seventh of ten, not third.

**Two blockers come before all of it.** Working credentials for five roles, and a test harness that
authenticates. Neither is architecture and both gate everything after them.

**Every scope carries a runbook pair**: how to walk it by hand, how to prove it works.

**Art direction is inherited, not invented.** The existing flow map carries eleven prompts in one
style. New diagrams adopt it so the whole set reads as one.

**Scope fence.** The target is Airbnb-level interaction quality on deliberately simpler
architecture. Explicitly not being solved: fraud, chargebacks, tax, currency, multi-region,
large-scale abuse.

## 2. The state of the world

The picture changed three times during the session. This is where it ended.

### Built and working

52 indexes on the scheduling models. An outbox with dead-lettering, webhook targets, an audit log
and conflict-incident recording that distinguishes an application catch from a database one. An
idempotency table with a unique constraint on `(owner, endpoint, key)`. A checkout hold:
`checkout_hold_minutes` defaulting to 30, `hold_expires_at` indexed with status, and
`draft_hold_expires_at` on the request. `cancel_booking` as a service with an idempotency key, wired
to a view, emitting a cancellation notification. `MockCheckoutSheet`, `CounterProposalModal` and
`BookingStatusBadge` on the frontend. WebSocket transport with a working `/ws` proxy rule and a chat
consumer that does publish. `framer-motion` 12 already installed. `ResourcePolicy.BookingMode`
carrying `instant`, `approval_required` and `hybrid`.

### Built and inert

**All eleven scheduling management commands.** One materialiser, five expiry commands, two outbox
workers, three seeds. Nothing runs any of them.

**The notification channel.** Clients subscribe to a per-user group. Nothing ever publishes to it.
The socket is wired at one end only.

Most of the booking journey described in the third review is in this category: implemented, correct
looking, and doing nothing because no worker runs and no event is pushed.

### Missing

A payment provider interface, so the mock is a field rather than an adapter. Cancellation policy and
refund tiers. Screen-shaped read endpoints. An event-convergence projection. A real-time event
envelope with a monotonic version and gap detection. One server-state layer on the client. Design
tokens, a typography scale and a motion language. Client-side draft persistence. Direct-to-storage
upload and image variants. Connection pooling. Any deployment mechanism at all. An activity or inbox
surface.

### Broken

Five roles are gated on and two are ever granted. Nine seeded users have no role, so three of the
five dashboards are unreachable. The browser suite runs logged out. Capacity 250 becomes
`attendee_count: 1`. Every field is sent twice, camelCase and snake_case. The draft is fetched four
times on mount. A screen claims 100MB against a 50MB limit. One route never renders and the step
counter disagrees with the routes. The idempotency key is generated per click. `select_for_update`
does not lock on SQLite. Resume works from one entrance only. No loading indicator exists in any of
the eight step files. Four live representations of a booking, of which the chat one is the most
referenced.

## 3. Open decisions

**D1. Which booking representation survives.** Four are live. The scheduling one is the most
complete; the chat one is the most used by reference count. Everything else is downstream of this.
Recommendation: scheduling survives, and the chat migration is costed honestly rather than assumed
away.

**D2. When the hold starts.** The two reviews contradict each other. The first says contention must
resolve at request time. The third says the time stays open until the provider accepts, which is
what the code does today. Recommendation: `ResourcePolicy.BookingMode` decides. `instant` gets the
first semantics, `approval_required` keeps the current ones. The field already exists for this.

**D3. Whether an event is a set.** What happens to nine outstanding requests when a critical one is
refused, and whether an event can publish without a venue.

**D4. Slot invalidation.** Recommended mechanism: stamp each projected slot with a version, and have
the booking write path revalidate transactionally so a search result is never trusted as still true.

**D5. Two user classifications.** `Role` with five values and `CustomUser.user_type` with five
different ones. Which is authoritative.

**D6. PostgreSQL.** Recommendation: yes, on correctness rather than speed, with the non-overlap
invariant enforced by a range exclusion constraint rather than only in Python.

**D7. Scheduled execution.** Expiry, materialisation and outbox dispatch are one infrastructure
decision, not three.

**D8. Media.** Direct-to-storage upload with derived variants, versus the current synchronous path
to local disk.

**D9. Deployment.** Continuous integration exists. There is no deployment mechanism, so no rollout
strategy is currently expressible.

**D10. Frontend stack.** Cheaper than it reads: Material UI appears in 10 of 110 files, the data
layer is 9 files, and the motion library is already installed. Tailwind is on 3.4.17, so v4 is a
real major upgrade but a one-file config surface.

## 4. Corrections to earlier positions

**Indexes were closed too early.** 52 declared indexes says someone indexed, not that they indexed
the journeys. The test is composite indexes derived from access patterns. Reopened.

**Media delivery was closed too early.** The argument is not traffic volume, it is serving an 8MB
image into a 240x180 card. That needs no load test to justify.

**Instant booking was called missing.** The policy field already models it.

**The third review was read as a proposal.** Most of it is already implemented and inert.

## 5. What the plans have to cover

Grouped by plane. This is the content, not yet the scope structure.

**Blockers.** Grant the three ungranted roles and give the nine seeded users theirs. Fix the login
helper so the browser suite authenticates. Verify each role reaches its own dashboard.

**Domain.** Choose the surviving booking model and migrate. Move to PostgreSQL and enforce
non-overlap in the database. Decide and implement the hold semantics per booking mode. Run the
schedulers and workers. Version and invalidate availability slots, revalidate on write. One state
machine, drawn. Payment behind a provider interface. Cancellation policy. Event convergence as a
server-computed projection. Publish as an idempotent transaction.

**Performance.** Screen-shaped read endpoints so a dashboard is one call. Query budgets per screen,
under ten, zero N+1, checked in development. Composite indexes from real access patterns. Cache what
tolerates staleness and never cache bookability. Keep the critical path to persist-and-commit, with
everything else after the transaction. Connection pooling. Image variants and direct-to-storage
upload.

**Experience.** One server-state layer that WebSocket events patch rather than a parallel state
tree. A real-time envelope with versions and gap recovery. A persistent application shell so the
wizard reads as one object. Wizard step as navigation state, separate from completion state, so
resume works from any entrance. Autosave with a visible save state. Optimistic everywhere except
scarce inventory. Design tokens, typography roles, a motion language with duration bands, container
queries. Skeletons that preserve geometry, and explicit status text for actions. Deep-linked
notifications. Mobile as its own layout rather than a shrunk desktop.

**Defects.** The eight items under Broken that are not blockers.

## 6. Acceptance

**The two-browser test.** Organizer in one, provider in the other. Request, receive without refresh,
accept, see the acceptance without refresh, the window becomes unavailable, complete the mock
payment, both show confirmed, both calendars show the booking, cancel, both show cancelled, the time
is released. Nobody refreshes and nobody sees contradictory state.

**Refresh should be boring.** Press F5 immediately after payment and see the same state.

**The full convergence walk.** One person plays every role: creates an event, requests three
artists, three venues and three vendors, converses with each, logs in as each to answer, returns and
watches it converge and publish.

**Architecture tests, not UI tests.** Two organizers compete for the same venue. A provider is
offline when a request arrives. Redis is unavailable during approval. Publish is sent five times.
The browser crashes mid-creation. Availability changes while the organizer is looking at it. A
request expires while the organizer is offline. A WebSocket disconnects and reconnects. A worker
crashes after commit and before notification.

## 7. Next

The sub-scope structure is written: twelve scopes as three planes over the build order, every item
marked decide, build, wire up or fix, in [the scopes](THE-SCOPES.md).

What runs next: `init-master-plan` for `plans/create-event-end-to-end`, then `decompose-plan` once
per scope in that file's running order, then `populate-plans` per scope against template v4.3.
`fixing-create-event` moves in as scope 1 in a separate operation, which re-levels its relative links
and swaps its running-order table for a pointer to the parent's.
