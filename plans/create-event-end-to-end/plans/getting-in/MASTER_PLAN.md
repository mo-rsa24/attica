# Getting In

> **This scope's plans interleave with the parent's.** They are not done as a block. The one
> ordering that matters is the running-order table in [the parent master plan](../../MASTER_PLAN.md#running-order).
> The Plans list below is this folder's contents, not a sequence to follow top to bottom.

## Mission

Every role Attica enforces can be logged into and can reach its own side of the app, using
credentials written down in one place and known to work.

Five roles are gated on at both the API and the interface. Two of them are granted by a seed. The
other three are granted by nothing, so most of the product is unreachable by anyone.

---

## Objectives

1. **Make every gated role grantable and granted.** A role the code checks and no seed assigns is a
   feature nobody can reach.
2. **Settle which classification is authoritative.** `Role` and `CustomUser.user_type` are two
   systems with different values, and nothing says which one decides.
3. **Leave one verified credentials table and a login recipe per role**, so nobody has to read a
   seed command to find out how to log in.

---

## Goals

1. `SERVICE_PROVIDER`, `VENUE_MANAGER` and `TICKET_BUYER` are granted by a seed command rather than
   by hand.
2. The nine users created by `seed_marketplace` each carry the role their resource type implies.
   They currently carry none.
3. All five dashboards in the router render for the role that owns them: organizer, artist, service,
   venue, tickets.
4. The credentials table in the runbook carries every seeded account and no longer reads
   `unverified`.

---

## Expected Outcome

A person opens the login page five times, uses five different accounts from one table, and lands
somewhere different each time. Nothing has to be assigned by hand first.

---

## Definition of Done

- [ ] ⚠️ Each of the five roles logged into by hand at `http://localhost:5173/login`, reaching its
      own dashboard, with a screenshot per role saved under `runbook/images/roles/` `[owner: human]`
- [ ] ⚠️ A staff account created with `python manage.py createsuperuser`, used to open the Django
      admin at `http://127.0.0.1:8000/admin/`, with one role assignment made there by hand and read
      back to confirm it took `[owner: human]`
- [ ] The decision on `Role` versus `CustomUser.user_type` written into
      [the context folder](../../../../context/), because it is a question about what a word means
      and that is where meanings live
- [ ] The credentials table at
      [seeding and resetting data](../../../../runbook/preparing-the-data/seeding-and-resetting-data.md)
      verified, with `seed_vendor_petal`, `seed_venue_atrium` and `seed_venue_horizon` added
- [ ] Close out: `/ingest-error-pattern` for anything that bit, then
      `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in`

---

## Sub-Scopes

(none)

---

## Plans

This folder's contents. The order that matters is the
[parent's running order](../../MASTER_PLAN.md#running-order).

| Plan | What it does | Status |
|---|---|---|
| [01 Settle what a role is](plans/01-settle-what-a-role-is.md) | Decide which of the two classifications decides what a user may see, and write it into `context/` | ⚠️ not started |
| [02 Grant every role](plans/02-grant-every-role.md) | Create a staff account, make the seeds grant the three ungranted roles and give the nine marketplace users theirs | ⚠️ not started |
| [03 Prove it and write it down](plans/03-prove-it-and-write-it-down.md) | Log in as all five, screenshot each, then write the runbook pair and verify the credentials table | ⚠️ not started |

---

## Environment Context

Inherited from the parent. Environment and architecture facts live in
[the environment index](../../../../environment/00-INDEX.md). Read
[the overview](../../../../environment/overview.md) before running anything.

Two rows matter more here than anywhere else in the tree.
[The Django admin site](../../../../environment/django-admin/the-admin-site.md): it runs on the
backend port rather than the Vite port, only a user with `is_staff` can log in, and no seed creates
one. [What makes a provider bookable](../../../../environment/django-admin/scheduling-availability.md):
the seeded provider accounts this scope gives roles to are the same accounts that scope depends on.

---

## Runbook

The by-hand recipes live in [the runbook index](../../../../runbook/00-INDEX.md). This scope writes
back to [seeding and resetting data](../../../../runbook/preparing-the-data/seeding-and-resetting-data.md),
which owns the credentials table.

---

## Diagram Prompts

This scope's illustrated map is [diagram-prompts.md](diagram-prompts.md). It inherits the parent's
art direction, palette and glyph tiers exactly, and adds no vocabulary of its own.
