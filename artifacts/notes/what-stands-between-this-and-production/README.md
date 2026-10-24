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
production: SQLite to a real database, local disk to [object storage](../../../../../Obsidian/Information%20Technology/System%20Design/Object%20Storage.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=250 "System design interview, chapter 15, Design Google Drive, Works the move from one server's disk to Amazon S3: files stored in S3, replicated within a region ..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=106 "System design big archive, How Amazon S3 Works?, Inside S3: over 350 trillion objects at eleven nines of durability, each object given a unique identifier an..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=223 "System design interview, chapter 14, Design YouTube, Blob storage holding the original uploaded videos, a cloud service the design uses instead of building, ..."), [▶1](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=0s "Hello Interview, Object Storage in System Design Interviews, Why Object Storage, 0:00 to 3:29, Why a design reaches for object storage, before chapters on ho..."), [▶2](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=209s "Hello Interview, Object Storage in System Design Interviews, How it works, 3:29 to 7:00, How an object store works underneath. Chapter-timed."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/18-minio-holds-the-receipt.md "MinIO holds the receipt, system-design/foundations, plan 18. Works it on the corner shop: a paid order's receipt PDF written by the notification service into...")</sub>, hand-started processes to
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
[the environment overview](../../../environment/overview.md) now carries the verified subset of
the same facts and the two should be read together.

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
