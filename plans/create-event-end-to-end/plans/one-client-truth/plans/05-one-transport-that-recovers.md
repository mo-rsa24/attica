# 🔁 One Transport That Recovers

Step 5 of 6 in this scope. Waits on [03](03-put-the-envelope-on-the-wire.md) and
[04](04-build-the-one-cache.md). Next:
[06-prove-it-and-write-it-down.md](06-prove-it-and-write-it-down.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to build](#description-what-to-build)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [Code references](#code-references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [one client truth](../MASTER_PLAN.md). Fifth of six, and the first plan that needs both
halves of the pair before it.

It waits on [04](04-build-the-one-cache.md) because a reconnect that refetches needs somewhere to
put what it refetched, and on [03](03-put-the-envelope-on-the-wire.md) because a gap can only be
detected from a version, and until that plan lands there is no version on the wire to detect it
from.

[06](06-prove-it-and-write-it-down.md) proves what this plan builds by hand, in two browsers, and
writes the runbook pair for doing it again.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Three components open a socket, and each invented its own answer to what happens when it drops.

`frontend/src/components/chat/ChatRoom.jsx:51` never reconnects at all: `socket.onclose` sets an
error flag and stops (line 67). `frontend/src/pages/DirectMessagePage.jsx:206` reconnects after
4000ms. `frontend/src/components/notifications/useNotifications.js:86` reconnects after 5000ms.
Three policies, none of them written down anywhere, and no shared transport between them.

**Not one of the three refetches after a reconnect.** In every case the socket comes back and the
component carries on from the state it had when the socket died. Whatever happened during the gap is
absent, and nothing in the client knows a gap occurred. A reconnect looks like a recovery and is not
one.

**The eight-second poll is a fallback, not a second realtime model.** Both poll effects are guarded
by `if (!socketError) return undefined` (`frontend/src/components/chat/ChatRoom.jsx:45` and
`frontend/src/pages/DirectMessagePage.jsx:259`), so no poll runs while the socket is healthy. The
defect is different and worse than "two models coexist": **in `ChatRoom` the fallback is permanent**,
because that component has no reconnect, so one dropped socket moves that room to eight-second
polling for the rest of the session with no path back. The correction is recorded in
[the decisions taken here](../decisions-taken-here.md#the-eight-second-poll-is-a-fallback-not-a-second-model).

**One thing D1 decides about this plan.** If the chat booking representation is the one being
migrated away from, `ChatRoom` and `DirectMessagePage` are components with a known end date, and the
right fix is the shared transport rather than a repair in place. Either way the shared transport is
the answer, which is why this plan is written the same under both readings.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The websocket authenticates by query parameter, not by header**, so the access token is baked
  into the socket URL at connect time. This is the load-bearing fact of this plan: **a reconnect
  that reuses a captured URL after the token has been refreshed reconnects with a stale token.** All
  three of today's components build `wsUrl` once and reuse it, so this is a defect the shared
  transport must not inherit.
- **Daphne, not `runserver`**:
  `daphne -b 0.0.0.0 -p 8000 main.asgi:application`, per
  [the execution model](../../../../../environment/overview.md#execution-model). Under `runserver`
  every socket in this plan fails with no clear error, which is indistinguishable from the bug it is
  fixing.
- **The `/ws` proxy rule works and is not a gap.** `frontend/vite.config.js:19` proxies `/ws` with
  `ws: true`, so all three sockets reach Daphne through the dev server. The flow map in the
  event-creation learning journey claims there is no such rule, and
  [the project's instructions](../../../../../CLAUDE.md) already flag that claim as wrong. Do not
  spend a morning adding a rule that exists.
- **Redis carries the websocket channel layer on the default logical database.** Flushing the wrong
  one drops live websocket groups with no error, which is the shape of failure most likely to be
  read as a transport bug during this plan.
- **Two backend tests already fail**, so a red backend suite is not evidence about this plan.
  Nothing here touches the backend.

Where a fact this plan needs is not written there, stop and ask rather than inferring it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Recovery is a refetch the client decided to make, never a replay the server offers.**

The server does not remember what a client missed, `_safe_group_send` swallows a push when Redis is
down, and the outbox delivers at-least-once. So a socket coming back cannot be trusted to carry the
gap with it. The client notices, from the version, that it is behind, and goes and asks. Anything
that looks like a replay is a design that will be right until the first time Redis blinks.

**One reconnect policy, written down, or a recorded reason for an exception.**

[The scope's definition of done](../MASTER_PLAN.md#definition-of-done) allows one of the three
components to keep its own policy if the reason is written. Take that seriously rather than treating
it as an escape: a component with a genuinely different need is a fact worth recording, and three
policies nobody chose is what this plan exists to end.

**A fresh token every connect, and never a captured URL.**

The token is in the query string. The transport builds the URL at the moment it connects, from
whatever the auth provider currently holds. A reconnect an hour later must not carry an hour-old
token. This is the one defect most likely to survive the rewrite, because it only shows up after a
long-lived tab, which is exactly the case nobody tests.

**Back off, and say what the ceiling is.**

Reconnecting every 4000ms forever against a backend that is down is a client attacking its own
server. The policy names an initial delay, a growth rule and a maximum, and it is written in the
runbook pair [06](06-prove-it-and-write-it-down.md) produces, because "how do I force a reconnect"
is unanswerable without knowing how long the client waits.

**Deleting the poll is a separate question from fixing the reconnect.**

Once `ChatRoom` reconnects and refetches, the eight-second fallback stops being permanent. Whether
the fallback should still exist at all is a judgement: it is a genuine safety net when a socket
cannot be established at all. [Task 3.3](#3--replace-the-three-sockets) keeps it and moves it behind
the transport's own connection state, so there is one fallback with one rule rather than two
components each guessing.

**No screen changes appearance.**

`the-event-workspace` owns the visible side. A connection-state indicator is the natural thing to
add here and it belongs there, with the rest of the save-state and loading work. This plan exposes
the connection state and renders nothing with it.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**A socket dropped for two minutes comes back and the screen is correct without anybody touching
it**, because the client noticed it was behind and went and asked, rather than resuming where it
left off.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Today a dropped socket produces a screen that is quietly wrong. Nothing errors, nothing spins,
nothing says stale. The component carries on with the state it had, and the only recovery route in
the entire client is a person deciding a number looks off and pressing F5.

That is one defect with three different shapes, because three components each answered the question
their own way and none of them answered the part that matters. Two reconnect and forget to catch up;
one does not reconnect at all and polls forever instead. One transport with one policy replaces
three things to get right with one, which is
[objective 5](../MASTER_PLAN.md#objectives), and makes the catching-up part exist at all, which is
[objective 4](../MASTER_PLAN.md#objectives).

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  TODAY: THREE ANSWERS TO ONE QUESTION

  ChatRoom            ──╳ never reconnects  ──►  polls every 8s forever
  DirectMessagePage   ──► reconnects at 4000ms ──►  resumes from stale state
  useNotifications    ──► reconnects at 5000ms ──►  resumes from stale state
                                                    │
                        nothing refetches ──────────┘

  AFTER: ONE TRANSPORT

           ┌──────────────────────────────────────────┐
           │  one socket, one policy, fresh token     │
           │  per connect, backoff with a ceiling     │
           └───────────────┬──────────────────────────┘
                           │  every frame
                           ▼
                   the patch path (04)
                           │
        apply ─────────────┼───────────── ignore
                           │
                        refetch  ◄── version gap, or reconnect
                           │
                           ▼
                   the cache is correct,
                   and nobody pressed F5
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

Three pieces in this scope's map are drawn from what this plan changes.

**Subject: three sockets, three policies.** The three lanes, the three clock chips with one crossed
through, and the band naming the thing none of them does. This plan collapses the lanes and crosses
the band.
[Piece 2](../diagram-prompts.md#piece-2-three-sockets-three-policies-planned--not-rendered).
Save as `../diagrams/subject-02-three-sockets-three-policies.png`. *(image not yet generated)*

**Subject: the gap nobody notices.** The empty framed slot above the card at the reconnect, sized
like a blue dashed arrow. This plan puts the arrow in it.
[Piece 5](../diagram-prompts.md#piece-5-the-gap-nobody-notices-planned--not-rendered).
Save as `../diagrams/subject-05-the-gap-nobody-notices.png`. *(image not yet generated)*

**Subject capstone: the client-truth glyph, opened up.** The refetch stub curving back down into the
handler glyph, the only line running downward, is exactly this plan's recovery route.
[The capstone](../diagram-prompts.md#the-client-truth-glyph-opened-up-planned--not-rendered).
Save as `../diagrams/subject-capstone-the-client-truth-glyph-opened-up.png`.
*(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Four things in `frontend/src`, in this order.

1. **One transport module.** It owns the socket, the reconnect policy, the connection state, and the
   URL it builds fresh at every connect from the auth provider's current token. It knows nothing
   about bookings, chat rooms or notifications: it receives frames and hands them on.
2. **One subscription interface.** A component says which stream it wants (a room, the user's
   notifications) and gets frames; it does not open anything. Subscribing twice to one stream shares
   one connection.
3. **The recovery rule.** On every reconnect, and on every apply-rule verdict of refetch, the
   affected entities are marked stale in the cache so the next read goes to the server. Recovery is
   a refetch, and the transport never replays.
4. **The three components moved onto it.** `ChatRoom.jsx`, `DirectMessagePage.jsx` and
   `useNotifications.js` each drop their own `new WebSocket`, their own reconnect timer and their
   own error flag, and the eight-second fallback becomes one rule owned by the transport rather than
   two components guessing separately.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objectives 4 and 5](../MASTER_PLAN.md#objectives): make a dropped socket boring,
and have one realtime mechanism rather than one per component.

**Goal.** `grep -rn "new WebSocket" frontend/src` returns exactly one site; the reconnect policy is
written down in one place with its delay, growth and ceiling; every reconnect builds its URL from
the current token; a reconnect marks the affected entities stale so the next read refetches; and
`ChatRoom` recovers from a dropped socket rather than polling for the rest of the session.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/05-one-transport-that-recovers.md`

▶ **Next: [task 1.1](#1--record-the-three-policies-before-replacing-them)**.

### 1. 📋 Record the three policies before replacing them

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Write down what each of the three does today**
  ```
  cd /home/molef/Work/attica
  grep -rn "new WebSocket" frontend/src
  grep -rn "setTimeout(connect\|onclose" frontend/src
  grep -rn "socketError" frontend/src
  ```
  - Produces: one row per component: where it connects, what it does on close, how long it waits,
    whether it refetches, and what its fallback is.
  - Expected on 2026-08-23: three `new WebSocket` sites; `ChatRoom` sets an error flag and stops;
    `DirectMessagePage` waits 4000ms; `useNotifications` waits 5000ms; none refetches.
  - Done when: the three rows exist, and any behaviour that differs from the expectation above is
    written down as having changed rather than quietly worked around.

- [ ] **1.2 Decide, per component, whether it keeps an exception**
  - The scope allows one of the three to keep its own policy if the reason is recorded.
  - Produces: three verdicts, each either "moves to the shared transport" or "keeps its own, because
    `<reason>`".
  - Done when: every verdict has a sentence. On today's reading all three move, and recording that
    as a decision rather than an assumption is what makes an exception later a change rather than a
    discovery.

▶ **Next: [task 2.1](#2--build-the-transport)**.

### 2. 🏗️ Build the transport

◀ **Needs: [task 1](#1--record-the-three-policies-before-replacing-them)**.

- [ ] **2.1 Write the transport module, with the URL built at connect time**
  - It owns: the socket, the reconnect timer, the connection state, and the URL.
  - The URL is built inside `connect()`, from whatever the auth provider holds at that moment. Never
    captured once outside it.
  - Write the reason in a comment: the websocket authenticates by query parameter, so a captured URL
    carries a token that ages, per
    [the environment overview](../../../../../environment/overview.md#auth).
  - Done when: `grep -rn "new WebSocket" frontend/src` returns exactly one site, and the line above
    it reads the current token rather than a variable from an outer scope.

- [ ] **2.2 Write the reconnect policy in one place, with a ceiling**
  - Name three numbers: the first delay, the growth rule, and the maximum delay. Put them in named
    constants in the transport module, not inline in a `setTimeout`.
  - Produces: the numbers [06](06-prove-it-and-write-it-down.md) writes into the runbook recipe for
    forcing a reconnect, because "wait for it to come back" is not a recipe without them.
  - Done when: a reader can answer "how long until it tries again, and how long at worst" from one
    file.
  - 💡 `/error-handling frontend/src/realtime/transport.js recover` once the policy is written: the
    failure branches here (handshake refused, token expired, backend down) each need a different
    behaviour, and this is the file where scattering guards would be a defect rather than caution.

- [ ] **2.3 Write the subscription interface**
  - A component asks for a stream by name and receives frames. Two subscribers to one stream share
    one connection; the last unsubscriber closes it.
  - Done when: mounting two components that want the same room produces one socket in the DevTools
    WS list, not two.

- [ ] **2.4 Hand every frame to the patch path from [04](04-build-the-one-cache.md)**
  - The transport parses the frame, hands the envelope to the patch path, and does nothing else with
    it. It does not decide apply, ignore or refetch; that is the cache's pure function.
  - Done when: the transport module imports the patch path and contains no version comparison of its
    own. A version comparison in two places is two apply rules.

- [ ] **2.5 Refetch on reconnect**
  - On every transition from disconnected to connected, mark every entity the client currently holds
    for the affected streams as stale, so the next read goes to the server.
  - Done when: reconnecting after a gap causes requests to appear in the Network tab, and this is
    what [instruction 6.3](#6--break-the-socket-on-purpose-and-watch-it-come-back) checks.
  - ❌ Do not fetch every stale entity immediately on reconnect. Mark and let the next read pull.
    A reconnect that fires 40 requests at once is a client that hurts a backend that just came back.

▶ **Next: [task 3.1](#3--replace-the-three-sockets)**.

### 3. 🔌 Replace the three sockets

◀ **Needs: [task 2](#2--build-the-transport)**.

- [ ] **3.1 Move `useNotifications` onto the transport**
  - `frontend/src/components/notifications/useNotifications.js:86`. Its `connect()`, its
    `reconnectRef` timer and its 5000ms delay go; it subscribes instead.
  - Do this one first: [04](04-build-the-one-cache.md) already rebuilt its state on the cache, so it
    is the component where the transport change is the only change.
  - Done when: the file contains no `new WebSocket` and no `setTimeout`, and a notification still
    arrives on the badge.

- [ ] **3.2 Move `DirectMessagePage` onto the transport**
  - `frontend/src/pages/DirectMessagePage.jsx:206`, and its 4000ms reconnect.
  - Done when: the file contains no `new WebSocket`, and a message sent from a second browser still
    appears without a refresh.

- [ ] **3.3 Move `ChatRoom` onto the transport, and close the permanent fallback**
  - `frontend/src/components/chat/ChatRoom.jsx:51`, whose `onclose` at line 67 sets `socketError`
    and stops, and whose poll at line 45 then runs forever.
  - The eight-second fallback is kept and moved behind the transport's connection state, so it runs
    while the transport is disconnected and stops when it reconnects. One fallback, one rule.
  - Done when: dropping the socket moves the room to polling, and the socket coming back stops the
    polling. That is the defect closed, and
    [instruction 6.4](#6--break-the-socket-on-purpose-and-watch-it-come-back) is where it is seen.

- [ ] **3.4 Run the linter and the browser suite**
  ```
  cd /home/molef/Work/attica/frontend
  npm run lint
  npm run test:e2e
  ```
  - The suite needs the backend on port 8000 and `python manage.py seed_e2e` already run.
  - Done when: the lint output is no worse than before, and the e2e result is compared against what
    it was before this plan rather than against green. Several tests are marked `test.fail(...)` and
    pass by failing, so read which ones before drawing a conclusion.

▶ **Next: [instruction 6.1](#6--break-the-socket-on-purpose-and-watch-it-come-back)**, because every
claim in this plan is about what happens when something breaks, and nothing here breaks on its own.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 6](#6--break-the-socket-on-purpose-and-watch-it-come-back)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 6. 🔌 Break the socket on purpose, and watch it come back

◀ **Needs: [task 3](#3--replace-the-three-sockets)** done, so there is one transport to break.

This is the manual arc this plan turns on. Every claim here is about a failure, and a failure that
never happens is a claim nobody checked. [06](06-prove-it-and-write-it-down.md) turns these steps
into the runbook recipe for forcing a reconnect, so do them with that in mind and note what you
would have wanted written down.

6.1 **Bring the stack up and find the socket**
   - ```bash
     cd /home/molef/Work/attica/backend/main
     source /home/molef/lobola/bin/activate
     daphne -b 0.0.0.0 -p 8000 main.asgi:application
     ```
   - Second terminal: `cd /home/molef/Work/attica/frontend && npm run dev`.
   - Chrome at `http://localhost:5173`, log in, F12, **Network** tab, **WS** filter.
   - Expected result: exactly one WS row, however many components are on screen.
   - ✅ One row: the shared transport is doing its job.
   - ❌ Two or three rows: a component is still opening its own. Check
     `grep -rn "new WebSocket" frontend/src` returns one site, and that the second row is not a
     stale connection from before a hot reload. Reload the page fully before concluding.

6.2 **Take the browser offline from DevTools**
   - In DevTools, open the **Network conditions** panel: press Escape to open the drawer, click the
     three-dot menu on the drawer, choose **Network conditions**, then set throttling to **Offline**.
   - Expected result: the WS row's status changes, and the Messages panel stops receiving frames.
   - ✅ The socket closed: you now have a controlled outage, which is the thing this whole plan is
     about and the thing nothing in the repository could previously produce on demand.
   - ❌ Nothing changes: you set throttling on the wrong panel. The Network tab's own throttling
     dropdown does not always close an open websocket; the Network conditions drawer does.

6.3 **Change something in a second browser while the first is offline**
   - In a second browser logged in as the other party, send three messages or trigger three
     notifications.
   - Then set the first browser back to **No throttling**.
   - Expected result: the WS row reconnects, and the **Network** tab shows fetch requests appearing
     without you clicking anything.
   - ✅ Requests appear and the screen catches up: that is recovery, and it is
     [goal 4](../MASTER_PLAN.md#goals) seen rather than asserted. Note how long it took, because
     that number is the reconnect policy's first delay and it belongs in the runbook.
   - ❌ The socket reconnects and no requests appear: the reconnect is not marking anything stale.
     That is [task 2.5](#2--build-the-transport) not landing, and it is the failure that looks most
     like success, because the socket visibly came back.
   - ❌ The socket never reconnects: check the WS row's URL for a `?token=` that has expired. A
     reconnect with a stale token fails the handshake, and the symptom is a transport that retries
     forever against a server that is fine.

6.4 **Check `ChatRoom` specifically, because it was the worst of the three**
   - Open a chat room, go offline, wait past the eight-second poll interval, come back online.
   - Expected result: while offline the room polls; when the socket returns the polling stops and
     frames resume.
   - ✅ Polling stops: the permanent fallback is closed. Confirm by watching the Fetch/XHR filter
     for two minutes after reconnecting and seeing no eight-second rhythm.
   - ❌ The room keeps polling every eight seconds after the socket is back: the fallback is still
     keyed on a component-local error flag rather than on the transport's connection state.

6.5 **Leave a tab open long enough for the token to age, then break it**
   - Leave a logged-in tab open for longer than the access token's lifetime, then repeat 6.2 and
     6.3.
   - Expected result: the reconnect succeeds, because the URL was rebuilt from a refreshed token.
   - ✅ It reconnects: the stale-token defect did not survive the rewrite.
   - ❌ The handshake is refused: the transport captured the URL once. This is the defect most
     likely to survive, because it only appears after a long session, and it is why this step is
     worth the wait.

6.6 **Write down the three numbers and the two panels**
   - The first delay, the growth, the ceiling, and the exact click path to the Network conditions
     panel and the WS Messages panel.
   - These are the raw material for [06](06-prove-it-and-write-it-down.md)'s runbook pair, and this
     is the moment you have them in front of you.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when you can break the socket on purpose, do three things behind its back, put
> it back, and watch the screen become correct without touching it.

Pass:

- Exactly one `new WebSocket` site in `frontend/src`, and one WS row in DevTools however many
  components are mounted.
- The reconnect policy's three numbers are named constants in one file.
- A reconnect after a token has aged succeeds, because the URL is built at connect time.
- A reconnect marks entities stale and the next read refetches, seen as requests in the Network tab.
- `ChatRoom` stops polling when the socket returns.
- Every one of the three components has a written verdict from
  [task 1.2](#1--record-the-three-policies-before-replacing-them), including any exception and its
  reason.

Fail, and what it means:

- A reconnect that succeeds and refetches nothing. That is the failure this plan is most exposed to,
  because the socket visibly comes back and the screen looks fine until the thing that changed
  during the gap is the thing being looked at.
- A URL captured once outside `connect()`. Then every long-lived tab reconnects with a dead token,
  and it will be reported as "the socket randomly stops working".
- A version comparison inside the transport. Then there are two apply rules, and they will diverge.
- A connection-state indicator added to a screen. That is `the-event-workspace`, and adding it here
  puts a visible feature in a scope nobody is reviewing for visible features.

Partial pass is acceptable on the eight-second fallback. The permanent-fallback defect closing is
the load-bearing half; whether the fallback should exist at all can stay as it is with a note.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The transport module, one socket, one policy | `frontend/src/realtime/` | — | not started |
| The reconnect policy's three named constants | inside the transport module | — | not started |
| The subscription interface | inside the transport module | — | not started |
| The refetch-on-reconnect rule | transport plus the cache's patch path | — | not started |
| Three components moved off their own sockets | `ChatRoom.jsx`, `DirectMessagePage.jsx`, `useNotifications.js` | — | not started |
| Three verdicts, one per component | this plan's working notes | — | not started |
| The two DevTools click paths and the three numbers | this plan's working notes, reused by [06](06-prove-it-and-write-it-down.md) | — | not started |
| Three sockets, three policies | [piece 2](../diagram-prompts.md#piece-2-three-sockets-three-policies-planned--not-rendered) → `../diagrams/subject-02-three-sockets-three-policies.png` | subject | ⏳ not rendered |
| The gap nobody notices | [piece 5](../diagram-prompts.md#piece-5-the-gap-nobody-notices-planned--not-rendered) → `../diagrams/subject-05-the-gap-nobody-notices.png` | subject | ⏳ not rendered |
| The client-truth glyph, opened up | [the capstone](../diagram-prompts.md#the-client-truth-glyph-opened-up-planned--not-rendered) → `../diagrams/subject-capstone-the-client-truth-glyph-opened-up.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/05-one-transport-that-recovers.md` | task 0, before any work | Conformance and thin instructions reported |
| Name the failure branches in the transport | `/error-handling frontend/src/realtime/transport.js recover` | task 2.2 | Handshake refused, token expired and backend down each get their own behaviour |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth` | the close out | Statuses and running order match reality |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

`frontend/src/components/chat/ChatRoom.jsx:44` to `:71` — the worst of the three, in two effects.
The poll, guarded so it runs only after failure:

```javascript
useEffect(() => {
    if (!socketError) return undefined;
    const interval = setInterval(() => fetchMessages(), 8000);
    return () => clearInterval(interval);
}, [fetchMessages, socketError]);
```

and the close handler that makes the guard permanent:

```javascript
socket.onclose = () => {
    socketRef.current = null;
    setSocketError(true);          // nothing ever sets it back except a successful onopen
};                                 // and nothing ever tries to open again
```

`frontend/src/pages/DirectMessagePage.jsx:203` to `:206` — the same shape with a reconnect, and the
same absence of a refetch:

```javascript
const connect = () => {
    const socket = new WebSocket(wsUrl);   // wsUrl built once, outside connect()
    socket.onopen = () => setSocketError(false);
```

`frontend/src/components/notifications/useNotifications.js:82` to `:102` — the third policy, and the
clearest instance of the captured URL:

```javascript
const wsUrl = `${protocol}://${window.location.host}/ws/notifications/?token=${tokens.access}`;
const connect = () => {
    const socket = new WebSocket(wsUrl);       // the token in this URL ages with the tab
    socket.onclose = () => { reconnectRef.current = setTimeout(connect, 5000); };
};
```

`frontend/vite.config.js:19` — the `/ws` proxy rule with `ws: true`. It works. Do not add one.

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[06-prove-it-and-write-it-down.md](06-prove-it-and-write-it-down.md), which does the duplicate test,
the gap test and the refresh test by hand in two browsers, writes the runbook pair for watching
events arrive and forcing a reconnect, and gives the event envelope its entry in `context/`.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits the plan as a whole. The work is a transport rewrite proved by breaking a
socket by hand, and the skills that come closest each do one part: `/error-handling` names the
failure branches, `/write-tests` cannot reach a real socket outage.
   also: `/drip-runbook` in [06](06-prove-it-and-write-it-down.md) is where instruction 6's click
   paths become a recipe, so capture them as you go rather than reconstructing them later.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| The socket reconnects and the screen stays stale | Instruction 6.3 | The reconnect is not marking entities stale. The socket coming back is not recovery; the refetch is. |
| A reconnect handshake refused after a long session | Instruction 6.5 | The URL was captured once, so the token in it aged. Build the URL inside `connect()`. |
| A chat room polls every eight seconds forever | `ChatRoom`, after any dropped socket | The fallback is keyed on a component-local error flag with no reconnect. Key it on the transport's connection state. |
| Two WS rows in DevTools after a hot reload | Instruction 6.1 | Often a stale connection rather than a second subscriber. Reload the page fully before investigating. |
| A `/ws` proxy rule added that already existed | Anyone acting on the flow map's Step 0 claim | `frontend/vite.config.js:19` already proxies `/ws` with `ws: true`. The claim in the learning journey's flow map is wrong and the project's instructions already say so. |
