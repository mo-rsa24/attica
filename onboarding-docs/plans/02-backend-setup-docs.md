# ⚙️ Backend Setup Documentation

## Description

Create step-by-step setup documentation for the Django/DRF/Channels backend: Python virtual environment, dependency installation, database migrations, seed data, and Daphne server startup. Pair each step with a visual (procedure diagram or slide).

## Purpose

Enable a new developer to set up the backend independently, understanding both the "what" (commands) and "why" (design decisions). Target: backend running at `localhost:8000` with WebSocket support.

## Goal

Produce:
1. Procedure diagram (fork/join flowchart): venv creation → pip install → migrate → seed → daphne start
2. Marp slide deck: 1 title slide + 1 slide per step (venv, install, migrate, seed, daphne, verify)
3. Markdown text guide: step-by-step instructions with command blocks, error handling, and design rationale

All three artifacts must be cohesive (same terminology, same step order).

## Tasks

- [x] ⚠️ Create procedure diagram (fork/join flowchart)
  - [x] Input: bare repo (`git clone` done)
  - [x] Step 1: Create venv (fork: activate on different shells — bash/zsh, Windows; rejoin)
  - [x] Step 2: Pip install (from requirements.txt)
  - [x] Step 3: Django migrate (schema creation)
  - [x] Step 4: Seed_e2e (optional, joins for "with test data" vs "no test data" paths)
  - [x] Step 5: Start Daphne (or runserver as fallback)
  - [x] Output: backend running (:8000, WebSocket ready)
  - [x] Tool: visualize-procedure → `diagrams/backend-setup-procedure.md`

- [x] ⚠️ Create Marp slide deck (6–8 slides)
  - [x] Slide 1: Title — "Backend Setup: Django 5.1 + Channels + SQLite"
  - [x] Slide 2: Architecture overview (why Django, why Channels, why SQLite — from design-decisions section)
  - [x] Slide 3: Venv & installation (what it does, why, command)
  - [x] Slide 4: Database migrations (what they are, why Django uses them, command)
  - [x] Slide 5: Seed data (what seed_e2e does, why optional, when to use)
  - [x] Slide 6: Starting the server (Daphne vs runserver, WebSocket support)
  - [x] Slide 7: Verification (check localhost:8000 returns JSON, WebSocket can connect)
  - [x] Tool: progress-brief (novice mode) → `slides/backend-setup.md`

- [x] ⚠️ Create markdown text guide
  - [x] Sections: Prerequisite | Virtual Environment | Installation | Database | Seed Data | Server Startup | Troubleshooting
  - [x] Each section: plain English intro + command block + expected output + explanation
  - [x] Include: paths relative to repo root, exact commands (not "run something like...")
  - [x] Include: common errors (ModuleNotFoundError, migration conflicts, Redis not found) and fixes
  - [x] Saved to: `guides/backend-setup.md`

- [x] ⚠️ Link artifacts together
  - [x] Procedure diagram is "the shape" of the process
  - [x] Slides explain the "why" and show progress snapshots
  - [x] Text guide is the "do-it-now" reference

## Engagement Instructions

**Task: Create procedure diagram**
```
Run `/flowspec` or `/visualize-procedure` with this brief:

"Create a fork/join flowchart (procedure diagram) for Django backend setup.

Input: Fresh Attica repo (git clone done, cd backend).

Steps (in order):
1. Create Python venv (python3.12 -m venv venv)
2. Activate venv (fork: bash/zsh activate vs Windows activate.bat; both rejoin after)
3. Install dependencies (pip install -r main/requirements.txt)
4. Run migrations (cd main && python manage.py migrate)
5. [Optional fork] Seed test data (python manage.py seed_e2e)
6. Start server (daphne -b 0.0.0.0 -p 8000 main.asgi:application)

Output: Backend running on localhost:8000 with WebSocket support.

Include decision points (do you want test data?), parallel paths (Windows vs Unix shell), and arrows between steps.
Format: Mermaid or ASCII flowchart (platform-portable).
Save to: onboarding-docs/diagrams/backend-setup-procedure.md"
```

**Task: Create Marp slide deck**
```
Run `/progress-brief` with this brief (novice mode):

"Create a Marp slide deck (6–8 slides) explaining Django backend setup for a developer new to this codebase.

Audience: Django/Python literate, but new to Attica, Channels, and this particular setup.

Slides:
1. Title: 'Backend Setup: Django 5.1 + Channels + SQLite'
2. Architecture Overview — explain why this project uses Django (batteries-included web framework), why Channels (real-time WebSocket), why SQLite (lightweight, file-based, zero setup).
3. Venv & Installation — what a virtual environment is (isolated Python with dependencies), why we use it, the command (python3.12 -m venv venv), and what gets installed (Django, DRF, Channels, Pillow, etc. from requirements.txt).
4. Database Migrations — what migrations are (versioned SQL schemas), why Django uses them (reproducible schema changes), the command (python manage.py migrate), and what tables are created (11 apps, 40 models).
5. Seed Data — what seed_e2e does (creates a test organizer user + sample vendors + locations), why it's optional (you can test with empty DB), when to use it (for end-to-end testing).
6. Server Startup — Daphne (ASGI server supporting WebSocket, port 8000) vs runserver (simpler, HTTP-only, port 8000). Which to use (Daphne for real-time messaging, runserver if you don't need WebSocket).
7. Verification — check localhost:8000 (should return JSON), check WebSocket (should connect on ws://localhost:8000/ws/chat/rooms/<room_id>/), verify Redis is running.

Format: Marp markdown (https://marp.app/). Save to: onboarding-docs/slides/backend-setup.md"
```

**Task: Create markdown text guide**
```
Create a markdown file at onboarding-docs/guides/backend-setup.md with sections:

## Backend Setup Guide

### Prerequisites
- Python 3.12
- Redis running on localhost:6379
- Git (repo already cloned)

### 1. Create Virtual Environment
[Explanation of what a venv is]

\`\`\`bash
cd backend
python3.12 -m venv venv
\`\`\`

Expected output: A venv/ directory is created.

### 2. Activate Virtual Environment
[Explanation: isolates dependencies]

**macOS/Linux:**
\`\`\`bash
source venv/bin/activate
\`\`\`

**Windows:**
\`\`\`bash
venv\Scripts\activate
\`\`\`

You should see (venv) in your shell prompt.

### 3. Install Dependencies
[Explanation: requirements.txt lists all Python packages needed]

\`\`\`bash
cd main
pip install -r requirements.txt
\`\`\`

Expected: ~50+ packages installed (Django, DRF, Channels, Redis, Pillow, etc.).

### 4. Run Migrations
[Explanation: creates DB schema]

\`\`\`bash
python manage.py migrate
\`\`\`

Expected: "Running migrations... Operations to perform: 11 (or more) migrations." Produces db.sqlite3 file.

### 5. Seed Test Data (Optional)
[Explanation: creates a test organizer + sample data]

\`\`\`bash
python manage.py seed_e2e
\`\`\`

Expected: Creates user 'e2e-organizer', password 'E2eOrganizerPass!23', plus sample vendors, locations, etc.

### 6. Start Server
[Explanation: Daphne is the ASGI server; handles HTTP + WebSocket]

\`\`\`bash
daphne -b 0.0.0.0 -p 8000 main.asgi:application
\`\`\`

Expected: "Server running on :8000". Open http://localhost:8000/api/events/ in browser → should return JSON.

### 7. Verify WebSocket (Optional)
[Explanation: WebSocket is for real-time chat]

\`\`\`bash
# In another terminal, test WebSocket connection:
wscat -c 'ws://localhost:8000/ws/chat/rooms/1/?token=<access_token>'
\`\`\`

Or use the frontend (see frontend-setup.md).

### Troubleshooting

**ModuleNotFoundError: No module named 'django'**
→ Venv not activated? Run \`source venv/bin/activate\` (or Windows equivalent).

**django.db.utils.ProgrammingError: no such table**
→ Migrations not run? Run \`python manage.py migrate\`.

**ConnectionRefusedError (Redis)**
→ Redis not running? Start \`redis-server\` in another terminal.

**Port 8000 already in use**
→ Change port: \`daphne -b 0.0.0.0 -p 9000 main.asgi:application\`.

[Add more as needed from actual experience.]
```

## Recommended skill
▶ `/visualize-procedure` ✅ — generates flowcharts/diagrams from procedures. Use for the fork/join diagram.
   alt: `/flowspec` for a more formal flowchart representation.
   ▶ `/progress-brief` ✅ (novice mode) — drafts explanatory content; refine into Marp format.
