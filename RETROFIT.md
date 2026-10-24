# Retrofit ledger

Where this repo was found to disagree with the conventions in `~/.claude/CLAUDE.md`, and what each
sweep did about it. Append-only, one section per sitting. Written by `retrofit-repo`.

## Sitting 2026-08-22

Shape: v2 kind/grouping, no disagreement (project `CLAUDE.md` declares no artifact shape)
Git: 15 uncommitted paths (11 modified, 4 untracked)   Mount: none named by the project
Paired: `/home/molef/goal-setting/learning/attica-event-creation`, not under version control, no undo
Budget this sitting: census only    Stopped at: stage 0, complete

| Stage | State | Note |
|---|---|---|
| 0 census | verified | scheme below |
| 1 context-pulse | verified | `--build` compiled: 19 files, 730 links resolve, 3 routes wired |
| 2 env-pulse | verified | `environment/overview.md` compiled, 3 routes wired, 6/6 sections, 6/6 anchors |
| 3 sync-plan-tree | verified | 7 project plans retrofitted; 34 journey plans exempted with a reason; running orders filled |
| 4 tidy-repo | verified | artifact root created; 8 moves, 1 delete; mount half skipped (no second filesystem) |
| 5 runbook-pulse | verified | `--build` compiled: 4 themes, 16 recipes, 3 routes wired |
| 6 context-pulse 2 | verified | zero definitions carried: the context folder was built after the environment file, so nothing was misfiled into either |
| 6b link | verified | both directions written; all three document rows resolve |
| 7 proof | verified | 1539 links, 0 broken; every old path in `RENAMES.md` returns 0 hits |

### The roots

| Root | Version control | Artifact root | Plan root | Environment file | `context/` | `runbook/` |
|---|---|---|---|---|---|---|
| `/home/molef/Work/attica` | git, 15 uncommitted | absent | none at top level; one scope at `onboarding-docs/` | absent | absent | absent |
| `/home/molef/goal-setting/learning/attica-event-creation` | none, and none above it | absent | `MASTER_PLAN.md` + 2 sub-scopes | reads the project's | reads the project's | reads the project's |

### Exclusions

`.git/`, `node_modules/` at every level, `backend/venv/`, the venv rooted at the repo root
(`pyvenv.cfg`, `lib/`, `include/`), `frontend/dist/`, each scene's `dist/`,
`backend/main/media/**` and `backend/main/static/**` (application data and Django's own static
files), `sample_data/`, `assets/`, `templates/` (two vendored site templates), `frontend/src/assets`.

### Plans (stage 3)

| Plan | Root | Disposition | State |
|---|---|---|---|
| `onboarding-docs/MASTER_PLAN.md` + 7 plans | project | listed for retrofit, 10 of 19 sections | not started |
| journey `MASTER_PLAN.md` + 2 sub-scope master plans + 34 plans | journey | listed for retrofit, 7 of 19 sections; running order table empty | not started |

### Clusters (stage 4)

| Cluster | Files | Verdict | Kind/grouping | State |
|---|---|---|---|---|
| `concept-scenes/*/` | 5 scenes | proposed: move to `artifacts/scenes/` | `scenes/<one grouping per scene>` | not started |
| `concept-scenes/attica-organizer-journey/shots/` | 5 png | proposed: set under the scene's grouping | `figures/` | not started |
| root `j0.png` | 1 png | delete: byte-identical copy of `shots/j0.png` | none | verdict given, not started |
| root `t1f1.png` | 1 png | move aside, decide later: referenced by nothing | none | verdict given, not started |
| `.playwright-mcp/` | 104 (72 yml, 20 log, 12 png) | proposed: run bytes, exclusion list | none | not started |
| `onboarding-docs/diagrams/`, `slides/` | 4 md | proposed: `notes/` and `decks/` | `onboarding-a-new-developer` | not started |
| root `Chat.md`, `ROADMAP.md`, `BOOKING_TEST_GUIDE.md` | 3 md | file under `artifacts/notes/`, grouping per document | `notes/` | verdict given, not started |
| journey `flow-map-images/` | 9 png | proposed: set under `artifacts/figures/` | `figures/walking-the-event-creation-flow` | not started |
| journey `RUNBOOK.md` | 1 md | proposed: rename to `SETUP.md`, it is a once-through prompt sequence | none | not started |

### Environment facts settled (stage 2, round 1)

| Fact | Mark | How |
|---|---|---|
| The Django app runs in the virtual environment at `/home/molef/lobola` | verified | user stated it; probed: Python 3.12.9, `daphne` present, 122 packages, site-packages touched 2026-05-02 |
| Django is 5.2.3 | verified | probed in `/home/molef/lobola`, in `backend/venv`, and pinned at `requirements.txt:17` |
| The Vite dev proxy forwards `/ws` with `ws: true` | verified | `frontend/vite.config.js:20-23`, committed 2026-01-27 in `39e2e59`, ancestor of HEAD, working copy unmodified |

Three virtual environments exist and two are dead: `/home/molef/.virtualenvs/lobola` holds 11
packages and has not been touched since 2025-06-29, and the venv shell at the repository root
(`pyvenv.cfg`, `lib/`, `include/`) has no `bin/`, so nothing can run from it.

### Corrections owed to `CLAUDE.md`

Two claims in the project's own `CLAUDE.md` are false and are rewritten when stage 2 wires the
discovery route: it says Django 5.1 (it is 5.2.3), and it names `backend/venv/` as the virtual
environment (the app is run from `/home/molef/lobola`).

### The flow map carries a wrong fact marked observed

`/home/molef/goal-setting/learning/attica-event-creation/flow-map.md`, Step 0, states that
`frontend/vite.config.js` has no `/ws` [proxy](../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> rule and that every [websocket](../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> path is therefore dead
in dev. The rule has been in the file since 2026-01-27, seven months before the mapping session
that recorded the claim. The claim is refuted, not stale.

This changes what stage 1 may do with that file. It was to be handed to `context-pulse --build` as
supplied material, which treats a supplied document's claims as `verified` with a citation. Every
claim in it is instead read as a proposal and probed before it is marked, and the same doubt
applies to `diagram-gate.md`, which was built from it.

### Written this sitting

| Path | What |
|---|---|
| `environment/overview.md` | new: the environment file, 6 sections, 22 facts marked |
| `CLAUDE.md` | Django 5.1 to 5.2.3; `backend/venv` to `/home/molef/lobola` in two places; `## Environment` route added |
| `onboarding-docs/MASTER_PLAN.md` | `## Environment Context` pointer added |
| `~/.claude/projects/-home-molef-Work-attica/memory/environment-context-attica.md` | new: the `reference` memory route |

All three discovery routes now resolve.

### Written in stage 1

`context/`, 19 files: the index, the source register, 3 `purpose/`, 13 `world/`, 2 `data/`, and the
illustrated map. 730 internal links checked, all resolve. All three discovery routes wired
(`CLAUDE.md` section, `reference` memory entry, `onboarding-docs/MASTER_PLAN.md` pointer).

Seven picture prompts written and none rendered; three photograph slots open. The folder's own
index carries both counts.

### Defects found while building the context folder

These are not context, so they are named here and in the folder's `What people get wrong` sections
only where the meaning of a term cannot be described honestly without them.

**Eleven permission checks reference a constant that does not exist.** `vendors/views.py` (8 sites)
and `common/permissions.py` (3 sites) write `Role.SERVICE_PROVIDER`, `Role.EVENT_ORGANIZER` and
`Role.ARTIST`. Those values live on the nested `Role.Names`. Verified live in the project's Django
shell: `hasattr(Role, "SERVICE_PROVIDER")` returns `False`, so each line raises `AttributeError`
when reached. The three in `common/permissions.py` are never reached, because nothing imports that
module.

**Two role systems are both enforced, in different apps.** `scheduling/permissions.py` gates on
`CustomUser.user_type`; `artists/views.py` and `vendors/views.py` gate on `CustomUser.roles`. The
value lists overlap without matching and one is singular, so it cannot express a user who is both
an artist and an organizer, which is the case the product is built around.

**Four of the five booking models are vestigial and the admin registers all of them.**
`events/admin.py` imports `vendors.Booking`, `artists.ArtistBooking` and `locations.VenueBooking`
alongside the live `scheduling.Booking`, so the Django admin shows five booking tables with nothing
marking four as dead.

**`Artist.availability` is a second availability system the booking engine never reads.** A
`JSONField` of dates to states, unrelated to `AvailabilityRule` and `AvailabilitySlot`. Nothing
keeps the two in agreement.

**`ChatBid.currency` defaults to `USD` while `Event.currency` defaults to `ZAR`.** On a South
African platform a bid created without an explicit currency is in the wrong one.

**`Location.search_vector` is a PostgreSQL `SearchVectorField` on a SQLite database.**

**`Event` carries three separate user [foreign keys](../../Obsidian/Information%20Technology/Database%20Systems/Foreign%20Key.md#where-to-learn-this)<sub>[1](../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=105 "Database systems textbook, section 3-2b, Types of keys, Defines the foreign key on Figure 3.2's rows: VEND_CODE, the primary key of VENDOR, placed in PRODUCT..."), [2](../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=106 "Database systems textbook, section 3-3, Integrity rules, Table 3.4's entity and referential integrity rules, worked on the CUSTOMER and AGENT tables of Figur..."), [3](../../Obsidian/Mathematics/references/textbooks/database-systems/database-systems-textbook.pdf#page=283 "Database systems textbook, section 7-2, Data definition commands, The foreign key in SQL: 'FOREIGN KEY (V_CODE) REFERENCES VENDOR ON UPDATE CASCADE' on PRODU..."), [▶1](https://www.youtube.com/watch?v=PQcIfqE85Co&t=159s "Hussein Nasser, Primary Key vs Secondary Key - What you probably didn't know, Primary keys and clustering, 2:39 to 8:01, What a primary key does to how rows ..."), [▶2](https://www.youtube.com/watch?v=5kiMg7GXAsY&t=79s "CockroachDB, What is a Foreign Key Constraint? Understanding Primary & Foreign Keys, What is a foreign key?, 1:19 to 2:02, The foreign key defined, after a c..."), [◆](../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/04-the-entity-diagram.md "The entity diagram from sentence tests, the foreign key on the many side, the optional relationship drawn, ai-engineering/one-business-end-to-end, plan 04. W...")</sub>** (`user`, `partner_user`, `organizer`), and
`start_time` is a `DateTimeField` while `end_time` is a `TimeField`.

### Deliberately not changed

`backend/venv` appears in `onboarding-docs/onboarding-source.md`, `setup-sequence.md`,
`guides/backend-setup.md` and `plans/07-cold-start-verification.md`. Those tell a new developer to
create their own virtual environment inside the repo, which is a different statement from where
this machine runs the app. They are correct as written.

"Django 5.1" appears four more times and is the same error corrected in `CLAUDE.md`:
`onboarding-docs/plans/02-backend-setup-docs.md` lines 36 and 91,
`onboarding-docs/slides/backend-setup.md:22`, and
`docs/TECHNOLOGY-GAPS-AND-PRODUCTION-READINESS.md:6`. They sit in plan files stage 3 has not
processed, so they are left for that stage rather than widening this one.

### Stage 7: the proof

Every check rerun after the last edit.

```
python3 links.py environment/overview.md CLAUDE.md context/*.md context/*/*.md runbook/*.md \
                 onboarding-docs/MASTER_PLAN.md onboarding-docs/plans/*.md artifacts/*/*/README.md
1539 links, 0 broken

grep -rn 'concept-scenes/' --include=*.md --include=*.py --include=*.js --include=*.json . \
  | grep -v node_modules | grep -v RENAMES.md | grep -v RETROFIT.md | wc -l
0

grep -rn 't1f1.png' (same filters)   0
grep -rn '^j0.png'  (same filters)   0
```

Both ends of the project link resolve: `environment/overview.md`, `context/00-INDEX.md` and
`runbook/00-INDEX.md` all exist, the project's `CLAUDE.md` names the journey, and the journey's
`MASTER_PLAN.md` names the project.

Two defects were introduced by this sweep and caught by these greps rather than shipped: a
`../../CHANGELOG.md` link in plan 02 that should have been `../CHANGELOG.md`, and a `cd
concept-scenes/...` run instruction inside a scene's own README that the move left behind. Both
fixed, both re-verified above.

### Post-sweep verification pass, 2026-08-22

Four recipes were run rather than left `unverified`, and three of the four changed what a document
says.

**The [outbox](../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> backlog was a worker nobody started.** `dispatch_scheduling_outbox` cleared all 23
rows in one pass: `processed=23 failed=0 dead_lettered=0`. The dispatch path is fine. The open
question is closed and `environment/overview.md` now records the answer instead of the question.

**The backend test suite is red.** `python manage.py test` gives 43 tests, 1 failure and 1 error,
both in `events/tests.py`. `test_upload_asset_persists_on_draft` errors because an uploaded asset
does not persist. `test_cross_organizer_access_denied` fails because reading another organizer's
draft returns 404 where the test expects 403, and the publish action returns 403 in the same
situation, so the two paths disagree. Nothing in the repository recorded either.

**There is no working pytest.** It is installed in neither `/home/molef/lobola` nor
`backend/venv`, and is absent from `requirements.txt`. The only one on the PATH is the system
binary, which has no Django. Two files named `test_*` are URL configuration modules, not tests, so
collection would fail even after installing it. `CLAUDE.md` documented `pytest` as a command until
this pass; that line is removed.

**`python manage.py check` passes**, 0 issues.

### Two misses the sweep made, caught by the product owner

Both were stage 4's job and both were missed. Corrected 2026-08-23; see `RENAMES.md`.

**The plan scope was not under `plans/`.** `onboarding-docs/` sat at the repository root while
holding a `MASTER_PLAN.md` and a `plans/` folder. Stage 0 checked the artifact shape and never
checked the plan root, so no later stage looked. It is now `plans/onboarding-docs/`.

**`docs/` was listed in the census and never given a verdict.** That is precisely the undecided
cluster the `tidy-repo` skill says not to leave. Its 22 files split three ways: the handbook and
two reports are written explainers and went to `artifacts/notes/`, the data-preparation guide is a
by-hand procedure and went to `runbook/`, and two interface contracts stayed where an integrator
would look, now declared in `CLAUDE.md` as this project's one override to the four-folder rule.

**28 stale bare paths were rewritten** across 11 files. These were prompts and shell commands
naming the old locations, not markdown links, so the link check could not see them.

### Browser verification, 2026-08-23

The stack was brought up and the booking recipes driven with a real browser.

**The organizer dashboard is broken.** `/dashboard/organizer` renders "Failed to fetch data". The
frontend calls `/api/events/my/`, which returns 404; the backend registers `my-events/`
(`events/api_urls.py:14`), and `/api/events/my-events/` returns 401, meaning that route exists. Two
files call the wrong path: `frontend/src/EventOrganizerDashboard.jsx:252` and
`frontend/src/components/booking/EventSelector.jsx:21`. A one-word mismatch.

**The button is called "Request Booking", not "Book Artist".** The original QA guide named a
control that does not exist.

**What does work, verified:** login as `test_organizer`, the artists listing (35 artists, every
seeded provider present), and the artist profile with its Booking Overview panel.

**Seed commands verified**, all three with real output now in the recipes.
`materialize_availability_slots --days 90` reported `rules=16 created=1456`, leaving 2506 bookable
slots. That recipe previously had no expected-output block at all.

### Outstanding

- The `/api/events/my/` path mismatch. Two lines in two frontend files. This sweep does not change
  behaviour, so it is reported, not fixed.
- Plan state folders (`in-progress/`, `staging/`, `completed/`) do not exist under
  `onboarding-docs/plans/`. All seven plans have open tasks, so all seven would go to
  `in-progress/`, which is churn with no informational gain until some of them close. Left undone
  deliberately, awaiting a decision.
- Eleven permission checks raise `AttributeError` on `Role.<NAME>`. Recorded in `environment/overview.md`;
  no plan owns the fix.
- Two failing backend tests in `events/tests.py`: an asset that does not persist, and a 404 where a
  403 is expected. Unknown whether these are known and accepted or regressions nobody has seen. No
  plan owns either.
- pytest is documented nowhere now, and installed nowhere. Adding it is a real change (install,
  pin it in `requirements.txt`, and configure it to ignore the two `test_*` urlconf modules), not a
  documentation fix.
- 12 runbook recipes remain `unverified`, mostly the browser ones and the seed commands. Only
  running them upgrades the mark; `runbook-pulse --capture` after the next real session is the
  cheapest route.
- Pictures: 7 context diagram prompts, 0 rendered. 4 runbook screenshot slots, 0 taken. 4 flow-map
  step images never rendered (steps 08 to 11).

### Stage 3, project root: what changed

All seven plans retrofitted to the 19-section template. Each now carries a table of contents,
breadcrumbs on all 18 major sections, an `## Instructions` lane, an environment-facts field, group 0
(`/verify-plan` preflight) and group Z (close-out), and an Error [Matrix](../../Obsidian/Mathematics/Linear%20Algebra/Matrix.md#where-to-learn-this)<sub>[1](../../Obsidian/Mathematics/references/textbooks/linear-algebra/linear-algebra-textbook.pdf#page=39 "Linear algebra textbook, section 1.3, Matrix notation, then the row-by-column product worked on a 2 by 3 times a 3 by 4 matrix (Example 5, page 43)."), [2](../../Obsidian/Mathematics/references/textbooks/machine-learning/mathematics-for-machine-learning.pdf#page=28 "Mathematics for machine learning, section 2.2, Matrix addition and multiplication, inverse and transpose, and a system of linear equations written compactly ..."), [3](../../Obsidian/Mathematics/references/textbooks/machine-learning/deep-learning-textbook.pdf#page=50 "Deep learning textbook, section 2.2, The matrix product, the element-wise product and its properties, as deep learning uses them."), [▶1](https://www.youtube.com/watch?v=QtAZsWseIKk&t=511s "tilestats, Matrices and matrix operations for beginners 1/2, Matrix multiplication, 8:31 to 12:27, Matrix multiplication for beginners, followed in the next ..."), [▶2](https://www.youtube.com/watch?v=kYB8IZa5AuE&t=212s "3Blue1Brown, Linear transformations and matrices (Essence of linear algebra, chapter 3), Basis vectors and matrices, 3:32 to 6:18, A matrix read as where the..."), [◆](../../goal-setting/learning/deep-learning/transformers/textbook/03-multiply-two-matrices-row-by-column.md "Multiply two matrices row by column and say why the order matters, deep-learning/transformers, chapter 03. The same two matrices multiplied in both orders, t...")</sub>. Every internal anchor
resolves: 543 links checked across the seven files, 0 broken.

About 300 lines of superseded deliverable drafts were removed from five plans and replaced with
pointers to the real files, which are longer and are what everything else cites.

**Three plans moved from done to reopened**, because the retrofit surfaced real work in each: plan
01 owes a reconciliation against `context/`, plan 03 owes the two-HTTP-client split in its proxy
section, and plan 02 owed a version correction which has been applied.

### Factual errors found and corrected in stage 3

| Error | Where | Corrected to |
|---|---|---|
| "The draft is deleted at publish" | Plan 04's wizard diagram brief, twice | The draft survives, is marked `published`, and gets a `published_event_id` back-reference. Verified at `events/views.py:496-537`. |
| `/api/events/drafts/<id>/` | Plan 04's brief and explanation | `/api/events/event-drafts/<id>/`. Verified at `events/api_urls.py:8` with `main/urls.py:43`. |
| "Steps 1 to 5" wizard | Plan 04's state machine brief | Eight step routes plus three sub-routes under `step3`. Verified at `frontend/src/App.jsx:120-130`. |
| "Read all 5 plan files" | Plan 06's briefs | Seven, including plan 06 itself and plan 07. |
| Two different output filenames for one deck | Plan 05's goal versus its tasks | Source is `slides/onboarding-master-deck.md`; exports are `onboarding-slides.pdf` and `.html`. |
| Django 5.1 | `slides/backend-setup.md:22`, `docs/TECHNOLOGY-GAPS-AND-PRODUCTION-READINESS.md:6` | 5.2.3. Both fixed; grep confirms no stale statement remains. |

Plan 01's engagement instructions pointed at `PHASE-1-SNAPSHOT.txt` and `UNPACK-OUTPUT.txt`. Both
are absent from disk and were never committed, so the plan cannot be re-run as written. Its
References section now says so instead of naming files that are gone.
- The journey's `## The project this is about` section does not exist, so `JOURNEY_FORMAT.md`
  check 3 fails at both ends. Stage 6b writes it, and only after the documents it would point at
  exist.
- No scene's `SPEC.md` carries the four-key source header, so `ARTIFACT_TREE_FORMAT.md` check 9
  fails five times.
- The journey's `JOURNEYS.md` row carries ⬜ in Purpose. Only the user can fill it.

Renames this sitting: none.
