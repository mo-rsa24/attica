# How does Attica actually work, at the level of its running parts?

This pile answers what runs when Attica runs and which part talks to which. The current answer is ten
parts on one machine: a React app in the browser, the Vite dev server, one Django backend under
Daphne, Redis, SQLite, a media folder on disk, the outbox worker, and three outside services, two of
which only receive traffic when a setting turns them on.

## What is in here

One high-level design diagram (the current version and each dated version), and the spec file it is
drawn from.

## The high-level design

### attica-high-level-design-explainer

![](attica-high-level-design-explainer.svg)

**What it shows**

Ten boxes, read left to right from the browser to the data. The colour and the small word on top of
each box say what kind of part it is (client, dev proxy, backend, data store, cache, worker, third
party), and a logo marks every box that is a named product. A solid arrow is a request that waits for
an answer, a dashed arrow is asynchronous, and a dotted arrow only carries traffic when a setting
enables it. The two arrows leaving the web app are the two ways it reaches the backend: through the
Vite proxy, and straight to `127.0.0.1:8000` from `useAxios`.

**How we got this image**

We read `environment/overview.md` and checked each part against the code on 2026-10-24:
`frontend/package.json`, `frontend/vite.config.js`, `backend/main/main/settings.py`, the chat and
notification consumers, `scheduling/management/commands/run_outbox_worker.py` and the outbox dispatch
in `scheduling/services.py`. The parts and arrows were written into
`attica-high-level-design-explainer.json` and drawn by the `hld-diagram` skill's
`draw_hld.py`, which inlines the product logos from Simple Icons 13.21.0. The same picture is
published as a private page at https://claude.ai/artifact/GLg4UBzHQCdY4U9kteM4po, whose closed
disclosure lists the file and line behind every box.

**What it lets you say**

Attica runs as four hand-started processes (Redis, the Daphne backend, the Vite dev server, the
outbox worker) around one SQLite file, with Redis carrying both the websocket channel layer (db 0)
and the page cache (db 1).

**What it cannot say**

It shows the local development stack only; nothing here is deployed. The REST API, the WebSocket
consumers and the Django admin share the one backend box, so it cannot show which of them a request
reaches. It does not show that the booking-request path writes its notification row without pushing
it to the channel layer; that gap is in `environment/overview.md` under known gaps. Webhook targets are
drawn because the delivery code exists, but `SCHEDULING_WEBHOOK_TARGETS` is empty by default. Stripe
has no box because the code only mentions it in comments.

**Where it came from and what judged it**

Built from the repository at commit a85cc0c plus its uncommitted working tree. No review file judged
it.

**Held since 2026-10-24.** Draws the system `environment/overview.md` describes in words; kept until a
one-line link to it lands in that file's index under "Pictures", which this filing was not allowed to
write.

### Versions

Each time a part is added or removed, the diagram is redrawn from the spec file and the new picture
is kept here with its date, so the build's growth stays visible.

**2026-10-24: first version**

![](attica-high-level-design-explainer__2026-10-24.svg)

Ten boxes and ten arrows, drawn from the repository as it stood that day.
