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

❌ `ConnectionRefusedError` during a test that touches the cache or the channel layer means Redis is
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
past-date validation, autosave, idempotent publish, and others.

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
