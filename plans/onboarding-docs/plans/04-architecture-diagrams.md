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

- The Vite dev proxy forwards `/ws` with `ws: true`, so [websockets](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> do reach the backend in
  development. An older note claiming otherwise is wrong.
- Websockets authenticate by `?token=<jwt>` query parameter through `WebSocketJWTAuthMiddleware`,
  not by an `Authorization` header. This is the subject of diagram 1 and getting it backwards would
  make the diagram useless.
- Tokens live in `localStorage` under the single key `tokens`, holding `{access, refresh}`.
- [Redis](../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> carries the channel layer on its default database. It must be running or the broadcast half
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
how a [websocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> authenticates, why there are two paths for one message, how a token refresh is
invisible to the user, and how a multi-step form survives the browser closing.

Each is readable by someone with no [prior](../../../../../Obsidian/Mathematics/Statistics/Bayesian%20Inference/Prior%20Distribution.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/probabilistic-machine-learning-an-introduction.pdf#page=150 "Probabilistic machine learning: an introduction, sections 4.6.1 and 4.6.2, Works with numbers: a conjugate prior keeps the posterior in the prior's own famil..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=519 "Introduction to probability for data science, sections 8.3.1 and 8.3.2, The trio of likelihood, prior and posterior, the prior that ML lacks and MAP adds (pa..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/mathematics-for-machine-learning.pdf#page=191 "Mathematics for machine learning, section 6.3, The prior p(x) as what is known about an unobserved variable before observing y, inside Bayes' theorem."), [▶1](https://www.youtube.com/watch?v=5Vawq2b5F7c&t=560s "TileStats, Bayesian statistics, the basics, 9:20 to 12:47, The prior distribution, in the chapter of that name, between Bayes' theorem and computing the post..."), [▶2](https://www.youtube.com/watch?v=-1dYY43DRMA&t=786s "ritvikmath, What the Heck is Bayesian Stats ??, 13:06 to 16:07, Updating prior beliefs with the data. Chapter-timed."), [◆](../../../../../goal-setting/learning/deep-learning/generative-models/03-sampling-from-a-graph/plans/25-map-derived.md "Derive MAP, and draw the prior as a parent of θ, deep-learning/generative-models/03-sampling-from-a-graph, plan 25. A Beta(2, 2) prior on a coin's θ, drawn a...")</sub> Attica knowledge and stands on its own.

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
`jwt-refresh.md`, `event-wizard.md`. Each readable with no [prior](../../../../../Obsidian/Mathematics/Statistics/Bayesian%20Inference/Prior%20Distribution.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/probabilistic-machine-learning-an-introduction.pdf#page=150 "Probabilistic machine learning: an introduction, sections 4.6.1 and 4.6.2, Works with numbers: a conjugate prior keeps the posterior in the prior's own famil..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=519 "Introduction to probability for data science, sections 8.3.1 and 8.3.2, The trio of likelihood, prior and posterior, the prior that ML lacks and MAP adds (pa..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/mathematics-for-machine-learning.pdf#page=191 "Mathematics for machine learning, section 6.3, The prior p(x) as what is known about an unobserved variable before observing y, inside Bayes' theorem."), [▶1](https://www.youtube.com/watch?v=5Vawq2b5F7c&t=560s "TileStats, Bayesian statistics, the basics, 9:20 to 12:47, The prior distribution, in the chapter of that name, between Bayes' theorem and computing the post..."), [▶2](https://www.youtube.com/watch?v=-1dYY43DRMA&t=786s "ritvikmath, What the Heck is Bayesian Stats ??, 13:06 to 16:07, Updating prior beliefs with the data. Chapter-timed."), [◆](../../../../../goal-setting/learning/deep-learning/generative-models/03-sampling-from-a-graph/plans/25-map-derived.md "Derive MAP, and draw the prior as a parent of θ, deep-learning/generative-models/03-sampling-from-a-graph, plan 25. A Beta(2, 2) prior on a coin's θ, drawn a...")</sub> Attica knowledge, self-contained,
and accompanied by its explanation.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/04-architecture-diagrams.md`

▶ **Next: [task 1.1](#1--draw-the-four-diagrams)**.

### 1. 🎨 Draw the four diagrams

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> [authentication](../../../../../Obsidian/Information%20Technology/Security/Authentication.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=651 "Computer networking: a top-down approach, section 8.4, End-point authentication, Builds an authentication protocol in five tries, ap1.0 to ap4.0: a bare clai..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works a concrete case: user A's session data lives on server 1, so a request routed to server 2 fails..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=403 "System design big archive, 5 REST API Authentication Methods, Basic authentication, session cookies, signed tokens, OAuth access tokens and API keys side by ..."), [▶1](https://www.youtube.com/watch?v=_t8EPImx9LI&t=240s "Hussein Nasser, Five Password Authentications From Least to Most Secure, Auth Method 1: Authentication password plain text, 4:00 to 8:00, The first of five p..."), [▶2](https://www.youtube.com/watch?v=fyTxwIa-1U0&t=18s "ByteByteGo, Session Vs JWT: The Differences You May Not Know!, Session authentication, 0:18 to 1:23, Session authentication, before the chapter on the JSON W..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06. Section 6.2 logs in to the Django admin with curl, carrying the session cookie and the 'csrftoken' ...")</sub> handshake**
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

- [ ] **1.2 [REST](../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> versus WebSocket**
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

- [ ] **1.3 [JWT](../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> token refresh cycle**
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
  - `ws-auth.md`: the connection is [stateless](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Stateless%20Service.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works user A's case: on a stateful server A's session lives on server 1, so a request routed to serve..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=184 "System design interview, chapter 12, Design a chat system, High-level design, One system split into stateless request and response services behind a load bal..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to stateless authentication, A token that carries its own claims, so the server checks a signature instead of looking..."), [▶1](https://www.youtube.com/watch?v=20tpk8A_xa0&t=101s "Hayk Simonyan, Stateful vs Stateless Architectures Explained, Online shopping example, 1:41 to 2:35, The two architectures applied to one shopping cart, foll..."), [▶2](https://www.youtube.com/watch?v=nFPzI_Qg3FU&t=520s "Hussein Nasser, Stateful vs Stateless Applications (Explained by Example), Stateless Application, 8:40 to 14:44, The stateless version of the application the..."), [◆](../../../../../goal-setting/learning/system-design/scalability/MASTER_PLAN.md "System Design: Scalability, system-design/scalability. Its second objective takes a toy service holding sessions in memory, makes it stateless, and runs it b...")</sub> and JWT-secured. A [session cookie](../../../../../Obsidian/Information%20Technology/Networking/HTTP%20Cookie.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=138 "Computer networking: a top-down approach, section 2.2.4, User-server interaction: cookies, The four parts of cookie technology, then Susan's visits to Amazon..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=322 "System design big archive, Cookies vs Sessions, Data kept in the cookie itself and sent on every request, against a session where the cookie holds only a ses..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=36 "System design big archive, Session, Cookie, JWT, Token, SSO, and OAuth 2.0 Explained in One Diagram, The session ID cookie beside the other ways a site keeps..."), [▶1](https://www.youtube.com/watch?v=sovAIX4doOE&t=255s "Hussein Nasser, HTTP Cookies Crash Course, Section 1: Creating Cookies, 4:15 to 14:38, Creating cookies, the first section of a course that goes on to their ..."), [▶2](https://www.youtube.com/watch?v=aUF2QCEudPo&t=70s "Hussein Nasser, SameSite Cookie Attribute Explained by Example (Strict, Lax, None & No SameSite), SameSite=Strict, 1:10 to 6:00, The strictest SameSite value..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06, section 6.2. Follows the admin login with 'curl -c' and '-b' and a cookie jar file, where the POST ...")</sub> would not survive
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
| [WebSocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> [authentication](../../../../../Obsidian/Information%20Technology/Security/Authentication.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=651 "Computer networking: a top-down approach, section 8.4, End-point authentication, Builds an authentication protocol in five tries, ap1.0 to ap4.0: a bare clai..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works a concrete case: user A's session data lives on server 1, so a request routed to server 2 fails..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=403 "System design big archive, 5 REST API Authentication Methods, Basic authentication, session cookies, signed tokens, OAuth access tokens and API keys side by ..."), [▶1](https://www.youtube.com/watch?v=_t8EPImx9LI&t=240s "Hussein Nasser, Five Password Authentications From Least to Most Secure, Auth Method 1: Authentication password plain text, 4:00 to 8:00, The first of five p..."), [▶2](https://www.youtube.com/watch?v=fyTxwIa-1U0&t=18s "ByteByteGo, Session Vs JWT: The Differences You May Not Know!, Session authentication, 0:18 to 1:23, Session authentication, before the chapter on the JSON W..."), [◆](../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06. Section 6.2 logs in to the Django admin with curl, carrying the session cookie and the 'csrftoken' ...")</sub> handshake | `artifacts/figures/onboarding-a-new-developer/ws-auth.md` | 1.1 | not started |
| [REST](../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, 'POST api/v1/data/shorten' taking the long URL an..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. 'curl' against two running mocks, reading the status line, headers and ...")</sub> versus WebSocket | `artifacts/figures/onboarding-a-new-developer/rest-vs-ws.md` | 1.2 | not started |
| [JWT](../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> token refresh cycle | `artifacts/figures/onboarding-a-new-developer/jwt-refresh.md` | 1.3 | not started |
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

- [The environment overview](../../../environment/overview.md): the [websocket](../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> auth mechanism, the [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves '/static/' itself and forwards '/api/' to the app containe...")</sub>, and where
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
