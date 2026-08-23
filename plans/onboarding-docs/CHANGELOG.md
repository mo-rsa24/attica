# CHANGELOG: onboarding-docs

History of corrections to this scope. The plan and guide files themselves read in the
present tense; anything that used to be wrong is recorded here and nowhere else.

## 2026-08-14: plan-tree sync against repo evidence

**Statuses reconciled with what is actually on disk.** Plans 01, 02, and 03 had produced
their artifacts in commit `d53df63` (2026-07-28) but only plan 02 carried ticks, and those
ticks still had `⚠️ pending` markers beside them. Plans 01 and 03 read as not-started while
all six of their output files existed and were committed.

**Stale JWT facts corrected in plan 04 and plan 03.** Both carried numbers copied from an
earlier unpack output that never matched `backend/main/main/settings.py`:

| Claim | Was written | Verified in code |
|---|---|---|
| Access token lifetime | 5 minutes | 30 minutes (`settings.py:215`) |
| Refresh token lifetime | 24 hours | 7 days (`settings.py:216`) |
| Refresh endpoint the frontend calls | `/api/token/refresh/` | `/api/accounts/token/refresh/` (`AuthProvider.jsx:28`, `useAxios.js:37`) |
| localStorage layout | separate `access_token` / `refresh_token` keys | one `tokens` key holding `{ access, refresh }` (`AuthProvider.jsx:61`) |
| Vite proxied paths | `/api`, `/chat` | `/api`, `/vendors`, `/cart`, `/checkout`, `/ws` (`vite.config.js`) |
| Refresh behaviour | described as "automatic token rotation" | refresh only; `ROTATE_REFRESH_TOKENS` is `False` (`settings.py:217`) |

Verified by grep after the sweep: `grep -rn "token/refresh\|5 min\|24 h" plans/onboarding-docs/`
returns only the correct endpoint and no stale lifetimes.

**Correction table removed from `onboarding-source.md`.** Section 8, "Corrections to Prior
Unpack Output", narrated which earlier claims had been wrong. Every fact it carried is
already stated correctly in the body of the same document (§5.3 for lifetimes and the
`tokens` key, §6 for the refresh endpoint) and in `design-decisions.md`, so the section was
removed rather than kept as a second copy. Its content is the table above.

**Plan 07's origin note absorbed.** The plan carried a paragraph explaining that
`artifacts/notes/onboarding-a-new-developer/00-machine-setup.md` had been added after the plan was first written. The guide is
now simply part of the walkthrough the plan describes.

**Plan 06's scope corrected.** It named plans 01 through 05 as its input; the scope has
seven plans, and 06 and 07 carry task lines of their own.

**Backend install trap fixed during the cold-start walk.** `backend/requirements.txt` was a
stale pip-freeze snapshot that shadowed `backend/main/requirements.txt` and pulled OS
packages (`cloud-init`, `dbus-python`) into a fresh install. Removed in `d53df63`. This is
the only part of plan 07's dry run with evidence in the repo.
