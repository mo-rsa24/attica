# 🏗️ Architecture Diagrams

## Description

Create four cross-cutting architecture diagrams that explain how the system works at the integration level: WebSocket authentication, REST vs WebSocket communication patterns, JWT token refresh cycle, and event creation wizard state machine.

## Purpose

Help a new developer understand the "big picture" flows: how auth works, how real-time messaging works, how the frontend and backend coordinate. These diagrams bridge the setup knowledge (what to install) to the code understanding (how to modify it).

## Goal

Produce four diagrams:
1. **WebSocket Authentication Handshake** — client connects with JWT in query param, consumer validates, user is authorized
2. **REST vs WebSocket Communication** — message is saved to DB via REST, then broadcast via WebSocket
3. **JWT Token Refresh Cycle** — access token expires, frontend calls /api/token/refresh/, gets new token, retries request
4. **Event Creation Wizard State Machine** — steps 1–5, each saves draft, final publish creates Event

All diagrams should be:
- Readable by a developer with no prior Attica knowledge
- Self-contained (do not rely on other diagrams)
- Accompanied by a 2–3 sentence explanation

## Tasks

- [ ] ⚠️ Create WebSocket authentication diagram
  - [ ] Components: Client, Vite proxy, Django consumer, JWT decoder, Redis channel layer
  - [ ] Flow: client sends `ws://localhost:8000/ws/chat/rooms/101/?token=<jwt>` → consumer.connect() → validates JWT → adds to room group → awaits messages
  - [ ] Output: Can connect, is authorized, receives broadcasts
  - [ ] Tool: flowspec or Mermaid

- [ ] ⚠️ Create REST vs WebSocket diagram
  - [ ] Scenario: Vendor sends a message "We can do $4500"
  - [ ] REST: POST /api/chat/messages/ → Django saves to DB → 201 Created
  - [ ] WebSocket: Backend broadcasts to room group → all connected clients receive event (JSON) → React re-renders
  - [ ] Key insight: DB is source of truth, WebSocket is real-time notify
  - [ ] Tool: flowspec or sequence diagram (Mermaid)

- [ ] ⚠️ Create JWT token refresh diagram
  - [ ] Flow: Frontend makes request with access_token → 401 Unauthorized → Axios interceptor catches 401 → calls /api/token/refresh/ with refresh_token → gets new access_token → retries original request with new token → 200 OK
  - [ ] Includes: localStorage (where tokens live), Axios interceptor (where refresh logic lives)
  - [ ] Tool: flowspec or sequence diagram

- [ ] ⚠️ Create event creation wizard state machine
  - [ ] States: Step 1 (basic info) → draft_id=42 → Step 2 (date/time) → draft updated → ... → Step 5 (review) → Publish → Event created, draft deleted
  - [ ] Each step: user fills form → onClick Next → PATCH /api/events/drafts/42/ → success → show next step
  - [ ] Final step: onClick Publish → POST /api/events/drafts/42/publish/ → Event created → redirect to /events/42
  - [ ] Tool: state machine diagram (Mermaid)

- [ ] ⚠️ Write explanations for each diagram
  - [ ] One diagram per markdown file in onboarding-docs/diagrams/
  - [ ] File names: ws-auth.md, rest-vs-ws.md, jwt-refresh.md, event-wizard.md
  - [ ] Each file: title, diagram (Mermaid or ASCII), 2–3 sentence explanation

## Engagement Instructions

**Task: Create WebSocket authentication diagram**
```
Run `/flowspec`:

"Create a sequence/flow diagram for WebSocket authentication in Attica.

Setup:
- Client (browser) at localhost:5173
- Backend (Django) at localhost:8000
- Client has an access_token (JWT) from login

Flow:
1. Client opens WebSocket: \`new WebSocket('ws://localhost:8000/ws/chat/rooms/101/?token=<access_token>')\`
2. Vite proxy forwards to backend
3. Django consumer.connect() is called
4. Consumer decodes JWT from query param (token=...)
5. Consumer validates JWT (signature, expiry, user exists)
6. If valid, consumer adds this client to a Redis channel group (e.g., 'chat_room_101')
7. Consumer sends 'connected' event to client
8. Client is now subscribed and will receive broadcasts from that room

On disconnect:
- Client closes WebSocket
- Consumer.disconnect() is called
- Consumer removes client from room group

Diagram type: Sequence or flow. Include decision points (valid JWT? not expired?). Save to: onboarding-docs/diagrams/ws-auth.md"
```

**Task: Create REST vs WebSocket diagram**
```
Run `/flowspec`:

"Create a sequence diagram showing the REST-first + WebSocket-notify pattern in Attica.

Scenario: Vendor sends a message in chat room 101.

Flow:
1. Vendor's frontend calls: POST /api/chat/messages/ with {room_id: 101, text: 'We can do $4500'}
2. Request includes Authorization header with vendor's access_token
3. Django MessageViewSet.create() validates (user is authenticated, room_id exists)
4. Saves to DB: Message(room_id=101, sender_id=7, text='We can do $4500')
5. Returns 201 Created with the saved Message (id, created_at, etc.)
6. Backend simultaneously broadcasts via Redis: channel_layer.group_send('chat_room_101', {type: 'message', data: {...}})
7. All clients connected to room 101 (via WebSocket) receive the broadcast instantly
8. Client-side React state updates, message appears on screen

Key insight: The database is the source of truth. If a client's WebSocket was offline, they can still fetch the message later via REST.

Diagram type: Sequence (showing DB write, then broadcast). Save to: onboarding-docs/diagrams/rest-vs-ws.md"
```

**Task: Create JWT token refresh diagram**
```
Run `/flowspec`:

"Create a flow diagram for JWT token refresh in Attica.

Setup:
- Frontend has access_token (5 min lifetime) and refresh_token (24 h lifetime) in localStorage
- Axios instance has an interceptor that adds 'Authorization: Bearer <access_token>' to every request

Flow:
1. Frontend makes API request: GET /api/events/
2. Axios adds header: Authorization: Bearer <access_token>
3. Request arrives at backend
4. Token has expired (created 5 min ago)
5. Backend returns 401 Unauthorized
6. Axios interceptor catches 401
7. Interceptor calls POST /api/token/refresh/ with {refresh_token: <refresh_token>}
8. Backend validates refresh_token (valid sig, not expired, user exists)
9. Backend generates new access_token
10. Returns {access_token: <new_jwt>}
11. Interceptor stores new token in localStorage
12. Interceptor retries original request: GET /api/events/ with new access_token
13. Request succeeds: 200 OK, returns event list

On refresh failure (refresh_token expired or invalid):
- Backend returns 401
- Interceptor logs user out (clears localStorage, redirects to /login)

Diagram type: Flow with decision points. Emphasize the 'retry' step (request is retried, user doesn't notice). Save to: onboarding-docs/diagrams/jwt-refresh.md"
```

**Task: Create event creation wizard diagram**
```
Run `/flowspec`:

"Create a state machine diagram for the event creation wizard in Attica.

States:
- Start → Step 1 Form Shown
- Step 1 (name, category) → user clicks Next → PATCH /api/events/drafts/42/ (or POST if new) → server saves → Step 2 Form Shown
- Step 2 (date, time) → user clicks Next → PATCH /api/events/drafts/42/ → Step 3 Form Shown
- Step 3 (location, capacity) → user clicks Next → PATCH /api/events/drafts/42/ → Step 4 Form Shown
- Step 4 (pricing tiers, questions) → user clicks Next → PATCH /api/events/drafts/42/ → Step 5 Form Shown
- Step 5 (review) → user clicks Publish → POST /api/events/drafts/42/publish/ → Event created (status='published'), draft deleted → Success page (event detail)

Also show:
- Back button (user can go to previous step, re-edit draft)
- Save on each step (each PATCH saves the state, so user doesn't lose work if they close the browser)
- Error states (validation fails on form, show error, stay on same step)

Diagram type: State machine (boxes = states, arrows = transitions, label arrows with user action or API call). Save to: onboarding-docs/diagrams/event-wizard.md"
```

**Task: Write explanations**
```
For each diagram (ws-auth.md, rest-vs-ws.md, jwt-refresh.md, event-wizard.md), write:

[Diagram as Mermaid or ASCII]

## Explanation

[2–3 sentences, plain English, explaining the key insight for each flow]

For ws-auth.md: "The WebSocket connection is stateless and JWT-secured. Instead of a session cookie (which doesn't work across different server processes in production), the client sends the JWT in the query string. The consumer validates it and adds the client to a room group. From then on, the consumer broadcasts to all clients in that group."

For rest-vs-ws.md: "Durability first, real-time second. Messages are saved to the database via REST API (durable, can be re-fetched), then broadcast to online clients via WebSocket (instant, but only if you're connected). If you're offline, you don't miss messages — you just fetch them later from the REST endpoint."

For jwt-refresh.md: "The access token is short-lived (5 min) for security. When it expires, the frontend automatically refreshes it using the longer-lived refresh token, re-attempts the API call, and the user sees no interruption. This is called 'automatic token rotation.'"

For event-wizard.md: "The wizard is a multi-step form that saves incrementally to the database. Each step is a separate form, and clicking Next saves the current step's data (via PATCH) before moving to the next step. This way, if the user closes the browser on Step 3, they can come back and resume from Step 3. The draft record is the checkpoint; Publish finalizes it."
```

## Recommended skill
▶ `/flowspec` ✅ — generates flowcharts, sequence diagrams, state machines from prose briefs. Use for all four diagrams.
   alt: Manual Mermaid authoring (if you prefer full control over diagram syntax).
