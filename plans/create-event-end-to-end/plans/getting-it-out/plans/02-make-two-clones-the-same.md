# 📦 Make Two Clones The Same

Step 2 of 6 in this scope. Waits on `one-booking-truth`, which is the parent's edge for the whole
scope, and on nothing inside it: this plan runs beside
[01-take-the-deployment-decision.md](01-take-the-deployment-decision.md), because a committed
lockfile and a committed variable template are right whatever the decision turns out to be. Next:
[03-make-the-workflow-a-gate.md](03-make-the-workflow-a-gate.md), whose frontend job dies before it
installs anything because the file this plan commits is not in the repository.

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

Scope: [getting it out](../MASTER_PLAN.md). Second of six, and the only one that needs no answer
from [01](01-take-the-deployment-decision.md).

Every deployment mechanism worth choosing installs from a clone. One that installs from an unpinned
clone produces a different bundle on different days from the same commit, which makes "the deploy
changed something" a question with no answer. So this plan runs at the same time as the decision, and
[03](03-make-the-workflow-a-gate.md) waits on it.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 30.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

**One half of this application pins every version and the other half pins none.**

All 62 lines of `backend/main/requirements.txt` are exact `package==version` pins, with no ranges and
no unpinned names. `frontend/package-lock.json` exists on this disk at 213,847 bytes and has never
been committed: `.gitignore:45` is the bare pattern `package-lock.json`, and
`git log --all -- frontend/package-lock.json` returns no commits. So a fresh clone resolves 25
dependencies and 13 development dependencies from ranges at install time, and two installs a week
apart can produce two different bundles from the same commit.

**The list of what the application needs from its environment is invisible to anyone who clones it.**
`.gitignore:58` is `**/.env.*`, which matches `.env.example` itself, confirmed by
`git check-ignore -v`, and `git log --all -- .env.example` returns no commits. A clone learns nothing
about which variables exist.

That file also carries a live Sentry auth token, and **that is not this plan's problem**. Rotating it
and replacing the values with placeholders is
[task 2.3 and instruction 3.4 of closing the gaps](../../fixing-create-event/plans/02-close-the-gaps.md).
What is left over after that plan runs is that the file is still gitignored, so a clone still learns
nothing, which is why this plan writes a template that is not that file. The reasoning is in
[the decisions taken here](../decisions-taken-here.md#the-scope-covers-making-one-machine-reproducible-not-only-shipping-to-a-second-one).

**Neither D1 nor D2 reaches this plan.** Which booking representation survives and when a hold starts
change what the application does. They change nothing about whether two installs of the same commit
produce the same thing.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **The Python environment is a virtual environment at `/home/molef/lobola`**, per
  [the compute and runtime section](../../../../../environment/overview.md#compute--runtime). It is
  outside the repository, so a clone does not get it, and the cold start in
  [instruction 5](#5--prove-a-cold-clone-by-hand) creates a second one on purpose rather than reusing
  it.
- **Nothing on this machine is supervised**, per
  [the execution model](../../../../../environment/overview.md#execution-model). The cold start ends
  with four processes you started yourself, which is the correct end state today rather than a
  shortfall.
- **Two backend tests already fail**, per
  [the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints). The
  cold start's success condition is a running application, not a green suite.

**Where any fact this plan needs is missing from `environment/`, stop and ask rather than inferring
it.**

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**This is the smallest plan in the scope and the one most likely to be treated as tidying up.**

It is not tidying up. The lockfile is the most likely cause of the frontend job's current failure, so
it is on the direct path to a workflow that passes. And the template is what
[04](04-let-the-environment-say-where-things-live.md) and
[05](05-give-the-client-an-address.md) add their new variables to, so a scope without it has four
plans each inventing its own place to write a variable name down.

**Removing a `.gitignore` line makes files visible, and you have to look at which ones.**

`.gitignore:45` is a bare `package-lock.json` with no path on it, so it matches at any depth.
Removing it makes every lockfile in the tree visible to git at once, not just the one wanted. The
task that removes it reads `git status --short` immediately afterwards and adds one named path, never
`git add .`.

**A template with a real value in it is worse than no template.**

The whole reason a second file is needed is that the existing one carries a live credential. A
template written by copying `.env.example` and forgetting one line reproduces the problem in a file
that is committed, which is strictly worse than a file that is not. Every value in the template is a
placeholder, and [task 3.3](#3--write-the-committed-variable-template) is the check that says so.

**The template lists what exists today, and each later plan adds its own.**

Eight variables are read today. [04](04-let-the-environment-say-where-things-live.md) adds the ones
that replace the four literals, and [05](05-give-the-client-an-address.md) adds the client's backend
address. Each of those plans has its own task appending to the template. This plan does not
pre-write variables for settings that do not read anything yet, because a template listing a variable
nothing reads teaches a clone something false.

**The cold start is the deliverable, not the checkbox after it.**

Committing two files takes ten minutes. The value is in
[instruction 5](#5--prove-a-cold-clone-by-hand): somebody clones into an empty directory and finds
out, by hitting them, which steps need knowledge that is not in the repository. That list is what
[06](06-ship-it-put-it-back-and-write-it-down.md)'s shipping recipe is written around.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**Two clones of this commit are not the same clone**, and until they are, nothing anybody deploys can
be reasoned about, because the difference between two deploys might be the code or might be the
Tuesday somebody installed on.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Neither of these two lines was a mistake at the time. `package-lock.json` in a `.gitignore` is a
default in plenty of starter templates, and `**/.env.*` is exactly what you want for a file holding
secrets. Both are correct in the world where the repository never leaves the laptop.

They stop being correct the moment anything installs from a clone. The workflow already does, twice a
run, and its frontend job dies at `Set up Node`, the step before any dependency is installed, having
been asked to cache against a file that is not there.

The cost of leaving this is not a broken build; it is an unanswerable question. When a deploy behaves
differently from the laptop, the first thing anybody wants to know is whether the code is different.
With an unpinned frontend, it might be a transitive dependency that published a patch on Wednesday,
and no amount of reading the diff will tell you.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  TODAY                                    AFTER

  requirements.txt   62 exact pins         requirements.txt   62 exact pins
        │                                        │
        └──► install ──► the same thing          └──► install ──► the same thing

  package.json  25 + 13 ranges             package-lock.json  committed
  package-lock.json  on disk, 0 commits          │
        │                                        └──► npm ci ──► the same thing
        ├──► install Monday ──► bundle A
        └──► install Friday ──► bundle B

  .env.example  gitignored, 0 commits      backend/main/env.template  committed
        │                                        │
        └──► a clone sees nothing                └──► a clone sees every name,
                                                       every value a placeholder

                                           and one person has proved it by
                                           cloning into an empty directory
                                           and reaching a running app
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is exactly this plan's subject.

**Subject: two clones are not the same clone.** The pinned backend arriving at one artifact, the
unpinned frontend arriving at two different ones, the lockfile outside its own panel with a cross on
it, and the variable list behind a closed barrier.
[Piece 5](../diagram-prompts.md#piece-5-two-clones-are-not-the-same-clone-planned--not-rendered).
Save as `../diagrams/subject-05-two-clones-are-not-the-same.png`. *(image not yet generated)*

The counter chips on that piece carry the numbers from
[task 1.1](#1--measure-what-a-clone-gets-today), so the picture and the notes file say the same
thing.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Three things, two of them committed files.

1. **`frontend/package-lock.json`, committed.** The 213,847-byte file that already exists on this
   disk, made part of what a clone gets, with `.gitignore:45` no longer excluding it.
2. **`backend/main/env.template`, committed.** One line per variable the application reads today,
   each with a placeholder value and a one-line comment saying what it is for and what happens when
   it is unset. Named without a leading `.env` so that `.gitignore:13` and `:58` do not match it,
   and placed beside the `.env` that `python-decouple` actually reads, which
   `backend/main/main/settings.py:26` names in its comment.
3. **A cold-start note** at `artifacts/notes/getting-it-out/what-a-clone-does-not-get.md`: the
   before-numbers from ruler five, the after-numbers, and the list of every step in
   [instruction 5](#5--prove-a-cold-clone-by-hand) that needed knowledge not in the repository.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 2](../MASTER_PLAN.md#objectives), making one machine reproducible
before making a second one, and unblock [03](03-make-the-workflow-a-gate.md), whose frontend job
cannot install anything without the file this plan commits.

**Goal.** `git log --all -- frontend/package-lock.json` returns at least one commit;
`git check-ignore -v frontend/package-lock.json` returns nothing; `npm ci` succeeds in a clone made
into an empty directory; `backend/main/env.template` is committed, lists every variable the
application reads today, and contains no real value; and a person has reached a running application
from that clone alone, with every step that needed outside knowledge written down.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/getting-it-out/plans/02-make-two-clones-the-same.md`

▶ **Next: [task 1.1](#1--measure-what-a-clone-gets-today)**.

### 1. 📊 Measure what a clone gets today

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Take ruler five, with the command from plan 01**
  ```
  cd /home/molef/Work/attica
  git log --all --oneline -- frontend/package-lock.json | wc -l
  git check-ignore -v frontend/package-lock.json .env.example
  grep -c '==' backend/main/requirements.txt
  wc -l < backend/main/requirements.txt
  ```
  - This is the same command as
    [task 2.5 of plan 01](01-take-the-deployment-decision.md#2--pin-the-seven-rulers-and-run-them),
    unchanged. If plan 01 has already run, copy its answer rather than re-running and quietly
    getting a different one.
  - Produces: the four before-numbers, written into
    `artifacts/notes/getting-it-out/what-a-clone-does-not-get.md`.
  - Done when: all four are in the note with the command above them and the commit from
    `git rev-parse --short HEAD` at the top.

- [ ] **1.2 Establish what a clone would have to resolve, and how big the file is**
  ```
  cd /home/molef/Work/attica/frontend
  ls -l package-lock.json | awk '{print $5}'
  python3 -c "import json;d=json.load(open('package.json'));print(len(d.get('dependencies',{})),'deps',len(d.get('devDependencies',{})),'devDeps')"
  ```
  - Produces: two results. On 2026-08-23: 213,847 bytes, and 25 dependencies with 13 development
    dependencies.
  - Done when: both are in the note. The size matters because it is the evidence the file exists and
    is complete, which is different from the claim that it is committed.

- [ ] **1.3 List every variable the application reads today, from the source**
  ```
  cd /home/molef/Work/attica/backend/main/main
  grep -n 'config(\|os.environ' settings.py
  ```
  - Produces: the eight names with their line numbers and their defaults. On 2026-08-23:
    `SECRET_KEY` (`:27`), `DEBUG` (`:31`), `ALLOWED_HOSTS` (`:32`), `CORS_ALLOWED_ORIGINS` (`:140`),
    `MAX_UPLOAD_SIZE_BYTES` (`:230`), `SENTRY_DSN` (`:248`), `SENTRY_ENVIRONMENT` (`:256`) and
    `SENTRY_TRACES_SAMPLE_RATE` (`:257`).
  - Done when: the list is derived from the file rather than from `.env.example`, which is a
    different list and is not authoritative. ❌ If a name appears in `.env.example` and in no
    `config()` or `os.environ` call, it goes in the template with a comment saying nothing reads it,
    or it does not go in at all. Do not silently carry a dead variable forward.

▶ **Next: [task 2.1](#2--commit-the-lockfile)**.

### 2. 🔓 Commit the lockfile

◀ **Needs: [task 1](#1--measure-what-a-clone-gets-today)**.

- [ ] **2.1 Remove the bare pattern from `.gitignore` and look at what became visible**
  ```
  cd /home/molef/Work/attica
  sed -n '43,47p' .gitignore
  ```
  - `.gitignore:45` is the bare pattern `package-lock.json`, with no path, so it matches at any
    depth. Remove that one line and nothing else. `yarn.lock` on the next line stays: this
    repository uses npm, and unignoring a second lockfile format invites a second one to appear.
  - Then, immediately:
    ```
    git status --short
    ```
  - Produces: the list of everything that became visible. Expected: `frontend/package-lock.json` and
    nothing else.
  - Done when: the list has been read. ❌ If more than one path appears, name each one and decide it
    on purpose. **Do not run `git add .` at any point in this task**: a bare pattern removal is
    exactly the situation where that command commits something nobody looked at.

- [ ] **2.2 Add the one file by name and confirm it is no longer ignored**
  ```
  cd /home/molef/Work/attica
  git add .gitignore frontend/package-lock.json
  git check-ignore -v frontend/package-lock.json ; echo "exit: $?"
  git status --short frontend/package-lock.json
  ```
  - Produces: `git check-ignore` returning nothing with exit status 1, and the file staged as `A`.
  - Done when: the check-ignore output is empty. An empty result from that command is the whole
    claim; the file being staged is not, because a forced add would also show staged.

- [ ] **2.3 Prove the lockfile installs what it says**
  ```
  cd /home/molef/Work/attica/frontend
  npm ci --dry-run 2>&1 | tail -20
  ```
  - Produces: the resolution result. A `npm ci` that resolves means the lockfile agrees with
    `package.json`.
  - Done when: it resolves without error.
  - ❌ If `npm ci` reports that the lockfile is out of sync with `package.json`, **do not commit it in
    that state**. Run `npm install` once to bring them into agreement, read what changed in the diff,
    and say in the note which packages moved. A lockfile that disagrees with its manifest fails the
    workflow in a way that looks like the original problem.

▶ **Next: [task 3.1](#3--write-the-committed-variable-template)**.

### 3. 📝 Write the committed variable template

◀ **Needs: [task 1](#1--measure-what-a-clone-gets-today)**, so the variable list comes from
`settings.py` rather than from a file that may be stale.

- [ ] **3.1 Create `backend/main/env.template` from the list in task 1.3**
  - One block per variable: the name, a placeholder value, and a comment saying what it is for and
    what happens when it is unset. `SECRET_KEY` and `DEBUG` both currently have working defaults, and
    the comment says so, because [04](04-let-the-environment-say-where-things-live.md) removes those
    defaults and the template is where a clone finds out.
  - The filename has no leading `.env`, so neither `.gitignore:13` (`.env.*`) nor `:58`
    (`**/.env.*`) matches it. Confirm with `git check-ignore -v backend/main/env.template`, which
    must return nothing.
  - Open the file with two lines saying what to do with it: copy it to `backend/main/.env`, fill in
    real values, and never commit that copy.
  - Done when: the file exists, is staged, and `git check-ignore` returns nothing for it.

- [ ] **3.2 State the rule that keeps it current**
  - Add a comment block at the top: every plan that makes a setting read the environment adds its
    variable here in the same change. [04](04-let-the-environment-say-where-things-live.md) adds the
    database, Redis and media variables and the security settings;
    [05](05-give-the-client-an-address.md) adds the client's backend address to a
    `frontend/env.template` of its own.
  - Done when: the rule is written in the file rather than only in this plan, because the file is
    what somebody reads six months from now.

- [ ] **3.3 Check every value in it is a placeholder**
  ```
  cd /home/molef/Work/attica
  grep -nE 'sntrys_|sk_live|sk_test|-----BEGIN|django-insecure-|@[a-z0-9.-]+\.(com|io|net)' backend/main/env.template
  ```
  - Produces: expected to be empty.
  - Done when: the command returns nothing, and a person has also read the file top to bottom. **A
    template with one real value in it is worse than no template**, because it is committed and the
    file it replaces was not.
  - ❌ If anything matches, remove the value, and if it is a live credential, say so out loud: the
    Sentry token in `.env.example` is already owned by
    [closing the gaps](../../fixing-create-event/plans/02-close-the-gaps.md) and a second live
    credential is a new finding that needs rotating by whoever owns that account.

- [ ] **3.4 Point at it from the environment index**
  - Add a row to [the environment index](../../../../../environment/00-INDEX.md)'s "Before I..."
    table: the moment is setting this application up on a machine that is not this one, the file is
    the template, and the reason is that eight settings fall back silently so a missing one produces
    a working application rather than a refusal to start.
  - Done when: the row is there. A committed template nobody is pointed at is a file that will never
    be read, and the parent convention is that every document must be named by something.

▶ **Next: [instruction 5.1](#5--prove-a-cold-clone-by-hand)**, which is the only thing that proves
either file works.

### 4. 📊 Take the after-numbers and write what a clone still does not get

◀ **Needs: [instruction 5](#5--prove-a-cold-clone-by-hand)** done, so the list of missing knowledge
is a list of things somebody actually hit rather than a list of things somebody imagined.

- [ ] **4.1 Run ruler five again, unchanged**
  ```
  cd /home/molef/Work/attica
  git log --all --oneline -- frontend/package-lock.json | wc -l
  git check-ignore -v frontend/package-lock.json .env.example
  grep -c '==' backend/main/requirements.txt
  wc -l < backend/main/requirements.txt
  ```
  - Produces: the after-numbers beside the before-numbers in the note, with the command between them.
  - Done when: the first number is no longer zero, and `git check-ignore` returns a line for
    `.env.example` and no line for the lockfile. **`.env.example` staying ignored is the correct
    result, not a failure**: this plan replaced it rather than un-ignoring it.

- [ ] **4.2 Write the list of what a clone still does not get**
  - Every step from [instruction 5](#5--prove-a-cold-clone-by-hand) that needed knowledge not in the
    repository, in the order they were hit.
  - The three known ones before you start, so the list is not read as complete when it only contains
    them: the Python virtual environment lives outside the repository, Redis has to be running and
    nothing in a clone starts it, and the database file and the 51 MB of media are excluded by
    `.gitignore` so a clone starts with an empty database.
  - Produces: the section of the note that
    [06](06-ship-it-put-it-back-and-write-it-down.md)'s shipping recipe is written around.
  - Done when: each item names what was missing and where the answer actually lives, so the recipe
    can be written from it without a second walk.

- [ ] **4.3 Write the grouping's card entry**
  - Add this note to `artifacts/notes/getting-it-out/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`.
  - Done when: the provenance is in the card as prose.

▶ **Next: the close out.**

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 4](#4--take-the-after-numbers-and-write-what-a-clone-still-does-not-get)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 5. 🧊 Prove a cold clone by hand

◀ **Needs: [tasks 2 and 3](#2--commit-the-lockfile)** done, so there is a lockfile and a template in
the clone to install from.

This is the `[owner: human]` criterion in [the definition of done](../MASTER_PLAN.md#definition-of-done),
and it is the only thing that turns two committed files into a claim worth making. The rule for the
whole walk: **you may not open any file outside the clone.** Not this repository, not a chat message,
not your notes. Every time you want to, that is a finding, and it goes on the list.

5.1 **Make the clone**
   - Commit the two files first if they are not committed: `git add` was done in tasks 2.2 and 3.1,
     so `git commit -m "Commit the lockfile and the variable template"` from
     `/home/molef/Work/attica`.
   - Then, in a terminal:
     ```
     rm -rf /tmp/attica-cold && mkdir -p /tmp/attica-cold
     git clone /home/molef/Work/attica /tmp/attica-cold/attica
     cd /tmp/attica-cold/attica
     ls -la frontend/package-lock.json backend/main/env.template
     ```
   - Expected result: both files present in the clone.
   - ✅ Both are there: the commit worked and the clone is the thing you are proving.
   - ❌ Either is missing: it was not committed, or `.gitignore` still excludes it. Go back to
     [task 2.2](#2--commit-the-lockfile) and [task 3.1](#3--write-the-committed-variable-template).

5.2 **Install the frontend from the lockfile alone**
   - `cd /tmp/attica-cold/attica/frontend && npm ci`
   - Expected result: it installs without touching the network for version resolution, and prints a
     package count.
   - ✅ It succeeded: write down the elapsed time and the package count. That is the frontend job's
     future in [03](03-make-the-workflow-a-gate.md).
   - ❌ It refused because the lockfile is out of sync with `package.json`: stop and go back to
     [task 2.3](#2--commit-the-lockfile). That is the same failure the workflow would hit, found
     here for free.

5.3 **Build the frontend in the clone**
   - `npm run build`
   - Expected result: `dist/` appears with an `index.html` and an `assets/` folder.
   - ✅ You have a built bundle from a clean clone: `ls -la dist` and write down what is in it.
     That directory is what [03](03-make-the-workflow-a-gate.md) stops throwing away and what
     [05](05-give-the-client-an-address.md) makes Django serve.
   - ❌ The build failed: read the error, and note whether it needed something outside the clone. If
     it did, that is exactly the finding this walk is for.

5.4 **Set up the backend from the template alone**
   - `cd /tmp/attica-cold/attica/backend/main`
   - `cp env.template .env`, then open `.env` in an editor and fill in the values. **Fill them in
     using only what the template tells you.**
   - Create a second virtual environment on purpose, so you are not borrowing the one at
     `/home/molef/lobola`:
     ```
     python3 -m venv /tmp/attica-cold/venv
     source /tmp/attica-cold/venv/bin/activate
     pip install -r requirements.txt
     ```
   - Expected result: 62 pinned packages install.
   - ✅ It installed and you could fill in `.env` from the template: note the elapsed time.
   - ❌ You did not know what to put in a variable: **that is the point of this walk.** Write down
     which variable and what you had to guess, and fix the template's comment for it in
     [task 4.2](#4--take-the-after-numbers-and-write-what-a-clone-still-does-not-get).

5.5 **Reach a running application**
   - Start Redis if it is not already running (`redis-cli ping` should answer `PONG`).
   - `python manage.py migrate`, then `python manage.py runserver 8001`.
   - In a second terminal, `cd /tmp/attica-cold/attica/frontend && npm run dev -- --port 5174`.
   - Open `http://localhost:5174` in Chrome.
   - Expected result: the interface renders. It will have no data, because the database and the media
     are excluded by `.gitignore` and a clone starts empty.
   - ✅ The interface rendered: screenshot it and save it as
     `artifacts/figures/getting-it-out/cold-clone-running.png`. An empty application is the correct
     result here; a rendering interface with no rows is a reproducible clone, and the data is a
     separate question.
   - ❌ It did not render: note the exact step and error. Whatever it was, a person deploying to a
     new machine would hit the same thing, so it belongs at the top of
     [task 4.2](#4--take-the-after-numbers-and-write-what-a-clone-still-does-not-get)'s list.

5.6 **Count the times you wanted to look outside the clone**
   - Read back your notes from 5.1 to 5.5.
   - ✅ You have a numbered list: that is the deliverable of this instruction, and it is worth more
     than the two committed files.
   - ❌ Your list is empty: either the repository is genuinely self-sufficient, which would be a
     first, or you were reading from memory rather than from the clone. Be honest about which, in
     writing.

5.7 **Leave the clone alone rather than deleting it**
   - `/tmp/attica-cold` stays until
     [task 4](#4--take-the-after-numbers-and-write-what-a-clone-still-does-not-get) has been written
     from it, because the note is written from what is on that disk rather than from memory.
   - When you are done, it is yours to remove. Nothing in this repository depends on it.

▶ **Next: [task 4.1](#4--take-the-after-numbers-and-write-what-a-clone-still-does-not-get)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when somebody who has never seen this repository can clone it, install both
> halves, and reach a rendering interface, without opening anything that is not in the clone.

Pass:

- `git log --all -- frontend/package-lock.json` returns at least one commit, and
  `git check-ignore -v frontend/package-lock.json` returns nothing.
- `npm ci` succeeds in a clone made into an empty directory, and `npm run build` produces a `dist/`.
- `backend/main/env.template` is committed, lists every variable `settings.py` actually reads, and
  contains no real value.
- A person reached a rendering interface from the clone, with a screenshot.
- The list of everything that needed knowledge from outside the clone exists, and it names where each
  answer actually lives.
- Ruler five's after-numbers sit beside its before-numbers with the same command between them.

Fail, and what it means:

- `git add .` anywhere in task 2. Removing a bare `.gitignore` pattern makes an unknown set of files
  visible, and that command commits all of them without anybody looking.
- A template written by copying `.env.example`. That file's variable list may be stale and it carries
  a live credential; the authority is `settings.py`.
- A cold start done by reusing `/home/molef/lobola`. It borrows an environment a new machine does not
  have, so it proves nothing about what a clone gets.
- An empty list from instruction 5.6. Three things are known to be missing before the walk begins, so
  an empty list means the walk was done from memory.
- The lockfile committed while out of sync with `package.json`. It fails the workflow in a way that
  looks exactly like the problem this plan set out to fix.

Partial pass is acceptable when the cold start reaches an installed backend and stalls on Redis or on
an empty database. Those are known, and the finding is what step it stalled at, not that it stalled.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The lockfile, committed | `frontend/package-lock.json` | — | not started |
| The `.gitignore` line removed | `.gitignore`, line 45 | — | not started |
| The committed variable template | `backend/main/env.template` | — | not started |
| The row pointing at it | [the environment index](../../../../../environment/00-INDEX.md) | — | not started |
| The cold-start note, before and after | `artifacts/notes/getting-it-out/what-a-clone-does-not-get.md` | — | not started |
| The list of what a clone still does not get | inside that note | — | not started |
| A clone rendering the interface with no data | `artifacts/figures/getting-it-out/cold-clone-running.png` | — | not started |
| Two clones are not the same clone | [piece 5](../diagram-prompts.md#piece-5-two-clones-are-not-the-same-clone-planned--not-rendered) → `../diagrams/subject-05-two-clones-are-not-the-same.png` | subject | ⏳ not rendered |
| Six plans, six gates | [process prompt 2](../diagram-prompts.md#prompt-2-process-six-plans-six-gates-planned--not-rendered) → `../diagrams/process-02-six-plans-six-gates.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/getting-it-out/plans/02-make-two-clones-the-same.md` | task 0, before any work | Conformance and thin instructions reported |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the scope's master plan](../MASTER_PLAN.md): the two-machines-cannot-be-made-the-same section, with every claim's command.
- [the decisions taken here](../decisions-taken-here.md#the-scope-covers-making-one-machine-reproducible-not-only-shipping-to-a-second-one): why these two files are in a deployment scope at all, and where that argument stops.
- [closing the gaps](../../fixing-create-event/plans/02-close-the-gaps.md): owns the live Sentry token in `.env.example`. This plan does not touch it.
- `.gitignore:45`: the bare `package-lock.json` pattern, with no path, matching at any depth.
- `.gitignore:13` and `:58`: `.env.*` and `**/.env.*`, the two patterns the template's name must avoid.
- `backend/main/requirements.txt`: 62 lines, every one an exact pin.
- `backend/main/main/settings.py:26`: the comment naming `BASE_DIR/.env` as what `config()` reads in development.
- [the environment index](../../../../../environment/00-INDEX.md): where task 3.4 adds the row.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[03-make-the-workflow-a-gate.md](03-make-the-workflow-a-gate.md), whose frontend job dies at
`Set up Node` because it is asked to cache against the file this plan just committed.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. The work is two committed files and one walk done by hand, and the skill
that comes closest, `/tidy-repo`, files things into the right folders rather than deciding what a
clone should contain.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A bare `.gitignore` pattern removal makes unexpected files visible | Task 2.1, `package-lock.json` with no path on it | Read `git status --short` immediately afterwards and add paths by name. Never `git add .` in that task. |
| `npm ci` refuses because the lockfile disagrees with the manifest | Task 2.3 and instruction 5.2 | Run `npm install` once to reconcile, read the diff, and record which packages moved before committing. |
| A committed template carries a real credential | Task 3.3 | Run the placeholder check, and read the file by hand as well. The pattern list catches known shapes and not new ones. |
| A cold start that silently borrows the existing virtual environment | Instruction 5.4 | Create a second one under `/tmp` and activate it before installing. `which python` should answer inside `/tmp`, not `/home/molef/lobola`. |
