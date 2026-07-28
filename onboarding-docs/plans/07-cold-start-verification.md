# 🧪 Cold-Start Verification

## Description

Prove the setup guides (`guides/00-machine-setup.md`, `guides/backend-setup.md`, `guides/frontend-setup.md`) actually work when followed literally from a genuinely cold start: a machine with no WSL2, no Python, no Node, no Redis, no repo clone — not just no `venv/`/`node_modules/`. This is the step that turns "the docs are written" into "the docs are verified" before handing them to Mongezi.

**Note:** `00-machine-setup.md` was added after this plan was first written, to close a gap the original dry run would have missed — the backend/frontend guides only ever verified the "Python/Node/Redis already installed" path. Include it in the walkthrough; ideally on a machine (or fresh WSL distro via `wsl --unregister`) that has never had any of this tooling installed, since a machine that already has Python/Node/Redis can't actually test whether the install instructions work.

## Purpose

A guide that reads well can still fail in practice: a missing prerequisite, a stale command, an assumption about existing local state (a venv that already exists, environment variables already set, WSL2 already enabled). The only way to catch that is to run the guide exactly as written, on a clean environment, and fix whatever breaks. Doing this before the handoff means Mongezi's first experience with Attica isn't debugging someone else's onboarding doc.

## Goal

A dry run of all three guides end to end, from a state with no WSL2 distro provisioned (or a fresh distro), no `backend/venv/`, and no `frontend/node_modules/`, reaching the guides' own stated target states (backend serving `:8000` with a working REST call and WebSocket connection; frontend on `:5173`, logged in as `e2e-organizer`, real API + WebSocket data flowing) — with every deviation from the written guide corrected in the guide itself.

## Tasks

- [ ] ⚠️ Set aside a dedicated block of time for this (not squeezed into a gap) — open a fresh VS Code window against a clean copy of the repo
- [ ] ⚠️ Isolate the existing local state so the test is honestly cold, without losing current work
  - [ ] Prefer a genuinely bare machine or VM for this; if unavailable, at minimum unregister the WSL distro (`wsl --unregister Ubuntu`) so `00-machine-setup.md` is tested from scratch, not skipped
  - [ ] Move `backend/venv/` aside (or clone the repo fresh to a scratch location)
  - [ ] Move `frontend/node_modules/` aside (or use the fresh clone)
- [ ] ⚠️ Walk `guides/00-machine-setup.md` literally, step by step, command by command
  - [ ] Note any command that doesn't match what's printed (wrong path, wrong package name, stale version)
  - [ ] Note any expected-result claim that doesn't hold
  - [ ] Confirm the guide's own "Verify: ready for backend-setup.md" section passes (git, python3.12, node, npm, redis-cli all succeed)
- [ ] ⚠️ Walk `guides/backend-setup.md` literally, step by step, command by command
  - [ ] Note any command that doesn't match what's printed (wrong path, wrong package name, stale version)
  - [ ] Note any expected-result claim that doesn't hold
  - [ ] Run the guide's own Verify section (REST call, WebSocket connect, Redis ping)
- [ ] ⚠️ Walk `guides/frontend-setup.md` literally, step by step
  - [ ] Confirm the Vite proxy works untouched, as the guide claims
  - [ ] Log in with the seeded credentials and confirm the guide's "Verify Everything Works" checklist (tokens stored, authenticated API calls, token refresh, WebSocket connected)
- [ ] ⚠️ Fix every gap found directly in the guide files (not just in a side note) so the next run needs zero corrections
- [ ] ⚠️ Restore or discard the test environment; confirm the original working copy is untouched
- [ ] ⚠️ Mark this plan and the Attica "Project Setup" Todoist task done once a clean run succeeds with no corrections needed

## Engagement Instructions

**Task: Cold-start dry run**
```
Set aside a real block of time (this needs undivided attention, not a spare 10 minutes).
Open a fresh VS Code window on the Attica repo.
Move backend/venv/ and frontend/node_modules/ aside (or work from a fresh clone) so the
environment has nothing built yet. If possible, test guides/00-machine-setup.md on a
machine or WSL distro with no Python/Node/Redis installed at all — that's the only way
to actually verify the install instructions, not just the run instructions.
Follow /home/molef/Work/attica/onboarding-docs/guides/00-machine-setup.md exactly as
written, then guides/backend-setup.md, then guides/frontend-setup.md, typing every
command as printed.
Where a command fails or an "expected result" doesn't match, fix the guide file itself,
then re-run from that step to confirm the fix holds.
Finish by running through the guide's own Verify sections for machine setup, backend,
and frontend.
```

## Recommended skill
▶ `/run` (drive the app to confirm each step works) — alt: `/demonstrate` if you want the verification captured as evidence (terminal output, screenshots) rather than just a pass/fail.
