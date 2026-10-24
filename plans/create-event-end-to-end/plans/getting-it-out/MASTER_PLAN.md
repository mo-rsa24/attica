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

[Continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> exists and does not gate anything. It has run twice, on 2026-07-28 and
2026-08-23, and both runs failed in both jobs. The build it produces is thrown away at the end of
the job.

This scope takes the deployment decision, builds what it chooses, makes one machine reproducible
enough that a second one is a copy rather than an archaeology exercise, and writes down how to ship
and how to check.

---

## What this scope is, in one line per mark

The marks come from [the scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out),
and this scope is the whole of item 13 there.

**decide** There is no deployment mechanism. [Continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> exists and nothing ships.

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
bytes on this disk. `ci.yml` asks `actions/setup-node` to [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> against
`cache-dependency-path: frontend/package-lock.json`, and the install step is `npm ci || npm install`.
Both of those need the file. The exact log line is not readable from this account
(`gh run view --log-failed` returns [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> 403, admin rights required), so the specific cause is
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
[The execution model](../../../../environment/overview.md#execution-model) is [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub>, then Daphne or
`runserver`, then the Vite dev server, then the [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> worker when the booking path is being used.
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

**The [webhook](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> configuration is hardcoded too.** `SCHEDULING_WEBHOOK_URLS`, `SCHEDULING_WEBHOOK_TARGETS` and
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

**142 of the call sites are relative paths that only the dev [proxy](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> resolves.** `'/api/'` and its
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

### The users are in South Africa, which is the one fact that fixes a region

**48 sites, 17 sites, and two of three defaults.** `ZAR` appears at 48 sites in `frontend/src`. The
`en-ZA` locale is passed at 17 sites across 10 files, among them
`EventOrganizerDashboard.jsx`, `ProviderDashboard.jsx` and `ArtistPostSidebar.jsx`. In the backend,
`backend/main/events/models.py:54` and `backend/main/chat/models.py:187` both default `currency` to
`ZAR`.

This is the evidence the target-host choice in the Environment Context section rests on, and it is
the only claim in this scope that decides something expensive to reverse, because changing a region
later means moving the data.

**One of the three defaults disagrees, and it is not this scope's.**
`backend/main/chat/models.py:76` defaults `currency` to `USD`. That is one of the four live booking
representations contradicting the other two, so it is evidence for `one-booking-truth` rather than
for deployment, and nothing here is changed on account of it.

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
move media to [object storage](../../../../../../Obsidian/Information%20Technology/System%20Design/Object%20Storage.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=250 "System design interview, chapter 15, Design Google Drive, Works the move from one server's disk to Amazon S3: files stored in S3, replicated within a region ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=106 "System design big archive, How Amazon S3 Works?, Inside S3: over 350 trillion objects at eleven nines of durability, each object given a unique identifier an..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=223 "System design interview, chapter 14, Design YouTube, Blob storage holding the original uploaded videos, a cloud service the design uses instead of building, ..."), [▶1](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=0s "Hello Interview, Object Storage in System Design Interviews, Why Object Storage, 0:00 to 3:29, Why a design reaches for object storage, before chapters on ho..."), [▶2](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=209s "Hello Interview, Object Storage in System Design Interviews, How it works, 3:29 to 7:00, How an object store works underneath. Chapter-timed."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/18-minio-holds-the-receipt.md "MinIO holds the receipt, system-design/foundations, plan 18. Works it on the corner shop: a paid order's receipt PDF written by the notification service into...")</sub> or add image variants, which is `performance-architecture`. It does not
migrate to PostgreSQL, which is `contention-and-holds`. It makes each of those a configuration change
rather than a code change, which is a different job from doing them.

---

## Objectives

1. **Take the deployment decision on what is actually here, rather than on what a deployment
   usually looks like.** One laptop, one SQLite file, 51 MB of media on local disk, a client with no
   configuration mechanism, and [continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> that has never passed. A decision made
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
5. [Continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> passes, and what it produces is kept rather than discarded.
6. Two installs from the same commit produce the same dependency set, on both halves of the
   application.
7. The database engine, the [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> location, the media location, the allowed hosts and the client's
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

- [ ] The deployment decision taken, written down, signed and dated: what runs Attica, how a change
      gets there, and how it is put back. Every losing candidate carries its own paragraph and the
      reason it lost. Where it runs is already settled as a class of host, in
      [the decisions taken here](decisions-taken-here.md#the-target-host-one-small-linux-machine-in-johannesburg-at-a-fixed-price),
      and the decision either adopts that class or says in one paragraph why it is wrong
- [ ] ⚠️ The account created and the machine provisioned by hand: a small Linux virtual machine in a
      Johannesburg region at a fixed monthly price, on an account Molefe owns. The class is chosen;
      the provider, the size and the price are not, so record all three plus the region in the
      decision. Nothing in this scope can be checked against a real machine until this exists
      `[owner: human]`
- [ ] That decision carries one line per execution-tier candidate from
      [the execution decision](../running-the-workers/plans/01-take-the-execution-decision.md) saying
      what this answer does to it, or, if D7 is already taken, one line saying what this answer does
      to the runner that won
- [ ] The four roles named and separable: which process serves requests, which runs recurring work,
      where the database is, where uploaded media is. Each one reachable by configuration, with the
      one-machine arrangement written down as a choice rather than as an assumption
- [ ] `DATABASES`, the channel layer host and the [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> location read the environment, so
      `settings.py:96`, `:116` and `:156` to `:161` carry no literal host, port or engine
- [ ] `SECRET_KEY` and `DEBUG` have no working default: an environment that does not set them fails
      to start, and the `django-insecure-` literal at `settings.py:29` is gone
- [ ] The `SECURE_*`, `SESSION_COOKIE_SECURE` and `CSRF_COOKIE_SECURE` settings exist and are on for
      the deployed environment, and `manage.py check --deploy` reports zero issues against it. The
      current baseline is five, run on 2026-08-23
- [ ] The client can be told where its backend is: a single configured origin the built bundle reads,
      the two hardcoded loopback sites at `frontend/src/utils/useAxios.js:10` and
      `frontend/src/LocationDetailPage.jsx:85` removed, and the 142 relative call sites either
      preserved by a [proxy](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> rule in the deployed environment or rewritten, decided once and written
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
- [ ] [Continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> passes on `main`. Its history is two runs and two failures, on
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
      [the access paths](../../../../environment/overview.md#access-paths), which describe two [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub>
      clients that both assume the dev proxy
- [ ] `/context-pulse` run **only if** the decision introduces a word about Attica's world that
      nobody has defined. Environment, release, rollback and artifact are facts about the machinery
      rather than about events, providers or bookings, so the expected answer is that nothing is
      owed. [The scopes](../../../../ideas/enhancing-create-event-end-to-end/THE-SCOPES.md#13-getting-it-out)
      names only `environment/` and `runbook/`, and the judgement is in
      [the decisions taken here](decisions-taken-here.md#context-is-checked-rather-than-assumed-to-be-owed-nothing)
- [ ] A health route exists that answers whether the database and the channel layer are reachable, so
      "is it up" can be asked from outside without opening a browser. `backend/main/main/urls.py`
      carries no such route today, and the commit-reporting item above answers a different question:
      which version is serving, not whether it can serve
- [ ] The data has a way back, separately from the code: what a backup covers (the database, the
      51 MB of uploaded media across 478 files, or both), where it is kept, and how often. Every
      rollback item above puts a commit back and leaves the data exactly as the bad deploy left it,
      which is the failure this covers
- [ ] ⚠️ The restore performed by hand, once, onto an empty machine, with the time it took and
      anything lost written down. A restore recipe nobody has run is a claim, not a recipe
      `[owner: human]`
- [ ] Close out: `/ingest-error-pattern` for anything that bit, then
      `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-it-out`

---

## Sub-Scopes

(none)

---

## Plans

Six, of which four are written. The order that matters is the
[parent's running order](../../MASTER_PLAN.md#running-order), which still carries one placeholder row
for this whole scope until `sync-plan-tree` interleaves these.

| Plan | What it does | Status |
|---|---|---|
| [01 Take the deployment decision](plans/01-take-the-deployment-decision.md) | Settle what runs Attica, how a change gets there, and how it is put back, with every losing candidate and why it lost | ⚠️ not started |
| [02 Make two clones the same](plans/02-make-two-clones-the-same.md) | Commit the lockfile and the environment template, so a fresh clone installs without archaeology | ⚠️ not started |
| [03 Make the workflow a gate](plans/03-make-the-workflow-a-gate.md) | Get [continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> passing on `main` and keep the build it produces | ⚠️ not started |
| [04 Let the environment say where things live](plans/04-let-the-environment-say-where-things-live.md) | Database, channel layer and [cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> read the environment; no literal host, port or engine in `settings.py` | ⚠️ not started |
| 05 Give the client an address | The built bundle learns where its backend is, and something serves the bundle and the media with debug off | ⚠️ not authored |
| 06 Ship it, put it back and write it down | The two recipes, the health route, the data backup and its restore, and the `env-pulse` that records what changed | ⚠️ not authored |

Plans 05 and 06 are referenced by name from all four written plans, so their filenames are already
fixed: `plans/05-give-the-client-an-address.md` and
`plans/06-ship-it-put-it-back-and-write-it-down.md`. `populate-plans` authors them.

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

**Two [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> clients reach the backend by different routes**, per
[the access paths](../../../../environment/overview.md#access-paths): one goes through the Vite
[proxy](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> and one hardcodes `127.0.0.1:8000` and needs [CORS](../../../../../../Obsidian/Information%20Technology/Networking/CORS.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=Ka8vG5miErk&t=240s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), No 'Access-Control-Allow-Origin' header is present, 4:00 to 8:10, The first CORS error ..."), [▶2](https://www.youtube.com/watch?v=Ka8vG5miErk&t=610s "Hussein Nasser, Cross Origin Resource Sharing (Explained by Example), OPTIONS 405 Method not Allowed (Preflight failed), 10:10 to 17:00, A preflight request ..."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 13. The wizard wired to the backend three ways in turn: broken cr...")</sub>. Both routes exist because there is a dev
server. A deployed environment has neither by default, which is why the client's backend address is
a deliverable here rather than a detail.

**The backend suite is red before this scope touches anything**, per
[the known gaps](../../../../environment/overview.md#known-gaps--non-obvious-constraints). Two of 43
tests fail. Any claim here about [continuous integration](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> passing has to account for that, and fixing
it is another scope's.

One fact this scope needs is not written in `environment/`: **where a deployed Attica would run.**
There is no hosting account, no domain, no target host and no budget recorded anywhere in this
repository, and no candidate mechanism can be compared without one.

**The answer taken here is one small Linux virtual machine in a Johannesburg region, at a fixed
monthly price, on an account Molefe owns.** It was chosen rather than left open, in a pass with
nobody to ask, and it is reversible by anyone who disagrees. The reasoning, including the three
classes of host it was chosen over and what it deliberately leaves undecided, is in
[the decisions taken here](decisions-taken-here.md#the-target-host-one-small-linux-machine-in-johannesburg-at-a-fixed-price).

**It settles a place, not a mechanism.** The provider's name, the machine's size, whether anything
runs in a container, what supervises the processes, how a change gets there, and whether the database
sits on that box or beside it are all still D9's, and this scope's first plan takes them.

**Nothing of it goes into `environment/` yet.** That folder records what is true about the system the
work runs on, and no such machine exists. It becomes an environment fact when someone has created it,
which is why creating the account is an `[owner: human]` criterion below rather than a task.

Where another fact this scope needs is not written in `environment/`, stop and ask rather than
inferring it.

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
