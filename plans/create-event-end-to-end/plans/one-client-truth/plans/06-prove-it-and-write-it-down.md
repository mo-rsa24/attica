# 🧾 Prove It And Write It Down

Step 6 of 6 in this scope. Waits on [05](05-one-transport-that-recovers.md). Last plan in this
folder.

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
- [Code references](#code-references)
- [Next step](#next-step)
- [Recommended skill](#recommended-skill)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [one client truth](../MASTER_PLAN.md). Last of six, and the only one whose deliverables
outlive the code.

It waits on [05](05-one-transport-that-recovers.md), which is the last plan that changes behaviour.
Everything before it built something; this one proves the built thing does what the scope claimed
and writes down what nobody will remember in three months: how to watch an event arrive, and how to
break a socket on purpose.

Nothing in this folder comes after it. What comes next in the tree is `the-event-workspace`, scope
11, which waits on this whole scope and builds the screens this one deliberately did not touch.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Five plans have landed. There is one cache, one envelope on the wire, one transport with one
reconnect policy, and a badge that cannot disagree with its list. None of that has been proved by
anyone doing it on purpose.

**Three checks in this scope's definition of done are a person's, and no test can do them.** The
duplicate test needs an outbox event replayed so the same change is delivered twice. The gap test
needs a browser taken offline while things happen behind its back. The refresh test needs somebody
pressing F5 at three specific moments and comparing what they see.

**Two runbook recipes do not exist in any form.** How to watch events arrive is the click path that
turns "the UI did not update" into a fact. How to force a reconnect is the other half, because every
recovery claim in this scope is unprovable without a way to break the socket on purpose and put it
back. Both were walked by hand in [03](03-put-the-envelope-on-the-wire.md) and
[05](05-one-transport-that-recovers.md); this plan turns those walks into recipes.

**One word this scope invented has no definition anywhere.** The event envelope appears in every
real-time message, and no file in the repository says what it is. `cache`, `socket`, `reconnect` and
`refetch` are facts about machinery and belong in `environment/` if anywhere; the envelope is the
name of the thing that carries every change a person sees, and it belongs in
[the context index](../../../../../context/00-INDEX.md).

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **Daphne, not `runserver`**:
  `daphne -b 0.0.0.0 -p 8000 main.asgi:application`, per
  [the execution model](../../../../../environment/overview.md#execution-model). Every check in this
  plan is a socket check, and under `runserver` all of them fail identically and silently.
- **The Django admin is on the backend port and needs a staff account no seed creates**, per
  [the admin site](../../../../../environment/django-admin/the-admin-site.md). The duplicate test
  replays an outbox row from the admin, so the account has to exist before
  [instruction 4](#4--the-duplicate-test-deliver-the-same-change-twice) starts, not during it.
- **Redis carries the websocket channel layer on the default logical database** and the page cache
  on database 1. Flushing the wrong one drops live websocket groups with no error, which during
  these tests would look exactly like the transport failing.
- **The outbox worker is a process nobody starts automatically.** Whether it runs at all is
  `running-the-workers`' scope. For the duplicate test the worker must be running, and
  [Stack § 4](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
  is the recipe for driving it by hand if that scope has not landed yet.
- **Two backend tests already fail**, so the check here is the two-browser walk and the frames read
  in the WS Messages panel, not a green suite.

Where a fact this plan needs is not written there, stop and ask rather than inferring it.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Read the frames, never the UI.**

Every check here has a UI symptom and a frame that explains it. A badge that did not move is
evidence of nothing on its own: it could be a working duplicate rule, or a message that never
arrived. The frame in the WS Messages panel is the difference, which is why every instruction below
says which panel to read rather than what to look at on the page.

**Write the recipe while the screen is still open.**

`/drip-runbook` walks a procedure one step at a time and writes it as it goes, and the reason to use
it here rather than writing the recipe afterwards is that the forgettable details are the ones that
matter: which drawer the Network conditions panel is in, what the WS row is called, what a good
frame looks like next to a bad one. Reconstructed a week later, those become "open DevTools and look
at the websocket", which is not a recipe.

**A recipe is marked by what actually happened.**

`runbook-pulse` marks each recipe `ran`, `adapted` or `unverified`. These two get `ran`, because
they are written from a walk that was performed. That mark is what stops a command written from
memory reading like one that has been run.

**The definition was already written, in [02](02-define-the-envelope.md).**

Section 1 of `docs/realtime_event_envelope.md` is two sentences written for a person who does not
know what a socket is, produced by the plan that designed the envelope. `/context-pulse` takes that
wording rather than composing a second definition. Two definitions of one word is how the word stops
meaning anything.

**The three by-hand tests can fail, and a failure here is the point.**

They are the acceptance for the whole scope. If the duplicate test moves the badge, something in the
apply rule or the version on the wire is wrong, and finding that here is the cheapest place it will
ever be found. Do not soften a result to close the scope.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**A scope is finished when somebody who was not here can break it on purpose, watch it recover, and
find the instructions for doing so without asking anyone.**

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Everything this scope built is invisible when it works. A cache that holds one copy looks like a
cache that holds four until two of them disagree. A duplicate that is correctly ignored looks like a
message that never arrived. A reconnect that refetches looks like a reconnect that did not need to.

So the proof cannot be "it seems fine". It has to be somebody deliberately delivering the same
change twice, deliberately hiding three changes behind an offline browser, and deliberately pressing
F5 at the three moments the parent scope named. And the instructions for doing that have to exist
afterwards, because the next person to doubt this will be doing it under time pressure with a bug
report open.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  THREE THINGS A PERSON DOES        WHAT IT PROVES

  replay one outbox event      ──►  the second delivery moves nothing
  (Django admin, scheduling)        badge unchanged, list unchanged
                                    read in the WS Messages panel

  offline, three changes,      ──►  the reconnect refetches and lands
  online (Network conditions)       on the correct state, by itself

  F5 after a request,          ──►  the screen is the same before
  a payment, a cancellation         and after. refresh is boring.

  THEN, WHILE THE SCREEN IS STILL OPEN

  /drip-runbook  ──►  two recipes:  watching events arrive
                                    forcing a reconnect
  /runbook-pulse ──►  both marked `ran`, index updated
  /context-pulse ──►  the event envelope gets its entry,
                      and booking-request says what a version means
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

Two pieces in this scope's map are what this plan checks the built system against.

**Subject: the gap nobody notices.** The picture of the defect the gap test is trying to reproduce
and failing to. If the gap test passes, this picture is now only history.
[Piece 5](../diagram-prompts.md#piece-5-the-gap-nobody-notices-planned--not-rendered).
Save as `../diagrams/subject-05-the-gap-nobody-notices.png`. *(image not yet generated)*

**Process capstone: several copies of one fact, to one copy that catches up.** The journey this plan
closes, drawn end to end.
[The process capstone](../diagram-prompts.md#process-capstone-several-copies-of-one-fact-to-one-copy-that-catches-up-planned--not-rendered).
Save as `../diagrams/process-capstone-many-copies-to-one-that-catches-up.png`.
*(image not yet generated)*

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Four things, three of them outside `plans/`.

1. **The three by-hand test results**, written into
   `artifacts/notes/one-client-truth/what-we-proved-by-hand.md`: what was done, what was seen, the
   frames read, and the date. A pass and a fail are recorded the same way.
2. **The runbook pair**, written with `/drip-runbook` during the walk and checked with
   `/runbook-pulse`. Two recipes under `runbook/driving-the-app/`, both marked `ran`, both reachable
   from a question in [the runbook index](../../../../../runbook/00-INDEX.md).
3. **The context entry**, written with `/context-pulse`: the event envelope defined in
   [the context index](../../../../../context/00-INDEX.md), taking its wording from section 1 of
   `docs/realtime_event_envelope.md`, plus a paragraph in
   [the booking request entry](../../../../../context/world/booking-request.md) saying what a
   version on a booking request means to a person.
4. **The scope closed out**: `/ingest-error-pattern` for what bit, `/sync-plan-tree` for the tree.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Close [the scope's definition of done](../MASTER_PLAN.md#definition-of-done): the three
by-hand checks, the runbook pair, and the context entry the scope owes for the word it introduced.

**Goal.** `artifacts/notes/one-client-truth/what-we-proved-by-hand.md` records three results with
their frames; two new recipes exist under `runbook/driving-the-app/` marked `ran` and reachable from
the index's question table; the event envelope has an entry in `context/`; and
[the booking request entry](../../../../../context/world/booking-request.md) says what a version
means to a person.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/06-prove-it-and-write-it-down.md`

▶ **Next: [task 1.1](#1--set-the-stage-for-three-tests-that-need-a-person)**.

### 1. 🎬 Set the stage for three tests that need a person

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Confirm the staff account for the Django admin exists**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  python manage.py shell -c "from django.contrib.auth import get_user_model; print(get_user_model().objects.filter(is_staff=True).values_list('username', flat=True))"
  ```
  - Produces: the list of staff usernames, or an empty list.
  - ❌ Empty: create one with `python manage.py createsuperuser`. No seed creates a staff account,
    per [the admin site](../../../../../environment/django-admin/the-admin-site.md), and finding
    that out halfway through the duplicate test wastes the setup.
  - Done when: a username is written into the working notes, and it can log in at
    `http://localhost:8000/admin/`.

- [ ] **1.2 Seed the data the walk needs and note what state it left**
  - Follow [Seeding § 1](../../../../../runbook/preparing-the-data/seeding-and-resetting-data.md#1-seed-the-marketplace-providers)
    and [Seeding § 3](../../../../../runbook/preparing-the-data/seeding-and-resetting-data.md#3-materialize-availability-slots).
  - Done when: two accounts that can message each other are named in the working notes, with which
    role each has. `getting-in`, scope 2, is what makes all five roles reachable; if it has not
    landed, use the roles that work and say which they were.

- [ ] **1.3 Find one outbox event to replay, and record its id**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  python manage.py shell -c "from scheduling.models import OutboxEvent; e=OutboxEvent.objects.order_by('-id').first(); print(e.id, e.event_type, e.aggregate_type, e.aggregate_id, e.status, e.payload)"
  ```
  - Produces: one row's id, type and payload, which is the row
    [instruction 4](#4--the-duplicate-test-deliver-the-same-change-twice) resets to `pending` so it
    dispatches a second time.
  - Done when: the id is written down, along with its payload, so the second delivery can be
    compared against the first rather than assumed identical.

▶ **Next: [instruction 4.1](#4--the-duplicate-test-deliver-the-same-change-twice)**, because the
three proofs are a person's work and everything above is setup for them.

### 2. 📝 Record what the three tests showed

◀ **Needs: [instructions 4, 5 and 6](#4--the-duplicate-test-deliver-the-same-change-twice)** done, so
there are results rather than expectations.

- [ ] **2.1 Write `artifacts/notes/one-client-truth/what-we-proved-by-hand.md`**
  - One section per test: what was done, what was seen, the frames pasted verbatim, the date, and
    the commit from `git rev-parse --short HEAD`.
  - A failure is recorded in the same shape as a pass, with what was seen instead.
  - Done when: somebody who was not there can tell, per test, whether it passed and what they would
    look at to check.

- [ ] **2.2 Add the entry to the grouping's card**
  - `artifacts/notes/one-client-truth/README.md`, created in
    [01](01-read-the-answer-and-choose-the-cache.md), gets a second entry: what this file holds, how
    it was established, what it lets you say, what it cannot say.
  - Done when: the card names both files in the grouping.

▶ **Next: [task 3.1](#3--write-the-two-recipes-and-the-one-definition)**.

### 3. 📚 Write the two recipes and the one definition

◀ **Needs: [task 2](#2--record-what-the-three-tests-showed)**.

- [ ] **3.1 Run the following prompt:** `/drip-runbook --weave watching events arrive in Attica: the DevTools WS Messages panel, and forcing a reconnect from the Network conditions panel`
  - Walk it with the browser open and the panels in front of you, pasting screenshots as you go.
    That is what `--weave` is for, and it is why this task comes while the stage from
    [task 1](#1--set-the-stage-for-three-tests-that-need-a-person) is still up.
  - Produces: two recipes under `runbook/driving-the-app/`, each with the real click path, what a
    good frame looks like beside a bad one, and the reconnect policy's three numbers from
    [05](05-one-transport-that-recovers.md).
  - Done when: both recipes exist and each answers its question from a cold start, with nothing left
    to resolve.

- [ ] **3.2 Run the following prompt:** `/runbook-pulse @runbook`
  - Produces: the index's question table carrying two new rows, the theme table's counts updated,
    and both recipes marked `ran` rather than `unverified`.
  - Done when: `grep -n "reconnect\|events arrive" /home/molef/Work/attica/runbook/00-INDEX.md`
    returns two question rows, and each links to a recipe that exists.

- [ ] **3.3 Run the following prompt:** `/context-pulse @context --build the event envelope, and what a version on a booking request means to a person`
  - Hand it section 1 of `docs/realtime_event_envelope.md` as the source wording, so the definition
    is not composed a second time.
  - Produces: an entry for the event envelope in `context/world/`, a question row in
    [the context index](../../../../../context/00-INDEX.md), and a paragraph in
    [the booking request entry](../../../../../context/world/booking-request.md) saying what a
    version means to somebody reading a screen.
  - Done when: the index's question table carries a row a person would actually ask, and the
    envelope entry says what the thing is before it says what fields it has.
  - 💡 The distinction worth keeping in the entry: a version tells a reader "this is older than what
    you have" or "something happened that you missed", and those are two different experiences of
    the same number.

- [ ] **3.4 Check no other folder is owed anything**
  - This scope owes `context/` an entry and `runbook/` a pair. It adds no process and moves no
    access path, so it owes `environment/` nothing, and the master plan says so.
  - ❌ If [05](05-one-transport-that-recovers.md) ended up changing how the app is started or
    reached, that is an environment fact and `/env-pulse @environment` runs here. Check rather than
    assume: the reconnect policy is client behaviour, but a new proxy rule or a new process would
    not be.
  - Done when: the answer is written down either way.

▶ **Next: the close out.**

### Close out. 🔄 Record what this scope taught

◀ **Needs: [task 3](#3--write-the-two-recipes-and-the-one-definition)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 4. 🔁 The duplicate test: deliver the same change twice

◀ **Needs: [task 1](#1--set-the-stage-for-three-tests-that-need-a-person)** done, so there is a
staff account and an outbox row id.

This is the check that at-least-once delivery is safe. Every part of it is a person's, because
nothing in the repository can replay a delivered event on purpose.

4.1 **Bring the stack up, including the outbox worker**
   - ```bash
     cd /home/molef/Work/attica/backend/main
     source /home/molef/lobola/bin/activate
     daphne -b 0.0.0.0 -p 8000 main.asgi:application
     ```
   - Second terminal: `cd /home/molef/Work/attica/frontend && npm run dev`.
   - Third terminal, the worker, per
     [Stack § 4](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox).
   - ✅ All three are up: the worker's log shows it polling.
   - ❌ The worker is not running: nothing dispatches, and the replay will look like a client that
     correctly ignored a duplicate when in fact nothing was sent. This is the most misleading
     outcome in this whole plan.

4.2 **Watch the first delivery arrive**
   - Chrome at `http://localhost:5173` logged in as the recipient, F12, **Network** tab, **WS**
     filter, click the notifications row, then **Messages**.
   - Do the thing that produces the change: send a booking request, or whatever produced the outbox
     row from [task 1.3](#1--set-the-stage-for-three-tests-that-need-a-person).
   - Expected result: one frame, carrying an envelope with a version. Note the badge number and the
     number of rows in the panel.
   - ✅ A frame arrives with a version: write down the version, the badge count and the row count.
   - ❌ No frame: check the worker log and whether the notification path pushes at all. The
     scheduling notification writer is `running-the-workers`' criterion, and if that scope has not
     landed, use a chat notification instead and say so in the notes.

4.3 **Replay the same event from the Django admin**
   - Open `http://localhost:8000/admin/` in a new tab and log in with the staff account from
     [task 1.1](#1--set-the-stage-for-three-tests-that-need-a-person).
   - Click **Scheduling**, then **Outbox events**. Find the row whose id you recorded.
   - Open it, set its status back to `pending`, clear any processed timestamp, and save.
   - Expected result: within one worker poll, the same event dispatches a second time.
   - ✅ A second frame arrives in the Messages panel: this is the moment the test is actually
     testing. Read the version on it.
   - ❌ No second frame: the dispatcher may only select certain statuses. Read the worker log rather
     than guessing, and record what you found. An event stranded in `processing` with no reaper is a
     known defect that belongs to `running-the-workers`.

4.4 **Read what the second delivery did**
   - Look at the badge and the panel, without reloading.
   - Expected result: neither moves. The version on the second frame equals the version the client
     already holds, so the apply rule ignores it.
   - ✅ Both unchanged: at-least-once delivery is safe on the client, which is
     [goal 3](../MASTER_PLAN.md#goals) proved rather than asserted.
   - ❌ The badge incremented: the apply rule is not being consulted for this event type, or the
     envelope on the second frame carries a different version from the first. Compare the two frames
     side by side before assuming which. Both frames go into the notes either way.

▶ **Next: [instruction 5.1](#5--the-gap-test-hide-three-changes-behind-an-offline-browser)**.

### 5. 🕳️ The gap test: hide three changes behind an offline browser

◀ **Needs: [instruction 4](#4--the-duplicate-test-deliver-the-same-change-twice)** done, so the stack
is up and the panels are open.

5.1 **Open two browsers and confirm they agree**
   - Browser A: the organizer. Browser B: the other party, in a separate browser or an incognito
     window so the sessions do not share storage.
   - Both on a screen showing the same booking or conversation.
   - ✅ They show the same state: that is the starting point, and it has to be established before
     the gap means anything.

5.2 **Take browser B offline from the Network conditions panel**
   - In browser B's DevTools, press **Escape** to open the drawer, click the drawer's three-dot
     menu, choose **Network conditions**, and set throttling to **Offline**.
   - Expected result: the WS row closes and frames stop.
   - ✅ The socket closed: you have a controlled outage.
   - ❌ Nothing changes: the Network tab's own throttling dropdown does not reliably close an open
     websocket. Use the Network conditions drawer.

5.3 **Make three changes in browser A**
   - Three distinct, visible changes: three messages, or a status change and two messages.
   - Expected result: browser A shows all three; browser B shows none.
   - ✅ B is visibly stale: that is the gap, created on purpose.

5.4 **Bring browser B back online and watch what it does by itself**
   - Set throttling back to **No throttling**. Do not reload, do not click.
   - Watch the **Network** tab, **Fetch/XHR** filter, and the **WS** row's Messages panel.
   - Expected result: the socket reconnects, and requests appear that you did not trigger.
   - ✅ B lands on the same state as A without being touched: that is
     [goal 4](../MASTER_PLAN.md#goals), and it is the headline claim of this scope.
   - ❌ The socket reconnects and no requests appear: the reconnect is not marking entities stale.
     [Task 2.5 of 05](05-one-transport-that-recovers.md#2--build-the-transport) is where that
     lives.
   - ❌ B shows two of the three changes: a partial catch-up, which usually means one entity was
     marked stale and another was not. Record which change is missing, because that names the entity.

5.5 **Read the frames rather than trusting the screen**
   - In B's Messages panel, find the frames after the reconnect and read their versions.
   - Expected result: the versions are ahead of what B held before it went offline, and the client
     refetched rather than applying them blindly.
   - ✅ The versions confirm the story the screen told.
   - ❌ The screen looks right and the frames show a version applied that was more than one ahead:
     the screen is right by luck. Record it as a failure, because the next gap will not be lucky.

▶ **Next: [instruction 6.1](#6--the-refresh-test-press-f5-at-three-moments)**.

### 6. ⏸️ The refresh test: press F5 at three moments

◀ **Needs: [instruction 5](#5--the-gap-test-hide-three-changes-behind-an-offline-browser)**.

The parent scope names three moments, and the point is that refreshing changes nothing. This takes
ten minutes and catches the class of bug where a screen is correct only because of state it happens
to be holding.

6.1 **After a request**
   - Send a booking request as the organizer. Note exactly what the screen says: status, counts,
     which buttons are enabled.
   - Press **F5**.
   - ✅ Identical: nothing was living only in memory.
   - ❌ Different: write down both states. A status that reverts is the cache and the server
     disagreeing; a count that changes is something derived from state that did not survive.

6.2 **After a payment**
   - Complete the mock checkout, per
     [Booking § 1](../../../../../runbook/driving-the-app/driving-the-booking-flow.md#1-submit-a-booking-request-as-an-organizer)
     and the steps that follow it.
   - Note the screen, press **F5**, compare.
   - ✅ Identical.
   - ❌ Different: this is the worst of the three, because a payment is the moment a person is least
     willing to be told a different story. Record it in full.

6.3 **After a cancellation**
   - Cancel the booking. Note the screen, press **F5**, compare.
   - ✅ Identical, and the released time is visible as available again.
   - ❌ The cancellation shows but the time is not released: that is a domain defect rather than a
     client one, and it belongs to `the-booking-journey`. Record it and say so, rather than trying
     to fix it here.

6.4 **Write the three comparisons down as they were**
   - Three pairs of before-and-after, with the date. These go into
     [task 2.1](#2--record-what-the-three-tests-showed).

▶ **Next: [task 2.1](#2--record-what-the-three-tests-showed)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This scope is done when somebody who was not here can break it on purpose, watch it recover, and
> find the instructions for doing so without asking anybody.

Pass:

- The duplicate test performed, with both frames pasted, and the badge and list unchanged on the
  second delivery.
- The gap test performed in two browsers, with the reconnect's refetch seen in the Network tab and
  the versions read in the Messages panel.
- The refresh test performed at all three moments, with before-and-after recorded for each.
- Two recipes exist under `runbook/driving-the-app/`, both marked `ran`, both reachable from a
  question in the index.
- The event envelope has an entry in `context/`, taking its wording from the contract, and the
  booking request entry says what a version means to a person.
- Whether `environment/` is owed anything is answered in writing.

Fail, and what it means:

- A test recorded as passed because nothing visibly moved. That is the failure this plan is most
  exposed to: a duplicate correctly ignored and a message that never arrived look identical on the
  page and different in the frames. The frame is the evidence.
- A recipe written after the fact rather than during the walk. Then the forgettable details, which
  are the whole reason the recipe exists, are the ones that got left out.
- A second definition of the event envelope composed here. There is one, in
  `docs/realtime_event_envelope.md`, and `context/` restates it for a different reader rather than
  inventing it again.
- The duplicate test run with the outbox worker stopped. Then nothing was delivered twice and the
  test proved nothing while appearing to pass.

Partial pass is acceptable on the refresh test's payment step if the mock checkout is unavailable in
the current state of the tree. Record which step was skipped and why, rather than marking the
criterion done.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The three by-hand results, with frames | `artifacts/notes/one-client-truth/what-we-proved-by-hand.md` | — | not started |
| The grouping's card, second entry | `artifacts/notes/one-client-truth/README.md` | — | not started |
| How to watch events arrive | `runbook/driving-the-app/`, marked `ran` | — | not started |
| How to force a reconnect | `runbook/driving-the-app/`, marked `ran` | — | not started |
| Two question rows in the runbook index | `runbook/00-INDEX.md` | — | not started |
| The event envelope entry | `context/world/`, with a row in `context/00-INDEX.md` | — | not started |
| What a version means on a booking request | `context/world/booking-request.md` | — | not started |
| The gap nobody notices | [piece 5](../diagram-prompts.md#piece-5-the-gap-nobody-notices-planned--not-rendered) → `../diagrams/subject-05-the-gap-nobody-notices.png` | subject | ⏳ not rendered |
| Several copies of one fact, to one copy that catches up | [the process capstone](../diagram-prompts.md#process-capstone-several-copies-of-one-fact-to-one-copy-that-catches-up-planned--not-rendered) → `../diagrams/process-capstone-many-copies-to-one-that-catches-up.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#code-references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/one-client-truth/plans/06-prove-it-and-write-it-down.md` | task 0, before any work | Conformance and thin instructions reported |
| Write the runbook pair during the walk | `/drip-runbook --weave watching events arrive in Attica: the DevTools WS Messages panel, and forcing a reconnect from the Network conditions panel` | task 3.1 | Two recipes written from what was just done |
| Wire them into the index and mark them | `/runbook-pulse @runbook` | task 3.2 | Question rows added, both recipes marked `ran` |
| Define the word this scope introduced | `/context-pulse @context --build the event envelope, and what a version on a booking request means to a person` | task 3.3 | The envelope entry, and the booking request paragraph |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/one-client-truth` | the close out | Statuses and running order match reality |

## Code references

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

Nothing in this plan changes code. These are the two places it reads from.

`backend/main/scheduling/models.py:605` to `:606` — `aggregate_type` and `aggregate_id` on
`OutboxEvent`. These are the columns the admin list is filtered by in
[instruction 4.3](#4--the-duplicate-test-deliver-the-same-change-twice), and knowing they are real
columns is what makes finding one row in the admin quick rather than a scroll.

`docs/realtime_event_envelope.md` — written in [02](02-define-the-envelope.md). Section 1 is the
source wording for the `context/` entry, and the apply rule table is what
[instruction 5.5](#5--the-gap-test-hide-three-changes-behind-an-offline-browser) reads the frames
against.

## Next step

Navigation: ⬅️ [Code references](#code-references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

Nothing in this folder. `the-event-workspace`, scope 11 in
[the sub-scope table](../../../MASTER_PLAN.md#sub-scopes), waits on this whole scope and builds the
screens this one deliberately did not touch: the persistent shell, autosave, optimistic updates and
the convergence dashboard.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

▶ `/drip-runbook --weave watching events arrive in Attica: the DevTools WS Messages panel, and forcing a reconnect from the Network conditions panel` ✅ — the recipes are written during the walk, with
screenshots placed at the step they belong to, which is the whole reason this plan does the tests and
the writing in one sitting.
   alt: `/runbook-pulse @runbook --capture` if the walk has already happened and only the writing
   remains.
   also: `/context-pulse @context` is a task line here rather than an alternative, because the entry
   it writes is a criterion in the scope's definition of done.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| A duplicate test that passes because nothing was delivered twice | Instruction 4, with the outbox worker stopped | Start the worker per Stack § 4 and confirm a second frame arrives before reading the badge. No second frame means no test. |
| The Django admin refuses the login | Instruction 4.3 | No seed creates a staff account. Create one with `createsuperuser` before starting, per the admin site environment file. |
| An outbox row stuck in `processing` that never redelivers | Instruction 4.3 | The dispatcher selects `pending` and `failed` only, and no reaper returns a stranded row. That is `running-the-workers`' defect, not this scope's. |
| Setting throttling does not close the websocket | Instruction 5.2 | The Network tab's throttling dropdown is not the same control as the Network conditions drawer. Use the drawer. |
| The screen looks right after a gap and the frames disagree | Instruction 5.5 | A version more than one ahead was applied rather than triggering a refetch. Right by luck. Record it as a failure. |
