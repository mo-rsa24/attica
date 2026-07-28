# 📚 Source Analysis & Design Extraction

## Description

Review the replicate and unpack outputs (already produced in earlier steps) to extract the factual foundation for all documentation: the setup sequence, design decisions, architecture relationships, and terminology.

## Purpose

Establish a single source of truth for all documentation content. Every sentence in the onboarding docs must ground in the actual codebase, not assumption. This plan ensures the docs are accurate and consistent.

## Goal

Produce a reviewed, consolidated source document (`onboarding-source.md`) containing:
- Setup sequence (step-by-step order from bare repo to running system)
- Design decisions & rationale (REST-first + WebSocket, SQLite + Redis, JWT, multi-role auth)
- Core models & relationships (User, Event, Vendor, Artist, Location, ChatRoom, Message, ChatBid, etc.)
- Architecture flows (WebSocket auth, REST + WebSocket communication, event creation wizard)

## Tasks

- [ ] ⚠️ Review replicate output (PHASE 1 snapshot) — verify archetype classification, file structure, current state
  - [ ] Check: all 11 Django apps listed with models
  - [ ] Check: all key models named (Event, EventDraft, ChatRoom, ChatBid, etc.)
  - [ ] Note: any discrepancies between output and current code (use `git log` if needed)

- [ ] ⚠️ Review unpack output — verify setup sequence, design decision explanations
  - [ ] Check: backend setup section (venv, install, migrate, seed, Daphne) matches actual files
  - [ ] Check: frontend setup section (npm, Vite proxy, auth) is complete
  - [ ] Check: JWT auth flow, WebSocket integration explanations are clear
  - [ ] Note: any unclear passages to clarify in subsequent docs

- [ ] ⚠️ Extract and document the canonical setup sequence
  - [ ] Backend: venv creation → pip install → migrate → seed_e2e → daphne startup
  - [ ] Frontend: npm install → Vite dev server → Vite proxy to localhost:8000
  - [ ] External: Redis server on :6379

- [ ] ⚠️ Extract and document design decisions with rationale
  - [ ] REST-first architecture (database is source of truth, WebSocket is notify layer)
  - [ ] SQLite + Redis split (lightweight DB, scalable broadcasts)
  - [ ] JWT auth (stateless, frontend-friendly, token refresh on 401)
  - [ ] Multi-role CustomUser (supports organizer, vendor, artist, all in one account)

- [ ] ⚠️ Document core models & relationships
  - [ ] User → Event, Vendor, Artist, ChatRoom, Booking
  - [ ] Event → Location, ChatRoom, Booking, ArtistBooking
  - [ ] ChatRoom → Message, ChatBid
  - [ ] Diagram relationships in text or quick ASCII (to be formalized later in 04-architecture-diagrams)

- [ ] ⚠️ Consolidate into `onboarding-source.md`
  - [ ] Sections: Setup Sequence | Design Decisions | Core Models | Architecture Flows
  - [ ] Include: file paths, model names, endpoint paths (concrete, not abstract)
  - [ ] Include: command examples (e.g., `daphne -b 0.0.0.0 -p 8000 main.asgi:application`)

## Engagement Instructions

**Task: Review replicate output**
```
Read /home/molef/Work/attica/PHASE-1-SNAPSHOT.txt (the Phase 1 output from replicate skill).
Verify:
- All 11 apps listed: users, events, vendors, artists, locations, chat, cart, checkout, tickets, notifications, scheduling
- All key models present: CustomUser, Event, EventDraft, Vendor, Service, Artist, Location, ChatRoom, Message, ChatBid
- File structure matches current repo (backend/main/, frontend/src/)
Check actual code if any detail seems stale: `git log --oneline | head -20`
Document any discrepancies in a note.
```

**Task: Review unpack output**
```
Read /home/molef/Work/attica/UNPACK-OUTPUT.txt (the unpack skill output).
Verify sections:
- "What This System Is" — event marketplace description matches reality
- "The Key Design Decisions" — REST-first, SQLite+Redis, JWT, multi-role all explained
- "Setup Sequence" — backend and frontend steps are accurate (try them mentally; do they match CLAUDE.md?)
- "Database Layer" — models and relationships are correct
- "Frontend/Backend Split" — REST/WebSocket communication explained clearly
Mark any sections unclear or incomplete for revision in later docs.
```

**Task: Extract setup sequence**
```
From replicate output (Stage 1 setup section) and CLAUDE.md:
1. Backend: cd backend → python3.12 -m venv venv → source venv/bin/activate → cd main → pip install -r requirements.txt → python manage.py migrate → python manage.py seed_e2e → daphne -b 0.0.0.0 -p 8000 main.asgi:application
2. Frontend: cd frontend → npm install → npm run dev (starts :5173 with Vite proxy)
3. External: redis-server (port 6379)

Document in a list with rationale for each step (why migrate before seed, why seed_e2e, why daphne vs runserver).
```

**Task: Extract design decisions**
```
From unpack section "Key Design Decisions":
- REST-first: Why? Database is source of truth; WebSocket is notification layer (users never lose data on disconnect).
- SQLite + Redis: Why? SQLite is file-based (zero setup for dev); Redis coordinates WebSocket broadcasts across processes.
- JWT auth: Why? Stateless (no session server), frontend can refresh on 401 automatically, works for mobile.
- Multi-role auth: Why? Users are often multiple personas (photographer + event organizer); one account, many roles.

Document each with 2–3 sentences on the rationale. This becomes the "why" in the slides.
```

**Task: Document core models**
```
From replicate Phase 1 snapshot and user/events/vendors/artists/locations/chat models.py files:
Create a text document listing:
- User (CustomUser): id, username, email, roles M2M
- Event: id, user_id, name, date, status (draft/published), tiered_prices JSON
- EventDraft: same fields as Event, for incremental creation
- Vendor: id, user_id, name, category_id, services (1-M)
- Service: id, vendor_id, price, amenities M2M, regions M2M
- Artist: id, user_id, name, booking_fee, availability JSON
- Location: id, owner_id, name, capacity, price, amenities M2M
- ChatRoom: id, organizer_id, vendor_id, event_id (M-way unique)
- Message: id, room_id, sender_id, text, message_type (TEXT/SYSTEM/BID)
- ChatBid: id, room_id, organizer_id, vendor_id, amount, counter_amount, status (PENDING/ACCEPTED/DECLINED/COUNTERED)

Include one-line foreign key descriptions and M2M relationships.
```

**Task: Consolidate into onboarding-source.md**
```
Create a markdown file at /home/molef/Work/attica/onboarding-docs/onboarding-source.md with sections:
## Setup Sequence
(the steps from Task 3)

## Design Decisions & Rationale
(the decisions + rationale from Task 4, expanded to 1 short paragraph per decision)

## Core Models & Relationships
(the models list from Task 5, with ASCII relationship diagram or text description)

## Architecture Flows
(placeholders for WebSocket auth, event creation wizard, JWT refresh cycle — will be expanded in 04-architecture-diagrams)

This file becomes the single source of truth for all subsequent docs (02–05).
```

## Recommended skill
▶ `/unpack` ✅ — already run; output is source. Use the outputs directly (replicate and unpack from earlier steps).
   alt: Manual review of code + CLAUDE.md if outputs are unavailable or stale.
