# 🧭 Take The Deployment Decision

Step 1 of 6 in this scope. Waits on `one-booking-truth`, which is the parent's edge for the whole
scope and not a dependency this plan invents. Next:
[02-make-two-clones-the-same.md](02-make-two-clones-the-same.md), which needs nothing from this plan
and can run beside it, and
[04-let-the-environment-say-where-things-live.md](04-let-the-environment-say-where-things-live.md),
which cannot start until this plan has said what an environment is.

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

Scope: [getting it out](../MASTER_PLAN.md). First of six, and it must go first for two reasons.

**It takes D9**, the deployment decision, which is the whole of this scope's `decide` mark and is not
pre-answered anywhere in this folder. Everything after it either writes a setting the deployed
environment supplies, or follows a route this decision defines.

**It pins the rulers.** Seven numbers describe how far this repository is from running anywhere else,
and five later plans are checked by taking one of them again. A before and an after measured with two
different commands measure nothing.

[02](02-make-two-clones-the-same.md) waits on nothing and runs beside this one: committing a lockfile
and a variable template is true whatever the decision turns out to be.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 29.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Attica has run in exactly one place for its entire life: four processes started by hand on one
laptop, a 2.2 MB database file, 51 MB of uploaded media on local disk, and one entrance, which is the
Vite dev server on port 5173. Nothing in the tracked tree names a second machine. A search for
`Dockerfile`, `docker-compose`, `Procfile`, `nginx`, `*.service` and anything called `deploy` returns
one file, `backend/main/requirements.txt`, matched on the word "requirements".

**This plan takes the deployment decision.** It is the one genuine decision this scope contains. It
is [D9 in the open decisions](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions),
and the recommendation there is a recommendation, not an answer.

**One thing is already settled and it is a place, not a mechanism.** A deployed Attica runs on one
small Linux virtual machine, in a Johannesburg region, at a fixed monthly price, on an account
Molefe owns. The evidence and the three classes of host it beat are in
[the decisions taken here](../decisions-taken-here.md#the-target-host-one-small-linux-machine-in-johannesburg-at-a-fixed-price).
The provider, the size, the price, whether anything runs in a container, what supervises the
processes and how a change gets there are all still open, and they are this plan's.

**This plan also produces the seven before-numbers**, each with the command that produced it, in one
file. [02](02-make-two-clones-the-same.md), [03](03-make-the-workflow-a-gate.md),
[04](04-let-the-environment-say-where-things-live.md) and
[05](05-give-the-client-an-address.md) each take one or more of them again at their end.

**Neither D1 nor D2 reaches this plan, and both are named because the programme's rule says a plan
touched by an unmade decision must say so.**

D1 decides which of the four live booking representations survives. It does not change what a
deployment mechanism is. It does set the hardest case that mechanism will ever meet, because the
migration away from the three that lose is the largest schema and data change this programme
contains. So this plan writes **the rule for shipping a schema change and never a table name**: what
happens when a migration fails halfway, whether the application must tolerate both shapes while one
is in flight, and what a restart does to work already running. Each is answerable today. Which tables
move is D1's and appears nowhere here.

D2 decides whether a hold starts at request time or at acceptance. It changes what expires and how
often, and nothing about how a process reaches a machine. The one place it nearly bites is that a
deploy restarts processes, and a restart is exactly when timed work is dropped or run twice. That is
[task 4.3](#4--write-the-decision-record), written as a rule about restarts. The list of jobs it
applies to belongs to `running-the-workers` and its contents to D2.

**One scope is waiting on a specific line from this decision.** `running-the-workers` took D7 without
waiting for this one, and labelled every one of its execution-tier candidates by what a future
deployment answer would do to it. This plan owes it the return half, which is
[task 3](#3--label-every-candidate-against-the-execution-tier).

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **Nothing on this machine is supervised**, per
  [the execution model](../../../../../environment/overview.md#execution-model). Redis, the backend,
  the Vite dev server and the outbox worker are four processes, none of which starts or restarts any
  other. Any candidate that assumes an init system has to bring one, and a candidate that assumes
  systemd is available under WSL2 is making a claim about the host that
  [the workers' instruction 4](../../running-the-workers/plans/01-take-the-execution-decision.md#4--find-out-what-this-machine-can-actually-supervise)
  exists to check.
- **Two HTTP clients reach the backend by different routes**, per
  [the access paths](../../../../../environment/overview.md#access-paths). One goes through the Vite
  proxy, one hardcodes `127.0.0.1:8000` and needs CORS. Both routes exist only because a dev server
  does. A deployed environment has neither, which is why the client's backend address is
  [plan 05](05-give-the-client-an-address.md) rather than a detail.
- **The backend suite is red before this scope touches anything**, per
  [the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints). Two
  of 43 tests fail. Any candidate whose safety argument is "the workflow gates it" is arguing from a
  gate that has never been green, which is [plan 03](03-make-the-workflow-a-gate.md).

**One fact this plan needs is not in `environment/` and has been supplied rather than inferred.**
Where a deployed Attica runs. That folder records what is true about the system the work runs on, and
no such machine exists yet, so the answer lives in
[the decisions taken here](../decisions-taken-here.md#the-target-host-one-small-linux-machine-in-johannesburg-at-a-fixed-price)
until [instruction 6.2](#6--choose-it-provision-it-and-sign-it) creates one. From that moment it is
an environment fact, and [plan 06](06-ship-it-put-it-back-and-write-it-down.md) writes it there.

**Where any other fact this plan needs is missing from `environment/`, stop and ask rather than
inferring it.**

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This is a deciding plan and a measuring plan, and it deploys nothing.**

Nothing here installs a package, edits a setting or starts a process on a remote machine. The
deliverable is a written decision with its losers, plus seven pinned commands and their answers, plus
one instruction that spends money. That makes it the plan most likely to be skipped by somebody in a
hurry, which is exactly why the measurement lives here: skipping it costs something in the very next
plan rather than four plans later.

**The shape of the answer looks obvious, and that is the trap.**

Containerise the two processes, put a web server in front, move off SQLite. That is a guess wearing
a conclusion's clothes. It assumes a budget nobody has stated, a tolerance for operational work
nobody has expressed, and it silently pre-decides D6, which belongs to `contention-and-holds`, and
D8, which belongs to `performance-architecture`. Every candidate gets its row, and every loser gets
its paragraph, including the ones that lose in one line.

**The decision must not make D6 or D8 more expensive, and that is a property you can check.**

Neither is taken here. What this plan owes them is that the database engine and the media location
are things an environment sets, not things a code change decides. Today `DATABASES` at
`settings.py:156` is a literal `django.db.backends.sqlite3` with no `config()` call anywhere near it,
and `MEDIA_ROOT` at `:226` is a literal path. `psycopg2-binary==2.9.10` is already in
`requirements.txt`, so the driver for PostgreSQL is present and the settings file has no way to
reach it.

**A candidate's cost is not its price.**

Three columns decide most of this table and none of them is money: what it can hold open, what it
makes a person do by hand every time, and what it does when a step fails halfway. Daphne holds
long-lived WebSocket connections, three client components already open sockets, and the notification
channel is the delivery path for the entire booking journey. A candidate that cannot hold a
connection open is not cheap, it is wrong.

**A before-number without its command is decoration.**

The sibling scope `one-client-truth` recorded 132 fetch call sites across 38 files, and a differently
worded search on the same tree answered 144 across 40. Neither was wrong; they were two rulers. This
scope has seven numbers and therefore seven chances to report progress it did not make.
[Task 2](#2--pin-the-seven-rulers-and-run-them) is the whole defence.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**Attica has no deployment mechanism and no second machine, and the decision about what it should
have is worth more than the mechanism itself**, because five later plans each write one part of
whatever this answer says an environment is.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Every other scope in this programme is building something that only exists on one laptop. The
booking model, the workers, the real-time envelope, the design system: all of them are true on this
machine and nowhere else, and none of them has ever been used by somebody who was not sitting here.

That is not a gap somebody forgot to fill. It is a decision nobody has taken. The repository is full
of evidence that the question was reached and stepped around: `FRONTEND_DIST` is defined at
`settings.py:21` and wired into the templates and static directories, and no URL pattern serves it.
The comment above `MAX_UPLOAD_SIZE_BYTES` at `settings.py:229` reads "Override via env if you need
to change without a code release", naming a release mechanism that does not exist. Continuous
integration builds the frontend and throws it away, twice a run.

What this plan produces is the thing nobody will remember to write later. A mechanism that is chosen
survives as a mechanism; the reasons the other candidates lost survive in a file or they do not
survive at all, and the first person to be annoyed by the choice will re-take it from scratch.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  ONE MACHINE, FOUR HANDS, NO WAY OUT

   redis ─┐  daphne ─┐  vite ─┐  outbox worker ─┐   started by a person, four times
          └──────────┴────────┴─────────────────┘   nothing supervises anything

                    │
                    ▼
   ┌──── the seven rulers ────┐      ┌──── the candidate table ────┐
   │  8 settings read env     │      │  what can it hold open      │
   │  0 env reads in client   │ ───► │  what does a person do      │
   │  142 relative call sites │      │  what happens halfway       │
   │  5 check --deploy issues │      │  what does it do to D7      │
   │  0 commits for lockfile  │      │  what does it cost, fixed   │
   │  2 CI runs, 2 failures   │      └──────────────┬──────────────┘
   │  2.2 MB db + 51 MB media │                     │
   └──────────────────────────┘      a person chooses, and provisions
                                                    │
                                                    ▼
                              the decision + every loser's reason
                              + four roles named
                              + the schema-change rule (no table named)
                              + one line back to running-the-workers
                                                    │
                    ┌───────────────┬───────────────┼───────────────┐
                    ▼               ▼               ▼               ▼
                   03              04              05              06
                the gate      the settings      the client       the route
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-establish) ➡️

One piece in this scope's map is drawn from what this plan opens in, and the capstone is what its
answer aims at.

**Subject: one machine, and four hands to start it.** The single machine, the four processes started
by a person in order, and the reader outside whose arrow stops in the gap.
[Piece 1](../diagram-prompts.md#piece-1-one-machine-and-four-hands-to-start-it-planned--not-rendered).
Save as `../diagrams/subject-01-one-machine-four-hands.png`. *(image not yet generated)*

**Subject capstone: the deploy glyph, opened up.** The end state this decision is choosing a route
to, including the four named roles each with its own door and configuration chip.
[The capstone](../diagram-prompts.md#the-deploy-glyph-opened-up-planned--not-rendered).
Save as `../diagrams/subject-capstone-the-deploy-glyph-opened-up.png`. *(image not yet generated)*

The four sub-panels in the capstone are the four roles [task 4.2](#4--write-the-decision-record)
names, so the picture and the decision record say the same thing or one of them is wrong.

## Description: what to establish

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

One markdown file, `artifacts/notes/getting-it-out/how-attica-gets-deployed.md`, holding six
sections.

1. **What is here today, measured.** The seven rulers, each with the command that produced it, its
   exact output, the date, and the commit from `git rev-parse --short HEAD`.
2. **The candidates, scored against the criteria.** One row per candidate, plain answers, no scores
   out of ten, and no cell reading "depends".
3. **The decision, and every loser with its reason.** One paragraph per losing candidate, and a
   closing paragraph naming what would have to be true for a different candidate to win. Signed and
   dated by a person.
4. **The machine, recorded.** The provider, the region, the size and the fixed monthly price, taken
   from the console after it was created rather than from a pricing page before.
5. **The four roles, named.** Which process serves requests, which runs recurring work, where the
   database is, where uploaded media is; what each one is set by; and the one-machine arrangement
   written down as a choice.
6. **The rules a deploy runs under.** The schema-change rule, the migration-fails-halfway rule and
   the restart rule, each written naming no table and no job, plus one line per execution-tier
   candidate saying what this answer does to it.

## Purpose and goal

Navigation: ⬅️ [Description: what to establish](#description-what-to-establish) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 1](../MASTER_PLAN.md#objectives), taking the deployment decision
against what is actually here rather than against what a Django deployment usually looks like, and
give [03](03-make-the-workflow-a-gate.md), [04](04-let-the-environment-say-where-things-live.md),
[05](05-give-the-client-an-address.md) and
[06](06-ship-it-put-it-back-and-write-it-down.md) a definition of "the deployed environment" that is
not the author's preference.

**Goal.** `artifacts/notes/getting-it-out/how-attica-gets-deployed.md` exists; all seven rulers carry
the command that produced them; every candidate carries a plain answer in every column and a label
saying what it does to each execution-tier candidate; every loser carries a paragraph; the four roles
are named with what sets each; the three deploy rules are written naming no table; a real machine
exists with its provider, region, size and price recorded from the console; and the decision is
signed and dated by a person.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/getting-it-out/plans/01-take-the-deployment-decision.md`

▶ **Next: [task 1.1](#1--read-the-answers-this-plan-is-not-allowed-to-guess)**.

### 1. 📖 Read the answers this plan is not allowed to guess

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Quote the host class rather than re-deriving it**
  - Read [the target host entry](../decisions-taken-here.md#the-target-host-one-small-linux-machine-in-johannesburg-at-a-fixed-price)
    and copy its four constraints into the notes file verbatim: one small Linux virtual machine, a
    Johannesburg region, a fixed monthly price, an account Molefe owns.
  - Produces: the constraint block every candidate is scored inside.
  - Done when: the four are quoted rather than summarised, and the three classes of host they beat
    are listed with the one line each that lost them.
  - ❌ If you disagree with the class, say so here and stop. Changing it means editing that entry and
    the scope's Environment Context section together, **before** this plan runs. After the decision
    is signed, reversing it costs a rewrite of the candidate table.

- [ ] **1.2 Read what `running-the-workers` labelled, if it has run**
  ```
  ls -la /home/molef/Work/attica/artifacts/notes/running-the-workers/ 2>/dev/null
  ```
  - The labels live in
    [the execution decision](../../running-the-workers/plans/01-take-the-execution-decision.md),
    which scores every execution-tier candidate by what a future deployment answer would do to it.
  - Produces: either the list of candidates with their labels, quoted, or a line saying D7 is not yet
    taken and that [task 3](#3--label-every-candidate-against-the-execution-tier) therefore labels
    the candidates rather than the winner.
  - Done when: which of the two situations applies is written down. Both are fine; guessing which is
    not.

- [ ] **1.3 Confirm nothing in the tree already describes a second machine**
  ```
  cd /home/molef/Work/attica
  git ls-files | grep -iE 'dockerfile|docker-compose|procfile|nginx|\.service$|deploy'
  ```
  - Produces: the result, written into the notes. On 2026-08-23 this returned exactly one line,
    `backend/main/requirements.txt`, matched on the word "requirements".
  - Done when: the output is recorded as a result rather than skipped. ❌ If it now returns something
    real, read that file before scoring anything: somebody has started this and the candidate table
    has to account for it.

▶ **Next: [task 2.1](#2--pin-the-seven-rulers-and-run-them)**.

### 2. 📊 Pin the seven rulers and run them

◀ **Needs: [task 1](#1--read-the-answers-this-plan-is-not-allowed-to-guess)**.

Each of these is a ruler. The plan named beside it runs the same command again at its end, and the
two numbers are only comparable because they came from the same command.

- [ ] **2.1 Ruler one: how much of the backend can be told anything from outside**
  ```
  cd /home/molef/Work/attica/backend/main/main
  grep -n 'config(' settings.py
  grep -n 'os.environ' settings.py
  grep -nE 'SECURE_|SESSION_COOKIE_SECURE|CSRF_COOKIE_SECURE' settings.py
  ```
  - Produces: the count of environment reads and the list of names, plus the emptiness of the third
    command. On 2026-08-23: eight reads, being `SECRET_KEY` (`:27`), `DEBUG` (`:31`),
    `ALLOWED_HOSTS` (`:32`), `CORS_ALLOWED_ORIGINS` (`:140`), `MAX_UPLOAD_SIZE_BYTES` (`:230`) and
    three Sentry values (`:248`, `:256`, `:257`); and no line at all matching the third.
  - Done when: all three outputs are in the notes. [04](04-let-the-environment-say-where-things-live.md)
    is measured on the first and the third.
  - Record beside the count that every one of the eight has a default that works on a laptop, so
    forgetting one produces a working application rather than a refusal to start. That is what makes
    eight a finding rather than a statistic.

- [ ] **2.2 Ruler two: the four things that cannot be told anything at all**
  ```
  cd /home/molef/Work/attica/backend/main/main
  sed -n '94,100p;114,118p;154,162p;225,227p' settings.py
  ```
  - Produces: the four literals quoted verbatim. On 2026-08-23: the channel layer host
    `('127.0.0.1', 6379)` at `:96`, the cache location `redis://127.0.0.1:6379/1` at `:116`,
    `DATABASES` as `django.db.backends.sqlite3` over `BASE_DIR / 'db.sqlite3'` at `:156` to `:161`,
    and `MEDIA_ROOT` as `os.path.join(BASE_DIR, 'media')` at `:226`.
  - Done when: all four are quoted rather than described. "The database is hardcoded" is a claim;
    `'ENGINE': 'django.db.backends.sqlite3'` is evidence.
  - These four are the four roles from [task 4.2](#4--write-the-decision-record), which is why they
    are counted together.

- [ ] **2.3 Ruler three: what the client can be told, and where it thinks the backend is**
  ```
  cd /home/molef/Work/attica/frontend/src
  grep -rn "import.meta.env" . | wc -l
  grep -ro "'/api/\|\"/api/\|\`/api/" . | wc -l
  grep -rn "127.0.0.1:8000\|localhost:8000" . 
  ```
  - Produces: three results. On 2026-08-23: zero environment reads across 110 files, 142 relative
    call sites, and exactly two absolute ones, `utils/useAxios.js:10` and `LocationDetailPage.jsx:85`.
  - Done when: all three are in the notes. [05](05-give-the-client-an-address.md) is measured on all
    three.
  - ❌ If the third command returns more than two sites, list every one. The claim that exactly two
    would be baked into a shipped bundle is the one [05](05-give-the-client-an-address.md) is built
    on.

- [ ] **2.4 Ruler four: what Django says about deploying this configuration**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  DEBUG=False SECRET_KEY=x ALLOWED_HOSTS=example.com python manage.py check --deploy
  ```
  - Produces: the issue count and the identifiers. On 2026-08-23: five issues, `security.W004`,
    `security.W008`, `security.W009`, `security.W012` and `security.W016`.
  - Done when: the five are in the notes with one line each saying what the setting does, and with
    four of them marked unconditional, since `settings.py` contains no setting whose name begins
    `SECURE_`, no `SESSION_COOKIE_SECURE` and no `CSRF_COOKIE_SECURE`. `W009` is the conditional one:
    it fires whenever `SECRET_KEY` is unset, because the committed default at `:29` is prefixed
    `django-insecure-`.
  - This is [04](04-let-the-environment-say-where-things-live.md)'s ruler, and its target is zero.

- [ ] **2.5 Ruler five: whether two clones of this commit are the same clone**
  ```
  cd /home/molef/Work/attica
  git log --all --oneline -- frontend/package-lock.json | wc -l
  git check-ignore -v frontend/package-lock.json .env.example
  grep -c '==' backend/main/requirements.txt
  wc -l < backend/main/requirements.txt
  ```
  - Produces: four results. On 2026-08-23: zero commits for the lockfile, `.gitignore:45` excluding
    `frontend/package-lock.json` and `.gitignore:58` excluding `.env.example`, and 62 of 62
    requirement lines carrying an exact `==` pin.
  - Done when: all four are in the notes, with the asymmetry stated in one line: the backend half of
    this application pins everything and the frontend half pins nothing.
  - This is [02](02-make-two-clones-the-same.md)'s ruler.

- [ ] **2.6 Ruler six: the workflow's whole history**
  ```
  cd /home/molef/Work/attica
  gh run list --limit 20
  ```
  - Produces: every run with its conclusion and date. On 2026-08-23: exactly two runs, `30327265312`
    on 2026-07-28 and `32620468805` on 2026-08-23, both `failure`.
  - Done when: the list is in the notes verbatim, with one line stating that a workflow which has
    never passed cannot gate a release. That consequence is this scope's; the cause of the backend
    half belongs to
    [making the suites honest](../../fixing-create-event/plans/03-reconcile-suite-and-runbook.md).
  - This is [03](03-make-the-workflow-a-gate.md)'s ruler.
  - ❌ If `gh` is not authenticated, say so and record the run list from
    [instruction 5.1 of plan 03](03-make-the-workflow-a-gate.md#5--read-the-failure-in-githubs-own-interface)
    instead. Do not report a count you did not obtain.

- [ ] **2.7 Ruler seven: how much state is on this disk and in no repository**
  ```
  cd /home/molef/Work/attica
  ls -l backend/main/db.sqlite3 | awk '{print $5}'
  du -sh backend/main/media
  find backend/main/media -type f | wc -l
  git check-ignore -v backend/main/db.sqlite3 backend/main/media
  find backend/main -path '*/migrations/*.py' ! -name '__init__.py' | wc -l
  ```
  - Produces: five results. On 2026-08-23: 2,265,088 bytes, 51 MB across 478 files, both excluded by
    `.gitignore` (`*.sqlite3` at `:4` and `media/` at `:66`), and 79 migration files.
  - Done when: all five are in the notes, with the observation that the migrations describe the
    schema and nothing in the repository describes the data. That is the fact the schema-change rule
    in [task 4.3](#4--write-the-decision-record) is written against.

- [ ] **2.8 Stamp the tree the numbers came from**
  ```
  cd /home/molef/Work/attica
  git rev-parse --short HEAD
  git status --short | wc -l
  date +%F
  ```
  - Produces: the commit, the count of uncommitted changes and the date, written at the top of the
    notes file.
  - Done when: every number in the file can be attributed to one tree on one day.

▶ **Next: [task 3.1](#3--label-every-candidate-against-the-execution-tier)**, which needs the table
started, and [instruction 6.1](#6--choose-it-provision-it-and-sign-it), which is where a person
chooses.

### 3. ⚖️ Build the candidate table and label every candidate against the execution tier

◀ **Needs: [task 2](#2--pin-the-seven-rulers-and-run-them)**.

- [ ] **3.1 Score every candidate against eight criteria**
  - The criteria, in this order: what it can hold open, meaning whether a long-lived WebSocket
    survives; what a person does by hand on every single deploy; what happens when a step fails
    halfway; whether the database engine and the media location become environment settings or stay
    code; what it costs per month at a fixed price on the host class from
    [task 1.1](#1--read-the-answers-this-plan-is-not-allowed-to-guess); what it needs installed on
    the machine before the first deploy; whether it can put a deploy back, and how; and what a person
    has to learn before they can ship for the first time.
  - The candidates to score, at minimum. Add any the reading turns up rather than treating this list
    as closed:
    - **Pull on the machine.** A checkout on the box, a build run there, processes restarted by
      whatever supervises them. The smallest possible mechanism and the one with the most by-hand
      steps.
    - **Push a built artifact.** The workflow builds `frontend/dist` and a Python environment, the
      result is copied to the machine, processes restart. Puts the build somewhere it can be kept,
      which is what [03](03-make-the-workflow-a-gate.md) needs anyway.
    - **Containers on the one machine.** Images built in the workflow, pulled and run on the box.
      Makes rollback a tag change and adds a runtime to install and understand.
    - **A managed application platform running on the machine.** Push a branch and it deploys.
      Cheapest to learn, most opaque when it goes wrong, and it brings its own opinions about
      processes.
    - **Nothing changes and the laptop is the deployment.** The candidate that changes least, scored
      honestly rather than as a straw man: it is the only one whose cost is zero, and naming exactly
      what it fails at is what makes the table a comparison instead of an argument.
  - Produces: one row per candidate with a plain answer in each of the eight columns.
  - Done when: no cell says "depends". Where an answer genuinely turns on something not yet known,
    write what it turns on, which is a different statement.

- [ ] **3.2 Score how each candidate ships a schema change**
  - Three questions per candidate, all answerable without knowing which tables move: where the
    migration runs, what state the application is in while it runs, and what a failure halfway leaves
    behind.
  - Produces: one row per candidate, three columns. This is the row that decides whether the
    mechanism survives D1's migration, which is the largest schema and data change this programme
    contains.
  - Done when: each answer is a mechanism rather than an intention. "Run migrations first" is an
    intention; "the workflow runs `migrate` against the deployed database before the new processes
    start, and a non-zero exit stops the deploy with the old processes still serving" is a mechanism.
  - ❌ If a candidate has no answer to the halfway question, that is its answer and it goes in the
    cell. A blank reads as "fine".

- [ ] **3.3 Label every candidate by what it does to the execution tier**
  - Three labels only: `survives` (that scope's runner choice is unaffected), `reconfigured` (same
    runner, different wiring), `redone` (thrown away and replaced).
  - If D7 is already taken, per [task 1.2](#1--read-the-answers-this-plan-is-not-allowed-to-guess),
    label the runner that won instead, in one line, and say that is what you did.
  - Produces: one label per candidate with the sentence justifying it.
  - Done when: every row has a label, including the winner. **That label is what
    `running-the-workers` asked for and the thing nobody will remember to write later**, and its
    absence makes the labels that scope already wrote useless.

▶ **Next: [instruction 6.1](#6--choose-it-provision-it-and-sign-it)**, which is where a person
chooses.

### 4. ✍️ Write the decision record

◀ **Needs: [instruction 6](#6--choose-it-provision-it-and-sign-it)** done, so there is a decision to
record rather than a preference to justify.

- [ ] **4.1 Write `artifacts/notes/getting-it-out/how-attica-gets-deployed.md`**
  - Six sections, in the order given in [Description](#description-what-to-establish).
  - Open it with the commit, the uncommitted-change count and the date from
    [task 2.8](#2--pin-the-seven-rulers-and-run-them).
  - Every losing candidate gets its own paragraph naming why it lost. "Not chosen" is not a reason.
  - Section 4 carries the provider, the region, the size and the fixed monthly price read off the
    console in [instruction 6.2](#6--choose-it-provision-it-and-sign-it), not off a pricing page.
  - Done when: a person who was not in the room can say what was chosen, what it beat, and what would
    have to be true for a different answer to win.

- [ ] **4.2 Name the four roles and what sets each**
  - The four are the process that serves requests, the process that runs recurring work, the
    database, and the store holding uploaded media. This is the reading of "logically separable"
    this scope works under, per
    [the decisions taken here](../decisions-taken-here.md#logically-separable-is-read-as-four-named-roles-reachable-by-configuration).
  - For each: what it is today, what sets it after this decision, and what moving it off the machine
    would cost. Three of the four are literals in `settings.py` right now, from
    [task 2.2](#2--pin-the-seven-rulers-and-run-them).
  - Produces: what [04](04-let-the-environment-say-where-things-live.md) implements for three of them
    and [05](05-give-the-client-an-address.md) for the fourth.
  - Done when: the one-machine arrangement is written down **as a choice with a reason**, not left as
    an assumption, and each role names the environment variable that will set it. A role whose
    variable is unnamed is a role plan 04 will invent a name for.

- [ ] **4.3 Write the three rules a deploy runs under, naming no table and no job**
  - **The schema-change rule.** Whether the application must tolerate both shapes while a migration
    is in flight, and what a deploy does about it. Answerable now; which tables move is D1's.
  - **The migration-fails-halfway rule.** What state the deploy stops in, what is still serving
    traffic, and what a person does next.
  - **The restart rule.** A deploy restarts processes, and a restart is when timed work is dropped or
    run twice. Say what happens to work in flight, as a property of the deploy. The list of jobs
    belongs to `running-the-workers` and its contents to D2.
  - Produces: three rules, each one paragraph.
  - Done when: none of the three names a table, a model or a management command. **A rule that names
    a table was written by guessing D1's answer**, and it will be rewritten the moment D1 lands.
  - ❌ If a rule cannot be written without naming something specific, that is a signal the rule is
    really a procedure. Write down what it is waiting on and leave the rule at the level it can
    honestly reach.

- [ ] **4.4 Write the line `running-the-workers` is waiting for**
  - One line naming what this answer does to each labelled execution-tier candidate, from
    [task 3.3](#3--label-every-candidate-against-the-execution-tier), or one line about the runner
    that won if D7 is already taken.
  - Produces: the return half of an obligation that only works in both directions, per
    [the decisions taken here](../decisions-taken-here.md#d7-is-a-constraint-on-d9-and-this-scope-owes-running-the-workers-the-return-line).
  - Done when: the line names a consequence rather than describing the decision again.

- [ ] **4.5 Write the grouping's card**
  - Create `artifacts/notes/getting-it-out/README.md` per `~/.claude/ARTIFACT_TREE_FORMAT.md`, with
    one entry for the decision record: what it holds, how it was established, what it lets you say,
    what it cannot say.
  - Done when: the provenance is in the card as prose, so no folder or filename has to carry it.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 4](#4--write-the-decision-record)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 5. 🖥️ See what a person actually does today

◀ **Needs: [task 1](#1--read-the-answers-this-plan-is-not-allowed-to-guess)**.

Every candidate is scored on what a person does by hand. You cannot score that column honestly
without doing today's version once, deliberately, while watching yourself do it.

5.1 **Bring the whole stack up from a cold terminal and count your own steps**
   - Follow [Stack § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up)
     exactly, from four closed terminals.
   - Write down every command you type, every terminal you open, and every moment you had to
     remember something the recipe did not say.
   - Expected result: four processes running, and the app reachable at `http://localhost:5173`.
   - ✅ You have a numbered list of what a person does to run Attica: that list is the "what does a
     person do by hand" column's zero point. Put it in the notes file.
   - ❌ The recipe did not get you there: that gap is a finding for
     [the runbook](../../../../../runbook/00-INDEX.md) and belongs in
     [plan 06](06-ship-it-put-it-back-and-write-it-down.md)'s recipe work. Write down which step
     failed before you work around it.

5.2 **Turn debug off and watch the interface disappear**
   - Stop the backend. Restart it as
     `DEBUG=False SECRET_KEY=x ALLOWED_HOSTS=localhost,127.0.0.1 python manage.py runserver` from
     `backend/main` with the virtual environment active.
   - Open `http://127.0.0.1:8000/` in Chrome.
   - Expected result: a 404. `backend/main/main/urls.py` ends at line 61 with no route for `''` and
     no catch-all.
   - ✅ You saw the 404: that is [plan 05](05-give-the-client-an-address.md)'s entire reason for
     existing, on your screen. Screenshot it and save it as
     `artifacts/figures/getting-it-out/backend-404-on-root.png`.
   - ❌ Something rendered: then a route has been added since 2026-08-23. Read `urls.py` and correct
     the claim in [the scope's master plan](../MASTER_PLAN.md), because plan 05 changes shape.

5.3 **Open an uploaded image with debug off**
   - Still with `DEBUG=False`, find any media URL the app serves (any provider or event image) and
     request it directly, for example `http://127.0.0.1:8000/media/<some-file>`.
   - Expected result: a 404. `urls.py:60` to `:61` serve `MEDIA_URL` only under `if settings.DEBUG`.
   - ✅ The image is gone: 51 MB of uploads across 478 files have nothing serving them the moment
     debug goes off, and that is a role in [task 4.2](#4--write-the-decision-record) rather than a
     detail. Write down the URL you tried.
   - ❌ It served: check whether `whitenoise` or `django-storages` has been added to
     `requirements.txt` since, and say so, because the media role's answer changes.

▶ **Next: [task 3.1](#3--label-every-candidate-against-the-execution-tier)**, which scores the
candidates against what you just watched.

### 6. ⚖️ Choose it, provision it, and sign it

◀ **Needs: [task 3](#3--label-every-candidate-against-the-execution-tier)** done, so there is a table
to read.

This is D9. Nobody else takes it, and no plan in this folder pre-answers it. Step 6.2 spends money,
so read [instruction 6.5](#6--choose-it-provision-it-and-sign-it) before you start if you would
rather defer that part.

6.1 **Read the candidate table end to end before forming a view**
   - Open `artifacts/notes/getting-it-out/how-attica-gets-deployed.md`.
   - Read the holds-a-connection-open column and the fails-halfway column first, because those two
     remove candidates without argument.
   - ✅ At least one candidate keeps a WebSocket open and has an answer to the halfway question:
     choose among those.
   - ❌ No candidate does both: that is a real finding, not a dead end. The answer is the least-bad
     candidate plus a written statement of what it does not do. Do not invent a candidate to escape
     it.

6.2 **Create the account and provision the machine**
   - This is the `[owner: human]` criterion in [the definition of done](../MASTER_PLAN.md#definition-of-done),
     and nothing in this scope can be checked against a real machine until it exists.
   - In a browser, open the console of the provider you chose in 6.1. Sign up or sign in on an
     account you own.
   - Create one Linux virtual machine. In the create form: choose a **Johannesburg** region (South
     Africa North on Azure, `af-south-1` on AWS, `johannesburg` on Oracle Cloud, `JNB1` on Vultr;
     pick from what the provider actually offers rather than from this list). Choose the smallest
     size that carries the four roles. Choose a fixed monthly plan rather than a metered one.
   - Before pressing create, the form shows a price. **Write down the exact monthly figure and the
     currency it is quoted in.**
   - Press create. Wait for the machine to report running.
   - Expected result: a machine with a public address, a region, a size and a monthly price, all four
     readable on one console page.
   - ✅ All four are on the screen: screenshot that page and save it as
     `artifacts/figures/getting-it-out/the-machine-in-the-console.png`, then copy the four values into
     section 4 of the notes file. That screenshot is the evidence the price is what the provider says
     rather than what a pricing page said.
   - ❌ No Johannesburg region is offered: that provider is out, whatever else it scored. Go back to
     6.1 and choose the next candidate, and write one line in the notes saying the provider lost on
     region rather than on merit.

6.3 **Reach the machine once, by hand, and write down how**
   - From a terminal, connect to it however the provider says: `ssh` with a key, a browser console,
     or a provider CLI.
   - Run `uname -a` and `df -h` on it.
   - Expected result: a Linux kernel string and a disk with room for 51 MB of media plus a database
     plus a build.
   - ✅ You are on the machine: write the exact connect command into section 4 of the notes. It is
     the first line of [plan 06](06-ship-it-put-it-back-and-write-it-down.md)'s shipping recipe.
   - ❌ You cannot connect: this is the most common place a deploy stalls, and it is worth solving
     now rather than in the middle of a first deploy. Record what blocked you and how you got past
     it; that is a runbook paragraph.

6.4 **Say the decision out loud in one sentence, then write it**
   - The sentence has this shape: "A change reaches Attica by `<mechanism>`, running on
     `<provider> <size>` in `<region>` at `<price>` a month, because `<the criterion that decided
     it>`, and it would `<label>` whatever runs the recurring work."
   - ✅ You can say it without reading the table: the decision is clear enough for four plans to
     build on.
   - ❌ You cannot say it in one sentence: the table is missing a criterion. Go back to
     [task 3.1](#3--label-every-candidate-against-the-execution-tier) and add it rather than deciding
     around it.

6.5 **Sign and date it, or record the deferral with a date**
   - Write your name and the date under the decision in the notes file. This is what makes it a
     decision rather than a proposal, and it is what
     [04](04-let-the-environment-say-where-things-live.md)'s first task reads.
   - **If you chose to defer 6.2 and 6.3** rather than spend now: that is a legitimate choice and it
     is recorded, not skipped. Write the deferral with a date in section 4, and note that
     [plan 06](06-ship-it-put-it-back-and-write-it-down.md) is blocked until it happens, because a
     deploy needs a machine to arrive at. Plans 02 to 05 are not blocked by it and continue.

▶ **Next: [task 4.1](#4--write-the-decision-record)**, which writes it down in full.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody can start plans 03, 04 and 05 on the same morning, from the notes
> file alone, without asking anybody what "the deployed environment" means.

Pass:

- All seven rulers carry the command that produced them, and the file records the commit, the
  uncommitted-change count and the date they came from.
- Every candidate carries a plain answer in all eight columns, plus its three schema-change answers,
  plus a label saying what it does to the execution tier.
- Every losing candidate has a paragraph saying why it lost.
- The four roles are named, each with what sets it and what moving it off the machine would cost, and
  the one-machine arrangement is written as a choice with a reason.
- The three deploy rules exist and none of them names a table, a model or a management command.
- The line `running-the-workers` asked for is written.
- A real machine exists, and its provider, region, size and monthly price are in the notes, read off
  the console with a screenshot behind them. Or a dated deferral is recorded and says what it blocks.
- The decision is signed and dated by a person.

Fail, and what it means:

- A decision record written before instruction 6. Then the record is the writer's preference with a
  table attached, and the table will be read as evidence for it.
- A price taken from a pricing page rather than from the create form. Those two numbers differ, and
  the one that matters is the one the account is charged.
- A schema-change rule that names a table. It was written by guessing D1, and it will be rewritten
  the moment D1 lands.
- A candidate table without "nothing changes and the laptop is the deployment". It is the only
  candidate that costs nothing, and a table that omits it is arguing rather than comparing.
- An after-number in a later plan planned against a different command from the before-number here.
  Two rulers measure nothing.
- A cell reading "depends". Say what it depends on.

Partial pass is acceptable on the machine alone. The decision taken well with provisioning deferred
and dated beats a machine bought in the same hour the table was written, because
[02](02-make-two-clones-the-same.md), [03](03-make-the-workflow-a-gate.md),
[04](04-let-the-environment-say-where-things-live.md) and
[05](05-give-the-client-an-address.md) all run without one.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The decision record, six sections | `artifacts/notes/getting-it-out/how-attica-gets-deployed.md` | — | not started |
| The grouping's card | `artifacts/notes/getting-it-out/README.md` | — | not started |
| The seven pinned rulers and their before-numbers | inside the decision record | — | not started |
| The candidate table, eight criteria plus the schema-change columns | inside the decision record | — | not started |
| The four roles with what sets each | inside the decision record | — | not started |
| The three deploy rules, naming no table | inside the decision record | — | not started |
| The line `running-the-workers` is waiting for | inside the decision record | — | not started |
| The machine's provider, region, size and monthly price | inside the decision record, section 4 | — | not started |
| The backend returning 404 on `/` with debug off | `artifacts/figures/getting-it-out/backend-404-on-root.png` | — | not started |
| The provisioned machine on its console page | `artifacts/figures/getting-it-out/the-machine-in-the-console.png` | — | not started |
| One machine, and four hands to start it | [piece 1](../diagram-prompts.md#piece-1-one-machine-and-four-hands-to-start-it-planned--not-rendered) → `../diagrams/subject-01-one-machine-four-hands.png` | subject | ⏳ not rendered |
| The deploy glyph, opened up | [the subject capstone](../diagram-prompts.md#the-deploy-glyph-opened-up-planned--not-rendered) → `../diagrams/subject-capstone-the-deploy-glyph-opened-up.png` | subject | ⏳ not rendered |
| A commit, a gate, and a machine that can be reached | [process prompt 1](../diagram-prompts.md#prompt-1-process-a-commit-a-gate-and-a-machine-that-can-be-reached-planned--not-rendered) → `../diagrams/process-01-a-commit-a-gate-and-a-machine.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/getting-it-out/plans/01-take-the-deployment-decision.md` | task 0, before any work | Conformance and thin instructions reported |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the scope's master plan](../MASTER_PLAN.md): what is true today, with a count or a line number on every claim.
- [the decisions taken here](../decisions-taken-here.md#d9-is-left-open-rather-than-answered-here): why the answer is not written above this plan.
- [the target host entry](../decisions-taken-here.md#the-target-host-one-small-linux-machine-in-johannesburg-at-a-fixed-price): the four constraints every candidate is scored inside, and the three classes they beat.
- [the open decisions](../../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions): D9 in its own words, and D1, D2, D6, D7 and D8 beside it.
- [the execution decision](../../running-the-workers/plans/01-take-the-execution-decision.md): the execution-tier candidates and their labels, which task 3.3 answers.
- [the execution model](../../../../../environment/overview.md#execution-model): four hand-started processes, none supervising another.
- [the access paths](../../../../../environment/overview.md#access-paths): the two HTTP clients and why neither survives a move.
- `backend/main/main/settings.py`: eight environment reads, four literals, no `SECURE_` setting.
- `backend/main/main/urls.py`: ends at line 61, no route for `''`, media served only under `if settings.DEBUG`.
- `.github/workflows/ci.yml`: two jobs, no deploy job, no `environment:`, no step that keeps anything.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[02-make-two-clones-the-same.md](02-make-two-clones-the-same.md) runs beside this plan and waits on
nothing in it. [04-let-the-environment-say-where-things-live.md](04-let-the-environment-say-where-things-live.md)
is the first plan that needs this decision, because it writes the environment variables the four
roles are set by.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. The work is a decision taken by a person against counts gathered by hand and
a machine created in a browser, and the skills that come closest do the wrong half: `/code-audit`
hunts defects with no question in hand, and `/env-pulse` records facts about a system that exists
rather than choosing one that does not.
   also: `/env-pulse` becomes the right skill the moment instruction 6.2 creates a machine, and it
   is [plan 06](06-ship-it-put-it-back-and-write-it-down.md)'s.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A count that moved without the code moving | Any before-and-after measurement in this scope | Two different searches. Use the pinned commands from task 2 for both ends of every comparison. |
| `manage.py check --deploy` reports nothing wrong | Running it without `DEBUG=False` | Four of the five issues are unconditional, but the command reports far less in debug mode. Always run it with `DEBUG=False SECRET_KEY=x ALLOWED_HOSTS=example.com` in front of it. |
| `gh run list` returns nothing or errors | Task 2.6, when the CLI is not authenticated for this repository | `gh auth status`. Reading a failing run's log additionally needs repository admin rights, which this account does not have, so that half is [instruction 5.1 of plan 03](03-make-the-workflow-a-gate.md#5--read-the-failure-in-githubs-own-interface). |
| A price that turns out to be metered | Instruction 6.2, choosing a plan from a marketing page | The create form is the only place the actual plan is chosen. Read the figure off that form, and screenshot it. |
