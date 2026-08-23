# 🔧 Bringing the stack up

Four processes, started by hand, in order. Nothing starts itself and nothing tells you when a piece
is missing, which is why two of these recipes are about diagnosing silence rather than starting
something.

Where these processes live and why there are four is in
[Environment § Execution model](../../environment/overview.md#execution-model).

## Contents

- [1. Bring the whole stack up](#1-bring-the-whole-stack-up)
- [2. Start the backend with websockets](#2-start-the-backend-with-websockets)
- [3. Find out why half the app is failing](#3-find-out-why-half-the-app-is-failing)
- [4. Drain the outbox](#4-drain-the-outbox)

## 1. Bring the whole stack up

Navigation: 📋 [Contents](#contents) | [Next](#2-start-the-backend-with-websockets) ➡️

`unverified` (assembled from the repository and [the original QA guide](../sources/booking-test-guide-original.md); not run end to end this session)

Four terminals. Order matters: Redis first, or the backend fails on its first cached read rather
than at startup.

**Terminal 1, Redis**

```bash
redis-server
```

✅ It prints a banner ending `Ready to accept connections`. Check it from another shell with
`redis-cli ping`, which answers `PONG`.

❌ `Could not create server TCP listening socket *:6379: bind: Address already in use` means it is
already running. That is fine; carry on.

**Terminal 2, the backend**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
daphne -b 0.0.0.0 -p 8000 main.asgi:application
```

✅ `Listening on TCP address 0.0.0.0:8000`.

Use `daphne`, not `runserver`. See [recipe 2](#2-start-the-backend-with-websockets) for why.

**Terminal 3, the frontend**

```bash
cd /home/molef/Work/attica/frontend
npm run dev
```

✅ Vite prints `Local: http://localhost:5173/`.

⚠️ **Read the port it actually printed.** If 5173 was taken, Vite silently uses 5174 and part of the
app will fail with no useful error. See [recipe 3](#3-find-out-why-half-the-app-is-failing).

**Terminal 4, the outbox worker, only when you are exercising bookings**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
python manage.py run_outbox_worker
```

Skip it and everything still appears to work. Notifications just never arrive. See
[recipe 4](#4-drain-the-outbox).

<details>
<summary><b>Why four processes and not one</b></summary>

Django serves HTTP, Daphne adds the ASGI layer that carries websockets, Vite serves the frontend
and proxies to Django, and Redis carries both the websocket channel layer and the page cache. The
outbox worker is a fifth thing: a plain management command that turns queued rows into
notifications. None of them supervises any other, so a missing one is silent by construction.
</details>

## 2. Start the backend with websockets

Navigation: ⬅️ [1. Bring the whole stack up](#1-bring-the-whole-stack-up) | 📋 [Contents](#contents) | [Next](#3-find-out-why-half-the-app-is-failing) ➡️

`unverified`

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
daphne -b 0.0.0.0 -p 8000 main.asgi:application
```

✅ `Listening on TCP address 0.0.0.0:8000`, and a browser at `http://localhost:8000/api/events/`
returns JSON.

❌ Chat and notifications connect and immediately drop, with nothing useful in the server log. You
started `python manage.py runserver`, which serves HTTP only. There is no error message for this;
the symptom is the diagnosis.

❌ `ConnectionRefusedError` on the first request that touches the cache means Redis is not up. Start
it (recipe 1) and restart the backend.

<details>
<summary><b>What Daphne adds</b></summary>

`main/asgi.py` wires a `ProtocolTypeRouter` with two branches: `http` goes to Django's normal
handler, `websocket` goes through `WebSocketJWTAuthMiddleware` into the chat and notification
consumers. `runserver` only ever serves the first branch.
</details>

## 3. Find out why half the app is failing

Navigation: ⬅️ [2. Start the backend with websockets](#2-start-the-backend-with-websockets) | 📋 [Contents](#contents) | [Next](#4-drain-the-outbox) ➡️

`unverified`

**The symptom.** Most of the app works. Some pages fail to load data. The browser console shows
CORS errors on a few requests and nothing wrong with the rest.

**The cause, almost always.** Vite bound a port that is not in the backend's allowed origins.

**Check it, read-only**

```bash
# what port did Vite actually take?
ss -ltn | grep -E '5173|5174'
```

Then in Chrome DevTools, Network tab, filtered to Fetch/XHR with Preserve log on, reload and look
at the failing requests.

✅ You will see two kinds of request: relative ones (`/api/...`) that succeed through the proxy, and
at least one to `http://127.0.0.1:8000` that fails CORS. That split is the diagnosis.

**The fix, either one**

Free port 5173 and restart Vite, or extend the allowed origins:

```bash
export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000"
```

then restart the backend.

> 📷 **Screenshot wanted**: the Network tab showing one CORS-failed request beside one that
> succeeded through the proxy. Save as `images/stack/01-cors-failure-beside-success.png`.

<details>
<summary><b>Why only some requests fail</b></summary>

The frontend has two HTTP clients. Most of the app calls relative URLs that the Vite proxy
forwards, so the browser never sees a cross-origin request. But `useAxios` hardcodes
`baseURL = 'http://127.0.0.1:8000'` and bypasses the proxy, so those calls are cross-origin and need
an explicit CORS allowance. The default allows ports 5173 and 3000 only. Full detail in
[Environment § Access paths](../../environment/overview.md#access-paths).
</details>

## 4. Drain the outbox

Navigation: ⬅️ [3. Find out why half the app is failing](#3-find-out-why-half-the-app-is-failing) | 📋 [Contents](#contents)

`ran 2026-08-22`

**The symptom.** Bookings and scheduling actions succeed, every API response looks right, and no
notification ever arrives. There is no error anywhere.

**Check first, read-only**

```bash
cd /home/molef/Work/attica/backend/main
python3 -c "
import sqlite3
c = sqlite3.connect('db.sqlite3')
for r in c.execute('select status, count(*) from scheduling_outboxevent group by status'):
    print(r[0], r[1])
"
```

Anything above zero in `pending` means rows are queued and nobody is consuming them.

**Then drain it**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
python manage.py dispatch_scheduling_outbox     # one pass
# or, to keep consuming:
python manage.py run_outbox_worker
```

✅ Real run, 2026-08-22. Before, 23 pending and 8 sent. Then:

```
Outbox dispatched: processed=23 failed=0 dead_lettered=0
```

After: 31 sent, nothing pending. **The dispatcher works.** A backlog here means nobody ran it, not
that anything is broken, which is worth knowing before you go looking for a fault.

❌ If `pending` does not move, the dispatch path itself is the problem, not the worker. Note that
the booking-request write path never calls `group_send` at all: `_create_in_app_notification`
(`backend/main/scheduling/services.py:2658`) writes a database row and stops. That is a known gap,
recorded in [Environment § Known gaps](../../environment/overview.md#known-gaps--non-obvious-constraints).

<details>
<summary><b>Why there is a queue at all</b></summary>

Writes append a row to `scheduling_outboxevent` inside the same transaction as the booking, so a
notification can never be sent for a booking that rolled back. A separate process turns those rows
into notifications afterwards. The cost of that safety is that the second process is a thing
someone has to remember to start.
</details>
