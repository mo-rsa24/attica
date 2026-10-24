# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Where things live here

This project follows the four-folder convention in `~/.claude/CLAUDE.md` (`plans/`, `artifacts/`,
`runbook/`, plus the code) with one override.

**`docs/` holds interface contracts, and nothing else.** A payload shape another system integrates
against is not an artifact (it describes an interface, not a finding), not a runbook recipe (nobody
follows it by hand), and not a plan. It is kept where an integrator would look for it. Two files
qualify today: `scheduling_webhook_contract.md` and
`scheduling_calendar_implementation_plan.md`. Anything else that lands in `docs/` is a finding.

## Files at the root that no check reports

This project extends the list in `~/.claude/CLAUDE.md` with two entries. Neither is an artifact and
neither belongs in a subfolder.

| File | What it is for |
|---|---|
| `Chat.md` | how the messaging system works: rooms, messages, bids, attachments, the WebSocket event types. System documentation, pointed at from this file. |
| `ROADMAP.md` | where the product is going. Direction, not a result, so the artifact tree explicitly excludes it. |

`environment/`, `context/` and `runbook/` are already off the list by the parent rule: they are
found through their discovery routes and audited by their own pulse.

## Runbook

How to do the recurring things here by hand is in `runbook/`, grouped by the kind of work:
`running-the-web-app/`, `preparing-the-data/`, `driving-the-app/`. Start at `runbook/00-INDEX.md`,
which lists every recipe as the question it answers, so nobody has to browse the tree.

Before writing out a sequence of commands or click paths for something done here regularly, check
whether a recipe already exists. If one does and it is now wrong, fix the recipe rather than
answering around it.

## Context

What this project is about in the real world (the problem it solves, the people and things behind
the data, what each field means, what the output changes and for whom) lives in `context/`. Start
at `context/00-INDEX.md`, which lists it as questions.

Before answering a question about what something means (a model, a field, a status value, a role),
read the file that owns that term. If the term is not there, say so and ask rather than inferring a
meaning from its name. A plausible wrong meaning is worse than an admitted gap, because it gets
built on.

## Environment

This project's real environment and architecture facts live in `environment/`. Read
`environment/overview.md` before planning work or writing code that touches compute, data access or
auth: it is the whole system in one pass, including which processes must be started by hand, the
two different ways the frontend reaches the backend, and the known gaps.

Then read the row in `environment/00-INDEX.md` matching what you are about to touch. Two that cost a
day when skipped: opening the Django admin, and working out why availability search returns nothing.
Facts live there, not here.

If a task depends on an environment fact that file does not cover, **stop and ask**. Do not infer
it, and do not proceed on a plausible assumption. An unanswered question costs one message; a wrong
assumption costs a run, plus the time to work out why it failed. Saying "I don't know how this runs
here" is a correct and useful answer.

## Project Overview

Attica is a full-stack event management and marketplace platform connecting event organizers with vendors, artists, and service providers. It features real-time direct messaging with a bid system.

## Tech Stack

- **Backend**: Django 5.2.3 + Django REST Framework + Django Channels (WebSockets)
- **Frontend**: React 19 + Vite + Material-UI + TailwindCSS
- **Database**: SQLite (development), Redis for channel layer and caching
- **Auth**: JWT via djangorestframework-simplejwt

## Development Commands

### Backend (Django)
```bash
cd backend/main
source /home/molef/lobola/bin/activate
python manage.py runserver                    # HTTP only (port 8000)
daphne -b 0.0.0.0 -p 8000 main.asgi:application  # With WebSocket support
python manage.py migrate                      # Run migrations
python manage.py test                         # Run the test suite (46 tests; 2 currently red, both in events.EventDraftAPITests)
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev      # Dev server on port 5173
npm run build    # Production build to ./dist
npm run lint     # ESLint
```

### Prerequisites
- Python 3.12.9 in the virtual environment at `/home/molef/lobola`
- Node.js 16+
- Redis server on localhost:6379 (required for WebSockets and caching)

## Architecture

### Backend Structure
Django apps in `backend/main/`:
- **users/** - CustomUser model with roles (organizer, vendor, artist, service_provider), JWT auth
- **events/** - Event and EventDraft models, multi-step event creation
- **vendors/** - Vendor profiles and posts
- **artists/** - Artist profiles and services
- **chat/** - Real-time messaging with WebSocket support, ChatRoom/Message/ChatBid models
- **cart/** - Shopping cart functionality
- **checkout/** - Payments and orders
- **tickets/** - Event ticketing
- **locations/** - Venues and event locations

### Frontend Structure
- `src/AuthProvider.jsx` - JWT token management and refresh logic
- `src/utils/useAxios.js` - Axios instance with JWT interceptor for automatic token refresh
- `src/pages/DirectMessagePage.jsx` - Chat UI with WebSocket integration
- `src/components/chat/` - Chat components

### API Patterns
- REST API at `/api/` - primary persistence layer
- WebSocket at `ws://localhost:8000/ws/chat/rooms/<room_id>/?token=<jwt>`
- Frontend Vite proxy forwards `/api`, `/vendors`, `/cart`, `/checkout` to Django

### Chat System
The chat system uses REST-first architecture where the database is the source of truth. WebSockets provide real-time updates via Redis channel layer. See `Chat.md` for comprehensive documentation on the messaging system including:
- Room creation and discovery
- Message sending/receiving
- Bid management
- File attachments
- WebSocket event types: `message`, `bid`, `read_receipt`, `warning`

### Key Configuration Files
- `backend/main/main/settings.py` - Django settings, CORS, JWT config
- `backend/main/main/asgi.py` - ASGI app with WebSocket routing
- `backend/main/main/routing.py` - WebSocket URL patterns
- `frontend/vite.config.js` - Dev server proxies and HMR config

## E2E Testing (Playwright)

Baseline regression net for the create-event flow. Located in `frontend/tests/e2e/`. Tests assume the **backend is already running on :8000** and the deterministic organizer fixture has been seeded.

```bash
# Once per setup (or whenever the dev DB is reset):
cd backend/main && python manage.py seed_e2e

# Make sure backend is up (Daphne preferred; runserver works too):
daphne -b 0.0.0.0 -p 8000 main.asgi:application

# Then run the suite (Playwright auto-starts Vite):
cd frontend
npm run test:e2e          # headless run
npm run test:e2e:ui       # interactive Playwright UI
```

The fixture is `e2e-organizer` / `E2eOrganizerPass!23` (defined in `backend/main/events/management/commands/seed_e2e.py`).

Tests marked with `test.fail(...)` document **known broken invariants** (past-date validation, autosave, idempotent publish, etc.) — they pass today *because* they fail as expected. Each fix flips one from `test.fail` to `test`. See plan: `~/.claude/plans/let-s-start-with-the-iridescent-bunny.md`.

## Available MCPs

- **Playwright MCP** — drives a real browser to verify create-event end-to-end. Use to walk the wizard and report breakages with screenshots.
- **Sentry MCP** — query unresolved issues, pull stack traces. Wired into Django via `SENTRY_DSN` env var (no-op when unset).
- **Stripe MCP** — test-mode product/price/webhook tooling for the eventual ticketing work (Phase 5).
- **Figma MCP** (preconfigured) — `get_design_context` for any Figma URL; reference React+Tailwind output, adapt to MUI.
- **Postgres MCP** — *not yet installed*. Will be added when we migrate off SQLite.

Install commands and required API keys are listed in `.env.example`.

## Learning journeys about this repo

Five learning journeys name this repo as their project, under `/home/molef/goal-setting/learning/`.
They read this repo and never write to it. `JOURNEYS.md` at that root is the register of all of them.

**`projects/attica/event-creation/`** builds an isolated create-event flow from an empty folder and
defends every design choice in it. Its `flow-map.md` is a step-by-step recording of the
event-creation wizard driven live in a browser on 2026-08-16: the click path, every background
request with its method, endpoint, payload and status, and the backend handler as `file:line`.
Before tracing that flow through the app yourself, read it. One caveat: its Step 0 claim that the
Vite proxy has no `/ws` rule is wrong, and the rest checks out.

**`projects/attica/architecture-decisions/`** holds the reasoning about how a database stops two
people booking the same provider on the same day. Before changing anything in `scheduling/`, read it
rather than re-deriving why the slot table has a unique constraint on its window.

**`projects/attica/interface-craft/`** makes a working multi-step flow feel immediate and
considered: tokens, motion, one cache, perceived speed.

**`ai-engineering/agent-harness/`** builds a coding-agent harness one layer at a time and uses it to
redesign this repo's create-event wizard.

**`ai-engineering/calendar-view-by-harness-corridor/`** replaces the create-event wizard with one
calendar view, merged through that harness.
