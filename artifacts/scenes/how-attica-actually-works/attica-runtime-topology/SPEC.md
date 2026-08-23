# Scene spec: Attica's runtime topology

```
ran under:  none
built from: /home/molef/Work/attica (the repository itself)
why:        see the four independently-failing processes behind one apparent instant
depends on: ../../../environment/overview.md, ../../../context/00-INDEX.md
```

The gate output that produced this app. Confirmed, then built. Every real file this spec
points at was re-read against the live repository during the build; the honesty notes at
the bottom record what that re-read found.

## Claim card

```
Claim:        the browser experiences "hit save" as one instant, one origin, but that
              instant is actually carried by four independently-failing processes
              (Vite, Django/DRF, Daphne/ASGI+Channels, Redis) glued by a dev-only
              proxy, and reproducing a bug across that seam requires two separate
              debuggers, attached to two separate runtimes, stepping in sync
Alternative:  classical server-rendered MVC: one process, one language, Django
              renders the HTML directly, one debugger sees the whole request
Use it:       the chat/notifications real-time overlay (needs Channels+Redis at all),
              independent frontend iteration via Vite HMR without restarting Django,
              deploying frontend and backend on different infrastructure or cadence
Do not:       a bug that only reproduces when a WebSocket message races a REST call,
              invisible from either debugger alone; also every deploy re-solves the
              origin/CORS problem that classical MVC never has, since dev's Vite
              proxy doesn't exist in production
Consequence:  toggling Daphne off while a chat action is queued kills the WebSocket
              send with a real protocol failure while a plain REST call on the same
              page keeps working; toggling Redis's channel-layer DB off kills
              real-time delivery while the cache DB (same Redis process, different
              DB index) can independently keep working or independently fail. The
              scene lets the learner feel this as a real, breakable seam, not a
              labelled arrow in a diagram.
```

Falsification check: if every toggle in this scene left every request path equally
healthy or equally broken, the four-process claim would be decoration. It is not: the
channel-layer toggle kills `/ws/chat/rooms/<id>/` and `/ws/notifications/` while leaving
`/api/events/event-drafts/<id>/` untouched, and that split is checked live as a
persistent invariant (INVARIANTS, below), not asserted in prose.

## Components

Every one is inspectable, switchable where listed, and parameterized where listed.
Registry lives in `src/components.ts`.

| id | kind | breaks or changes | the real thing it produces |
|---|---|---|---|
| `vite-dev-server` | toggle | breaks: off, nothing serves :5173 | `net::ERR_CONNECTION_REFUSED` |
| `vite-proxy-map` | parameterize (per path: api/vendors/cart/checkout/ws) | breaks: disabling one path's entry, that path 404s from the browser even though Django on :8000 is healthy | Vite's SPA fallback returns `index.html` for the unmatched path, so `fetch().json()` throws `Unexpected token '<', "<!doctype "... is not valid JSON` |
| `redis-channel-layer` | toggle | breaks: off (DB 0), `channels_redis` raises on WS connect/group_send; chat + notifications stop delivering; REST unaffected | `redis.exceptions.ConnectionError: Error 111 connecting to 127.0.0.1:6379. Connection refused.` inside `channel_layer.group_add` |
| `redis-cache` | toggle | breaks: off (DB 1), `django_redis` raises on cache access; independent of the channel-layer toggle even though same Redis instance | `django_redis.exceptions.ConnectionInterrupted` from the unguarded `cache.get()` in `users/utils.py:get_user_permissions` |
| `backend-process-mode` | select: runserver \| daphne | changes: runserver gives the WS upgrade a real protocol-mismatch failure; daphne serves both protocols | `channels` is installed after `django.contrib.staticfiles` in `INSTALLED_APPS`, so Channels' dev-server override never triggers and `runserver` falls back to plain WSGI |
| `asgi-router` | inspect + limited toggle (chat \| notifications) | `locations` is not a toggle with an effect: it opens `routing.py`'s real import list and shows the module is simply absent | `locations/consumers.py` contains a complete, working `NotificationConsumer`, with no `locations/routing.py` and no import of it anywhere in `main/routing.py` |
| `jwt-refresh-interceptor` | toggle | off: an expired-token request returns a real 401 and nothing retries it; on: silent refresh, request succeeds | `useAxios.js`'s request interceptor: `dayjs.unix(decodedAccessToken.exp).diff(dayjs()) < 1` gates a `POST /api/accounts/token/refresh/` before the real request goes out |
| `vscode-debug-config` | select | inspecting each shows the real `launch.json` block; launching "Run Migrations" surfaces its real failure | `${env:HOME}/local/bin/python` does not exist: `/bin/bash: line 1: /home/molef/local/bin/python: No such file or directory` |
| `debug-compound` | select | attempting to add a Chrome-debug leg is refused with the real fact that neither compound includes it today | `launch.json`'s two `compounds` entries, verbatim, each naming exactly two configurations |
| `venv-binding` | select: `backend/venv` \| `/home/molef/lobola` | installing a package into `backend/venv` only, then launching a debug config, shows it unavailable | both Python debug configs hardcode `"python": "/home/molef/lobola/bin/python"`, so a package installed only into `backend/venv` is invisible to them |

One model function for stages 0-3: `resolve(state) => Outcome` in `src/model.ts`. It
returns, for every proxied path and for the WebSocket path, the ordered list of
processes the request actually touches, where it dies if it dies, and the real error
string; plus the debug-config launch outcomes, the venv resolution, the JWT scenario,
and the ASGI router's per-consumer status. Every panel reads that one function. Stage 4
uses a second, separate pure function (`src/lifecycle.ts`): a reducer over the fixed
seven-event request lifecycle, since order is the actual lesson there.

## Laboratory

Contract: `concept-scene/references/laboratory.md`. Primitives live in `src/lab.ts`.

**Model shape**: hybrid. Stages 0-3 use memoryless `resolve(state) => Outcome`
(topology, reachability, error strings). Stage 4 uses `step(state, event) => state`, a
pure reducer over the fixed sequence `save clicked -> proxy-forwarded -> view received
-> serializer validated -> row written -> response sent -> React re-rendered`,
scrubbable by `requestLifecyclePlayhead`.

**State** (the only directly manipulable things): `viteServerUp`,
`proxyRoutes.{api,vendors,cart,checkout,ws}`, `redisChannelUp`, `redisCacheUp`,
`backendMode`, `jwtInterceptorEnabled`, `selectedDebugConfig`, `selectedVenv`,
`requestLifecyclePlayhead`, `breakpointsArmed.{frontend,backend}`. Direct manipulation
beyond the sidebar: clicking a node on the topology diagram opens the same inspector a
sidebar control opens; clicking a proxy-path edge toggles that path's entry, the same
`toggleProxyPath` action the checkbox dispatches.

**Interventions**: every state change records `{target, operation, before, after,
label, patch}`. History, reset and replay fold from the session baseline.

**Changeset**: after each intervention, a strip diffs the observables between
`resolve(prev)` and `resolve(next)`: per-path reachability, failed-at hop, error
string, WS consumer status, debug-config launchability. An intervention that changes
nothing (e.g. toggling `redisCacheUp` while inspecting the `/api` request that never
calls `get_user_permissions`) says so rather than pretending.

**Provenance**: emitted by `resolve()` itself, in computation order: vite server state
-> whether the browser can reach :5173 at all; proxy map -> whether a given path is
forwarded; backend process mode -> whether a WS upgrade is even attempted; channel
layer state -> whether `group_add`/`group_send` succeed; the request's kind -> which of
these matters for it. The "why?" expander renders this chain and nothing else.

**Probes** (each traces to a claim-card field or a registered failure mode): which
processes does this request currently touch (Consequence), is Redis load-bearing for
this request (Do-not case: REST survives a Redis outage), would this debug config
actually launch (honest-failure rule), which breakpoint fires first (Stage 4 rebuild
proof, derived from the playhead).

**Counterfactual fork**: `backendMode: runserver` vs `daphne`, same WS connection
attempt run in both from one shared baseline, side by side. This is the claim card's
own comparison, executed rather than asserted. A second fork candidate on
`venv-binding` (package present in `backend/venv` vs the `lobola` interpreter actually
used) is available from the same drawer. Both use the current topology state as their
shared baseline and the same `resolve()`.

**Object permanence**: a process node (`vite`, `django`, `channels`, `redis`) is one
semantic object wherever it appears: the topology diagram, a request's hop list, a
debug config's interpreter line, and the fork's two lanes all share one id, label and
color.

**Invariants**: run persistently in the side column on every stage: `/api`,
`/vendors`, `/cart`, `/checkout` never depend on `redisChannelUp`, regardless of any
other toggle (the scene's load-bearing check); a request that fails at `vite` never
shows a Django-side error; the channel-layer and cache toggles never move each other's
outcome; every debug config's launch outcome matches its real `launch.json` block;
`locations` never becomes reachable no matter what else is toggled.

**System atlas**: applicable. `references/atlas.md`. Level 0 (ecosystem): browser ->
Vite -> {Django/DRF, Channels} -> Redis, the two MVC-split halves either side of the
network boundary. Level 1 (subsystem): ASGI's http/websocket split, Redis's two DB
roles, the debug-config set. Level 2 (implementation): one real consumer (chat vs
notifications vs the unwired `locations`), one real `launch.json` block, the exact
file and line backing a claim. Real logos for Vite, Redis, Django, React and VS Code.

## Engagement

Contract: `concept-scene/references/engagement.md`. Declarations and the tour
generator in `src/engagement.ts`.

**Tour**: generated, 6 steps: the split-topology race; toggle Redis off, watch WS die
and REST survive; open the ASGI router, find `locations` missing; open Debug Configs,
find Run Migrations broken; open venv-binding, see the mismatch; play the stage-4
scrub with both breakpoints armed. First run only (`localStorage`), skippable, re-
runnable from the header link, reduced-motion falls back to jump cuts.

**Predictions**: before flipping `backendMode` mid-chat-action, "will this WS send
succeed / fail with a protocol error / silently queue and retry?"; before opening the
`locations` consumer inspector, "is it live+authenticated / live+unauthenticated / not
wired into routing at all?" No scores kept.

**Excursions**: "open your real `.vscode/launch.json` and count the configs", checked
against 5; "open `backend/main/main/routing.py` and confirm whether `locations`
appears in the import list", checked against: it does not.

## Rebuildability test

After ~30 minutes operating this scene, unaided: explain why a request to `/api/...`
never touches Redis's channel layer but a request to `/ws/chat/rooms/<id>/` does; say
which of the four processes has to be up for each of the five proxied paths; diagnose
a broken WebSocket send from `backendMode` alone versus from `redisChannelUp` alone,
without confusing the two; open `launch.json` cold and say which interpreter each
config actually uses; explain why `locations/consumers.py` existing is not the same
as `locations` being live.

## Stages

| Stage | Medium | Content |
|---|---|---|
| 0. the problem | visual | single-process MVC vs Attica's four-process split, raced side by side on one "hit save" action |
| 1. minimal version | visual | the smallest complete round trip: one field, one PATCH, through Vite's proxy, DRF view, serializer, model row, JSON back, React re-render, no WebSocket, no Redis yet |
| 2. the mechanism | visual | the level-0/1 atlas: MVC/MTV+serializer layer mapping, the four tools' distinct jobs, Redis's two DBs, ASGI's protocol split |
| 3. failure modes | visual + code | every "if X is down" case plus the three honest gaps (locations unwired, venv mismatch, broken migrate config, missing Chrome leg) as real, inspectable edges |
| 4. build it | code | the literal debugging walkthrough: arm both breakpoints, fire one real request, step both call stacks in sync |

## Workspace

Anchored surface: the level-0/1 topology diagram, always visible, with its
reachability readout attached directly beside it. Everything else lives behind a
toolbar: the component inspector (popover, anchored to the clicked node), Debug
Configs (drawer), Request Timeline (drawer, stage 4's scrubber), History (drawer), the
counterfactual fork (drawer, invoked). Stage 4's code panels and call stacks stay on
the anchored surface, since they are the stage's own content, not a summoned
capability.

## Stack

React + TypeScript + Vite, Zustand, Motion, SVG for the topology diagrams, Shiki for
real code and config snippets (`launch.json`, `routing.py`, `vite.config.js`,
`views.py`, `reactContext.jsx`, `consumers.py`). No KaTeX, no Mafs: no maths in this
concept. No react-three-fiber: this is a 2D topology and a linear process sequence, a
third dimension teaches nothing extra here.

## Honesty notes (found during the re-verification pass that produced this build)

- `locations/consumers.py` is real, complete, working code (`NotificationConsumer`,
  `channel_layer.group_add`/`group_discard`/`send_notification`), with no
  `locations/routing.py` file and no import of it anywhere in
  `backend/main/main/routing.py`. This is a stronger fact than "locations is
  unwired": it is a real consumer that was written and then never connected, which is
  the exact lesson the spec asks for, so the scene shows the file itself.
- `channels` is listed in `INSTALLED_APPS` after `django.contrib.staticfiles`
  (`backend/main/main/settings.py`), which is the condition under which Channels'
  own docs say the `runserver` override does NOT take effect. This confirms, from the
  app config rather than assertion, that plain `runserver` in this repo serves WSGI
  only and cannot upgrade a WebSocket, which is exactly what `backend-process-mode`
  claims.
- `backend/venv/bin/python`, `/home/molef/lobola/bin/python` both exist on disk (the
  latter a symlink to `python3.12`); `/home/molef/local/bin/python`, the interpreter
  `launch.json`'s "Run Migrations" config points at, does not. All three match the
  spec's assumption exactly.
- `.vscode/launch.json` has exactly 5 configurations and exactly 2 compounds, each
  compound naming exactly 2 configurations, matching the spec's excursion checks
  (5 configs; no compound includes the Chrome-debug leg).
- `users/utils.py:get_user_permissions` calls `cache.get()`/`cache.set()` with no
  try/except, which is the real code behind `redis-cache`'s failure claim: an
  unguarded cache access that will raise when Redis DB 1 is unreachable.
- `frontend/src/ListingStep1.jsx`'s `saveStep(...)` call and
  `frontend/src/context/reactContext.jsx`'s `saveStep` function and
  `backend/main/events/views.py`'s `EventDraftViewSet.partial_update` are all at the
  line numbers the spec assumed (217; 404-459; 281-297), unchanged since the trace
  that produced this spec.
