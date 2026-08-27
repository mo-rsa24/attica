# 📋 Prove It and Write It Down

Step 3 of 4 in this scope. Waits on [01](01-settle-what-a-role-is.md) and
[02](02-grant-every-role.md).
Next: this scope closes, once [04](04-close-the-open-door.md) has also landed.

## Table of contents

- [Position in the plan tree](#position-in-the-plan-tree)
- [Quick context: where you are](#quick-context-where-you-are)
- [Environment facts this plan depends on](#environment-facts-this-plan-depends-on)
- [Considerations](#considerations)
- [The claim](#the-claim)
- [Why this plan exists](#why-this-plan-exists)
- [What happens (visual)](#what-happens-visual)
- [Illustrations](#illustrations)
- [Description: what to produce](#description-what-to-produce)
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

Scope: [getting-in](../MASTER_PLAN.md). It is the plan that closes the scope, because this scope's
definition of done is a person logging in five times, not a diff.
[04](04-close-the-open-door.md) runs beside it and changes what the API allows, so if 04 lands after
this plan, instruction 3 gets run again.

The one ordering that matters across the tree is the
[parent's running order](../../../MASTER_PLAN.md#running-order).

## Quick context: where you are

Navigation: ⬅️ [Position in the plan tree](#position-in-the-plan-tree) | 📋 [TOC](#table-of-contents) | [Next](#environment-facts-this-plan-depends-on) ➡️

The roles are granted. Nobody has yet logged in as each of them and looked.

That gap matters more here than usual, because the seed and the interface read the join differently:
a role row can exist and the navbar still render nothing, and only a browser catches that.

This plan is also where the scope pays its debt to the runbook. Two recipes come out of it, and they
are cheapest to write while you are performing them.

## Environment facts this plan depends on

Navigation: ⬅️ [Quick context: where you are](#quick-context-where-you-are) | 📋 [TOC](#table-of-contents) | [Next](#considerations) ➡️

From [the environment overview](../../../../../environment/overview.md).

- **`CORS_ALLOWED_ORIGINS` names `http://localhost:5173` and `http://localhost:3000` only**
  (`backend/main/main/settings.py:140`). Vite binds 5174 when 5173 is taken. A login from 5174 fails
  on CORS and looks exactly like a wrong password. This is the trap that would waste this whole plan.
- Running Attica means four processes started by hand, in order, Redis first.
- Tokens live in `localStorage` under the key `tokens`.
- The five dashboards are `/dashboard/organizer`, `/dashboard/artist`, `/dashboard/service`,
  `/dashboard/venue`, `/dashboard/tickets` (`frontend/src/App.jsx:105-109`).

## Considerations

Navigation: ⬅️ [Environment facts this plan depends on](#environment-facts-this-plan-depends-on) | 📋 [TOC](#table-of-contents) | [Next](#the-claim) ➡️

**Check the port before anything else.**

Five failed logins on 5174 read as five broken accounts. The first instruction exists only to stop
that, and it is thirty seconds.

**Write each recipe as you perform it, not afterwards.**

The recipe is the deliverable. Performing five logins and writing them up tomorrow produces a
plausible recipe with the traps missing, because by tomorrow you have forgotten which ones you hit.

**Two recipes, not one.**

Walking it and proving it are different jobs for different moments. The first is for somebody who
needs to become a vendor today. The second is what you run after touching a seed, to find out
whether you broke somebody's way in.

## The claim

Navigation: ⬅️ [Considerations](#considerations) | 📋 [TOC](#table-of-contents) | [Next](#why-this-plan-exists) ➡️

Five screenshots and two recipes turn "the roles are granted" from a claim about a diff into a claim
about the running application, and leave the next person a way to check it in five minutes.

## Why this plan exists

Navigation: ⬅️ [The claim](#the-claim) | 📋 [TOC](#table-of-contents) | [Next](#what-happens-visual) ➡️

Everything in this scope so far is verifiable only by reading code. The parent scope's acceptance
test needs a provider who can log in and answer, and nothing has demonstrated that a provider can.

The runbook half exists because this failure recurs. Roles are the kind of thing a later seed change
silently breaks, and without a check to run, it gets discovered by someone trying to demo.

## What happens (visual)

Navigation: ⬅️ [Why this plan exists](#why-this-plan-exists) | 📋 [TOC](#table-of-contents) | [Next](#illustrations) ➡️

```
  check the port  ──▶  5173?  ──no──▶  stop. free it. CORS is bound to 5173.
        │ yes
        ▼
  log in ×5 ──▶ organizer ──▶ /dashboard/organizer   📷
             ──▶ artist    ──▶ /dashboard/artist     📷
             ──▶ vendor    ──▶ /dashboard/service    📷
             ──▶ venue     ──▶ /dashboard/venue      📷
             ──▶ buyer     ──▶ /dashboard/tickets    📷
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │ becoming-each-role.md         │  walk it
                     │ checking-every-role.md        │  prove it
                     │ credentials table, verified   │
                     └───────────────────────────────┘
```

## Illustrations

Navigation: ⬅️ [What happens (visual)](#what-happens-visual) | 📋 [TOC](#table-of-contents) | [Next](#description-what-to-produce) ➡️

This scope's capstone draws this plan's outcome: the five paths open rather than gated.

**Subject capstone: the way in, opened up.**
[The capstone](../diagram-prompts.md#the-way-in-opened-up-planned).
Save as `../diagrams/capstone-the-way-in-opened-up.png`. *(image not yet generated)*

## Description: what to produce

Navigation: ⬅️ [Illustrations](#illustrations) | 📋 [TOC](#table-of-contents) | [Next](#purpose-and-goal) ➡️

Log in as each of the five roles and land on five different dashboards, screenshotting each. Then
write two runbook recipes and correct the credentials table so it carries every seeded account and
no longer reads `unverified`.

## Purpose and goal

Navigation: ⬅️ [Description: what to produce](#description-what-to-produce) | 📋 [TOC](#table-of-contents) | [Next](#tasks) ➡️

**Purpose.** Prove the scope worked against the running application, and leave a way to re-prove it
in five minutes.

**Goal.** Five screenshots exist, two recipes exist and are listed in the runbook index, and the
credentials table carries every seeded account with no `unverified` mark.

## Tasks

Navigation: ⬅️ [Purpose and goal](#purpose-and-goal) | 📋 [TOC](#table-of-contents) | [Next](#instructions) ➡️

For Claude to execute. Ask Claude to do these.

### 0. 🧭 Preflight: check this plan before working from it

- [ ] **Run the following prompt:** `/verify-plan @plans/create-event-end-to-end/plans/getting-in/plans/03-prove-it-and-write-it-down.md`

▶ **Next: [instruction 2.1](#2--check-the-port-first)**, because everything this plan produces comes
out of a browser session, and the browser session has to be on the right port.

### 1. 📝 Write the two recipes and fix the table

◀ **Needs: [instruction 3](#3--log-in-as-all-five)**, because the recipes are written from what
actually happened, not from what the plan expected.

- [ ] **1.1 Run the following prompt:** `/drip-runbook becoming each of the five roles in Attica` —
      the walk-it recipe, written from the session you just performed.
  - Produces: `runbook/driving-the-app/becoming-each-role.md`, following `~/.claude/RUNBOOK_FORMAT.md`.
  - It must carry: the port check and why it exists, the five accounts, the dashboard each lands on,
    and the admin route for a role that needs setting by hand.
  - Done when: someone who has never logged in here can become a vendor without asking.

- [ ] **1.2 Run the following prompt:** `/drip-runbook checking every role still reaches its own
      dashboard after a seed changes` — the prove-it recipe.
  - Produces: `runbook/preparing-the-data/checking-every-role.md`.
  - It is the shorter one. Five logins, five expected landings, one line each, plus what a failure
    means: a missing role row, or a role granted that nothing reads.
  - Done when: it can be run in five minutes by someone who did not write it.

- [ ] **1.3 Correct the credentials table**
  - At [seeding and resetting data](../../../../../runbook/preparing-the-data/seeding-and-resetting-data.md),
    the table currently carries nine rows and is marked `unverified`.
  - Add the three missing accounts: `seed_vendor_petal`, `seed_venue_atrium`, `seed_venue_horizon`.
  - Add a column, or a note per row, naming the role each account holds after
    [02](02-grant-every-role.md).
  - Remove the `unverified` mark, because instruction 3 is what verifies it.
  - Then grep the table against the seed's own lists and confirm no account is missing:
    ```
    cd /home/molef/Work/attica
    grep -oE '"username": "[a-z_0-9]+"' backend/main/scheduling/management/commands/seed_marketplace.py | sed 's/.*: "//;s/"//' | sort > /tmp/seeded.txt
    grep -oE '`seed_[a-z_0-9]+`' runbook/preparing-the-data/seeding-and-resetting-data.md | tr -d '`' | sort -u > /tmp/documented.txt
    comm -23 /tmp/seeded.txt /tmp/documented.txt
    ```
  - Expected output: nothing. Any line printed is a seeded account the table does not mention.

- [ ] **1.4 Register both recipes in the runbook index**
  - Add each to [the runbook index](../../../../../runbook/00-INDEX.md) under its theme, phrased as
    the question it answers, with its "where you do it" and step count.
  - Done when: both are findable from the index without knowing the filename.

▶ **Next: [the close out](#close-out--record-what-this-plan-taught)**.

### Close out. 🔄 Record what this plan taught

◀ **Needs: [task 1](#1--write-the-two-recipes-and-fix-the-table)**.

- [ ] **Run the following prompt:** `/ingest-error-pattern` for anything that bit
  - The 5174 CORS trap belongs in the catalog whether or not it caught you this time.
- [ ] **Run the following prompt:** `/runbook-pulse @runbook` — this plan owes `runbook/` its pair
      and the pulse is what confirms both landed and are reachable from the index.
- [ ] **Run the following prompt:** `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in`
  - This is the sync that closes the scope, so its report should show all four plans ✅ and the
    scope ready to aggregate up to the parent.

▶ **Next: the engagement gate.**

## Instructions

Navigation: ⬅️ [Tasks](#tasks) | 📋 [TOC](#table-of-contents) | [Next](#the-engagement-gate) ➡️

For you to follow manually. Do these yourself.

### 2. 🔌 Check the port first

◀ **Needs: [task 0](#0--preflight-check-this-plan-before-working-from-it)**.

This is a prerequisite nothing states. `[inferred]`

2.1 **Bring the stack up and read the Vite banner**
   - Follow [bringing the stack up § 1](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md#1-bring-the-whole-stack-up).
     All four terminals.
   - Look at the Vite output. It prints the URL it bound.
   - Expected result: `➜  Local:   http://localhost:5173/`.
   - ✅ 5173: go to instruction 3.
   - ❌ 5174: stop. Find what holds 5173 (`ss -ltnp | grep 5173`), free it, restart Vite. Do not
     proceed on 5174: `CORS_ALLOWED_ORIGINS` does not name it, so every login fails with a CORS
     error that reads as a rejected password, and you would conclude the roles are broken.

▶ **Next: [instruction 3.1](#3--log-in-as-all-five)**.

### 3. 🚪 Log in as all five

◀ **Needs: [instruction 2](#2--check-the-port-first)** and
[02's engagement gate](02-grant-every-role.md#the-engagement-gate).

3.1 **Log in as the organizer**
   - `http://localhost:5173/login`, as `test_organizer` / `Test123!`.
   - Expected result: you land on the feed, and the navbar shows "Event Organizer". Then go to
     `/dashboard/organizer`.
   - ✅ Screenshot the dashboard. Save as `runbook/images/roles/02-organizer.png`.
   - ❌ The navbar shows no role: the interface is not reading what
     [01](01-settle-what-a-role-is.md) decided. Stop and reopen 01 rather than granting more things.

3.2 **Log in as the artist**
   - Log out, then log in as `test_artist` / `Test123!`. Go to `/dashboard/artist`.
   - ✅ Screenshot. Save as `runbook/images/roles/03-artist.png`.

3.3 **Log in as the vendor**
   - Log out, then `seed_vendor_feast` / `seed_pass_123!`. Go to `/dashboard/service`.
   - Expected result: the service-provider dashboard renders, not a redirect or an empty page.
   - ✅ Screenshot. Save as `runbook/images/roles/04-vendor.png`.
   - ❌ Redirected away or the page is empty: the role row exists (02 proved it in the admin) but the
     route guard reads something else. Note exactly what the guard checked and carry it into 01's
     context entry, because it means the decision written there is wrong.

3.4 **Log in as the venue manager**
   - Log out, then `seed_venue_atrium` / `seed_pass_123!`. Go to `/dashboard/venue`.
   - ✅ Screenshot. Save as `runbook/images/roles/05-venue.png`.

3.5 **Log in as the ticket buyer**
   - Log out, then whichever account [task 2.2 of plan 02](02-grant-every-role.md#2--grant-the-roles-in-the-seeds)
     gave `TICKET_BUYER`. Go to `/dashboard/tickets`.
   - ✅ Screenshot. Save as `runbook/images/roles/06-ticket-buyer.png`.

3.6 **Write down every trap you hit, now**
   - Anything that surprised you in 3.1 to 3.5, in your own words, in a scratch note.
   - This is the raw material for [task 1.1](#1--write-the-two-recipes-and-fix-the-table) and it is
     gone by tomorrow.

▶ **Next: [task 1.1](#1--write-the-two-recipes-and-fix-the-table)**.

## The engagement gate

Navigation: ⬅️ [Instructions](#instructions) | 📋 [TOC](#table-of-contents) | [Next](#outputs--deliverables) ➡️

This plan is done when five screenshots exist showing five different dashboards, and both recipes
are written and reachable from the runbook index.

Five successful logins with no recipe written leaves the scope undone, because the parent's
definition of done asks every sub-scope for its pair, and because the next person to break this will
have nothing to run.

## Outputs / Deliverables

Navigation: ⬅️ [The engagement gate](#the-engagement-gate) | 📋 [TOC](#table-of-contents) | [Next](#orchestration) ➡️

| What | Where | State |
|---|---|---|
| Five dashboard screenshots | `runbook/images/roles/02-organizer.png` through `06-ticket-buyer.png` | slots open |
| The walk-it recipe | `runbook/driving-the-app/becoming-each-role.md` | not started |
| The prove-it recipe | `runbook/preparing-the-data/checking-every-role.md` | not started |
| Verified credentials table, twelve accounts | `runbook/preparing-the-data/seeding-and-resetting-data.md` | not started |
| Both recipes in the index | `runbook/00-INDEX.md` | not started |

## Orchestration

Navigation: ⬅️ [Outputs / Deliverables](#outputs--deliverables) | 📋 [TOC](#table-of-contents) | [Next](#references) ➡️

| Step | Command | Triggered by | Outcome |
|---|---|---|---|
| Check the plan | `/verify-plan @plans/create-event-end-to-end/plans/getting-in/plans/03-prove-it-and-write-it-down.md` | task 0, before any work | Conformance and thin instructions reported |
| Write the recipes | `/drip-runbook <the recipe>` | tasks 1.1 and 1.2 | Two recipes to `RUNBOOK_FORMAT.md` |
| Capture patterns | `/ingest-error-pattern` | the close out, after any red run | Errors added to catalogs |
| Land the recipes | `/runbook-pulse @runbook` | the close out | Both are reachable from the index |
| Close the scope | `/sync-plan-tree @plans/create-event-end-to-end/plans/getting-in` | the close out | All four plans ✅, ready to aggregate to the parent |

## References

Navigation: ⬅️ [Orchestration](#orchestration) | 📋 [TOC](#table-of-contents) | [Next](#next-step) ➡️

- [the environment overview](../../../../../environment/overview.md): the CORS ports, the four processes, where tokens live.
- [bringing the stack up](../../../../../runbook/running-the-web-app/bringing-the-stack-up.md): all four terminals, in order.
- [seeding and resetting data](../../../../../runbook/preparing-the-data/seeding-and-resetting-data.md): the credentials table this plan corrects.
- [the runbook index](../../../../../runbook/00-INDEX.md): where both new recipes get registered.
- `frontend/src/App.jsx:105-109`: the five dashboard routes.
- `backend/main/main/settings.py:140`: `CORS_ALLOWED_ORIGINS`, and why 5174 fails.

## Next step

Navigation: ⬅️ [References](#references) | 📋 [TOC](#table-of-contents) | [Next](#error-matrix) ➡️

This scope closes. The parent's running order goes on to the domain plane, which starts at
[one-booking-truth](../../../MASTER_PLAN.md#sub-scopes) once
[fixing-create-event](../../fixing-create-event/MASTER_PLAN.md) is also green.

## Error Matrix

Navigation: ⬅️ [Next step](#next-step) | 📋 [TOC](#table-of-contents)

### From global catalog

(nothing yet — populated by `/ingest-error-pattern`)

### From project catalog

| Error | Where it bit | Fix |
|---|---|---|
| Every login is rejected and the Console shows a CORS error | The browser, when Vite bound 5174 | `CORS_ALLOWED_ORIGINS` names 5173 and 3000 only. Free 5173 and restart Vite before doing anything else. |
| A dashboard route redirects away for a user who demonstrably holds the role | The browser, after the role was confirmed in the admin | The route guard reads a different classification than the one granted. This means plan 01's decision is wrong; reopen it. |
