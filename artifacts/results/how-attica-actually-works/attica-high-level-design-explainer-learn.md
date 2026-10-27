# Learning Attica's parts on their own

Each part below has a walk in five stages: get it, read first, start it alone, poke it, tear it down. Its `/plumb` prompt sits in stage 4, and each walk ends back on [the scene](attica-high-level-design-explainer-scene.html). The build writes this file from `hld-diagram/references/learn-alone.json`, the concept cards and the code, so it is rewritten on every build. A walk marked draft has no entry yet, so its first steps find the install page and the docs.

## Try OpenStreetMap in its sandbox (draft)

Map tiles and geocoding (Nominatim), called straight from the browser. Nothing to start; it needs internet access.

Its card: [OpenStreetMap](/home/molef/Obsidian/Software/OpenStreetMap.md#where-to-learn-this).

### 1. Get it

[OpenStreetMap](/home/molef/Obsidian/Software/OpenStreetMap.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=nTt-l6-QQCc&t=0s "LizardTech, Getting Started with Nominatim: Geocoding & Reverse Geocoding, 0:00 to 1:12, Both directions, an address to a point and back, from OpenStreetMap ..."), [▶2](https://www.youtube.com/watch?v=29q5xkJ-YFE&t=0s "Try an API, OpenStreetMap, Geocoding data with the Nominatim OpenStreetMap API, 0:00 to 0:45, One Nominatim search request and the JSON it returns. Whole video."), [◆](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/01-tour-the-real-flow/plans/04-location-pricing-amenities.md "Location, Pricing, Amenities, projects/attica/event-creation, tour plan 04. Step 4's address search watched as a GET to nominatim.openstreetmap.org in DevToo...")</sub> is a service someone else runs, so there is nothing to install. Get a test account or API key from its developer pages, and keep the key in a secret store, never in the code.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then OpenStreetMap's documentation.

- [LizardTech, Getting Started with Nominatim: Geocoding & Reverse Geocoding, 0:00 to 1:12](https://www.youtube.com/watch?v=nTt-l6-QQCc&t=0s), from videos: look for Both directions, an address to a point and back, from OpenStreetMap data. Whole video.
- [Try an API, OpenStreetMap, Geocoding data with the Nominatim OpenStreetMap API, 0:00 to 0:45](https://www.youtube.com/watch?v=29q5xkJ-YFE&t=0s), from videos: look for One Nominatim search request and the JSON it returns. Whole video.
- [Location, Pricing, Amenities](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/01-tour-the-real-flow/plans/04-location-pricing-amenities.md), from our plans and chapters: look for projects/attica/event-creation, tour plan 04. Step 4's address search watched as a GET to nominatim.openstreetmap.org in DevTools, the flow's one external dependency.

### 3. Start it alone

There is no copy of OpenStreetMap to start. The practice target is its test or sandbox mode, called with the test key.

### 4. Poke it

Send it one request with the test key and read the reply. The /plumb prompt below walks OpenStreetMap one step at a time, with each command's real output.

```text
/plumb Learn OpenStreetMap on its own, then come back and see what it does in Attica.

Background
Attica uses OpenStreetMap, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#osm.
I have never driven OpenStreetMap by hand.
This walk starts a separate practice copy of its own, so Attica's own copy (Nominatim geocoding, map tiles) is never touched.

Objectives
1. Read the documentation listed under What to read, and find where OpenStreetMap gives a test account, sandbox or free tier.
2. Get a test key and keep it in a secret store, never in the code.
3. Send it one request with curl or a REST client, and read the reply field by field.
4. Compare that request with how Attica uses OpenStreetMap, listed under What is already known.
5. Open the scene again and say, for each fact listed below, where it shows in the reply.

What to read
- The OpenStreetMap card, /home/molef/Obsidian/Software/OpenStreetMap.md: its textbook pages, timed videos and our plans.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#osm: what OpenStreetMap does in Attica.
- LizardTech, Getting Started with Nominatim: Geocoding & Reverse Geocoding, 0:00 to 1:12, https://www.youtube.com/watch?v=nTt-l6-QQCc&t=0s: look for Both directions, an address to a point and back, from OpenStreetMap data. Whole video..
- Try an API, OpenStreetMap, Geocoding data with the Nominatim OpenStreetMap API, 0:00 to 0:45, https://www.youtube.com/watch?v=29q5xkJ-YFE&t=0s: look for One Nominatim search request and the JSON it returns. Whole video..
- Location, Pricing, Amenities, /home/molef/goal-setting/learning/projects/attica/event-creation/plans/01-tour-the-real-flow/plans/04-location-pricing-amenities.md: look for projects/attica/event-creation, tour plan 04. Step 4's address search watched as a GET to nominatim.openstreetmap.org in DevTools, the flow's one external dependency..

What is already known
- What it does: Map tiles and geocoding (Nominatim), called straight from the browser. Nothing to start; it needs internet access.
- Where the scene read that: frontend/src/ListingStep4.jsx (Nominatim) and components/MapComponent.jsx (tiles).
- It is reached from Attica web app: carries straight from the browser.

Rules
- Use only the practice copy. Never connect to Attica's own copy (Nominatim geocoding, map tiles), which holds its live data.
- Work in ~/playground/system-design/components/openstreetmap. Nothing there needs to survive.
- One step per message: read, then send one request with the test key, then read the reply.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the practice copy answering before going on.

What to hand back
- What the walk taught, written as the explanation in /home/molef/Obsidian/Software/OpenStreetMap.md, above Where to learn this, with the card itself left as it is.
- Everything the walk started, stopped with plumb's down, and a check showing nothing of it still running.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each fact under What is already known, where it showed on the practice copy, what is still unclear, and at most one question.

Done when I can say, without looking, how each fact under What is already known shows on the practice copy.
```

### 5. Tear it down

Stop what the walk started, then write what it taught into OpenStreetMap's card, above its Where to learn this section.

Back on the scene: [#osm](attica-high-level-design-explainer-scene.html#osm), or this walk on the page at [#osm-learn](attica-high-level-design-explainer-scene.html#osm-learn).

## Learn Vite dev server on its own (draft)

Serves the React app while developing and forwards /api, /vendors, /cart, /checkout and /ws to the Django backend.

Its card: [Vite dev server](/home/molef/Obsidian/Software/Vite.md#where-to-learn-this).

### 1. Get it

Draft: no install steps are written for [Vite dev server](/home/molef/Obsidian/Software/Vite.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=KCrXgy8qtjM&t=37s "Fireship, Vite in 100 Seconds, How Vite works, 0:37 to 1:01, Native ES modules served unbundled while developing, against the bundlers before it. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=KCrXgy8qtjM&t=91s "Fireship, the same video, Local development, 1:31 to 1:55, The dev server and its hot reload. Chapter-timed."), [◆](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md "The Vite proxy and CORS, projects/attica/event-creation, rebuild plan 13. The wizard wired to the backend three ways: broken cross-origin, fixed with CORS, m...")</sub> yet. The walk's first step finds its official install page and picks, in this order, a Windows application or VS Code extension, then a Docker image, then the WSL command, and the check that proves it installed.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then Vite dev server's documentation.

- [Fireship, Vite in 100 Seconds, How Vite works, 0:37 to 1:01](https://www.youtube.com/watch?v=KCrXgy8qtjM&t=37s), from videos: look for Native ES modules served unbundled while developing, against the bundlers before it. Chapter-timed.
- [Fireship, the same video, Local development, 1:31 to 1:55](https://www.youtube.com/watch?v=KCrXgy8qtjM&t=91s), from videos: look for The dev server and its hot reload. Chapter-timed.
- [The Vite proxy and CORS](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md), from our plans and chapters: look for projects/attica/event-creation, rebuild plan 13. The wizard wired to the backend three ways: broken cross-origin, fixed with CORS, made moot with Vite's proxy, and the dead /ws lane shown.
- [Connect frontend to backend, Postman first](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/03-connect-and-postman.md), from our plans and chapters: look for projects/attica/event-creation, rebuild plan 03. The React app on Vite reaching the Django API.

### 3. Start it alone

The walk works out the smallest copy of Vite dev server that runs on its own, on a port the system does not use.

### 4. Poke it

The /plumb prompt below walks Vite dev server one step at a time, with each command's real output.

```text
/plumb Learn Vite dev server on its own, then come back and see what it does in Attica.

Background
Attica uses Vite dev server, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#vite.
I have never driven Vite dev server by hand.
This walk starts a separate practice copy of its own, so Attica's own copy (localhost:5173) is never touched.

Objectives
1. Work out the smallest practice copy of Vite dev server that runs on its own: the package or container image it needs and nothing else from Attica, on a port or in a file Attica does not use, and start it.
2. Walk what it does one step per message, sending it one input at a time and watching what comes back.
3. Rebuild the part of Attica's use listed under What is already known on the practice copy, with its output visible.
4. Open the scene again and say, for each fact listed below, where it shows on the practice copy.

What to read
- The Vite dev server card, /home/molef/Obsidian/Software/Vite.md: its textbook pages, timed videos and our plans.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#vite: what Vite dev server does in Attica.
- Fireship, Vite in 100 Seconds, How Vite works, 0:37 to 1:01, https://www.youtube.com/watch?v=KCrXgy8qtjM&t=37s: look for Native ES modules served unbundled while developing, against the bundlers before it. Chapter-timed..
- Fireship, the same video, Local development, 1:31 to 1:55, https://www.youtube.com/watch?v=KCrXgy8qtjM&t=91s: look for The dev server and its hot reload. Chapter-timed..
- The Vite proxy and CORS, /home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/13-vite-proxy-and-cors.md: look for projects/attica/event-creation, rebuild plan 13. The wizard wired to the backend three ways: broken cross-origin, fixed with CORS, made moot with Vite's proxy, and the dead /ws lane shown..
- Connect frontend to backend, Postman first, /home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/03-connect-and-postman.md: look for projects/attica/event-creation, rebuild plan 03. The React app on Vite reaching the Django API..

What is already known
- What it does: Serves the React app while developing and forwards /api, /vendors, /cart, /checkout and /ws to the Django backend.
- Where the scene read that: frontend/vite.config.js lines 16 to 25, the proxy for /api, /vendors, /cart, /checkout and /ws.
- Attica's runbook (Bring the whole stack up) starts it with `cd /home/molef/Work/attica/frontend`, then `npm run dev`. These act on Attica itself, so they are for reading, never for running in this walk.
- It is reached from Attica web app: carries /api /cart /checkout /vendors /ws.
- It sends to Django backend: carries HTTP, and /ws with ?token=JWT.

Rules
- Use only the practice copy. Never connect to Attica's own copy (localhost:5173), which holds its live data.
- Work in ~/playground/system-design/components/vite-dev-server. Nothing there needs to survive.
- One step per message, with plumb's up, watch, send and down controls.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the practice copy answering before going on.

What to hand back
- What the walk taught, written as the explanation in /home/molef/Obsidian/Software/Vite.md, above Where to learn this, with the card itself left as it is.
- Everything the walk started, stopped with plumb's down, and a check showing nothing of it still running.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each fact under What is already known, where it showed on the practice copy, what is still unclear, and at most one question.

Done when I can say, without looking, how each fact under What is already known shows on the practice copy.
```

### 5. Tear it down

Stop what the walk started, then write what it taught into Vite dev server's card, above its Where to learn this section.

Back on the scene: [#vite](attica-high-level-design-explainer-scene.html#vite), or this walk on the page at [#vite-learn](attica-high-level-design-explainer-scene.html#vite-learn).

## Try Sentry in its sandbox (draft)

Receives the backend's error reports, only when SENTRY_DSN is set.

Its card: [Sentry](/home/molef/Obsidian/Software/Sentry.md#where-to-learn-this).

### 1. Get it

[Sentry](/home/molef/Obsidian/Software/Sentry.md#where-to-learn-this)<sub>[1](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=35 "System design big archive, 10 Essential Components of a Production Web Application, Monitoring tools such as Sentry, Grafana and Prometheus as one of the ten..."), [▶1](https://www.youtube.com/watch?v=qGghfAmxaGU&t=307s "Very Academy, Sentry Django Integration, Error Reporting, Sentry, 5:07 to 14:00, The SDK added to a Django project and an exception watched arriving as an is..."), [▶2](https://www.youtube.com/watch?v=DzhVEK65eYg&t=308s "Sentry, Sentry 101: Error Monitoring For Backend Applications, Configure SDK, 5:08 to 5:52, The SDK's setup from Sentry's own team, before data scrubbing, re...")</sub> is a service someone else runs, so there is nothing to install. Get a test account or API key from its developer pages, and keep the key in a secret store, never in the code.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then Sentry's documentation.

- [System design big archive, 10 Essential Components of a Production Web Application](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=35), from textbooks: look for Monitoring tools such as Sentry, Grafana and Prometheus as one of the ten components, storing logs and helping analyse them.
- [Very Academy, Sentry Django Integration, Error Reporting, Sentry, 5:07 to 14:00](https://www.youtube.com/watch?v=qGghfAmxaGU&t=307s), from videos: look for The SDK added to a Django project and an exception watched arriving as an issue. Chapter-timed.
- [Sentry, Sentry 101: Error Monitoring For Backend Applications, Configure SDK, 5:08 to 5:52](https://www.youtube.com/watch?v=DzhVEK65eYg&t=308s), from videos: look for The SDK's setup from Sentry's own team, before data scrubbing, releases and alerting. Chapter-timed.

### 3. Start it alone

There is no copy of Sentry to start. The practice target is its test or sandbox mode, called with the test key.

### 4. Poke it

Send it one request with the test key and read the reply. The /plumb prompt below walks Sentry one step at a time, with each command's real output.

```text
/plumb Learn Sentry on its own, then come back and see what it does in Attica.

Background
Attica uses Sentry, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#sentry.
I have never driven Sentry by hand.
This walk starts a separate practice copy of its own, so Attica's own copy (only when SENTRY_DSN is set) is never touched.

Objectives
1. Read the documentation listed under What to read, and find where Sentry gives a test account, sandbox or free tier.
2. Get a test key and keep it in a secret store, never in the code.
3. Send it one request with curl or a REST client, and read the reply field by field.
4. Compare that request with how Attica uses Sentry, listed under What is already known.
5. Open the scene again and say, for each fact listed below, where it shows in the reply.

What to read
- The Sentry card, /home/molef/Obsidian/Software/Sentry.md: its textbook pages, timed videos and our plans.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#sentry: what Sentry does in Attica.
- System design big archive, 10 Essential Components of a Production Web Application, /home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=35: look for Monitoring tools such as Sentry, Grafana and Prometheus as one of the ten components, storing logs and helping analyse them..
- Very Academy, Sentry Django Integration, Error Reporting, Sentry, 5:07 to 14:00, https://www.youtube.com/watch?v=qGghfAmxaGU&t=307s: look for The SDK added to a Django project and an exception watched arriving as an issue. Chapter-timed..
- Sentry, Sentry 101: Error Monitoring For Backend Applications, Configure SDK, 5:08 to 5:52, https://www.youtube.com/watch?v=DzhVEK65eYg&t=308s: look for The SDK's setup from Sentry's own team, before data scrubbing, releases and alerting. Chapter-timed..

What is already known
- What it does: Receives the backend's error reports, only when SENTRY_DSN is set.
- Where the scene read that: settings.py lines 247 to 257, skipped when SENTRY_DSN is unset.
- It is reached from Django backend: carries errors.

Rules
- Use only the practice copy. Never connect to Attica's own copy (only when SENTRY_DSN is set), which holds its live data.
- Work in ~/playground/system-design/components/sentry. Nothing there needs to survive.
- One step per message: read, then send one request with the test key, then read the reply.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the practice copy answering before going on.

What to hand back
- What the walk taught, written as the explanation in /home/molef/Obsidian/Software/Sentry.md, above Where to learn this, with the card itself left as it is.
- Everything the walk started, stopped with plumb's down, and a check showing nothing of it still running.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each fact under What is already known, where it showed on the practice copy, what is still unclear, and at most one question.

Done when I can say, without looking, how each fact under What is already known shows on the practice copy.
```

### 5. Tear it down

Stop what the walk started, then write what it taught into Sentry's card, above its Where to learn this section.

Back on the scene: [#sentry](attica-high-level-design-explainer-scene.html#sentry), or this walk on the page at [#sentry-learn](attica-high-level-design-explainer-scene.html#sentry-learn).

## Learn Django backend on its own (draft)

One Daphne process that answers the REST API and holds the WebSocket connections for chat and notifications.

Its card: [Django backend](/home/molef/Obsidian/Software/Django/Django.md#where-to-learn-this).

### 1. Get it

Draft: no install steps are written for Django backend yet. The walk's first step finds its official install page and picks, in this order, a Windows application or VS Code extension, then a Docker image, then the WSL command, and the check that proves it installed.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then Django backend's documentation.

- [Telusko, #9 Django tutorials, Model View Template in Django, Model View Template, 2:33 to 3:10](https://www.youtube.com/watch?v=GGkFg52Ot5o&t=153s), from videos: look for The three parts named and placed, after a chapter on separation of concerns. Chapter-timed.
- [Telusko, the same video, MVT vs MVC, 5:03 to 5:54](https://www.youtube.com/watch?v=GGkFg52Ot5o&t=303s), from videos: look for Where Django's template stands in for MVC's view and its view for MVC's controller. Chapter-timed.
- [Django basics, fit for purpose](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/02-django-basics.md), from our plans and chapters: look for projects/attica/event-creation, rebuild plan 02. Project against app, the urls-to-views-to-settings path, and runserver against daphne, for Attica's own backend.
- [Django, refreshed](/home/molef/goal-setting/learning/system-design/foundations/plans/06-django-refresher.md), from our plans and chapters: look for One model written and migrated into the corner shop's orders schema, with the Django admin as the diagram's admin client.

### 3. Start it alone

The walk works out the smallest copy of Django backend that runs on its own, on a port the system does not use.

### 4. Poke it

The /plumb prompt below walks Django backend one step at a time, with each command's real output.

```text
/plumb Learn Django backend on its own, then come back and see what it does in Attica.

Background
Attica uses Django backend, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#backend-inside.
I have never driven Django backend by hand.
This walk starts a separate practice copy of its own, so Attica's own copy (Daphne :8000, REST + WebSockets) is never touched.

Objectives
1. Work out the smallest practice copy of Django backend that runs on its own: the package or container image it needs and nothing else from Attica, on a port or in a file Attica does not use, and start it.
2. Walk what it does one step per message, sending it one input at a time and watching what comes back.
3. Rebuild the part of Attica's use listed under What is already known on the practice copy, with its output visible.
4. Open the scene again and say, for each fact listed below, where it shows on the practice copy.

What to read
- The Django backend card, /home/molef/Obsidian/Software/Django/Django.md: its textbook pages, timed videos and our plans.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#backend-inside: what Django backend does in Attica.
- Telusko, #9 Django tutorials, Model View Template in Django, Model View Template, 2:33 to 3:10, https://www.youtube.com/watch?v=GGkFg52Ot5o&t=153s: look for The three parts named and placed, after a chapter on separation of concerns. Chapter-timed..
- Telusko, the same video, MVT vs MVC, 5:03 to 5:54, https://www.youtube.com/watch?v=GGkFg52Ot5o&t=303s: look for Where Django's template stands in for MVC's view and its view for MVC's controller. Chapter-timed..
- Django basics, fit for purpose, /home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/02-django-basics.md: look for projects/attica/event-creation, rebuild plan 02. Project against app, the urls-to-views-to-settings path, and runserver against daphne, for Attica's own backend..
- Django, refreshed, /home/molef/goal-setting/learning/system-design/foundations/plans/06-django-refresher.md: look for One model written and migrated into the corner shop's orders schema, with the Django admin as the diagram's admin client..

What is already known
- What it does: One Daphne process that answers the REST API and holds the WebSocket connections for chat and notifications.
- Where the scene read that: one Daphne process serving main.asgi:application, holding the REST API (rest_framework in INSTALLED_APPS, JWT through rest_framework_simplejwt) and the WebSocket consumers (channels; chat/consumers.py, notifications/consumers.py). The chat consumer saves each message to SQLite before broadcasting it.
- Attica's runbook (Bring the whole stack up) starts it with `source /home/molef/lobola/bin/activate`, then `cd /home/molef/Work/attica/backend/main`, then `daphne -b 0.0.0.0 -p 8000 main.asgi:application`. These act on Attica itself, so they are for reading, never for running in this walk.
- It is reached from Vite dev server: carries HTTP, and /ws with ?token=JWT.
- It is reached from Attica web app: carries useAxios goes direct to 127.0.0.1:8000, needs CORS.
- It sends to Redis: carries channel layer, db 0 page cache, db 1.
- It sends to SQLite: carries Django ORM.
- It sends to Uploaded media: carries uploads up to 50 MB.
- It sends to Sentry: carries errors.

Rules
- Use only the practice copy. Never connect to Attica's own copy (Daphne :8000, REST + WebSockets), which holds its live data.
- Work in ~/playground/system-design/components/django-backend. Nothing there needs to survive.
- One step per message, with plumb's up, watch, send and down controls.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the practice copy answering before going on.

What to hand back
- What the walk taught, written as the explanation in /home/molef/Obsidian/Software/Django/Django.md, above Where to learn this, with the card itself left as it is.
- Everything the walk started, stopped with plumb's down, and a check showing nothing of it still running.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each fact under What is already known, where it showed on the practice copy, what is still unclear, and at most one question.

Done when I can say, without looking, how each fact under What is already known shows on the practice copy.
```

### 5. Tear it down

Stop what the walk started, then write what it taught into Django backend's card, above its Where to learn this section.

Back on the scene: [#backend-inside](attica-high-level-design-explainer-scene.html#backend-inside), or this walk on the page at [#backend-learn](attica-high-level-design-explainer-scene.html#backend-learn).

## Learn Uploaded media on its own (draft)

The files people upload, kept on disk under backend/main/media, up to 50 MB each.

### 1. Get it

Draft: no install steps are written for Uploaded media yet. The walk's first step finds its official install page and picks, in this order, a Windows application or VS Code extension, then a Docker image, then the WSL command, and the check that proves it installed.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then Uploaded media's documentation.

### 3. Start it alone

The walk works out the smallest copy of Uploaded media that runs on its own, on a port the system does not use.

### 4. Poke it

The /plumb prompt below walks Uploaded media one step at a time, with each command's real output.

```text
/plumb Learn Uploaded media on its own, then come back and see what it does in Attica.

Background
Attica uses Uploaded media, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#media.
I have never driven Uploaded media by hand.
This walk starts a separate practice copy of its own, so Attica's own copy (backend/main/media on disk) is never touched.

Objectives
1. Work out the smallest practice copy of Uploaded media that runs on its own: the package or container image it needs and nothing else from Attica, on a port or in a file Attica does not use, and start it.
2. Walk what it does one step per message, sending it one input at a time and watching what comes back.
3. Rebuild the part of Attica's use listed under What is already known on the practice copy, with its output visible.
4. Open the scene again and say, for each fact listed below, where it shows on the practice copy.

What to read
- There is no card for Uploaded media yet.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#media: what Uploaded media does in Attica.

What is already known
- What it does: The files people upload, kept on disk under backend/main/media, up to 50 MB each.
- Where the scene read that: MEDIA_ROOT in settings.py line 226; 50 MB cap at line 230.
- It is reached from Django backend: carries uploads up to 50 MB.

Rules
- Use only the practice copy. Never connect to Attica's own copy (backend/main/media on disk), which holds its live data.
- Work in ~/playground/system-design/components/uploaded-media. Nothing there needs to survive.
- One step per message, with plumb's up, watch, send and down controls.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the practice copy answering before going on.

What to hand back
- What the walk taught, as a new note for Uploaded media in the vault, per ~/.claude/VAULT_NOTE_FORMAT.md, after looking for one under every name it goes by.
- Everything the walk started, stopped with plumb's down, and a check showing nothing of it still running.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each fact under What is already known, where it showed on the practice copy, what is still unclear, and at most one question.

Done when I can say, without looking, how each fact under What is already known shows on the practice copy.
```

### 5. Tear it down

Stop what the walk started, then write what it taught as a new note for Uploaded media in the vault.

Back on the scene: [#media](attica-high-level-design-explainer-scene.html#media), or this walk on the page at [#media-learn](attica-high-level-design-explainer-scene.html#media-learn).

## Learn Redis on its own

An in-memory key-value store. A program names a key, Redis keeps its value in RAM, and the same server can also pass messages between programs.

Its card: [Redis](/home/molef/Obsidian/Software/Redis.md#where-to-learn-this).

### 1. Get it

[Redis](/home/molef/Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](/home/molef/goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with 'redis-...")</sub> runs in [Docker](/home/molef/Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](/home/molef/goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub> here, so get Docker Desktop for Windows from its download page, install it, and switch on WSL integration for your Ubuntu distro under Settings, Resources, WSL integration. Then check from inside WSL. In VS Code, the Redis for VS Code (publisher Redis) extension shows it without a separate window.

```bash
docker run --rm hello-world
```

It prints Hello from Docker!.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then Redis's documentation.

- [System design interview, chapter 4, Design a rate limiter, High-level architecture](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62), from textbooks: look for Works Redis as the counter store with its two commands: INCR adds one to a client's counter and EXPIRE sets a timeout that resets it, checked on every request.
- [System design big archive, The life of a Redis query](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318), from textbooks: look for Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only file of every command and periodic RDB snapshots.
- [Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s), from videos: look for Redis started in a Docker container and driven with its basic commands. Whole video.
- [ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s), from videos: look for What Redis is, before the chapters on persistence, scaling it and its common uses. Chapter-timed.
- [Redis cache-aside, and the stale price](/home/molef/goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md), from our plans and chapters: look for Redis in Docker Compose holding a product price for 60 seconds, read with `redis-cli TTL`, and the stale price it serves.
- [Redis as a cache](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/21-redis-cache.md), from our plans and chapters: look for Cache-aside on an availability search, with `redis-cli MONITOR` showing every command.
- [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/), from vendor: look for the WSL 2 backend requirement
- [Docker Desktop WSL 2 backend](https://docs.docker.com/desktop/features/wsl/), from vendor: look for where to switch integration on for your distro
- [Redis as an in-memory data store](https://redis.io/docs/latest/develop/get-started/data-store/), from vendor: look for SET, GET and the key names it uses
- [Redis pub/sub](https://redis.io/docs/latest/develop/pubsub/), from vendor: look for that a message reaches only the clients subscribed at that moment
- [MONITOR](https://redis.io/docs/latest/commands/monitor/), from vendor: look for that it prints every command the server receives, and slows the server

### 3. Start it alone

A practice copy on a port of its own, so the system's own copy is never touched. It prints PONG when it is up.

```bash
mkdir -p ~/playground/system-design/components/redis && cd $_
docker run -d --name learn-redis -p 6380:6379 redis:7
docker exec -it learn-redis redis-cli ping
```

### 4. Poke it

Type each one and compare what comes back. Then copy the /plumb prompt below and walk Redis one step at a time.

```bash
docker exec -it learn-redis redis-cli SET greeting hello EX 30
```
Prints OK. The key now holds the value, and EX 30 gives it 30 seconds to live.

```bash
docker exec -it learn-redis redis-cli TTL greeting
```
Prints a number counting down from 30. The seconds the key has left; -2 means it is already gone, -1 that it never expires.

```bash
docker exec -it learn-redis redis-cli SELECT 1
```
Prints OK. Redis has 16 numbered databases by default, and a system can keep different jobs in different ones; the scene's Redis level says which ones this system uses.

```bash
docker exec -it learn-redis redis-cli MONITOR
```
Prints OK, then one line per command any client sends. The way to watch a system's traffic on Redis live.

```text
/plumb Learn Redis on its own, then come back and see what it does in Attica.

Background
Attica uses Redis, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#redis-inside.
I have never driven Redis by hand.
This walk starts a separate practice copy in a container on port 6380, so Attica's own copy on 127.0.0.1:6379 is never touched.

Objectives
1. Check it is installed: Redis runs in Docker here, so get Docker Desktop for Windows from its download page, install it, and switch on WSL integration for your Ubuntu distro under Settings, Resources, WSL integration. Then check from inside WSL. The check is `docker run --rm hello-world`, which prints Hello from Docker!.
2. Start Redis 7 in Docker as learn-redis on port 6380, and confirm that redis-cli ping answers PONG.
3. Walk the basic commands one per message: SET and GET a string, EXPIRE and TTL on it, a hash with HSET and HGETALL, SCAN with a MATCH pattern, and SELECT to move between db 0 and db 1.
4. Walk publish and subscribe in three terminals: SUBSCRIBE in the first, PUBLISH in the second, and redis-cli MONITOR in the third showing every command as it arrives.
5. Act out Attica's own use of Redis, listed under What is already known, on the practice Redis, with MONITOR open so every command it sends is visible.
6. Open the scene again and say, for each key or group name listed below, what it holds and which line of Attica's code writes it.

What to read
- The Redis card, /home/molef/Obsidian/Software/Redis.md: its textbook pages, timed videos and our plans.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#redis-inside: what Redis does in Attica.
- System design interview, chapter 4, Design a rate limiter, High-level architecture, /home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62: look for Works Redis as the counter store with its two commands: INCR adds one to a client's counter and EXPIRE sets a timeout that resets it, checked on every request..
- System design big archive, The life of a Redis query, /home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318: look for Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only file of every command and periodic RDB snapshots..
- Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s: look for Redis started in a Docker container and driven with its basic commands. Whole video..
- ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s: look for What Redis is, before the chapters on persistence, scaling it and its common uses. Chapter-timed..
- Redis cache-aside, and the stale price, /home/molef/goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md: look for Redis in Docker Compose holding a product price for 60 seconds, read with `redis-cli TTL`, and the stale price it serves..
- Redis as a cache, /home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/21-redis-cache.md: look for Cache-aside on an availability search, with `redis-cli MONITOR` showing every command..
- Install Docker Desktop on Windows, https://docs.docker.com/desktop/setup/install/windows-install/: look for the WSL 2 backend requirement.
- Docker Desktop WSL 2 backend, https://docs.docker.com/desktop/features/wsl/: look for where to switch integration on for your distro.
- Redis as an in-memory data store, https://redis.io/docs/latest/develop/get-started/data-store/: look for SET, GET and the key names it uses.
- Redis pub/sub, https://redis.io/docs/latest/develop/pubsub/: look for that a message reaches only the clients subscribed at that moment.
- MONITOR, https://redis.io/docs/latest/commands/monitor/: look for that it prints every command the server receives, and slows the server.

What is already known
- Attica uses Redis db 0 on 127.0.0.1:6379 as its channel layer (backend/main/main/settings.py line 92).
- Its code calls group_add on 'notifications' (backend/main/locations/consumers.py line 9).
- Its code calls group_add on f'notifications_{self.user.id}' (backend/main/notifications/consumers.py line 22).
- Its code calls group_send on f'notifications_{recipient.id}' (backend/main/notifications/utils.py line 41).
- Its code calls group_add and group_send on f"chat_room_{self.room_id}" (backend/main/chat/consumers.py lines 71, 125).
- Its code calls group_send on group_name (a name passed in, not written here) (backend/main/chat/utils.py line 18).
- At build time db 0 held 74 keys, the sampled ones starting bull:, rq:; no Attica code writes the bull:, rq: keys.
- Attica uses Redis db 1 on 127.0.0.1:6379 as its cache (default) (backend/main/main/settings.py line 113).
- Its code calls cache.get and cache.set on key (a name passed in, not written here) (backend/main/scheduling/services.py lines 2948, 2950).
- Its code calls cache.get and cache.delete and cache.set on f"scheduling:webhook:{digest}:{suffix}" (backend/main/scheduling/services.py lines 2961, 2967, 2974, 2975, 3009, 3277, 3278, 3279, 3280).
- Its code calls cache.get and cache.set on f"user_{user.id}_permissions" (backend/main/users/utils.py lines 13, 28).
- Its code calls cache.delete on f"user_{user_id}_permissions" (backend/main/users/utils.py line 37).
- At build time db 1 held 0 keys.

Rules
- Use only the practice copy on port 6380. Never connect to Attica's own copy (127.0.0.1:6379), which holds its live data.
- Work in ~/playground/system-design/components/redis. Nothing there needs to survive.
- One step per message, with plumb's up, watch, send and down controls.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the output (PONG) before going on.

What to hand back
- What the walk taught, written as the explanation in /home/molef/Obsidian/Software/Redis.md, above Where to learn this, with the card itself left as it is.
- The practice copy removed with `docker rm -f learn-redis`, and `docker ps -a` showing it gone.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each name under What is already known what it holds, what is still unclear, and at most one question.

Done when I can say, without looking, what each name on the scene's Redis level holds and which line of Attica's code writes it.
```

### 5. Tear it down

Stop what the walk started, then write what it taught into Redis's card, above its Where to learn this section.

```bash
docker rm -f learn-redis
```

Back on the scene: [#redis-inside](attica-high-level-design-explainer-scene.html#redis-inside), or this walk on the page at [#redis-learn](attica-high-level-design-explainer-scene.html#redis-learn).

## Learn SQLite on its own (draft)

The one database file every app reads and writes through the Django ORM.

Its card: [SQLite](/home/molef/Obsidian/Software/SQLite.md#where-to-learn-this).

### 1. Get it

Draft: no install steps are written for [SQLite](/home/molef/Obsidian/Software/SQLite.md#where-to-learn-this)<sub>[1](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=109 "System design big archive, Databases, Places SQLite among the SQL databases beside Postgres and MySQL in the roadmap of database types."), [▶1](https://www.youtube.com/watch?v=p2tOmltUh34&t=0s "Database Dive, What is SQLite?, 0:00 to 0:52, What SQLite is, how it works with no server, and when to use it, in under a minute. Whole video."), [▶2](https://www.youtube.com/watch?v=8Xyn8R9eKB8&t=53s "Caleb Curry, SQLite Introduction, What + why SQLite3, 0:53 to 2:01, Why a file-backed database, then the sqlite3 shell, dot commands, DDL and DML in the chap..."), [◆](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/07-keys-and-ddl.md "Keys and DDL, projects/attica/event-creation, rebuild plan 07. Candidate keys found by hand, then the schema written as DDL and run in sqlite3.")</sub> yet. The walk's first step finds its official install page and picks, in this order, a Windows application or VS Code extension, then a Docker image, then the WSL command, and the check that proves it installed.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then SQLite's documentation.

- [System design big archive, Databases](/home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=109), from textbooks: look for Places SQLite among the SQL databases beside Postgres and MySQL in the roadmap of database types.
- [Database Dive, What is SQLite?, 0:00 to 0:52](https://www.youtube.com/watch?v=p2tOmltUh34&t=0s), from videos: look for What SQLite is, how it works with no server, and when to use it, in under a minute. Whole video.
- [Caleb Curry, SQLite Introduction, What + why SQLite3, 0:53 to 2:01](https://www.youtube.com/watch?v=8Xyn8R9eKB8&t=53s), from videos: look for Why a file-backed database, then the sqlite3 shell, dot commands, DDL and DML in the chapters that follow. Chapter-timed.
- [Keys and DDL](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/07-keys-and-ddl.md), from our plans and chapters: look for projects/attica/event-creation, rebuild plan 07. Candidate keys found by hand, then the schema written as DDL and run in sqlite3.
- [State that survives a restart](/home/molef/goal-setting/learning/ai-engineering/prototype-product-data-validation-end-to-end/plans/65-state-that-survives-a-restart.md), from our plans and chapters: look for An agent's state kept in a SQLite file so it survives a server restart.

### 3. Start it alone

The walk works out the smallest copy of SQLite that runs on its own, on a port the system does not use.

### 4. Poke it

The /plumb prompt below walks SQLite one step at a time, with each command's real output.

```text
/plumb Learn SQLite on its own, then come back and see what it does in Attica.

Background
Attica uses SQLite, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#sqlite-inside.
I have never driven SQLite by hand.
This walk starts a separate practice copy of its own, so Attica's own copy (backend/main/db.sqlite3) is never touched.

Objectives
1. Work out the smallest practice copy of SQLite that runs on its own: the package or container image it needs and nothing else from Attica, on a port or in a file Attica does not use, and start it.
2. Walk what it does one step per message, sending it one input at a time and watching what comes back.
3. Rebuild the part of Attica's use listed under What is already known on the practice copy, with its output visible.
4. Open the scene again and say, for each fact listed below, where it shows on the practice copy.

What to read
- The SQLite card, /home/molef/Obsidian/Software/SQLite.md: its textbook pages, timed videos and our plans.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#sqlite-inside: what SQLite does in Attica.
- System design big archive, Databases, /home/molef/Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=109: look for Places SQLite among the SQL databases beside Postgres and MySQL in the roadmap of database types..
- Database Dive, What is SQLite?, 0:00 to 0:52, https://www.youtube.com/watch?v=p2tOmltUh34&t=0s: look for What SQLite is, how it works with no server, and when to use it, in under a minute. Whole video..
- Caleb Curry, SQLite Introduction, What + why SQLite3, 0:53 to 2:01, https://www.youtube.com/watch?v=8Xyn8R9eKB8&t=53s: look for Why a file-backed database, then the sqlite3 shell, dot commands, DDL and DML in the chapters that follow. Chapter-timed..
- Keys and DDL, /home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/07-keys-and-ddl.md: look for projects/attica/event-creation, rebuild plan 07. Candidate keys found by hand, then the schema written as DDL and run in sqlite3..
- State that survives a restart, /home/molef/goal-setting/learning/ai-engineering/prototype-product-data-validation-end-to-end/plans/65-state-that-survives-a-restart.md: look for An agent's state kept in a SQLite file so it survives a server restart..

What is already known
- What it does: The one database file every app reads and writes through the Django ORM.
- Where the scene read that: DATABASES in settings.py line 156. Every app writes here through the Django ORM, including bookings, chat messages and the scheduling_outboxevent rows the worker reads.
- Attica's runbook (Reset the database completely) starts it with `source /home/molef/lobola/bin/activate`, then `cd /home/molef/Work/attica/backend/main`, then `mv db.sqlite3 db.sqlite3.bak`, then `python manage.py migrate`, then `python manage.py seed_marketplace`, then `python manage.py seed_booking_workflow`, then `python manage.py materialize_availability_slots --days 90`, then `python manage.py seed_e2e`. These act on Attica itself, so they are for reading, never for running in this walk.
- It is reached from Django backend: carries Django ORM.
- It is reached from Outbox worker: carries polls pending outbox rows, writes notification rows.

Rules
- Use only the practice copy. Never connect to Attica's own copy (backend/main/db.sqlite3), which holds its live data.
- Work in ~/playground/system-design/components/sqlite. Nothing there needs to survive.
- One step per message, with plumb's up, watch, send and down controls.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the practice copy answering before going on.

What to hand back
- What the walk taught, written as the explanation in /home/molef/Obsidian/Software/SQLite.md, above Where to learn this, with the card itself left as it is.
- Everything the walk started, stopped with plumb's down, and a check showing nothing of it still running.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each fact under What is already known, where it showed on the practice copy, what is still unclear, and at most one question.

Done when I can say, without looking, how each fact under What is already known shows on the practice copy.
```

### 5. Tear it down

Stop what the walk started, then write what it taught into SQLite's card, above its Where to learn this section.

Back on the scene: [#sqlite-inside](attica-high-level-design-explainer-scene.html#sqlite-inside), or this walk on the page at [#sqlite-learn](attica-high-level-design-explainer-scene.html#sqlite-learn).

## Learn Outbox worker on its own (draft)

Turns queued outbox rows into notifications and webhook calls, after the request that wrote them has finished.

Its card: [Outbox worker](/home/molef/Obsidian/Information Technology/System Design/Messaging/Outbox Pattern.md#where-to-learn-this).

### 1. Get it

Draft: no install steps are written for Outbox worker yet. The walk's first step finds its official install page and picks, in this order, a Windows application or VS Code extension, then a Docker image, then the WSL command, and the check that proves it installed.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then Outbox worker's documentation.

- [Confluent, What is the Transactional Outbox Pattern? | Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s), from videos: look for The problem the pattern exists for: a service that writes to its database and to the broker separately can do one without the other. Chapter-timed.
- [Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s), from videos: look for The pattern itself, before how its events reach Kafka and which tools process an outbox. Chapter-timed.
- [The outbox, the queue and the worker](/home/molef/goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md), from our plans and chapters: look for The corner shop's order and an "order placed" event written in one transaction, a relay publishing the event to RabbitMQ, and a worker that sends the email and acknowledges it, safe when it dies halfway.
- [The booking-request transaction](/home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/14-booking-request-transaction.md), from our plans and chapters: look for One click writes four rows atomically, the booking request, an audit log, an outbox event and a notification, and the outbox rows wait for a worker.

### 3. Start it alone

The walk works out the smallest copy of Outbox worker that runs on its own, on a port the system does not use.

### 4. Poke it

The /plumb prompt below walks Outbox worker one step at a time, with each command's real output.

```text
/plumb Learn Outbox worker on its own, then come back and see what it does in Attica.

Background
Attica uses Outbox worker, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#worker.
I have never driven Outbox worker by hand.
This walk starts a separate practice copy of its own, so Attica's own copy (manage.py run_outbox_worker) is never touched.

Objectives
1. Work out the smallest practice copy of Outbox worker that runs on its own: the package or container image it needs and nothing else from Attica, on a port or in a file Attica does not use, and start it.
2. Walk what it does one step per message, sending it one input at a time and watching what comes back.
3. Rebuild the part of Attica's use listed under What is already known on the practice copy, with its output visible.
4. Open the scene again and say, for each fact listed below, where it shows on the practice copy.

What to read
- The Outbox worker card, /home/molef/Obsidian/Information Technology/System Design/Messaging/Outbox Pattern.md: its textbook pages, timed videos and our plans.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#worker: what Outbox worker does in Attica.
- Confluent, What is the Transactional Outbox Pattern? | Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s: look for The problem the pattern exists for: a service that writes to its database and to the broker separately can do one without the other. Chapter-timed..
- Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s: look for The pattern itself, before how its events reach Kafka and which tools process an outbox. Chapter-timed..
- The outbox, the queue and the worker, /home/molef/goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md: look for The corner shop's order and an "order placed" event written in one transaction, a relay publishing the event to RabbitMQ, and a worker that sends the email and acknowledges it, safe when it dies halfway..
- The booking-request transaction, /home/molef/goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/14-booking-request-transaction.md: look for One click writes four rows atomically, the booking request, an audit log, an outbox event and a notification, and the outbox rows wait for a worker..

What is already known
- What it does: Turns queued outbox rows into notifications and webhook calls, after the request that wrote them has finished.
- Where the scene read that: scheduling/management/commands/run_outbox_worker.py, calling dispatch_outbox_events in scheduling/services.py.
- Attica's runbook (Bring the whole stack up) starts it with `source /home/molef/lobola/bin/activate`, then `cd /home/molef/Work/attica/backend/main`, then `python manage.py run_outbox_worker`. These act on Attica itself, so they are for reading, never for running in this walk.
- It sends to SQLite: carries polls pending outbox rows, writes notification rows.
- It sends to Webhook targets: carries signed POST.

Rules
- Use only the practice copy. Never connect to Attica's own copy (manage.py run_outbox_worker), which holds its live data.
- Work in ~/playground/system-design/components/outbox-worker. Nothing there needs to survive.
- One step per message, with plumb's up, watch, send and down controls.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the practice copy answering before going on.

What to hand back
- What the walk taught, written as the explanation in /home/molef/Obsidian/Information Technology/System Design/Messaging/Outbox Pattern.md, above Where to learn this, with the card itself left as it is.
- Everything the walk started, stopped with plumb's down, and a check showing nothing of it still running.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each fact under What is already known, where it showed on the practice copy, what is still unclear, and at most one question.

Done when I can say, without looking, how each fact under What is already known shows on the practice copy.
```

### 5. Tear it down

Stop what the walk started, then write what it taught into Outbox worker's card, above its Where to learn this section.

Back on the scene: [#worker](attica-high-level-design-explainer-scene.html#worker), or this walk on the page at [#worker-learn](attica-high-level-design-explainer-scene.html#worker-learn).

## Try Webhook targets in its sandbox (draft)

Where the outbox worker POSTs signed events. None are configured by default.

Its card: [Webhook targets](/home/molef/Obsidian/Information Technology/System Design/Messaging/Webhook.md#where-to-learn-this).

### 1. Get it

Webhook targets is a service someone else runs, so there is nothing to install. Get a test account or API key from its developer pages, and keep the key in a secret store, never in the code.

### 2. Read first

Before touching it: the card's own pages first (our textbooks, videos and plans), then Webhook targets's documentation.

- [Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s), from videos: look for Sends messages to a Discord channel through its webhook URL with plain `fetch`, a working webhook built on screen. Chapter-timed.
- [ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s), from videos: look for The mechanism, straight after the chapter on polling and long polling that it replaces. Chapter-timed.
- [The providers, the webhook, and one key](/home/molef/goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md), from our plans and chapters: look for The fake payment provider calls back to the corner shop's payment service by webhook, and a retried charge lands once even when the reply to the first attempt is lost.
- [Requirements, gates and environments on paper](/home/molef/goal-setting/learning/system-design/devops-and-deployment/plans/01-requirements-gates-and-environments.md), from our plans and chapters: look for A second service, `payments-webhook`, which a card processor calls to confirm payment, added to the requirements table and the environment matrix.

### 3. Start it alone

There is no copy of Webhook targets to start. The practice target is its test or sandbox mode, called with the test key.

### 4. Poke it

Send it one request with the test key and read the reply. The /plumb prompt below walks Webhook targets one step at a time, with each command's real output.

```text
/plumb Learn Webhook targets on its own, then come back and see what it does in Attica.

Background
Attica uses Webhook targets, and its high-level design scene opens it at /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#hooks.
I have never driven Webhook targets by hand.
This walk starts a separate practice copy of its own, so Attica's own copy (none configured by default) is never touched.

Objectives
1. Read the documentation listed under What to read, and find where Webhook targets gives a test account, sandbox or free tier.
2. Get a test key and keep it in a secret store, never in the code.
3. Send it one request with curl or a REST client, and read the reply field by field.
4. Compare that request with how Attica uses Webhook targets, listed under What is already known.
5. Open the scene again and say, for each fact listed below, where it shows in the reply.

What to read
- The Webhook targets card, /home/molef/Obsidian/Information Technology/System Design/Messaging/Webhook.md: its textbook pages, timed videos and our plans.
- The scene, /home/molef/Work/attica/artifacts/results/how-attica-actually-works/attica-high-level-design-explainer-scene.html#hooks: what Webhook targets does in Attica.
- Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s: look for Sends messages to a Discord channel through its webhook URL with plain `fetch`, a working webhook built on screen. Chapter-timed..
- ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s: look for The mechanism, straight after the chapter on polling and long polling that it replaces. Chapter-timed..
- The providers, the webhook, and one key, /home/molef/goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md: look for The fake payment provider calls back to the corner shop's payment service by webhook, and a retried charge lands once even when the reply to the first attempt is lost..
- Requirements, gates and environments on paper, /home/molef/goal-setting/learning/system-design/devops-and-deployment/plans/01-requirements-gates-and-environments.md: look for A second service, `payments-webhook`, which a card processor calls to confirm payment, added to the requirements table and the environment matrix..

What is already known
- What it does: Where the outbox worker POSTs signed events. None are configured by default.
- Where the scene read that: SCHEDULING_WEBHOOK_TARGETS = [] in settings.py line 239; delivery by urllib in _dispatch_webhooks_for_event.
- It is reached from Outbox worker: carries signed POST.

Rules
- Use only the practice copy. Never connect to Attica's own copy (none configured by default), which holds its live data.
- Work in ~/playground/system-design/components/webhook-targets. Nothing there needs to survive.
- One step per message: read, then send one request with the test key, then read the reply.
- Link every component, command and idea word on its first use in each reply to its concept card with the card's marks, per plumb's Linking section, and list the words with no card at the end.
- Stop after objective 1 and show the practice copy answering before going on.

What to hand back
- What the walk taught, written as the explanation in /home/molef/Obsidian/Information Technology/System Design/Messaging/Webhook.md, above Where to learn this, with the card itself left as it is.
- Everything the walk started, stopped with plumb's down, and a check showing nothing of it still running.

What you will see
- Along the way: each step's command and its real output, one per message.
- At the end: what was asked, the note's path, for each fact under What is already known, where it showed on the practice copy, what is still unclear, and at most one question.

Done when I can say, without looking, how each fact under What is already known shows on the practice copy.
```

### 5. Tear it down

Stop what the walk started, then write what it taught into Webhook targets's card, above its Where to learn this section.

Back on the scene: [#hooks](attica-high-level-design-explainer-scene.html#hooks), or this walk on the page at [#hooks-learn](attica-high-level-design-explainer-scene.html#hooks-learn).
