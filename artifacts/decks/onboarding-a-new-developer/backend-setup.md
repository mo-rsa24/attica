---
marp: true
theme: default
paginate: true
style: |
  section {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 1.05rem;
    padding: 2.5rem 3rem;
  }
  h1 { color: #1a1a2e; font-size: 2.2rem; }
  h2 { color: #16213e; border-bottom: 2px solid #0f3460; padding-bottom: 0.3em; margin-bottom: 1rem; }
  pre { background: #1e1e2e; color: #cdd6f4; padding: 1em; border-radius: 6px; font-size: 0.9rem; }
  code { background: #eff1f5; padding: 0.15em 0.35em; border-radius: 3px; font-size: 0.92em; }
  table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
  th { background: #0f3460; color: white; padding: 0.5em 0.8em; }
  td { padding: 0.45em 0.8em; border-bottom: 1px solid #ddd; }
  blockquote { border-left: 4px solid #0f3460; margin: 1em 0; padding: 0.5em 1em; background: #f0f4ff; color: #333; }
---

# Backend Setup
## Django 5.2.3 + Channels + SQLite

Attica backend — fresh clone to running server in six steps.

---

## Why these three tools?

**Django** is a batteries-included web framework. Auth, ORM, admin, migrations: all built in. You write domain logic, not plumbing.

**Django Channels** extends Django to handle WebSocket connections. Attica has live direct messaging — HTTP alone can't push a message to a browser. Channels adds that real-time layer.

**SQLite** stores the database in a single file (`db.sqlite3`). No server to install. No config to share. Works identically on every developer's machine.

> Each choice removes a setup burden. Together they mean: clone the repo, run four commands, have a working backend.

---

## Step 1 — Virtual Environment

A virtual environment is an isolated copy of Python with its own packages. It prevents version conflicts between projects on the same machine.

```bash
cd backend
python3.12 -m venv venv
```

Creates a `venv/` folder containing a private Python 3.12 interpreter and a private package store.

**Activate it before doing anything else:**

```bash
# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

Your shell prompt changes to `(venv)`. That prefix confirms isolation is active.

---

## Step 2 — Install Dependencies

With the venv active, install all required packages:

```bash
pip install -r main/requirements.txt
```

Key packages installed:
- `django` — the web framework
- `djangorestframework` — REST API layer (DRF)
- `channels` + `channels-redis` — WebSocket support
- `djangorestframework-simplejwt` — JWT authentication
- `Pillow` — image uploads (vendor/artist profile photos)
- `redis` — Python client for the Redis channel layer

~50 packages total. They land inside `venv/`, not system Python.

---

## Step 3 — Database Migrations

Django tracks every schema change as a numbered Python file called a **migration**. Each migration says: "add this table", "add this column", etc.

Running `migrate` applies all pending migrations to `db.sqlite3`:

```bash
cd main
python manage.py migrate
```

Creates tables for 11 Attica apps — users, events, vendors, artists, chat, cart, checkout, tickets, locations, and more (~40 models).

> Why not write the SQL by hand? Migrations are version-controlled. Every developer on every machine gets an identical schema, automatically.

---

## Step 4 — Seed Data (optional)

The database starts empty. End-to-end tests need known data — a user to log in as, vendors to browse.

```bash
python manage.py seed_e2e
```

Creates:
- **Login:** `e2e-organizer` / `E2eOrganizerPass!23`
- Sample vendors, locations, and linked fixtures

**When to run it:** before running the Playwright test suite, or when you want realistic data to browse locally.

**When to skip it:** when building a new feature with its own test data, or when you want a clean empty database.

---

## Step 5 — Start the Server

Two options:

| Command | Protocol | WebSocket? | Use when |
|---|---|---|---|
| `python manage.py runserver` | HTTP (WSGI) | No | Quick checks, no chat needed |
| `daphne -b 0.0.0.0 -p 8000 main.asgi:application` | HTTP + WS (ASGI) | Yes | Full app with messaging |

**Default: use Daphne.** The Attica chat system requires WebSocket. `runserver` silently rejects WebSocket handshakes.

```bash
daphne -b 0.0.0.0 -p 8000 main.asgi:application
```

---

## Step 6 — Verify

**REST API working?**

Open `http://localhost:8000/api/events/` — should return JSON (empty array if no events seeded).

**WebSocket working?**

```bash
wscat -c 'ws://localhost:8000/ws/chat/rooms/1/?token=<access_token>'
```

**Redis running?**

```bash
redis-cli ping   # → PONG
```

Redis must be up on `localhost:6379`. Without it, Channels has no channel layer — WebSocket connections fail, sometimes silently.

If anything fails, see `guides/backend-setup.md` for troubleshooting steps.
