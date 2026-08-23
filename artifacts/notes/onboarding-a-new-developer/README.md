# Onboarding a new developer

The written guides that take somebody with Django and React experience, and no knowledge of Attica,
from a machine with nothing installed to a seeded running stack in one sitting.

Produced by the scope at [../../../plans/onboarding-docs/](../../../plans/onboarding-docs/). The
slide decks that accompany them are in
[../../decks/onboarding-a-new-developer/](../../decks/onboarding-a-new-developer/) and the procedure
diagrams in [../../figures/onboarding-a-new-developer/](../../figures/onboarding-a-new-developer/).

## What is in here

Three guides, meant to be followed in this order.

## The guides

### 00-machine-setup

**What it shows**

Everything that must exist before either half of the stack can be set up: Python, Node, Redis, git,
and the checks that prove each one is there.

**How we got this**

Written from the repository's own requirements and the environment facts in
[../../../environment/overview.md](../../../environment/overview.md), then partially walked. The
cold-start verification that would prove it end to end is
[plan 07](../../../plans/onboarding-docs/plans/07-cold-start-verification.md), which has not been
completed.

**What it lets you say**

What a machine needs, and how to tell whether it has it.

**What it cannot say**

Whether the sequence works on Windows or macOS. It was written against WSL2 and nothing else has
been tried.

### backend-setup

**What it shows**

Clone to a Django server answering on `localhost:8000` with websockets working, including the venv,
the migrations, and why Daphne rather than `runserver`.

**How we got this**

Written by hand from `source/setup-sequence.md` in the same scope, which was extracted from the
codebase at commit `2ea72d0`.

**What it lets you say**

The order the steps go in, and what each one should print.

**What it cannot say**

Whether a fresh clone reproduces it. Nobody has run it on a machine that did not already work.

### frontend-setup

**What it shows**

Clone to a Vite dev server on `localhost:5173` talking to the backend, including the proxy.

**How we got this**

Written by hand from the same source document.

**What it cannot say**

Its proxy section is incomplete: the app has two HTTP clients, one going through the proxy and one
hardcoding `http://127.0.0.1:8000`, and the guide describes only the first. The gap is recorded as
open work in
[plan 03](../../../plans/onboarding-docs/plans/03-frontend-setup-docs.md).
