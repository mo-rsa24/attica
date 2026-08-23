# Backend Setup Guide

Get the Attica Django backend running on `localhost:8000` with WebSocket support.

Related artifacts:
- **Procedure diagram:** [`../../figures/onboarding-a-new-developer/backend-setup-procedure.md`](../../figures/onboarding-a-new-developer/backend-setup-procedure.md) — the shape of this process at a glance
- **Slide deck:** [`../../decks/onboarding-a-new-developer/backend-setup.md`](../../decks/onboarding-a-new-developer/backend-setup.md) — the "why" behind each step

---

## Prerequisites

Before starting, confirm:

- **Python 3.12** — `python3.12 --version` should print `3.12.x`
- **Redis on localhost:6379** — `redis-cli ping` should return `PONG`
- **Repo cloned** — you're in the `attica/` directory

If any of these aren't in place yet — including on a fresh Windows machine with
nothing installed — start at [00-machine-setup.md](00-machine-setup.md) instead,
which walks through installing WSL2, Python 3.12, Node, and Redis from scratch.

If Redis is installed but not running: `redis-server` (macOS/Linux), start the
Redis Windows service, or on WSL2 see [00-machine-setup.md](00-machine-setup.md#6-install-and-start-redis).

---

## 1. Create Virtual Environment

A virtual environment keeps Attica's packages isolated from your system Python. This prevents version conflicts and makes the environment reproducible.

```bash
cd backend
python3.12 -m venv venv
```

**Expected result:** a `backend/venv/` directory is created containing a private Python interpreter and package store.

---

## 2. Activate Virtual Environment

Activation points your shell at the venv's Python and pip, not the system ones.

**macOS / Linux (bash or zsh):**
```bash
source venv/bin/activate
```

**Windows (Command Prompt):**
```bash
venv\Scripts\activate
```

**Windows (PowerShell):**
```bash
venv\Scripts\Activate.ps1
```

**Expected result:** your prompt now shows `(venv)` as a prefix. Every `python` and `pip` command now runs inside the venv.

---

## 3. Install Dependencies

You should still be in the `backend/` directory (the `venv/` folder should be
next to you). Confirm which requirements file you're about to install from:

```bash
cat main/requirements.txt | wc -l
```

**Expected result:** `62`. If this file doesn't exist, or a bare `requirements.txt`
in your current directory has a different line count, stop and check
[Troubleshooting](#troubleshooting) below — installing the wrong file pulls in
packages Attica doesn't use and use of the correct pinned versions is what makes
this step reproducible.

```bash
pip install -r main/requirements.txt
```

This reads `backend/main/requirements.txt` and installs all required packages into the venv.

**Expected result:** ~50 packages installed, ending with output like:
```
Successfully installed django-5.1.x djangorestframework-3.x.x channels-4.x.x ...
```

Key packages:
| Package | Purpose |
|---|---|
| `django` | Web framework |
| `djangorestframework` | REST API (DRF) |
| `channels` | WebSocket support |
| `channels-redis` | Redis channel layer for Channels |
| `djangorestframework-simplejwt` | JWT authentication |
| `Pillow` | Image uploads |
| `redis` | Python Redis client |
| `daphne` | ASGI server |

**Confirm no conflicts before moving on:**

```bash
pip check
```

**Expected result:** `No broken requirements found.` If this prints anything else,
stop here: a version conflict now will surface later as a confusing runtime error
during migrate or server startup, not a clear one here. Every package in
`requirements.txt` is pinned with `==`, so `pip check` failing on a clean venv
almost always means the venv wasn't actually clean (see
[Troubleshooting](#troubleshooting)) or `python3.12` resolved to a Python version
pip had to compromise on.

---

## 4. Run Database Migrations

Migrations are versioned Python files that describe schema changes (create table, add column, etc.). Running `migrate` applies them in order to produce the full database schema.

```bash
cd main
python manage.py migrate
```

**Expected result:** output listing migrations for each app, ending with:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying users.0001_initial... OK
  ...
  Applying tickets.0001_initial... OK
```

Creates `backend/main/db.sqlite3` — the SQLite database file. This file is gitignored; every developer generates their own from migrations.

---

## 5. Seed Test Data (Optional)

The database starts completely empty. The seed command populates it with deterministic test fixtures needed for end-to-end tests.

```bash
python manage.py seed_e2e
```

**Expected result:**
```
Created organizer: e2e-organizer
Created vendors: ...
Seed complete.
```

**Credentials created:**
- Username: `e2e-organizer`
- Password: `E2eOrganizerPass!23`

**When to run:** before running the Playwright test suite (`npm run test:e2e` in `frontend/`). The suite expects this user to exist.

**When to skip:** when developing a new feature with its own data, or when you want a clean empty database to start from.

The seed command is idempotent — running it twice does not create duplicates.

---

## 6. Start the Server

### Option A — Daphne (recommended)

Daphne is an ASGI server that handles both HTTP and WebSocket connections. Required for the Attica chat system.

```bash
daphne -b 0.0.0.0 -p 8000 main.asgi:application
```

**Expected result:**
```
2024-... - INFO - HTTP/1.1 protocol
Listening on endpoint tcp:interface=0.0.0.0:port=8000
```

### Option B — Django's built-in server

HTTP only. Use this if you're working on a feature that doesn't involve WebSocket and want faster restart times.

```bash
python manage.py runserver
```

Do **not** use this when testing the chat/messaging features — WebSocket handshakes are silently rejected.

---

## 7. Verify the Setup

### REST API

Open in browser: `http://localhost:8000/api/events/`

Should return JSON — either an empty array `[]` or a list of events if seeded.

### WebSocket

You need a valid JWT access token. Get one by logging in via the API:

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username": "e2e-organizer", "password": "E2eOrganizerPass!23"}'
```

Then test the WebSocket:

```bash
wscat -c 'ws://localhost:8000/ws/chat/rooms/1/?token=<access_token>'
```

Should connect without an error. Install `wscat` with `npm install -g wscat`.

### Redis

```bash
redis-cli ping
# Expected: PONG
```

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'django'`**

Venv is not active. Run `source venv/bin/activate` (or Windows equivalent) and try again. The `(venv)` prefix must be visible in your prompt.

**`django.db.utils.OperationalError: no such table`**

Migrations have not run. Run `python manage.py migrate` from `backend/main/`.

**`ConnectionRefusedError` or `ECONNREFUSED` on WebSocket**

Redis is not running. Start it with `redis-server` in a separate terminal and keep it running.

**`Address already in use` / port 8000 busy**

Another process is using port 8000. Use a different port:
```bash
daphne -b 0.0.0.0 -p 9000 main.asgi:application
```
Note: the frontend Vite proxy targets `:8000` by default, so you would also need to update `frontend/vite.config.js`.

**`ImproperlyConfigured: settings.DATABASES is improperly configured`**

You're running `manage.py` from the wrong directory. Confirm you're in `backend/main/` (where `manage.py` lives), not `backend/`.

**`pip install` fails on an unfamiliar package (e.g. `cloud-init`, `dbus-python`, `distro-info`, or anything else that sounds like an Ubuntu system package, not a Django/Python library)**

You installed from the wrong requirements file. `backend/main/requirements.txt` (62
lines) is the only one this project uses; if a stray `backend/requirements.txt`
exists in your clone, delete it or ignore it. Confirm you're in `backend/` (one
level above `main/`) when you run `pip install -r main/requirements.txt`, and that
`cat main/requirements.txt | wc -l` prints `62` before installing.

**Migrations conflict (`Your models in app(s) have changes that are not yet reflected in a migration`)**

Someone added a model change without creating a migration. Run:
```bash
python manage.py makemigrations
python manage.py migrate
```

**Seed fails with `IntegrityError: UNIQUE constraint failed`**

The database already has the seeded user. Either skip seeding (already done) or reset:
```bash
python manage.py flush --no-input
python manage.py seed_e2e
```
