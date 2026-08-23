# 🏗️ Architecture Diagrams

Step 5 of 6 in the [running order](../MASTER_PLAN.md#running-order). Waits on step 1
([Source analysis](01-source-analysis.md)). Next: [The merged deck](05-slides.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Description: what to build](#description-what-to-build)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Figures](#outputs--figures)
- [Orchestration](#orchestration)
- [References](#references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [onboarding-docs](../MASTER_PLAN.md). Fifth of six. It waits only on step 1's source
documents, so it does not block on the cold-start walk in
[07](07-cold-start-verification.md) and can be done in parallel with it.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing is started. The four diagram briefs below are written and ready to run through `/flowspec`.

**Three of the briefs were factually wrong and are corrected here.** They are named in
[Considerations](#considerations) because the corrections are the reason this plan is worth reading
before running it, rather than just running it.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../environment/overview.md), which is the authority.

- The Vite dev proxy forwards `/ws` with `ws: true`, so websockets do reach the backend in
  development. An older note claiming otherwise is wrong.
- Websockets authenticate by `?token=<jwt>` query parameter through `WebSocketJWTAuthMiddleware`,
  not by an `Authorization` header. This is the subject of diagram 1 and getting it backwards would
  make the diagram useless.
- Tokens live in `localStorage` under the single key `tokens`, holding `{access, refresh}`.
- Redis carries the channel layer on its default database. It must be running or the broadcast half
  of diagram 2 does not happen at all.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**A diagram is trusted more than prose, so a wrong one costs more.**

A new developer will believe a diagram without checking it against the code, which is the entire
point of drawing one. Three claims in the original briefs were false, verified against the
repository on 2026-08-22:

**The draft is not deleted when an event is published.**

The publish action at `backend/main/events/views.py:496-537` sets the draft's status to
`published`, stamps `published_at`, upserts the `Event`, writes `published_event_id` back into the
draft's own `data` blob, and saves the draft. It then returns the *draft's* serialized data. The
draft survives as its own row with a back-reference to the event it produced. A diagram showing the
draft being consumed teaches the opposite of what the code does.

**The endpoint is `/api/events/event-drafts/<id>/`, not `/api/events/drafts/<id>/`.**

`main/urls.py:43` includes `events.api_urls` under `api/events/`, and `events/api_urls.py:8`
registers the router prefix `event-drafts`. The shorter path does not resolve.

**The wizard has at least eight steps, not five.**

`frontend/src/App.jsx:120-130` declares routes `step1` through `step8`, and `step2` redirects to
`step1`. `step3` alone has three sub-routes (`location`, `artists`, `vendors`). A five-state machine
diagram would be a drawing of a wizard that does not exist.

**One brief was right and is unchanged.** The token refresh path `/api/accounts/token/refresh/`
resolves: `main/urls.py:44` includes `users.api_urls` under `api/accounts/`, and that module has
`token/refresh/`.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Four diagrams cover the integration-level behaviour a new developer cannot get from any single file:
how a websocket authenticates, why there are two paths for one message, how a token refresh is
invisible to the user, and how a multi-step form survives the browser closing.

Each is readable by someone with no prior Attica knowledge and stands on its own.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

The setup guides say what to install. The source documents say what the models are. Neither answers
"how do these talk to each other", and that question is answered by reading four files at once and
holding the sequence in your head.

These diagrams are the bridge between knowing how to run Attica and being able to change it.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

```
  onboarding-source.md ──┬──► /flowspec brief 1 ──► diagrams/ws-auth.md
    (from step 1)        ├──► /flowspec brief 2 ──► diagrams/rest-vs-ws.md
                         ├──► /flowspec brief 3 ──► diagrams/jwt-refresh.md
                         └──► /flowspec brief 4 ──► diagrams/event-wizard.md
                                                          │
                                            each: diagram + 2-3 sentence explanation
                                                          │
                                                          ▼
                                            checked against the code ──► 05-slides.md
```

## Description: what to build

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Four cross-cutting architecture diagrams, one markdown file each under `artifacts/figures/onboarding-a-new-developer/`,
each carrying the diagram and a two-to-three sentence explanation of the insight it delivers.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Give a new developer the integration-level picture that no single file contains.

**Goal.** Four files in `artifacts/figures/onboarding-a-new-developer/`: `ws-auth.md`, `rest-vs-ws.md`,
`jwt-refresh.md`, `event-wizard.md`. Each readable with no prior Attica knowledge, self-contained,
and accompanied by its explanation.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/04-architecture-diagrams.md`

▶ **Next: [task 1.1](#1--draw-the-four-diagrams)**.

### 1. 🎨 Draw the four diagrams

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 WebSocket authentication handshake**
  - Run `/flowspec` with this brief:
  ```
  Create a sequence diagram for WebSocket authentication in Attica.

  Setup: browser at localhost:5173, Django at localhost:8000, client already holds an
  access token from login (stored in localStorage under the key `tokens`).

  Flow:
  1. Client opens `ws://localhost:8000/ws/chat/rooms/101/?token=<access_token>`
  2. The Vite dev proxy forwards it (`/ws` is proxied with ws: true)
  3. WebSocketJWTAuthMiddleware reads the token from the query string
  4. It validates signature, expiry, and that the user exists
  5. If valid, the consumer adds this client to a Redis channel group, e.g. `chat_room_101`
  6. Client is subscribed and receives broadcasts for that room

  On disconnect: consumer.disconnect() removes the client from the room group.

  Show the decision points (valid signature? not expired? user exists?) and what
  happens on each failure. Note in the diagram that the token travels in the query
  string, NOT an Authorization header, because websockets cannot set headers.

  Save to: artifacts/figures/onboarding-a-new-developer/ws-auth.md
  ```

- [ ] **1.2 REST versus WebSocket**
  - Run `/flowspec` with this brief:
  ```
  Create a sequence diagram showing the REST-first, WebSocket-notify pattern in Attica.

  Scenario: a vendor sends a message in chat room 101.

  Flow:
  1. POST /api/chat/messages/ with {room_id: 101, text: "We can do R4500"}, carrying
     Authorization: Bearer <access_token>
  2. Django validates and saves Message(room_id=101, sender_id=7, text=...)
  3. Returns 201 Created with the saved message
  4. The backend broadcasts over Redis: group_send('chat_room_101', {...})
  5. Every client connected to room 101 receives it and React re-renders

  Key insight to make visible: the database is the source of truth. A client whose
  websocket was offline has missed nothing; they fetch the message later over REST.

  Save to: artifacts/figures/onboarding-a-new-developer/rest-vs-ws.md
  ```

- [ ] **1.3 JWT token refresh cycle**
  - Run `/flowspec` with this brief:
  ```
  Create a flow diagram with decision points for JWT token refresh in Attica.

  Setup: the frontend holds an access token and a refresh token in localStorage under
  ONE key, `tokens`, holding {access, refresh}. An Axios interceptor adds
  "Authorization: Bearer <access>" to every request.

  Flow:
  1. GET /api/events/ with the access token
  2. Token has expired; backend returns 401
  3. The Axios interceptor catches the 401
  4. It POSTs to /api/accounts/token/refresh/ with the refresh token
  5. Backend validates and returns a new access token
  6. Interceptor stores it and retries the original request
  7. 200 OK; the user noticed nothing

  On refresh failure (refresh token expired or invalid): 401, the interceptor clears
  localStorage and redirects to /login.

  Emphasise the retry step, since the whole point is that it is invisible.
  Note that ROTATE_REFRESH_TOKENS is off, so the same refresh token serves for its
  full lifetime and is not replaced on each use.

  Save to: artifacts/figures/onboarding-a-new-developer/jwt-refresh.md
  ```

- [ ] **1.4 Event creation wizard state machine**
  - Run `/flowspec` with this brief. **The corrections in [Considerations](#considerations) are
    already applied here; do not reintroduce the five-step or draft-deleted version.**
  ```
  Create a state machine diagram for Attica's event creation wizard.

  The wizard has eight step routes, declared in frontend/src/App.jsx:120-130:
  step1, step2 (which redirects to step1), step3, step4, step5, step6, step7, step8.
  step3 has three sub-routes: step3/location, step3/artists, step3/vendors.

  Each step: the organizer fills the form, clicks Next, the frontend PATCHes
  /api/events/event-drafts/<id>/ (note the `event-drafts` segment), the server saves,
  the next step is shown.

  Publish: POST /api/events/event-drafts/<id>/publish/.
  What publish actually does, per backend/main/events/views.py:496-537:
    - sets the draft's status to "published"
    - stamps published_at
    - upserts an Event row from the draft's data
    - writes published_event_id back into the draft's own data blob
    - saves the draft and returns the DRAFT's serialized data
  The draft is NOT deleted. Draw it surviving, with a back-reference arrow to the
  event it produced. This is the single most important thing the diagram must get right.

  Also show: the Back button re-editing an earlier step, the incremental save on every
  step (so closing the browser loses nothing), and validation errors keeping the user
  on the same step.

  Save to: artifacts/figures/onboarding-a-new-developer/event-wizard.md
  ```

▶ **Next: [task 2.1](#2--write-the-explanations)**.

### 2. ✍️ Write the explanations

◀ **Needs: [task 1](#1--draw-the-four-diagrams)**, all four diagram files existing.

- [ ] **2.1 Add a two-to-three sentence explanation under each diagram**
  - `ws-auth.md`: the connection is stateless and JWT-secured. A session cookie would not survive
    multiple server processes, so the client sends the token in the query string instead. The
    consumer validates it once and then broadcasts to everyone in the room group.
  - `rest-vs-ws.md`: durability first, real time second. The message is saved over REST, then
    broadcast over the websocket. Being offline costs you the instant delivery and nothing else,
    because the message is already in the database.
  - `jwt-refresh.md`: the access token expires, the frontend swaps it for a fresh one using the
    refresh token, retries the call, and the user sees no interruption. The refresh token itself is
    not rotated, so the same one serves for its full lifetime.
  - `event-wizard.md`: each step saves to the database before advancing, so closing the browser on
    step 4 costs nothing. Publish creates the event and marks the draft published; the draft stays,
    holding a reference to the event it became.

▶ **Next: [instruction 3.1](#3--check-each-diagram-against-the-code)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 3.2](#3--check-each-diagram-against-the-code)**.

- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 3. 👀 Check each diagram against the code

◀ **Needs: [task 2](#2--write-the-explanations)**.

3.1 **Read each diagram with the source file open beside it**
   - `ws-auth.md` against `backend/main/main/routing.py` and `backend/main/chat/consumers.py`.
   - `rest-vs-ws.md` against `backend/main/chat/` views and consumers.
   - `jwt-refresh.md` against `frontend/src/utils/useAxios.js`.
   - `event-wizard.md` against `backend/main/events/views.py:496` and `frontend/src/App.jsx:120`.
   - Expected result: every endpoint, field name and step name in the diagram appears in the file.
   - ✅ they match. ❌ any mismatch, that is the same class of error the three corrected briefs
     had; fix the diagram and say which brief produced it.

3.2 **Confirm the wizard diagram shows the draft surviving publish**
   - This is checked separately because it is the error most likely to come back.
   - Expected result: the draft box is still present after the publish transition, with an arrow to
     the event.
   - ✅ present. ❌ the draft is drawn as consumed or deleted, regenerate from the brief in task 1.4.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--figures) ➡️

Four diagram files existing is not done. Done is four diagrams whose every endpoint, field and state
was checked against the file that defines it, per instruction 3.1.

A diagram nobody checked is a confident drawing of whatever the brief happened to say, and this plan
already found three briefs that said the wrong thing.

## Outputs / Figures

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| Figure | File | Task | State |
|---|---|---|---|
| WebSocket authentication handshake | `artifacts/figures/onboarding-a-new-developer/ws-auth.md` | 1.1 | not started |
| REST versus WebSocket | `artifacts/figures/onboarding-a-new-developer/rest-vs-ws.md` | 1.2 | not started |
| JWT token refresh cycle | `artifacts/figures/onboarding-a-new-developer/jwt-refresh.md` | 1.3 | not started |
| Event creation wizard state machine | `artifacts/figures/onboarding-a-new-developer/event-wizard.md` | 1.4 | not started |

`diagrams/` currently holds `backend-setup-procedure.md` and `frontend-setup-procedure.md`, from
steps 2 and 3. These four are additions, not replacements.

## Orchestration

Navigation: ⬅️ [Outputs / Figures](#outputs--figures) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

The four diagrams feed [The merged deck](05-slides.md), which merges them into the master deck. So a
correction made here after step 6 has run has to be carried into the deck by hand.

Doing this plan before step 6 is the cheaper order, and the running order already says so.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../environment/overview.md): the websocket auth mechanism, the proxy, and where
  tokens live.
- [What an event draft is](../../../context/world/event-draft.md): what a draft is and why
  it survives publish. Read before drawing diagram 4.
- [The consolidated onboarding source](../source/onboarding-source.md): the consolidated reference from step 1.
- `backend/main/events/views.py:496`: the publish action, which diagram 4 must match.
- `frontend/src/App.jsx:120-130`: the wizard's real step routes.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[The merged deck](05-slides.md), step 6 of 6, which merges these four diagrams and the two decks into
one master presentation.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/flowspec` — generates flowcharts, sequence diagrams and state machines from prose briefs. Use
it for all four. Alternative: author the Mermaid by hand if you want full control over the syntax.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A diagram brief asserts the event draft is deleted at publish | This plan's task 1.4, before correction | The publish action keeps the draft, marks it `published`, and writes `published_event_id` into its `data`. Verified at `events/views.py:496-537`. |
| A brief names `/api/events/drafts/<id>/` | This plan's tasks 1.4 and 2.1, before correction | The router prefix is `event-drafts`, so the path is `/api/events/event-drafts/<id>/`. Verified at `events/api_urls.py:8` with `main/urls.py:43`. |
| A brief describes a five-step wizard | This plan's task 1.4, before correction | `App.jsx:120-130` declares eight step routes plus three sub-routes under `step3`. |
