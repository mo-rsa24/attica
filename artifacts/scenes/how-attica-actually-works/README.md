# How does Attica actually work, once you have been away from it?

Five interactive scenes, each tracing one real path through the running system using only what is in
the repository: real endpoints, real file and line numbers, real payloads, real error strings.

They exist for re-orientation. Reading `App.jsx`'s route list and `events/models.py` tells you what
someone intended; these show what the code does today, including the parts that are broken.

## What is in here

Five scenes, each a small Vite app you run locally and operate. Each opens with a claim about the
running system and lets you sever or vary the thing the claim depends on.

Screenshots of two of them are in [the matching
figures](../../figures/how-attica-actually-works/).

## The scenes

### attica-organizer-journey

**What it shows**

One organizer going end to end: log in, look for a profile, build and resume an event, book an
artist. Every request in it is real. It runs two readings over the same four stages side by side,
what the route table and model names say happens, against what a per-request trace shows happens,
and every stage diverges. Each divergence is clickable into the request that proved it.

**How we got this scene**

Built from a trace of the running application at `/home/molef/Work/attica`, with every file, line
number, payload and error string copied out of the repository rather than described. Its `SPEC.md`
records the three places the build corrected the original brief.

**What it lets you say**

A per-request trace across all four layers tells you what the system does.

**What it cannot say**

Nothing about what the system was intended to do. It shows `OrganizerProfilePage` as dead weight
and says nothing about whether it should be wired up. Names carry intent; the trace does not.

**Where it came from and what judged it**

The repository at `/home/molef/Work/attica`. Nothing judged it: no review file exists.
**Held since 2026-08-22.** No plan in the tree names this scene yet; kept because it is the fastest
route back into the codebase after time away, and because plan 04 of `onboarding-docs` will draw
diagrams of the same flows and should check itself against it.

### attica-runtime-topology

**What it shows**

The four independently-failing processes behind what the browser experiences as one instant: Vite,
Django and DRF under Daphne, Redis, and SQLite. Thirteen interactive edges, solid for durable and
dashed for best-effort, most of which can be severed to watch what degrades.

**How we got this scene**

Read from the repository's configuration and routing: `frontend/vite.config.js`,
`backend/main/main/routing.py`, and the channel-layer and cache settings.

**What it lets you say**

Which paths are droppable and which are not. Severing `redis` degrades notification latency;
severing `write` is refused, because cutting the source of truth is a different scene.

**What it cannot say**

Anything about production. Every process here is a local development process on one machine.

**Where it came from and what judged it**

The repository, and [the environment overview](../../../environment/overview.md), which carries
the same facts as prose. **Held since 2026-08-22.** No plan names it; kept because it is the picture behind
the environment file.

### attica-realtime-overlay

**What it shows**

That the database row is committed and serialized before anything is broadcast, so every real-time
path can be dropped without losing data.

**What it lets you say**

Dropping the real-time layer moves latency from about 16 ms to as much as 8 s. Correctness does not
move.

**What it cannot say**

Whether the broadcast happens at all on a given path. It does not, on the booking-request write
path, which never calls `group_send`; see [what a booking
is](../../../context/world/booking.md).

**Where it came from and what judged it**

The repository's chat and scheduling code. **Held since 2026-08-22.** No plan names it.

### event-wizard-machine

**What it shows**

Every Next writes the whole accumulated draft to the server and moves `current_step`, so the wizard
survives a closed tab, a dead battery, and a different machine.

**What it lets you say**

You resume exactly where you left off.

**What it cannot say**

What happens to the draft at publish. That is [what an event draft
is](../../../context/world/event-draft.md), and it is the thing most often got wrong: the draft is
kept, not deleted.

**Where it came from and what judged it**

The repository's `events` app and the wizard routes in `frontend/src/App.jsx`.
**Held since 2026-08-22.** No plan names it; plan 04 of `onboarding-docs` draws the same state
machine and should check against this.

### scheduling-conflicts

**What it shows**

Availability materialized into rows with a capacity counter and a unique window, so booking is a
bounded counter increment taken under a row lock rather than a question asked of history.

**What it lets you say**

That shape makes capacity above one expressible, makes re-running the materializer a no-op, and
gives the database somewhere to refuse.

**What it cannot say**

Whether the materializer has been run. It is a management command nobody schedules; until it runs
there are no slot rows and nothing is bookable. See [what availability
means](../../../context/world/availability.md).

**Where it came from and what judged it**

`backend/main/scheduling/models.py`, its constraints and its management commands.
**Held since 2026-08-22.** No plan names it.
