# 📊 Marp Slides Deck

## Description

Consolidate all explanatory slides from plans 02 (backend) and 03 (frontend) into a single, cohesive Marp deck. Each slide pair (backend + frontend) should be logically grouped and visually consistent.

## Purpose

Provide a presentation-ready artifact that can be handed to a new hire or used in a walkthrough. Slides should balance the "why" (design decisions) with the "what" (commands to run).

## Goal

Produce a single Marp markdown file (`onboarding-slides.md`) with ~15–20 slides covering:
1. Title + project overview
2. Architecture (REST + WebSocket, SQLite + Redis, JWT)
3–5. Backend setup (venv, install, migrate, seed, start)
6–8. Frontend setup (npm, Vite, proxy, auth)
9–12. Architecture deep-dives (WebSocket auth, REST vs WS, JWT refresh, wizard state machine)
13–15. Verification & next steps

All slides: consistent colors, fonts, code blocks; readable at 16:9 widescreen.

## Tasks

- [ ] ⚠️ Review all slide content from 02 and 03
  - [ ] Collect: backend-setup.md slides, frontend-setup.md slides from Marp decks
  - [ ] Check: consistent terminology, no duplication, logical flow

- [ ] ⚠️ Merge into single deck
  - [ ] Create master slide file: onboarding-docs/slides/onboarding-master-deck.md
  - [ ] Structure:
    - Slide 1: Title — "Attica Onboarding: From Zero to Running System"
    - Slide 2: Project Overview — what Attica is, key features
    - Slide 3: Architecture High-Level — REST API, WebSocket, SQLite, Redis, JWT
    - Slides 4–6: Backend Setup (venv, install, migrate, seed, start)
    - Slides 7–9: Frontend Setup (npm, Vite, proxy, auth)
    - Slides 10–13: Architecture Flows (WebSocket auth, REST vs WS, JWT refresh, wizard)
    - Slides 14–15: Verification & Next Steps (what to check, where to go from here)

- [ ] ⚠️ Polish & format
  - [ ] Marp theme (color scheme, fonts, code highlighting)
  - [ ] Consistent slide numbers, footer with "Attica Onboarding"
  - [ ] Code blocks: syntax highlighting for bash, JavaScript, Python
  - [ ] Diagrams: embed or link to diagrams from 04-architecture-diagrams

- [ ] ⚠️ Export formats
  - [ ] PDF: `marp onboarding-master-deck.md -o onboarding-slides.pdf`
  - [ ] HTML: `marp onboarding-master-deck.md -o onboarding-slides.html`
  - [ ] Keep .md source for future edits

## Engagement Instructions

**Task: Merge & consolidate slides**
```
Collect:
- Backend slides from onboarding-docs/slides/backend-setup.md (Marp format, 6–8 slides)
- Frontend slides from onboarding-docs/slides/frontend-setup.md (Marp format, 6–8 slides)
- Architecture diagrams from onboarding-docs/diagrams/ (4 diagrams)

Create a master Marp deck: onboarding-docs/slides/onboarding-master-deck.md

Structure:
--- (slide break in Marp)

# Attica Onboarding: From Zero to Running System

(Title slide + your name/date)

---

## What is Attica?

(1–2 slide overview: event marketplace, vendors, real-time messaging, etc.)

---

## Architecture Overview

(1 slide: REST + WebSocket, SQLite + Redis, JWT auth)

---

## Backend Setup

(Reuse slides 3–6 from backend-setup.md: venv, install, migrate, seed, start)

---

## Frontend Setup

(Reuse slides 3–6 from frontend-setup.md: npm, Vite, proxy, auth)

---

## How the System Works

(Insert 4 architecture diagrams from plan 04, 1 slide per diagram, with 2–3 sentence explanation)

---

## Verification Checklist

- [ ] Backend at localhost:8000 (open in browser, see JSON)
- [ ] Frontend at localhost:5173 (see login page)
- [ ] Login works (e2e-organizer / password)
- [ ] Can navigate app, see real data
- [ ] WebSocket connected (check Network → WS tab)

---

## Next Steps

- Read Chat.md for messaging system deep-dive
- Explore models in backend/main/<app>/models.py
- Run tests: pytest (backend), npm run test:e2e (frontend)
- Start a feature: pick a GitHub issue, branch, code, PR

---

Then format with Marp theme (https://marp.app/directives for theme options).
```

**Task: Polish & format**
```
Ensure Marp deck has:
- Title slide with date
- Consistent theme (--marp config at top of .md file; see https://marp.app/directives)
- Code blocks with syntax highlighting:
  \`\`\`bash
  source venv/bin/activate
  \`\`\`
- Diagrams embedded (Mermaid or images)
- Slide numbers enabled (paginate: true)
- Footer: "Attica Onboarding — [date]"

Example Marp header (at top of onboarding-master-deck.md):
---
marp: true
theme: gaia
size: 16:9
paginate: true
footer: 'Attica Onboarding — 2025'
---

Then test: \`marp onboarding-master-deck.md --preview\` or export to PDF/HTML.
```

## Recommended skill
— custom; no skill fits (deck consolidation + Marp formatting is manual work, suited for a human editor).
