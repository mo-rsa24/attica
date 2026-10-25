# The Design System

> **This scope's plans interleave with the parent's.** They are not done as a block. The one
> ordering that matters is the running-order table in [the parent master plan](../../MASTER_PLAN.md#running-order).
> The Plans list below is this folder's contents, not a sequence to follow top to bottom.

## Mission

Attica's interface is built from a small set of named decisions that live in one place, and a page
that needs a colour, a size, a corner, a shadow or a movement asks for it by name instead of
choosing one.

Today nothing is named. Both style systems in the repository sit at their factory defaults:
`frontend/tailwind.config.js` declares `theme: { extend: {} }` and `frontend/src/App.jsx:64` calls
`createTheme()` with no argument. There is no third place either, because neither `index.css` (594
lines) nor `App.css` (54 lines) declares a single CSS custom property. So every style in 25,852
lines of `frontend/src` was chosen at the point it was written, by whoever was writing there, with
nothing to consult.

The result is measurable rather than aesthetic. 287 distinct Tailwind colour utilities, drawing on
19 of Tailwind's 22 colour families. 58 distinct hex values written by hand. Eleven text sizes and
six font weights. Seven corner radii and eight shadow steps. 292 `<button>` elements across 64
files and no shared button anywhere. The same card skeleton written three times in three page files,
next to a fourth copy in a shared file that nothing imports.

This scope names the decisions, puts them in one place, and gives a person a way to add a component
without inventing a style.

---

## What this scope is, in one line per mark

The marks come from [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#12-the-design-system),
and this scope is the whole of item 12 there.

**build** Semantic tokens first: colour, spacing, radius, elevation. Components consume tokens and
pages never invent styles.

**build** A typography scale with named roles rather than utility classes chosen ad hoc.

**build** A motion language with duration bands, and an explicit statement of what does not animate.

**build** Container queries, so a provider card responds to its container rather than the viewport.
This app is full of drawers, sidebars and split panes.

**decide** The stack. Cheaper than it reads: Material UI appears in 10 of 110 files, the data layer
is 9 files, and the motion library is already installed. Tailwind is on 3.4.17, so v4 is a genuine
major upgrade with a one-file config surface.

**build** Skeletons that preserve geometry, and explicit status text for actions. Mobile as its own
layout rather than a shrunk desktop.

---

## What is true today, with a count or a line number on every claim

Read before planning anything here. Every number below was produced by a command run against this
repository on 2026-08-23, over the 110 JavaScript files and 25,852 lines in `frontend/src`. The
commands that produced them are pinned in [plan 01](plans/01-measure-it-and-take-the-stack-decision.md),
because a before-number without its command cannot be compared to an after-number.

**Both style systems are installed and neither is configured.** `frontend/tailwind.config.js` is
eleven lines: a content glob, `theme: { extend: {} }`, and `plugins: []`. `frontend/src/App.jsx:64`
is `const theme = createTheme()`, MUI's default theme with no palette, no typography and no shape
overrides, handed to a `ThemeProvider` at `App.jsx:82`. Neither file has ever been told anything
about this product.

**There is no third place tokens could be hiding.** `frontend/src/index.css` (594 lines) and
`frontend/src/App.css` (54 lines) declare no CSS custom property at all: a search for `--name:` in
both returns nothing. There are no `@layer` blocks and no `@apply` directives. The three
`@tailwind` directives at `index.css:4` to `:6` are the whole of the integration.

**287 distinct colour utility classes are in use, across 19 colour families.** The families are
amber, blue, cyan, emerald, fuchsia, gray, green, indigo, orange, pink, purple, red, rose, sky,
slate, stone, teal, violet and yellow. Grey is spelled two ways that are different palettes:
`text-gray-500` appears 238 times and `text-slate-700` 71 times, and nothing says which one a new
card should use. The same ambiguity runs through the accent: `text-pink-600` 55 times and
`text-rose-700` 17, `bg-pink-600` 42 and `bg-rose-600` 10.

**58 distinct hex values are written by hand, in 9 files, 95 times.** 52 of them are Tailwind
arbitrary values in square brackets, which is the notation for "the palette does not have this".
The most repeated are `#FF5A5F` (7 times), `#fff3ea` (5) and `#351d17` (5). Six of them carry an
alpha suffix, such as `[#fff3ea1a]` and `[#f7d8c6a3]`, so opacity is being written into the colour
rather than named separately.

**Type is eleven sizes and six weights, chosen per use.** `text-sm` 643 times, `text-xs` 256,
`text-lg` 95, `text-xl` 81, `text-2xl` 78, `text-3xl` and `text-4xl` 34 each, `text-base` 32,
`text-5xl` 20, `text-6xl` 7, `text-7xl` 3. Weights: `font-semibold` 498, `font-bold` 245,
`font-medium` 156, `font-black` 36, `font-normal` 9, `font-extrabold` 6. No name for any
combination, so "a card title" is a different pair of classes in every card.

**Seven radii and eight elevation steps, with no rule.** `rounded-xl` 268, `rounded-lg` 225,
`rounded-full` 219, `rounded-2xl` 135, bare `rounded` 52, `rounded-3xl` 35, `rounded-md` 26.
`shadow-sm` 96, bare `shadow` 58, `shadow-lg` 54, `shadow-md` 37, `shadow-xl` 20, `shadow-2xl` 13,
`shadow-inner` 3, `shadow-xs` 3.

**Three of those elevation uses are a Tailwind v4 class name in a v3 codebase.** `shadow-xs` does
not exist in Tailwind 3.4.17; it is v4's name for what v3 calls `shadow-sm`. All three sites are
`frontend/src/ListingReview.jsx:374`, `:381` and `:389`, and all three currently render with no
shadow at all. This is evidence for the stack decision rather than a defect to fix in passing:
somebody has already written v4 against v3 and nothing told them.

**Two more class names produce nothing.** `animate-fade-in-down`
(`frontend/src/EventListingPage.jsx:19`) and `animate-fade-in`
(`frontend/src/PostCard.jsx:21`) are neither Tailwind classes nor defined as keyframes anywhere in
`index.css` or `App.css`. Both elements are static. Nothing in the toolchain reports a class that
matches no rule, which is the general problem: an invented style and a misspelled one look
identical from the outside.

**292 `<button>` elements live in 64 files, and there is no shared button.** 278 distinct
`px-N py-N` className strings appear across the tree. The three files whose names contain "Button"
are `FloatingCreateEventButton.jsx`, `FloatingActionButton.jsx` and `NewPostButton.jsx`, each one
specific screen furniture rather than a primitive anything else uses.

**The card skeleton exists four times, and the shared copy is the orphan.** `Artists.jsx:24`,
`Events.jsx:27` and `Services.jsx:35` each define their own `ArtistCardSkeleton`,
`EventCardSkeleton` and `ServiceCardSkeleton` locally and render it at `:232`, `:236` and `:341`.
A fourth, `frontend/src/ServiceCardSkeleton.jsx`, is a complete standalone component that no file
imports. This is the whole of the loading state in the app: four near-identical copies of one card,
three of them in use, and no other screen has one.

**Motion is nine durations from two systems, and no statement of what does not move.** From the
utility classes: `duration-300` 25 times, `duration-200` 13, `duration-500` 6. From `index.css`:
250ms, 260ms, 300ms, 470ms, 560ms and 620ms, plus seven infinite ambient animations running between
4s and 24s. `framer-motion` is imported in 17 files. There is no rule about which of the two systems
a new movement should use. Reduced-motion is handled in three places (`App.css:42`,
`index.css:38`, `index.css:576`) and two of those are `!important` overrides, so the honouring is
partial and undocumented.

**Not one container query exists.** A search for `@container`, `container-type`, `cqw` and `cqi`
across every `.jsx`, `.js` and `.css` file returns nothing. Every responsive decision in the app is
a viewport breakpoint: `lg:` 139 times, `md:` 125, `sm:` 119, `xl:` 9. Meanwhile 15 files render
something into a drawer, a sidebar or an `<aside>`, including
`components/booking/EventBookingSummaryDrawer.jsx`, `components/booking/MockCheckoutSheet.jsx`,
`components/FilterSidebar.jsx`, `pages/SelectArtists.jsx` and `pages/SelectVendors.jsx`. A card in
a 380px drawer and the same card in a full-width grid are both told the viewport is large.

**Four icon libraries and six date libraries are installed, and the usage is lopsided.**
`react-icons` in 47 files, `lucide-react` in 7, `@mui/icons-material` in 2, `@headlessui/react` in
1. `dayjs` in 5 files, `date-fns` in 1, `react-datepicker` in 1, `react-big-calendar` in 1,
`@mui/x-date-pickers` in 1, and `react-calendar` in none. Two dependencies are imported by no file
at all: `react-calendar` and `websocket`.

**Material UI's footprint is small and concentrated.** Ten files import from `@mui/`: `App.jsx`,
`Footer.jsx`, `PostCreate.jsx`, `SearchForm.jsx`, `VendorDashboard.jsx`, `VendorProfileEdit.jsx`,
`components/create/CreateWizardStepper.jsx`, `pages/CreateArtistPage.jsx`,
`pages/CreateServicePage.jsx` and `pages/CreateVenuePage.jsx`. `sx={{` appears 13 times in total.
Inline `style={{` appears 34 times across 20 files, which is a larger escape hatch than `sx`.

---

## The decision this scope owns, and the two it does not

**D10, the frontend stack, is this scope's to take**, and nothing here is written as though it were
already answered. It is in
[the open decisions](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions),
and [plan 01](plans/01-measure-it-and-take-the-stack-decision.md) takes it with the candidates that
lost and the reason each lost. Every plan after it is written to be built on top of whatever it
chose, which is possible because a semantic token is a name and a value, and only the file it lives
in changes with the answer.

**Neither D1 nor D2 reaches this scope**, and this is stated because the programme's rule is that a
scope depending on either must plan against the decision being unmade. D1 decides which of the four
booking representations survives and D2 decides when a hold starts. Both change what a screen shows
and neither changes what a colour is called, how a corner is rounded, or how long a transition runs.
The one place the domain touches this scope is
[plan 05](plans/05-the-components-that-own-the-styles.md)'s status text, and it touches it as a list
of states to be read from wherever they are defined at the time, never as a list this scope writes
down. That reading rule is in [the decisions taken here](decisions-taken-here.md#neither-d1-nor-d2-reaches-this-scope-and-the-one-place-that-nearly-looks-like-it-does).

**D10 constrains a decision in another scope, and this scope owes that scope a sentence.**
`one-client-truth`, scope 10, takes its [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> decision without waiting for D10, and labels each of
its candidates by what a stack answer would do to it. So the stack decision here has to say, in one
line, what it does to a client data layer, and that line is a deliverable rather than a courtesy.
The two scopes touch at exactly one point, which is what ships in the bundle, and at no point in the
API a component calls.

**What this scope does not touch.** It builds no screens and fixes no flows. The persistent
application shell, autosave, optimistic updates and the convergence dashboard are
`the-event-workspace`, scope 11, which waits on this one. The eight non-blocker defects listed under
Broken belong there too. Image variants and direct-to-storage upload are
`performance-architecture`, scope 9. This scope makes those scopes cheaper to build by giving them
something to build out of; it does not build them.

---

## Objectives

1. **Put every style decision in one place a person can read in a minute.** A repository where the
   only way to find out what grey means is to grep 110 files has no design system, whatever it
   renders.
2. **Take the stack decision on evidence rather than by drifting into it.** Two style systems at
   their defaults, four icon libraries, six date libraries and two dependencies nobody imports is
   not a stack, it is an accumulation, and every month it goes untaken it gets more expensive.
3. **Make a component the thing that owns a style, and a page the thing that arranges components.**
   292 buttons in 64 files is 64 opportunities to be slightly wrong and no opportunity to be right
   once.
4. **Say what moves, how fast, and what does not move at all.** Nine durations across two systems
   with no rule is how an interface ends up feeling arbitrary while every individual choice looked
   reasonable.
5. **Let a component answer to the space it is in.** Cards that read the viewport are wrong in
   every drawer in this app, and there are fifteen of them.
6. **Make an invented style visible.** Today an invented one and a misspelled one both render
   silently, which is why three v4 class names and two undefined animations have survived.

---

## Goals

1. The stack decision is written down and signed, with every losing candidate carrying its reason
   and a line saying what the answer does to a client data layer.
2. Colour, spacing, radius and elevation exist as named semantic tokens in exactly one file, and
   every one of them has a name that says its job rather than its value.
3. Type has named roles, and the number of distinct size-and-weight pairs in use falls from what
   plan 01 counted to the number of roles.
4. Motion has named duration bands, a statement of what does not animate, and one honoured
   reduced-motion rule rather than three partial ones.
5. A shared component layer exists that pages consume, starting with the button and the card
   skeleton, and the four duplicate skeletons become one.
6. The cards that appear inside drawers respond to their container, proved by resizing the drawer
   rather than the window.
7. A person can add a component without inventing a style, following a runbook recipe, and can run
   a check that says whether they did.

---

## Expected Outcome

Somebody opens the repository for the first time, needs a card with a title, a muted line and a
primary action, and builds it correctly in ten minutes without asking anyone and without copying an
existing card. The same card, dropped into a drawer, lays itself out for the drawer. When they get
it wrong, something tells them.

---

## Definition of Done

- [ ] The stack decision taken, written down, signed and dated: which style system owns styling,
      what happens to the other, which of the four icon libraries and six date libraries survive,
      and what the answer does to `one-client-truth`'s data-layer candidates. Every losing candidate
      carries its own paragraph
- [ ] The before-numbers recorded with the commands that produced them, so the after-numbers in
      later plans are taken with the same ruler: distinct colour utilities, distinct hand-written
      hex values, distinct size-and-weight pairs, distinct radii, distinct elevation steps, distinct
      durations, `<button>` count and file count
- [ ] Semantic tokens for colour, spacing, radius and elevation exist in one named file, each token
      named for its job. A mapping table records which of the counted values each token replaces,
      including every one of the 58 hand-written hex values
- [ ] A typography scale with named roles, each role naming the size, weight, line height and what
      it is for, and a mapping from the eleven sizes and six weights onto those roles
- [ ] A motion language: named duration bands with a value each, a rule for when `framer-motion` is
      used instead of a CSS transition, and a written list of what does not animate. The three
      reduced-motion blocks reconciled into one honoured rule
- [ ] The shared component layer exists and pages consume it. The button is a component, and the
      four card skeletons (`Artists.jsx:24`, `Events.jsx:27`, `Services.jsx:35` and the orphaned
      `ServiceCardSkeleton.jsx`) become one that preserves the geometry of the card it stands in
- [ ] Every action that can be in flight carries explicit status text rather than a spinner alone,
      with the states read from wherever the domain defines them rather than invented here
- [ ] Container queries in use on the components that render inside the 15 drawer, sidebar and
      `<aside>` files, with the viewport breakpoints kept only where the decision is genuinely about
      the viewport
- [ ] Mobile has its own layout for at least the create-event wizard and the provider list, decided
      as a layout rather than reached by shrinking
- [ ] The five dead class names removed or defined: `shadow-xs` at `ListingReview.jsx:374`, `:381`,
      `:389`, `animate-fade-in-down` at `EventListingPage.jsx:19`, `animate-fade-in` at
      `PostCard.jsx:21`
- [ ] The two unimported dependencies (`react-calendar`, `websocket`) removed from
      `frontend/package.json`, or a written reason each is kept
- [ ] A check that reports an invented style: a lint rule, a config-driven allowlist, or a script,
      chosen for what this toolchain can actually run. It must fail on a hand-written hex value and
      on a class name that matches no rule, since those are the two failures that are silent today
- [ ] ⚠️ The drawer test performed by hand: open the booking summary drawer at a desktop window
      size, confirm the card inside it lays out for the drawer's width and not the window's, then
      drag the browser window narrow and confirm the card does not change again `[owner: human]`
- [ ] ⚠️ The mobile walk performed by hand in Chrome DevTools device toolbar (Ctrl+Shift+M) at
      iPhone SE width: walk the create-event wizard end to end and confirm nothing is a shrunk
      desktop, screenshotting each step `[owner: human]`
- [ ] ⚠️ The ten-minute test performed by hand: build one card from the token file, the type roles
      and the component layer, without opening any existing card and without asking anyone. Time it
      `[owner: human]`
- [ ] ⚠️ Reduced motion checked by hand: switch the operating system to reduce motion, reload, and
      confirm the seven ambient animations in `index.css` stop `[owner: human]`
- [ ] The runbook pair written with `/drip-runbook` and checked with `/runbook-pulse`: how to add a
      component without inventing a style, and how to find out whether a page invented one. Neither
      exists, and [the runbook index](../../../../runbook/00-INDEX.md) has no frontend theme at all
- [ ] `/env-pulse` run **only if** the stack decision changed how the frontend is built or started,
      which a Tailwind v4 upgrade would. [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#12-the-design-system)
      says this scope owes `environment/` nothing, and that holds unless the decision makes it
      false. The judgement and its reason are in
      [the decisions taken here](decisions-taken-here.md#the-owes-line-says-nothing-for-environment-and-one-possible-answer-to-d10-would-make-that-false)
- [ ] No `/context-pulse`. This scope introduces no word about Attica's world: a token, a duration
      band and a container query are facts about the machinery, not about events, providers or
      bookings
- [ ] Close out: `/ingest-error-pattern` for anything that bit, then
      `/sync-plan-tree @plans/create-event-end-to-end/plans/the-design-system`

---

## Sub-Scopes

(none)

---

## Plans

This folder's contents. The order that matters is the
[parent's running order](../../MASTER_PLAN.md#running-order).

| Plan | What it does | Status |
|---|---|---|
| [01 Measure it and take the stack decision](plans/01-measure-it-and-take-the-stack-decision.md) | Pin the counting commands, record every before-number, and settle D10 with the candidates that lost | ⚠️ not started |
| [02 Name the colours and the spacing](plans/02-name-the-colours-and-the-spacing.md) | Colour, spacing, radius and elevation as named tokens in one file, with every counted value mapped onto one | ⚠️ not started |
| [03 Give type its roles](plans/03-give-type-its-roles.md) | Eleven sizes and six weights become a handful of named roles, each saying what it is for | ⚠️ not started |
| [04 Say what moves and what does not](plans/04-say-what-moves-and-what-does-not.md) | Duration bands, the rule for which motion system to use, the list of what does not animate, and one reduced-motion rule | ⚠️ not started |
| [05 The components that own the styles](plans/05-the-components-that-own-the-styles.md) | The shared layer pages consume: the button, the one card skeleton, and explicit status text for actions in flight | ⚠️ not started |
| [06 Cards that answer to their container](plans/06-cards-that-answer-to-their-container.md) | Container queries where the space decides, viewport breakpoints where the viewport decides, and mobile as its own layout | ⚠️ not started |
| [07 Prove it and write it down](plans/07-prove-it-and-write-it-down.md) | The check that catches an invented style, the four by-hand tests, and the runbook pair that does not exist | ⚠️ not started |

---

## Decisions taken while writing this scope

Every choice made without asking, with its reason, is in
[the decisions taken here](decisions-taken-here.md). Read it before changing anything above: several
lines above are one of two defensible readings rather than the only one.

---

## Environment Context

Inherited from the parent. Environment and architecture facts live in
[the environment index](../../../../environment/00-INDEX.md). Read
[the overview](../../../../environment/overview.md) first.

Three facts decide whether work here lands or silently does nothing.

**The frontend is its own hand-started process**, per
[the execution model](../../../../environment/overview.md#execution-model). Nothing starts it for
you and nothing supervises it. Every by-hand check in this scope is performed in a browser against
`npm run dev` on port 5173, and a token change that is not showing up is more often a dev server
that was not restarted than a token that is wrong.

**Vite's dependency pre-bundling [caches](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> what it optimised.** A change to `frontend/package.json` or
to `tailwind.config.js` is the class of change that needs the dev server restarted rather than
reloaded, and a stack decision in this scope is nothing but changes of that class.

**Nothing here needs the backend, except the four by-hand checks.** The drawer test, the mobile
walk, the ten-minute test and the reduced-motion check all drive real screens, so they need the
stack up per [bringing the stack up](../../../../runbook/running-the-web-app/bringing-the-stack-up.md),
and the drawer test needs a booking to look at. The token, type and motion work needs nothing
running but Vite.

**Two backend tests already fail**, so a red `python manage.py test` does not mean this scope broke
something. Nothing here touches the backend at all.

One fact this scope needs is not written in `environment/` and must not be inferred: **whether this
repository has a way to run a check over the frontend source other than ESLint**.
`frontend/package.json` carries `eslint` 9 with `@eslint/js`, `eslint-plugin-react-hooks` and
`eslint-plugin-react-refresh`, `@playwright/test`, and no unit test runner at all. The three test
scripts are `test:e2e`, `test:e2e:ui` and `test:e2e:report`. That constrains what the
invented-style check in [plan 07](plans/07-prove-it-and-write-it-down.md) can be, and it is recorded
there rather than assumed.

Where a fact this scope needs is not written in `environment/`, stop and ask rather than inferring
it.

---

## Runbook

The by-hand recipes live in [the runbook index](../../../../runbook/00-INDEX.md). Bringing the stack
up is a recipe there, and this scope links it rather than restating it.

**That index has no frontend theme at all.** Its three themes are running the web app, preparing the
data and driving the app, and every recipe in them is a terminal command, the Django admin, or a
click path through a running screen. Nothing in it is about changing the interface.

This scope writes back a pair, and neither half exists in any form.

**How to add a component without inventing a style** is the recipe that makes the token file real
rather than aspirational. Which file to open, what a token is called, which role to use for a title,
which band to use for a hover, and what to do when the thing you need has no name yet, which is the
step every design system forgets to write and the one that decides whether it survives contact with
a deadline.

**How to find out whether a page invented one** is the other half, because every claim in this scope
is unprovable without a way to ask the question of a file somebody else wrote.

---

## Context

What Attica means in the real world lives in [the context index](../../../../context/00-INDEX.md).
**This scope owes it nothing, and the reason is worth stating so nobody adds an entry out of
politeness.**

A token, a duration band, an elevation step and a container query are facts about the machinery
Attica is built with. They tell a reader nothing about events, organizers, providers, bookings or
availability, which is what `context/` is for. The one word in this scope that sounds like domain
vocabulary is the status text on an action in flight, and those words are the domain's own: they are
read from wherever the states are defined and displayed, never coined here.

---

## Diagram Prompts

This scope's illustrated map is [the illustrated map](diagram-prompts.md). It inherits the parent's
art direction, palette, glyph vocabulary and tiers, and reading axes exactly, and adds no vocabulary
of its own. It is the zoom-in on the design-system glyph in
[the parent's subject capstone](../../diagram-prompts.md), which keeps it as one glyph in the
experience panel.

The map carries both lanes. The process lane's stages are the seven plans above, drawn in the
parent's running-order numbers 22 to 28, and each changed regeneration is stamped into
`diagrams/process-versions/`. Ten prompts, none rendered.
