# 🎨 Frontend Setup Documentation

## Description

Create step-by-step setup documentation for the React/Vite/MUI frontend: Node/npm installation, Vite dev server, backend proxy configuration, and first successful login. Pair with visuals.

## Purpose

Enable a new developer to set up the frontend independently and verify it can talk to the backend. Target: frontend running at `localhost:5173` with auth working.

## Goal

Produce:
1. Procedure diagram (fork/join): npm install → Vite start → proxy config → login flow
2. Marp slide deck: 1 title + 1 per step (Node/npm, Vite, proxy, first login, verification)
3. Markdown text guide: step-by-step instructions, command blocks, Vite proxy explanation, auth flow walkthrough

## Tasks

- [ ] ⚠️ Create procedure diagram (fork/join)
  - [ ] Input: frontend/ directory exists, Node 16+ installed
  - [ ] Step 1: npm install (from package.json)
  - [ ] Step 2: Configure Vite (vite.config.js with /api proxy)
  - [ ] Step 3: Start Vite dev server (npm run dev, port 5173)
  - [ ] Step 4: Open browser, login as e2e-organizer / E2eOrganizerPass!23
  - [ ] Step 5: Verify auth (token stored in localStorage, axios interceptor working)
  - [ ] Output: Frontend running, user logged in, can see API data
  - [ ] Tool: flowspec or visualize-procedure

- [ ] ⚠️ Create Marp slide deck (6–8 slides)
  - [ ] Slide 1: Title — "Frontend Setup: React 19 + Vite + MUI"
  - [ ] Slide 2: Architecture overview (why React, why Vite, why Material-UI)
  - [ ] Slide 3: Node/npm (what npm is, why package-lock.json, command)
  - [ ] Slide 4: Vite dev server (what Vite does, HMR, port 5173)
  - [ ] Slide 5: Backend proxy (why Vite proxies /api to :8000, CORS, how it works)
  - [ ] Slide 6: Auth & JWT (login flow, token storage, Axios interceptor)
  - [ ] Slide 7: Verification (check :5173 loads, login works, API calls succeed)
  - [ ] Tool: progress-brief (novice mode)

- [ ] ⚠️ Create markdown text guide
  - [ ] Sections: Prerequisites | npm Install | Vite Configuration | Dev Server | First Login | Troubleshooting
  - [ ] Include: localhost URLs, exact commands, expected outputs
  - [ ] Include: explanation of vite.config.js proxy (why it's needed, what it does)
  - [ ] Include: auth flow (login form → POST /api/token/ → store tokens → next request has Authorization header)

- [ ] ⚠️ Link artifacts
  - [ ] Procedure diagram shows the process shape
  - [ ] Slides explain why each step
  - [ ] Text guide is the reference

## Engagement Instructions

**Task: Create procedure diagram**
```
Run `/flowspec` or `/visualize-procedure`:

"Create a fork/join flowchart for React/Vite frontend setup.

Input: frontend/ directory exists, Node 16+ is installed.

Steps:
1. Install dependencies (npm install, uses package.json + package-lock.json)
2. Review Vite config (vite.config.js sets up /api proxy to localhost:8000)
3. Start dev server (npm run dev → Vite server on :5173)
4. Open browser (http://localhost:5173)
5. Login page (enter e2e-organizer / E2eOrganizerPass!23)
6. Auth flow (POST /api/token/ → get access_token → store in localStorage → include in all requests)
7. Verify (can see event list, can navigate app, API calls return data)

Output: Frontend running, user logged in, Axios interceptor working (tokens auto-added to requests).

Decision points: Node version ok? /api proxy working? Backend running on :8000?

Format: Mermaid or ASCII. Save to: onboarding-docs/diagrams/frontend-setup-procedure.md"
```

**Task: Create Marp slide deck**
```
Run `/progress-brief` (novice mode):

"Create a Marp slide deck (6–8 slides) explaining React/Vite frontend setup for a developer new to Attica.

Audience: React literate, but new to Vite, this codebase, and the proxy setup.

Slides:
1. Title: 'Frontend Setup: React 19 + Vite + Material-UI'
2. Architecture — why React (component-based UI, state management), why Vite (ultra-fast bundler, HMR for dev), why Material-UI (pre-built components, consistent design).
3. Node & npm — what they are (Node is JavaScript runtime, npm is package manager), why package.json and package-lock.json (reproducible builds), the command (npm install).
4. Vite Dev Server — what Vite does (hot module reload: edit a file, browser auto-updates), port 5173, why we use it (fast rebuilds for development).
5. Backend Proxy — why we need it (frontend on :5173, backend on :8000, CORS blocks direct requests), how Vite proxies work (requests to /api get forwarded to http://localhost:8000/api transparently), how it's configured (vite.config.js server.proxy section).
6. Auth & Tokens — what JWT tokens are (credentials for API requests), where they live (localStorage), how they're used (Axios interceptor adds 'Authorization: Bearer <token>' to every request), what happens on 401 (interceptor calls /api/token/refresh, gets new token, retries original request).
7. Verification — open http://localhost:5173, see login page, enter e2e-organizer credentials, should redirect to dashboard or event list.

Format: Marp markdown. Save to: onboarding-docs/slides/frontend-setup.md"
```

**Task: Create markdown text guide**
```
Create a markdown file at onboarding-docs/guides/frontend-setup.md:

## Frontend Setup Guide

### Prerequisites
- Node.js 16+ (\`node --version\`)
- npm 8+ (\`npm --version\`)
- Backend running on localhost:8000 (see backend-setup.md)

### 1. Install Dependencies
[Explanation: package.json lists React, Vite, MUI, Axios, etc.]

\`\`\`bash
cd frontend
npm install
\`\`\`

Expected: node_modules/ folder created, ~200+ packages.

### 2. Check Vite Proxy Configuration
[Explanation: why we need this, how it works]

Open \`frontend/vite.config.js\`. You should see:

\`\`\`javascript
server: {
  proxy: {
    '/api': 'http://localhost:8000',
    '/chat': 'http://localhost:8000',
  },
},
\`\`\`

This tells Vite: "Forward /api/* requests to backend." So \`axios.get('/api/events/')\` actually calls \`http://localhost:8000/api/events/\`.

### 3. Start Vite Dev Server
\`\`\`bash
npm run dev
\`\`\`

Expected: "VITE v7.0.0 ready in X ms. ➜  Local:   http://localhost:5173/"

### 4. Open in Browser
Open http://localhost:5173 in your browser. You should see:
- A login page (or landing page, depending on auth state)
- No CORS errors in console
- No "backend unreachable" messages

### 5. Login with Seeded Credentials
If you ran \`python manage.py seed_e2e\` on the backend:
- Username: e2e-organizer
- Password: E2eOrganizerPass!23

Click Login. The app should:
- POST to /api/token/ (proxied to backend)
- Receive access_token + refresh_token
- Store tokens in localStorage
- Redirect to dashboard or events page

Check browser DevTools (F12 → Application → localStorage). You should see:
- access_token: (a long JWT)
- refresh_token: (another long JWT)

### 6. Verify API Calls Work
In the app, navigate to an endpoint that fetches data (e.g., Events page). Check DevTools → Network tab:
- Requests to /api/* should succeed (200 OK)
- Each request should have an Authorization header: \`Bearer <access_token>\`
- If you see 401, the interceptor should refresh and retry

### 7. Test WebSocket (Optional)
Open a chat or real-time feature. In DevTools → Network → WS (WebSocket tab), you should see:
- Connection to ws://localhost:8000/ws/chat/rooms/<room_id>/
- Messages arriving in real-time

### Troubleshooting

**CORS error in console**
→ Vite proxy not working? Check vite.config.js has /api and /chat proxies. Restart Vite (Ctrl+C, npm run dev).

**Backend unreachable**
→ Backend not running? Start it: \`cd backend/main && daphne -b 0.0.0.0 -p 8000 main.asgi:application\`.

**Login fails (401 Unauthorized)**
→ e2e-organizer not seeded? Run \`python manage.py seed_e2e\` on backend, or create a superuser: \`python manage.py createsuperuser\`.

**Tokens not in localStorage**
→ Login form not calling /api/token/? Check browser Network tab for the POST request. If it's not there, form submission may be failing silently (check console for errors).

**Port 5173 already in use**
→ Change Vite port: edit vite.config.js, add \`port: 5174\` to server config, then \`npm run dev\`.
```

## Recommended skill
▶ `/visualize-procedure` ✅ — for the setup flowchart.
   ▶ `/progress-brief` ✅ (novice mode) — for the slides.
