# Attica: a REST-first backend and its WebSocket overlay

## The claim

The row is committed and serialized before anything is broadcast, so every real-time path is droppable. Drop it and latency degrades from about 16 ms to up to 8 s. Correctness does not move.

The alternative it beats is polling `GET /api/chat/rooms/<id>/messages/` every 8 seconds, which is not hypothetical: it is what [DirectMessagePage.jsx:258-264](../../frontend/src/pages/DirectMessagePage.jsx#L258-L264) starts doing the moment `socketError` is set.

And the case where the alternative wins: Redis dying *after* the sockets connected. `broadcast_room_event` swallows the error, the POST still returns 201, and nobody is told anything, so the fallback poll never starts and the second browser stays stale until it reloads. The dumb poll would have caught it on its next tick.

## Run it

```bash
npm install
npm run dev        # http://localhost:5174
npm run checks     # the 9 live checks, over all 256 configurations, outside the browser
```

Port 5174 deliberately: Attica's own frontend owns 5173, so the scene runs beside the real app.

## Click this first

On the map, click **Redis :6379**, then **died after connect**. Watch two things at once, both attached to the map itself:

- the `group_send` arrow gets a red cut mark, and the timeline greys out slots 8 to 11
- the readouts split: **row committed: yes, 4 rows** stays green while **second browser sees it: no, not until reload** goes red

That is the whole argument in one click. The write already happened; only the telling failed.

Then open **compare** in the bottom-right toolbar. Two worlds from the same baseline, differing by one thing, and the line at the bottom that matters: *the row is committed in both*.

## What it is grounded in

Every string, config line, log message and close code comes from these five files. Nothing is paraphrased.

- [backend/main/main/routing.py](../../backend/main/main/routing.py) — `ProtocolTypeRouter`, the two protocol branches
- [backend/main/main/settings.py](../../backend/main/main/settings.py) — `CHANNEL_LAYERS`, the cache on a different Redis DB, `SIMPLE_JWT`
- [backend/main/chat/utils.py](../../backend/main/chat/utils.py) — `broadcast_room_event`, and the `except` that decides the architecture
- [backend/main/chat/consumers.py](../../backend/main/chat/consumers.py) — the JWT middleware, `connect()`, `chat_event`
- [backend/main/chat/views.py](../../backend/main/chat/views.py) — the write, then the broadcast, in that order
- [frontend/vite.config.js](../../frontend/vite.config.js) — the proxy that makes :5173 look like :8000
- [frontend/src/pages/DirectMessagePage.jsx](../../frontend/src/pages/DirectMessagePage.jsx) — the socket, the merge, the fallback poll

Timings are illustrative and labelled so in the page. The numbers that are real: the 8000 ms poll, the 4000 ms reconnect, the 500 ms typing debounce, the 30-minute access token, every port, and every close code.

`SPEC.md` is the confirmed design, including what the browser drive found and fixed.
