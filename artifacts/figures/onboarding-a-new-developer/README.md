# Onboarding a new developer: the procedure diagrams

Two Mermaid flowcharts showing the shape of each setup process at a glance: where it forks, and
where it can be skipped. They sit beside the guides in [the onboarding
notes](../../notes/onboarding-a-new-developer/).

## What is in here

Two Mermaid sources, in markdown. They render in any Mermaid-aware viewer; nothing has been
exported to an image.

## The diagrams

### backend-setup-procedure

**What it shows**

Fresh clone to a running Django server, with the two fork points drawn as decisions: which shell you
activate the virtual environment in, and whether you seed test data.

**How we got this**

Produced by `/visualize-procedure` from the scope's source documents, then read back against the
guide it accompanies.

**What it lets you say**

Which steps are unconditional and which depend on a choice, without reading the guide.

**What it cannot say**

It shows the happy path only. What goes wrong at each step is in the guide, not here.

### frontend-setup-procedure

**What it shows**

The same for the frontend: install, configure, run, and where the proxy enters.

**How we got this**

The same route.

**What it cannot say**

The same limit: no failure branches.
