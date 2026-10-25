# 🗄️ Build The One Cache

Step 4 of 6 in this scope. Waits on [01](01-read-the-answer-and-choose-the-cache.md) and
[02](02-define-the-envelope.md). Runs at the same time as
[03](03-put-the-envelope-on-the-wire.md). Next:
[05-one-transport-that-recovers.md](05-one-transport-that-recovers.md).

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

Scope: [one client truth](../MASTER_PLAN.md). Fourth of six, and the client half of the pair.

It waits on [01](01-read-the-answer-and-choose-the-cache.md) for what to build and on
[02](02-define-the-envelope.md) for the rule it implements. It does not wait on
[03](03-put-the-envelope-on-the-wire.md): both read the same contract, so they can be done at the
same time, and the [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>'s apply rule is testable as a pure function before a single real envelope
exists.

[05](05-one-transport-that-recovers.md) waits on this plan, because a reconnect that refetches needs
somewhere to put what it refetched.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

There is no server-state library and no shared [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>. `frontend/package.json` lists no data layer:
no TanStack Query, no SWR, no Redux, no Zustand. The one shared store is
`frontend/src/context/reactContext.jsx`, the event-creation wizard's reducer persisted to
`localStorage`, which is not a cache of anything the server owns.

**144 `fetch(` call sites across 40 of the 110 JavaScript files**, and 73 files holding their own
`useState`. [Task 1.1](#1--read-the-decision-and-take-the-before-number) runs the pinned command
from [01](01-read-the-answer-and-choose-the-cache.md) again, so the before-number and the
after-number come from one ruler.

**The clearest single example of the defect is one file.**
`frontend/src/components/notifications/useNotifications.js` holds four things that should be one: a
list, a count, a socket, and a 30-second poll. A push does `setNotifications(prev => [data.notification, ...prev])`
and `setUnreadCount(prev => prev + 1)` (lines 92 to 94), two separate pieces of state updated by one
event. A 30-second poll refreshes the count and only the count (line 121, calling
`fetchUnreadCount`). So a notification that arrives while the socket is down is corrected in the
count within 30 seconds and never corrected in the list. The badge says three, the panel shows two,
and nothing in the app can notice.

**And `setUnreadCount(prev => prev + 1)` has no idea whether it has seen that notification before.**
The [outbox](../../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> dispatcher reclaims and retries, so at-least-once is the guarantee that is actually on
offer, and a duplicate push double-counts today.

**One decision inside this plan is not this scope's to take alone.** D10, the frontend stack,
belongs to `the-design-system`. This plan builds what
[01](01-read-the-answer-and-choose-the-cache.md) chose and carries that decision's stack-fragility
label forward rather than revisiting it.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **There are two [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> clients with no bridge between them**, per
  [the access paths](../../../../../environment/overview.md#access-paths). One goes through the Vite
  [proxy](../../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub> on relative paths; one hardcodes `http://127.0.0.1:8000` in
  `frontend/src/utils/useAxios.js:10` and needs [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub>. This is the fact most likely to make a cached
  read fail in a way that looks like a [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> bug: the two authenticate differently and fail
  differently. The cache decides which one a cached read uses, once, and a component never chooses.
- **The frontend dev server is Vite on port 5173**, started with `npm run dev` from `frontend/`.
- **Daphne, not `runserver`**, for anything touching [websockets](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub>. This plan does not build a socket,
  and its checks in [instruction 5](#5--watch-the-badge-and-the-list-agree) need one running to
  produce a push worth watching.
- **The frontend has no unit test runner today.** `frontend/package.json` carries
  `@playwright/test` and no vitest and no jest, and the scripts are `test:e2e`, `test:e2e:ui` and
  `test:e2e:report`. [Task 3.1](#3--prove-the-apply-rule) follows whichever route
  [01](01-read-the-answer-and-choose-the-cache.md) recorded, and does not re-take that decision.
- **The Playwright suite assumes the backend is already running on port 8000** and that
  `python manage.py seed_e2e` has been run, per
  [the project's instructions](../../../../../CLAUDE.md). Several of its tests are marked
  `test.fail(...)` and pass by failing, so a green suite there does not mean what it looks like.

Where a fact this plan needs is not written there, stop and ask rather than inferring it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Migrate the entities on D1's settled list, and no others.**

144 call sites is not a target. The target is that every read of an entity the [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> owns goes
through the cache. A component fetching a vendor profile picture is not the defect this scope exists
for, and migrating it buys a smaller number and nothing else. Say in the notes which call sites were
deliberately left alone, so the after-number is a fact rather than a score.

**The apply rule is a pure function, and it is the only part that must be tested.**

Given a held version and an incoming version, it returns apply, ignore or refetch. Everything else
in this plan is wiring. Testing the wiring is expensive and proves little; testing this is cheap and
proves the thing the whole scope turns on.

**The badge and the list are one thing read two ways.**

Not two states kept in step. If the fix is a synchronisation, it is the wrong fix, and the two will
drift again the first time a new update path appears. The count is derived from the collection, and
then the 30-second poll can be deleted rather than left as the thing that half-corrects a
disagreement.

**Deleting the poll is the deliverable, not a side effect.**

A poll left in place beside a working cache is a second source of truth with a 30-second cadence,
and it will mask exactly the bug the cache was built to prevent. It goes.

**This plan changes no screen's appearance.**

Optimistic updates, autosave, loading skeletons and the persistent shell are `the-event-workspace`,
scope 11, which waits on this one. This scope is finished when the data is right, and a screen that
looks identical afterwards is the expected outcome rather than a disappointment. The one exception
is the badge, which stops disagreeing with the list, and that is a cache fix with a visible
consequence rather than a screen change.

**The cache is not where a component's own state goes.**

73 files hold `useState`. Most of that is form state, open-or-closed state and hover state, which is
local and correct where it is. The cache owns remote state only. A plan that migrates `useState` on
principle turns a correctness fix into a rewrite.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**Two screens reading the same booking get the same object**, and a duplicate message changes
nothing the second time, which is what makes at-least-once delivery survivable on the client.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Several components each hold their own copy of the same booking, fetched at different moments. When
they disagree, nothing in the app can tell which is right, and the person sees two numbers and
guesses. That is a correctness defect wearing the costume of a performance problem, which is why it
has survived: nothing is slow, so nothing looks broken.

The notification badge is the smallest complete instance. A count incremented by a push, a list
prepended by the same push, and a poll that corrects only one of them. Every ingredient of the
scope's problem is in one 130-line file, which is why it is the file to fix first and the file to
demonstrate on.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  TODAY                                 AFTER THIS PLAN

  ┌──────────┐  ┌──────────┐            ┌───────────────────────────┐
  │ screen A │  │ screen B │            │        the cache          │
  │ booking  │  │ booking  │            │  booking:41  version 7    │
  │ v?  ...  │  │ v?  ...  │            └───────┬───────────┬───────┘
  └────▲─────┘  └────▲─────┘                    │           │
       │             │                      ┌───▼───┐   ┌───▼───┐
    fetch          fetch                    │screen │   │screen │
       │             │                      │   A   │   │   B   │
  ═════╧═════════════╧═════ server          └───────┘   └───────┘

  badge  ← push +1                        badge  ┐
  list   ← push prepend                          ├─ both derived from
  badge  ← poll every 30s                 list   ┘  one cached collection
  list   ← nothing                                  poll deleted

  duplicate push  →  badge says 4         duplicate push  →  version equal
                     list shows 3                            →  ignored
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

Two pieces in this scope's map are drawn from what this plan changes.

**Subject: one fact, many copies.** The four browser cards each holding their own copy, and the
empty framed slot between them where a shared cylinder should be. This plan fills that slot.
[Piece 1](../diagram-prompts.md#piece-1-one-fact-many-copies-planned--not-rendered).
Save as `../diagrams/subject-01-one-fact-many-copies.png`. *(image not yet generated)*

**Subject: the badge and the list.** The poll arrow that reaches the badge and stops short of the
list, and the final state where the badge exceeds the list by exactly one. Both go away here.
[Piece 4](../diagram-prompts.md#piece-4-the-badge-and-the-list-planned--not-rendered).
Save as `../diagrams/subject-04-the-badge-and-the-list.png`. *(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Four things in `frontend/src`, in this order.

1. **The [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> itself**, being whatever [01](01-read-the-answer-and-choose-the-cache.md) chose, set
   up once at the application root, with the entity keys from that plan's settled list and the
   two-HTTP-client rule from its contract section.
2. **The apply rule as a pure function**, implementing the table in
   [the envelope contract](../../../../../docs/realtime_event_envelope.md). It takes the version the
   cache holds and the version on the incoming envelope, and returns apply, ignore or refetch. It
   touches no network and no React.
3. **The migrated read sites**, being every call site that reads an entity on the settled list.
   Each one stops calling `fetch` and starts reading the cache. The count of what remains, and a
   written list of what was deliberately left alone.
4. **`useNotifications` rebuilt on the cache**: one cached collection, the badge derived from it,
   the list derived from it, and the 30-second poll deleted.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objectives 1 and 3](../MASTER_PLAN.md#objectives): give remote state one place
to live, and make duplicates stop being visible on the client.

**Goal.** A screen reading a booking gets the same object as every other screen reading it; the
apply rule has a passing test for every row in the contract's table including the two edge rows; the
pinned counting command shows a lower number with a written list of what was left alone; the badge
and the list derive from one collection; and
`grep -n "30000\|fetchUnreadCount" frontend/src/components/notifications/useNotifications.js`
returns nothing.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/04-build-the-one-cache.md`

▶ **Next: [task 1.1](#1--read-the-decision-and-take-the-before-number)**.

### 1. 📖 Read the decision and take the before-number

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Run the pinned counting command from [01](01-read-the-answer-and-choose-the-cache.md)**
  ```
  cd /home/molef/Work/attica
  grep -rn "fetch(" frontend/src --include=*.js --include=*.jsx | wc -l
  grep -rl "fetch(" frontend/src --include=*.js --include=*.jsx | wc -l
  git rev-parse --short HEAD
  ```
  - Produces: the before-number for this plan, which should match what
    `artifacts/notes/one-client-truth/what-owns-remote-state.md` recorded, or a written note of why
    it moved.
  - Done when: both numbers and the commit are in this plan's working notes. The same three lines
    run again in [task 4.3](#4--migrate-the-reads-and-rebuild-the-notification-hook).

- [ ] **1.2 Read the decision, the entity list and the contract**
  - `artifacts/notes/one-client-truth/what-owns-remote-state.md` for what to build, which entities,
    which [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> client, and the apply-rule proof route.
  - `docs/realtime_event_envelope.md` for the apply rule table and the field names.
  - Done when: the chosen library or approach, the entity list, and the proof route are written into
    this plan's working notes verbatim.
  - ❌ If either file is missing, stop. Building the [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> without them means taking two decisions
    silently that two other plans exist to take out loud.

▶ **Next: [task 2.1](#2--build-the-cache)**.

### 2. 🏗️ Build the cache

◀ **Needs: [task 1](#1--read-the-decision-and-take-the-before-number)**.

- [ ] **2.1 Set the cache up at the application root**
  - Whatever [01](01-read-the-answer-and-choose-the-cache.md) chose, wired once, above the router.
  - Produces: one provider or one module every component can reach.
  - Done when: a component can read a cached entity without importing anything that knows about
    HTTP.

- [ ] **2.2 Write the apply rule as a pure function**
  - Location: beside the cache, in its own file, exporting one function.
  - It implements the table in `docs/realtime_event_envelope.md` and nothing else: held version and
    incoming version in, one of apply, ignore or refetch out.
  - Done when: it imports nothing from React and nothing that does network work. If it needs either,
    it is not the rule, it is the wiring around the rule.
  - 💡 `/unpack docs/realtime_event_envelope.md` before writing it: the two edge rows, nothing-held
    and more-than-one-ahead, are the ones this function exists for and the ones easiest to skip.

- [ ] **2.3 Write the key function and the entity keys**
  - One place that turns an entity name and an id into a cache key, matching the envelope's
    `entity` and `id` fields exactly.
  - Done when: an envelope arriving from the server can be turned into a cache key with no string
    manipulation at the call site. A key built by concatenation in two places is a cache with two
    keyspaces.

- [ ] **2.4 Write the patch path**
  - One function taking a parsed envelope, running the apply rule, and doing one of three things:
    writing the new state into the cache, doing nothing, or marking that entity stale so the next
    read refetches.
  - Produces: what [05](05-one-transport-that-recovers.md) hands every incoming message to.
  - Done when: the refetch branch marks and returns rather than fetching inline. A patch path that
    fetches is a patch path that can fire 40 requests when a socket reconnects with a backlog.

▶ **Next: [task 3.1](#3--prove-the-apply-rule)**.

### 3. 🧪 Prove the apply rule

◀ **Needs: [task 2](#2--build-the-cache)**.

- [ ] **3.1 Set up the proof route [01](01-read-the-answer-and-choose-the-cache.md) recorded**
  - If that plan chose vitest: add it as a development dependency, add a `test:unit` script, and
    confirm it runs. Vite is already the build tool, so the runner needs no new configuration file.
  - If it chose Playwright: write the spec under `frontend/tests/e2e/` following the conventions in
    `create-event.spec.ts`, and note that the suite needs the backend running on port 8000 and
    `python manage.py seed_e2e` already run.
  - Done when: an empty test runs and reports, before any real test is written. A test runner
    debugged at the same time as a first test is two unknowns at once.

- [ ] **3.2 Run the following prompt:** `/write-tests frontend/src/cache/applyRule.js unit`
  - Produces: one test per row of the apply rule table in `docs/realtime_event_envelope.md`,
    including nothing-held and more-than-one-ahead.
  - Output goes to: whichever location the runner from
    [task 3.1](#3--prove-the-apply-rule) expects, which `/write-tests` detects rather than this plan
    asserting.
  - Adjust the path if [task 2.2](#2--build-the-cache) placed the function elsewhere; the file the
    prompt names must be the file that exists.
  - Reference: [the envelope contract](../../../../../docs/realtime_event_envelope.md) is what
    "correct" means here.

- [ ] **3.3 Add the duplicate case explicitly, by name**
  - One test named for what it proves: the same envelope applied twice leaves the cache identical.
  - Done when: it passes, and it would fail if the apply rule's equal-version row returned apply.
    Check that by temporarily breaking the rule and watching the test go red. A test that cannot
    fail proves nothing, and this is the one test the whole at-least-once argument rests on.

▶ **Next: [task 4.1](#4--migrate-the-reads-and-rebuild-the-notification-hook)**.

### 4. 🔁 Migrate the reads, and rebuild the notification hook

◀ **Needs: [task 3](#3--prove-the-apply-rule)**.

- [ ] **4.1 Migrate every read of an entity on the settled list**
  - Work file by file from the list produced by
    [task 1.1](#1--read-the-decision-and-take-the-before-number), taking the entity list as the
    filter.
  - Each migrated site: the `fetch` goes, the component reads the cache, and the two-HTTP-client
    question is answered by the cache rather than by the component.
  - Done when: no component that reads an entity on the settled list calls `fetch` directly.

- [ ] **4.2 Rebuild `useNotifications` on one cached collection**
  - `frontend/src/components/notifications/useNotifications.js`. The list becomes a cached
    collection; the count becomes a value derived from it; the push goes through the patch path from
    [task 2.4](#2--build-the-cache) instead of calling `setNotifications` and `setUnreadCount`; and
    the 30-second poll is deleted.
  - The socket in this file stays as it is for now. [05](05-one-transport-that-recovers.md) replaces
    all three sockets at once, and replacing one here means writing a fourth reconnect policy.
  - Done when: `grep -n "30000" frontend/src/components/notifications/useNotifications.js` returns
    nothing, `grep -n "setUnreadCount" frontend/src/components/notifications/useNotifications.js`
    returns nothing, and the badge is computed from the collection at the point it is rendered.

- [ ] **4.3 Take the after-number and write down what was left alone**
  - Run the three commands from [task 1.1](#1--read-the-decision-and-take-the-before-number) again.
  - Produces: the after-number, and a written list of the call sites deliberately not migrated, each
    with one clause saying why.
  - Done when: both numbers are in `artifacts/notes/one-client-truth/what-owns-remote-state.md`
    under the section [01](01-read-the-answer-and-choose-the-cache.md) created for them, with the
    same command beside both. A number that dropped because a different grep was used is a number
    that means nothing.

- [ ] **4.4 Run the linter, because 40 files moved**
  ```
  cd /home/molef/Work/attica/frontend
  npm run lint
  ```
  - Done when: the output is no worse than it was before the migration. Record both counts if it was
    not clean to begin with.

▶ **Next: [instruction 5.1](#5--watch-the-badge-and-the-list-agree)**, because the badge defect is
only settled by watching it on a screen.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 5](#5--watch-the-badge-and-the-list-agree)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 5. 👀 Watch the badge and the list agree

◀ **Needs: [task 4](#4--migrate-the-reads-and-rebuild-the-notification-hook)** done, so there is a
rebuilt hook to watch.

A unit test proves the rule. Only the screen proves the badge.

5.1 **Bring the stack up and open two browsers**
   - ```bash
     cd /home/molef/Work/attica/backend/main
     source /home/molef/lobola/bin/activate
     daphne -b 0.0.0.0 -p 8000 main.asgi:application
     ```
   - In a second terminal: `cd /home/molef/Work/attica/frontend && npm run dev`.
   - Chrome at `http://localhost:5173` logged in as the organizer, and a second browser (or an
     incognito window) logged in as the other party.
   - ✅ Both are logged in and the organizer's notification bell is visible.
   - ❌ The second login lands somewhere without a bell: use a role whose dashboard has one.
     `getting-in`, scope 2, is the scope that makes all five roles reachable, and if that is not
     done, use the two roles that work.

5.2 **Send three notifications and count**
   - From the second browser, do the thing that notifies the organizer three times.
   - Expected result: the badge shows 3 and the panel lists 3.
   - ✅ They match: open the panel and close it, and check the badge still matches.
   - ❌ They differ: note which is higher. A badge higher than the list means the count is still
     being incremented separately somewhere; a list longer than the badge means the derivation is
     filtering something the list is not.

5.3 **Watch the poll not happen**
   - With DevTools open on the **Network** tab, **Fetch/XHR** filter, leave the page idle for two
     minutes.
   - Expected result: no request to the unread-count endpoint.
   - ✅ Nothing repeats every 30 seconds: the poll is gone.
   - ❌ A request every 30 seconds: the interval survived somewhere. Search for `setInterval` across
     `frontend/src/components/notifications/`, and check whether a second component mounted the hook.

5.4 **Check two screens see one booking**
   - Open a booking on one screen, and the same booking on another screen in the same browser (two
     tabs is fine, since the [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> is per browsing context).
   - Change it from the second browser, and watch both.
   - Expected result: the two tabs in the same browser show the same value.
   - ✅ They agree: that is [goal 1](../MASTER_PLAN.md#goals), seen rather than asserted.
   - ❌ They differ: two cache instances exist, which usually means the provider is mounted below
     the router rather than above it, so a route change rebuilds it.
   - Two separate browsers are not expected to agree yet without a refresh. That is
     [05](05-one-transport-that-recovers.md)'s job, and expecting it here is the easiest way to
     conclude this plan failed when it worked.

5.5 **Write down what you saw**
   - The three counts, the idle-network result, and the two-tab result, each with the date.
   - [06](06-prove-it-and-write-it-down.md) does the full duplicate and gap tests; these are the
     narrower checks that this plan's own work landed.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when the badge and the list cannot disagree, and applying the same envelope
> twice changes nothing the second time.

Pass:

- The apply rule is a pure function with a passing test per row of the contract's table, including
  nothing-held and more-than-one-ahead.
- The duplicate test exists by name, and it goes red when the equal-version row is broken on
  purpose.
- The badge and the list derive from one cached collection, and the 30-second poll is deleted.
- Two minutes idle with the Network tab open produces no repeating request.
- Two tabs on the same booking show the same value.
- The after-number is taken with the same command as the before-number, and the call sites left
  alone are listed with a reason each.

Fail, and what it means:

- The badge and the list kept in step rather than derived from one collection. Then they will drift
  again the next time an update path is added, and the fix will look like it worked.
- A lower after-number with no list of what was left alone. Then the number is a score rather than a
  measurement, and nobody can tell whether the remaining call sites are fine or forgotten.
- A duplicate test that passes and cannot fail. That is the failure this plan is most exposed to,
  because the whole at-least-once argument rests on that one test and a test that always passes
  looks exactly like a test that works.
- A screen rewritten. Optimistic updates, skeletons and the shell are `the-event-workspace`, and a
  [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> scope that redesigns a screen is a cache scope nobody can review.

Partial pass is acceptable on the migration breadth. Every entity on the settled list migrated, with
a written list of what was left alone, beats a lower number reached by migrating whatever was easy.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>, set up at the application root | `frontend/src/` | — | not started |
| The apply rule as a pure function | beside the cache, its own file | — | not started |
| The key function and the entity keys | beside the cache | — | not started |
| The patch path an envelope goes through | beside the cache | — | not started |
| Tests, one per apply-rule row plus the duplicate case | wherever the chosen runner expects | — | not started |
| `useNotifications` on one collection, poll deleted | `frontend/src/components/notifications/useNotifications.js` | — | not started |
| The after-number and the left-alone list | `artifacts/notes/one-client-truth/what-owns-remote-state.md` | — | not started |
| One fact, many copies | [piece 1](../diagram-prompts.md#piece-1-one-fact-many-copies-planned--not-rendered) → `../diagrams/subject-01-one-fact-many-copies.png` | subject | ⏳ not rendered |
| The badge and the list | [piece 4](../diagram-prompts.md#piece-4-the-badge-and-the-list-planned--not-rendered) → `../diagrams/subject-04-the-badge-and-the-list.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/04-build-the-one-cache.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the contract before writing the rule | `/unpack docs/realtime_event_envelope.md` | task 2.2 | The two edge rows read rather than skimmed |
| Test the apply rule | `/write-tests frontend/src/cache/applyRule.js unit` | task 3.2 | One test per row of the contract's table |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth` | the close out | Statuses and running order match reality |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

`frontend/src/components/notifications/useNotifications.js:92` to `:94` — two states, one event:

```javascript
if (data.type === 'notification' && data.notification) {
    setNotifications(prev => [data.notification, ...prev]);   // the list
    setUnreadCount(prev => prev + 1);                          // the count, separately
}
```

`frontend/src/components/notifications/useNotifications.js:119` to `:122` — the poll that corrects
one of them:

```javascript
useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000);     // count only; the list is never corrected
    return () => clearInterval(interval);
}, [fetchUnreadCount]);
```

After [task 4.2](#4--migrate-the-reads-and-rebuild-the-notification-hook), the shape to aim at: one
cached collection, and the count read off it at render time, so there is no second state to correct
and nothing for a poll to do.

`frontend/src/utils/useAxios.js:10` — the hardcoded `http://127.0.0.1:8000` base, one of the two
[HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> clients. The [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> decides which one a cached read uses; a component never chooses.

`frontend/src/context/reactContext.jsx` — the wizard's own reducer persisted to `localStorage`. Not
a cache of server state, and not this plan's to change. `the-event-workspace` owns the wizard.

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[05-one-transport-that-recovers.md](05-one-transport-that-recovers.md), which replaces the three
sockets with one transport, hands every message to this plan's patch path, and makes a reconnect
refetch rather than resume.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/write-tests frontend/src/cache/applyRule.js unit` ✅ — the one part of this plan that must be
proved by a test rather than by a screen, and the skill stops at test code instead of expanding into
the migration.
   alt: `/code-audit frontend/src/components/notifications/` after the rebuild, to catch a second
   update path nobody remembered.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| Two tabs on one booking show different values after the migration | Instruction 5.4 | The [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> provider is mounted below the router, so a route change rebuilds it. Mount it above. |
| A request repeats every 30 seconds after the poll was deleted | Instruction 5.3 | A second component mounted the hook, or a second `setInterval` exists. Search the whole notifications folder rather than the one file. |
| The badge stays correct and the list does not | Any state where the two are updated separately | They are not synchronised, they are derived. If there are still two `setState` calls for one event, the rebuild did not land. |
| A green Playwright run that means nothing | The e2e suite | Several tests are marked `test.fail(...)` and pass by failing. Read which ones before treating green as evidence. |
