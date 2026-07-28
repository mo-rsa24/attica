# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Attica is a full-stack event management and marketplace platform connecting event organizers with vendors, artists, and service providers. It features real-time direct messaging with a bid system.

## Tech Stack

- **Backend**: Django 5.1 + Django REST Framework + Django Channels (WebSockets)
- **Frontend**: React 19 + Vite + Material-UI + TailwindCSS
- **Database**: SQLite (development), Redis for channel layer and caching
- **Auth**: JWT via djangorestframework-simplejwt

## Development Commands

### Backend (Django)
```bash
cd backend/main
source ../venv/bin/activate
python manage.py runserver                    # HTTP only (port 8000)
daphne -b 0.0.0.0 -p 8000 main.asgi:application  # With WebSocket support
python manage.py migrate                      # Run migrations
python manage.py test                         # Run Django tests
pytest                                        # Run pytest suite
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
- Python 3.12 with virtual environment at `backend/venv/`
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
