# 🧪 Running the tests

Two suites, with different prerequisites. The browser suite needs a running backend and a seeded
fixture; the backend suites do not.

## Contents

- [1. Run the Playwright suite](#1-run-the-playwright-suite)
- [2. Run the Django and pytest suites](#2-run-the-django-and-pytest-suites)
- [3. Read a `test.fail` result correctly](#3-read-a-testfail-result-correctly)

## 1. Run the Playwright suite

Navigation: 📋 [Contents](#contents) | [Next](#2-run-the-django-and-pytest-suites) ➡️

`unverified`

The suite assumes the backend is already up on `:8000` and the deterministic fixture is seeded. It
starts Vite itself, so do not start the frontend by hand first.

**Once per setup, or whenever the database is reset**

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
python manage.py seed_e2e
```

Creates `e2e-organizer` / `E2eOrganizerPass!23`.

**Then, with the backend running**

```bash
cd /home/molef/Work/attica/frontend
npm run test:e2e          # headless
npm run test:e2e:ui       # the interactive Playwright UI
```

✅ The run completes and reports passes. Some of them pass *because they failed*: see
[recipe 3](#3-read-a-testfail-result-correctly).

❌ Everything fails at login: the backend is not on `:8000`, or `seed_e2e` has not run against the
current database.

❌ Playwright cannot reach the app: something else is already on the port Vite wants. Free it rather
than letting Vite pick another, since the suite expects the default.

## 2. Run the Django and pytest suites

Navigation: ⬅️ [1. Run the Playwright suite](#1-run-the-playwright-suite) | 📋 [Contents](#contents) | [Next](#3-read-a-testfail-result-correctly) ➡️

`ran 2026-08-22`

**Use the Django runner. There is no working pytest here**, whatever `CLAUDE.md` says; see the
fold below.

```bash
source /home/molef/lobola/bin/activate
cd /home/molef/Work/attica/backend/main
python manage.py test
```

✅ Real output, 2026-08-22, trimmed:

```
Found 43 test(s).
System check identified no issues (0 silenced).
..F......E.................................
Ran 43 tests in 23.652s
FAILED (failures=1, errors=1)
```

**The suite is red, and these two are the reason.** They are not flaky and they are not
environmental.

```
ERROR: test_upload_asset_persists_on_draft (events.tests.EventDraftAPITests)
  events/tests.py:91  IndexError: list index out of range
  response.data["assets"] came back empty: the uploaded asset did not persist.

FAIL: test_cross_organizer_access_denied (events.tests.EventDraftAPITests)
  events/tests.py:248  AssertionError: 404 != 403
  Reading another organizer's draft returns 404, and the test expects 403.
  Note the publish action DOES return 403 (events/views.py:499), so the two
  paths disagree with each other about which is right.
```

❌ `RuntimeWarning: DateTimeField Event.created_at received a naive datetime` appears several times
and is noise, not a failure. `Event` sets naive defaults while `USE_TZ` is on.

❌ `ConnectionRefusedError` during a test that touches the [cache](../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> or the channel layer means [Redis](../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> is
not running. Start it: [Stack § 1](../running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up).

This suite needs neither the frontend nor Daphne. It builds and destroys its own test database, so
it does not touch `db.sqlite3`.

<details>
<summary><b>Why <code>pytest</code> does not work, and what happens if you try</b></summary>

`pytest` is not installed in `/home/molef/lobola`, not in `backend/venv`, and not listed in
`backend/main/requirements.txt`. The only `pytest` on the PATH is `/usr/bin/pytest`, the system one,
which has no Django. Running it gives:

```
ERROR collecting main/test_urls_cli.py
ERROR collecting scheduling/test_urls.py
E   ModuleNotFoundError: No module named 'django'
Interrupted: 2 errors during collection
```

There is also no `pytest.ini`, `setup.cfg`, `tox.ini` or `pyproject.toml` configuring it.

**And the two files it tries to collect are not tests.** `main/test_urls_cli.py` and
`scheduling/test_urls.py` are minimal URL configuration modules that happen to start with `test_`.
So even with pytest installed, collection would fail until it is told to ignore them.

Installing pytest is a real change, not a fix to this recipe. Until someone does it and adds the
ignore rules, `python manage.py test` is the only suite.
</details>

## 3. Read a `test.fail` result correctly

Navigation: ⬅️ [2. Run the Django and pytest suites](#2-run-the-django-and-pytest-suites) | 📋 [Contents](#contents)

`unverified`

Some Playwright tests are marked `test.fail(...)`. They document **known broken invariants**:
past-date validation, autosave, [idempotent](../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Idempotency.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=160 "System design interview, chapter 10, Design a notification system, Reliability, Works the duplicate-notification case: delivery cannot be exactly once, so ea..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=380 "System design big archive, How to Design Good APIs, Which HTTP methods are idempotent (GET, HEAD, PUT, DELETE) and which are not (POST, PATCH), then idempote..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=143 "System design big archive, A Cheatsheet on REST API Design Best Practices, Idempotent endpoints for safe retries, especially for POST, and idempotency keys t..."), [▶1](https://www.youtube.com/watch?v=m6DtqSb1BDM&t=673s "Arpit Bhayani, Build a robust Payments service using Idempotency Keys, Flow, 11:13 to 16:36, The flow of a payment request carrying an idempotency key, after..."), [▶2](https://www.youtube.com/watch?v=4OuaONkZw1I&t=68s "Hussein Nasser, Why Idempotency is very critical in Backend Applications, What is Idempotency, 1:08 to 7:12, What idempotency means for a backend request. Ch..."), [◆](../../../../goal-setting/learning/system-design/foundations/textbook/02-the-api-contract-on-paper.md#23-the-idempotency-key-header "The API contract on paper, system-design/foundations, chapter 2, section 2.3. Works the three cases of `POST /payments` with an `Idempotency-Key`: a new key ...")</sub> publish, and others.

**They pass today because they fail.** That is the point. Each one is a defect written down as an
executable claim.

✅ A `test.fail` test reporting pass means the invariant is still broken, as expected.

❌ A `test.fail` test reporting **fail** means the invariant now holds and somebody fixed it. That is
good news that looks like bad news. Flip the marker from `test.fail` to `test` in the same change
that fixed it, or the next person will read the red as a regression.

<details>
<summary><b>Why write a test that is expected to fail</b></summary>

A defect described in prose gets forgotten and argued about. A defect described as a failing
assertion cannot be: it is checked on every run, and the moment it stops being true the suite says
so. The cost is one confusing line of output, and the marker is what makes it unambiguous.
</details>
