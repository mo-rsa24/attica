# 🚦 Make The Workflow A Gate

Step 3 of 6 in this scope. Waits on
[02-make-two-clones-the-same.md](02-make-two-clones-the-same.md), because the frontend job dies
asking for a file that plan commits, and on
[making the suites honest](../../fixing-create-event/plans/03-reconcile-suite-and-runbook.md), because
two backend tests are red and this scope does not fix them. Next:
[06-ship-it-put-it-back-and-write-it-down.md](06-ship-it-put-it-back-and-write-it-down.md), which
ships the artifact this plan stops throwing away.

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

Scope: [getting it out](../MASTER_PLAN.md). Third of six.

This plan has two dependencies and one of them is outside this scope.
[02](02-make-two-clones-the-same.md) commits the lockfile the frontend job is asked to [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> against.
[Making the suites honest](../../fixing-create-event/plans/03-reconcile-suite-and-runbook.md) owns the
two red backend tests, which this scope states the consequence of and does not fix.

That second edge is real rather than tidy: a workflow whose backend job fails on every run cannot be
made green from here, and pretending otherwise would put a criterion in this plan that nobody in this
scope can satisfy.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order), where this plan is step 31.

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

**There is a check on every change, it has run twice, and it has failed twice.**

`.github/workflows/ci.yml` runs on every [pull request](../../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/07-two-remotes-two-branch-rules.md "Two remotes, two branch rules, a refused push, system-design/devops-and-deployment, plan 07. Branch protection on GitHub and a branch policy on Azure Repos c...")</sub> and every push to `main`. `gh run list` on
2026-08-23 returns exactly two runs in its whole history: `30327265312` on 2026-07-28 and
`32620468805` on 2026-08-23, both `failure`. There is no third job, no `environment:`, no secret
reference, and no step that uploads or publishes anything.

**The two jobs fail at different depths, and neither cause is the same problem.**

The backend job fails at `Run tests`: 43 tests, one failure and one error, both in `events/tests.py`.
That is the two red tests everybody already knows about, and they belong to
[making the suites honest](../../fixing-create-event/plans/03-reconcile-suite-and-runbook.md).

The frontend job fails at `Set up Node`, which is the step **before** any dependency is installed, so
`Lint` and `Build` have never executed on either run. The cause is inferred rather than read:
`actions/setup-node` is configured with `cache-dependency-path: frontend/package-lock.json`, that
file has never been committed, and the job dies there. The log that would confirm it cannot be read
from this account: `gh run view --log-failed` returns `[HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> 403: Must have admin rights to
Repository`. Confirming it in a browser is
[instruction 5](#5--read-the-failure-in-githubs-own-interface), and it is the reason that instruction
exists.

**Two things are waiting behind that failure, and one of them nobody has seen.**

`npm run lint` has never run in the workflow. It runs on this machine, and on 2026-08-23 it reported
**50 problems: 35 errors and 15 warnings**. So committing the lockfile moves the frontend job's
failure from `Set up Node` to `Lint` rather than making it pass, and this plan is where that gets
dealt with rather than discovered at the worst moment.

`npm run build` also runs on this machine and succeeds, in 4.56 seconds, producing `frontend/dist`
with an `index.html`, a 1.73 MB JavaScript bundle, a 150 KB stylesheet and one image. **That output
is thrown away at the end of the job**, twice a run, and it is exactly the artifact a deploy needs.

**Neither D1 nor D2 reaches this plan.** Which booking representation survives changes what the
tests test, not whether the workflow runs them. When a hold starts changes nothing here at all.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md), which is the authority.

- **Two backend tests already fail**, per
  [the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints). A red
  `python manage.py test` on this machine does not mean this plan broke something, and it is the same
  redness the workflow reports. This plan does not fix it and does not claim to.
- **The backend needs [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub>**, per
  [the execution model](../../../../../environment/overview.md#execution-model). The workflow already
  provides it as a `redis:7-alpine` service on port 6379, which is why the backend job gets as far as
  the tests at all.
- **The Python version is 3.12.9 in a virtual environment at `/home/molef/lobola`**, per
  [the compute and runtime section](../../../../../environment/overview.md#compute--runtime). The
  workflow pins `python-version: "3.12"`, so a local run and a workflow run are on the same minor
  version. Anything that reproduces on one should reproduce on the other.

**One fact this plan needs is not in `environment/` and must not be inferred.** Whether this account
can read a failing job's log in the GitHub API. It cannot: `gh run view --job <id> --log-failed`
returns [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> 403, admin rights required. That is why the log is read through the browser in
[instruction 5](#5--read-the-failure-in-githubs-own-interface) rather than by a task, per
[the decisions taken here](../decisions-taken-here.md#reading-the-failing-workflow-log-is-marked-as-a-human-task-because-this-account-cannot).

**Where any other fact this plan needs is missing from `environment/`, stop and ask rather than
inferring it.**

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**The lockfile does not make this job pass, it makes it fail somewhere new.**

35 lint errors are waiting one step behind `Set up Node`. Anybody who commits the lockfile, watches
the job get further, and calls that progress is going to be surprised twice. The honest sequence is:
fix the setup step, watch it reach lint, deal with lint, watch it reach build.

**35 errors are not 35 problems.**

30 of them are `no-unused-vars`, which is an import nobody deleted. Two are
`react-hooks/rules-of-hooks` and one is `no-undef`, and those three are a different kind of thing: a
hook called conditionally and a name that does not exist are bugs whether or not a linter is
watching. [Task 3.2](#3--make-the-frontend-job-reach-its-build) separates them, because "fix the
lint errors" and "there are three real defects in here" deserve different amounts of [attention](../../../../../../../Obsidian/Artificial%20Intelligence/Deep%20Learning/Attention.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=222 "Understanding deep learning, sections 12.2 and 12.3, Builds dot-product self-attention as routing: values, weights from query-key dot products and a softmax,..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/probabilistic-machine-learning-an-introduction.pdf#page=566 "Probabilistic machine learning: an introduction, section 15.4, Attention as a weighted average of values with weights from comparing a query to keys, with se..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/natural-language-processing/hands-on-large-language-models.pdf#page=137 "Hands-on large language models, chapter 3, the attention layer, Attention in two drawn steps, scoring each earlier token's relevance and combining the values..."), [▶1](https://www.youtube.com/watch?v=RQowiOF_FvQ&t=1561s "CS231n lecture 8, 26:01 to 31:35, Pulls attention out of the recurrent network as an operator: data vectors, a query, similarity scores, softmax weights and ..."), [▶2](https://www.youtube.com/watch?v=Ub3GoFaUcds&t=4136s "CME295 lecture 1, 1:08:56 to 1:13:43, Defines query, key and value: the query for 'teddy bear' against every key, softmax weights, then the weighted sum of v..."), [◆](../../../../../../../goal-setting/learning/deep-learning/transformers/textbook/30-work-self-attention-as-a-3.md "Work self-attention as a 3 by 3 matrix, deep-learning/transformers, chapter 30. The 3 by 3 weights and the three outputs for a 3-word sentence, by hand.")</sub>.

**`npm ci || npm install` is a fallback that hides the thing this plan is fixing.**

With the lockfile committed, `npm ci` is exact and `npm install` is not. Leaving the fallback in
means a lockfile that goes out of sync silently produces a different bundle in the workflow, which is
the failure [02](02-make-two-clones-the-same.md) exists to prevent, reintroduced one line lower down.

**Keeping the build is a different job from deploying it.**

This plan makes the workflow keep `frontend/dist` where a person can download it and see what was
built. Whether the deploy pulls that artifact or builds again on the machine is
[plan 01](01-take-the-deployment-decision.md)'s answer, and this plan does not pre-decide it. What it
does guarantee is that the artifact exists, because a mechanism that wants it and a workflow that
discards it is the gap.

**The backend job's greenness is not this plan's to promise.**

Two tests are red for reasons another scope owns. This plan can make everything except those two
tests correct and honest, and then the workflow is green when that scope finishes and not before.
[Task 4](#4--say-plainly-what-the-gate-now-gates) is where that is written down rather than left as
an unexplained red tick.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

**A workflow that has failed on every run in its history is not a gate, it is a habit**, and a
release built on top of it is a release nobody can trust, however carefully the release itself was
built.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Somebody wrote this workflow carefully. It has a [Redis](../../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> service with a [health check](../../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Health%20Check.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=14 "Grokking the system design interview, section 12.2, Load balancing algorithms, Health checks that regularly try to connect to each backend, remove a server t..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=100 "System design interview, chapter 6, Design a key-value store, failure detection, The push form of a health check: each node increments a heartbeat counter an..."), [▶1](https://www.youtube.com/watch?v=C842vFY5kRo&t=1508s "freeCodeCamp, System Design Course: APIs, Databases, Caching, CDNs, Load Balancing and Production Infra, Health Checks, 25:08 to 28:00, Health checks as the ..."), [▶2](https://www.youtube.com/watch?v=oM5-knpFPw4&t=0s "KodeKloud, Kubernetes Liveness vs Readiness Probes, Done Right!, 0:00 to 2:47, The two health checks Kubernetes runs on a container: is it running, and can i..."), [◆](../../../../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/74-health-check-and-alert.md "Health check and alert: /healthz polled every 60 s, downtime manufactured, one alert seen, ai-engineering/one-business-end-to-end, plan 74. Works one end to ...")</sub>, it sets `DEBUG`
to `False` and supplies a `SECRET_KEY` and `ALLOWED_HOSTS` for the backend job, and it [caches](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> both
package managers. None of that is careless work.

What happened next is the ordinary thing: it went red on its first run, nobody had time, and red
became its normal colour. After two runs, a failing check carries no information at all. Nobody looks
at it, because looking has never once told anybody anything they did not already know.

The cost lands the moment anything is gated on it. A deploy triggered by a green workflow is a
sentence with no meaning here, because the workflow is never green. So either the deploy is gated on
nothing, or the gate is a step somebody manually decides to ignore, which is the same thing with more
ceremony.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  TODAY: two runs, two failures, at two different depths

  backend job                          frontend job
  ├─ checkout            ok            ├─ checkout            ok
  ├─ set up python       ok            ├─ set up node         ✖ FAILS HERE
  ├─ install deps        ok            │                        (cache-dependency-path
  ├─ django check        ok            │                         names a file with 0 commits)
  ├─ migrate             ok            ├─ npm ci || npm install  never ran
  └─ run tests           ✖ 1 fail      ├─ lint                   never ran
                           1 error     └─ build                  never ran
                                                                   │
                                              frontend/dist ◄──────┘  built, then discarded

  AFTER: the frontend job reaches its end, and what it builds is kept

  ├─ set up node         ok    (lockfile committed by plan 02)
  ├─ npm ci              ok    (fallback removed: exact or nothing)
  ├─ lint                ok    (35 errors dealt with; 3 of them were real defects)
  ├─ build               ok    (4.56s, 1.73 MB bundle)
  └─ upload dist         ──►  downloadable from the run page

  backend job still red until  ../fixing-create-event/plans/03  lands.
  That is stated in writing, not left as an unexplained tick.
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-build) ➡️

One piece in this scope's map is exactly this plan's subject.

**Subject: the gate that has never been green.** Two halves failing at visibly different depths, the
two dated commit chips beneath, nothing crossing the top edge, and the built artifact outside the bar
with a red cross on it.
[Piece 2](../diagram-prompts.md#piece-2-the-gate-that-has-never-been-green-planned--not-rendered).
Save as `../diagrams/subject-02-the-gate-that-has-never-been-green.png`. *(image not yet generated)*

That piece carries one element in the grey dashed hedge outline with an "unconfirmed live" tag: the
card naming the suspected cause of the frontend failure.
[Instruction 5](#5--read-the-failure-in-githubs-own-interface) is what removes the hedge, and if the
log says something else, the prompt gets rewritten before it is rendered.

## Description: what to build

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Changes to one file, plus one note.

1. **`.github/workflows/ci.yml`, frontend job.** `npm ci` without the `|| npm install` fallback, and
   a step that uploads `frontend/dist` as a run artifact with a retention period stated on purpose.
2. **`frontend/src`, the lint errors.** The 30 unused imports removed, the two
   `react-hooks/rules-of-hooks` errors and the one `no-undef` error treated as defects and either
   fixed or written down as known with an owner, and the 15 warnings left as warnings with a line
   saying why.
3. **A note** at `artifacts/notes/getting-it-out/what-the-gate-now-gates.md`: ruler six before and
   after, what the failing log actually said, the three real defects the lint run surfaced, and one
   plain paragraph saying what a green tick on this workflow does and does not mean while the two
   backend tests are red.

## Purpose and goal

Navigation: ⬅️ [Description: what to build](#description-what-to-build) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Serve [objective 5](../MASTER_PLAN.md#objectives), making [continuous integration](../../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/07-two-remotes-two-branch-rules.md "Two remotes, two branch rules, a refused push, system-design/devops-and-deployment, plan 07. Branch protection on GitHub and a branch policy on Azure Repos c...")</sub> mean
something before anything is gated on it, and give
[06](06-ship-it-put-it-back-and-write-it-down.md) an artifact that exists after the job ends.

**Goal.** The frontend job runs to completion, `npm ci` runs without a fallback, `frontend/dist` is
downloadable from the run page, the failing step's log has been read in a browser and what it
actually said is written down, the three real defects the lint run surfaced are fixed or owned, and
one paragraph says exactly what a tick on this workflow means today.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/getting-it-out/plans/03-make-the-workflow-a-gate.md`

▶ **Next: [task 1.1](#1--read-the-workflow-and-take-ruler-six)**.

### 1. 📖 Read the workflow and take ruler six

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

- [ ] **1.1 Take ruler six, with the command from plan 01**
  ```
  cd /home/molef/Work/attica
  gh run list --limit 20
  ```
  - This is the same command as
    [task 2.6 of plan 01](01-take-the-deployment-decision.md#2--pin-the-seven-rulers-and-run-them),
    unchanged.
  - Produces: the whole history, written into
    `artifacts/notes/getting-it-out/what-the-gate-now-gates.md`. On 2026-08-23: two runs,
    `32620468805` (2026-08-23, 1m22s) and `30327265312` (2026-07-28, 1m35s), both `failure`.
  - Done when: the list is in the note verbatim, with the commit and date at the top.
  - ❌ If `gh` is not authenticated (`gh auth status`), record the same list from the browser in
    [instruction 5.1](#5--read-the-failure-in-githubs-own-interface) instead, and say that is where
    it came from.

- [ ] **1.2 Read `ci.yml` and write down what each job proves**
  - `.github/workflows/ci.yml`. The backend job: a `redis:7-alpine` service with a [health check](../../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Health%20Check.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=14 "Grokking the system design interview, section 12.2, Load balancing algorithms, Health checks that regularly try to connect to each backend, remove a server t..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=100 "System design interview, chapter 6, Design a key-value store, failure detection, The push form of a health check: each node increments a heartbeat counter an..."), [▶1](https://www.youtube.com/watch?v=C842vFY5kRo&t=1508s "freeCodeCamp, System Design Course: APIs, Databases, Caching, CDNs, Load Balancing and Production Infra, Health Checks, 25:08 to 28:00, Health checks as the ..."), [▶2](https://www.youtube.com/watch?v=oM5-knpFPw4&t=0s "KodeKloud, Kubernetes Liveness vs Readiness Probes, Done Right!, 0:00 to 2:47, The two health checks Kubernetes runs on a container: is it running, and can i..."), [◆](../../../../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/74-health-check-and-alert.md "Health check and alert: /healthz polled every 60 s, downtime manufactured, one alert seen, ai-engineering/one-business-end-to-end, plan 74. Works one end to ...")</sub>, and
    an `env` block setting `DEBUG: "False"`, `SECRET_KEY`, `ALLOWED_HOSTS` and
    `CORS_ALLOWED_ORIGINS`. Its steps are `manage.py check`, `migrate --noinput` and
    `test --noinput`. The frontend job: `actions/setup-node@v4` at version 20 with
    `cache-dependency-path: frontend/package-lock.json`, then `npm ci || npm install`,
    `npm run lint`, `npm run build`.
  - Produces: one line per job saying what a pass would actually prove, in the note.
  - Done when: it is written that the backend job already runs with `DEBUG` false and a supplied
    secret key. **That matters for [plan 04](04-let-the-environment-say-where-things-live.md)**: the
    workflow is the one place this application is already run in something resembling a deployed
    configuration, so removing the fallback defaults there will be exercised here first.

- [ ] **1.3 Run the two frontend commands locally and record what they say**
  ```
  cd /home/molef/Work/attica/frontend
  npm run lint 2>&1 | tail -3
  npm run build 2>&1 | tail -8
  ```
  - Produces: the lint summary and the build result. On 2026-08-23: `50 problems (35 errors, 15
    warnings)`, and a build that succeeded in 4.56 seconds producing `dist/index.html`,
    `dist/assets/index-*.js` at 1.73 MB, `dist/assets/index-*.css` at 151 KB and one 44 KB image.
  - Done when: both are in the note. **The lint number is the finding**: it has never run in the
    workflow, so committing the lockfile moves the failure rather than removing it.

- [ ] **1.4 Break the lint errors down by rule**
  ```
  cd /home/molef/Work/attica/frontend
  npm run lint 2>&1 | grep -oE '[a-z@/-]+$' | sort | uniq -c | sort -rn | head -15
  ```
  - Produces: the count per rule. On 2026-08-23: `no-unused-vars` 30, `react-hooks/exhaustive-deps`
    14, `react-refresh/only-export-components` 2, `react-hooks/rules-of-hooks` 2, `no-undef` 1.
  - Done when: the breakdown is in the note, with the three that are defects rather than tidiness
    named individually with their file and line: the two `react-hooks/rules-of-hooks` and the one
    `no-undef`.

▶ **Next: [instruction 5.1](#5--read-the-failure-in-githubs-own-interface)**, which is the only way
to find out what the frontend job actually died of.

### 2. 🔧 Make the frontend job install exactly

◀ **Needs: [instruction 5](#5--read-the-failure-in-githubs-own-interface)** done, so the fix answers
what the log said rather than what the lockfile suggested, and
[plan 02](02-make-two-clones-the-same.md) done, so the lockfile is in the repository.

- [ ] **2.1 Apply whatever the log actually said**
  - If the log named the missing lockfile: nothing to change in `ci.yml` for this step, because
    [02](02-make-two-clones-the-same.md) has committed it. Write one line in the note confirming the
    inference held.
  - If the log named something else: **that is the real cause and the inference was wrong**. Fix what
    it named, and correct the claim in
    [the scope's master plan](../MASTER_PLAN.md#continuous-integration-exists-has-never-passed-and-produces-nothing),
    which currently marks it inferred, and in
    [piece 2 of the map](../diagram-prompts.md#piece-2-the-gate-that-has-never-been-green-planned--not-rendered),
    whose hedged card names the suspected cause.
  - Done when: the note says what the log said, in the log's own words.

- [ ] **2.2 Remove the install fallback**
  - In `.github/workflows/ci.yml`, the frontend job's install step is `npm ci || npm install`. Make
    it `npm ci`.
  - Done when: the step is exact. With a committed lockfile, the fallback's only effect is to hide a
    lockfile that has drifted, which is the failure
    [02](02-make-two-clones-the-same.md) exists to prevent.

▶ **Next: [task 3.1](#3--make-the-frontend-job-reach-its-build)**.

### 3. 🧹 Make the frontend job reach its build

◀ **Needs: [task 2](#2--make-the-frontend-job-install-exactly)**.

- [ ] **3.1 Clear the 30 unused-variable errors**
  - Remove the unused imports rather than silencing the rule. Three known examples, all the same
    shape: `motion` imported and never used at `frontend/src/pages/SelectArtists.jsx:3`,
    `SelectLocation.jsx:3` and `SelectVendors.jsx:3`.
  - Produces: a `npm run lint` whose error count has dropped by 30.
  - Done when: `npm run lint` reports the remaining errors and no `no-unused-vars` among them.
  - ❌ If removing an import breaks the build, put it back and say what actually used it that the
    linter could not see. That is a finding about the rule's configuration, not a reason to disable
    it.

- [ ] **3.2 Treat the three defect-shaped errors as defects**
  - The two `react-hooks/rules-of-hooks` errors and the one `no-undef` error, located in
    [task 1.4](#1--read-the-workflow-and-take-ruler-six).
  - A hook called conditionally and a name that does not exist are wrong whether or not a linter is
    watching, so each one gets read at its site before anything is changed.
  - Produces: either a fix with one line saying what was actually broken, or, where the fix is bigger
    than this plan, an entry in the note naming the file, the line, what it does at runtime, and
    which scope owns the screen it lives on.
  - Done when: all three are fixed or owned. **Neither of those is silencing the rule**, and a
    disabled rule with no comment is the outcome to watch for here.

- [ ] **3.3 Decide the 15 warnings out loud**
  - 14 are `react-hooks/exhaustive-deps` and one is fixable with `--fix`.
  - Produces: one paragraph in the note: whether warnings stay warnings, and why. A dependency array
    changed without understanding the effect can turn a render into a loop, so "fix them all" is a
    decision with a cost rather than a tidy-up.
  - Done when: the decision is written. The workflow does not fail on warnings today and this plan
    does not change that; what it changes is that somebody has said so on purpose.

- [ ] **3.4 Confirm lint and build both pass locally before pushing anything**
  ```
  cd /home/molef/Work/attica/frontend
  npm run lint ; echo "lint exit: $?"
  npm run build ; echo "build exit: $?"
  ls -la dist
  ```
  - Produces: two zero exit statuses and a `dist/` containing `index.html`, `assets/` and `vite.svg`.
  - Done when: both are zero on this machine. A workflow run is a slow way to discover something a
    local run answers in five seconds.

▶ **Next: [task 4.1](#4--keep-the-build-and-say-what-the-gate-now-gates)**.

### 4. 📦 Keep the build, and say what the gate now gates

◀ **Needs: [task 3](#3--make-the-frontend-job-reach-its-build)**.

- [ ] **4.1 Upload `frontend/dist` as a run artifact**
  - Add a step to the frontend job, after `Build`, using `actions/upload-artifact@v4` with a name
    that says what it is and a path of `frontend/dist`.
  - Set `retention-days` explicitly rather than taking the default, and say in the note what number
    was chosen and why. The build is 1.9 MB, so the number is a question about how far back you want
    to be able to reach, not about storage.
  - Produces: an artifact downloadable from the run page.
  - Done when: the step exists and names a real path. It is confirmed by downloading it in
    [instruction 6.3](#6--watch-a-run-go-green-and-take-what-it-built), not by reading the YAML.
  - This closes the criterion that the build is kept rather than discarded. Whether the deploy
    consumes this artifact or builds again on the machine is
    [plan 01](01-take-the-deployment-decision.md)'s answer, and this step does not pre-decide it.

- [ ] **4.2 Write what a tick on this workflow means**
  - One paragraph in the note, in plain words: what the backend job proves, what the frontend job
    proves, and what neither proves. Name the two red tests and the plan that owns them.
  - Produces: the paragraph
    [06](06-ship-it-put-it-back-and-write-it-down.md)'s shipping recipe quotes when it says what to
    check before shipping.
  - Done when: somebody who sees a green tick can say what it did and did not check, without opening
    `ci.yml`.
  - ❌ If [making the suites honest](../../fixing-create-event/plans/03-reconcile-suite-and-runbook.md)
    has not run yet, the paragraph says so: the backend job is red for a known reason owned
    elsewhere, and the frontend half of the gate is the half that works. **Do not disable, skip or
    `continue-on-error` the backend job to get a green tick.** A green tick that was bought is worse
    than a red one that is explained.

- [ ] **4.3 Take ruler six again and write the grouping's card entry**
  ```
  cd /home/molef/Work/attica
  gh run list --limit 20
  ```
  - Produces: the after-list beside the before-list in the note, with the same command between them,
    and the note added to `artifacts/notes/getting-it-out/README.md` per
    `~/.claude/ARTIFACT_TREE_FORMAT.md`.
  - Done when: the newest run's conclusion is recorded, whatever it is. **A run that is still red for
    the known backend reason is the honest result** and gets written as such.

▶ **Next: [instruction 6.1](#6--watch-a-run-go-green-and-take-what-it-built)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 6](#6--watch-a-run-go-green-and-take-what-it-built)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 5. 🔎 Read the failure in GitHub's own interface

◀ **Needs: [task 1](#1--read-the-workflow-and-take-ruler-six)** done, so you know which run and which
step you are looking for.

This is the `[owner: human]` criterion in [the definition of done](../MASTER_PLAN.md#definition-of-done).
It exists because this account cannot do it: `gh run view --job <id> --log-failed` returns
`HTTP 403: Must have admin rights to Repository`. The cause of the frontend failure is currently an
inference, and this is where it becomes a reading.

5.1 **Open the Actions tab and confirm the history**
   - In Chrome, go to `https://github.com/mo-rsa24/attica/actions`.
   - Expected result: a list of workflow runs. On 2026-08-23 there were exactly two, both with a red
     cross.
   - ✅ Two runs, both red: that matches ruler six and the baseline is confirmed. Screenshot the list
     and save it as `artifacts/figures/getting-it-out/actions-tab-two-red-runs.png`. **This is the
     baseline every later claim in this scope is measured against**, so take it before anything is
     pushed.
   - ❌ More runs, or a green one: the history has moved since 2026-08-23. Record the real list and
     correct ruler six in the note before continuing.

5.2 **Open the newest run and see both jobs**
   - Click the newest run. The left pane lists the two jobs, `Backend (Django)` and
     `Frontend (Vite + ESLint)`.
   - Expected result: both marked failed.
   - ✅ Both red: click the frontend job.
   - ❌ Only one is red: note which, because the two failures have different causes and different
     owners.

5.3 **Expand the failing step and read down to the line that fails**
   - In the frontend job's log, find the step marked with a red cross. It should be `Set up Node`.
   - Click it to expand. Scroll to the bottom of that step's output and read upward until you find
     the first line that is an error rather than a consequence of one.
   - Expected result: a message about the dependency [cache](../../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=140 "Computer networking: a top-down approach, section 2.2.5, Web caching, A web cache, or proxy server, in front of an institution's 15 Mbps access link worked w..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> or the lockfile path.
   - ✅ It names `frontend/package-lock.json` or the cache: **the inference held.** Copy the exact
     line, screenshot the expanded step and save it as
     `artifacts/figures/getting-it-out/frontend-job-failing-step.png`.
   - ❌ It names something else: **the inference was wrong, and that is a genuinely useful outcome.**
     Copy the exact line. [Task 2.1](#2--make-the-frontend-job-install-exactly) fixes what it names
     and corrects the claim in the master plan and in the map's hedged card.

5.4 **Do the same for the backend job, so it is not assumed either**
   - Go back, click `Backend (Django)`, and expand `Run tests`.
   - Expected result: 43 tests with one failure and one error, both in `events/tests.py`.
   - ✅ That is what you see: it matches what
     [making the suites honest](../../fixing-create-event/plans/03-reconcile-suite-and-runbook.md)
     owns, and nothing in this scope touches it. Copy the two test names.
   - ❌ It is a different number, or a different file: something has changed, and the scope that owns
     those tests needs to know before this plan claims anything about the backend job.

▶ **Next: [task 2.1](#2--make-the-frontend-job-install-exactly)**, which applies what the log said.

### 6. 👀 Watch a run go green and take what it built

◀ **Needs: [task 4](#4--keep-the-build-and-say-what-the-gate-now-gates)** done, so there is an upload
step to exercise.

A workflow change is only ever verified by a run. Reading the YAML tells you what you meant.

6.1 **Push, and watch the run start**
   - Commit the `ci.yml` change and the lint fixes, and push to a branch (not `main`, so that a
     mistake does not become the newest run on the default branch).
   - Open `https://github.com/mo-rsa24/attica/actions` and watch the run appear.
   - Expected result: a run in progress, two jobs.
   - ✅ It started: open the frontend job and watch the steps tick past.
   - ❌ No run appeared: `ci.yml` runs on `pull_request` and on `push` to `main`. A push to another
     branch with no [pull request](../../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/07-two-remotes-two-branch-rules.md "Two remotes, two branch rules, a refused push, system-design/devops-and-deployment, plan 07. Branch protection on GitHub and a branch policy on Azure Repos c...")</sub> triggers nothing. Open a pull request against `main`, which is the
     trigger the workflow was written for.

6.2 **Watch the frontend job pass each step it has never reached**
   - `Set up Node`, then `Install dependencies`, then `Lint`, then `Build`.
   - Expected result: all four green, for the first time in this workflow's history.
   - ✅ All four passed: screenshot the job's step list and save it as
     `artifacts/figures/getting-it-out/frontend-job-green.png`. That image is the after to
     instruction 5.3's before.
   - ❌ `Lint` failed with errors you fixed locally: the workflow installs from the lockfile and your
     machine may have a different tree. Compare `npm ls` locally against the run's install output.
   - ❌ `Build` failed and lint passed: read the build error in full. A build that works locally and
     not in the workflow is almost always a case-sensitive import path, because this machine is WSL2
     and the runner is Linux with a case-sensitive filesystem.

6.3 **Download the artifact and open what is inside it**
   - Scroll to the bottom of the run's summary page. There is an `Artifacts` section.
   - Click the artifact to download it. Unzip it.
   - Expected result: `index.html`, an `assets/` folder with one JavaScript file around 1.7 MB and
     one stylesheet around 150 KB, and `vite.svg`.
   - ✅ Those files are there: **the build is no longer thrown away**, and you are holding the thing
     a deploy would ship. Note the total size.
   - ❌ The Artifacts section is absent: the upload step did not run, or its `path` does not match.
     The frontend job's working directory is `frontend`, and `actions/upload-artifact` paths are
     relative to the workspace root, not to the job's working directory. That single mismatch is the
     usual cause.

6.4 **Read the backend job's result honestly**
   - Look at the backend job on the same run.
   - ✅ It is green: [making the suites honest](../../fixing-create-event/plans/03-reconcile-suite-and-runbook.md)
     has landed, and the whole workflow now passes. Record that in
     [task 4.2](#4--keep-the-build-and-say-what-the-gate-now-gates)'s paragraph.
   - ❌ It is red with the same two tests: that is the expected state until that plan runs, and it is
     written down rather than worked around. The frontend half of the gate is real; the backend half
     is waiting on another scope. Say exactly that in the paragraph.

▶ **Next: the close out.**

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

> This plan is done when the frontend job runs to its end and somebody can download what it built,
> and when anybody looking at the workflow's result can say in one sentence what it did and did not
> check.

Pass:

- The frontend job's failing step has been read in a browser and its exact line is in the note.
- The frontend job reaches `Build` and passes it, with a screenshot of the green step list.
- `npm ci` runs without the `|| npm install` fallback.
- `frontend/dist` is downloadable from the run page, and somebody has downloaded it and listed what
  was inside.
- The 30 unused-variable errors are gone, and the three defect-shaped errors are fixed or owned with
  a named file, line and owner.
- The warnings decision is written as a decision.
- One paragraph says what a tick on this workflow means, naming the two red backend tests and the
  plan that owns them.
- Ruler six's after-list sits beside its before-list with the same command between them.

Fail, and what it means:

- A green tick bought with `continue-on-error`, a skipped job or a disabled test. That is a gate that
  reports the answer it was told to report, which is worse than the red one it replaced.
- A lint rule disabled to clear an error. Thirty of the errors are unused imports and three are
  defects; a disabled rule hides the second kind behind the first.
- The `ci.yml` change verified by reading the YAML rather than by a run. Every workflow change looks
  correct in an editor.
- The failure cause still recorded as inferred. That was acceptable when nobody could read the log;
  it is not acceptable after somebody opened the tab.
- An upload step whose path does not resolve. It fails silently as an absent Artifacts section, which
  reads like a step that was never added.

Partial pass is acceptable while the backend job is red for its two known tests. The frontend half
working, the artifact kept, and the state written down is the whole of what this scope can deliver
until another scope's plan lands.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | Lane | State |
|---|---|---|---|
| The install step without its fallback | `.github/workflows/ci.yml`, frontend job | — | not started |
| The step that keeps the build | `.github/workflows/ci.yml`, frontend job | — | not started |
| The 30 unused imports removed | `frontend/src` | — | not started |
| The three defect-shaped errors fixed or owned | `frontend/src`, and the note | — | not started |
| The note: what the gate now gates | `artifacts/notes/getting-it-out/what-the-gate-now-gates.md` | — | not started |
| The Actions tab showing two red runs | `artifacts/figures/getting-it-out/actions-tab-two-red-runs.png` | — | not started |
| The frontend job's failing step, expanded | `artifacts/figures/getting-it-out/frontend-job-failing-step.png` | — | not started |
| The frontend job green to the end | `artifacts/figures/getting-it-out/frontend-job-green.png` | — | not started |
| The gate that has never been green | [piece 2](../diagram-prompts.md#piece-2-the-gate-that-has-never-been-green-planned--not-rendered) → `../diagrams/subject-02-the-gate-that-has-never-been-green.png` | subject | ⏳ not rendered |
| Six plans, six gates | [process prompt 2](../diagram-prompts.md#prompt-2-process-six-plans-six-gates-planned--not-rendered) → `../diagrams/process-02-six-plans-six-gates.png` | process | ⏳ not rendered |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/getting-it-out/plans/03-make-the-workflow-a-gate.md` | task 0, before any work | Conformance and thin instructions reported |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the scope's master plan](../MASTER_PLAN.md#continuous-integration-exists-has-never-passed-and-produces-nothing): the workflow's whole history with its commands.
- [the decisions taken here](../decisions-taken-here.md#reading-the-failing-workflow-log-is-marked-as-a-human-task-because-this-account-cannot): why the log is read in a browser.
- [the manual arc entry](../decisions-taken-here.md#the-manual-arc-is-written-against-github-actions-which-is-the-one-interface-that-certainly-exists): why [GitHub Actions](../../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/07-two-remotes-two-branch-rules.md "Two remotes, two branch rules, a refused push, system-design/devops-and-deployment, plan 07. Branch protection on GitHub and a branch policy on Azure Repos c...")</sub> is the interface this scope's manual lane is anchored on.
- [making the suites honest](../../fixing-create-event/plans/03-reconcile-suite-and-runbook.md): owns the two red backend tests. This plan states the consequence and fixes nothing.
- `.github/workflows/ci.yml`: two jobs, no deploy job, no `environment:`, no step that keeps anything.
- `frontend/package.json`: the `lint` and `build` scripts the frontend job runs.
- [the known gaps](../../../../../environment/overview.md#known-gaps--non-obvious-constraints): the two failing tests, as an environment fact.
- `~/.claude/ARTIFACT_TREE_FORMAT.md`: what the grouping's card has to contain.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#recommended-skill) ➡️

[04-let-the-environment-say-where-things-live.md](04-let-the-environment-say-where-things-live.md)
runs beside this plan and waits on
[01](01-take-the-deployment-decision.md) rather than on this one.
[06-ship-it-put-it-back-and-write-it-down.md](06-ship-it-put-it-back-and-write-it-down.md) is what
consumes the artifact this plan stops discarding.

## Recommended skill

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

— custom; no skill fits. The work is a workflow file, a browser reading a log, and 35 lint errors,
and the skills that come closest do the wrong half: `/write-tests` authors tests rather than making
an existing suite runnable, and `/code-audit` hunts defects with no question in hand.
   also: `/error-handling` is worth a look at task 3.2 if the two `rules-of-hooks` errors turn out to
   be a conditional hook inside a failure path, which is where that shape usually comes from.

## Error Matrix

Navigation: ⬅️ [Recommended skill](#recommended-skill) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet; populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| `gh run view --log-failed` returns [HTTP](../../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=133 "Computer networking: a top-down approach, section 2.2.3, HTTP message format, One request message taken apart line by line ('GET /somedir/page.html HTTP/1.1'..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/computer-networking-a-top-down-approach.pdf#page=128 "Computer networking: a top-down approach, sections 2.2.1 and 2.2.2, Overview of HTTP and non-persistent and persistent connections, HTTP as a stateless reque..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one 'curl -v' transcript line by line against a Python server, then gets 200, ...")</sub> 403 | Any attempt to read a failing job's log from this account | Repository admin rights are required. Read it in the browser at `github.com/mo-rsa24/attica/actions`, per instruction 5. |
| The frontend job gets further and still fails | After the lockfile lands, at `Lint` | 35 lint errors have never run in the workflow. Expect the failure to move, and clear it in task 3 rather than reading the move as a regression. |
| `actions/upload-artifact` finds nothing | Task 4.1, when the path is written relative to the job's working directory | The job's `working-directory` is `frontend`; the action's `path` is relative to the workspace root. Use `frontend/dist`. |
| A build that passes locally and fails on the runner | Instruction 6.2 | This machine is WSL2 and the runner's filesystem is case-sensitive. Check the import paths' capitalisation against the real filenames. |
| No workflow run appears after a push | Instruction 6.1 | `ci.yml` triggers on `pull_request` and on `push` to `main` only. A push to a side branch with no [pull request](../../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/07-two-remotes-two-branch-rules.md "Two remotes, two branch rules, a refused push, system-design/devops-and-deployment, plan 07. Branch protection on GitHub and a branch policy on Azure Repos c...")</sub> triggers nothing. |
