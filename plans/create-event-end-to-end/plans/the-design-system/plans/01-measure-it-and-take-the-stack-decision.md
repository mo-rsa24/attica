# 🧭 Measure It And Take The Stack Decision

Step 1 of 7 in this scope. Waits on nothing. Next:
[02-name-the-colours-and-the-spacing.md](02-name-the-colours-and-the-spacing.md),
[03-give-type-its-roles.md](03-give-type-its-roles.md) and
[04-say-what-moves-and-what-does-not.md](04-say-what-moves-and-what-does-not.md), which all three
wait on this one and on nothing else.

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to establish](#description-what-to-establish)
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

Scope: [the design system](../MASTER_PLAN.md). First of seven, and it must go first for two separate
reasons.

**It takes D10**, the frontend stack, which is this scope's own decision and is not pre-answered
anywhere in this folder. Every plan after it writes values into a file, and which file that is
depends on the answer.

**It pins the rulers.** Eight numbers describe how bad the current state is, and every later plan is
checked by taking one of them again. A before and an after measured with two different commands
measure nothing, and this scope has eight chances to make that mistake rather than one.

Plans [02](02-name-the-colours-and-the-spacing.md), [03](03-give-type-its-roles.md) and
[04](04-say-what-moves-and-what-does-not.md) all wait on this plan and on none of each other, so
they run at the same time.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 22.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Nothing in this scope is built, and the reason is not neglect. **Both places a style decision could
be written down exist and both are empty.** `frontend/tailwind.config.js` is eleven lines with
`theme: { extend: {} }`. `frontend/src/App.jsx:64` is `const theme = createTheme()`, MUI's default
theme with nothing said about this product, handed to a `ThemeProvider` at `App.jsx:82`. There is
no third place either: neither `frontend/src/index.css` (594 lines) nor `frontend/src/App.css` (54
lines) declares a single CSS custom property.

So the app has two styling systems, both at their factory settings, and 25,852 lines of
`frontend/src` where every style was chosen at the point it was typed.

**This plan takes the stack decision.** It is the one genuine decision this scope contains. The
recommendation on the table is in
[the open decisions](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions)
under D10, and a recommendation is not an answer.

**This plan also produces the eight before-numbers**, each with the command that produced it, in one
file. [02](02-name-the-colours-and-the-spacing.md), [03](03-give-type-its-roles.md),
[04](04-say-what-moves-and-what-does-not.md), [05](05-the-components-that-own-the-styles.md) and
[07](07-prove-it-and-write-it-down.md) each take one of them again at the end.

**Neither D1 nor D2 reaches this plan.** Which booking representation survives and when a hold
starts change what a screen shows; they change nothing about what a colour is called. The reasoning
is in [the decisions taken here](../decisions-taken-here.md#neither-d1-nor-d2-reaches-this-scope-and-the-one-place-that-nearly-looks-like-it-does).

**One other scope is waiting on a single sentence from this decision.** `one-client-truth`, scope
10, takes its [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> decision without waiting for D10 and labels every candidate by what a stack
answer would do to it. This plan owes it the answer to that label, which is
[task 4.3](#4--write-the-decision-record).

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The frontend is its own hand-started process**, per
  [the execution model](../../../../../environment/overview.md#execution-model). Nothing starts it
  and nothing supervises it. Instruction 3 drives a real browser, so `npm run dev` has to be running
  in its own terminal before it starts.
- **Nothing else in this plan needs anything running.** Every count in
  [task 2](#2--pin-the-eight-counting-commands-and-run-them) is a static search over files on disk.
  No backend, no [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub>, no Daphne.
- **Two backend tests already fail**, so a red `python manage.py test` does not mean this plan broke
  something. Nothing here touches the backend at all.

**Two facts this plan needs are not written in `environment/` and must not be inferred.** Both are
established by reading `frontend/package.json` in [task 1](#1--take-the-inventory), and both
constrain the decision rather than decorating it.

**There is no unit test runner in this repository.** `frontend/package.json` carries
`@playwright/test` and no vitest and no jest, and the three test scripts are `test:e2e`,
`test:e2e:ui` and `test:e2e:report`. A candidate whose correctness argument is "we can test the
token mapping" is making a claim about infrastructure that does not exist yet.

**Nothing in the toolchain reports a class name that matches no rule.** ESLint 9 is present with
`@eslint/js`, `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`, none of which reads
`className` strings. This is why five dead class names are live in the tree today, and it is a
criterion in the candidate table rather than a problem for later.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This is a deciding plan and a measuring plan, and it changes no rendered pixel.**

Nothing here installs a package, edits a config or touches a component. The deliverable is a written
decision with its losers, plus eight pinned commands and their answers. That makes it the plan most
likely to be skipped by somebody in a hurry, which is why the measurement lives here: skipping it
costs something in the very next plan rather than three plans later.

**The decision is smaller than it sounds, and the inventory is how you find that out.**

D10 reads like a rewrite. It is not. Material UI is imported by 10 of 110 files, `sx={{` appears 13
times in the whole tree, and the motion library is already installed. The expensive-sounding part of
the decision is a tenth of the app. [Task 1](#1--take-the-inventory) exists so the decision is taken
against that number rather than against the feeling the question produces.

**Tailwind v4 is the part that is genuinely a major version, and it has already leaked in.**

Tailwind is on 3.4.17. Version 4 moves configuration out of `tailwind.config.js`, replaces the
PostCSS plugin with a Vite plugin, and renames the shadow scale. Somebody has already written
`shadow-xs` at `frontend/src/ListingReview.jsx:374`, `:381` and `:389`, which is v4's name for v3's
`shadow-sm`. All three render no shadow at all and nothing said so. That is not a bug to fix in
passing, it is the strongest single piece of evidence that this decision has to be taken out loud.

**Two dependencies are imported by no file.**

`react-calendar` and `websocket` appear in `frontend/package.json` and in no import statement
anywhere in `frontend/src`. An inventory that lists them as part of the stack is describing
something that is not there.

**A before-number without its command is decoration.**

The sibling scope `one-client-truth` recorded 132 fetch call sites across 38 files in its master
plan, and a differently worded grep on the same tree answered 144 across 40. Neither was wrong; they
were two rulers. This scope has eight numbers, so it has eight chances to make the same mistake, and
[task 2](#2--pin-the-eight-counting-commands-and-run-them) is the whole defence.

**Choosing by installing is not choosing.**

The tempting move is to start writing tokens into `tailwind.config.js` because that is where most of
the code already points, and then to call the accumulated result a decision. Every candidate gets
its row and every loser gets its paragraph, including the ones that lose in one line.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**The stack decision is a tenth of the app and a whole scope's worth of consequence**, and the only
way to see that is to count what each library actually touches before arguing about it.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Every library in `frontend/package.json` was added by somebody solving one problem on one day. That
is how four icon libraries and six date-and-calendar libraries end up installed side by side, two of
them imported by nothing. Nobody did anything wrong; the question of what this frontend is built on
has simply never been asked.

Leaving it unasked has a running cost that is now visible. A v4 class name sits in a v3 codebase
rendering nothing. Two styling systems are both at their defaults, so a new component's author has
to guess which one to reach for, and both answers are defensible, and the app gets a little more
divided each time.

The output of this plan is what [02](02-name-the-colours-and-the-spacing.md) writes into and what
`the-event-workspace` builds screens out of six months from now. It is also the one thing nobody
will remember to write down later: the reasoning survives in a file or it does not survive at all.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  TWO STYLE SYSTEMS, BOTH AT FACTORY SETTINGS

   tailwind.config.js  theme: { extend: {} }  ──┐
   App.jsx:64          createTheme()          ──┼──►  nothing named anywhere
   index.css/App.css   no --custom-property   ──┘

              │
              ▼
   ┌────────  the inventory  ────────┐        ┌──── eight pinned commands ────┐
   │  what each library actually     │        │  287 colour utilities         │
   │  touches, counted, including    │        │   58 hand-written hex         │
   │  the two nothing imports        │        │  292 buttons in 64 files      │
   └────────────────┬────────────────┘        │  ... and five more            │
                    │                         └───────────────┬───────────────┘
                    │   a person chooses                      │
                    ▼                                         │
        the decision + every loser's reason  ◄─────────────────┘
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
      02           03           04          all three write into whatever
    tokens        type        motion        this plan chose, at the same time
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-establish) ➡️

Two pieces in this scope's map are drawn from what this plan opens in.

**Subject: three empty rooms.** The three places a style decision could live and the fact that all
three are empty.
[Piece 1](../diagram-prompts.md#piece-1-three-empty-rooms-planned--not-rendered).
Save as `../diagrams/subject-01-three-empty-rooms.png`. *(image not yet generated)*

**Subject: the inventory nobody chose.** The libraries with their file counts, the two with a count
of zero, and the three lines of v4 written into v3.
[Piece 2](../diagram-prompts.md#piece-2-the-inventory-nobody-chose-planned--not-rendered).
Save as `../diagrams/subject-02-the-inventory-nobody-chose.png`. *(image not yet generated)*

The counter chips on both pieces carry the numbers from
[task 2](#2--pin-the-eight-counting-commands-and-run-them) and the file counts from
[task 1](#1--take-the-inventory), so the pictures and the notes file say the same thing.

## Description: what to establish

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

One markdown file, `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md`, holding
five sections.

1. **The inventory.** One row per dependency in `frontend/package.json` that affects what a screen
   looks like, with the number of files that import it and one line saying what it is doing here.
   Rows with a count of zero are kept and marked, not dropped.
2. **The eight before-numbers, each with the command that produced it.** The command, its exact
   output, the date, and the commit from `git rev-parse --short HEAD`.
3. **The candidates, scored against the criteria.** One row per candidate, plain answers, no scores
   out of ten.
4. **The decision, and every loser with its reason.** One paragraph per losing candidate, and a
   closing paragraph naming what would have to be true for a different candidate to win.
5. **What the answer does to the neighbours.** One line for `one-client-truth`'s data-layer
   candidates, one line for whether the answer changes how the frontend is built or started, and one
   line naming which of the four icon libraries and six date libraries survive.

## Purpose and goal

Navigation: ⬅️ [Description: what to establish](#description-what-to-establish) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 2](../MASTER_PLAN.md#objectives), taking the stack decision on
evidence rather than by drifting into it, and give
[02](02-name-the-colours-and-the-spacing.md), [03](03-give-type-its-roles.md) and
[04](04-say-what-moves-and-what-does-not.md) a file to write into that is not the author's
preference.

**Goal.** `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md` exists; every
dependency that affects a screen carries a file count; all eight before-numbers carry the command
that produced them; every candidate carries a plain answer in every column; every loser carries a
paragraph; and the chosen one is signed and dated by a person.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/01-measure-it-and-take-the-stack-decision.md`

▶ **Next: [task 1.1](#1--take-the-inventory)**.

### 1. 📖 Take the inventory

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Count what each screen-affecting dependency actually touches**
  ```
  cd /home/molef/Work/attica/frontend/src
  for lib in @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react \
             @headlessui/react lucide-react react-icons framer-motion \
             date-fns dayjs react-datepicker react-calendar react-big-calendar \
             leaflet react-leaflet react-dropzone react-toastify websocket; do
    printf '%-24s %s\n' "$lib" "$(grep -rl "$lib" --include=*.jsx --include=*.js . | wc -l)"
  done
  ```
  - Produces: one row per library with the number of files that import it, written into the notes
    file with the command beside it.
  - Done when: every row has a number, including the zeros. On 2026-08-23 this tree answered
    `react-calendar` 0 and `websocket` 0, and those two rows are the point of running it.
  - ❌ If a library shows a count that contradicts what you expected, do not adjust the search to
    get the expected answer. Write down what the command said and note the discrepancy in the row.

- [ ] **1.2 Read the two config files and quote what is in them**
  - `frontend/tailwind.config.js` and the `createTheme` call at `frontend/src/App.jsx:64`.
  - Produces: both quoted verbatim in the notes file, with a line stating that neither has been
    configured and that no CSS custom property exists in `index.css` or `App.css` either.
  - Done when: the emptiness is a quotation rather than a summary. "The theme is unconfigured" is a
    claim; `theme: { extend: {} }` is evidence.

- [ ] **1.3 Record the two escape hatches and their sizes**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -roh "sx={{" --include=*.jsx . | wc -l
  grep -roh "style={{" --include=*.jsx . | wc -l
  grep -rl "style={{" --include=*.jsx . | wc -l
  ```
  - Produces: three numbers. On 2026-08-23: 13 `sx` props, and 34 inline `style` props across 20
    files.
  - Done when: both are in the notes. Inline `style` being the larger of the two is a fact about
    what a migration would actually have to touch, and it points somewhere other than MUI.

- [ ] **1.4 Locate the version mismatch and write down all three sites**
  - `frontend/src/ListingReview.jsx:374`, `:381` and `:389` carry `shadow-xs`, which is Tailwind v4's
    name for v3's `shadow-sm` and does not exist in 3.4.17.
  - Produces: the three sites quoted with their line numbers, and one line stating that all three
    currently render with no shadow.
  - Done when: it is in the notes as evidence for the decision, not as a task to fix here.
    [Plan 07](07-prove-it-and-write-it-down.md) owns removing or defining the five dead class names.
  - ❌ If the lines have moved, find them by content rather than by number and record the new
    numbers. If `shadow-xs` no longer appears at all, say so and say what the tree's Tailwind
    version is now, because that changes the decision.

▶ **Next: [task 2.1](#2--pin-the-eight-counting-commands-and-run-them)**.

### 2. 📊 Pin the eight counting commands and run them

◀ **Needs: [task 1](#1--take-the-inventory)**.

Each of these is a ruler. The plan named beside it runs the same command again at its end, and the
two numbers are only comparable because they came from the same command.

- [ ] **2.1 Colour: distinct utilities, distinct families, distinct hand-written hex**
  ```
  cd /home/molef/Work/attica/frontend/src
  # distinct colour utility classes  -> plan 02's ruler
  grep -roh "\b\(bg\|text\|border\|ring\|from\|to\|via\)-\(slate\|gray\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]\{2,3\}" --include=*.jsx . | sort -u | wc -l
  # distinct colour families
  grep -roh "\b\(bg\|text\|border\|ring\|from\|to\|via\)-\(slate\|gray\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]\{2,3\}" --include=*.jsx . | sed 's/.*-\([a-z]*\)-[0-9]*$/\1/' | sort -u | wc -l
  # distinct hand-written hex values, and the files they live in  -> plan 02's second ruler
  grep -roh "#[0-9a-fA-F]\{6\}\b" --include=*.jsx --include=*.js . | sort -u | wc -l
  grep -rl "#[0-9a-fA-F]\{6\}\b" --include=*.jsx --include=*.js . | wc -l
  ```
  - Produces: four numbers. On 2026-08-23: 287 distinct utilities, 19 families, 58 distinct hex
    values, 9 files.
  - Done when: all four are in the notes with the commands. [02](02-name-the-colours-and-the-spacing.md)
    is measured on the first and third.
  - The 19 families include both `gray` and `slate`, which are two different greys, and both `pink`
    and `rose`, which are two different accents. Write that observation down beside the number; it
    is what makes 19 a finding rather than a statistic.

- [ ] **2.2 Type: distinct size-and-weight pairs**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -roh "\btext-\(xs\|sm\|base\|lg\|xl\|2xl\|3xl\|4xl\|5xl\|6xl\|7xl\)\b" --include=*.jsx . | sort | uniq -c | sort -rn
  grep -roh "\bfont-\(thin\|extralight\|light\|normal\|medium\|semibold\|bold\|extrabold\|black\)\b" --include=*.jsx . | sort | uniq -c | sort -rn
  ```
  - Produces: two frequency tables. On 2026-08-23: eleven sizes led by `text-sm` at 643, and six
    weights led by `font-semibold` at 498.
  - Done when: both tables are in the notes. [03](03-give-type-its-roles.md) is measured against the
    count of distinct sizes and the count of distinct weights.

- [ ] **2.3 Shape: distinct radii and distinct elevation steps**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -roh "\brounded\(-\(none\|sm\|md\|lg\|xl\|2xl\|3xl\|full\)\)\?\b" --include=*.jsx . | sort | uniq -c | sort -rn
  grep -roh "\bshadow\(-\(none\|xs\|sm\|md\|lg\|xl\|2xl\|inner\)\)\?\b" --include=*.jsx . | sort | uniq -c | sort -rn
  ```
  - Produces: two frequency tables. On 2026-08-23: seven radii led by `rounded-xl` at 268, and eight
    elevation steps led by `shadow-sm` at 96, one of which is the non-existent `shadow-xs` at 3.
  - Done when: both are in the notes, with `shadow-xs` flagged in its row as rendering nothing.

- [ ] **2.4 Motion: distinct durations from both systems**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -roh "\bduration-[0-9]\+" --include=*.jsx . | sort | uniq -c | sort -rn
  grep -oh "transition:[^;]*" index.css App.css | sort -u
  grep -on "animation:[^;]*" index.css App.css
  grep -rl "framer-motion" --include=*.jsx --include=*.js . | wc -l
  ```
  - Produces: the utility durations, the stylesheet transition durations, the ambient animations
    with their line numbers, and the framer-motion file count. On 2026-08-23: `duration-300` 25,
    `duration-200` 13, `duration-500` 6; stylesheet durations of 250ms, 260ms, 300ms, 470ms, 560ms
    and 620ms; seven infinite ambient animations between 4s and 24s; framer-motion in 17 files.
  - Done when: all of it is in the notes. [04](04-say-what-moves-and-what-does-not.md) is measured
    against the count of distinct durations across both systems.

- [ ] **2.5 Components: buttons, files, and the distinct padding strings**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -roh "<button" --include=*.jsx . | wc -l
  grep -rl "<button" --include=*.jsx . | wc -l
  grep -roh 'className="[^"]*\bpx-[0-9]\+ py-[0-9]\+[^"]*"' --include=*.jsx . | sort -u | wc -l
  ```
  - Produces: three numbers. On 2026-08-23: 292 button elements, 64 files, 278 distinct
    `px-N py-N` className strings.
  - Done when: all three are in the notes. [05](05-the-components-that-own-the-styles.md) is
    measured against the first two.

- [ ] **2.6 Layout: container queries and viewport breakpoints**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -rn "@container\|container-type\|cqw\|cqi" --include=*.jsx --include=*.js --include=*.css . | wc -l
  grep -roh "\b\(sm\|md\|lg\|xl\|2xl\):" --include=*.jsx . | sort | uniq -c | sort -rn
  grep -rl "Drawer\|Sidebar\|<aside" --include=*.jsx . | wc -l
  ```
  - Produces: three results. On 2026-08-23: zero container queries, `lg:` 139 / `md:` 125 / `sm:`
    119 / `xl:` 9, and 15 files rendering into a drawer, a sidebar or an aside.
  - Done when: all three are in the notes. [06](06-cards-that-answer-to-their-container.md) is
    measured against the first and third.

- [ ] **2.7 The five dead class names, located rather than assumed**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -rn "shadow-xs\|animate-fade-in-down\|animate-fade-in\b" --include=*.jsx .
  grep -rn "fade-in" index.css App.css ../tailwind.config.js
  ```
  - Produces: five sites with line numbers, and an empty result from the second command confirming
    the two animation names are defined nowhere. On 2026-08-23: `ListingReview.jsx:374`, `:381`,
    `:389`, `EventListingPage.jsx:19` and `PostCard.jsx:21`.
  - Done when: the five sites are listed and the second command's emptiness is recorded as a
    result rather than skipped. [07](07-prove-it-and-write-it-down.md) removes or defines them and
    builds the check that would have caught them.

- [ ] **2.8 Stamp the tree the numbers came from**
  ```
  cd /home/molef/Work/attica
  git rev-parse --short HEAD
  find frontend/src -name '*.jsx' -o -name '*.js' | wc -l
  find frontend/src -name '*.jsx' -o -name '*.js' | xargs wc -l | tail -1
  date +%F
  ```
  - Produces: the commit, the file count, the line count and the date, written at the top of the
    notes file. On 2026-08-23: 110 files, 25,852 lines.
  - Done when: every number in the file can be attributed to one tree on one day.

▶ **Next: [task 3.1](#3--build-the-candidate-table)**.

### 3. ⚖️ Build the candidate table

◀ **Needs: [task 2](#2--pin-the-eight-counting-commands-and-run-them)**.

- [ ] **3.1 Score every candidate against seven criteria**
  - The criteria, in this order: where does a semantic token physically live and can a person read
    all of them in one file; what does the migration cost in files that have to change, using the
    counts from task 1; does it work with container queries without a plugin; can a check be written
    that fails on a hand-written hex value and on a class name matching no rule; what does it add to
    or remove from the shipped bundle; what does a new person have to learn before they can add a
    component; and does it change how the frontend is built or started.
  - The candidates to score, at minimum. Add any the reading turns up rather than treating this list
    as closed:
    - **Tailwind 3, configured.** Fill in `theme.extend` in the file that is already there. The
      smallest change, and the one closest to where the code already points.
    - **Tailwind 4.** A genuine major version: configuration moves into CSS, the PostCSS plugin
      becomes a Vite plugin, the shadow scale is renamed, and container queries are built in rather
      than a plugin. Three sites in the tree are already written against it.
    - **Material UI as the owner, Tailwind removed.** Tokens go into `createTheme()`. Costs the
      rewrite of every file that uses a utility class, which is most of them.
    - **CSS custom properties as the owner, with both systems reading them.** Tokens live in
      `index.css` and neither framework owns the vocabulary. The one answer that survives a later
      framework change.
    - **Keep both, and write down which one owns what.** The candidate that changes least, scored
      honestly rather than as a straw man: it is the only one whose migration cost is zero.
  - Produces: one row per candidate with a plain answer in each of the seven columns.
  - Done when: no cell says "depends". Where an answer genuinely turns on something not yet known,
    write what it turns on, which is a different statement.
  - 💡 `/unpack frontend/src/ListingReview.jsx` before scoring: it holds three v4 class names, a
    `ring-` utility, and the review step's whole card layout, and it is the smallest complete
    example in the repository of what each candidate would have to handle.

- [ ] **3.2 Score the icon and date libraries separately, as their own two rows**
  - The icons: `react-icons` (47 files), `lucide-react` (7), `@mui/icons-material` (2),
    `@headlessui/react` (1). The dates: `dayjs` (5), `date-fns` (1), `react-datepicker` (1),
    `react-big-calendar` (1), `@mui/x-date-pickers` (1), `react-calendar` (0).
  - Produces: one recommendation per group, with the migration cost in files stated from the counts
    rather than estimated.
  - Done when: each group names which survives and what happens to the rest. These are not the main
    decision and they are the two places the inventory pays for itself immediately.

- [ ] **3.3 Label every candidate by what it does to `one-client-truth`**
  - Three labels only: `survives` (that scope's [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> choice is unaffected), `reconfigured` (same
    tool, different wiring), `redone` (thrown away and replaced).
  - Produces: one label per candidate with the sentence justifying it, and one line stating the one
    point where the two scopes touch, which is what ships in the bundle and not the API a component
    calls.
  - Done when: every row has a label, including the winner. That label is the thing scope 10 asked
    for and the thing nobody will remember to write later.

▶ **Next: [instruction 3.1](#3--see-it-on-a-screen-then-take-the-decision)**, which is where a person
chooses.

### 4. ✍️ Write the decision record

◀ **Needs: [instruction 3](#3--see-it-on-a-screen-then-take-the-decision)** done, so there is a
decision to record rather than a preference to justify.

- [ ] **4.1 Write `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md`**
  - Five sections, in the order given in [Description](#description-what-to-establish).
  - Open it with the commit, the file count, the line count and the date from
    [task 2.8](#2--pin-the-eight-counting-commands-and-run-them).
  - Every losing candidate gets its own paragraph naming why it lost. "Not chosen" is not a reason.
  - Done when: a person who was not in the room can say what was chosen, what it beat, and what
    would have to be true for a different answer to win.

- [ ] **4.2 Write down the contract the next three plans build against**
  - One section naming: the file semantic tokens live in, the notation a token is written in, how a
    component reads one, and what a person does when the thing they need has no token yet.
  - Produces: what [02](02-name-the-colours-and-the-spacing.md),
    [03](03-give-type-its-roles.md) and [04](04-say-what-moves-and-what-does-not.md) each write into,
    which is why all three can run at the same time.
  - Done when: it is stated plainly that a page never writes a raw colour, size, radius, shadow or
    duration, and that adding a token is an edit in one place.

- [ ] **4.3 Write the three lines the neighbours are waiting for**
  - One line for `one-client-truth`: which of its cache candidates this answer would invalidate,
    from the labels in [task 3.3](#3--build-the-candidate-table).
  - One line for `environment/`: whether this answer changes how the frontend is built or started.
    A Tailwind 4 answer does, because `postcss.config.js` and the Vite plugin chain change with it.
    That line is what decides whether `/env-pulse` runs in
    [07](07-prove-it-and-write-it-down.md), per
    [the decisions taken here](../decisions-taken-here.md#the-owes-line-says-nothing-for-environment-and-one-possible-answer-to-d10-would-make-that-false).
  - One line naming which icon library and which date library survive.
  - Done when: all three lines exist and each names its consequence rather than describing the
    decision again.

- [ ] **4.4 Write the grouping's card**
  - Create `artifacts/notes/the-design-system/README.md` per `~/.claude/ARTIFACT_TREE_FORMAT.md`,
    with one entry for the decision record: what it holds, how it was established, what it lets you
    say, what it cannot say.
  - Done when: the provenance is in the card as prose, so no folder or filename has to carry it.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 4](#4--write-the-decision-record)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 3. 👀 See it on a screen, then take the decision

◀ **Needs: [task 3](#3--build-the-candidate-table)** done, so there is a table to read.

This is the one decision this scope contains. Nobody else takes it, and no plan in this folder
pre-answers it.

3.1 **Look at the three dead shadows before reading anything**
   - Start the frontend: `cd /home/molef/Work/attica/frontend && npm run dev`. Nothing else needs to
     be running for this step.
   - Open Chrome at `http://localhost:5173`, navigate to the create-event wizard's review step, and
     press F12 for DevTools.
   - Click the Elements tab, find one of the three cards from
     `frontend/src/ListingReview.jsx:374`, and look at the Styles pane on the right.
   - Expected result: the element carries `shadow-xs` in its class list and the Styles pane shows no
     `box-shadow` rule coming from it.
   - ✅ The class is on the element and no rule matches it: that is the whole argument for taking
     this decision, on your screen. Screenshot it and save it as
     `artifacts/figures/the-design-system/dead-class-in-devtools.png`.
   - ❌ A `box-shadow` rule does appear: then Tailwind has been upgraded since 2026-08-23. Check
     `frontend/package.json` and say what version it is on now, because the candidate table changes.

3.2 **Look at two greys side by side**
   - Still in the Elements tab, use Ctrl+F in the DevTools search and search the page for
     `text-gray-500`, then for `text-slate-500`.
   - Expected result: both appear, on elements doing similar jobs.
   - ✅ You can point at two pieces of muted text that are two different greys: write down which two
     elements. That is what "287 distinct colour utilities" looks like at one-element resolution.
   - ❌ Only one appears on this screen: try the organizer dashboard and the provider list, which
     were written by different hands at different times.

3.3 **Read the candidate table end to end before forming a view**
   - Open `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md`.
   - Read the migration-cost column and the does-it-change-the-build column first, because those two
     remove candidates without argument.
   - ✅ At least one candidate has a migration cost you are willing to pay and does not change how
     the frontend starts: choose among those.
   - ❌ Every acceptable candidate changes the build: that is a real finding, not a dead end. It
     means this scope owes `environment/` a fact, which
     [task 4.3](#4--write-the-decision-record) is where you say so.

3.4 **Say the decision out loud in one sentence, then write it**
   - The sentence has this shape: "Styling is owned by `<candidate>`, tokens live in `<file>`,
     because `<the criterion that decided it>`, and it would `<label>` the client data layer."
   - ✅ You can say it without reading the table: the decision is clear enough for three plans to
     build on at the same time.
   - ❌ You cannot say it in one sentence: the table is missing a criterion. Go back to
     [task 3.1](#3--build-the-candidate-table) and add it rather than deciding around it.

3.5 **Decide what happens to the two dependencies nothing imports**
   - `react-calendar` and `websocket` are in `frontend/package.json` and imported by no file.
   - ✅ You have said remove or keep for each, with a reason: [07](07-prove-it-and-write-it-down.md)
     acts on it.
   - ❌ You want to defer: that is a deferral to record with a date, not a blank.

3.6 **Sign and date it**
   - Write your name and the date under the decision in the notes file.
   - This is what makes it a decision rather than a proposal, and it is what
     [02](02-name-the-colours-and-the-spacing.md)'s first task reads.

▶ **Next: [task 4.1](#4--write-the-decision-record)**, which writes it down in full.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when three people can start plans 02, 03 and 04 on the same morning, from the
> notes file alone, without asking anybody which file to write into.

Pass:

- Every screen-affecting dependency carries a file count, including the two that are zero.
- All eight before-numbers carry the command that produced them, and the file records the commit,
  the file count, the line count and the date they came from.
- The three `shadow-xs` sites are located and recorded as evidence, with a DevTools screenshot
  showing no matching rule.
- Every candidate carries a plain answer in all seven columns and a label saying what it does to
  `one-client-truth`.
- Every losing candidate has a paragraph saying why it lost.
- The three neighbour lines exist: the data-layer label, the does-it-change-the-build answer, and
  the surviving icon and date libraries.
- The decision is signed and dated by a person.

Fail, and what it means:

- A decision record written before instruction 3. Then the record is the writer's preference with a
  table attached, and the table will be read as evidence for it.
- An after-number planned against a different command from the before-number. Two rulers measure
  nothing, and with eight numbers this scope has eight ways to report progress it did not make.
- The candidate table missing "keep both and write down which owns what". It is the only candidate
  with a migration cost of zero, and a table that omits it is arguing rather than comparing.
- A cell reading "depends". Say what it depends on.

Partial pass is acceptable on the icon and date library rows alone. The main decision taken well and
those two deferred with a date beats all three taken in the same hour.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The decision record, five sections | `artifacts/notes/the-design-system/what-this-frontend-is-built-on.md` | — | not started |
| The grouping's card | `artifacts/notes/the-design-system/README.md` | — | not started |
| The inventory with a file count per library | inside the decision record | — | not started |
| The eight pinned commands and their before-numbers | inside the decision record | — | not started |
| The contract plans 02, 03 and 04 build against | inside the decision record | — | not started |
| The three neighbour lines | inside the decision record | — | not started |
| What the two screens showed: the dead class, and the two elements carrying two different greys | inside the decision record | — | not started |
| A dead class shown in DevTools with no matching rule | `artifacts/figures/the-design-system/dead-class-in-devtools.png` | — | not started |
| Three empty rooms | [piece 1](../diagram-prompts.md#piece-1-three-empty-rooms-planned--not-rendered) → `../diagrams/subject-01-three-empty-rooms.png` | subject | ⏳ not rendered |
| The inventory nobody chose | [piece 2](../diagram-prompts.md#piece-2-the-inventory-nobody-chose-planned--not-rendered) → `../diagrams/subject-02-the-inventory-nobody-chose.png` | subject | ⏳ not rendered |
| One decision, then three vocabularies at once | [process prompt 1](../diagram-prompts.md#prompt-1-process-one-decision-then-three-vocabularies-at-once-planned--not-rendered) → `../diagrams/process-01-one-decision-then-three-at-once.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/the-design-system/plans/01-measure-it-and-take-the-stack-decision.md` | task 0, before any work | Conformance and thin instructions reported |
| Read the file that carries the v4 leak | `/unpack frontend/src/ListingReview.jsx` | task 3.1 | The three dead class names and the review card's layout read rather than paraphrased |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the scope's master plan](../MASTER_PLAN.md): what is true today, with a count or a line number on every claim.
- [the decisions taken here](../decisions-taken-here.md#the-stack-decision-goes-first-even-though-the-scopes-own-wording-says-tokens-first): why this plan precedes the tokens.
- [the open decisions](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions): D10 in its own words.
- `frontend/tailwind.config.js`: eleven lines, `theme: { extend: {} }`.
- `frontend/src/App.jsx:64`: `createTheme()` with no argument, and `:82` where it is provided.
- `frontend/src/ListingReview.jsx:374`, `:381`, `:389`: three Tailwind v4 class names in a v3 tree.
- `frontend/package.json`: the whole inventory, including the two dependencies nothing imports.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

Three plans, all at once, all waiting on this one and on none of each other:
[02-name-the-colours-and-the-spacing.md](02-name-the-colours-and-the-spacing.md),
[03-give-type-its-roles.md](03-give-type-its-roles.md) and
[04-say-what-moves-and-what-does-not.md](04-say-what-moves-and-what-does-not.md).

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. The work is a decision taken by a person against counts gathered by hand,
and the skills that come closest do the wrong half: `/code-audit` hunts defects with no question in
hand, `/ux-scout` reads an interface rather than its build.
   also: `/unpack frontend/src/ListingReview.jsx` at task 3.1, which is help with one task rather
   than the shape of the plan.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A count that moved without the code moving | Any before-and-after measurement in this scope | Two different greps. Use the pinned commands from task 2 for both ends of every comparison. |
| A class name renders nothing and nothing reports it | `ListingReview.jsx:374`, `:381`, `:389`; `EventListingPage.jsx:19`; `PostCard.jsx:21` | No check reads `className` strings today. [Plan 07](07-prove-it-and-write-it-down.md) builds one. Until then, confirm in the DevTools Styles pane rather than by reading the source. |
| A config change appears not to take effect | `tailwind.config.js` or `package.json` edits under a running Vite dev server | Vite pre-bundles dependencies and [caches](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> the result. Restart the dev server rather than reloading the page. |
