# Renames

Old path to new path, so a stale reference in a notebook, an email, or a chat log still resolves.
Append-only, one dated section per sweep. Written by `tidy-repo`.

## 2026-08-22

Stage 4 of the `retrofit-repo` sweep. The artifact root did not exist before this sweep; it was
created here.

| Old path | New path | Check |
|---|---|---|
| `concept-scenes/attica-organizer-journey/` | `artifacts/scenes/how-attica-actually-works/attica-organizer-journey/` | 2 (folder named after the skill that made it) |
| `concept-scenes/attica-runtime-topology/` | `artifacts/scenes/how-attica-actually-works/attica-runtime-topology/` | 2 |
| `concept-scenes/attica-realtime-overlay/` | `artifacts/scenes/how-attica-actually-works/attica-realtime-overlay/` | 2 |
| `concept-scenes/event-wizard-machine/` | `artifacts/scenes/how-attica-actually-works/event-wizard-machine/` | 2 |
| `concept-scenes/scheduling-conflicts/` | `artifacts/scenes/how-attica-actually-works/scheduling-conflicts/` | 2 |
| `concept-scenes/attica-organizer-journey/shots/` | `artifacts/figures/how-attica-actually-works/organizer-journey-walkthrough/` | 1.5 (a set needs its own card) |
| `t1f1.png` | `artifacts/figures/how-attica-actually-works/request-and-socket-topology.png` | 1.4 (filename carried a slot label, not what it shows) |
| `j0.png` | deleted | duplicate: byte-identical to `shots/j0.png`, which moved with its scene |

**All of these were untracked, so plain `mv` was used and there is no git undo.** The one deletion,
`j0.png`, was a byte-identical duplicate confirmed by `md5sum`, and its twin survives in the set
directory above.

## 2026-08-23

Two structural corrections the sweep missed and the product owner caught: the plan scope was not
under `plans/`, and `docs/` had never been given a verdict.

| Old path | New path | Why |
|---|---|---|
| `onboarding-docs/` | `plans/onboarding-docs/` | It is a scope with a `MASTER_PLAN.md` and a `plans/` folder. `plans/` holds every plan file and master plan. |
| `docs/rebuild-handbook/` | `artifacts/notes/rebuilding-attica-from-first-principles/handbook/` | A written explainer: sixteen chapters teaching the concepts behind the system. |
| `docs/TECHNOLOGY-GAPS-AND-PRODUCTION-READINESS.md` | `artifacts/notes/what-stands-between-this-and-production/technology-gaps-and-production-readiness.md` | A written report on the production gap. |
| `docs/api_design_review.md` | `artifacts/notes/what-stands-between-this-and-production/api-design-review.md` | A written review of the API surface. |
| `docs/create_event_data_preparation.md` | `runbook/sources/create-event-data-preparation-guide-original.md` | A procedure followed by hand before driving the wizard, which is a runbook recipe. |

All five were tracked, so `git mv` was used and every move is recoverable.

**What stayed in `docs/`, and why it is not a finding.** `scheduling_webhook_contract.md` and
`scheduling_calendar_implementation_plan.md` are interface contracts: a payload shape another system
integrates against. That is not an artifact (it describes an interface, not a finding), not a
runbook recipe (nobody follows it by hand), and not a plan. `CLAUDE.md` now declares `docs/` as the
project's one override to the four-folder rule, holding contracts and nothing else.

**28 lines of stale bare paths were rewritten** across 11 files: prompts like
`/verify-plan @onboarding-docs/plans/...` and commands like
`npx marp-cli onboarding-docs/slides/...`. None of these are markdown links, so no link checker
would have caught them, and a prompt naming a file that no longer exists is worse than an absent
one because it still looks runnable.

## 2026-08-22

`concept-scenes/` was named after the `concept-scene` skill that produced its contents, which
`ARTIFACT_TREE_FORMAT.md` names explicitly as wrong at any depth: which tool drew a thing is not a
filing category. The provenance now lives in the grouping's card, as prose, which is the one place
it belongs.

## 2026-08-23

**`ENVIRONMENT.md` became `environment/`.** The single file was the old shape.
`ENVIRONMENT_CONTEXT_FORMAT.md` now defines a folder: an index keyed by the moment a session needs a
fact, `overview.md` carrying the six required sections, one folder per system operated in, and
`provenance.md` for the table that grows one row per verification.

| Old path | New path |
|---|---|
| `ENVIRONMENT.md` | `environment/overview.md` |
| `ENVIRONMENT.md` § Provenance | `environment/provenance.md` |

Every inbound reference across 28 files was rewritten, and a link check over the whole repository
resolves.

**The runbook gained activity groups.** Four themes at the top level had stopped saying anything as
a listing, so they moved under the kind of work being done. The index still points at an anchor
inside a file, so no reader browses the tree to find a recipe.

| Old path | New path |
|---|---|
| `runbook/bringing-the-stack-up.md` | `runbook/running-the-web-app/bringing-the-stack-up.md` |
| `runbook/running-the-tests.md` | `runbook/running-the-web-app/running-the-tests.md` |
| `runbook/seeding-and-resetting-data.md` | `runbook/preparing-the-data/seeding-and-resetting-data.md` |
| `runbook/driving-the-booking-flow.md` | `runbook/driving-the-app/driving-the-booking-flow.md` |
| `runbook/booking-test-guide-original.md` | `runbook/sources/booking-test-guide-original.md` |
| `runbook/preparing-data-for-the-wizard.md` | split: see below |

**The 555-line wizard guide was split three ways.** It explained the system and drove it in the same
breath, was indexed nowhere, and every command in it named a `/mnt/c/users/molef/playground/` path
that does not exist on this machine. Its facts became
`environment/django-admin/scheduling-availability.md` and
`environment/django-admin/the-admin-site.md`; its click paths became
`runbook/preparing-the-data/preparing-artist-availability.md` and
`runbook/driving-the-app/walking-the-event-wizard.md`; the original is kept verbatim at
`runbook/sources/create-event-data-preparation-guide-original.md` and listed in `runbook/sources.md`.

**The onboarding scope's output moved to `artifacts/`.** Guides, decks and procedure diagrams are
what that scope exists to hand over, so they are artifacts rather than plan content. The four
reference documents its own plans read from each other stayed, under the `source/` slot that
`PLAN_TREE_FORMAT.md` now names.

| Old path | New path |
|---|---|
| `plans/onboarding-docs/guides/*.md` | `artifacts/notes/onboarding-a-new-developer/` |
| `plans/onboarding-docs/slides/*.md` | `artifacts/decks/onboarding-a-new-developer/` |
| `plans/onboarding-docs/diagrams/*.md` | `artifacts/figures/onboarding-a-new-developer/` |
| `plans/onboarding-docs/{core-models,design-decisions,onboarding-source,setup-sequence}.md` | `plans/onboarding-docs/source/` |
