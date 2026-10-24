# 🗺️ Attica: Environment and Architecture

Attica is a Django backend and a React frontend that talk to each other three different ways: REST
over a dev proxy, one hardcoded client that bypasses that proxy, and websockets over Redis. The
thing a plan gets wrong most often is treating "run the app" as one action. It is three or four
processes started by hand, and one of them (the outbox worker) is invisible when it is missing,
because the app keeps working and the notifications just never arrive.

## Table of contents

- [Compute / runtime](#compute--runtime)
- [Access paths](#access-paths)
- [Auth](#auth)
- [Execution model](#execution-model)
- [Known gaps / non-obvious constraints](#known-gaps--non-obvious-constraints)
- [Provenance](#provenance)

## Compute / runtime

Navigation: 📋 [TOC](#table-of-contents) | [Next](#access-paths) ➡️

**Everything runs locally on WSL2 and nothing starts itself.**

**The Python environment is `/home/molef/lobola`.**

Activate it with `source /home/molef/lobola/bin/activate`. It holds Python 3.12.9 (from miniconda),
Django 5.2.3, and `daphne`. This is the environment the Django app is actually run from.

**Two other virtual environments exist and neither should be used.**

`backend/venv/` works (same Python 3.12.9, same Django 5.2.3) but is not the one in use.
`/home/molef/.virtualenvs/lobola` holds 11 packages and has not been touched since 2025-06-29. The
venv shell at the repository root (`pyvenv.cfg`, `lib/`, `include/`) has no `bin/` directory at
all, so nothing can run from it.

**Redis must be running before the backend starts.**

It listens on `127.0.0.1:6379`. Both the websocket channel layer and the page cache depend on it,
so a backend started without it fails on the first cached read rather than at startup.

**There is no Celery and no task queue daemon.**

Background dispatch is a plain Django management command that a person starts:
`backend/main/scheduling/management/commands/run_outbox_worker.py`, or
`dispatch_scheduling_outbox.py` for a single pass.

## Access paths

Navigation: ⬅️ [Compute / runtime](#compute--runtime) | 📋 [TOC](#table-of-contents) | [Next](#auth) ➡️

**The database is SQLite at `backend/main/db.sqlite3`.**

One file, no server. It is committed to the repository and shows as modified in `git status`
whenever the app has been run, which is normal here and not a change anybody made on purpose.

**Redis is one server carrying two unrelated things.**

The websocket channel layer uses the default logical database via `channels_redis`. The page cache
uses logical database 1 via `django_redis`, at `redis://127.0.0.1:6379/1`. Flushing the wrong one
silently drops live websocket groups.

**Uploaded media goes to local disk, not to object storage.**

Event draft assets land under
`backend/main/media/event_draft_assets/organizer_<id>/draft_<id>/<asset_type>/<uuid>.<ext>` and are
served at `/media/`. No S3, no CDN, nothing configured for one.

**The frontend reaches the backend two different ways, and this is the split with no bridge.**

Most of the app calls relative URLs (`/api`, `/vendors`, `/cart`, `/checkout`, `/ws`) which the
Vite dev server proxies to `http://localhost:8000`. But `useAxios` hardcodes
`baseURL = 'http://127.0.0.1:8000'` at `frontend/src/utils/useAxios.js:10`, so that one client
bypasses the proxy entirely and needs a CORS allowance the others do not. A plan that assumes one
HTTP path to the backend is wrong about roughly half the wizard.

**Error reporting goes to Sentry only when `SENTRY_DSN` is set.**

The Django integration is a no-op when the variable is unset, which is the default in a fresh
shell. A session that expects an exception to appear in Sentry and never exported the variable will
wait forever for an event that was never sent.

**Geocoding never touches the Attica backend.**

The location step calls `nominatim.openstreetmap.org` and fetches OSM map tiles directly from the
browser. Nothing about those requests appears in Django logs, so a location bug is not debuggable
from the backend side.

## Auth

Navigation: ⬅️ [Access paths](#access-paths) | 📋 [TOC](#table-of-contents) | [Next](#execution-model) ➡️

**JWT through `djangorestframework-simplejwt`, with no token table behind it.**

Access and refresh tokens are minted in memory and signed. Nothing in the database records an
issued token, so a token cannot be revoked server-side and "log this user out everywhere" is not a
thing this system can currently do.

**The browser keeps tokens in `localStorage` under the key `tokens`.**

`AuthProvider` stores `{access, refresh, user}` there. They survive a tab close and are readable by
any script running on the page.

**Websockets authenticate by query parameter, not by header.**

The connection URL carries `?token=<jwt>`, unwrapped by `WebSocketJWTAuthMiddleware` in
`backend/main/main/routing.py` before the channels `AuthMiddlewareStack` runs. A websocket client
that sends an `Authorization` header instead will connect unauthenticated.

**CORS is bound to two named ports and nothing else.**

`CORS_ALLOWED_ORIGINS` defaults to `http://localhost:5173,http://localhost:3000`
(`backend/main/main/settings.py:140`). Vite binds 5174 when 5173 is already taken, and when that
happens the hardcoded-`baseURL` calls above start failing CORS while every proxied call keeps
working. The symptom is half the wizard breaking for no visible reason.

## Execution model

Navigation: ⬅️ [Auth](#auth) | 📋 [TOC](#table-of-contents) | [Next](#known-gaps--non-obvious-constraints) ➡️

**"Running Attica" means four processes, started by hand, in this order.**

1. Redis on `127.0.0.1:6379`.
2. The backend, from `/home/molef/lobola`, in `backend/main/`. Use
   `daphne -b 0.0.0.0 -p 8000 main.asgi:application` when anything touches websockets;
   `python manage.py runserver` serves HTTP only and websockets will fail with no clear error.
3. The Vite dev server in `frontend/` (`npm run dev`), which also owns the proxy.
4. The outbox worker, when the booking path is being exercised.

**The outbox worker is the one a plan forgets.**

Booking and scheduling writes append a row to `scheduling_outboxevent` and return successfully.
A separate process turns those rows into notifications. If it is not running, every write still
succeeds, every API response still looks correct, and no notification is ever delivered. There is
no error anywhere.

📊 Drawn in [Every event is written and none is sent](artifacts/scenes/scheduling-process-flows/figure-explainer.md#figure-5-every-event-is-written-and-none-is-sent).

## Known gaps / non-obvious constraints

Navigation: ⬅️ [Execution model](#execution-model) | 📋 [TOC](#table-of-contents) | [Next](#provenance) ➡️

**The outbox backlog is a worker nobody started, not a broken dispatcher.**

On 2026-08-22 the table held 23 `pending` and 8 `sent`. Running
`python manage.py dispatch_scheduling_outbox` cleared it in one pass:
`processed=23 failed=0 dead_lettered=0`, leaving 31 `sent` and nothing pending. So when rows pile
up, the dispatch path is fine and the worker was simply never run.

**`python manage.py test` is not a green baseline.**

Two of its 43 tests fail, both in `events/tests.py`, so the suite cannot tell you whether a change
broke something: you have to know the two expected failures by name first. What each one is and who
owns fixing them is in [the plan for reconciling the suite and the
runbook](../plans/create-event-end-to-end/plans/fixing-create-event/plans/03-reconcile-suite-and-runbook.md).

**There is no working pytest here.**

`pytest` is absent from `/home/molef/lobola`, from `backend/venv`, and from
`backend/main/requirements.txt`. The only one on the PATH is the system `/usr/bin/pytest`, which
has no Django. Two files named `test_*` are URL configuration modules rather than tests
(`main/test_urls_cli.py`, `scheduling/test_urls.py`), so collection would fail even once pytest
were installed.

**The booking-request write path never pushes to the channel layer.**

`_create_in_app_notification` in `backend/main/scheduling/services.py:2658` writes a database row
and stops. It never calls the push-capable `create_notification` in
`backend/main/notifications/utils.py`. So Redis is fully configured, running, and unused on this
path.

**Uploads above 50 MB are rejected by the server.**

`MAX_UPLOAD_SIZE_BYTES` defaults to 50 MB (`backend/main/main/settings.py:230`). The upload screen
tells the user a different number, which is a defect owned by [the plan for closing the create-event
gaps](../plans/create-event-end-to-end/plans/fixing-create-event/plans/02-close-the-gaps.md).

**`node-websocket/` is dead.**

It contains only `node_modules` and a lockfile. The root `package.json` describing it names build
paths (`backend/chat`, `frontend`) that do not match this repository's layout.

📊 Drawn in [Three exits, and one state nothing can reach](artifacts/scenes/scheduling-process-flows/figure-explainer.md#figure-4-three-exits-and-one-state-nothing-can-reach).

## Provenance

Navigation: ⬅️ [Known gaps / non-obvious constraints](#known-gaps--non-obvious-constraints) | 📋 [TOC](#table-of-contents)

Every fact in this folder carries one of three marks. `verified` means probed live on the date given
and the result seen. `stated` means a person said it and it was not probed. `inferred` means it was
read out of the repository and confirmed by neither a person nor a run.

The row for each fact, with the date and the command or file that established it, is in [the
provenance table](provenance.md).
