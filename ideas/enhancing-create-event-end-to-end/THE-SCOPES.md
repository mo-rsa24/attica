# The scopes

Twelve sub-scopes under `plans/create-event-end-to-end`, arranged as three planes over a build order
that goes by risk rather than by dependency between symptoms. The findings behind every item are in
[where we landed](WHERE-WE-LANDED.md); this file is only the structure.

**Twelve is a lot, and that is the honest number.** The work spans a data migration, a concurrency
model, an execution tier that does not run, a real-time protocol, and a design system. Collapsing it
into five would hide which parts can run at the same time and which cannot.

**Every item carries a mark.** **decide** is an open question with no correct implementation until
it is answered. **build** does not exist. **wire up** exists and is inert. **fix** exists and is
wrong.

**Every scope also says what it owes the three folders that outlive it**, on an `Owes` line. A scope
that adds a process or moves an access path owes `environment/` a fact and runs `env-pulse`. One that
introduces a word nobody has defined owes `context/` an entry and runs `context-pulse`. One that adds
something a person operates by hand owes `runbook/` its pair, written with `drip-runbook` and checked
with `runbook-pulse`. The pulse runs in that scope's close out, not at the end of the programme,
because the moment the fact is known is the only cheap moment to write it down.

**Every scope also carries its own `diagram-prompts.md`**, inheriting the parent's art direction,
palette, glyph vocabulary and reading axes exactly, and adding no vocabulary of its own. `decompose-plan`
writes it as one of its commit writes, so the ten scopes not yet decomposed get theirs automatically.
The two that exist already have one.

**The catch is the parent capstone.** A child map is the zoom-in on one glyph in the parent's picture,
so a scope with no glyph there amends the capstone in the same commit as its decomposition. The
capstone now names the five domain scopes, the three experience scopes, and the two that run
alongside, which leaves `performance-architecture` as the only scope without its own glyph: it is one
scope drawn as a whole panel, so the panel is its glyph and decomposing it amends nothing. Every
amendment this prediction was written for has been made.

## Running order

| # | Scope | Plane | Waits on |
|---|---|---|---|
| 1 | fixing-create-event | blocker | nothing |
| 2 | getting-in | blocker | nothing |
| 3 | the-system-in-layers | cross | nothing |
| 4 | one-booking-truth | domain | 1, 2 |
| 5 | contention-and-holds | domain | 4 |
| 6 | running-the-workers | domain | 4 |
| 7 | availability-that-is-true | domain | 5, 6 |
| 8 | the-booking-journey | domain | 5, 6 |
| 9 | performance-architecture | performance | 7, 8 |
| 10 | one-client-truth | experience | 6 |
| 11 | the-event-workspace | experience | 8, 10 |
| 12 | the-design-system | experience | nothing after 2 |
| 13 | getting-it-out | cross | 4 |

Scopes 1, 2, 3 and 12 can all start immediately. After 8 lands, the performance and experience planes
run in parallel.

---

## Stage 0: the blockers

Neither is architecture. Both gate everything, because no claim about this system is checkable until
they are done.

### 1. fixing-create-event

Already exists, moves in as a sub-scope. Four plans, six confirmed bugs.

**Owes.** `runbook/` its pair: it already writes every bug and its fix into the recipes, which is plan 3 of that scope. Nothing new for `environment/` or `context/`.

**fix** The login helper writes the wrong storage key, so every browser test runs logged out. Until
this lands, no test result anywhere in this program is evidence.

**fix** The five other confirmed defects, per that scope's own plans.

### 2. getting-in

**fix** Three of five gated roles are granted by nothing. Grant `SERVICE_PROVIDER`, `VENUE_MANAGER`
and `TICKET_BUYER`.

**Owes.** `context/` the decision on what a role is, since two classifications disagree and nobody has said which wins. `runbook/` a pair: becoming each of the five roles, and the check that all five still reach their own dashboards after a seed changes.

**fix** Nine seeded marketplace users have no role at all, so a vendor login fails every vendor gate.

**decide** `Role` and `CustomUser.user_type` are two classifications with different values. Which is
authoritative.

**build** A verified credentials table and a login recipe per role, replacing the `unverified` mark
on the existing one and adding the three missing rows.

**Done when** each of the five roles logs in by hand and reaches its own dashboard, with a screenshot
per role.

---

## Cross-cutting, startable now

### 3. the-system-in-layers

**build** One system-in-layers map filed beside `environment/overview.md`, in the art direction the
existing flow map already uses.

**Owes.** `environment/` the layers map itself, filed beside `overview.md`, which is the picture that file has always been missing.

**build** The diagrams the reviews call for and the repo lacks: the booking state machine on its own
page, the contention sequence, the real-time delivery path, event convergence, and a failure diagram
beside every happy path.

Four architecture diagrams are already planned and undrawn in `onboarding-docs`; they fold in here
rather than being drawn twice.

### 13. getting-it-out

**decide** There is no deployment mechanism. Continuous integration exists and nothing ships.

**Owes.** `environment/` a whole new section, because a deployment mechanism changes what "running Attica" means. `runbook/` a pair: shipping a change, and confirming it landed.

**build** Whatever that decision produces, with the topology logically separable from day one even
while it runs on one machine.

The continuous integration that exists has never passed. It has run twice, on 2026-07-28 and
2026-08-23, and both runs failed in both jobs, so it is not yet a gate a release could be built on.
The frontend build it produces is discarded at the end of the job.

Positioned late in the table and worth starting early, because nothing above is real until it can be
deployed.

---

## The domain plane

This plane gates the other two. Nothing in performance or experience is worth building on a booking
model that is about to be replaced.

### 4. one-booking-truth

**decide** Which of the four live booking representations survives. The scheduling one is the most
complete, the chat one is the most referenced. Everything else in this program is downstream.

**Owes.** `context/` a rewrite of `booking.md` and `booking-request.md`, since three of the four representations stop existing and the surviving vocabulary changes.

**build** The migration away from the three that lose, costed honestly rather than assumed.

**build** One state machine, drawn and enforced, replacing five separate status fields and a
`workflow_state` alongside one of them.

**decide** Which read projections may exist. Many are fine; many things able to change state are not.

### 5. contention-and-holds

**decide** When a hold starts. The reviews contradict each other: at request time, or at acceptance.
The code does the latter today. Recommendation on the table is that `ResourcePolicy.BookingMode`
decides per resource, since `instant`, `approval_required` and `hybrid` already exist as values.

**Owes.** `environment/` a rewritten access-paths section, because PostgreSQL replaces SQLite and that is the fact most likely to make a command fail. `context/` entries for `hold` and `claim`, neither of which is defined anywhere today.

**build** PostgreSQL, with time modelled as a range and non-overlap enforced by a database exclusion
constraint rather than by application checks alone. `select_for_update` does not lock on SQLite, so
the current guard is weaker than it reads.

**fix** The idempotency key is generated fresh per click, which protects against a network retry and
not against a double click. Derive it from the request.

**build** A concurrency test that proves two simultaneous requests on the same window resolve the
same way every time, and that both parties are told.

### 6. running-the-workers

**decide** One infrastructure decision, not three: expiry, availability materialisation and outbox
dispatch all need the same thing.

**Owes.** `environment/` a new execution-model fact: "running Attica" stops meaning four hand-started processes. `runbook/` a pair: how to start and stop the recurring work, and how to find out what is stuck. Only part of the second exists. The drain-the-outbox recipe answers "how many events are pending" with a real run pasted in, and answers neither "what dead-lettered and why" nor "what is stranded in `processing`", so the recipe gets finished rather than duplicated.

**wire up** Ten scheduling management commands exist and nothing runs any of them. Three of the ten are seeds and must stay off any schedule, so seven want a runner, and two of those seven are daemons already wrapping the other five.

**wire up** The outbox worker, with retries and dead-lettering, both of which already have tables.

**build** Persist first and push second as the rule: a business change and its outbox event commit in
one transaction, and delivery may then fail without losing the event.

### 7. availability-that-is-true

**build** A version stamp on every projected slot, so search never treats a stale projection as
current.

**Owes.** `context/` an update to `availability.md`, which currently describes rules and slots without the version that decides whether a slot is still current.

**build** Transactional revalidation on the booking write path, so a search result three seconds old
is never trusted as still true.

**build** Regeneration when a rule or exception changes, driven through the outbox.

### 8. the-booking-journey

**build** A payment provider interface. The mock is currently a reference field on the checkout
session rather than an adapter, so swapping in a real gateway means touching the booking path.

**Owes.** `context/` three entries that do not exist: convergence, the checkout session, and the cancellation policy. `runbook/` a pair: driving a booking from request to payment to cancellation, and proving the time was released.

**build** Cancellation policy. The cancellation *action* exists; refund tiers and notice windows do
not.

**build** Event convergence as a server-computed projection: confirmed, pending, countered,
expiring, blocking requirements, next actions, and whether the event can publish. The client must
never invent its own definition of ready.

**decide** Whether an event is a set. What happens to nine outstanding requests when a critical one
is refused, and whether an event may publish without a venue.

**build** Publish as one idempotent transaction that converts exactly the agreements that are ready.

Most of the hold, expiry and cancellation machinery this scope needs already exists and is inert.
Much of this scope is wiring rather than writing.

---

## The performance plane

### 9. performance-architecture

**build** Screen-shaped read endpoints, so a dashboard is one call rather than eleven. Commands
follow the domain; reads follow the experience.

**Owes.** `environment/` an access-path change, since media stops going to local disk. `runbook/` the query-budget check, because a budget nobody knows how to run is not a budget.

**build** A query budget per screen, under ten queries, zero N+1, zero full scans, checked in
development rather than in a load test.

**build** Composite indexes derived from real access patterns. Fifty-two indexes exist, which says
someone indexed, not that they indexed the journeys.

**build** A caching rule: Redis may accelerate anything that tolerates staleness and may never answer
whether a resource is bookable.

**build** Connection pooling.

**build** Direct-to-storage upload with derived image variants. An eight megabyte image is currently
served into a card that displays it at a fraction of that size, and a large upload occupies an
application worker for its duration.

---

## The experience plane

### 10. one-client-truth

**build** One server-state layer that owns remote state, with WebSocket events patching that cache
rather than a parallel state tree. Without this the client keeps several disagreeing copies of the
truth however good the server protocol is.

**Owes.** `context/` an entry for the event envelope and its version, because a word that appears in every real-time message needs one definition. `runbook/` how to watch events arrive and how to force a reconnect.

**build** An event envelope carrying a monotonic entity version, so a client can tell apply from
ignore from gap-detected-and-refetch. Delivery is at-least-once, never exactly-once.

**build** Reconnect and snapshot recovery, so a dropped socket degrades to slow rather than to wrong.

**fix** The eight-second poll is a fallback that runs only after the socket errors, and in
`ChatRoom` it is permanent, because that component never reconnects. One shared transport with one
reconnect policy, rather than three components each answering the question their own way.

### 11. the-event-workspace

**build** A persistent application shell, so the seven stages read as one continuous object rather
than seven pages.

**Owes.** `runbook/` a pair: walking the seven stages, and the resume check from every entry point.

**fix** The wizard step currently carries both navigation state and business state, which is why
resume only works from one entrance. Separate completion flags from the last visited route.

**build** Autosave with a visible save state. Nothing currently survives a refresh, and no step file
contains a loading indicator.

**build** Optimistic updates everywhere except scarce inventory, which must never be claimed before
the server commits.

**build** The convergence dashboard: after requests are sent the organizer leaves the wizard and
enters a command centre that updates live.

**build** Deep-linked notifications that land on the relevant booking with its panel open.

**fix** The eight defects under Broken that are not blockers, including capacity 250 arriving as an
attendee count of 1, every field being sent twice, the draft being fetched four times on mount, and a
step counter that disagrees with the routes.

### 12. the-design-system

**build** Semantic tokens first: colour, spacing, radius, elevation. Components consume tokens and
pages never invent styles.

**Owes.** `runbook/` how to add a component without inventing a style. Nothing for `environment/` or `context/`.

**build** A typography scale with named roles rather than utility classes chosen ad hoc.

**build** A motion language with duration bands, and an explicit statement of what does not animate.

**build** Container queries, so a provider card responds to its container rather than the viewport.
This app is full of drawers, sidebars and split panes.

**decide** The stack. Cheaper than it reads: Material UI appears in 10 of 110 files, the data layer
is 9 files, and the motion library is already installed. Tailwind is on 3.4.17, so v4 is a genuine
major upgrade with a one-file config surface.

**build** Skeletons that preserve geometry, and explicit status text for actions. Mobile as its own
layout rather than a shrunk desktop.

---

## Acceptance, across the whole parent scope

The two-browser test, refresh-should-be-boring, the full convergence walk, and the nine architecture
tests. All four are written out in [where we landed](WHERE-WE-LANDED.md#6-acceptance).

Every scope also carries its own runbook pair: how to walk it by hand, and how to prove it works.
