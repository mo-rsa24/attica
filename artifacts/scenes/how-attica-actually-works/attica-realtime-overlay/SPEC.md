# Scene spec: Attica's REST-first backend and its WebSocket overlay

```
ran under:  none
built from: /home/molef/Work/attica (the repository itself)
why:        establish which real-time paths are droppable without losing data
depends on: ../../../environment/overview.md, ../../../context/00-INDEX.md
```

The confirmed gate output that produced this app.

## Claim card

```
Claim:        the row is committed and serialized before anything is broadcast, so
              every real-time path is droppable. Drop it and latency degrades from
              about 16 ms to up to 8 s. Correctness does not move.

Alternative:  polling GET /api/chat/rooms/<id>/messages/ on an 8-second timer, which
              is not hypothetical: it is what DirectMessagePage.jsx:258-264 starts
              doing the moment socketError is set.

Use it:       an organizer and a vendor negotiating a bid in one room. The organizer
              POSTs, the vendor's screen updates without a second query. The poll
              instead re-fetches every open room whether or not a row changed:
              100 rooms at 8000 ms is 750 GETs per minute, most returning nothing new.

Do not:       Redis dies AFTER the sockets connected. broadcast_room_event catches
              the exception, logs "Chat broadcast skipped: %s", and the POST still
              returns 201 with the row durable. But the counterpart is told nothing,
              their socket is still open, so socketError is never set and the poll
              never starts. They see a stale room until they reload. The dumb poll
              would have caught it on its next tick.

Consequence:  the scene runs one message through the real 14-slot lifecycle. Killing
              Redis makes slots 8 to 11 grey out while 4, 5 and 13 still run, the
              group_send edge gets a red cut mark, and the four readouts attached to
              the map split: "row committed: yes, 4 rows" stays green while "second
              browser sees it: no, not until reload" goes red and the gap reads 1 row.
```

**Falsification check.** The claim dies if any configuration loses a committed message. `model.checks.ts` sweeps all 256 configurations on every render and asserts it. Excursion 1 asks the reader to search the same space with their own script against the same `run()`.

## Model

**Shape: dynamic.** `run(state)` folds a fixed 14-slot lifecycle, one slot per real step in Attica's send path, marking each `ran` / `skipped` / `failed`. Not memoryless, because the claim *is* an ordering claim: `db-insert` strictly precedes `broadcast` in every world, and the first live check asserts exactly that.

All 14 slots render in every configuration, so two states stay comparable without the layout moving.

| # | slot | the real line |
|---|---|---|
| 1 | `compose` | `sendTyping()`, debounced 500 ms leading, DirectMessagePage.jsx:160-164 |
| 2 | `proxy-http` | vite.config.js:15 `'/api': 'http://localhost:8000'` |
| 3 | `authz` | `if request.user not in [room.organizer, room.vendor]` views.py:127 |
| 4 | `db-insert` | `serializer.save()` views.py:134 |
| 5 | `db-delivered` | `.update(delivered_at=timezone.now())` views.py:135 |
| 6 | `serialize` | `MessageSerializer(message).data` views.py:138 |
| 7 | `broadcast` | `get_channel_layer()` utils.py:32-35 |
| 8 | `group-send` | `_safe_group_send` utils.py:10-20 |
| 9 | `fanout` | `channels_redis.core.RedisChannelLayer`, settings.py:92-99 |
| 10 | `consumer-send` | `chat_event` → `self.send(...)` consumers.py:137-138 |
| 11 | `client-merge` | `appendMessages` Map dedupe + sort, jsx:126-138 |
| 12 | `notify` | `group_send("notifications_<id>", ...)` notifications/utils.py:31-58 |
| 13 | `http-201` | views.py:142, jsx:380-381 |
| 14 | `poll-tick` | `setInterval(fetchMessages, 8000)` jsx:258-264 |

**Outcome variants** (the prediction space, derived not authored): `delivered-push`, `delivered-poll`, `durable-not-delivered`, `blocked-by-authz`, `never-sent`.

## State

| id | values | grounded in |
|---|---|---|
| `redis` | `up` / `not-configured` / `down-before-connect` / `down-after-connect` | settings.py:92-99, and the two distinct code paths in consumers.py:66-74 |
| `token` | `valid` / `expired` / `absent` / `valid-non-member` | `WebSocketJWTAuthMiddleware` consumers.py:32-52 |
| `sendPath` | `rest` / `socket` | the UI uses REST; `_handle_send` is a second writer no shipped screen calls |
| `server` | `daphne` / `runserver` | `daphne` is not in INSTALLED_APPS, so Channels does not patch runserver |
| `viteProxy` | on / off | vite.config.js:14-23 |
| `pollIntervalMs` | 8000 real, adjustable | jsx:260 |
| `openRooms` | 1 / 100 / 500 | drives the poll's query cost |
| `concurrentSends` | 1 or 2 senders | the ordering lesson |

Four `redis` values rather than three: `not-configured` and `down-before-connect` are different lines in `connect()` producing different log strings, and both differ again from `down-after-connect`.

## Provenance

Emitted by `run()` itself, in computation order: token → scope user → authz verdict → close code; channel layer present → `group_add` → membership; membership + `group_send` success → fan-out; fan-out → `counterpartSees`; `socketError` → poll active → recovery. The "why?" expander renders those edges and nothing else. A live check asserts all 580 edges name known state or an earlier observable.

## System atlas

**Entry level: map-first at ECOSYSTEM.** The scene opens on the map, breadcrumb pre-populated. Stage 0 is orientation for that surface, and the claim-card race moves into stage 2, reached by asking why the socket path is worth having.

Four navigable levels, each satisfying the drill-down rule. SUBSYSTEM and RUNTIME STATE were cut: the middleware chain reveals more shown inside the SYSTEM level's two branches than as its own level, and runtime state is the probes drawer, not a place you navigate to.

```
ECOSYSTEM   browser + Vite :5173, Daphne :8000, Redis :6379, SQLite db.sqlite3
            new: which config line declares each, and the proxy hop
SYSTEM      inside Daphne: ProtocolTypeRouter's two branches; inside the browser:
            the proxy, the page, the poll, the merge
            new: two protocols, one process, one port
COMPONENT   the view, broadcast_room_event, notify_new_message, ChatConsumer,
            NotificationConsumer, RedisChannelLayer
            new: each owns live state readable right now
MECHANISM   group_add, group_send, and the chat.event to chat_event translation
            new: the membership set lives in Redis, not in the worker
```

## Relationships

Thirteen interactive edges. Solid means durable, dashed means best effort, and that grammar never changes. Severable ones flow through the model as ordinary interventions: `http` (viteProxy), `ws` (server, token), `layer` (redis), `consumer-layer` and `notif-layer` (redis). `write` is deliberately not severable, and the inspector says why: cutting the source of truth is a different scene.

The `cache` edge (Redis DB 1) is drawn precisely because severing it changes nothing about chat. One Redis server, two unrelated roles.

## Glyphs

`simple-icons` paths (CC0-1.0), undistorted: Django, Redis, React, Vite, SQLite. **Django REST Framework, Django Channels and Daphne have no mark in that CC0 set, so they get a labelled generic glyph rather than an imitation.** Every node's meaning survives its icon being removed.

## Stages

| Stage | Medium | Content |
|---|---|---|
| 0. the map | visual | the four processes, the two line styles, where you can go, the one asymmetry |
| 1. the smallest version that works | visual + code | the whole path in four excerpts, reproducible by hand |
| 2. the mechanism | visual | the push-vs-poll race, what a channel layer is for, the dot-to-underscore dispatch, the seam, the merge |
| 3. where it costs you | prose + visual | six failures, symptom before cause, each with a prediction and a reproduce button |
| 4. build it | code | seven steps in Python and JavaScript, each opening with the previous step's failure |

**Stage 4 drops the map deliberately.** The anchored surface is stable across stages 0 to 3 because those are about this system; stage 4 is about code being written from nothing, where the map would be decoration.

**Stage 4 language: Python and JavaScript**, per build-track.md's "pick the one the reader will meet the concept in professionally".

## Workspace

- **Anchored surface**: the map, with the timeline beneath it, on stages 0 to 3.
- **Attached readouts**: four cells inside the map SVG (row committed, second browser sees it, database ahead of screen by, delivered by), plus the outcome sentence immediately below.
- **Popovers**: clicking any node or edge opens one anchored to it, carrying the registry entry, the live value, the real config line, the break-it string, the controls, and the model-computed ablation.
- **Drawers behind a 3-button toolbar**: `probes` (probes + the 9 live checks), `history` (interventions, replay verification, reset), `compare` (the fork). The code view is attached to its stage, not a drawer, per behavior.md.

## Engagement

**Tour**: generated from the atlas registry, map-first row, 8 steps at the cap. Four top-level systems, two severable edges (`ws`, `layer`), "any box with a corner mark opens", and the breadcrumb. **Dropped to stay at the cap: the `http`, `write` and `cache` edges.** `http`'s story is told by the `vite-proxy` node one level down; `write` and `cache` are the two edges nothing severs.

**Predictions**: five, one per breaking control, each committing to one of the model's five variants before the intervention fires. No scores.

**Excursions**: three. Two machine-checked (a script searching the state space for a lost message, checked through `encodeState`/`decodeState`; the HTTP status when Redis is down, checked against the model's `httpStatus`), one labelled unverified (stop Redis in the real app, since only the reader sees their own database).

## Live checks

Nine, sweeping all 256 configurations on every render, in the probes drawer and via `npm run checks`:

1. the row is written before anything is broadcast (the claim itself)
2. no configuration loses a committed message (the falsifier)
3. a delivery gap is a screen gap, never a data gap
4. every undelivered message is recoverable by re-reading the room
5. diffing a state against itself yields nothing
6. every "because" names real state or an earlier step
7. every configuration renders all 14 lifecycle slots
8. encode then decode returns the same state
9. the poll only runs when something told the client it was degraded

## Stack

React, TypeScript, Vite, Zustand, Motion, Shiki (python, javascript and bash grammars only, imported individually), `simple-icons` paths inlined. No KaTeX: no maths. No Mafs: no coordinate plane. No 3D: nothing here has depth. **No React Flow**, despite the atlas: its edges are severable but not re-routable and the layout is fixed and hand-designed, so bespoke SVG is smaller and better art-directed.

## Honesty notes

- **Timings are illustrative and labelled so.** The numbers that are real and marked real: the 8000 ms poll, the 4000 ms reconnect, the 500 ms typing debounce, the 30-minute access token, the ports, and every close code.
- **One genuine gap, stated in the scene.** Whether the counterpart's socket eventually closes when Redis dies mid-connection depends on how `channels_redis` surfaces a lost connection into the consumer's receive loop, and Attica has no explicit handler for it. The scene models the unhandled case and says why.
- **Group membership reports "unreadable", not a count, when Redis is down.** The set was written and is now unreachable, which is a different answer from empty. Saying "2" would claim knowledge the running system does not have.
- **The token is validated once, at handshake.** A socket opened at minute zero is still trusted at minute ninety. The scene states this rather than implying revalidation.
- **`Array.prototype.sort` is stable**, so two messages sharing a `created_at` keep arrival order. That tie is the only case where wire ordering reaches the screen, and stage 3 names it.

## What the browser drive found

Recorded because a staged reveal that was never driven is not verified.

- The 14 timeline labels rendered as an unreadable smear. Replaced with step numbers; the name lands in the detail pane.
- Long edge labels collided with the boxes. Added short map labels with a backing plate; the full text stays in the inspector.
- `.bar` was an inline span, so the timeline bars had no height and did not render at all.
- Shiki leaves a literal newline between block-level `.line` spans, doubling every code block's height. `tighten()` strips the separators.
- `.opt` was scoped under `.ctl`, so every standalone button (prediction, excursion, reset, drill-down) rendered unstyled.
- A pasted deep link into an open tab is a same-document hash change and never reached the store, so per-stage links only worked on a cold load. `attachHashSync()` fixes it.
- Two of the nine checks failed on first run. Both were the check being imprecise rather than the model being wrong: the provenance vocabulary was missing `HTTP`, and the silent-failure check did not exclude states whose socket had already failed for an unrelated reason.
