# What stands between this and production?

Two assessments of the system as it is, rather than as it is meant to be: one on the technology
gaps that would have to close before Attica could carry real traffic, one on the shape of the API
surface as currently written.

## What is in here

Two written reports.

## The reports

### technology-gaps-and-production-readiness

**What it shows**

The current development stack named piece by piece, then what each piece would have to become for
production: SQLite to a real database, local disk to object storage, hand-started processes to
supervised ones.

**How we got this**

Written by reading the codebase and the settings, not by load-testing anything or attempting a
deployment.

**What it lets you say**

Which gaps someone has already thought about, and roughly in what order they bite.

**What it cannot say**

Nothing measured. No load test, no deployment attempt, no cost estimate stands behind any of it.
Read it as a considered list, not as evidence.

Its Django version string was wrong (5.1) until 2026-08-23; it is 5.2.3. Treat other version
claims in it with the same suspicion.

**Where it came from and what judged it**

The repository. Nothing judged it.
**Held since 2026-08-23.** No plan names it. Kept because it is the only written account of the
production gap, and because
[`../../../environment/overview.md`](../../../environment/overview.md) now carries the verified subset of the same
facts and the two should be read together.

### api-design-review

**What it shows**

A review of the API surface as currently routed, based on `backend/main/main/urls.py` and each
app's `api_urls.py`.

**How we got this**

Read from the URL configuration. Its own Scope section names the exact files.

**What it lets you say**

Where the routing is inconsistent, and which conventions the surface does and does not hold to.

**What it cannot say**

Whether any endpoint works. It reviews how routes are declared, not what they return. One live
example it does not contain: the frontend calls `/api/events/my/`, which is not registered, while
the backend registers `my-events/`, and that mismatch breaks the organizer dashboard.

**Where it came from and what judged it**

The repository. Nothing judged it.
**Held since 2026-08-23.** No plan names it.
