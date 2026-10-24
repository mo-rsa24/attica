# Running The Workers

> **This scope's plans interleave with the parent's.** They are not done as a block. The one
> ordering that matters is the running-order table in [the parent master plan](../../MASTER_PLAN.md#running-order).
> The Plans list below is this folder's contents, not a sequence to follow top to bottom.

## Mission

Attica has an execution tier that runs, so a change to a booking reaches the person waiting for it
without anybody typing a command.

Ten management commands live in `backend/main/scheduling/management/commands/`. Nothing schedules
any of them, nothing supervises the two that are written as daemons, and the environment overview
already admits that the [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker is the process a plan forgets. The consequence is not an
error: every write succeeds, every API response looks correct, and the notification is a row in a
table nobody reads.

This scope decides what runs the recurring work, makes it run, and closes the two places where an
event that was safely persisted still fails to reach a screen.

---

## What this scope is, in one line per mark

The marks come from [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#6-running-the-workers),
and this scope is the whole of item 6 there.

**decide** One infrastructure decision, not three. Expiry, availability materialisation and [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>
dispatch all need the same thing: something that starts a process, restarts it when it dies, and
runs a job on a clock. This is D7 in
[the open decisions](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions),
and this scope is where it gets taken.

**wire up** The ten scheduling management commands, none of which anything runs.

**wire up** The outbox worker, with retries and dead-lettering, both of which already have tables
and neither of which has an operator.

**build** Persist first and push second as the rule: a business change and its outbox event commit
in one transaction, and delivery may then fail without losing the event. Nineteen call sites in
`scheduling/services.py` already do this. The rule is not new; making it the only path is.

---

## What is true today, with a line number on every claim

Read before planning anything here. Each of these was established by reading the repository on
2026-08-23, not by running it, and each carries the file and line to check it against. Three of them
corrected the programme's planning notes, which is recorded in
[the decisions taken here](decisions-taken-here.md).

**There are ten scheduling commands.** One materialiser, four expiry commands, two [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> commands,
three seeds. The count that matters is smaller: **three seeds must never be on a schedule**, so the
number wanting a runner is seven, and two of those seven are daemons that already wrap the other
five. An earlier count of eleven, reached by counting five expiry commands where there are four, is
corrected in both planning sources and recorded in [the decisions taken here](decisions-taken-here.md#the-count-is-ten-commands-not-eleven).

**`expire_draft_holds` is a byte-for-byte copy of `expire_checkout_holds`.** Both call
`expire_checkout_sessions` (`backend/main/scheduling/services.py:1744`). Nothing anywhere expires
`draft_hold_expires_at`. The command is named for a job it does not do.

**The draft hold expires lazily on read, and nobody is told.** Contention queries exclude a lapsed
hold (`backend/main/scheduling/services.py:167`) and the status projection reports
`checkout_hold_expired` (`backend/main/scheduling/services.py:319`), so the time really is released.
No outbox event is emitted when it lapses, so the organizer whose hold ran out learns by looking.
This is the gap `expire_draft_holds` was presumably meant to close.

**`expire_and_materialize` does not materialise.** It imports `materialize_slots_for_resource`
(`backend/main/scheduling/management/commands/expire_and_materialize.py:20`) and never calls it. Its
loop body is a single inline `.update(status=EXPIRED)` on `BookingRequest`, which bypasses
`expire_pending_requests` (`backend/main/scheduling/services.py:2633`) and therefore emits no
`request.expired` outbox event. A request expiring through this daemon is silent, where the same
request expiring through the service is not. The daemon's own docstring says it runs both jobs.

**The scheduling path writes notification rows and pushes nothing.**
`_create_in_app_notification` (`backend/main/scheduling/services.py:2658`) calls
`Notification.objects.create` and stops. The chat path does it properly:
`create_notification` (`backend/main/notifications/utils.py:24`) writes the row and then
`group_send`s to `notifications_{recipient.id}`. The consumer for that group exists
(`backend/main/notifications/consumers.py:19`), it is routed at `ws/notifications/`
(`backend/main/notifications/routing.py:6`), and the frontend connects to it
(`frontend/src/components/notifications/useNotifications.js:83`). So the socket is wired at both
ends for chat and at one end for everything the outbox dispatches. Two writers, one of which is
correct.

**`processing` is a terminal state with no reaper.** The dispatcher claims an event by moving it to
`PROCESSING` (`backend/main/scheduling/services.py:3355`) and only ever selects rows whose status is
`PENDING` or `FAILED` (`backend/main/scheduling/services.py:3342`). A worker that dies between the
claim and the outcome leaves that event stranded for good. This is exactly the ninth architecture
test in [the acceptance list](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#6-acceptance),
"a worker crashes after commit and before notification".

**There is no scheduler of any kind in the repository.** No Celery, no cron file, no systemd unit,
no supervisor config, no [Dockerfile](../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub>, no Procfile. `run_outbox_worker`'s own docstring names systemd,
supervisord and a Docker CMD as the thing that should restart it, and none of the three exists here.
[Continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> exists at `.github/workflows/ci.yml`.

**The dispatcher itself works.** [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
was run on 2026-08-22 against a real backlog: 23 pending, one pass, `processed=23 failed=0
dead_lettered=0`. Nothing in this scope is a fix to the dispatch code. What is missing is the thing
that calls it without being asked.

---

## What this scope may build while D1 and D2 are open

Two of the programme's open decisions reach into this scope, and they reach differently. Both are in
[the open decisions](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions).

**D1 is which of the four live booking representations survives**, and the parent's running order
answers it before this scope starts: scope 6 waits on scope 4, `one-booking-truth`. It still bites
the plans, because these plans are being written while it is open. It decides which of the two
notification writers above is the one to keep and which is the one to migrate: the chat path pushes
and the scheduling path does not, and the more complete representation is the one with the broken
delivery. **The rule this scope works under: read the answer, never assume it.** The first thing
this scope does is read what scope 4 decided, and no plan here presumes the scheduling
representation won.

**D2 is when a hold starts**, and it stays open for the whole of this scope. Scope 5,
`contention-and-holds`, is where it is taken, and scope 5 and scope 6 both wait on scope 4 and on
nothing else, so they run at the same time. D2 changes what has to be expired and how fast: a hold
taken at request time needs a tighter timer and a new expiry job, a hold taken at acceptance keeps
the two that exist. **The rule this scope works under: what runs and how often is configuration, not
structure.** The runner is built so `contention-and-holds` adds a job to it with a line of config
rather than a change to the runner, and this scope does not implement either hold semantics.

**What this scope does not touch.** It adds no new [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> emit site to any booking representation,
because adding one to a representation that may not survive is work that gets deleted. It fixes the
delivery of the events that are already emitted.

**D7 is this scope's own to take**, and it is not pre-answered anywhere in this folder. The plan
that takes it lays out the candidates and the criteria; the answer is a person's.

**D9, deployment, constrains D7 and is not this scope's.** Whatever supervises these workers has to
exist wherever Attica eventually runs, and there is no deployment mechanism at all
(`getting-it-out`, scope 13, owns that). The D7 plan states which of its candidates survive a
deployment decision and which would have to be redone, rather than waiting for one.

---

## Objectives

1. **Take one infrastructure decision instead of three.** Expiry, materialisation and [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>
   dispatch differ in cadence and in nothing else. Solving them separately buys three things to
   operate where one would do.
2. **Make the recurring work recurring.** A command that a person has to remember is not a feature
   of the system, it is a fact about that person.
3. **Close the two silent [losses](../../../../../../Obsidian/Artificial%20Intelligence/Machine%20Learning/Loss%20Function.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=33 "Understanding deep learning, section 2.2.2, Works the idea with numbers: each choice of intercept and slope for a line through twelve points gets one loss (7..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/pattern-recognition-and-machine-learning.pdf#page=60 "Pattern recognition and machine learning, section 1.5.2, A loss matrix for cancer diagnosis that charges 1000 for missing a cancer and 1 for a false alarm, a..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=70 "Understanding deep learning, sections 5.1 to 5.2, A recipe that builds a loss for any kind of output from maximum likelihood: choose a distribution over the ..."), [▶1](https://www.youtube.com/watch?v=pdqofxJeBN8&t=3230s "CS231n lecture 2, 53:50 to 57:30, Defines the loss as the average of per-example losses that optimisation will minimise, after showing data a line cannot sep..."), [▶2](https://www.youtube.com/watch?v=cmNIMjPYdgM&t=879s "CS229 lecture 2, 14:39 to 17:41, Chooses the line that minimises prediction errors on the training data, empirical risk minimisation, and contrasts it with a..."), [◆](../../../../../../goal-setting/learning/machine-learning/classical-ml-from-scratch/MASTER_PLAN.md "Classical ML from Scratch, machine-learning/classical-ml-from-scratch. Goal 1 derives linear and logistic regression from a loss function and gradient descen...")</sub>.** An event stranded in `processing` and a notification row that
   never reaches a socket both look exactly like success from every angle the application offers.
4. **Make persist-then-push the only path.** The pattern is already right in nineteen places and
   wrong in the one daemon that writes its own update inline. One path, so the exception cannot come
   back.
5. **Leave the operator something to read.** Whoever is on the other end of this at midnight needs
   to answer "is it moving", "what is stuck" and "what died and why" without reading Python.

---

## Goals

1. Every non-seed scheduling command has a runner that starts it, and the three seeds are excluded
   from that runner on purpose rather than by omission.
2. Killing the worker process mid-dispatch loses no event: the stranded `processing` row is
   reclaimed and delivered on the next cycle.
3. A booking change made by one person appears on the other person's screen with no refresh, driven
   by the [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> rather than by a poll.
4. `expire_draft_holds` either expires draft holds or stops existing, and a lapsed draft hold emits
   an event the organizer receives.
5. `expire_and_materialize` either materialises or is renamed, and every expiry path emits the
   outbox event its service-layer twin emits.
6. The dead-letter table has a way to be read and a way to be replayed, both written down.
7. [The environment overview](../../../../environment/overview.md)'s execution model describes what
   "running Attica" means after this scope, which is no longer four processes started by hand.

---

## Expected Outcome

Someone starts Attica the way the runbook says and the recurring work is already running. An
organizer sends a request and the provider's screen changes while both are looking at it. A hold
lapses and the organizer is told rather than discovering it. Somebody kills the worker in the middle
of a dispatch and, a cycle later, the notification arrives anyway.

---

## Definition of Done

- [ ] D7 taken and written down: what runs the recurring work, with the candidates that lost and the
      reason each lost, and a statement of which candidates a future deployment decision would
      invalidate
- [ ] Every non-seed scheduling command is either on the runner, folded into one that is, or deleted
      with the reason recorded. `seed_marketplace`, `seed_booking_workflow` and
      `seed_booking_summary_demo` are excluded by name
- [ ] A reaper returns stranded `processing` events to `pending` after a stated [timeout](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Timeout.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=146 "System design interview, chapter 9, Design a web crawler, Short timeout, A crawler gives each web server a maximal wait time and, when a host does not answer..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=362 "System design big archive, How to Debug a Slow API?, Set aggressive timeouts and retries on third-party calls such as Stripe or Google Maps, so one slow prov..."), [▶1](https://www.youtube.com/watch?v=2GAQVXGT_Zw&t=150s "Hussein Nasser, Frontend and Backends Timeouts, Connection Timeout, 2:30 to 5:00, The first of the timeouts a backend sets, before read, wait, usage and resp..."), [▶2](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts set on calls between services..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/14-payment-notification-and-a-timeout.md "Payment, notification, and a timeout, system-design/foundations, plan 14. The order service calls payment with httpx and a 2-second timeout; a card ending 00...")</sub>, with the
      timeout named and its value justified
- [ ] The scheduling notification path pushes as well as persists, over the same
      `notifications_{user_id}` group the chat path already uses, so there is one delivery mechanism
      and not two
- [ ] `expire_draft_holds` resolved: it expires draft holds and emits an event, or it is deleted and
      the lazy read-path expiry is documented as the intended behaviour
- [ ] `expire_and_materialize` resolved: it materialises, or it is renamed to what it does. Its
      inline `BookingRequest.objects.update` is replaced by the service call, so no expiry path
      exists that skips the [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>
- [ ] ⚠️ The worker-crash test performed by hand: start the runner, send a booking request, kill the
      worker process between the write and the dispatch, confirm the row is `processing`, wait for
      the reaper, confirm the notification arrives `[owner: human]`
- [ ] ⚠️ The no-refresh test performed by hand in two browsers, with Chrome DevTools open on the
      Network tab filtered to WS in both: organizer sends a request in one, the provider's
      notification frame arrives in the other with nobody pressing anything, and the frame is read
      in the WS Messages panel rather than inferred from the UI `[owner: human]`
- [ ] ⚠️ The dead-letter path walked by hand: force a dispatch failure past
      `SCHEDULING_OUTBOX_MAX_ATTEMPTS`, find the row in the Django admin at `:8000/admin/` under
      scheduling, read `error_message`, and replay it `[owner: human]`
- [ ] ⚠️ The runner started and stopped from a cold terminal following only the new runbook recipe,
      by someone who does not have this plan open, and both its questions answered from the recipe
      alone `[owner: human]`
- [ ] The runbook pair written with `/drip-runbook` and checked with `/runbook-pulse`: how to start
      and stop the recurring work, and how to find out what is stuck. The second is the one nothing
      covers: [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
      already answers "how many are pending" and answers neither "what dead-lettered and why" nor
      "what is stranded in processing"
- [ ] [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
      updated rather than duplicated: its ❌ branch names the `group_send` gap as a known gap, and
      that stops being true in this scope
- [ ] `/env-pulse` run, because this scope changes the execution model. The four-hand-started-processes
      fact in [the execution model](../../../../environment/overview.md#execution-model) and the
      no-push gap in [the known gaps](../../../../environment/overview.md#known-gaps--non-obvious-constraints)
      are both rewritten to what is true afterwards
- [ ] Close out: `/ingest-error-pattern` for anything that bit, then
      `/sync-plan-tree @plans/create-event-end-to-end/plans/running-the-workers`

---

## Sub-Scopes

(none)

---

## Plans

This folder's contents. The order that matters is the
[parent's running order](../../MASTER_PLAN.md#running-order).

| Plan | What it does | Status |
|---|---|---|
| [01 Take the execution decision](plans/01-take-the-execution-decision.md) | Settle D7: what runs the recurring work, with the candidates that lost and why each lost | ⚠️ not started |
| [02 Make the commands honest](plans/02-make-the-commands-honest.md) | Resolve the two commands that lie about what they do, so nothing goes on a clock while it is still wrong | ⚠️ not started |
| [03 Build the runner](plans/03-build-the-runner.md) | Put every non-seed scheduling command on the runner, with a log that answers "is it moving" | ⚠️ not started |
| [04 Close the two silent losses](plans/04-close-the-two-silent-losses.md) | The reaper for stranded `processing` rows, and one notification path that pushes as well as persists | ⚠️ not started |
| [05 Prove it and write it down](plans/05-prove-it-and-write-it-down.md) | The two runbook questions nothing answers, and the two environment facts this scope made false | ⚠️ not started |

---

## Decisions taken while writing this scope

Every choice made without asking, with its reason, is in
[the decisions taken here](decisions-taken-here.md). Read it before changing anything above: several
lines above are one of two defensible readings rather than the only one, and three of them correct
a count or a claim the programme's own planning notes make.

---

## Environment Context

Inherited from the parent. Environment and architecture facts live in
[the environment index](../../../../environment/00-INDEX.md). Read
[the overview](../../../../environment/overview.md) first, because in this scope the execution model
it describes is both the starting point and one of the deliverables.

Four facts decide whether work here lands or silently does nothing.

**Running Attica is four processes started by hand and none supervises another**, per
[the execution model](../../../../environment/overview.md#execution-model). The fourth is the [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub>
worker, and the overview already names it as the one a plan forgets. This scope is the reason that
sentence stops being true, so it is the sentence to rewrite at close out rather than to add to.

**[Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> is one server carrying two unrelated logical databases**: the [websocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub> channel layer uses
the default and the page [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> uses database 1. A worker that pushes to a channel group is using the
first. Flushing the wrong one drops live websocket groups without an error.

**Daphne, not `runserver`.** Anything that touches websockets needs
`daphne -b 0.0.0.0 -p 8000 main.asgi:application`. Under `runserver` the push this scope builds
fails with no clear error, which is indistinguishable from the bug it is fixing.

**`select_for_update` does not lock on SQLite**, per
[the known gaps](../../../../environment/overview.md#known-gaps--non-obvious-constraints). The outbox
dispatcher does not rely on it (it claims with a conditional `UPDATE`, which is safe on SQLite), but
any second worker process added here would be running on a database that cannot arbitrate between
them. PostgreSQL is D6 and belongs to `contention-and-holds`, so this scope states the single-worker
assumption rather than assuming the database will have changed.

**Two backend tests already fail**, so a red `python manage.py test` does not mean this scope broke
something. The check here is the two-browser walk and the outbox row counts, not a green suite.

Where a fact this scope needs is not written there, stop and ask rather than inferring it.

---

## Runbook

The by-hand recipes live in [the runbook index](../../../../runbook/00-INDEX.md). Bringing the stack
up and draining the [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> once are recipes there, and this scope links them rather than restating
them.

This scope writes back a pair. **How to start and stop the recurring work** does not exist because
the recurring work does not exist yet. **How to find out what is stuck** partly exists and stops
short: [Stack § 4](../../../../runbook/running-the-web-app/bringing-the-stack-up.md#4-drain-the-outbox)
answers "how many events are pending" with a real run pasted in, and answers neither "what
dead-lettered and why" nor "what is stranded in `processing`". The second recipe finishes that
question rather than opening a new file beside it.

---

## Context

What Attica means in the real world lives in [the context index](../../../../context/00-INDEX.md).
This scope reads it and owes it nothing, and the reason is worth stating because the words it
introduces are real ones.

`outbox`, `dead letter`, `worker` and `reaper` describe how this repository moves a message from one
process to another. They are facts about the machinery, not about weddings, venues or bookings, so
they belong in `environment/`, which is where this scope already owes a fact, rather than in
`context/`, which answers what something means to a person using Attica. The domain words this scope
touches (`hold`, `claim`, the checkout session) are owed by the scopes that introduce them:
`contention-and-holds` and `the-booking-journey`, per
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md).

---

## Diagram Prompts

This scope's illustrated map is [the illustrated map](diagram-prompts.md). It inherits the parent's
art direction, palette, glyph vocabulary and tiers, and reading axes exactly, and adds no vocabulary
of its own. It is the zoom-in on the workers glyph in
[the parent's subject capstone](../../diagram-prompts.md), which keeps it as one glyph in the domain
panel.

The map carries both lanes. The subject lane and its capstone draw the machinery this scope touches;
the process lane draws the five plans over that same cast, with each plan's engagement gate as the
thing it checks. The process lane is regenerated whole rather than patched, and every version of it
is kept in [the process history](diagrams/process-versions/).
