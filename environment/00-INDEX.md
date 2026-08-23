# 🗺️ Environment: Attica

What is true about the system this work runs on. What to *do* about it lives in the
[runbook index](../runbook/00-INDEX.md), and what any of it *means* in the real world lives in the
[context index](../context/00-INDEX.md). This folder is only the facts.

Read [the overview](overview.md) first, always. It is the whole system in one pass. Then the row
below matching what you are about to touch.

## Before I...

| The moment | Read this | Because |
|---|---|---|
| run the app, or wonder why part of it is dead | [Overview § Execution model](overview.md#execution-model) | four processes, none of which starts or supervises another, and the missing one is silent |
| write a fetch, or debug a request that fails only sometimes | [Overview § Access paths](overview.md#access-paths) | two HTTP clients with no bridge: one goes through the Vite proxy, one hardcodes `127.0.0.1:8000` and needs CORS |
| touch anything about logging in, or a websocket that drops | [Overview § Auth](overview.md#auth) | tokens are unrevokable, and websockets authenticate by query parameter rather than by header |
| open the Django admin | [The Django admin site](django-admin/the-admin-site.md) | it is on the backend port, needs a staff account no seed creates, and its writes skip the service layer |
| make a provider bookable, run `materialize_availability_slots`, or work out why search is empty | [What makes a provider bookable](django-admin/scheduling-availability.md) | five rows have to line up, and the missing one returns an empty list rather than an error |
| trust `python manage.py test` | [Overview § Known gaps](overview.md#known-gaps--non-obvious-constraints) | two tests already fail, so a red run does not mean you broke something |

## The systems

| Folder | What you operate there | Leaves |
|---|---|---|
| [django-admin/](django-admin/) | the admin site: preparing scheduling data by hand | 2 |

How every fact here was established, with its date and its mark, is in [the provenance
table](provenance.md).

## Pictures

None yet. There is no `diagram-prompts.md` in this folder; the runtime topology is drawn instead in
[the scenes on how Attica actually works](../artifacts/scenes/how-attica-actually-works/).
