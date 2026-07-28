# MASTER_PLAN.md — onboarding-docs

## Mission

Produce complete onboarding documentation for the Attica codebase that allows a new developer with Django/React experience—but zero prior knowledge of Attica—to orient themselves, set up a fully working local environment, configure the database, and reach a seeded running state in one sitting.

---

## Objectives

- Enable self-service onboarding: a new developer can follow the docs independently, without asking for help.
- Make design decisions visible: explain *why* the system is architected the way it is (REST-first + WebSocket overlay, SQLite + Redis, JWT auth), not just *what* to install.
- Pair every setup instruction with a visual: diagrams, flowcharts, or slide decks so the developer understands the flow, not just the commands.
- Create a reference artifact that the project team can hand to future hires.

---

## Goals

- [ ] **Source review**: Ingest replicate + unpack outputs as primary source material for documentation content.
- [ ] **Backend setup docs**: Procedure diagrams (fork/join charts), slides (Marp), and step-by-step instructions for Python venv, Django migrations, Redis setup, and seed command.
- [ ] **Frontend setup docs**: Procedure diagrams, slides, and instructions for Node/npm, Vite dev server, proxy config, and first login flow.
- [ ] **Architecture diagrams**: Document WebSocket routing (consumer → room group → broadcast), JWT auth flow (login → token store → interceptor → refresh), and event creation wizard state machine.
- [ ] **Skill chain plan**: Produce a todoist-compatible task list with exact prompts for every skill invocation needed to complete this scope (unpack, skill-discovery, figma for diagrams, etc.).
- [ ] **Cold-start verification**: Prove the setup guides work when followed literally from a clean environment, before handing off to Mongezi.

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

- [ ] **Replicate + Unpack outputs are reviewed and integrated** as source material (facts about models, setup steps, architecture).
- [ ] **backend-setup sub-scope complete**: 
  - [ ] Procedure diagram (venv → install → migrate → seed → daphne).
  - [ ] Marp slides explaining each step and the rationale.
  - [ ] Text instructions with command blocks and error-handling notes.
- [ ] **frontend-setup sub-scope complete**:
  - [ ] Procedure diagram (npm install → vite config → login flow).
  - [ ] Marp slides for Node, npm, Vite proxy, and auth flow.
  - [ ] Text instructions with localhost URLs and troubleshooting.
- [ ] **Architecture diagrams produced**:
  - [ ] WebSocket routing diagram (client → ws:// → consumer → Redis → group broadcast).
  - [ ] JWT auth flow diagram (login → POST /token/ → localStorage → interceptor → 401 refresh).
  - [ ] Event creation wizard state machine (step 1 → draft save → step 2 → ... → publish).
  - [ ] REST + WebSocket communication pattern diagram.
- [ ] **Todoist task list**: A markdown list (or JSON export) with exact skill-invocation prompts for every task in this chain (e.g., "run `/unpack` with Attica codebase as source", "run `/figma-generate-diagram` with WebSocket routing as brief", etc.).

---

## Sub-Scopes

### backend-setup
Covers Python/Django environment setup, package installation, database initialization, Redis configuration, seed command, and Daphne server startup. Produces procedure diagrams, explanatory slides, and step-by-step instructions.

### frontend-setup
Covers Node.js/npm environment setup, Vite dev server configuration, backend proxy setup, and first successful login. Produces procedure diagrams, explanatory slides, and step-by-step instructions.

---

## Plans

- ⚠️ [01-source-analysis.md](plans/01-source-analysis.md) — Review replicate + unpack outputs; extract setup sequence, design decisions, core models.
- ⚠️ [02-backend-setup-docs.md](plans/02-backend-setup-docs.md) — Create backend setup procedure diagram, Marp slides, and markdown guide (venv → install → migrate → seed → daphne).
- ⚠️ [03-frontend-setup-docs.md](plans/03-frontend-setup-docs.md) — Create frontend setup procedure diagram, Marp slides, and markdown guide (npm → Vite → proxy → login).
- ⚠️ [04-architecture-diagrams.md](plans/04-architecture-diagrams.md) — Create four architecture diagrams (WebSocket auth, REST vs WebSocket, JWT refresh, event wizard state machine).
- ⚠️ [05-slides.md](plans/05-slides.md) — Consolidate backend + frontend slides into a master Marp deck with architecture deep-dives.
- ⚠️ [06-todoist-bridge.md](plans/06-todoist-bridge.md) — Bridge all plan tasks into Todoist markdown; optionally publish to Todoist.
- ⚠️ [07-cold-start-verification.md](plans/07-cold-start-verification.md) — Dry-run both setup guides from a genuinely clean environment; fix any gaps before handing to Mongezi.
