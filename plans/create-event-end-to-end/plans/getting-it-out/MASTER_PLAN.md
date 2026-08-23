# Getting It Out

> **This scope's plans interleave with the parent's.** They are not done as a block. The one
> ordering that matters is the running-order table in [the parent master plan](../../MASTER_PLAN.md#running-order).
> The Plans list below is this folder's contents, not a sequence to follow top to bottom.

## Mission

A change that is written on this machine reaches a machine other people can use, by a route somebody
can follow, and there is a way to find out whether it arrived and a way to put it back.

Today there is no such route and no such machine. Attica runs in exactly one place: four processes
started by hand on one laptop, with the database as a 2.2 MB file at `backend/main/db.sqlite3`,
51 MB of uploaded media across 478 files in `backend/main/media/`, and the interface reachable only
through the Vite dev server on port 5173. Nothing in the repository describes a second machine, and
nothing would work on one if it existed: the client has no way to be told where the backend is, the
database engine is written into `settings.py` rather than read from the environment, and the built
frontend has no route that serves it.

Continuous integration exists and does not gate anything. It has run twice, on 2026-07-28 and
2026-08-23, and both runs failed in both jobs. The build it produces is thrown away at the end of
the job.

This scope takes the deployment decision, builds what it chooses, makes one machine reproducible
enough that a second one is a copy rather than an archaeology exercise, and writes down how to ship
and how to check.

---

## What this scope is, in one line per mark

The marks come from [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out),
and this scope is the whole of item 13 there.

**decide** There is no deployment mechanism. Continuous integration exists and nothing ships.

**build** Whatever that decision produces, with the topology logically separable from day one even
while it runs on one machine.

That second line is the constraint on the first. What "logically separable" is taken to mean here,
and why, is in [the decisions taken here](decisions-taken-here.md#logically-separable-is-read-as-four-named-roles-reachable-by-configuration).

---

## What is true today, with a count or a line number on every claim

Read before planning anything here. Every claim below was established against this repository on
2026-08-23, either by reading the file named or by running the command named. Where something was
inferred rather than run, it says so.

### Continuous integration exists, has never passed, and produces nothing

**One workflow, two jobs, no deploy job.** `.github/workflows/ci.yml` runs on every pull request and
every push to `main`. The backend job runs `manage.py check`, `migrate --noinput` and
`test --noinput` against a `redis:7-alpine` service. The frontend job runs `npm run lint` and
`npm run build`. There is no third job, no `environment:`, no secret reference, and no step that
uploads or publishes anything.

**Both runs in its whole history failed.** `gh run list` on 2026-08-23 returns exactly two runs,
`30327265312` on 2026-07-28 and `32620468805` on 2026-08-23, both `failure`. In the newer run the
backend job fails at `Run tests` and the frontend job fails at `Set up Node`, which is the step
before any dependency is installed, so lint and build never executed on either run.

**The backend failure is the two tests already known to be red.** 43 tests, one failure and one
error, both in `events/tests.py`, and they belong to
[making the suites honest](../fixing-create-event/plans/03-reconcile-suite-and-runbook.md). This
scope owns the consequence rather than the cause: a deploy gated on this workflow is gated on
nothing, because red is its normal colour.

**The frontend failure is a lockfile that is not in the repository.** `.gitignore:45` is the bare
pattern `package-lock.json`, so `frontend/package-lock.json` has never been committed:
`git log --all -- frontend/package-lock.json` returns no commits, while the file itself is 213,847
bytes on this disk. `ci.yml` asks `actions/setup-node` to cache against
`cache-dependency-path: frontend/package-lock.json`, and the install step is `npm ci || npm install`.
Both of those need the file. The exact log line is not readable from this account
(`gh run view --log-failed` returns HTTP 403, admin rights required), so the specific cause is
inferred from the untracked lockfile and must be confirmed by reading the log.

**Even when the build runs, its output is discarded.** `npm run build` is `vite build`, which writes
`frontend/dist/`. No step archives it, no step publishes it, and the job ends. So the artifact that
would be deployed is produced and thrown away, twice a run.

### Nothing in the repository describes a second machine

**No container, no compose file, no process manager, no web server config, no deploy script.** A
search of the tracked tree for `Dockerfile`, `docker-compose`, `Procfile`, `nginx`, `*.service` and
anything named `deploy` returns one file, `backend/main/requirements.txt`, matched on the word
"requirements". There is nothing else.

**The one document about running Attica describes four hand-started processes.**
[The execution model](../../../../environment/overview.md#execution-model) is Redis, then Daphne or
`runserver`, then the Vite dev server, then the outbox worker when the booking path is being used.
None of them starts or supervises any other. That is the whole of the deployment story today.

**No runbook recipe is about shipping.** [The runbook index](../../../../runbook/00-INDEX.md) has
three themes, running the web app, preparing the data and driving the app, and 26 recipes across
them. Every one is a terminal command on this machine, the Django admin, or a click path through a
locally running screen.

### Eight settings can be configured and every one falls back silently

**Eight, and no more.** `backend/main/main/settings.py` reads the environment in eight places:
`SECRET_KEY` (`:27`), `DEBUG` (`:31`), `ALLOWED_HOSTS` (`:32`), `CORS_ALLOWED_ORIGINS` (`:140`),
`MAX_UPLOAD_SIZE_BYTES` (`:230`), and the three Sentry values (`:248`, `:256`, `:257`). Every one has
a default that works on a laptop, so forgetting one produces a working application rather than a
refusal to start.

**Two of those defaults are the ones that matter.** `DEBUG` defaults to `True` (`:31`), and
`SECRET_KEY` defaults to a literal beginning `django-insecure-` written into the file at `:29`. An
environment that fails to set them gets a debug-mode application signing its sessions with a key that
is in the repository.

**The database engine is not configurable at all.** `DATABASES` at `:156` to `:161` is a literal
`django.db.backends.sqlite3` pointing at `BASE_DIR / 'db.sqlite3'`, with no `config()` call anywhere
near it. `psycopg2-binary==2.9.10` is already installed by `requirements.txt`, so the driver for
[D6](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions) is
present and the settings file has no way to use it.

**Redis is hardcoded twice.** The channel layer host is the literal tuple `('127.0.0.1', 6379)` at
`:96`, and the cache location is the literal string `redis://127.0.0.1:6379/1` at `:116`. Neither
reads the environment, so Redis cannot move off the box without a code change.

**The webhook configuration is hardcoded too.** `SCHEDULING_WEBHOOK_URLS`, `SCHEDULING_WEBHOOK_TARGETS` and
`SCHEDULING_WEBHOOK_SECRET` are empty literals at `:238` to `:240`. A deployed environment cannot
point the outbox at anything without editing Python. The comment above `MAX_UPLOAD_SIZE_BYTES` at
`:229` reads "Override via env if you need to change without a code release", which names a release
mechanism that does not exist.

### `manage.py check --deploy` reports five issues, four of them unconditional

Run on 2026-08-23 as `DEBUG=False SECRET_KEY=x ALLOWED_HOSTS=example.com python manage.py check
--deploy`, it returns `security.W004` (no `SECURE_HSTS_SECONDS`), `security.W008` (no
`SECURE_SSL_REDIRECT`), `security.W009` (the secret key), `security.W012` (no
`SESSION_COOKIE_SECURE`) and `security.W016` (no `CSRF_COOKIE_SECURE`).

Four of those five are unconditional, because `settings.py` contains no setting whose name begins
`SECURE_`, no `SESSION_COOKIE_SECURE` and no `CSRF_COOKIE_SECURE`: a search of the file for those
names returns nothing. They cannot be satisfied by setting an environment variable, only by adding
settings. `W009` is the conditional one, and it fires whenever `SECRET_KEY` is unset, because the
committed default is prefixed `django-insecure-`.

### The frontend cannot reach a backend that is not a dev proxy

**Zero environment reads in the whole client.** A search of `frontend/src` for `import.meta.env`
returns nothing, across 110 files. There is no `.env` file in `frontend/`, and `vite.config.js`
defines no `define` block. So the built bundle has no way of being told where anything is.

**142 of the call sites are relative paths that only the dev proxy resolves.** `'/api/'` and its
quoted variants appear 142 times in `frontend/src`. `vite.config.js` proxies `/api`, `/vendors`,
`/cart`, `/checkout` and `/ws` to `http://localhost:8000`, and that proxy lives entirely inside the
`server` block, which is the dev server. A production build served from any origin that does not
itself proxy those five prefixes reaches nothing.

**Two call sites hardcode the machine.** `frontend/src/utils/useAxios.js:10` sets
`const baseURL = 'http://127.0.0.1:8000'`, and `frontend/src/LocationDetailPage.jsx:85` opens
`ws://127.0.0.1:8000/ws/waitlist/${id}/`. Both are absolute, both name a loopback address, and both
would be baked into a shipped bundle.

**The other three sockets are already origin-relative and would survive a move.**
`components/notifications/useNotifications.js:82` to `:83` builds its URL from
`window.location.protocol` and `window.location.host`, and `components/chat/ChatRoom.jsx` and
`pages/DirectMessagePage.jsx` do the same. So three of the four socket sites need a proxy rule and
nothing else, and one needs changing.

### Django is configured to serve the built frontend and has no route that does

**The build output is wired into two settings.** `FRONTEND_DIST` is defined at `settings.py:21` as
`frontend/dist`, it is a template directory at `:128`, and it supplies both `STATICFILES_DIRS`
entries at `:202` and `:203`.

**No URL pattern serves it.** `backend/main/main/urls.py` ends at line 61. It has no route for `''`,
no catch-all `re_path`, and no `TemplateView` rendering `index.html`. The only two matches for
`path('', ...)` in the file are the two lines of Django's generated docstring at `:9` and `:12`. So
a request for `/` against the backend is a 404, and the interface has exactly one entrance, which is
the dev server.

**Static and media serving both stop when `DEBUG` goes false.** `urls.py:59` calls
`staticfiles_urlpatterns()`, which returns nothing outside debug mode, and `:60` to `:61` serve
`MEDIA_URL` only under `if settings.DEBUG`. No `whitenoise`, no `django-storages` and no `boto3`
appear in `requirements.txt`. So turning debug off with the current configuration removes the only
thing serving the 51 MB of uploaded media, and nothing replaces it.

### Two machines cannot currently be made the same

**The backend half is reproducible.** All 62 lines of `backend/main/requirements.txt` are exact
pins, `package==version`, with no ranges and no unpinned names.

**The frontend half is not.** The lockfile is untracked, as above, so a fresh clone resolves 25
dependencies and 13 development dependencies from ranges at install time. Two installs a week apart
can produce two different bundles from the same commit.

**There is no committed list of what the application needs from its environment.** `.gitignore:58`
is `**/.env.*`, which matches `.env.example` itself, confirmed by `git check-ignore -v`. So the one
file naming the environment variables is invisible to a clone, and
`git log --all -- .env.example` returns no commits. That file also carries a live credential, which
is not this scope's to handle: rotating it is
[task 2.3 and instruction 3.4 of closing the gaps](../fixing-create-event/plans/02-close-the-gaps.md).
What remains here after that plan runs is that the template is still gitignored, so a clone still
learns nothing about which variables exist.

**All the state is on one disk and none of it is in the repository.** `backend/main/db.sqlite3` is
2.2 MB, `backend/main/media/` is 51 MB across 478 files, and `.gitignore` excludes both
(`*.sqlite3` at `:4`, `media/` at `:66`). 79 migration files across ten apps describe
the schema; nothing describes the data.

---

## The decision this scope owns, and the ones it does not

**D9, deployment, is this scope's to take**, and nothing in this folder is written as though it were
already answered. It is in
[the open decisions](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions),
and the plan that takes it is this scope's first, authored by `populate-plans`. The evidence it will
be taken on is the section above: what exists, what is hardcoded, and what a second machine would
need. Why it is not pre-answered here is in
[the decisions taken here](decisions-taken-here.md#d9-is-left-open-rather-than-answered-here).

**D7, what runs the recurring work, is a constraint on D9 and not a dependency.**
`running-the-workers` already carries the mirror of this sentence: its
[execution decision](../running-the-workers/plans/01-take-the-execution-decision.md) labels every
candidate by what a future deployment decision would do to it, precisely so that neither scope waits
on the other. This scope owes it the return half. **The deployment decision must state, in one line
per candidate, what its answer does to each of the labelled execution-tier candidates**, and that
line is a deliverable rather than a courtesy. If D7 is already taken when this scope runs, the
decision reads the answer instead of the labels, and says which.

**D6, PostgreSQL, and D8, media, both change what has to be deployed and neither is taken here.**
D6 belongs to `contention-and-holds` and D8 to `performance-architecture`. This scope's obligation
is that its answer must not make either of them more expensive: the database engine and the media
location have to be things an environment sets rather than things a code change decides, which today
neither is. That is a property of the mechanism and it can be built before either decision lands.

**Neither D1 nor D2 reaches this scope**, and this is stated because the programme's rule is that a
scope depending on either must plan against the decision being unmade.

D1 decides which of the four live booking representations survives. It does not change what a
deployment mechanism is. It does set the hardest case that mechanism will ever face, because the
migration away from the three that lose is the largest schema and data change this programme
contains. So the rule this scope works under is: **it builds the mechanism and writes the rule, and
never the migration.** How a schema change is shipped, whether the application must tolerate both
shapes while it is in flight, and what happens to a deploy that fails halfway through a migration are
this scope's questions and are answerable now. Which tables move is D1's, and no plan here names one.

D2 decides whether a hold starts at request time or at acceptance. It changes what expires and how
often, and it changes nothing about how a process gets onto a machine. The one place it nearly bites
is that a deploy restarts processes, and a restart is exactly when timed work is dropped or run
twice. So the deployment procedure has to say what happens to work that is in flight when a deploy
lands, expressed as a rule about restarts rather than as a list of jobs. The list is D7's and its
contents are D2's.

**The parent's running order has this scope waiting on `one-booking-truth`, and that edge is kept
as written.** [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out)
also says the scope is "positioned late in the table and worth starting early, because nothing above
is real until it can be deployed". Both are true and they are not in conflict: the edge says where
the scope sits, and the note says the decision is worth taking before its turn. This folder does not
invent a different edge. Why is in
[the decisions taken here](decisions-taken-here.md#the-parents-waits-on-4-edge-is-kept-and-the-scope-is-still-written-to-be-startable).

**What this scope does not touch.** It does not make the test suite green: the two red backend tests
belong to [making the suites honest](../fixing-create-event/plans/03-reconcile-suite-and-runbook.md),
and this scope owns only the consequence, that a workflow which has never passed cannot gate a
release. It does not choose what runs the recurring work, which is `running-the-workers`. It does not
move media to object storage or add image variants, which is `performance-architecture`. It does not
migrate to PostgreSQL, which is `contention-and-holds`. It makes each of those a configuration change
rather than a code change, which is a different job from doing them.

---

## Objectives

1. **Take the deployment decision on what is actually here, rather than on what a deployment
   usually looks like.** One laptop, one SQLite file, 51 MB of media on local disk, a client with no
   configuration mechanism, and continuous integration that has never passed. A decision made
   against a generic Django application will be wrong about all five.
2. **Make one machine reproducible before making a second one.** An untracked lockfile and a
   gitignored environment template mean two machines cannot be made the same today, so shipping to a
   second one would ship something nobody could reason about.
3. **Make the topology separable by configuration.** The web process, the recurring-work process,
   the database and the media store are four roles. They can all sit on one box, and moving any one
   of them off it must be an environment change and not a code change. Today three of the four are
   written into `settings.py`.
4. **Give the interface a way to be told where its backend is.** A client with 142 relative call
   sites, two hardcoded loopback addresses and zero environment reads has exactly one deployable
   shape, which is the one it has today.
5. **Make continuous integration mean something before anything is gated on it.** A workflow that
   fails on every run is not a gate, it is a habit, and building a release on top of it produces a
   release nobody trusts.
6. **Make the route reversible and checkable.** Shipping is half a mechanism. The other half is
   finding out whether it arrived and being able to put it back.

---

## Goals

1. The deployment decision is written down and signed, with every losing candidate carrying its own
   paragraph and its reason, and with one line per execution-tier candidate saying what this answer
   does to it.
2. A change committed on this machine reaches the deployed one by a route a person follows from a
   written recipe, without improvising a step.
3. A person can find out, from outside the machine, which commit is currently serving traffic.
4. A deploy can be put back to the previous version, and that has been done once on purpose.
5. Continuous integration passes, and what it produces is kept rather than discarded.
6. Two installs from the same commit produce the same dependency set, on both halves of the
   application.
7. The database engine, the Redis location, the media location, the allowed hosts and the client's
   backend address are all set by the environment, and none of them is a literal in a source file.
8. Nothing in the deployed environment runs with `DEBUG` true or with the committed secret key, and
   the application refuses to start rather than falling back when either is unset.
9. `manage.py check --deploy` reports zero issues against the deployed configuration.
10. A schema change ships by a written rule, and that rule has been followed once for a real
    migration.

---

## Expected Outcome

Somebody who is not sitting at this laptop opens a URL and uses Attica. A change is committed here,
follows one recipe, and appears there. When it is wrong, it is put back by following the second half
of the same recipe. Every one of those steps has been done by hand at least once by a person reading
the runbook, and none of them required knowing anything that is not written down.

---

## Definition of Done

- [ ] The deployment decision taken, written down, signed and dated: what runs Attica, where, how a
      change gets there, and how it is put back. Every losing candidate carries its own paragraph and
      the reason it lost
- [ ] That decision carries one line per execution-tier candidate from
      [the execution decision](../running-the-workers/plans/01-take-the-execution-decision.md) saying
      what this answer does to it, or, if D7 is already taken, one line saying what this answer does
      to the runner that won
- [ ] The four roles named and separable: which process serves requests, which runs recurring work,
      where the database is, where uploaded media is. Each one reachable by configuration, with the
      one-machine arrangement written down as a choice rather than as an assumption
- [ ] `DATABASES`, the channel layer host and the cache location read the environment, so
      `settings.py:96`, `:116` and `:156` to `:161` carry no literal host, port or engine
- [ ] `SECRET_KEY` and `DEBUG` have no working default: an environment that does not set them fails
      to start, and the `django-insecure-` literal at `settings.py:29` is gone
- [ ] The `SECURE_*`, `SESSION_COOKIE_SECURE` and `CSRF_COOKIE_SECURE` settings exist and are on for
      the deployed environment, and `manage.py check --deploy` reports zero issues against it. The
      current baseline is five, run on 2026-08-23
- [ ] The client can be told where its backend is: a single configured origin the built bundle reads,
      the two hardcoded loopback sites at `frontend/src/utils/useAxios.js:10` and
      `frontend/src/LocationDetailPage.jsx:85` removed, and the 142 relative call sites either
      preserved by a proxy rule in the deployed environment or rewritten, decided once and written
      down
- [ ] The built frontend is served: either a route that renders `frontend/dist/index.html` or a web
      server in front of both, chosen by the decision. `urls.py` currently 404s on `/`
- [ ] Static files and uploaded media are served with `DEBUG` false, which today nothing does
- [ ] `frontend/package-lock.json` is committed, `.gitignore:45` no longer excludes it, and
      `npm ci` succeeds on a fresh clone
- [ ] A committed environment template exists that a clone can read, listing every variable the
      application needs with placeholder values and no real ones. It is not `.env.example`, which
      `.gitignore:58` excludes and which
      [closing the gaps](../fixing-create-event/plans/02-close-the-gaps.md) is separately clearing of
      a live credential
- [ ] Continuous integration passes on `main`. Its history is two runs and two failures, on
      2026-07-28 and 2026-08-23
- [ ] The frontend job's `Set up Node` failure diagnosed from the actual log rather than from the
      untracked lockfile alone, and fixed. Reading the log needs repository admin rights, which this
      account does not have `[owner: human]`
- [ ] The build the workflow produces is kept: `frontend/dist` archived, published or deployed, and
      not discarded at the end of the job as it is today
- [ ] The rule for shipping a schema change is written: whether the application must tolerate both
      shapes while a migration is in flight, what a deploy does when a migration fails halfway, and
      what happens to work in flight when processes restart. Written as a rule, naming no table,
      because which tables move is D1's
- [ ] Something outside the machine reports which commit is serving traffic, so "did it land" is a
      question with an answer
- [ ] ⚠️ The deploy performed by hand end to end, once, from the written recipe: commit a visible
      one-line change here, follow the recipe, then open the deployed URL in a browser and see it
      `[owner: human]`
- [ ] ⚠️ The rollback performed by hand, once, on purpose: put that same deploy back, then open the
      deployed URL again and see the previous version `[owner: human]`
- [ ] ⚠️ The workflow read in GitHub's own interface: open the Actions tab at
      `github.com/mo-rsa24/attica/actions`, open the newest run, expand the failing step, and read
      down to the line that fails. Screenshot it, because the two current failures are the baseline
      every later claim in this scope is measured against `[owner: human]`
- [ ] ⚠️ A cold start proved by hand: clone into an empty directory on this machine, install from the
      committed lockfile and the committed environment template alone, and reach a running
      application without opening any file outside the clone. Note every step that needed knowledge
      not in the repository `[owner: human]`
- [ ] The runbook pair written with `/drip-runbook` and checked with `/runbook-pulse`: how to ship a
      change, and how to confirm it landed. Putting it back is part of the first recipe rather than a
      third. Neither exists, and
      [the runbook index](../../../../runbook/00-INDEX.md) has no theme about shipping at all
- [ ] `/env-pulse` run, and `environment/` gets a whole new section rather than an edited line.
      [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out)
      says this scope owes `environment/` a whole new section, because a deployment mechanism changes
      what "running Attica" means. Two existing facts become incomplete rather than false:
      [the execution model](../../../../environment/overview.md#execution-model), which says four
      hand-started processes on one machine, and
      [the access paths](../../../../environment/overview.md#access-paths), which describe two HTTP
      clients that both assume the dev proxy
- [ ] `/context-pulse` run **only if** the decision introduces a word about Attica's world that
      nobody has defined. Environment, release, rollback and artifact are facts about the machinery
      rather than about events, providers or bookings, so the expected answer is that nothing is
      owed. [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out)
      names only `environment/` and `runbook/`, and the judgement is in
      [the decisions taken here](decisions-taken-here.md#context-is-checked-rather-than-assumed-to-be-owed-nothing)
- [ ] Close out: `/ingest-error-pattern` for anything that bit, then
      `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out`

---

## Sub-Scopes

(none)

---

## Plans

(none yet. This folder's plan files are authored by `populate-plans`. When they exist they are
interleaved into the [parent's running order](../../MASTER_PLAN.md#running-order), which replaces
the single placeholder row standing for this scope today.)

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

**This is the scope that makes that folder's central fact incomplete**, so it is read here as the
starting state rather than as the permanent one. Four processes, started by hand, none of which
supervises another, is a true description of the only machine Attica has ever run on, and this scope
exists to add a second kind of machine beside it.

Three facts decide whether work here lands or silently does nothing.

**Nothing on this machine is supervised**, per
[the execution model](../../../../environment/overview.md#execution-model). There is no init system
holding these processes, so any candidate that assumes one has to bring it, and a candidate that
assumes systemd is available under WSL2 is making a claim about the host that has not been checked.

**Two HTTP clients reach the backend by different routes**, per
[the access paths](../../../../environment/overview.md#access-paths): one goes through the Vite
proxy and one hardcodes `127.0.0.1:8000` and needs CORS. Both routes exist because there is a dev
server. A deployed environment has neither by default, which is why the client's backend address is
a deliverable here rather than a detail.

**The backend suite is red before this scope touches anything**, per
[the known gaps](../../../../environment/overview.md#known-gaps--non-obvious-constraints). Two of 43
tests fail. Any claim here about continuous integration passing has to account for that, and fixing
it is another scope's.

One fact this scope needs is not written in `environment/` and must not be inferred: **where a
deployed Attica would run.** There is no hosting account, no domain, no target host and no budget
recorded anywhere in this repository, and the deployment decision cannot be taken without one. That
is a question for a person, and it is the first thing this scope's first plan has to establish rather
than assume. Recorded in
[the decisions taken here](decisions-taken-here.md#the-environment-question-this-scope-cannot-answer-is-named-rather-than-guessed).

Where a fact this scope needs is not written in `environment/`, stop and ask rather than inferring
it.

---

## Runbook

The by-hand recipes live in [the runbook index](../../../../runbook/00-INDEX.md). Bringing the stack
up on this machine is a recipe there, and this scope links it rather than restating it.

**That index has no theme about shipping.** Its three themes are running the web app, preparing the
data and driving the app, and all 26 recipes are about this one machine.

This scope writes back a pair, and neither half exists in any form.

**How to ship a change** is the recipe that turns the decision into something a person can follow at
the end of a long day: what to check before, what to run, what to watch while it runs, what it looks
like when it goes wrong halfway, and how to put it back. Putting it back lives inside this recipe
rather than in a third one, because a rollback is read at the moment the deploy is going badly and
nobody looks it up in a different file then.

**How to confirm it landed** is the other half, and it is a different question from whether the
command succeeded. Which commit is serving traffic, where to look, and what a partly-landed deploy
looks like from outside.

---

## Context

What Attica means in the real world lives in [the context index](../../../../context/00-INDEX.md).
**The expected answer is that this scope owes it nothing, and the check is still run rather than
skipped.**

A release, an environment, a rollback and a build artifact are facts about the machinery Attica is
built with. They tell a reader nothing about events, organizers, providers, bookings or
availability, which is what `context/` is for. The one thing that would change this is a decision
that introduces a user-visible word, and the check exists to catch that rather than to be ceremonial.

---

## Diagram Prompts

This scope's illustrated map is [the illustrated map](diagram-prompts.md). It inherits the parent's
art direction, palette, glyph vocabulary and tiers, and reading axes exactly, and adds no vocabulary
of its own. It is the zoom-in on the deploy glyph in
[the parent's subject capstone](../../diagram-prompts.md), one of the two glyphs on the "alongside,
from day one" line beside the stack, which keeps it as one glyph and needed no amendment.

The map carries the subject lane only. Its process lane waits on this scope's plan files, which
`populate-plans` authors; drawing it now would mean inventing the work breakdown that skill owns.
