# Plan walk: enhancing create event end to end

**Compiled.** Seven scopes, twenty plan files, under one parent. The runbook is at the end of this
file. `fixing-create-event` finishes before any of it starts.

## The intention

Every step of the create-event flow works well from the backend, the frontend and under load; a
person can log in as any role using credentials written down in one place; availability and booking
requests behave predictably; and there are runbooks covering every role's path through the flow and
every way to test it.

## Verb set

enhance · new scope · fold in · runbook only · measure first · look first

Every group leaves with its own runbook pair: how to walk it by hand, and how to prove it works.

## Groups

| # | Group | Count | The one question that decides it | State |
|---|---|---|---|---|
| 1 | Credentials and roles: the way in | 5 gated, 2 assigned | Which roles exist, and who is seeded for each? | settled |
| 2 | The eight steps as they stand | 11 screens | What does each step already do, back and front? | settled |
| 3 | Availability and the booking request, end to end | 10 models | Where does an availability answer come from, and is it right? | settled |
| 4 | The gaps: what must exist for the flow to be seamless | 3 plans | Which missing thing blocks a person moving from one step to the next? | settled |
| 5 | Moving through it: navigation, resuming a draft, and what the interface does while it waits | 3 plans | Can a person leave, come back, go back a step, and see where they are? | settled |
| 6 | What it runs on: indexes, queues, caching, delivery | 3 plans | Which measured problem demands this, and what is the number? | settled |
| 7 | The system drawn in layers | 1 map | What are the tiers, and what crosses between them? | settled |

## Ledger

### Group 6: what it runs on — **new scope, small, mostly measure first**

**What was found.** `scheduling/models.py` alone declares 52 indexes, so indexing is not a gap. The
outbox queue is already implemented (`run_outbox_worker`, `dispatch_scheduling_outbox`) and Redis is
already the channel layer and the cache, so the missing piece is a runner, not a queue technology. A
CDN has no measured problem: the dev database is 2.2MB and media is on local disk. Nothing points at
NoSQL.

**One real finding, correctness rather than speed.** `finalize_draft_bookings` and
`_lock_overlapping_slots` guard against double-booking with `select_for_update`. SQLite has no
row-level locking, so that guard is weaker than it reads.

**Plan A, get the numbers first.** Query counts per wizard step, the cost of the four-times fetch,
and enriched availability search behaviour at realistic data volume rather than nine seeded
providers.

**Plan B, the database that can actually lock.** Postgres, then a concurrent test proving the
double-booking guard holds. Justified now, on correctness, without waiting for Plan A.

**Plan C, a holding file for the rest.** NoSQL, CDN, networking, caching: one line each naming the
measured number that would justify it. Nothing planned until a number appears.

**Not here on purpose.** Running the outbox worker is group 3's Plan A.

### Group 5: moving through it — **new scope, three plan files**

Definition of done: a person always knows where they are and whether their work is safe.

**What was found.** `framer-motion` is used in seventeen files including five of the eight step
files; steps 6, 7 and 8 have none. No `CircularProgress` or `Skeleton` in any step file or in the
layout. Saving state is shown on some buttons (`disabled={isSaving}` in steps 3 and 5) and not
others (`disabled={nextDisabled}` in step 1). `ListingWizardLayout.jsx:80` resumes from
`current_step` only when the URL carries no step, so a direct link to `/listing/35/step5` renders
step 5 wherever the draft is. No client-side persistence, so a refresh between saves loses typing.
Fifteen Back controls and three `onBack` handlers exist, and whether Back rewinds `current_step` is
not answerable without running it. Failures go to twelve toasts and one Alert with no convention.

**Plan A, the same behaviour on every step.** One loading, saving and transition treatment on all
eight rather than five.

**Plan B, leaving and coming back.** Resume from any entrance; settle what Back does to
`current_step`.

**Plan C, when something goes wrong.** One way to show a failure, and a failed save that stays
visible.

**Sequencing risk.** This scope and group 2's edit the same eight files. Group 2 goes first, because
a spinner on a step that sends the wrong data is polish on a defect.

### Group 4: the gaps, what must exist for the flow to be seamless — **new scope, three plan files**

Definition of done: an organizer can leave, return, and see the current truth without refreshing or
retyping.

**What was found.** On the booking path `_create_in_app_notification` writes a row and never touches
the channel layer, so a provider's answer never reaches the organizer's screen and the bell changes
only on a fetch. Three realtime models coexist: WebSockets are wired and the Vite proxy does carry a
`/ws` rule (`vite.config.js:19-21`, `ws: true`), chat ignores it and polls every eight seconds
(`ChatRoom.jsx:46`), direct messages poll, and booking uses neither. The wizard has no client-side
persistence, so a refresh between saves discards typing. Capacity is collected at step 1 and the
booking request sends `attendee_count: 1`, because nothing owns the event's shape as one fact.

**Plan A, one way a change reaches a screen.** Choose push or poll once, apply it to bookings.

**Plan B, work that survives leaving the page.** Client persistence plus a save the organizer sees.

**Plan C, one source of truth for the event's shape.** Capacity, dates and headcount travel once.

**Not here on purpose.** Who runs the scheduled commands is group 3's Plan A.

**Correction to file.** The flow map's Step 0 says the Vite proxy has no `/ws` rule. It does.
`CLAUDE.md` already flags the claim as wrong; now confirmed by reading the config.

### Group 3: availability and the booking request — **new scope, four plan files**

Definition of done, roughly: an availability answer is provably current, and a booking request
cannot be duplicated or silently lost.

**What was found.** Availability is a materialised row, not a live calculation: rules expand into
`AvailabilitySlot` via `python manage.py materialize_availability_slots`, so an answer is only as
fresh as the last run. Eleven management commands sit under `scheduling/` (one materialiser, five
expiry commands, two outbox workers, three seeds) and nothing found so far runs any of them. Four
separate functions answer the overlap question (`_find_checkout_hold_conflict`, `_request_overlap_q`,
`_find_booking_conflict`, `_has_active_overlap`) plus `_lock_overlapping_slots` on the write path,
and read-versus-write agreement is untested. Idempotency is correct server-side, with a unique
constraint on `(owner, endpoint, key)`, and defeated client-side by a fresh key per click at
`schedulingApi.js:80`.

**Plan A, who runs the eleven commands.** Look first, then decide. Its answer feeds group 6 rather
than group 6 guessing at a queue.

**Plan B, one conflict answer instead of four.** `/write-tests` first to pin current behaviour, then
prove the read and write paths agree, then collapse.

**Plan C, the double-click.** Derive the idempotency key from the request, not the click.

**Plan D, the 48-hour clock made visible.** A request expires and the interface never says so.

### Group 2: the eight steps as they stand — **new scope, four plan files**

Eleven traced screens, not eight. Route `step2` never renders (`App.jsx:122` redirects to `step1`)
and the on-screen counter disagrees with the route numbering. Source: the recorded live trace at
`/home/molef/goal-setting/learning/attica-event-creation/flow-map.md`.

Cut by what decides the fix, not one plan per step.

**Plan A, information lost between steps.** Step 1 collects capacity 250; step 4 sends
`attendee_count: 1` to the booking request. Step 2 sends every field twice, camelCase for the form
and snake_case for the publish-time reader.

**Plan B, what the screen says versus what is true.** Upload screen claims 100MB, `settings.py:230`
enforces 50MB. Step counter wrong on at least two routes. A dead route still in the router.

**Plan C, work the page does and does not need.** The draft is fetched four times on mount: React
StrictMode double-invokes, and both the layout and the page trigger a load.

**Plan D, steps that carry nothing.** Route `step6` is a splash with no form whose only job is to
tick `current_step`. A design decision, not a bug.

Sits beside `fixing-create-event`; no overlap with that scope's six bugs, and that scope goes first.

### Group 7: the system drawn in layers — **new scope, small** (locked)

Every scope already gets a `diagram-prompts.md` seeded by `init-master-plan`. Four architecture
diagrams are already planned and undrawn in `plans/onboarding-docs/plans/04-architecture-diagrams.md`
(WebSocket handshake, REST versus WebSocket, JWT refresh, wizard state machine). All four are
mechanism diagrams. Nothing draws the system as tiers.

One system-in-layers map, filed beside `environment/overview.md`, which is already the whole system
in one pass and is missing its picture. Group 6 references it rather than inventing a topology in
prose, so this comes before group 6.

Also open: the flow map carries eleven storyboard prompts and
`artifacts/figures/walking-the-event-creation-flow/` is empty. Eight images exist repo-wide.

### Group 5 renamed (locked)

Now "Moving through it: navigation, resuming a draft, and what the interface does while it waits".
Facts already gathered: no `localStorage` or `sessionStorage` anywhere in the wizard, so the server
draft is the only persistence and a refresh loses anything not yet PATCHed.
`ListingWizardLayout.jsx:80` resumes from `current_step` only when the URL carries no step, so a
direct link to `/listing/35/step5` renders step 5 wherever the draft actually is. Wizard state lives
in a reducer at `context/reactContext.jsx:35`.

### Group 1: credentials and roles, the way in — **new scope, small**

Two plan files, not a master plan tree. Groups 2 to 5 depend on it: a vendor's path through
create-event cannot be walked without a working vendor login.

**What was found.** The app gates on five roles (`EVENT_ORGANIZER`, `ARTIST`, `SERVICE_PROVIDER`,
`VENUE_MANAGER`, `TICKET_BUYER`, `users/models.py:12`). Eleven frontend `roles.includes` checks and
`has_role` calls in `vendors/views.py`, `artists/views.py`, `locations/views.py` read them. Only two
are ever assigned: `seed_booking_workflow` grants organizer and artist, `seed_sa_artists` grants
artist. `SERVICE_PROVIDER`, `VENUE_MANAGER` and `TICKET_BUYER` are granted nowhere.
`seed_marketplace` creates nine users (password `seed_pass_123!`) and assigns no role at all, so
`seed_vendor_feast` fails every vendor gate.

**Plan one.** Look first at whether the frontend reads `roles` or `CustomUser.user_type`, which is a
second role system with different values. Then fix the seeds so every gated role is granted, and
prove each login reaches its own side of the app.

**Plan two.** The verified credentials table and a login recipe per role, replacing the `unverified`
mark at `runbook/preparing-the-data/seeding-and-resetting-data.md:122` and adding the three missing
rows (`seed_vendor_petal`, `seed_venue_atrium`, `seed_venue_horizon`).

**Runs.** `/init-master-plan`, then `/populate-plans` against template v4.3, then `/drip-runbook`
for the per-role recipe.



---

## The runbook

Curated flow 6 in `~/.claude/skills/WORKFLOWS.md`, spliced: its front half (replicate,
learn-codebase, codebase-prune) is skipped because this walk did that work.

Run one at a time, from `/home/molef/Work/attica`.

1. Finish `plans/create-event-end-to-end/plans/fixing-create-event` first. Its second bug is what makes the browser suite honest.
2. `/init-master-plan` for the parent scope `plans/create-event-end-to-end`.
3. `/decompose-plan` seven times, one per scope, in the order below.
4. `/populate-plans` per scope, template v4.3.
5. `/drip-runbook` per scope, for the walk-it and prove-it pair.
6. `/todoist-bridge` then `/todoist-publish`.
7. Manual gate: do the work.
8. `/sync-plan-tree @plans/create-event-end-to-end`.

Scope order and why:

| # | Scope | Plans | Waits on |
|---|---|---|---|
| 1 | credentials-and-roles | 2 | nothing |
| 2 | the-system-in-layers | 1 | nothing |
| 3 | the-eight-steps | 4 | 1 |
| 4 | availability-and-booking | 4 | 1 |
| 5 | the-seamless-gaps | 3 | 4 |
| 6 | moving-through-it | 3 | 3, same files |
| 7 | what-it-runs-on | 3 | 2, and scope 4's plan A |
