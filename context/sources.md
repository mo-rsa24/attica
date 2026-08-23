# 📚 Sources: Attica

Everything outside this repository that this folder draws on. Cited from provenance tables as
`sources.md § N`.

## 1. The event-creation flow map

**What it is.** A step-by-step recording of the event-creation wizard driven live in a browser on
2026-08-16: the click path, every background request with its method, endpoint, payload and status,
the backend handler as `file:line`, and the services each handler touches.

**Where it lives.** `/home/molef/goal-setting/learning/attica-event-creation/flow-map.md`, in the
learning journey about this repository. Outside this git repository and not under version control.

**Who wrote it.** Produced by an automated mapping session, reviewed by the product owner.

**How far to trust it.** Good on code location, and checked: 40 of its 41 `file:line` references
resolve to exactly the function or class it names. The remaining one is a filename written without
its app prefix and resolves elsewhere in the same document.

**One claim in it is wrong.** Step 0 states that `frontend/vite.config.js` has no `/ws` proxy rule
and that websockets are therefore dead in development. That rule has been in the file since
2026-01-27. Anything read from this document is worth a spot check against the repository before it
is marked verified.

**Read on** 2026-08-22.

## 2. The onboarding source documents

**What it is.** Four documents written for a developer joining the project cold: a consolidated
reference, the setup command sequence, the design decisions behind the architecture, and an entity
map of the core models.

**Where it lives.** `plans/onboarding-docs/` in this repository. Inside the repo rather than outside it,
registered here because this folder cites it and because it is a written account rather than code.

**How far to trust it.** Written by reading the codebase, not by driving the system. Its `Django
5.1` claim is wrong in four places; the version is 5.2.3.

**Read on** 2026-08-22.

## 3. The repository itself

**What it is.** `/home/molef/Work/attica` at commit `d53df63`.

**How far to trust it.** It is the system. Anything marked ✅ in this folder from a code read names
the file and line, and anything marked 🔍 was read out of the schema and confirmed by nobody.

**Read on** 2026-08-22.
