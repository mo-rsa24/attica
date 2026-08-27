# 🔧 Let The Environment Say Where Things Live

Step 4 of 6 in this scope. Waits on
[01-take-the-deployment-decision.md](01-take-the-deployment-decision.md), because the decision names
the four roles and the variable that sets each, and on
[02-make-two-clones-the-same.md](02-make-two-clones-the-same.md), because every variable it adds goes
into the template that plan commits. Runs beside
[03-make-the-workflow-a-gate.md](03-make-the-workflow-a-gate.md). Next:
[05-give-the-client-an-address.md](05-give-the-client-an-address.md), which does the same job for the
fourth role and the client.

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

Scope: [getting it out](../MASTER_PLAN.md). Fourth of six, and the first that edits the application.

It is the plan that makes "logically separable" true rather than stated. The reading this scope works
under is four named roles, each reachable by configuration rather than by a code change, per
[the decisions taken here](../decisions-taken-here.md#logically-separable-is-read-as-four-named-roles-reachable-by-configuration).
This plan does three of the four in `settings.py`; [05](05-give-the-client-an-address.md) does the
fourth, which is media, because making the path configurable and making something serve it are two
different jobs.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 32.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

**Eight things can be told to this application from outside, and every one of them has a value that
works on a laptop.**

`backend/main/main/settings.py` reads the environment in eight places: `SECRET_KEY` (`:27`), `DEBUG`
(`:31`), `ALLOWED_HOSTS` (`:32`), `CORS_ALLOWED_ORIGINS` (`:140`), `MAX_UPLOAD_SIZE_BYTES` (`:230`),
and three Sentry values (`:248`, `:256`, `:257`). Every one has a default, so an environment that
forgets one gets a working application rather than a refusal to start.

**Two of those defaults are the dangerous ones.** `DEBUG` defaults to `True` at `:31`, and
`SECRET_KEY` defaults at `:29` to a literal beginning `django-insecure-` that is in the repository.
An environment that fails to set them gets a debug-mode application signing its sessions with a key
anybody can read.

**Four things cannot be told anything at all.** The channel layer host is the literal tuple
`('127.0.0.1', 6379)` at `:96`. The cache location is the literal string
`redis://127.0.0.1:6379/1` at `:116`. `DATABASES` at `:156` to `:161` is a literal
`django.db.backends.sqlite3` over `BASE_DIR / 'db.sqlite3'`, with no `config()` call anywhere near
it. `MEDIA_ROOT` at `:226` is a literal local path. None of the four can move without a code change.

**`manage.py check --deploy` reports five issues, and four of them cannot be fixed by setting a
variable.** Run on 2026-08-23 with `DEBUG=False SECRET_KEY=x ALLOWED_HOSTS=example.com`, it returns
`security.W004`, `W008`, `W009`, `W012` and `W016`. A search of `settings.py` for names beginning
`SECURE_`, and for `SESSION_COOKIE_SECURE` and `CSRF_COOKIE_SECURE`, returns nothing at all. Four of
the five need settings that do not exist; `W009` is the conditional one and fires whenever
`SECRET_KEY` is unset.

**D6 and D8 are not taken here, and this plan is what stops them getting more expensive.** D6 is
PostgreSQL and belongs to `contention-and-holds`; `psycopg2-binary==2.9.10` is already installed by
`requirements.txt`, so the driver is present and the settings file has no way to reach it. D8 is
media and belongs to `performance-architecture`. This plan's obligation is that when either decision
lands, it is a variable change and not a code change.

**Neither D1 nor D2 reaches this plan.** Which booking representation survives changes what is in the
database; it does not change how the application is told which database. When a hold starts changes
nothing here.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **Redis must already be running on localhost:6379**, per
  [the execution model](../../../../../environment/overview.md#execution-model), for both the channel
  layer and the cache. This plan changes where the application looks for it, not whether it needs
  one, and the default in the template keeps pointing at the local one.
- **The backend is started by hand in one of two ways**, per that same section: `runserver` for HTTP
  only, or `daphne` for WebSockets. Both read the same settings, so a settings change that breaks
  startup breaks both, which is why
  [instruction 6](#6--watch-it-refuse-then-watch-it-start) starts each of them once.
- **`python-decouple` is already the mechanism**, per `settings.py:26`, whose comment reads "Reads
  from `BASE_DIR/.env` in dev; falls through to real env vars in prod." So there is already a way to
  read a variable and there has never been a `.env` in the repository to read.
- **Two backend tests already fail**, per
  [the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints). After
  this plan, `python manage.py test` must still fail on exactly those two and no others; a third
  failure is this plan's.

**Where any fact this plan needs is missing from `environment/`, stop and ask rather than inferring
it.**

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Removing a working default breaks this machine, on purpose, and the fix has to ship in the same
change.**

The moment `SECRET_KEY` has no default, every terminal on this laptop that starts the backend needs
a `.env`. So the task that removes the default also creates the local `.env` from the template and
fixes the runbook recipe in the same breath. A settings change that leaves
[the stack recipe](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up)
wrong has moved the problem rather than solved it.

**The workflow is already the closest thing to a deployed configuration, and it will find this
first.**

The backend job in `.github/workflows/ci.yml` sets `DEBUG: "False"`, a `SECRET_KEY`, `ALLOWED_HOSTS`
and `CORS_ALLOWED_ORIGINS` in its `env` block. So it already runs this application the way a
deployment would, and any variable this plan makes mandatory has to be in that block or the backend
job stops at `Django system check`. That is a good thing: it is a free rehearsal, and it is the
reason [task 4.2](#4--turn-the-security-settings-on-for-the-deployed-environment) touches `ci.yml`.

**Security settings that are always on make development impossible, and settings that are never on
are decoration.**

`SECURE_SSL_REDIRECT` on a laptop with no certificate makes every request bounce to a URL that does
not answer. So each of the four is read from the environment with a default that is off, and the
deployed environment turns them on. `check --deploy` then reports zero **against the deployed
configuration**, which is the criterion, and reports its usual warnings against a laptop, which is
correct.

**One variable for the database, not five.**

`ENGINE`, `NAME`, `HOST`, `PORT`, `USER` and `PASSWORD` as six separate variables is six things to
get right and six things to forget. One `DATABASE_URL` makes D6 a single-value change, which is
exactly what this plan owes `contention-and-holds`. It costs one dependency, and
[task 2.1](#2--make-the-four-literals-read-the-environment) names the alternative so the choice is
visible rather than assumed.

**Nothing in this plan migrates anything.** Making the database engine configurable is not switching
engines. The default stays SQLite at the same path, so this plan changes no behaviour on this machine
and every existing row stays where it is.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**Three of the four things a deployment has to be able to move are written into a Python file**, so
today "put the database on another machine" is a code change, a review and a release rather than a
line in an environment.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Every one of those literals was correct when it was typed. `127.0.0.1:6379` is where Redis is, on the
only machine this has ever run on. SQLite at `BASE_DIR / 'db.sqlite3'` is the right database for an
application being built by one person.

The comment above `MAX_UPLOAD_SIZE_BYTES` at `settings.py:229` is where somebody noticed the problem
and solved it for exactly one setting: "Override via env if you need to change without a code
release." That is the whole argument for this plan, written by somebody who then had one variable to
change and moved on.

Leaving it costs two scopes real money. `contention-and-holds` has to move to PostgreSQL for a
database exclusion constraint, because `select_for_update` does not lock on SQLite.
`performance-architecture` has to move media off local disk. Both of those are hard problems on their
own; neither should also have to be a settings refactor negotiated in the middle of a migration.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  TODAY                                        AFTER

  settings.py                                  settings.py
  ├─ 8 reads, all with a working default       ├─ 8 reads, 6 with a default
  │    SECRET_KEY   → django-insecure-...      │    SECRET_KEY   → no default, refuses to start
  │    DEBUG        → True                     │    DEBUG        → no default, refuses to start
  │                                            │
  └─ 4 literals, no way in                     └─ 4 reads, each with a laptop default
       CHANNEL_LAYERS  ('127.0.0.1', 6379)          REDIS_URL
       CACHES          redis://127.0.0.1:...        CACHE_URL
       DATABASES       sqlite3 @ BASE_DIR           DATABASE_URL   ◄── D6 becomes one value
       MEDIA_ROOT      BASE_DIR/media               MEDIA_ROOT     ◄── D8 becomes one value

  no SECURE_* setting anywhere                 4 security settings, read from the environment,
  check --deploy: 5 issues                     off on a laptop, on in the deployed environment
                                               check --deploy against deployed: 0 issues

  and every new variable is in backend/main/env.template, which a clone can read
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is exactly this plan's subject.

**Subject: written into the file, not read from the environment.** The eight rows with a door and a
fallback on the left, the four welded rows on the right whose outward arrows hit a wall, and the four
things outside the panel with no arrow arriving.
[Piece 3](../diagram-prompts.md#piece-3-written-into-the-file-not-read-from-the-environment-planned--not-rendered).
Save as `../diagrams/subject-03-written-into-the-file.png`. *(image not yet generated)*

The two rows drawn in the defect colour on the left are the debug flag and the secret key, and
[task 3](#3--make-the-two-dangerous-defaults-impossible) is what takes them out of that colour. The
four welded rows on the right are [task 2](#2--make-the-four-literals-read-the-environment).

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Changes to three files, plus one note.

1. **`backend/main/main/settings.py`.** Four literals become environment reads with laptop defaults.
   Two dangerous defaults are removed so the application refuses to start without them. Four security
   settings are added, each read from the environment and off by default.
2. **`backend/main/env.template`.** Every variable this plan introduces, with its placeholder, its
   laptop value, and one line saying what happens when it is unset. The file
   [02](02-make-two-clones-the-same.md) committed.
3. **`.github/workflows/ci.yml`, backend job.** Any variable that is now mandatory, added to the
   `env` block, so `Django system check` still passes.
4. **A note** at `artifacts/notes/getting-it-out/what-the-environment-now-decides.md`: rulers one,
   two and four before and after, the database-mechanism choice with its alternative, and one table
   of every variable with what it does and what happens when it is missing.

Plus one runbook edit, because starting the backend on this machine changes.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 3](../MASTER_PLAN.md#objectives), making the topology separable by
configuration, and make sure D6 and D8 stay as expensive as they already are rather than also
becoming a settings refactor.

**Goal.** `settings.py` carries no literal host, port, engine or media path; `SECRET_KEY` and `DEBUG`
have no working default and the `django-insecure-` literal is gone; the four security settings exist
and read the environment; `manage.py check --deploy` reports zero issues against the deployed
configuration; every new variable is in the committed template with a line saying what happens when
it is unset; the backend still starts on this machine, with the recipe that says how updated; and
`python manage.py test` still fails on exactly the two tests it failed on before.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/getting-it-out/plans/04-let-the-environment-say-where-things-live.md`

▶ **Next: [task 1.1](#1--read-the-decision-and-take-the-three-rulers)**.

### 1. 📖 Read the decision and take the three rulers

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Read what the decision said the four roles are set by**
  - Section 5 of `artifacts/notes/getting-it-out/how-attica-gets-deployed.md`, written by
    [task 4.2 of plan 01](01-take-the-deployment-decision.md#4--write-the-decision-record).
  - Produces: the four variable names quoted into this plan's note.
  - Done when: the names are quoted rather than invented. ❌ If a role's variable is unnamed there,
    name it here and **write it back into that section**, so one file holds all four rather than two
    files holding two each.

- [ ] **1.2 Take rulers one and two, with the commands from plan 01**
  ```
  cd /home/molef/Work/attica/backend/main/main
  grep -n 'config(' settings.py
  grep -n 'os.environ' settings.py
  grep -nE 'SECURE_|SESSION_COOKIE_SECURE|CSRF_COOKIE_SECURE' settings.py
  sed -n '94,100p;114,118p;154,162p;225,227p' settings.py
  ```
  - These are the same commands as
    [tasks 2.1 and 2.2 of plan 01](01-take-the-deployment-decision.md#2--pin-the-seven-rulers-and-run-them),
    unchanged.
  - Produces: the eight environment reads, the empty result for security settings, and the four
    literals quoted verbatim, in
    `artifacts/notes/getting-it-out/what-the-environment-now-decides.md`.
  - Done when: all of it is in the note with the commit and date at the top.
  - ❌ If the `sed` ranges no longer show the four literals, the file has moved. Find each by content
    (`CHANNEL_LAYERS`, `CACHES`, `DATABASES`, `MEDIA_ROOT`) and record the new line numbers, then use
    content rather than line numbers for the rest of this plan.

- [ ] **1.3 Take ruler four, the deploy check baseline**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  DEBUG=False SECRET_KEY=x ALLOWED_HOSTS=example.com python manage.py check --deploy
  ```
  - Produces: the issue count and identifiers. On 2026-08-23: five, being `security.W004`, `W008`,
    `W009`, `W012` and `W016`.
  - Done when: the five are in the note with one line each saying what the setting does. This is the
    number [task 5.1](#5--take-the-three-rulers-again-and-write-the-variable-table) drives to zero.

- [ ] **1.4 Record the two-red-tests baseline before touching settings**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  python manage.py test --noinput 2>&1 | tail -20
  ```
  - Produces: the count and the names of the failing tests. Expected: 43 tests, one failure and one
    error, both in `events/tests.py`.
  - Done when: the two names are written down. **A settings change is exactly the kind of change that
    makes a third test fail without anybody noticing**, and this is the only way to tell the
    difference afterwards.

▶ **Next: [task 2.1](#2--make-the-four-literals-read-the-environment)**.

### 2. 🔌 Make the four literals read the environment

◀ **Needs: [task 1](#1--read-the-decision-and-take-the-three-rulers)**.

- [ ] **2.1 Choose the database mechanism, and record the alternative**
  - **The recommendation: one `DATABASE_URL` variable, parsed by `dj-database-url`**, added to
    `backend/main/requirements.txt` as an exact pin the way all 62 existing lines are. It makes D6 a
    single-value change, which is what this plan owes `contention-and-holds`, and
    `psycopg2-binary==2.9.10` is already installed so nothing else is needed to point it at
    PostgreSQL.
  - **The alternative: parse it by hand** with the `python-decouple` `config()` that is already in
    the file. No new dependency, about ten lines, and the URL format becomes this repository's to
    maintain.
  - Produces: one paragraph in the note naming which was chosen and why, and, if it was the
    alternative, why the dependency was not worth it.
  - Done when: the choice is written down before the code is written. Either answer is fine; an
    undocumented one is not, because the next person to touch it will not know whether the format is
    a standard or an invention.

- [ ] **2.2 `DATABASES` reads `DATABASE_URL`, defaulting to the SQLite file it uses today**
  - `settings.py:156` to `:161`. The default must resolve to exactly
    `django.db.backends.sqlite3` over `BASE_DIR / 'db.sqlite3'`, so this machine's 2.2 MB database
    is still the one that opens.
  - Done when: `python manage.py migrate --noinput` says "No migrations to apply" against the
    existing file. **If it wants to apply 79 migrations, it has opened a new empty database**, which
    means the default is not resolving to the same path. Stop and fix that before anything else.

- [ ] **2.3 The channel layer host reads `REDIS_URL`**
  - `settings.py:96`, currently the literal tuple `('127.0.0.1', 6379)`. `channels_redis` accepts a
    URL string in its `hosts` list, so the tuple becomes a URL read from the environment with
    `redis://127.0.0.1:6379/0` as the laptop default.
  - Done when: a WebSocket still connects. That is checked in
    [instruction 6.4](#6--watch-it-refuse-then-watch-it-start), not by reading the setting, because
    a channel layer that fails to reach Redis fails at connect time and not at startup.

- [ ] **2.4 The cache location reads `CACHE_URL`**
  - `settings.py:116`, currently the literal `redis://127.0.0.1:6379/1`. Note that it deliberately
    uses database 1 while the channel layer uses the default, and keep that separation in the
    laptop defaults, because sharing one Redis database between a cache and a channel layer makes a
    cache flush drop live connections.
  - Done when: the variable exists and its default is the same string that is there today.

- [ ] **2.5 `MEDIA_ROOT` reads `MEDIA_ROOT`**
  - `settings.py:226`, currently `os.path.join(BASE_DIR, 'media')`. Default unchanged, so the 51 MB
    across 478 files stays exactly where it is.
  - Done when: an existing uploaded image still loads in the running application. **This makes the
    path configurable and does not make anything serve it**: serving media with `DEBUG` false is
    [plan 05](05-give-the-client-an-address.md), and moving it off local disk is D8 and belongs to
    `performance-architecture`.

- [ ] **2.6 Add all four to the committed template**
  - `backend/main/env.template`, per the rule
    [task 3.2 of plan 02](02-make-two-clones-the-same.md#3--write-the-committed-variable-template)
    wrote into that file: every plan that makes a setting read the environment adds its variable
    there in the same change.
  - Each block: the name, the laptop value as its placeholder, and one line saying what it does and
    what happens when it is unset.
  - Done when: all four are there, and `git check-ignore -v backend/main/env.template` still returns
    nothing.

▶ **Next: [task 3.1](#3--make-the-two-dangerous-defaults-impossible)**.

### 3. 🔐 Make the two dangerous defaults impossible

◀ **Needs: [task 2](#2--make-the-four-literals-read-the-environment)**.

- [ ] **3.1 Create this machine's `.env` before removing anything**
  - `cp backend/main/env.template backend/main/.env`, then fill in the laptop values, including a
    `SECRET_KEY` generated for this machine rather than the committed one.
  - Confirm `git check-ignore -v backend/main/.env` returns a line, so it is excluded. `.gitignore:57`
    is `**/.env`.
  - Done when: the file exists and is ignored. **Do this first.** The next task makes the application
    unable to start without it, and doing them the other way round leaves this machine broken between
    two edits.

- [ ] **3.2 Remove the `SECRET_KEY` default and delete the committed literal**
  - `settings.py:27` to `:29`. `config("SECRET_KEY")` with no `default=`, so `python-decouple` raises
    at import time when it is unset. The `django-insecure-v&1=...` literal at `:29` is deleted, not
    commented out.
  - Done when: `grep -n 'django-insecure' backend/main/main/settings.py` returns nothing, and the
    application still starts with the `.env` in place.
  - ❌ If that string appears anywhere else in the tree, say where. A secret key in a second file is a
    second problem.

- [ ] **3.3 Remove the `DEBUG` default**
  - `settings.py:31`. `config("DEBUG", cast=bool)` with no `default=`.
  - Done when: an environment with no `DEBUG` refuses to start, which is checked in
    [instruction 6.1](#6--watch-it-refuse-then-watch-it-start).
  - The reason this is worth the friction: a default of `True` means the one setting that decides
    whether stack traces are shown to strangers is the one setting that is on unless somebody
    remembers.

- [ ] **3.4 Put both into the workflow's backend job if they are not there**
  - `.github/workflows/ci.yml` already sets `DEBUG: "False"` and
    `SECRET_KEY: ci-test-secret-not-for-production` in the backend job's `env` block, so both are
    covered. Confirm rather than assume, and add anything else this plan made mandatory.
  - Done when: the `env` block covers every variable with no default. ❌ If it does not, the backend
    job stops at `Django system check`, which is the first step after install, and the failure looks
    like a broken workflow rather than a missing variable.

- [ ] **3.5 Fix the runbook recipe that this just made wrong**
  - [Stack § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up)
    and [§ 2](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#2-start-the-backend-with-websockets)
    both start the backend, and neither mentions a `.env` because none was needed.
  - Add the step: copy the template, fill it in, and what the error looks like when you have not.
    Quote the actual message `python-decouple` raises, obtained by running it once without the file.
  - Done when: somebody following the recipe from a cold terminal starts the backend. **Fix the
    recipe rather than answering around it**: a recipe that no longer works is worse than no recipe,
    because it is trusted.

▶ **Next: [task 4.1](#4--turn-the-security-settings-on-for-the-deployed-environment)**.

### 4. 🛡️ Turn the security settings on for the deployed environment

◀ **Needs: [task 3](#3--make-the-two-dangerous-defaults-impossible)**.

- [ ] **4.1 Add the four settings, each read from the environment, each off by default**
  - `SECURE_HSTS_SECONDS` (`W004`), `SECURE_SSL_REDIRECT` (`W008`), `SESSION_COOKIE_SECURE` (`W012`)
    and `CSRF_COOKIE_SECURE` (`W016`). None of these four exists in `settings.py` today.
  - Off by default, because `SECURE_SSL_REDIRECT` on a laptop with no certificate bounces every
    request to a URL that does not answer, and secure cookies over plain HTTP mean nobody can log in.
  - Add `SECURE_PROXY_SSL_HEADER` too if the decision in
    [plan 01](01-take-the-deployment-decision.md) put a web server or a load balancer in front,
    because without it Django cannot tell that the original request was HTTPS and the redirect loops.
    If the decision put nothing in front, say so in the note and leave it out.
  - Done when: all four exist, all four read the environment, and all four are in
    `backend/main/env.template` with a line saying which value the deployed environment uses.

- [ ] **4.2 Drive `check --deploy` to zero against the deployed values**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  DEBUG=False SECRET_KEY="$(python -c 'import secrets;print(secrets.token_urlsafe(50))')" \
    ALLOWED_HOSTS=example.com \
    SECURE_HSTS_SECONDS=31536000 SECURE_SSL_REDIRECT=True \
    SESSION_COOKIE_SECURE=True CSRF_COOKIE_SECURE=True \
    python manage.py check --deploy
  ```
  - Produces: the issue count. Target: `System check identified no issues (0 silenced).`
  - Done when: the command prints zero issues, and its exact output is pasted into the note beside
    the five from [task 1.3](#1--read-the-decision-and-take-the-three-rulers). **Quote the literal
    line**, because "it passes" and "System check identified no issues" are different claims.
  - ❌ If an issue remains, name it and say whether it is a setting that is missing or a value that is
    wrong. `W009` returning means `SECRET_KEY` is still falling back, which means task 3.2 did not
    take.

- [ ] **4.3 Confirm the two red tests are still exactly two**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  python manage.py test --noinput 2>&1 | tail -20
  ```
  - Done when: the same one failure and one error in `events/tests.py` from
    [task 1.4](#1--read-the-decision-and-take-the-three-rulers), and nothing else.
  - ❌ A third failure is this plan's, whatever it looks like. The settings file is imported by every
    test, so a settings change breaks tests in places that seem unrelated. Fix it here rather than
    letting it become somebody else's mystery.

▶ **Next: [instruction 6.1](#6--watch-it-refuse-then-watch-it-start)**.

### 5. 📊 Take the three rulers again and write the variable table

◀ **Needs: [instruction 6](#6--watch-it-refuse-then-watch-it-start)** done, so the note records an
application that was actually started rather than one that type-checks.

- [ ] **5.1 Run rulers one, two and four again, unchanged**
  ```
  cd /home/molef/Work/attica/backend/main/main
  grep -n 'config(' settings.py
  grep -nE 'SECURE_|SESSION_COOKIE_SECURE|CSRF_COOKIE_SECURE' settings.py
  grep -nE "127\.0\.0\.1|localhost|sqlite3|django-insecure" settings.py
  ```
  - Produces: the after-numbers beside the before-numbers, with the same commands between them. The
    third command is the direct test of the criterion: no literal host, port, engine or committed
    secret should survive it.
  - Done when: the third command returns only lines that are defaults inside a `config()` call, and
    each surviving line is named in the note with one sentence saying why a default there is correct.
  - ❌ If it returns a literal outside a `config()` call, that is a role that is still welded. Fix it
    or write down which one and why.

- [ ] **5.2 Write one table of every variable**
  - One row per variable the application reads after this plan: the name, what it decides, its laptop
    value, its deployed value, and what happens when it is unset. Both mandatory ones say "refuses to
    start".
  - Produces: the table [06](06-ship-it-put-it-back-and-write-it-down.md)'s recipes quote and
    `environment/` receives when `/env-pulse` runs there.
  - Done when: every variable in `backend/main/env.template` has a row and every row has a variable.
    A mismatch either way means one of the two was edited without the other.

- [ ] **5.3 Write the grouping's card entry**
  - Add this note to `artifacts/notes/getting-it-out/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`.
  - Done when: the provenance is in the card as prose.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 5](#5--take-the-three-rulers-again-and-write-the-variable-table)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 6. 🖥️ Watch it refuse, then watch it start

◀ **Needs: [task 4](#4--turn-the-security-settings-on-for-the-deployed-environment)** done, so there
is something to refuse and something to start.

The criterion is that an environment which does not set two variables **fails to start rather than
falling back**. That is a thing you watch happen. Reading the settings file tells you what somebody
meant to happen.

6.1 **Watch it refuse**
   - In a terminal:
     ```
     cd /home/molef/Work/attica/backend/main
     source /home/molef/lobola/bin/activate
     mv .env .env.aside
     python manage.py check
     ```
   - Expected result: it stops with an error naming `SECRET_KEY`, before doing anything else.
   - ✅ It refused: **copy the exact message.** It goes into the runbook recipe from
     [task 3.5](#3--make-the-two-dangerous-defaults-impossible), because it is the message somebody
     will see at seven in the evening on a new machine, and a recipe that quotes it saves the whole
     evening.
   - ❌ It started anyway: a default is still there. `grep -n 'SECRET_KEY\|DEBUG' settings.py` and
     look for `default=`.
   - Then `mv .env.aside .env` and confirm `python manage.py check` passes again. **Do this before
     the next step**, or everything after it fails for the wrong reason.

6.2 **Start the backend the ordinary way and use the app**
   - Follow [Stack § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up),
     including your new `.env` step.
   - Open `http://localhost:5173` in Chrome, log in, and open any page with an uploaded image on it,
     such as a provider or event listing.
   - Expected result: the app behaves exactly as it did before this plan. Nothing here was supposed
     to change what a user sees.
   - ✅ It looks identical and the image loads: `MEDIA_ROOT` still resolves to the same 478 files, and
     the database default still opens the same 2.2 MB file. Screenshot the page with the image on it
     and save it as `artifacts/figures/getting-it-out/same-app-after-the-settings-change.png`.
   - ❌ The images are broken: the `MEDIA_ROOT` default is not resolving to `BASE_DIR/media`. Compare
     `python manage.py shell -c "from django.conf import settings;print(settings.MEDIA_ROOT)"`
     against `ls backend/main/media | head`.
   - ❌ The app is empty of data: the `DATABASE_URL` default opened a different file. Check the same
     way with `settings.DATABASES`.

6.3 **Confirm the recipe works for somebody who has not read this plan**
   - Open a completely fresh terminal. Using only
     [Stack § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up),
     bring the stack up again from nothing.
   - ✅ You got there from the recipe alone: the recipe is current.
   - ❌ You had to remember something: that something is the recipe's missing paragraph. Add it now
     rather than noting it, because you will not remember what it was.

6.4 **Prove the channel layer still reaches Redis**
   - The channel layer's host moved from a literal tuple to a URL, and that failure does not show at
     startup.
   - Start the backend with Daphne per
     [Stack § 2](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#2-start-the-backend-with-websockets).
   - In Chrome, open a page that holds a socket open (a direct message room), press F12, click the
     Network tab, and filter to `WS`.
   - Expected result: one WebSocket request with status `101 Switching Protocols`, and frames
     arriving when you send a message.
   - ✅ Status 101 and frames moving: the channel layer resolved the URL. Screenshot the Network tab
     with the 101 visible and save it as
     `artifacts/figures/getting-it-out/websocket-101-after-redis-url.png`.
   - ❌ The socket connects and no frames arrive: that is the channel layer failing to reach Redis,
     and it looks exactly like a working socket from the outside. Check `redis-cli ping`, then the
     `REDIS_URL` value, then whether the URL includes a database number that collides with the
     cache's.

6.5 **See zero issues with your own eyes**
   - Run [task 4.2](#4--turn-the-security-settings-on-for-the-deployed-environment)'s command
     yourself, in a terminal, and read the last line.
   - Expected result: `System check identified no issues (0 silenced).`
   - ✅ That exact line: screenshot the terminal and save it as
     `artifacts/figures/getting-it-out/check-deploy-zero-issues.png`. Five to zero is the
     measurement, and this is the evidence.
   - ❌ Anything else: the remaining identifiers are the list of what is left, and each one is either
     a missing setting or a wrong value. Neither is silenced.

▶ **Next: [task 5.1](#5--take-the-three-rulers-again-and-write-the-variable-table)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when moving the database, Redis or the media store off this machine is an
> environment change somebody makes in a text file, and when an environment that forgets the secret
> key gets a refusal rather than an application.

Pass:

- `grep -nE "127\.0\.0\.1|localhost|sqlite3|django-insecure" settings.py` returns only defaults
  inside `config()` calls, each one named in the note with a reason.
- `SECRET_KEY` and `DEBUG` have no default; the application refuses to start without them and
  somebody has watched it refuse.
- The four security settings exist, read the environment, and are off by default.
- `manage.py check --deploy` prints `System check identified no issues (0 silenced).` against the
  deployed values, with the literal line quoted and a screenshot behind it.
- Every new variable is in `backend/main/env.template`, and the variable table's rows match that file
  exactly.
- The app looks and behaves the same on this machine: same data, same images, a WebSocket at 101 with
  frames arriving.
- `python manage.py test` fails on exactly the two tests it failed on before.
- The stack recipe has its `.env` step and quotes the real error message, and somebody used it from a
  cold terminal.

Fail, and what it means:

- A default removed before this machine's `.env` exists. The laptop is broken between two edits, and
  whoever is halfway through cannot run anything to find out why.
- `migrate` wanting to apply 79 migrations. The database default is opening a new empty file, and
  running it would leave two databases with nobody sure which is real.
- A security setting hardcoded on. Nobody can log in on this machine, and the cause looks like an
  authentication bug rather than a cookie flag.
- A third failing test waved through. A settings change breaks tests in places that look unrelated,
  which is exactly why the count was taken before.
- The WebSocket checked by reading the setting. A channel layer that cannot reach Redis still opens
  the socket; only the absence of frames says so.
- `check --deploy` reported as "passing" without the literal line. Those are two different claims.

Partial pass is acceptable when `SECURE_PROXY_SSL_HEADER` is left out because the decision put
nothing in front of Django. That is a real answer and it is written down rather than left blank.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| Four literals reading the environment | `backend/main/main/settings.py` | — | not started |
| Two defaults removed and one literal secret deleted | `backend/main/main/settings.py` | — | not started |
| Four security settings, environment-read, off by default | `backend/main/main/settings.py` | — | not started |
| Every new variable, with what it does and what happens when it is unset | `backend/main/env.template` | — | not started |
| This machine's filled-in copy, ignored by git | `backend/main/.env` | — | not started |
| Any newly mandatory variable in the backend job | `.github/workflows/ci.yml` | — | not started |
| The `.env` step and the real error message | [Stack § 1 and § 2](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md) | — | not started |
| The note: rulers before and after, the database-mechanism choice, the variable table | `artifacts/notes/getting-it-out/what-the-environment-now-decides.md` | — | not started |
| The app unchanged after the settings change | `artifacts/figures/getting-it-out/same-app-after-the-settings-change.png` | — | not started |
| A WebSocket at 101 after the channel layer moved to a URL | `artifacts/figures/getting-it-out/websocket-101-after-redis-url.png` | — | not started |
| `check --deploy` reporting no issues | `artifacts/figures/getting-it-out/check-deploy-zero-issues.png` | — | not started |
| Written into the file, not read from the environment | [piece 3](../diagram-prompts.md#piece-3-written-into-the-file-not-read-from-the-environment-planned--not-rendered) → `../diagrams/subject-03-written-into-the-file.png` | subject | ⏳ not rendered |
| Six plans, six gates | [process prompt 2](../diagram-prompts.md#prompt-2-process-six-plans-six-gates-planned--not-rendered) → `../diagrams/process-02-six-plans-six-gates.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/getting-it-out/plans/04-let-the-environment-say-where-things-live.md` | task 0, before any work | Conformance and thin instructions reported |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the scope's master plan](../MASTER_PLAN.md#eight-settings-can-be-configured-and-every-one-falls-back-silently): the eight reads, the four literals and the five check issues, each with its line number.
- [the decisions taken here](../decisions-taken-here.md#logically-separable-is-read-as-four-named-roles-reachable-by-configuration): the reading of "separable" this plan implements, and the two readings it was chosen over.
- [the open decisions](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions): D6 and D8 in their own words, neither taken here.
- `backend/main/main/settings.py:26`: the comment naming `python-decouple` and `BASE_DIR/.env`.
- `backend/main/main/settings.py:229`: "Override via env if you need to change without a code release", which is this plan's argument in somebody else's words.
- `backend/main/requirements.txt`: 62 exact pins, including `psycopg2-binary==2.9.10`.
- `.github/workflows/ci.yml`: the backend job's `env` block, already running this application with `DEBUG` false.
- [Stack § 1 and § 2](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md): the two recipes task 3.5 has to fix.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[05-give-the-client-an-address.md](05-give-the-client-an-address.md), which does the same job for the
one role this plan left: the interface has no way to be told where its backend is, and nothing serves
the bundle or the media once debug is off.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. The work is edits to one settings file checked by a command and a browser,
and the skill that comes closest, `/env-pulse`, records facts about `environment/` rather than
changing what the application reads.
   also: `/env-pulse` is the right skill once this lands, and it runs in
   [plan 06](06-ship-it-put-it-back-and-write-it-down.md), where the whole new `environment/` section
   is written at once rather than a line at a time.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| `migrate` wants to apply all 79 migrations | Task 2.2, when the `DATABASE_URL` default does not resolve to `BASE_DIR/db.sqlite3` | Stop before running it. Print `settings.DATABASES` in a shell and compare the path against `backend/main/db.sqlite3`. |
| The application starts when it should refuse | Instruction 6.1 | A `default=` is still on the `config()` call. `python-decouple` only raises when there is no default at all. |
| A WebSocket connects and no frames arrive | Task 2.3, after the channel layer host became a URL | The socket is served by Daphne and the frames come from Redis. Check `redis-cli ping`, then the URL, then whether its database number collides with the cache's. |
| Nobody can log in on this machine after the security settings land | Task 4.1, if a cookie flag is hardcoded on | Secure cookies over plain HTTP are never sent. All four settings read the environment and default to off. |
| Every request bounces to a URL that does not answer | Task 4.1, with `SECURE_SSL_REDIRECT` on and no certificate | Same fix: off by default, on only in the deployed environment. Where something terminates TLS in front, `SECURE_PROXY_SSL_HEADER` is what stops the redirect looping. |
| A third test starts failing and looks unrelated | Task 4.3 | `settings.py` is imported by every test. The baseline in task 1.4 is the only way to tell a new failure from the two known ones. |
