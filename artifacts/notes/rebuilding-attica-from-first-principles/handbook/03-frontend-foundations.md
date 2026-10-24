# 03. Frontend Foundations

## Purpose
This chapter teaches the React material required to understand and independently reconstruct the frontend architecture used in this system. It focuses on concepts that are visibly important in the codebase, not every possible React feature.

Prerequisites: [01 System Map](./01-system-map.md), [02 Knowledge Graph](./02-knowledge-graph.md).  
Follow-up: [06 Event Creation and Draft Workflows](./06-event-creation-and-draft-workflows.md), [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md).

## Required Background

### You Should Already Know
- basic JavaScript syntax
- ES modules and imports
- promises and `async`/`await`
- HTML forms and DOM event basics

### This Chapter Will Teach
- React mental model for route-driven applications
- hook usage patterns that matter in this codebase
- React Router concepts needed for protected and nested flows
- browser fetch and persistence concerns tied to frontend architecture

### Deferred to Later Chapters
- product-specific event draft logic
- scheduling-specific planner and calendar thinking
- realtime chat UI state
- deeper tradeoffs around optimistic updates and server authority

## React Mental Model Needed for This System

### Component Tree as UI Composition
- Why it exists: the app is composed from pages, layouts, providers, and feature components.
- Where it appears: `frontend/src/App.jsx`, navbar composition, page components, booking widgets.
- Mastery unlocks: you can decide which concerns belong in app shell, layout, page, or leaf component.

### Props vs Local State vs Shared State
- Why it exists: some data is ephemeral to one page, some must survive navigation, and some depends on the logged-in user everywhere.
- Where it appears: local page loading flags, auth context, event creation provider.
- Mastery unlocks: you can choose state location deliberately instead of lifting everything or duplicating it.

### Render Cycle and State-Triggered Rerenders
- Why it exists: the UI reacts to token changes, route changes, fetch results, and form inputs.
- Where it appears: auth refresh flow, dashboard [bootstrap](../../../../../../Obsidian/Mathematics/Statistics/Bootstrap.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=575 "Introduction to probability for data science, section 9.2, Why bootstrapping is needed, a brute-force approach first, the procedure and the bootstrapped dist..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=567 "Introduction to probability for data science, section 9.1.4, The standard error of the sample mean and how it sets a confidence interval's width (Example 9.4)."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/probabilistic-machine-learning-an-introduction.pdf#page=176 "Probabilistic machine learning: an introduction, section 4.7.3, The parametric and non-parametric bootstrap as an approximation to an estimator's sampling di..."), [▶1](https://www.youtube.com/watch?v=AA7Jtuu9TaE&t=100s "TileStats, Bootstrap confidence intervals: explained, How to calculate a 95% bootstrap confidence interval, 1:40 to 5:00, Builds a 95 percent bootstrap inter..."), [▶2](https://www.youtube.com/watch?v=AA7Jtuu9TaE&t=300s "TileStats, Bootstrap confidence intervals: explained, Do bootstrap confidence intervals work?, 5:00 to 10:36, Checks whether the bootstrap interval covers th..."), [◆](../../../../../../goal-setting/learning/mathematics/statistics/sampling/textbook/08-the-percentile-bootstrap.md#84-why-with-replacement-and-the-bootstrap-standard-error "The percentile bootstrap over whole products, mathematics/statistics/sampling, chapter 08, section 8.4. Why resampling is done with replacement, and the boot...")</sub> effects, planner page bootstrap, wizard progress updates.
- Mastery unlocks: you can reason about why data appears stale, flickers, or refetches unexpectedly.

### Controlled Forms and Input Synchronization
- Why it exists: creation flows and booking forms need consistent local state before data is sent to the backend.
- Where it appears: step forms, booking request pages, search forms, profile edit flows.
- Mastery unlocks: you can design predictable forms and validation boundaries.

## Hooks Required To Understand the Codebase

### `useState`
- Why it exists: pages need local UI state such as loading, error, selection, and fetched payloads.
- Where it appears: planner page, booking pages, dashboards, auth provider.
- Mastery unlocks: you can manage page-local interaction state without inventing a global store.

### `useEffect`
- Why it exists: fetching, token refresh handling, localStorage persistence, and route-derived [bootstrapping](../../../../../../Obsidian/Mathematics/Statistics/Bootstrap.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=575 "Introduction to probability for data science, section 9.2, Why bootstrapping is needed, a brute-force approach first, the procedure and the bootstrapped dist..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=567 "Introduction to probability for data science, section 9.1.4, The standard error of the sample mean and how it sets a confidence interval's width (Example 9.4)."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/probabilistic-machine-learning-an-introduction.pdf#page=176 "Probabilistic machine learning: an introduction, section 4.7.3, The parametric and non-parametric bootstrap as an approximation to an estimator's sampling di..."), [▶1](https://www.youtube.com/watch?v=AA7Jtuu9TaE&t=100s "TileStats, Bootstrap confidence intervals: explained, How to calculate a 95% bootstrap confidence interval, 1:40 to 5:00, Builds a 95 percent bootstrap inter..."), [▶2](https://www.youtube.com/watch?v=AA7Jtuu9TaE&t=300s "TileStats, Bootstrap confidence intervals: explained, Do bootstrap confidence intervals work?, 5:00 to 10:36, Checks whether the bootstrap interval covers th..."), [◆](../../../../../../goal-setting/learning/mathematics/statistics/sampling/textbook/08-the-percentile-bootstrap.md#84-why-with-replacement-and-the-bootstrap-standard-error "The percentile bootstrap over whole products, mathematics/statistics/sampling, chapter 08, section 8.4. Why resampling is done with replacement, and the boot...")</sub> are side effects.
- Where it appears: auth user bootstrap, event creation persistence, planner data loading.
- Mastery unlocks: you can separate rendering from side effects and avoid accidental infinite loops.

### `useContext`
- Why it exists: auth and event creation state are needed across multiple routes and components.
- Where it appears: auth provider/context, event creation context, components reading current user or shared draft state.
- Mastery unlocks: you can design cross-cutting state without prop drilling through the entire app.

### `useReducer`
- Why it exists: multi-step workflows produce state transitions that are easier to manage as actions than as ad hoc `setState` calls.
- Where it appears: event creation reducer.
- Mastery unlocks: you can structure long-lived workflows with explicit transitions and clearer merge logic.

### `useMemo`, `useCallback`, and `useRef`
- Why they exist: this codebase uses them as stability and orchestration tools around derived values, reusable callbacks, and mutable instance-like values.
- Where they appear: scheduling planner derived role flags and filtered resources, auth refresh guard refs, event creation memoized selectors.
- Mastery unlocks: you can identify when memoization or mutable refs support architecture, and when they are just optional optimization.

## React Router Material You Need

### Route Tree Thinking
- Why it exists: the application is organized as a hierarchy of routes rather than one long conditional component.
- Where it appears: `App.jsx` route definitions.
- Mastery unlocks: you can design navigation around product surfaces and workflows.

### Guarded Routes
- Why it exists: many pages only make sense for authenticated users.
- Where it appears: `requireAuth` and `guestOnly` wrappers around route elements.
- Mastery unlocks: you can connect auth state to navigation without duplicating permission logic in every page.

### Nested Routes and Layout Routes
- Why they exist: the listing wizard shares layout, progress, and route context across steps.
- Where they appear: `/listing/:eventId/*` route subtree and `ListingWizardLayout`.
- Mastery unlocks: you can build multi-step flows whose steps remain URL-addressable but still share state and layout.

### Route Params, Redirects, and Navigation State
- Why they exist: pages such as event detail, booking detail, and direct messages depend on identifiers in the URL, and some flows redirect users depending on auth or state.
- Where they appear: detail routes, navigate calls, redirect routes in `App.jsx`.
- Mastery unlocks: you can use URLs as part of the application state model instead of hiding everything in memory.

## Browser and Client Concerns

### Fetch API Basics
- Why it exists: most frontend data access is done with `fetch`, not a large client-side data library.
- Where it appears: auth calls, detail pages, wizard pages, planner page.
- Mastery unlocks: you can build a thin API layer and know when a dedicated client library is optional.

### Request Headers and Bearer Tokens
- Why they exist: protected backend endpoints expect [JWTs](../../../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> in the `Authorization` header.
- Where it appears: auth fetch wrappers, planner page requests, booking pages.
- Mastery unlocks: you can centralize authenticated access patterns.

### JSON vs FormData
- Why it exists: most endpoints consume JSON, but some uploads or multipart interactions require different request shapes.
- Where it appears: chat attachment upload and profile/media flows.
- Mastery unlocks: you can distinguish data-shape concerns from business logic concerns.

### Aborting Stale Requests
- Why it exists: pages with changing filters or route transitions should avoid stale state writes.
- Where it appears: list/detail pages using `AbortController`.
- Mastery unlocks: you can prevent [race conditions](../../../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub> caused by late network responses.

### localStorage-Backed Persistence
- Why it exists: tokens and long-lived draft state survive refreshes and route changes.
- Where it appears: auth tokens/current role and event creation [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>.
- Mastery unlocks: you can decide what deserves browser persistence and how to keep it aligned with authoritative backend state.

## UI Architecture Material

### Container vs Presentational Responsibilities
- Why it exists: some components fetch and orchestrate state while others mainly render domain data.
- Where it appears: page components such as scheduling planner vs display components such as status badges or provider cards.
- Mastery unlocks: you can keep complex orchestration from leaking into every visual component.

### Colocated Page State vs Shared Provider State
- Why it exists: not all reusable data should be global; only cross-route or cross-feature state deserves a provider.
- Where it appears: planner page local state compared with auth and event creation providers.
- Mastery unlocks: you can avoid both over-globalization and repetitive state duplication.

### Deriving Progress and Navigation State
- Why it exists: wizard progress and next/previous behavior depend on route and draft state together.
- Where it appears: step progress helpers and layout routing.
- Mastery unlocks: you can compute navigation rules from state rather than hard-coding fragile UI transitions.

## External Ecosystem Concepts To Know

### Vite
- Why it exists: the project uses Vite for dev server and build tooling.
- Where it appears: `frontend/package.json`.
- Mastery unlocks: you can distinguish build tooling from application architecture.

## Advanced Concepts: State Location and Coordination

### Route Params as State Model
- Why it matters: URLs like `/booking-detail/:id` and `/organizers/:id` encode critical identity, not just navigation.
- Pattern: avoid storing the ID in state when the URL is already the source of truth.
- Common mistake: fetching by URL param, then duplicating that ID in component state, then losing sync when the route changes.
- How to apply: use `useParams()` to extract IDs, not `useState` to store them. Let the URL be the schema.

### Frontend State vs Backend Truth Authority
- Why it matters: the browser is convenient but not authoritative; the server is slow but correct.
- Pattern: 
  - **Browser-safe state**: form drafts, filters, UI flags (modal open/closed), loading spinners
  - **Server-authoritative state**: bookings, published events, user permissions, financial data
- Common mistake: [caching](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> a booking status in `useState` and not refreshing when the server changes it.
- How to apply: after writing a booking-related action (approve, counter, withdraw), re-fetch from the server rather than optimistically updating local state.

### Handling Async Data Loading and Races
- Why it matters: pages with route params or changing filters create stale responses (a fetch from page A arrives after page B loads).
- Pattern: use `AbortController` to cancel in-flight requests when route changes.
- Common mistake: setting state from a response even if the component unmounted or the route changed.
- How to apply:
  ```javascript
  const controller = new AbortController();
  useEffect(() => {
    fetch(url, { signal: controller.signal })
      .then(...)
      .catch(err => {
        if (err.name === 'AbortError') return; // ignore
        // handle real errors
      });
    return () => controller.abort();
  }, [url]);
  ```

### Shared State Without Global Store Bloat
- Why it matters: auth, current role, and event creation state are needed across multiple routes; everything else should be page-local.
- Pattern: use `useContext` for true cross-cutting concerns; use `useState` or `useReducer` inside pages for everything else.
- Common mistake: putting every piece of fetched data into a global context, making every component depend on one massive provider.
- How to apply: ask "will this state survive a route change?" If yes, it belongs in a provider. If no, keep it in the page.

### MUI
- Why it exists: some global visual infrastructure and components come from Material UI.
- Where it appears: app theme wrapper and imported UI packages.
- Mastery unlocks: you can tell which UI concerns are framework-level and which are library-provided styling conveniences.

### Incidental vs Architecturally Important Libraries
- Architecturally important here:
  - `react-router-dom` because routes shape the app
  - auth/context patterns because they shape shared state
- Incidental here:
  - icons, date pickers, animation libraries, and many display helpers
- Mastery unlocks: you can rebuild the same architecture with different library choices.

## Grounded Examples

### Auth Provider Pattern
Small example:
- The auth provider loads tokens from `localStorage`, refreshes them when needed, fetches the current user, and exposes `login`, `register`, and `logout`.

General pattern:
- A top-level provider owns identity state and exposes a narrow interface to the rest of the app.

Intent behind the design:
- [Authentication](../../../../../../Obsidian/Information%20Technology/Security/Authentication.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=20 "System design interview, chapter 1, Stateless web tier, Works a concrete case: user A's session data lives on server 1, so a request routed to server 2 fails..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=403 "System design big archive, 5 REST API Authentication Methods, Basic authentication, session cookies, signed tokens, OAuth access tokens and API keys side by ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=36 "System design big archive, Session, Cookie, JWT, Token, SSO, and OAuth 2.0 Explained in One Diagram, How a login is remembered: a server-side session with a ..."), [▶1](https://www.youtube.com/watch?v=_t8EPImx9LI&t=240s "Hussein Nasser, Five Password Authentications From Least to Most Secure, Auth Method 1: Authentication password plain text, 4:00 to 8:00, The first of five p..."), [▶2](https://www.youtube.com/watch?v=fyTxwIa-1U0&t=18s "ByteByteGo, Session Vs JWT: The Differences You May Not Know!, Session authentication, 0:18 to 1:23, Session authentication, before the chapter on the JSON W..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/06-django-refresher.md "Django, refreshed, system-design/foundations, chapter 06. Section 6.2 logs in to the Django admin with curl, carrying the session cookie and the `csrftoken` ...")</sub> is cross-cutting and should not be reimplemented separately inside every page.

How to recreate without copying:
- Define one identity provider with clear responsibilities: token storage, user [bootstrap](../../../../../../Obsidian/Mathematics/Statistics/Bootstrap.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=575 "Introduction to probability for data science, section 9.2, Why bootstrapping is needed, a brute-force approach first, the procedure and the bootstrapped dist..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=567 "Introduction to probability for data science, section 9.1.4, The standard error of the sample mean and how it sets a confidence interval's width (Example 9.4)."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/probabilistic-machine-learning-an-introduction.pdf#page=176 "Probabilistic machine learning: an introduction, section 4.7.3, The parametric and non-parametric bootstrap as an approximation to an estimator's sampling di..."), [▶1](https://www.youtube.com/watch?v=AA7Jtuu9TaE&t=100s "TileStats, Bootstrap confidence intervals: explained, How to calculate a 95% bootstrap confidence interval, 1:40 to 5:00, Builds a 95 percent bootstrap inter..."), [▶2](https://www.youtube.com/watch?v=AA7Jtuu9TaE&t=300s "TileStats, Bootstrap confidence intervals: explained, Do bootstrap confidence intervals work?, 5:00 to 10:36, Checks whether the bootstrap interval covers th..."), [◆](../../../../../../goal-setting/learning/mathematics/statistics/sampling/textbook/08-the-percentile-bootstrap.md#84-why-with-replacement-and-the-bootstrap-standard-error "The percentile bootstrap over whole products, mathematics/statistics/sampling, chapter 08, section 8.4. Why resampling is done with replacement, and the boot...")</sub>, refresh flow, and auth actions.

### Event Creation Context Pattern
Small example:
- The event creation provider uses a reducer, persists sanitized workflow state to `localStorage`, merges step payloads, and exposes step navigation helpers.

General pattern:
- Long-lived, cross-route workflow state is modeled as explicit transitions plus persistence.

Intent behind the design:
- Multi-step flows become easier to resume and reason about when step state is centralized.

How to recreate without copying:
- Choose a workflow state shape, define actions that describe legitimate transitions, and separate browser persistence from backend draft persistence.

## Recommended Learning References
- React docs:
  - “Thinking in React”
  - “Passing Props to a Component”
  - “State: A Component’s Memory”
  - “Synchronizing with Effects”
  - “Passing Data Deeply with Context”
  - “Scaling Up with Reducer and Context”
  - “Preserving and Resetting State”
- React Router docs:
  - route configuration
  - nested routes
  - layout routes
  - navigation
  - route params
- MDN:
  - Fetch API
  - AbortController
  - localStorage
  - FormData
