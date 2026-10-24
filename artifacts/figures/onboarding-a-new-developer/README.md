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

The same for the frontend: install, configure, run, and where the [proxy](../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Reverse%20Proxy.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=397 "System design big archive, Forward proxy versus reverse proxy, The two side by side: a forward proxy acts for users (protecting them, blocking sites, caching..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=18 "Grokking the system design interview, section 15, Proxy server, Open, anonymous and transparent proxies, then the reverse proxy that fetches from servers and..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=312 "System design big archive, Load balancers vs API gateways vs reverse proxy, How a reverse proxy overlaps with a load balancer and an API gateway, and how the..."), [▶1](https://www.youtube.com/watch?v=B2G49HZxnRE&t=300s "Hussein Nasser, The Anatomy of a Proxy Server, Connection Establishment with an HTTP Proxy, 5:00 to 15:22, Traces one connection through an HTTP proxy, after..."), [▶2](https://www.youtube.com/watch?v=4NB0NDtOwIQ&t=132s "ByteByteGo, Proxy vs Reverse Proxy (Real-world Examples), Reverse Proxy, 2:12 to 4:15, The reverse proxy after the forward and transparent proxy chapters. Ch..."), [◆](../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/13-dev-under-compose-with-nginx.md "Dev under Compose, with Nginx in front, system-design/devops-and-deployment, plan 13. Nginx serves `/static/` itself and forwards `/api/` to the app containe...")</sub> enters.

**How we got this**

The same route.

**What it cannot say**

The same limit: no failure branches.
