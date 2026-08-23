# 🔑 Grant Every Role

Step 2 of 3 in this scope. Waits on [01](01-settle-what-a-role-is.md).
Next: [03-prove-it-and-write-it-down.md](03-prove-it-and-write-it-down.md).

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to change](#description-what-to-change)
- [Purpose and goal](#purpose-and-goal)
- [Tasks](#tasks)
- [Instructions](#instructions)
- [The engagement gate](#the-engagement-gate)
- [Outputs / Deliverables](#outputs--deliverables)
- [Orchestration](#orchestration)
- [References](#references)
- [Next step](#next-step)
- [Error Matrix](#error-matrix)

## Position in the plan tree

Navigation: 📋 [TOC](#table-of-contents) | [Next](#quick-context-where-you-are) ➡️

Scope: [getting-in](../MASTER_PLAN.md). Second of three. It cannot start until
[01](01-settle-what-a-role-is.md) has said which classification counts, because granting the wrong
one changes nothing and looks like it worked.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

Five roles are enforced. Two are ever granted.

`seed_booking_workflow` grants `EVENT_ORGANIZER` and `ARTIST`. `seed_sa_artists` grants `ARTIST`.
Nothing anywhere grants `SERVICE_PROVIDER`, `VENUE_MANAGER` or `TICKET_BUYER`.

Separately, `seed_marketplace` creates nine users, four artists, three vendors and two venues, all
with password `seed_pass_123!`, and assigns none of them any role at all. So `seed_vendor_feast`
logs in successfully and then fails every vendor gate.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md) and
[the Django admin site](../../../../../environment/django-admin/the-admin-site.md).

- The Python environment is `/home/molef/lobola`. Activate it with
  `source /home/molef/lobola/bin/activate`.
- The database is SQLite at `backend/main/db.sqlite3`.
- **The admin lives at `http://127.0.0.1:8000/admin/`, on the backend port, not the Vite port.**
  `http://localhost:5173/admin/` gets the React app's 404 instead.
- **Only a user with `is_staff` can log in to it, and no seed creates one.** The seeded artist
  accounts are created with `is_staff: False`.
- Admin writes skip the service layer, so use it to read and to set up, never to test a flow.

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Grant in the seed, not in the admin.**

Assigning a role by hand in the admin fixes one database and nothing else. The next person to reset
their data is back where you started. The admin is for confirming the seed worked, which is
[instruction 4](#4--confirm-it-in-the-django-admin).

**The seeds must stay idempotent.**

Every seed here is run repeatedly against a dirty database. Use `get_or_create` and assign roles with
`add`, never `set`, so re-running never strips a role someone added deliberately.

**Nine users, three resource types, and the mapping is not obvious from the username.**

`seed_venue_atrium` is a venue, which means `VENUE_MANAGER`, not `SERVICE_PROVIDER`. Read the
seed's own `ARTISTS`, `VENDORS` and `VENUES` lists rather than pattern-matching the name.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

After this plan, a fresh database seeded from scratch has at least one working account for every
role Attica enforces. That is the difference between three of five dashboards being unreachable and
all five being testable.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Three roles the code checks are granted by nothing, so three whole sides of the product have never
been driven by anyone. Nine seeded providers exist to be booked and cannot act as providers.

This is not a hard fix. It is a blocker because everything downstream, including the two-browser
acceptance test the parent scope is measured by, needs a provider who can log in and answer.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  ENFORCED                    GRANTED BY A SEED
  EVENT_ORGANIZER    ────────  test_organizer          ✓
  ARTIST             ────────  test_artist             ✓
  SERVICE_PROVIDER   ────────  nothing                 ✗
  VENUE_MANAGER      ────────  nothing                 ✗
  TICKET_BUYER       ────────  nothing                 ✗

  seed_marketplace creates 9 users:
    4 artists · 3 vendors · 2 venues     → roles assigned: none
                                              │
                                        after this plan
                                              ▼
    4 × ARTIST · 3 × SERVICE_PROVIDER · 2 × VENUE_MANAGER
    plus one account carrying TICKET_BUYER
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-change) ➡️

Two pieces in this scope's map draw this plan.

**Subject: five gates, two keys.** The left half of the ASCII above.
[Piece 1](../diagram-prompts.md#piece-1-five-gates-two-keys-planned).
Save as `../diagrams/subject-01-five-gates-two-keys.png`. *(image not yet generated)*

**Subject: nine users, no role.** The seed half.
[Piece 2](../diagram-prompts.md#piece-2-nine-users-no-role-planned).
Save as `../diagrams/subject-02-nine-users-no-role.png`. *(image not yet generated)*

## Description: what to change

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Create a staff account so the admin can be opened at all. Make `seed_marketplace` assign each of its
nine users the role its resource type implies. Make sure something grants `TICKET_BUYER`. Then
confirm one assignment by hand in the admin, so the change is verified against the database rather
than against the diff.

## Purpose and goal

Navigation: ⬅️ [Description: what to change](#description-what-to-change) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Make every enforced role reachable by somebody.

**Goal.** A fresh seed produces at least one account per role, the nine marketplace users each carry
the right one, and re-running the seeds changes nothing.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/getting-in/plans/02-grant-every-role.md`

▶ **Next: [task 1.1](#1--make-the-admin-openable)**.

### 1. 🔐 Make the admin openable

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

This is a prerequisite nothing states. `[inferred]`

- [ ] **1.1 Create a staff account**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  python manage.py createsuperuser
  ```
  - Done when: the command reports `Superuser created successfully.`
  - Record the username you chose in this plan's Outputs table. Do not record the password.

▶ **Next: [task 2.1](#2--grant-the-roles-in-the-seeds)**.

### 2. 🌱 Grant the roles in the seeds

◀ **Needs: [task 1](#1--make-the-admin-openable)** and
[01's decision](01-settle-what-a-role-is.md#the-engagement-gate).

- [ ] **2.1 Give `seed_marketplace`'s nine users their role**
  - `backend/main/scheduling/management/commands/seed_marketplace.py` has no `Role` import and never
    touches `roles`. Its `_get_or_create_user` at line 182 is where a role belongs.
  - Map by the list the user came from, not by the username: `ARTISTS` → `ARTIST`, `VENDORS` →
    `SERVICE_PROVIDER`, `VENUES` → `VENUE_MANAGER`.
  - Use `Role.objects.get_or_create(name=Role.Names.X)` then `user.roles.add(role)`, matching what
    `seed_booking_workflow.py:226` already does. Never `set`, which would strip a role someone added.
  - Done when: re-running `python manage.py seed_marketplace` twice leaves the same roles and creates
    no duplicate `Role` rows.

- [ ] **2.2 Make something grant `TICKET_BUYER`**
  - No seed grants it and no dashboard is reachable without it.
  - Simplest honest option: give `test_organizer` the role in addition to `EVENT_ORGANIZER`, since a
    buyer and an organizer are the same person in a demo. If that is wrong, create one buyer account
    and say why in the commit.
  - Done when: an account exists that reaches `/dashboard/tickets`.

- [ ] **2.3 Re-seed and count**
  ```
  cd /home/molef/Work/attica/backend/main
  source /home/molef/lobola/bin/activate
  python manage.py seed_marketplace
  python manage.py shell -c "from users.models import Role, CustomUser; [print(r.name, CustomUser.objects.filter(roles=r).count()) for r in Role.objects.all()]"
  ```
  - Expected output: five rows, one per role, each with a count of at least 1.
  - ❌ A role with count 0 is a role still granted by nothing. That is the whole failure this plan
    exists to prevent, so do not proceed to [03](03-prove-it-and-write-it-down.md) with one.

▶ **Next: [instruction 4.1](#4--confirm-it-in-the-django-admin)**, because a count from the shell
proves rows exist and only the admin proves the join reads back the way the app will read it.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [instruction 4](#4--confirm-it-in-the-django-admin)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
  - A seed that creates users and silently assigns no role is worth a catalog entry: it fails as a
    permissions bug days later, nowhere near the seed.
- [ ] **Run the following prompt:** `/env-pulse @environment` — only if creating the staff account
      changed a fact in [the admin-site file](../../../../../environment/django-admin/the-admin-site.md),
      which currently says no seed creates one.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in`

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 3. 🖥️ Bring the backend up

◀ **Needs: [task 1](#1--make-the-admin-openable)**, so there is an account to log in with.

3.1 **Start Redis and the backend**
   - Follow [bringing the stack up § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up),
     terminals 1 and 2. Vite is not needed for this plan.
   - Expected result: `redis-cli ping` answers `PONG`, and the backend is serving on `:8000`.
   - ❌ The backend fails on its first cached read: Redis was not started first. Order matters.

▶ **Next: [instruction 4.1](#4--confirm-it-in-the-django-admin)**.

### 4. 🔎 Confirm it in the Django admin

◀ **Needs: [task 2](#2--grant-the-roles-in-the-seeds)** and
[instruction 3](#3--bring-the-backend-up).

4.1 **Open the admin on the right port**
   - Browser: `http://127.0.0.1:8000/admin/`. Not `localhost:5173/admin/`, which returns the React
     app's 404 and looks like the admin is missing.
   - Log in with the account from task 1.1.
   - Expected result: the admin index, listing the registered models.
   - ❌ "Please enter the correct username and password for a staff account": the account exists but
     `is_staff` is false. Re-run `createsuperuser`.

4.2 **Read one granted role back**
   - Click **Users** → search `seed_vendor_feast` → open it → scroll to the **Roles** box.
   - Expected result: `SERVICE_PROVIDER` is in the selected list.
   - ✅ Screenshot it. Save as `runbook/images/roles/01-vendor-role-in-admin.png`.
   - ❌ The box is empty: the seed ran but the assignment did not take. Check task 2.1 used `add` on
     the user that `get_or_create` returned, not on a fresh instance.

4.3 **Check a venue, because the mapping is the easy thing to get wrong**
   - Same path, search `seed_venue_atrium`.
   - Expected result: `VENUE_MANAGER`, not `SERVICE_PROVIDER`.
   - ❌ `SERVICE_PROVIDER`: task 2.1 mapped by username rather than by the seed's own list.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

This plan is done when the shell count in task 2.3 shows five roles each held by at least one user,
**and** two of those assignments have been read back in the admin by eye.

A passing count with an unchecked admin is not enough here: the count proves rows exist in a join
table, and the admin proves the join is the one the application reads.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| A staff account | recorded by username in task 1.1 | not started |
| Roles assigned in the marketplace seed | `backend/main/scheduling/management/commands/seed_marketplace.py` | not started |
| An account holding `TICKET_BUYER` | wherever task 2.2 put it | not started |
| Five-row role count | recorded in task 2.3 | not started |
| Admin screenshot, vendor role | `runbook/images/roles/01-vendor-role-in-admin.png` | slot open |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/getting-in/plans/02-grant-every-role.md` | task 0, before any work | Conformance and thin instructions reported |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Update the environment | `/env-pulse @environment` | the close out, if the admin fact changed | The staff-account fact matches reality |
| Bring the tree current | `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in` | the close out | Statuses and running order match reality |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the Django admin site](../../../../../environment/django-admin/the-admin-site.md): the port, the staff requirement, what the admin does not do.
- [seeding and resetting data](../../../../../runbook/preparing-the-data/seeding-and-resetting-data.md): the credentials table this scope later verifies.
- [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md): Redis first, then the backend.
- `backend/main/scheduling/management/commands/seed_booking_workflow.py:226`: the `get_or_create` plus `add` pattern to copy.
- `backend/main/scheduling/management/commands/seed_marketplace.py:182`: where the role assignment is missing.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

[03-prove-it-and-write-it-down.md](03-prove-it-and-write-it-down.md), which logs in as all five and
writes the runbook pair.

## Error Matrix

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet — populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| The admin returns the React app's 404 | Opening `http://localhost:5173/admin/` | The admin is on the backend port. Use `http://127.0.0.1:8000/admin/`. |
| "Please enter the correct username and password for a staff account" with correct credentials | The admin login, using a seeded account | Seeded accounts are `is_staff: False`. Make one with `createsuperuser`. |
| A user logs in fine and then fails every gate for their own kind | Any `seed_marketplace` account, before this plan | The seed creates users and assigns no role. Grant in the seed, not by hand. |
