# Decisions taken while writing this scope

This scope was written in an unattended pass, with nobody to ask. Every choice below could have gone
the other way, and each is recorded with its reason so it can be reversed by someone who disagrees
rather than rediscovered by someone who is confused.

The source for the scope's content is item 13 of
[the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out),
and the state of the world it was written against is
[where we landed](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md).

---

## D9 is left open rather than answered here

**Decision.** What Attica gets deployed on, and how, is not chosen in this folder. The plan that
takes D9 is this scope's first, and the master plan states only the evidence, the criteria and the
constraints.

**Why.** `decide` in [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md)
means an open question with no correct implementation until it is answered. Pre-answering it in the
master plan would make the scope's own first plan ceremonial, and the pass's instruction to decide
rather than ask covers how to write the scope, not a decision the scope exists to take. This is the
same call `running-the-workers` made about D7, for the same reason.

The temptation here is stronger than it was there, because the shape of the answer looks obvious:
containerise the two processes, put a web server in front, move the database off SQLite. That is a
guess dressed as a conclusion. It assumes a host nobody has named, a budget nobody has stated, and a
tolerance for operational work nobody has expressed, and it would silently pre-decide D6 and D8 as
well.

## "Logically separable" is read as four named roles reachable by configuration

**Decision.** The build line's constraint, "the topology logically separable from day one even while
it runs on one machine", is read as: **four roles are named, and each is reachable by configuration
rather than by a code change.** Those four are the process that serves requests, the process that
runs recurring work, the database, and the store holding uploaded media. All four may sit on one box.
Moving any one of them off it must be an environment change.

**Why.** [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out)
gives the constraint and does not define a topology, so a reading had to be chosen. This one is
testable without taking D9: today three of the four are literals in `settings.py`
(`DATABASES` at `:156`, the channel layer host at `:96`, the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> location at `:116`, and the media
root at `:226`), so "can this move" has a yes-or-no answer per role that does not depend on where
anything is deployed.

**The reading it was chosen over.** "Separable" could mean containers from day one, or a service per
role from day one. Both are answers to D9 rather than constraints on it, and writing either into the
master plan would have decided the thing the scope exists to decide. Configuration-reachability is
the weakest reading that still does the job the constraint is there to do, which is to stop a
one-machine deployment from being welded to one machine.

**What this excludes.** It does not require the four roles to actually be separated, or a second host
to exist. A single box running everything satisfies it, as long as the arrangement is written down as
a choice rather than left as an assumption.

## The scope covers making one machine reproducible, not only shipping to a second one

**Decision.** Two things not named in item 13 are in this scope's Definition of Done: committing
`frontend/package-lock.json`, and adding a committed template of the environment variables the
application needs.

**Why.** They are the difference between shipping something and shipping something you can reason
about. `.gitignore:45` excludes the lockfile and `.gitignore:58` excludes `.env.example`, so a clone
today has neither a pinned frontend dependency set nor a list of what the application reads from its
environment. Every deployment mechanism worth choosing installs from a clone. One that installs from
an unpinned clone produces a different bundle on different days from the same commit, which makes
"the deploy changed something" unanswerable.

The lockfile is also the most likely cause of the frontend job's current failure, so it is not a
tidy-up: it is on the direct path to the first goal.

**Where it stops.** This does not become a scope about repository hygiene. The two items are here
because a deployment cannot be trusted without them, and nothing else was added on the same
argument.

**The credential is not touched.** `.env.example` also carries a live Sentry auth token. That is
already owned, as [task 2.3 and instruction 3.4 of closing the gaps](../fixing-create-event/plans/02-close-the-gaps.md),
and duplicating it here would give one problem two owners. What this scope owns is the part that plan
leaves behind: after the values are replaced with placeholders, the file is still gitignored, so a
clone still learns nothing. Hence a committed template that is not that file.

## The parent's "waits on 4" edge is kept, and the scope is still written to be startable

**Decision.** The parent's running order has this scope waiting on `one-booking-truth`, and this
folder does not change that. It also does not treat the wait as a reason to leave the scope
unplanned.

**Why.** [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out)
says both things: the running-order row says `Waits on 4`, and the prose says the scope is
"positioned late in the table and worth starting early, because nothing above is real until it can be
deployed". They are not in conflict. The edge says where the scope sits in the sequence; the prose
says the decision is worth taking before its turn comes.

Changing the edge from inside a child scope would alter the programme's shape from a place nobody
looks, which is the same objection `running-the-workers` recorded when it declined to make itself
wait on this one.

## D1 is named as setting the hardest case, not as a dependency

**Decision.** The scope is written against D1 being unmade. Its rule is that it builds the mechanism
for shipping a schema change and writes the rule for doing so, and never names a table.

**Why.** The programme's rule is that a scope whose content depends on D1 or D2 must say so and plan
against the decision being unmade. D1 does not change what a deployment mechanism is: a mechanism
that can ship the migration D1 produces is the same mechanism as one that ships any other migration.
What D1 sets is the hardest case, because migrating away from three of four booking representations
is the largest schema and data change this programme contains, and a mechanism designed for
one-column additions would meet it and fail.

So the questions this scope answers are the ones that are answerable now: whether the application
must tolerate both shapes while a migration is in flight, what a deploy does when a migration fails
halfway, and what happens to work in flight when processes restart. Each is a rule about deploys.
None needs to know which tables move.

**The failure this avoids.** Writing a deploy procedure whose migration step is a list of the
specific steps D1's migration will need. It would look complete, it would be written before anyone
knew what the migration was, and it would be rewritten the moment D1 landed.

## D2 reaches this scope only through restarts, and that is written as a rule

**Decision.** D2 is stated as not reaching this scope, with one named place it nearly does: a deploy
restarts processes, and a restart is when timed work is dropped or run twice. The deploy procedure
must say what happens to in-flight work, as a rule about restarts.

**Why.** D2 decides whether a hold starts at request time or at acceptance, which changes what
expires and how often. That is a list of jobs, and the list belongs to `running-the-workers` with its
contents set by D2. The rule about what a restart does to a job that is halfway through is a property
of the deploy and belongs here, and it is the same rule whichever way D2 goes.

Saying "D2 does not reach this scope" and stopping would have been half true and would have left the
one real interaction unowned.

## D7 is a constraint on D9, and this scope owes `running-the-workers` the return line

**Decision.** The Definition of Done requires the deployment decision to carry one line per
execution-tier candidate saying what this answer does to it, or, if D7 is already taken, one line
about the runner that won. This scope does not wait on that scope and that scope does not wait on
this one.

**Why.** [The workers' execution decision](../running-the-workers/plans/01-take-the-execution-decision.md)
already labels each of its candidates by what a future deployment decision would do to it, and
[that scope's own record](../running-the-workers/decisions-taken-here.md) says why it did that
instead of waiting. The obligation only works if it runs both ways: a deploy decision taken without
reference to those labels makes the labels useless, and the scope that wrote them cannot enforce
that from where it sits.

The pattern is already used in this tree in exactly this shape: `the-design-system` takes D10 and
owes `one-client-truth` one line about what the answer does to its [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> candidates.

## The manual arc is written against GitHub Actions, which is the one interface that certainly exists

**Decision.** The four `[owner: human]` criteria name a real interface: GitHub's Actions tab at
`github.com/mo-rsa24/attica/actions`, and a browser opening the deployed URL.

**Why.** A child scope's Definition of Done has to name what a person creates, runs and reads in a
user interface, or the plans authored from it inherit a truncated manual lane. The difficulty here is
that the main interface, whatever hosting console D9 picks, does not exist yet and cannot be named.

GitHub Actions can be. It is already wired to this repository (`origin` is
`git@github.com:mo-rsa24/attica.git`), it has two runs in it, and reading a failing run's log in that
tab is a real click path a person performs. So the manual arc is anchored on the interface that
exists today, plus the two acts that are interface-independent: doing a deploy by hand and putting it
back by hand.

**The consequence to watch.** When D9 names a hosting console, `populate-plans` will have a second
interface to write click paths against, and the Definition of Done above will be the floor rather
than the whole manual lane.

## Reading the failing workflow log is marked as a human task, because this account cannot

**Decision.** The frontend job's failure cause is stated as inferred rather than verified, and
confirming it from the log is an `[owner: human]` criterion.

**Why.** `gh run view --job 97147774802 --log-failed` returns `[HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> 403: Must have admin rights to
Repository`. The inference from the untracked lockfile is strong: `actions/setup-node` is configured
to [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> against `frontend/package-lock.json`, that file has never been committed, and the job dies
at `Set up Node` before installing anything. It is still an inference, and this programme's standard
is that a plausible invented cause is worse than an admitted gap, because it gets built on.

## Rollback lives inside the shipping recipe rather than becoming a third one

**Decision.** The runbook pair stays exactly the two halves item 13 names, how to ship a change and
how to confirm it landed, and putting a deploy back is a section of the first rather than a third
recipe.

**Why.** The pair is specified, and adding to it from inside a child scope quietly changes what the
parent asked for. The stronger reason is about when the thing is read: a rollback is looked up in the
minute a deploy is going badly, and nobody opens a different file then. It belongs next to the
command that caused the problem.

## Context is checked rather than assumed to be owed nothing

**Decision.** `/context-pulse` is a conditional criterion rather than an absent one, with the
expected answer stated as "nothing owed".

**Why.** [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out)
names only `environment/` and `runbook/` on this scope's Owes line, and a release, an environment, a
rollback and a build artifact are facts about the machinery rather than about events, providers or
bookings. But D9 is unmade, and an unmade decision cannot be guaranteed not to introduce a
user-visible word. `the-design-system` handled the mirror image of this the same way, keeping
`/env-pulse` as a conditional because one possible answer to D10 would make its "nothing owed" false.

## The target host: one small Linux machine in Johannesburg, at a fixed price

**Decision.** A deployed Attica runs on **one small Linux virtual machine, in a Johannesburg region,
at a fixed monthly price, on an account Molefe owns.** This repository records no hosting account, no
domain, no target host and no budget, so the fact was chosen rather than left open, in a pass with
nobody to ask.

**Why a place had to be chosen at all.** Every candidate in the D9 plan is compared on cost, on what
it can hold open, and on what it makes a person operate by hand. All three of those are properties of
a candidate *on a particular host*. Leaving the host open would make the D9 plan a comparison against
a fiction, which is the same failure as guessing the answer, arrived at more slowly.

**Why Johannesburg.** The users are in South Africa and the repository says so in three independent
places. `ZAR` appears at 48 sites in `frontend/src`, the `en-ZA` locale is used at 17 sites across 10
files, and two of the three currency defaults in the backend are `ZAR`
(`backend/main/events/models.py:54` and `backend/main/chat/models.py:187`). The interface this
programme is being built toward is real-time: the whole of `one-client-truth` is about a socket
delivering state changes without a refresh, so round-trip [latency](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Latency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=784 "AI engineering, chapter 9, Inference performance metrics, Works latency as a distribution with numbers: ten time-to-first-token values whose mean of 390 ms i..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=36 "System design interview, chapter 2, Latency numbers every programmer should know, Jeff Dean's 2010 table of how long typical computer operations take, with i..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=358 "System design big archive, Latency vs. throughput, Latency as the delay per packet, what a user feels after clicking a button, set against throughput as the ..."), [▶1](https://www.youtube.com/watch?v=3JdQOExKtUY&t=129s "Hussein Nasser, Percentile Tail Latency Explained (95%, 99%), Calculating Percentile, 2:09 to 5:20, How a p95 or p99 is calculated from a set of request time..."), [▶2](https://www.youtube.com/watch?v=FqR5vESuKe0&t=63s "ByteByteGo, Latency Numbers Programmer Should Know: Crash Course System Design #1, Time Units, 1:03 to 2:50, The units the latency numbers are written in, be..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/22-prometheus-grafana-and-the-alert.md "Prometheus, Grafana, and the alert, system-design/foundations, plan 22. Every service gets a metrics endpoint and Grafana draws request rate, errors and p95 ...")</sub> is felt continuously rather than
once per page. Region is also the choice that gets expensive to reverse, because reversing it means
moving the data, which is the argument for taking it early rather than by default.

**Why one machine.** [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out)
says the topology must be logically separable while running on one machine, so one machine is what
the constraint was written for. The whole of Attica's state today is a 2.2 MB database file and 51 MB
of media.

**Why a fixed monthly price.** No budget is recorded, and the account holder is a student. When the
ceiling is unknown, a bill that cannot surprise is worth more than a bill that could be smaller. A
metered platform is the right answer once somebody has stated a number, and nobody has.

**The three classes it was chosen over.**

A serverless or function platform loses on what it can hold open. Daphne holds long-lived [WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the `/ws` p...")</sub>
connections, three client components already open sockets, and the notification channel is the
delivery path for the entire booking journey. Per-request billing and [connection timeouts](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Timeout.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=146 "System design interview, chapter 9, Design a web crawler, Short timeout, A crawler gives each web server a maximal wait time and, when a host does not answer..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=362 "System design big archive, How to Debug a Slow API?, Set aggressive timeouts and retries on third-party calls such as Stripe or Google Maps, so one slow prov..."), [▶1](https://www.youtube.com/watch?v=2GAQVXGT_Zw&t=150s "Hussein Nasser, Frontend and Backends Timeouts, Connection Timeout, 2:30 to 5:00, The first of the timeouts a backend sets, before read, wait, usage and resp..."), [▶2](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts set on calls between services..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/14-payment-notification-and-a-timeout.md "Payment, notification, and a timeout, system-design/foundations, plan 14. The order service calls payment with httpx and a 2-second timeout; a card ending 00...")</sub> are the
wrong shape for a process whose job is to stay connected.

A free platform tier loses on [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> and on sleeping. The channel layer and the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> both require it
(`settings.py:96` and `:116`), and free tiers that sleep make a real-time programme untestable: an
undelivered notification and a sleeping dyno look identical from outside, which is exactly the class
of confusion this programme exists to remove.

A managed application platform, the kind where pushing a branch deploys it, loses on timing rather
than on merit. It is a plausible answer to D9, and adopting it as the *host* would pre-decide the
mechanism D9 exists to choose. A plain virtual machine is the substrate that keeps every mechanism
candidate available, including running a managed platform on top of it later.

**What this deliberately does not settle.** The provider's name, the machine's size, whether anything
runs in a container, what supervises the processes, how a change gets from a commit to that machine,
and whether the database and Redis sit on the box or beside it. All of those are D9 and belong to
this scope's first plan. This entry removes the blocker; it does not take the decision.

**What it constrains elsewhere, in one line.** D6 and D8 stay open, and whatever they choose should
be in the same region as this machine, because a database or an [object store](../../../../../../Obsidian/Information%20Technology/System%20Design/Object%20Storage.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=250 "System design interview, chapter 15, Design Google Drive, Works the move from one server's disk to Amazon S3: files stored in S3, replicated within a region ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=106 "System design big archive, How Amazon S3 Works?, Inside S3: over 350 trillion objects at eleven nines of durability, each object given a unique identifier an..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=223 "System design interview, chapter 14, Design YouTube, Blob storage holding the original uploaded videos, a cloud service the design uses instead of building, ..."), [▶1](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=0s "Hello Interview, Object Storage in System Design Interviews, Why Object Storage, 0:00 to 3:29, Why a design reaches for object storage, before chapters on ho..."), [▶2](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=209s "Hello Interview, Object Storage in System Design Interviews, How it works, 3:29 to 7:00, How an object store works underneath. Chapter-timed."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/18-minio-holds-the-receipt.md "MinIO holds the receipt, system-design/foundations, plan 18. Works it on the corner shop: a paid order's receipt PDF written by the notification service into...")</sub> in another region turns
one network hop into two on the path this programme measures.

**How to reverse it.** Change this entry and the Environment Context section it is linked from, both
in one edit, before the D9 plan runs. After that plan runs it is written into a signed decision and
reversing it costs a rewrite of that plan's candidate table.

**What is still a person's job.** Creating the account, choosing the provider and the size, and
paying for it. Those are `[owner: human]` criteria in the Definition of Done, not tasks, and none of
them is done by this entry.

**It is not an `environment/` fact yet.** That folder records what is true about the system the work
runs on, and no such machine exists. It is written there once one does, as part of the whole new
section this scope owes.

---

## No parent capstone amendment was needed

**Decision.** [The parent's subject capstone](../../diagram-prompts.md) was left unchanged.

**Why.** It already carries this scope's glyph, labelled: on the vertical line to the right of the
stack headed "alongside, from day one", "a deploy glyph labelled 'getting it out'". The rule is that
a scope with no glyph in the parent capstone amends it in the same commit as its decomposition, and
this scope has one. [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md)
predicted exactly this, and the label was added by the amendment that
`running-the-workers` and `one-client-truth` triggered.

## The child map has a subject lane and no process lane

**Decision.** [The illustrated map](diagram-prompts.md) carries five subject pieces and a capstone,
and its process lane section says it is not authored yet.

**Why.** A process lane's stages are the scope's plan files, and this folder has none: `populate-plans`
authors them. Drawing the lane now would mean inventing the work breakdown that skill owns, and it
would be redrawn immediately. This is the same state `one-client-truth`'s map was left in at its
decomposition, and its lane was authored in the same pass that authored its plans.

## The map adds no glyph, and says how it draws a machine without one

**Decision.** The child map declares no new glyph, no new colour meaning and no new tier, and states
which of the parent's existing devices it uses for the things a deployment picture needs.

**Why.** The inheritance rule is exact: the child inherits the art direction and adds no vocabulary.
A deployment map plainly wants a host, an artifact and a commit, and none of the three is in the
parent's declared vocabulary (browser card, person figure, form row, handler glyph, worker gear,
queue tray, cylinder, globe).

The way out is that the parent's capstone already uses panels, chips, document cards, gate bars and
empty framed slots as compositional devices rather than as glyphs. So a machine is a titled rounded
panel, an artifact is a document card, a commit is a chip, and the reader arriving from outside is
the external-tier globe. All four are the parent's own devices used for a new subject, which is
inheritance rather than addition.

**The one that was hardest.** A deploy glyph does appear in the parent capstone, and it stands for
this whole scope. The child map uses it exactly once, for the same meaning, rather than turning it
into a general-purpose glyph inside the zoom-in. A glyph that means "this scope" in the parent and
"a step" in the child would be a new vocabulary item wearing an old name.

---

## What was found and deliberately not changed

**The two red backend tests.** They fail [continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> on every run and they belong to
[making the suites honest](../fixing-create-event/plans/03-reconcile-suite-and-runbook.md). This
scope states the consequence and fixes nothing.

**The `.gitignore` line cited for `.env.example` in a sibling plan.**
[Closing the gaps](../fixing-create-event/plans/02-close-the-gaps.md) cites `.gitignore:13`, and
`git check-ignore -v` reports `.gitignore:58`. Both lines carry a pattern that matches; 13 is
`.env.*` and 58 is `**/.env.*`, and check-ignore reports the last match. The claim in that plan, that
the file is gitignored and has never been committed, is correct, so nothing was edited in another
scope's plan file during a decomposition.

**The live Sentry token.** Already owned, as above. Rotating it is a browser step in someone's Sentry
account and is not this scope's, and nothing was deleted or moved.

**The currency default that disagrees with the other two.** Establishing that Attica's users are in
South Africa, which is what fixes the region, turned up `backend/main/chat/models.py:76` defaulting
`currency` to `USD` where `chat/models.py:187` and `events/models.py:54` both default it to `ZAR`.
That is one of the four live booking representations disagreeing with the other two, so it is
evidence for D1 and belongs to `one-booking-truth`. It was added to
[the open decisions](../../../../ideas/enhancing-create-event-end-to-end/WHERE-WE-LANDED.md#3-open-decisions)
under D1, where that scope will read it, and no code was touched.
