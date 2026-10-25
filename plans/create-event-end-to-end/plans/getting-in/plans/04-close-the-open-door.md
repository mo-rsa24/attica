# 🔒 Close the Open Door

Step 4 of 4 in this scope. Waits on [01](01-settle-what-a-role-is.md), and runs beside
[02](02-grant-every-role.md) and [03](03-prove-it-and-write-it-down.md).
Next: [03](03-prove-it-and-write-it-down.md) closes the scope.

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to produce](#description-what-to-produce)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [References](#references)
- [Next step](#next-step)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [getting-in](../MASTER_PLAN.md). Fourth of four, and not the one that closes it: this scope
decides who a user is, this plan decides what the API lets them do, and
[03](03-prove-it-and-write-it-down.md) is what proves the scope worked.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Django [REST](../../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> Framework's global default in this project is `AllowAny`
(`backend/main/main/settings.py`). A view is therefore public unless it declares otherwise, and the
declaring is uneven: 95 view classes exist across the backend against 79 `permission_classes`
declarations, and `scheduling`, which owns booking, has 35 view classes against 14.

Some of those 35 inherit permissions from a base class, so the gap is a signal rather than a proven
hole. Nobody has counted which.

Separately, no throttle class is configured or referenced anywhere in the backend, so the login
endpoint accepts unlimited attempts.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md).

- **Tokens are unrevokable.** A leaked token is valid until it expires, which is what makes an
  unthrottled login endpoint worth more to an attacker than it would otherwise be.
- **[Websockets](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> authenticate by query parameter**, not by header, so a permission change on the [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub>
  side does not automatically reach the socket side.
- **`CORS_ALLOWED_ORIGINS` names `http://localhost:5173` and `http://localhost:3000` only**
  (`backend/main/main/settings.py:140`). Vite binds 5174 when 5173 is taken, and a request from 5174
  fails on [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> in a way that looks exactly like a permission rejection. Check the port before
  concluding a permission change broke something.
- Running Attica means four processes started by hand, in order, [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> first.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Flipping the default breaks things loudly, and that is the point.**

Changing `DEFAULT_PERMISSION_CLASSES` to `IsAuthenticated` will 401 every endpoint that was relying
on the open default without saying so. That noise is the audit: each 401 names a view that was
public by accident or public on purpose, and the difference has to be decided one view at a time.

**Do the audit before the flip, not after.**

Flipping first and fixing the fallout produces a list of endpoints that broke, which is not the same
list as endpoints that should be public. The first is discovered by the frontend failing; the second
is decided by reading.

**A rate limit needs a number and a reason.**

"Add [throttling](../../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/Rate%20Limiter.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=55 "System design interview, chapter 4, Design a rate limiter, the algorithms, Works five algorithms with numbers: a token bucket of capacity 4 refilled 2 tokens..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=63 "System design interview, chapter 4, Design a rate limiter, the design, Counters kept in Redis, rules and the 429 response with its headers, then the distribu..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=7 "Grokking the system design interview, section 7, API rate limiter, Why a service limits rates: denial-of-service and brute-force attacks, misbehaving clients..."), [▶1](https://www.youtube.com/watch?v=YXkOdWBwqaA&t=188s "ByteByteGo, Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling, Token bucket algorithm, 3:08 to 4:33, The token bucket, reached after the fixed ..."), [▶2](https://www.youtube.com/watch?v=FsB_nRGdeLs&t=18s "Hayk Simonyan, API Security Explained: Rate Limiting, CORS, SQL Injection, CSRF, XSS & More, Rate Limiting, 0:18 to 2:39, Rate limiting as the first defence ..."), [◆](../../../../../../../goal-setting/learning/projects/tms-mobility/system-design/plans/02-api-and-traffic-control/plans/03-rate-limiting.md "Rate Limiting, projects/tms-mobility/system-design/plans/02-api-and-traffic-control, plan 03. Token-bucket rate limiting keyed by user, for coupon abuse and ...")</sub>" without a number is not done. Pick the number, write down why that number, and
accept that the first one is a guess to be revised once the numbers plan gives real traffic figures.

**This plan waits on 01, not on 02 or 03.**

Which classification decides what a user may see is 01's question, and a permission class cannot be
written until it is answered. Granting roles and logging in are independent of it.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

After this plan, an endpoint is private unless somebody decided it should be public, and that
decision is written down per endpoint rather than implied by the absence of a line.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

A default of `AllowAny` inverts the safe direction: forgetting a line exposes an endpoint instead of
blocking one. Every new view added from here inherits that inversion, so the cost of leaving it
grows with the codebase rather than staying flat.

The booking endpoints are the ones that matter. `scheduling` is where a request to hold somebody's
time is accepted, and it is the app with the widest gap between its view count and its permission
declarations.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  today                              after this plan

  DEFAULT = AllowAny                 DEFAULT = IsAuthenticated
        │                                  │
        ▼                                  ▼
  view declares nothing              view declares nothing
        │                                  │
        ▼                                  ▼
     PUBLIC  ◀── the accident          BLOCKED  ◀── the safe direction
                                            │
                                            ▼
                                   public endpoints declare
                                   AllowAny on purpose, listed
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-produce) ➡️

None yet. If this plan earns one, the subject is the inversion drawn above: the same missing line
producing opposite outcomes. The scope's map is [the diagram prompts](../diagram-prompts.md).

## Description: what to produce

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

A table naming every view class in the backend, the permission that applies to it, and where that
permission comes from. Then the default flipped to `IsAuthenticated`, every deliberately public
endpoint declaring `AllowAny` explicitly, and a throttle on the login endpoint and the availability
search with the rate and its reason written down.

## Purpose and goal

Navigation: ⬅️ [Description: what to produce](#description-what-to-produce) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Make the absence of a permission line mean blocked rather than open.

**Goal.** `DEFAULT_PERMISSION_CLASSES` is `IsAuthenticated`, every public endpoint says so in its own
file, the audit table exists with no row marked unknown, and two endpoints carry a throttle with a
recorded rate.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/getting-in/plans/04-close-the-open-door.md`

▶ **Next: [task 1](#1--audit-what-is-actually-protected)**, because nothing may be changed until the
current state is counted.

### 1. 🔍 Audit what is actually protected

◀ **Needs: [01's decision](01-settle-what-a-role-is.md)**, because a permission class has to name a
classification, and 01 decides which one is real.

- [ ] **1.1 List every view class and the permission that applies to it**
  - One row per view class: the app, the class name, the `path:line`, the permission class in force,
    and where it comes from (declared on the class, inherited from a base, or the global default).
  - Start from the counts that motivated this plan, and confirm them rather than trusting them:
    ```
    cd /home/molef/Work/attica
    grep -rnE '^class .*(APIView|ViewSet|ListAPIView|GenericAPIView)' backend/main --include=*.py
    grep -rn 'permission_classes' backend/main --include=*.py
    ```
  - Expected: 95 view classes and 79 `permission_classes` lines. A different count means the
    codebase moved since 2026-08-27 and the rest of this plan is reading a stale picture.
  - Done when: no row says unknown. A row whose permission cannot be determined by reading is the
    finding, not an acceptable gap.

- [ ] **1.2 Mark each row public-on-purpose or private**
  - Public on purpose: registration, login, token refresh, public listings an anonymous visitor is
    meant to browse.
  - Everything else is private, including anything under `scheduling`.
  - 💡 `/code-audit` is the one whole-codebase sweep in the library and would produce this pass
    faster than reading view by view. Installed ✅.

- [ ] **1.3 Write the table into the plan tree**
  - Save beside this plan as `permission-audit.md`.
  - It is the evidence for task 2, and the thing a later reviewer checks against.

▶ **Next: [task 2](#2--flip-the-default-and-declare-the-exceptions)**.

### 2. 🔁 Flip the default and declare the exceptions

◀ **Needs: [task 1](#1--audit-what-is-actually-protected)**.

- [ ] **2.1 Add `AllowAny` explicitly to every row marked public on purpose**
  - Do this first, while the default is still open, so the change is a no-op at runtime and cannot
    break anything.

- [ ] **2.2 Change `DEFAULT_PERMISSION_CLASSES` to `IsAuthenticated`**
  - In `backend/main/main/settings.py`, in the `REST_FRAMEWORK` block.

- [ ] **2.3 Run both suites and record what turned red**
  - `python manage.py test` and `npx playwright test`.
  - Two backend tests already fail before this change
    ([the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints)),
    so a red run is only evidence if the failures are new ones.
  - Any new failure names a view the audit marked private that something calls anonymously. Decide
    per case: the caller is wrong, or the row was.

▶ **Next: [task 3](#3--put-a-limit-on-the-two-endpoints-that-need-one)**.

### 3. 🚦 Put a limit on the two endpoints that need one

◀ **Needs: [task 2](#2--flip-the-default-and-declare-the-exceptions)**.

- [ ] **3.1 Throttle the login endpoint**
  - Confirm first that nothing already does it:
    ```
    cd /home/molef/Work/attica
    grep -rn 'DEFAULT_THROTTLE\|Throttle' backend/main --include=*.py
    ```
  - Expected output: nothing. Anything printed means a throttle exists and this task is a revision
    rather than an addition.
  - Pick a rate. Write the rate and the reason for that number in the same commit.

- [ ] **3.2 Throttle the availability search**
  - It is the most expensive read in the application and the one an anonymous visitor can reach.
  - Same rule: a number, and why that number.

- [ ] **3.3 Record both numbers as revisable**
  - Note in `permission-audit.md` that both rates are guesses until
    [the numbers task](../../the-system-in-layers/plans/01-read-the-system-before-drawing-it.md)
    produces real traffic figures.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 3](#3--put-a-limit-on-the-two-endpoints-that-need-one)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit.
- [ ] **Run the following prompt:** `/context-pulse @context` if the audit introduced a word nobody
      has defined. "Public on purpose" is a candidate.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 🕵️ Try the door yourself

◀ **Needs: [task 2](#2--flip-the-default-and-declare-the-exceptions)**.

The audit is a reading exercise. This is the part that proves it, and it takes ten minutes.

4.1 **Pick three private endpoints from the audit table**
   - One from `scheduling`, one from `chat`, one from anywhere else.
   - Write the three URLs down before you start.

4.2 **Call each one with no token at all**
   - In a terminal: `curl -i http://127.0.0.1:8000/api/<path>/`
   - Expected result: `HTTP/1.1 401 Unauthorized` on all three.
   - ✅ 401: the flip took.
   - ❌ 200 with real data: that endpoint is still public. Find it in the audit table and work out
     whether the row was wrong or the change did not reach it.
   - ❌ 403 rather than 401: not a failure, but note which it was. The two mean different things and
     the frontend may be branching on one of them.

4.3 **Call the login endpoint eleven times with a wrong password**
   - Do this after task 3.1 is done.
   - Expected result: the first several return 401, and one of them returns `429 Too Many Requests`.
   - ✅ A 429 appears: the throttle is live. Note which attempt number triggered it.
   - ❌ No 429 after twenty attempts: the throttle class is configured but not applied to that view.
     `DEFAULT_THROTTLE_CLASSES` in settings and a `throttle_classes` on the view are different
     switches, and only the second one is definitely reaching this endpoint.

4.4 **Log in through the browser as each of the five roles**
   - `http://localhost:5173/login`. If [03](03-prove-it-and-write-it-down.md) has already run, follow
     the recipe it produced at `runbook/driving-the-app/becoming-each-role.md`; if not, the five
     accounts are in
     [seeding and resetting data](../../../../../runbook/preparing-the-data/seeding-and-resetting-data.md).
   - Expected result: all five still reach their dashboards.
   - ❌ A dashboard is empty where it was not before: a read the dashboard depends on is now blocked.
     The Network tab names it. That endpoint was public and something anonymous was relying on it.

▶ **Next: [task 3](#3--put-a-limit-on-the-two-endpoints-that-need-one)** if you have not run it yet,
otherwise the close out.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

This plan is done when three private endpoints return 401 to an anonymous curl, the login endpoint
returns 429 under repeated failure, and all five roles still reach their dashboards in a browser.

The audit table alone does not close it. A table saying every endpoint is protected, with nothing
tried against a running server, is the exact claim this scope exists to stop making.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| The permission audit table | `plans/create-event-end-to-end/plans/getting-in/permission-audit.md` | not started |
| `DEFAULT_PERMISSION_CLASSES` set to `IsAuthenticated` | `backend/main/main/settings.py` | not started |
| Explicit `AllowAny` on every public endpoint | across `backend/main/*/views.py` | not started |
| A throttle on login and on availability search, with rates recorded | `backend/main/main/settings.py` and the two views | not started |
| Three curl results and one 429, written down | `permission-audit.md` | not started |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/getting-in/plans/04-close-the-open-door.md` | task 0, before any work | Conformance and thin instructions reported |
| Sweep the views | `/code-audit` | task 1.2 | The audit table produced by sweep rather than by reading |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Define a new word | `/context-pulse @context` | the close out, if the audit named one | `context/` carries it |
| Close the scope | `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in` | the close out | All four plans ✅ |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the environment overview](../../../../../environment/overview.md): unrevokable tokens, [websocket](../../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> auth by query parameter, the [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> ports.
- [the scouted concepts](../../../../../ideas/what-a-world-class-attica-needs/SCOUTED-CONCEPTS.md): where this plan came from, and the Gatekeeper pattern it implements.
- `backend/main/main/settings.py`: the `REST_FRAMEWORK` block this plan changes.
- [01 Settle what a role is](01-settle-what-a-role-is.md): the decision every permission class here has to name.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

[03 Prove it and write it down](03-prove-it-and-write-it-down.md), which closes the scope. If 03 is
already done, re-run its instruction 3 after this plan lands: flipping the default is exactly the
kind of change that breaks a dashboard silently, and five logins is the check that catches it.

## Error Matrix

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet — populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| An endpoint still returns 200 anonymously after the default was flipped | `curl`, in instruction 4.2 | The view declares `AllowAny` from an earlier pass, or inherits it from a base class. The audit table's "where it comes from" column is what resolves it. |
| Repeated failed logins never return 429 | `curl`, in instruction 4.3 | `DEFAULT_THROTTLE_CLASSES` is set but the view has its own `throttle_classes`, or the scope name has no matching rate. Check both. |
| A dashboard renders empty after the flip | The browser, in instruction 4.4 | A read that dashboard depends on was public and is now blocked. The Network tab names the request. |
| Every request fails on [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub> rather than on permissions | The browser, when Vite bound 5174 | `CORS_ALLOWED_ORIGINS` names 5173 and 3000 only. Free 5173 and restart Vite. |
