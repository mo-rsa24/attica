# Renames

Old path to new path, so a stale reference still resolves. Owned by `tidy-repo`.

| Old | New | When | Why |
|---|---|---|---|
| `plans/fixing-create-event/` | `plans/create-event-end-to-end/plans/fixing-create-event/` | 2026-08-23 | It became sub-scope 1 of the create-event-end-to-end parent rather than a sibling scope. Its relative links were re-levelled by two, its `@`-prefixed prompt paths rewritten, and its running-order table replaced with a pointer to the parent's. |
