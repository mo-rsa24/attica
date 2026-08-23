# MASTER_PLAN.md: onboarding-docs

## Do this next

Open [Cold-start verification](plans/07-cold-start-verification.md). All three
setup guides are written and committed; none has been proven by walking it on a machine
that has nothing installed. That walk is what stands between the guides and the handoff to
Mongezi.

## Running order

| Step | Plan | What it does | Status | Waits on |
|---|---|---|---|---|
| 1 | [Source analysis](plans/01-source-analysis.md) | Extract setup sequence, design decisions, and core models from the codebase into source documents | ⚠️ reopened | nothing |
| 2 | [Backend setup docs](plans/02-backend-setup-docs.md) | Backend procedure diagram, Marp slides, and setup guide | ⚠️ reopened | step 1 |
| 3 | [Frontend setup docs](plans/03-frontend-setup-docs.md) | Frontend procedure diagram, Marp slides, and setup guide | ⚠️ reopened | step 1 |
| 4 | [Cold-start verification](plans/07-cold-start-verification.md) | Walk all three guides on a machine with nothing installed; fix every gap in the guide itself | ⚠️ in progress | steps 2 and 3 |
| 5 | [Architecture diagrams](plans/04-architecture-diagrams.md) | Four standalone diagrams: WebSocket auth, REST vs WebSocket, JWT refresh, event wizard | ⚠️ not started | step 1 |
| 6 | [The merged deck](plans/05-slides.md) | Merge the two decks plus the four diagrams into one master Marp deck | ⚠️ not started | steps 2, 3, 5 |

Do whenever: [Todoist bridge](plans/06-todoist-bridge.md) translates every task
line in this scope into Todoist markdown. Nothing blocks it and nothing waits on it, so it
is worth running only once the remaining plans have settled.

**Why steps 1 to 3 read reopened rather than done.** Their original tasks are all still ticked and
their deliverables all still exist. Two gained a small amount of real work: plan 03 owes the
two-HTTP-client split in its proxy section, and plan 01 owes a reconciliation against
[the context index](../../context/00-INDEX.md), which was built later and covers the same ground from
the code directly. Each is one task, and each is named in its own plan.

**Where this scope's output lives.** The guides are in
[the onboarding guides](../../artifacts/notes/onboarding-a-new-developer/),
the decks in [the onboarding decks](../../artifacts/decks/onboarding-a-new-developer/),
and the procedure diagrams in
[the onboarding figures](../../artifacts/figures/onboarding-a-new-developer/).
The four reference documents the plans read from each other stay in
[`source/`](source/), because nobody outside this scope reads them.

---

## Mission

Produce complete onboarding documentation for the Attica codebase that allows a new
developer with Django/React experience, but zero prior knowledge of Attica, to orient
themselves, set up a fully working local environment, configure the database, and reach a
seeded running state in one sitting.

---

## Objectives

- Enable self-service onboarding: a new developer can follow the docs independently, without asking for help.
- Make design decisions visible: explain *why* the system is architected the way it is (REST-first + WebSocket overlay, SQLite + Redis, JWT auth), not just *what* to install.
- Pair every setup instruction with a visual: diagrams, flowcharts, or slide decks so the developer understands the flow, not just the commands.
- Create a reference artifact that the project team can hand to future hires.

---

## Goals

- [x] ✅ **Source review**: Ingest replicate + unpack outputs as primary source material for documentation content.
- [x] ✅ **Backend setup docs**: Procedure diagrams (fork/join charts), slides (Marp), and step-by-step instructions for Python venv, Django migrations, Redis setup, and seed command.
- [x] ✅ **Frontend setup docs**: Procedure diagrams, slides, and instructions for Node/npm, Vite dev server, proxy config, and first login flow.
- [ ] ⚠️ **Architecture diagrams**: Document WebSocket routing (consumer → room group → broadcast), JWT auth flow (login → token store → interceptor → refresh), and event creation wizard state machine.
- [ ] ⚠️ **Skill chain plan**: Produce a todoist-compatible task list with exact prompts for every skill invocation needed to complete this scope (unpack, skill-discovery, figma for diagrams, etc.).
- [ ] ⚠️ **Cold-start verification**: Prove the setup guides work when followed literally from a clean environment, before handing off to Mongezi.

---

## Expected Outcome

A new developer arriving at the project:
1. Reads the onboarding guide (slides + diagrams).
2. Follows the backend setup procedure → backend running on :8000.
3. Follows the frontend setup procedure → frontend running on :5173.
4. Logs in with seeded credentials.
5. Can navigate the UI, see real data, understand the architecture.
6. Knows where to look next (README, code comments, Chat.md, etc.).

---

## Definition of Done

- [x] ✅ **Replicate + Unpack outputs are reviewed and integrated** as source material (facts about models, setup steps, architecture).
- [x] ✅ **backend-setup sub-scope complete**:
  - [x] ✅ Procedure diagram (venv → install → migrate → seed → daphne).
  - [x] ✅ Marp slides explaining each step and the rationale.
  - [x] ✅ Text instructions with command blocks and error-handling notes.
- [x] ✅ **frontend-setup sub-scope complete**:
  - [x] ✅ Procedure diagram (npm install → vite config → login flow).
  - [x] ✅ Marp slides for Node, npm, Vite proxy, and auth flow.
  - [x] ✅ Text instructions with localhost URLs and troubleshooting.
- [ ] ⚠️ **Architecture diagrams produced**:
  - [ ] ⚠️ WebSocket routing diagram (client → ws:// → consumer → Redis → group broadcast).
  - [ ] ⚠️ JWT auth flow diagram (login → POST /api/accounts/token/ → localStorage → interceptor → 401 refresh).
  - [ ] ⚠️ Event creation wizard state machine (step 1 → draft save → step 2 → ... → publish).
  - [ ] ⚠️ REST + WebSocket communication pattern diagram.
- [ ] ⚠️ **Todoist task list**: A markdown list (or JSON export) with exact skill-invocation prompts for every task in this chain (e.g., "run `/unpack` with Attica codebase as source", "run `/figma-generate-diagram` with WebSocket routing as brief", etc.).

---

## Sub-Scopes

Neither sub-scope was ever spawned as its own directory. Both are carried entirely by plan
files in this scope, so their status aggregates from those plans rather than from a child
`MASTER_PLAN.md`.

- ✅ **backend-setup**: Python/Django environment setup, package installation, database initialization, Redis configuration, seed command, and Daphne server startup. Delivered by [Backend setup docs](plans/02-backend-setup-docs.md) as `artifacts/figures/onboarding-a-new-developer/backend-setup-procedure.md`, `artifacts/decks/onboarding-a-new-developer/backend-setup.md`, and `artifacts/notes/onboarding-a-new-developer/backend-setup.md`.
- ✅ **frontend-setup**: Node.js/npm environment setup, Vite dev server configuration, backend proxy setup, and first successful login. Delivered by [Frontend setup docs](plans/03-frontend-setup-docs.md) as `artifacts/figures/onboarding-a-new-developer/frontend-setup-procedure.md`, `artifacts/decks/onboarding-a-new-developer/frontend-setup.md`, and `artifacts/notes/onboarding-a-new-developer/frontend-setup.md`.

---

## Plans

- ✅ [Source analysis](plans/01-source-analysis.md): Review the codebase; extract setup sequence, design decisions, core models.
- ✅ [Backend setup docs](plans/02-backend-setup-docs.md): Backend setup procedure diagram, Marp slides, and markdown guide (venv → install → migrate → seed → daphne).
- ✅ [Frontend setup docs](plans/03-frontend-setup-docs.md): Frontend setup procedure diagram, Marp slides, and markdown guide (npm → Vite → proxy → login).
- ⚠️ [Architecture diagrams](plans/04-architecture-diagrams.md): Four architecture diagrams (WebSocket auth, REST vs WebSocket, JWT refresh, event wizard state machine).
- ⚠️ [The merged deck](plans/05-slides.md): Consolidate backend + frontend slides into a master Marp deck with architecture deep-dives.
- ⚠️ [Todoist bridge](plans/06-todoist-bridge.md): Bridge all plan tasks into Todoist markdown; optionally publish to Todoist.
- ⚠️ [Cold-start verification](plans/07-cold-start-verification.md): Walk all three setup guides from a genuinely clean machine; fix any gaps before handing to Mongezi.

---

## Runbook

The by-hand recipes for this project live in [the runbook](../../runbook/), starting at
[the runbook index](../../runbook/00-INDEX.md).

Before writing a command sequence or a click path into a guide, check whether a recipe already
covers it. Where the guide and the recipe disagree, one of them is wrong and both are read by
someone who will not know which.

---

## Context

What Attica is about in the real world lives in [the context folder](../../context/), maintained by
`context-pulse`. Start at [the context index](../../context/00-INDEX.md).

Read the owning file before writing any explanation of what an Attica term means into a guide, a
slide or a diagram. Several names in this codebase are actively misleading, and the folder's
`What people get wrong` sections exist for exactly the reader this scope is written for.

---

## Environment Context

Environment and architecture facts for this project live in
[the environment index](../../environment/00-INDEX.md), maintained by `env-pulse`. Start at
[the environment overview](../../environment/overview.md), then the index row for what you are about to touch.
Read it before writing any
setup step, command, or prerequisite into a guide. It is the authority on which processes must be
started by hand, which Python environment the app runs from, and what the known gaps are.

Where a fact this scope needs is not in that file, stop and ask rather than inferring it. A setup
guide that carries a plausible wrong command is worse than one with a gap in it, because the
reader trusts it and loses an afternoon.

---

## Source Documents

Produced by plan 01 and read by every plan that follows. These are the factual base for the
guides, slides, and diagrams; correct them here first when the code changes.

- [The consolidated onboarding source](source/onboarding-source.md): the consolidated reference (what Attica is, tech stack, apps, models, design decisions, setup sequence, key URLs).
- [The setup sequence source](source/setup-sequence.md): the canonical command-by-command order for backend, frontend, and Redis, with decision points and failure symptoms.
- [The design decisions source](source/design-decisions.md): why REST-first + WebSocket, SQLite + Redis, JWT, multi-role users, the draft state machine, and the chat-room uniqueness constraint.
- [The core models source](source/core-models.md): entity map, per-model relationship tables, and the relationships not yet wired.
