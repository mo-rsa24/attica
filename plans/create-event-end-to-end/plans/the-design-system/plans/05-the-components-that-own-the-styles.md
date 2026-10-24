# 🧱 The Components That Own The Styles

Step 5 of 7 in this scope. Waits on [02](02-name-the-colours-and-the-spacing.md),
[03](03-give-type-its-roles.md) and [04](04-say-what-moves-and-what-does-not.md), all three of which
run at the same time. Next:
[06-cards-that-answer-to-their-container.md](06-cards-that-answer-to-their-container.md).

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
- [References](#references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [the design system](../MASTER_PLAN.md). Fifth of seven, and the first that renders anything
different.

Waits on all three vocabulary plans, because a button consumes a colour, a type role and a duration
band, and building it from two of the three means building it twice.

[06](06-cards-that-answer-to-their-container.md) waits on this one, because the components that go
inside drawers have to exist before they can be taught to read their container.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 26.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

**There is no shared component layer.** 292 `<button>` elements live in 64 files, with 278 distinct
`px-N py-N` className strings across the tree. The three files whose names contain "Button" are
`FloatingCreateEventButton.jsx`, `FloatingActionButton.jsx` and `NewPostButton.jsx`, each one piece
of specific screen furniture rather than a primitive anything else uses.

**The clearest instance is the card skeleton, which exists four times.**
`frontend/src/Artists.jsx:24`, `frontend/src/Events.jsx:27` and `frontend/src/Services.jsx:35` each
define their own near-identical skeleton locally and render it at `:232`, `:236` and `:341`. A
fourth, `frontend/src/ServiceCardSkeleton.jsx`, is a complete standalone component that no file
imports. Somebody did extract the shared version, and the pages went on using their own copies
anyway, which is what happens when a shared layer has no home and no rule.

**That is the whole of the loading state in this application.** Three list pages have a skeleton.
Every other screen has nothing, or a bare spinner: `animate-spin` appears 22 times and
`animate-pulse` 12.

**This plan builds the layer the pages consume.** The button, the card, the one skeleton that
replaces four, and explicit status text for an action that can be in flight. It does not rewrite
110 files: it builds the components, migrates the sites that are already duplicating them, and
leaves the rest to be picked up when they are next touched.

**Which states an action can be in is not this plan's to decide.** That belongs to the scopes that
own the domain, and the rule this plan works under is in
[the decisions taken here](../decisions-taken-here.md#neither-d1-nor-d2-reaches-this-scope-and-the-one-place-that-nearly-looks-like-it-does):
build the mechanism, read the list.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The frontend is its own hand-started process**, per
  [the execution model](../../../../../environment/overview.md#execution-model). Instruction 4 needs
  `npm run dev` running.
- **There are two [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> clients with no bridge between them**, per
  [the access paths](../../../../../environment/overview.md#access-paths). One goes through the Vite
  [proxy](../../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> on relative paths and one hardcodes `http://127.0.0.1:8000` in
  `frontend/src/utils/useAxios.js:10` and needs [CORS](../../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub>. This matters here because the in-flight and
  failed states a status component displays are produced by two clients that fail differently, and a
  component that assumes one shape of error will show nothing for the other.
- **The Playwright suite runs logged out today**, which `fixing-create-event` fixes. So a browser
  test is not evidence in this scope until that lands, and every check here is a person at a screen.
- **Nothing here touches the backend**, except that instruction 4 needs the stack up to see a real
  loading state.

**One fact this plan needs is not in `environment/` and must not be inferred**: there is no unit test
runner in this repository. `frontend/package.json` carries `@playwright/test` and no vitest and no
jest. A shared component layer with no test is the normal case here, and the check is a person
building one card in ten minutes rather than a suite going green.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**A small layer that pages actually use beats a large one they route around.**

The temptation is to build twenty components because a design system is supposed to have twenty. The
evidence says four: the button, the card, the one skeleton, and the status row. Each of those is
duplicated in the tree today, which is the only honest reason to extract something.

**The orphaned skeleton is the warning, not a tidying job.**

`ServiceCardSkeleton.jsx` is a complete, correct, shared component that nothing imports. Somebody
did the extraction and the pages carried on with their copies. So extracting is not the hard part
and building the component is not the deliverable: migrating the duplicating sites and writing down
where the layer lives is.

**A migration nobody can review is a migration nobody reviews.**

This plan migrates the sites that already duplicate a component it built, and stops. Rewriting every
one of the 292 buttons is a large diff with no reviewer, and the count falls naturally as files are
touched. What matters is that the next button written is the shared one.

**Status text is words, and a spinner is not words.**

A spinner says something is happening. It does not say what, whether it can be cancelled, or what
happens if it fails. This app has 22 spinners and three skeletons. The component this plan builds
takes a state and shows the words for it; **which states exist comes from the domain**, and where
none is defined yet, the plan records the states it found and where it found them rather than
inventing a set a later decision will contradict.

**A skeleton that does not preserve geometry is worse than no skeleton.**

The point of a skeleton is that the layout does not jump when content arrives. A generic grey box
that is the wrong size moves everything twice: once when it appears and once when it is replaced.
The existing four are good at this, which is why the one replacing them is derived from them rather
than designed fresh.

**Where the layer lives is a decision this plan makes and writes down.**

`frontend/src/` currently mixes pages, components and one orphaned skeleton at the top level, with
five folders under `components/`. The runbook recipe in
[07](07-prove-it-and-write-it-down.md) has to name a path, so this plan names it.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**Extracting the component is the easy half**, and `ServiceCardSkeleton.jsx` is the proof: it was
extracted, it is correct, and three pages went on using their own copies because nothing said where
the shared one lived or that it was the one to use.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Plans 02, 03 and 04 produce a vocabulary. A vocabulary with nothing speaking it is a document, and
documents that describe how things should look are ignored by the second sprint.

The components are what make the vocabulary load-bearing. A page that uses the shared button gets
the right colour, the right type role and the right duration band without its author knowing any of
their names, which is the only version of a design system that survives a deadline.

It is also what `the-event-workspace`, scope 11, builds screens out of. That scope has a persistent
shell, autosave with a visible save state, and a convergence dashboard to build, all of which need
a button, a card, a skeleton and a way to say "saving" in words. Every one of those it has to invent
is one more place the app disagrees with itself.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  BEFORE

  Artists.jsx:24   ─► its own ArtistCardSkeleton   ─► rendered at :232
  Events.jsx:27    ─► its own EventCardSkeleton    ─► rendered at :236
  Services.jsx:35  ─► its own ServiceCardSkeleton  ─► rendered at :341
  ServiceCardSkeleton.jsx  ─► shared, correct, imported by NOBODY

  292 <button> in 64 files, 278 distinct px/py strings, no shared Button
  22 spinners, 3 skeletons, no words anywhere

  AFTER

        tokens (02)    type roles (03)    bands (04)
              └──────────────┼──────────────┘
                             ▼
                    the shared component layer
                    ├── button
                    ├── card
                    ├── skeleton   (one, geometry preserved)
                    └── status row (words, from the domain's own states)
                             │
              pages consume it; nobody writes a raw colour

  and NOT: 292 buttons rewritten. The sites that already duplicate, and no more.
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

Two pieces in this scope's map are closed by what this plan builds.

**Subject: one button, sixty-four times.** The grid of near-identical buttons and the empty framed
slot where the shared one should be.
[Piece 3](../diagram-prompts.md#piece-3-one-button-sixty-four-times-planned--not-rendered).
Save as `../diagrams/subject-03-one-button-sixty-four-times.png`. *(image not yet generated)*

**Subject: the same skeleton, four times.** Three pages each with their own copy and the orphan with
no arrow touching it.
[Piece 4](../diagram-prompts.md#piece-4-the-same-skeleton-four-times-planned--not-rendered).
Save as `../diagrams/subject-04-the-same-skeleton-four-times.png`. *(image not yet generated)*

The middle panel of this scope's subject capstone is what this plan builds, and it is the picture to
check the result against.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

**One shared component folder**, at a path this plan names, holding four components, each consuming
tokens and roles and bands and holding no raw value of its own.

1. **The button.** The variants the app actually uses, derived from the 278 distinct padding strings
   rather than proposed: at minimum a primary, a secondary and a quiet one, each with its hover,
   its disabled state and its in-flight state.
2. **The card.** The surface, the border, the radius and the elevation, as one container.
3. **The skeleton.** One component replacing four, taking the shape of the card it stands in so the
   layout does not move when content arrives.
4. **The status row.** Takes a state and shows the words for it. The states come from the domain,
   read rather than invented.

**One placement note** in `artifacts/notes/the-design-system/how-things-move.md`'s sibling,
`artifacts/notes/the-design-system/where-the-components-live.md`, naming the folder, the rule for
what belongs in it, and what happens to the three existing files with "Button" in their names.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 3](../MASTER_PLAN.md#objectives), making a component the thing that
owns a style and a page the thing that arranges components.

**Goal.** Four components exist in one named folder, each holding no raw colour, size, radius,
shadow or duration; the four card skeletons are one and the three pages import it; the orphan is
gone; the button's variants are derived from what the app uses; and the status row's states were
read from the domain rather than invented.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/05-the-components-that-own-the-styles.md`

▶ **Next: [task 1.1](#1--read-the-vocabulary-and-decide-where-the-layer-lives)**.

### 1. 📖 Read the vocabulary and decide where the layer lives

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read all three vocabulary outputs and confirm each exists**
  - The token file from [02](02-name-the-colours-and-the-spacing.md), the type roles from
    [03](03-give-type-its-roles.md), the duration bands from
    [04](04-say-what-moves-and-what-does-not.md).
  - Produces: a list of every token, role and band available, so a component is built from what
    exists rather than from what it needs.
  - Done when: all three exist. ❌ If any one is missing, stop. A button built from two of the three
    is a button built twice, and the second build is the one that gets skipped.

- [ ] **1.2 Decide where the shared layer lives and write it down**
  - `frontend/src/` currently mixes pages and components at the top level, with `booking/`, `chat/`,
    `create/`, `notifications/` and `scheduling/` under `components/`. Those five are grouped by
    feature; this layer is not a feature.
  - Produces: `artifacts/notes/the-design-system/where-the-components-live.md`, naming the folder,
    the rule for what belongs in it, and what happens to `FloatingCreateEventButton.jsx`,
    `FloatingActionButton.jsx` and `NewPostButton.jsx`, which are screen furniture rather than
    primitives.
  - Done when: the path is named and the rule can be applied by somebody who was not here. This is
    the path [07](07-prove-it-and-write-it-down.md)'s runbook recipe tells people to open.

- [ ] **1.3 Read the states an action can actually be in, from wherever they are defined**
  - Read `frontend/src/components/booking/BookingStatusBadge.jsx` and the booking request page, and
    check whether `one-booking-truth` or `contention-and-holds` have taken decisions that name a
    state set.
  - Produces: the list of states the interface currently displays, each with the file it was read
    from, and a line saying whether that list is settled or expected to change.
  - Done when: the list is a reading rather than a proposal. **Do not invent a state set here.** D1
    and D2 decide which states exist, and a component shipped with an invented set is a set that
    gets built on. The reasoning is in
    [the decisions taken here](../decisions-taken-here.md#neither-d1-nor-d2-reaches-this-scope-and-the-one-place-that-nearly-looks-like-it-does).
  - ❌ If no state set is defined anywhere, build the status row to take a state and a words map from
    its caller, record that decision, and say in the notes that the map moves into the domain's own
    files when there is one.

▶ **Next: [task 2.1](#2--build-the-four-components)**.

### 2. 🧱 Build the four components

◀ **Needs: [task 1](#1--read-the-vocabulary-and-decide-where-the-layer-lives)**.

- [ ] **2.1 Derive the button's variants from what the app already uses**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -roh '<button[^>]*className="[^"]*"' --include=*.jsx . | sed 's/.*className="//;s/"$//' | sort | uniq -c | sort -rn | head -40
  ```
  - Produces: the most-repeated button class strings, which are the variants the app actually has.
  - Done when: the variant list comes from that output. A variant set proposed from a design-system
    checklist will contain three the app does not need and miss one it does.

- [ ] **2.2 Build the button, the card and the skeleton**
  - Every visual value comes from a token, a role or a band. No hex, no `text-sm`, no `rounded-xl`,
    no `duration-300` written directly.
  - The skeleton is derived from the three existing local copies at `Artists.jsx:24`,
    `Events.jsx:27` and `Services.jsx:35`, which already preserve their cards' geometry, and from
    the orphan at `ServiceCardSkeleton.jsx`. It takes the shape of the card it stands in rather than
    being one fixed grey box.
  - Done when: a search for a raw colour, size, radius, shadow or duration inside the new folder
    returns nothing:
    ```
    cd /home/molef/Work/attica/frontend/src
    grep -rn "#[0-9a-fA-F]\{3,8\}\|text-\(xs\|sm\|base\|lg\|xl\|[2-7]xl\)\b\|rounded-\|shadow-\|duration-[0-9]" <the folder from task 1.2>
    ```
    An empty result is the criterion. A non-empty one names exactly which value escaped.

- [ ] **2.3 Build the status row**
  - Takes a state and shows the words for it, using the type roles and the status colours from
    [02](02-name-the-colours-and-the-spacing.md).
  - The in-flight case is words plus, optionally, a spinner. Never a spinner alone.
  - The failed case says what failed and what to do, and handles both [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> clients' error shapes,
    since the [proxy](../../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> client and the `127.0.0.1:8000` client fail differently per
    [the access paths](../../../../../environment/overview.md#access-paths).
  - Done when: the component takes its state list from its caller per
    [task 1.3](#1--read-the-vocabulary-and-decide-where-the-layer-lives) and hard-codes no domain
    state of its own.

- [ ] **2.4 Migrate the four skeletons to one and delete the orphan**
  - Replace the local definitions at `Artists.jsx:24`, `Events.jsx:27` and `Services.jsx:35` with an
    import of the new one, keeping each page's card geometry.
  - Delete `frontend/src/ServiceCardSkeleton.jsx`, which no file imports.
  - Done when: `grep -rn "CardSkeleton" frontend/src --include=*.jsx` shows one definition and three
    imports. **Confirm the file is tracked by git before deleting it** (`git ls-files
    frontend/src/ServiceCardSkeleton.jsx`); if it is not tracked, move it aside rather than deleting
    it, because there is no undo for an untracked file.

- [ ] **2.5 Migrate the sites that already duplicate a component this plan built, and stop there**
  - The three list pages for the skeleton. For the button, migrate the files where the same variant
    string appears three or more times, from [task 2.1](#2--build-the-four-components)'s output.
  - Produces: a migrated set, with a written list of what was migrated and what was left.
  - Done when: the list of what was left exists. **Do not rewrite all 292 buttons.** A diff nobody
    can review is a diff nobody reviews, and the count falls as files are touched.

- [ ] **2.6 Take the after-numbers with the same commands**
  - Re-run [task 2.5 of plan 01](01-measure-it-and-take-the-stack-decision.md#2--pin-the-eight-counting-commands-and-run-them),
    unchanged: the button count, the file count, the distinct padding strings.
  - Done when: the numbers are recorded beside the before-numbers, with the count of files migrated
    beside them so the change is attributable. This is the first plan in the scope where the numbers
    are expected to move.

▶ **Next: [instruction 4.1](#4--build-one-card-and-time-yourself)**.

### 3. ✍️ Write down what exists now

◀ **Needs: [instruction 4](#4--build-one-card-and-time-yourself)** done, so the notes describe what
was found to work rather than what was intended.

- [ ] **3.1 Finish the placement note**
  - Add to `artifacts/notes/the-design-system/where-the-components-live.md`: the four components with
    what each is for, the props each takes, and one worked example of building a card from them.
  - Done when: the worked example is code somebody can copy, not a description of code.
    [07](07-prove-it-and-write-it-down.md)'s runbook recipe is written from this section.

- [ ] **3.2 Record what instruction 4 found**
  - Into `artifacts/notes/the-design-system/where-the-components-live.md`, in its own section: the
    time the ten-minute test took, every question the builder had to ask or guess, and any property
    where the new card differed from the existing one.
  - Done when: each question is either answered elsewhere in the placement note or listed there as a
    known gap. The questions are the actual output of that test; the time is only the headline, and
    [07](07-prove-it-and-write-it-down.md) writes the first runbook recipe from them.

- [ ] **3.3 Write the grouping's card entry**
  - Add the placement note to `artifacts/notes/the-design-system/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`.
  - Done when: the provenance is in the card as prose.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 3](#3--write-down-what-exists-now)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. ⏱️ Build one card and time yourself

◀ **Needs: [task 2](#2--build-the-four-components)** done, so there is a layer to build from.

This is the test the whole scope is aimed at, and it only works once. Do it before reading the
components' source.

4.1 **Set the conditions honestly**
   - Open only the token file, the type roles, the duration bands and
     `artifacts/notes/the-design-system/where-the-components-live.md`.
   - Do not open any existing card. Do not open the new components' source. Do not ask anyone.
   - Start a timer.

4.2 **Build one card**
   - A card with a title, a muted line under it, and a primary action. Put it on a scratch route.
   - Start the frontend if it is not running: `cd /home/molef/Work/attica/frontend && npm run dev`.
   - ✅ It renders and looks like it belongs in the app: the layer works. Stop the timer and write
     the number down.
   - ❌ You had to open an existing card to find something out: stop the timer anyway and write down
     exactly what you needed and could not find. **That is the deliverable of this step**, more than
     the time is, and it goes into [task 3.2](#3--write-down-what-exists-now).

4.3 **Screenshot it beside an existing card**
   - Put your new card next to a provider card from the Artists page.
   - ✅ They look like the same system: save the capture as
     `artifacts/figures/the-design-system/one-card-built-from-the-layer.png`.
   - ❌ They look different: note which property differs. If it is a property this scope named, a
     token is wrong. If it is a property nothing named, that is a gap in the vocabulary and it
     belongs in the notes.

4.4 **Watch a real loading state**
   - Bring the whole stack up per
     [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md),
     open the Artists page, and reload with the DevTools Network tab throttled to Slow 3G so the
     skeleton is visible for long enough to look at.
   - ✅ The skeleton appears and the layout does not jump when the real cards arrive: geometry is
     preserved. Screenshot the skeleton state as
     `artifacts/figures/the-design-system/skeleton-preserves-geometry.png`.
   - ❌ The layout jumps: the skeleton is the wrong size for the card it stands in. That is the
     specific failure a skeleton exists to prevent, and it is worth fixing before ticking task 2.4.

4.5 **Say what a spinner alone is still doing on your screens**
   - Search the app for a spinning circle with no words next to it. `animate-spin` appears 22 times.
   - ✅ You can name the screens that still have one: they are the list
     `the-event-workspace` inherits, and it belongs in the notes.
   - ❌ You cannot find any: say so. The count says 22, so a discrepancy is worth a line.

4.6 **Delete the scratch route**
   - Remove the card and its temporary route once the screenshots are saved.

▶ **Next: [task 3.1](#3--write-down-what-exists-now)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody built a card from the notes alone, in about ten minutes, without
> opening an existing card, and it looks like it belongs beside one.

Pass:

- Four components exist in one named folder, and a search for a raw colour, size, radius, shadow or
  duration inside that folder returns nothing.
- The button's variants were derived from the app's own most-repeated class strings.
- One card skeleton, imported by the three list pages, with the orphan gone and confirmed tracked by
  git before it was deleted.
- The status row takes its state list from its caller and hard-codes no domain state.
- The sites that already duplicated a component are migrated, and the list of what was left is
  written down.
- The ten-minute test was performed, its time recorded, and every question the builder had to guess
  is either answered in the notes or listed as a gap.
- The skeleton was watched under a throttled reload and the layout did not jump.
- The after-numbers are recorded with the same commands as the before-numbers.

Fail, and what it means:

- A component holding a raw hex value or a `rounded-xl`. Then the vocabulary is decorative and the
  component is the same problem in a new file.
- The status row shipped with an invented state set. D1 and D2 decide which states exist, and an
  invented set is one that other scopes will build on before anyone notices it was a guess.
- All 292 buttons rewritten. That diff has no reviewer, and the sites this plan was meant to prove
  the layer on are buried in it.
- The ten-minute test skipped because the components are obviously fine to the person who wrote
  them. The test is about the notes, not the code.
- The orphan deleted without checking it was tracked. There is no undo for an untracked file.

Partial pass is acceptable on the button migration alone. The skeleton migrated and the button
built-but-not-yet-adopted is a real result, as long as the list of unmigrated sites exists.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The button, the card, the skeleton, the status row | the folder named in task 1.2 | — | not started |
| Where the components live, and the worked example | `artifacts/notes/the-design-system/where-the-components-live.md` | — | not started |
| One skeleton replacing four, orphan removed | `frontend/src/Artists.jsx`, `Events.jsx`, `Services.jsx` | — | not started |
| The states the interface displays, read with their sources | inside the placement note | — | not started |
| What was migrated and what was left | inside the placement note | — | not started |
| The after-numbers, with the same commands | inside the placement note | — | not started |
| What the ten-minute test showed: the time, every question the builder had to guess, and any property that differed from an existing card | inside the placement note | — | not started |
| One card built from the layer, beside an existing card | `artifacts/figures/the-design-system/one-card-built-from-the-layer.png` | — | not started |
| The skeleton holding the card's geometry | `artifacts/figures/the-design-system/skeleton-preserves-geometry.png` | — | not started |
| One button, sixty-four times | [piece 3](../diagram-prompts.md#piece-3-one-button-sixty-four-times-planned--not-rendered) → `../diagrams/subject-03-one-button-sixty-four-times.png` | subject | ⏳ not rendered |
| The same skeleton, four times | [piece 4](../diagram-prompts.md#piece-4-the-same-skeleton-four-times-planned--not-rendered) → `../diagrams/subject-04-the-same-skeleton-four-times.png` | subject | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/05-the-components-that-own-the-styles.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the three pages that each wrote their own skeleton | `/unpack frontend/src/Services.jsx` | task 2.2 | The local skeleton, the grid it stands in and the card it imitates read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the decisions taken here](../decisions-taken-here.md#neither-d1-nor-d2-reaches-this-scope-and-the-one-place-that-nearly-looks-like-it-does): the build-the-mechanism-read-the-list rule for status text.
- [the access paths](../../../../../environment/overview.md#access-paths): the two [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> clients and why they fail differently.
- `frontend/src/ServiceCardSkeleton.jsx`: the shared component nothing imports.
- `frontend/src/Artists.jsx:24`, `frontend/src/Events.jsx:27`, `frontend/src/Services.jsx:35`: the three local copies.
- `frontend/src/components/booking/BookingStatusBadge.jsx`: where the interface currently says what a state is.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[06-cards-that-answer-to-their-container.md](06-cards-that-answer-to-their-container.md), which
teaches these components to read the space they are in rather than the window, and decides mobile as
its own layout.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits the plan as a whole. The work is an extraction checked by a person building
something from the notes alone.
   also: `/unpack frontend/src/Services.jsx` at task 2.2, and `/demonstrate` is worth considering
   for instruction 4.3 and 4.4 if the screenshots need to be presented to somebody else rather than
   filed.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A shared component exists and nothing imports it | `frontend/src/ServiceCardSkeleton.jsx` | Extraction is not adoption. Migrate the duplicating sites in the same task and write down where the layer lives. |
| An error shape a component does not recognise | The status row, when the call went through the other [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> client | Two clients with no bridge, per the access paths. Handle both shapes or say which one the component supports. |
| The browser suite runs logged out | Any attempt to check this plan with Playwright | `fixing-create-event` fixes it. Until then the check is a person at a screen. |
| A skeleton makes the layout jump | Instruction 4.4, on a throttled reload | The skeleton is the wrong size for its card. Derive it from the card rather than from a generic box. |
