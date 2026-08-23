# 🎨 Frontend Setup Documentation

Step 3 of 6 in the [running order](../MASTER_PLAN.md#running-order). Waits on step 1
([Source analysis](01-source-analysis.md)). Next: [Cold-start verification](07-cold-start-verification.md).

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
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [References](#references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [onboarding-docs](../MASTER_PLAN.md). Third of six, mirroring
[backend setup docs](02-backend-setup-docs.md) for the frontend. Same three artifacts, same
step order discipline.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

All four tasks are done. The procedure diagram, the deck and the guide exist.

Like plan 02, written is not verified. [Cold-start verification](07-cold-start-verification.md)
walks this guide cold, and has not yet.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../environment/overview.md), which is the authority.

- The Vite dev proxy forwards `/api`, `/vendors`, `/cart`, `/checkout` and `/ws` to
  `http://localhost:8000`. The `/ws` rule is present and works.
- **The frontend reaches the backend two different ways.** Most calls go relative through the proxy,
  but `useAxios` hardcodes `baseURL = 'http://127.0.0.1:8000'` and bypasses it, needing CORS. The
  guide's proxy explanation is incomplete if it does not say this.
- `CORS_ALLOWED_ORIGINS` defaults to ports 5173 and 3000 only. When Vite binds 5174 because 5173 is
  taken, the hardcoded-baseURL calls start failing and nothing says why.
- Tokens live in `localStorage` under the single key `tokens`, holding `{access, refresh}`.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**The proxy explanation is the part most likely to be wrong, because the app does not use it
consistently.**

A guide that says "Vite proxies `/api` to the backend, which is why there is no CORS problem" is
describing half the application. The other half hardcodes an absolute URL and does need CORS. A
reader who believes the simple story will be baffled the first time port 5173 is taken.

**There are two login endpoints and they both work.**

`/api/token/` is Simple JWT's own `TokenObtainPairView` (`main/urls.py:54`). `/api/accounts/login/`
is `LoginAPIView`, which subclasses it (`users/api_urls.py:19`). The app's own login flow uses the
second. Either is correct in the guide; say which one the app actually calls.

**The port is not guaranteed.**

The deck and the guide both say 5173. Vite will silently take 5174 if 5173 is busy, and that is not
a footnote here: it breaks part of the app because of the CORS default above.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

A developer who knows React but not Attica can reach a running frontend, log in as the seeded
organizer, and see real API and websocket data, from these three artifacts alone.

Untested until [07](07-cold-start-verification.md) walks it cold.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

The frontend half looks trivial (`npm install`, `npm run dev`) and is not, because everything
interesting happens at the boundary: the proxy, CORS, where tokens are stored, and how a request
gets its `Authorization` header.

A guide that stops at "the dev server started" has documented the easy part and left the reader at
exactly the point where things break.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

```
  onboarding-source.md ──┬──► /visualize-procedure ──► diagrams/frontend-setup-procedure.md ✅
                         ├──► /progress-brief      ──► slides/frontend-setup.md             ✅
                         └──► written by hand      ──► guides/frontend-setup.md             ✅
                                                              │
                                          npm install → vite → proxy → login → auth verified
                                                              │
                                                              ▼
                                                   07-cold-start-verification
```

## Description: what to build

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Step-by-step setup documentation for the React, Vite and Material-UI frontend: npm install, the Vite
dev server, the backend proxy, and a first successful login, each paired with a visual.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Let a new developer set up the frontend and verify it can actually talk to the backend.

**Goal.** Three cohesive artifacts: a fork/join procedure diagram, a Marp deck of six to eight
slides, and a written guide covering the proxy and the auth flow rather than stopping at the dev
server.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. All four are done.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/onboarding-docs/plans/03-frontend-setup-docs.md`

▶ **Next: [task 1](#1--produce-the-three-artifacts)**.

### 1. 🔧 Produce the three artifacts

- [x] ✅ **Create the procedure diagram (fork/join)**
  - [x] Input: `frontend/` exists, Node 16 or later installed
  - [x] Step 1: `npm install` from `package.json`
  - [x] Step 2: the Vite config and its proxy rules
  - [x] Step 3: start the dev server, `npm run dev`, port 5173
  - [x] Step 4: log in as `e2e-organizer` / `E2eOrganizerPass!23`
  - [x] Step 5: verify auth, tokens in `localStorage`, the Axios interceptor working
  - [x] Output: frontend running, logged in, API data visible
  - [x] Produced into [the frontend setup flowchart](../../../artifacts/figures/onboarding-a-new-developer/frontend-setup-procedure.md)

- [x] ✅ **Create the Marp slide deck**
  - [x] Title, architecture overview, Node and npm, the Vite dev server, the backend proxy, auth and
    JWT, verification
  - [x] Produced by `/progress-brief` in novice mode into [the frontend setup deck](../../../artifacts/decks/onboarding-a-new-developer/frontend-setup.md)

- [x] ✅ **Write the guide**
  - [x] Sections: prerequisites, npm install, Vite configuration, dev server, first login,
    troubleshooting
  - [x] Covers the proxy (what it does and why) and the auth flow end to end
  - [x] Written to [the frontend setup guide](../../../artifacts/notes/onboarding-a-new-developer/frontend-setup.md), 240 lines
  - [ ] **Add the two-HTTP-client split**: the guide's proxy section describes only the relative-URL
    path. `useAxios` hardcodes `http://127.0.0.1:8000` and needs CORS, and a reader who does not
    know that cannot debug the port-5174 case.

- [x] ✅ **Link the three together**

▶ **Next: [instruction 2.1](#2--read-the-three-artifacts-as-a-set)**.

### Close out. 🔄 Record what this plan taught

- [ ] **Run the following prompt:** `/sync-plan-tree @onboarding-docs`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 2. 👀 Read the three artifacts as a set

◀ **Needs: [task 1](#1--produce-the-three-artifacts)**.

2.1 **Open all three and check the step order matches**
   - Expected result: the same five steps, same words, same order across diagram, deck and guide.
   - ✅ they agree. ❌ they diverge, the guide wins.

2.2 **Render the Marp deck and look at it**
   - `npx @marp-team/marp-cli@latest artifacts/decks/onboarding-a-new-developer/frontend-setup.md --preview`.
   - Expected result: every slide fits, nothing overflows.

2.3 **Prove the port claim with the browser open**
   - Start the backend, then `cd frontend && npm run dev`. Note the port Vite prints.
   - Open Chrome DevTools → Network, filtered to Fetch/XHR, with Preserve log on. Log in.
   - Expected result: you can see two kinds of request. Relative ones (`/api/...`) served through
     the proxy, and at least one to `http://127.0.0.1:8000` directly.
   - ✅ both kinds appear, which is the split the guide must explain. ❌ only relative ones, then
     the hardcoded client was not exercised by what you clicked; try a page that uses `useAxios`.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**, then
[cold-start verification](07-cold-start-verification.md).

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

The three artifacts exist, which is what this plan promised.

The guide is not finished while its proxy section describes only half the application. Instruction
2.3 is the check that makes that visible, and the open task in group 1 is what closes it.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Procedure diagram | [The frontend setup flowchart](../../../artifacts/figures/onboarding-a-new-developer/frontend-setup-procedure.md) | written |
| Marp slide deck | [The frontend setup deck](../../../artifacts/decks/onboarding-a-new-developer/frontend-setup.md) | written |
| Written guide, 240 lines | [The frontend setup guide](../../../artifacts/notes/onboarding-a-new-developer/frontend-setup.md) | written, proxy section incomplete |

An earlier draft of the guide lived inside this plan file as a section. It was a placeholder
skeleton, superseded by the real guide above, and has been removed rather than kept as a second copy.

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

Three artifacts move together, as in plan 02. The deck is also merged by
[the merged deck](05-slides.md), so a correction made after step 6 has run must be carried into the
master deck by hand.

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [The environment overview](../../../environment/overview.md): the proxy rules, the two HTTP clients, the CORS
  port binding, and where tokens live.
- `frontend/vite.config.js`: the proxy rules as written.
- `frontend/src/utils/useAxios.js:10`: the hardcoded base URL.
- [The design decisions source](../source/design-decisions.md): why JWT and why a proxy at all.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[Cold-start verification](07-cold-start-verification.md), which walks this guide and plan 02's
on a machine with nothing installed.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/visualize-procedure` or `/flowspec` for the diagram. ▶ `/progress-brief` in novice mode for the
slide content.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| Part of the app fails while the rest works, with no clear cause | First login when 5173 was already taken | Vite bound 5174, which is not in `CORS_ALLOWED_ORIGINS` (defaults to 5173 and 3000). Only the calls using the hardcoded `useAxios` base URL fail; proxied calls are unaffected. Extend the setting or free port 5173. |
| The proxy explanation does not match observed traffic | `artifacts/notes/onboarding-a-new-developer/frontend-setup.md`, proxy section | The app uses two HTTP clients. Most calls go relative through the proxy; `useAxios` hardcodes `http://127.0.0.1:8000` and bypasses it. |
