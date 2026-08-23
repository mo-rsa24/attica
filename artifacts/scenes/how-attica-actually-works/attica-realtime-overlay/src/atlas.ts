// The atlas: the component registry and the interactive edges, one file.
//
// A node here IS a component in the sense of components.md (inspect, toggle,
// parameterize) and a place in the map in the sense of atlas.md. Keeping them in
// one registry is what stops the parts list and the diagram drifting apart.
//
// Every switchable node carries `breaks` and `real`. A node whose off-state does
// nothing observable would be a decoration with a checkbox, and there are none.

import type { SceneState } from './model'

export type Level = 'ECOSYSTEM' | 'SYSTEM' | 'COMPONENT' | 'MECHANISM'

export const LEVELS: { id: Level; blurb: string; reveals: string }[] = [
  {
    id: 'ECOSYSTEM',
    blurb: 'four processes, four ports',
    reveals: 'which config line declares each one, and the proxy hop between them',
  },
  {
    id: 'SYSTEM',
    blurb: 'inside Daphne',
    reveals: 'ProtocolTypeRouter splitting two protocols across one process and one port',
  },
  {
    id: 'COMPONENT',
    blurb: 'the parts that do the work',
    reveals: 'each one owns live state you can read right now',
  },
  {
    id: 'MECHANISM',
    blurb: 'group membership and dispatch',
    reveals: 'the membership set lives in Redis, which is the entire reason a channel layer exists',
  },
]

export type NodeKind = 'toggle' | 'select' | 'number' | 'fixed'

export interface AtlasNode {
  id: string
  label: string
  /** One plain sentence: what this is. */
  what: string
  level: Level
  /** The node this one opens out of. null at ECOSYSTEM. */
  parent: string | null
  /** Does opening it reveal a level below? */
  opens: boolean
  kind: NodeKind
  /** The state key this node controls, when it controls one. */
  controls?: keyof SceneState
  /** Node ids this one depends on. */
  reads: string[]
  /** Node ids that change when this one changes. */
  affects: string[]
  /** What switching it off does. Mandatory for anything switchable. */
  breaks?: string
  /** The real string, log line or config line it produces. */
  real?: string
  /** The real artifact behind it: the config or source line, verbatim. */
  source: string
  /** simple-icons slug, or null for a labelled generic glyph. */
  icon: string | null
  /** Layout on a 1000 x 520 board, per level. */
  x: number
  y: number
  w: number
  h: number
}

export const NODES: AtlasNode[] = [
  // --- ECOSYSTEM ----------------------------------------------------------
  {
    id: 'browser',
    label: 'Browser + Vite :5173',
    what: 'React 19 under the Vite dev server. It is also the proxy that makes :5173 look like :8000.',
    level: 'ECOSYSTEM',
    parent: null,
    opens: true,
    kind: 'fixed',
    reads: [],
    affects: ['daphne'],
    source: 'frontend/vite.config.js',
    icon: 'react',
    x: 40,
    y: 150,
    w: 210,
    h: 130,
  },
  {
    id: 'daphne',
    label: 'Daphne :8000',
    what: 'The ASGI server. One process holds both the HTTP API and every open WebSocket.',
    level: 'ECOSYSTEM',
    parent: null,
    opens: true,
    kind: 'select',
    controls: 'server',
    reads: ['browser'],
    affects: ['redis', 'sqlite', 'browser'],
    breaks:
      'switch to manage.py runserver and the WebSocket upgrade has no handler: `daphne` is not in ' +
      'INSTALLED_APPS, so Channels does not patch runserver. The REST API is unaffected.',
    real: "WebSocket connection to 'ws://localhost:5173/ws/chat/rooms/7/' failed",
    source: "settings.py:90  ASGI_APPLICATION = 'main.asgi.application'",
    icon: 'django',
    x: 395,
    y: 150,
    w: 210,
    h: 130,
  },
  {
    id: 'redis',
    label: 'Redis :6379',
    what:
      'Two unrelated jobs on one server: DB 0 is the channel layer that fans messages out, ' +
      'DB 1 is the Django cache.',
    level: 'ECOSYSTEM',
    parent: null,
    opens: true,
    kind: 'select',
    controls: 'redis',
    reads: ['daphne'],
    affects: ['browser'],
    breaks:
      'kill it after the sockets joined and group_send raises. broadcast_room_event swallows the ' +
      'error, the POST still returns 201, and nobody is told anything.',
    real: 'WARNING Chat broadcast skipped: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
    source: "settings.py:92-99  'BACKEND': 'channels_redis.core.RedisChannelLayer'",
    icon: 'redis',
    x: 750,
    y: 60,
    w: 210,
    h: 120,
  },
  {
    id: 'sqlite',
    label: 'SQLite db.sqlite3',
    what: 'The source of truth. Every message is here before any socket hears about it.',
    level: 'ECOSYSTEM',
    parent: null,
    opens: false,
    kind: 'fixed',
    reads: ['daphne'],
    affects: [],
    source: "settings.py:156-161  'ENGINE': 'django.db.backends.sqlite3'",
    icon: 'sqlite',
    x: 750,
    y: 250,
    w: 210,
    h: 120,
  },

  // --- SYSTEM: inside the browser ----------------------------------------
  {
    id: 'vite-proxy',
    label: 'the dev-server proxy',
    what:
      'Four path prefixes and the WebSocket upgrade, forwarded to :8000. This is the only reason ' +
      'the client can address everything as same-origin.',
    level: 'SYSTEM',
    parent: 'browser',
    opens: false,
    kind: 'toggle',
    controls: 'viteProxy',
    reads: [],
    affects: ['daphne'],
    breaks:
      'off, and POST /api/... hits Vite itself, which has no such route and answers 404. The SPA ' +
      'fallback does not rescue it because that only rewrites GETs which accept text/html.',
    real: 'POST http://localhost:5173/api/chat/rooms/7/messages/ 404 (Not Found)',
    source:
      "vite.config.js:14-23  proxy: {'/api', '/vendors', '/cart', '/checkout', '/ws': {ws: true}}",
    icon: 'vite',
    x: 60,
    y: 90,
    w: 260,
    h: 130,
  },
  {
    id: 'client',
    label: 'DirectMessagePage',
    what:
      'Loads the room over REST, then opens a socket that only ever appends. It never treats the ' +
      'socket as storage.',
    level: 'SYSTEM',
    parent: 'browser',
    opens: true,
    kind: 'select',
    controls: 'sendPath',
    reads: ['vite-proxy'],
    affects: ['daphne'],
    breaks:
      'switch the writer to the socket and ChatConsumer._handle_send takes over. It still writes ' +
      'to the database first, so the claim survives, but no shipped Attica screen uses this path.',
    real: 'ws frame in:  {"type": "send_message", "text": "..."}',
    source: 'frontend/src/pages/DirectMessagePage.jsx:362-386',
    icon: null,
    x: 400,
    y: 90,
    w: 260,
    h: 130,
  },
  {
    id: 'poll',
    label: 'the fallback poll',
    what:
      'A GET every 8 seconds, mounted only while socketError is set. This is the alternative the ' +
      'whole scene is arguing against, living inside the app as its safety net.',
    level: 'SYSTEM',
    parent: 'browser',
    opens: false,
    kind: 'number',
    controls: 'pollIntervalMs',
    reads: ['client'],
    affects: ['daphne'],
    breaks:
      'it cannot start unless something set socketError: a close, an onerror, or a warning frame. ' +
      'A swallowed group_send sets none of those.',
    real: 'GET /api/chat/rooms/7/messages/ 200 (OK)   [poll, every 8000 ms]',
    source: 'frontend/src/pages/DirectMessagePage.jsx:258-264',
    icon: null,
    x: 740,
    y: 90,
    w: 210,
    h: 130,
  },
  {
    id: 'merge',
    label: 'appendMessages',
    what:
      'Merges by id into a Map, then sorts by created_at. This is why arrival order over the wire ' +
      'does not matter, and why the sender does not see its own message twice.',
    level: 'SYSTEM',
    parent: 'browser',
    opens: false,
    kind: 'toggle',
    controls: 'concurrentSends',
    reads: ['client', 'poll'],
    affects: [],
    breaks:
      'send from both sides at once and the two events can arrive in either order. The sort by ' +
      'created_at fixes it. The one leak: Array.prototype.sort is stable, so an exact created_at ' +
      'tie keeps arrival order.',
    real: 'byId = new Map(prev.map((m) => [m.id, m]))',
    source: 'frontend/src/pages/DirectMessagePage.jsx:126-138',
    icon: null,
    x: 400,
    y: 280,
    w: 260,
    h: 120,
  },

  // --- SYSTEM: inside Daphne ---------------------------------------------
  {
    id: 'protocol-router',
    label: 'ProtocolTypeRouter',
    what: 'The fork in the road. Reads the ASGI scope type and hands the connection to one of two stacks.',
    level: 'SYSTEM',
    parent: 'daphne',
    opens: false,
    kind: 'fixed',
    reads: [],
    affects: ['http-branch', 'ws-branch'],
    source: 'backend/main/main/routing.py:9-19',
    icon: null,
    x: 380,
    y: 30,
    w: 250,
    h: 90,
  },
  {
    id: 'http-branch',
    label: 'the http branch',
    what:
      'get_asgi_application(): the ordinary Django stack. MIDDLEWARE, then urls.py, then the DRF view. ' +
      'This is where every write happens.',
    level: 'SYSTEM',
    parent: 'daphne',
    opens: true,
    kind: 'fixed',
    reads: ['protocol-router'],
    affects: ['sqlite'],
    source: 'routing.py:10  "http": get_asgi_application()',
    icon: null,
    x: 90,
    y: 190,
    w: 350,
    h: 200,
  },
  {
    id: 'ws-branch',
    label: 'the websocket branch',
    what:
      'Three wrappers before a consumer sees anything: the JWT middleware, the session/auth stack, ' +
      'then the URL router.',
    level: 'SYSTEM',
    parent: 'daphne',
    opens: true,
    kind: 'select',
    controls: 'token',
    reads: ['protocol-router'],
    affects: ['redis'],
    breaks:
      'an absent or expired token resolves AnonymousUser and connect() closes 4401. A valid token ' +
      'for a user who is not in the room closes 4403.',
    real: 'close code 4401, then a reconnect attempt every 4000 ms',
    source: 'routing.py:11-18  WebSocketJWTAuthMiddleware(AuthMiddlewareStack(URLRouter(...)))',
    icon: null,
    x: 560,
    y: 190,
    w: 350,
    h: 200,
  },

  // --- COMPONENT ----------------------------------------------------------
  {
    id: 'view',
    label: 'ChatMessageListCreateView',
    what:
      'The only writer the app actually uses. Checks membership, writes the row, stamps delivered_at, ' +
      'serializes, and only then broadcasts.',
    level: 'COMPONENT',
    parent: 'http-branch',
    opens: false,
    kind: 'fixed',
    reads: [],
    affects: ['broadcast-fn', 'sqlite'],
    source: 'backend/main/chat/views.py:114-142',
    icon: null,
    x: 60,
    y: 80,
    w: 300,
    h: 150,
  },
  {
    id: 'broadcast-fn',
    label: 'broadcast_room_event',
    what:
      'The seam between the durable half and the best-effort half. Its docstring is the claim: errors ' +
      'are swallowed so handlers continue "and the message remains persisted in the database".',
    level: 'COMPONENT',
    parent: 'http-branch',
    opens: true,
    kind: 'fixed',
    reads: ['view'],
    affects: ['channel-layer'],
    source: 'backend/main/chat/utils.py:23-43',
    icon: null,
    x: 430,
    y: 80,
    w: 300,
    h: 150,
  },
  {
    id: 'notify-fn',
    label: 'notify_new_message',
    what:
      'A second, independent broadcast to notifications_<user id>. It writes a Notification row first, ' +
      'then tries to push. Same shape, same swallow.',
    level: 'COMPONENT',
    parent: 'http-branch',
    opens: false,
    kind: 'fixed',
    reads: ['view'],
    affects: ['channel-layer'],
    source: 'backend/main/notifications/utils.py:16-60',
    icon: null,
    x: 430,
    y: 275,
    w: 300,
    h: 130,
  },
  {
    id: 'consumer',
    label: 'ChatConsumer',
    what:
      'Authorizes, joins the room group, and then does almost nothing: its job is to hold a socket ' +
      'and forward what Redis hands it.',
    level: 'COMPONENT',
    parent: 'ws-branch',
    opens: true,
    kind: 'fixed',
    reads: [],
    affects: ['channel-layer'],
    source: 'backend/main/chat/consumers.py:55-145',
    icon: null,
    x: 60,
    y: 80,
    w: 300,
    h: 150,
  },
  {
    id: 'notif-consumer',
    label: 'NotificationConsumer',
    what:
      'The same shape as ChatConsumer with one telling difference: when group_add fails it closes ' +
      '4500 instead of degrading. Two consumers, two policies for the same failure.',
    level: 'COMPONENT',
    parent: 'ws-branch',
    opens: false,
    kind: 'fixed',
    reads: [],
    affects: ['channel-layer'],
    source: 'backend/main/notifications/consumers.py:10-48',
    icon: null,
    x: 60,
    y: 275,
    w: 300,
    h: 130,
  },
  {
    id: 'channel-layer',
    label: 'RedisChannelLayer',
    what:
      'The thing that makes group_send work across processes. Membership is a set in Redis, so a ' +
      'second Daphne worker reaches the same room.',
    level: 'COMPONENT',
    parent: 'ws-branch',
    opens: true,
    kind: 'select',
    controls: 'redis',
    reads: ['consumer'],
    affects: ['consumer'],
    breaks:
      'remove CHANNEL_LAYERS entirely and get_channel_layer() returns None. The consumer still ' +
      'accepts the socket, then warns that realtime is off.',
    real: 'INFO Chat broadcast skipped: no channel layer configured',
    source: 'settings.py:92-99',
    icon: 'redis',
    x: 430,
    y: 80,
    w: 300,
    h: 150,
  },

  // --- MECHANISM ----------------------------------------------------------
  {
    id: 'group-add',
    label: 'group_add',
    what:
      'At connect: put this socket\'s channel name into the set named chat_room_7. The set is in ' +
      'Redis, not in the worker.',
    level: 'MECHANISM',
    parent: 'channel-layer',
    opens: false,
    kind: 'select',
    controls: 'redis',
    reads: [],
    affects: ['group-send'],
    breaks:
      'Redis unreachable here and the exception is caught: broadcast_enabled goes False and the ' +
      'client is sent a warning frame, which is what starts the poll.',
    real: 'Failed to join chat group chat_room_7: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
    source: 'backend/main/chat/consumers.py:65-78',
    icon: null,
    x: 60,
    y: 100,
    w: 270,
    h: 160,
  },
  {
    id: 'group-send',
    label: 'group_send',
    what:
      'Hand Redis one envelope addressed to the group. Redis copies it to every channel name in the set.',
    level: 'MECHANISM',
    parent: 'channel-layer',
    opens: false,
    kind: 'select',
    controls: 'redis',
    reads: ['group-add'],
    affects: ['dispatch'],
    breaks:
      'Redis unreachable here and _safe_group_send logs and returns. The caller never learns, so the ' +
      'POST still answers 201.',
    real: 'WARNING Chat broadcast skipped: Error 111 connecting to 127.0.0.1:6379. Connection refused.',
    source: 'backend/main/chat/utils.py:10-20',
    icon: null,
    x: 370,
    y: 100,
    w: 270,
    h: 160,
  },
  {
    id: 'dispatch',
    label: 'chat.event becomes chat_event',
    what:
      'The one piece of Channels magic in the whole path: the envelope\'s "type" is turned into a ' +
      'method name by replacing dots with underscores, and that method is called on every consumer.',
    level: 'MECHANISM',
    parent: 'channel-layer',
    opens: false,
    kind: 'fixed',
    reads: ['group-send'],
    affects: [],
    source: 'utils.py:40 sends "chat.event"; consumers.py:137 defines chat_event',
    icon: null,
    x: 680,
    y: 100,
    w: 270,
    h: 160,
  },
]

export const byId = (id: string) => NODES.find((n) => n.id === id)

/** The nodes drawn at a given focus. Focus null means the ECOSYSTEM board. */
export function nodesAt(focus: string | null): AtlasNode[] {
  return NODES.filter((n) => n.parent === focus)
}

/** ECOSYSTEM up to the focused node, for the breadcrumb. */
export function trail(focus: string | null): AtlasNode[] {
  const out: AtlasNode[] = []
  let cur = focus
  while (cur) {
    const n = byId(cur)
    if (!n) break
    out.unshift(n)
    cur = n.parent
  }
  return out
}

// ---------------------------------------------------------------------------
// Edges. An arrow is a semantic entity: click it and it says what it carries,
// and where it is severable, severing it is an intervention like any other.
// ---------------------------------------------------------------------------

export interface AtlasEdge {
  id: string
  from: string
  to: string
  /** Which board this edge is drawn on. */
  at: string | null
  label: string
  /** The label drawn on the map. Kept to a couple of words: the full story is
   *  in `carries` and `consequence`, one click away in the inspector. */
  short: string
  carries: string
  transport: string
  consequence: string
  source: string
  /** The state key that severs it, when it can be severed. */
  severs?: keyof SceneState
  severNote?: string
  /** Draw it as a dashed line: this edge is best-effort, not durable. */
  bestEffort?: boolean
}

export const EDGES: AtlasEdge[] = [
  {
    id: 'http',
    from: 'browser',
    to: 'daphne',
    at: null,
    label: 'POST /api/…',
    short: 'POST /api',
    carries: 'the message body and the Bearer token',
    transport: 'HTTP through the Vite proxy',
    consequence: '201 Created, with the serialized row in the body',
    source: "vite.config.js:15  '/api': 'http://localhost:8000'",
    severs: 'viteProxy',
    severNote: 'sever it and the POST 404s on :5173, so nothing is written at all',
  },
  {
    id: 'ws',
    from: 'browser',
    to: 'daphne',
    at: null,
    label: 'ws://…/ws/chat/rooms/7/?token=',
    short: 'ws upgrade',
    carries: 'the JWT in the query string, then one JSON frame per event',
    transport: 'WebSocket, upgraded by Vite because the proxy entry sets ws: true',
    consequence: 'accepted, or closed with 4401 or 4403',
    source: "vite.config.js:19-22  '/ws': {target, ws: true}",
    severs: 'server',
    severNote: 'runserver has no handler for it, so the upgrade fails and the poll takes over',
    bestEffort: true,
  },
  {
    id: 'write',
    from: 'daphne',
    to: 'sqlite',
    at: null,
    label: 'INSERT, then UPDATE delivered_at',
    short: 'INSERT',
    carries: 'the row itself',
    transport: 'the Django ORM, synchronously, inside the request',
    consequence: 'the message exists and will survive everything downstream',
    source: 'views.py:134-135',
    severNote:
      'not severable, deliberately. Cutting the source of truth is a different scene; here it is the ' +
      'fixed point everything else is measured against.',
  },
  {
    id: 'layer',
    from: 'daphne',
    to: 'redis',
    at: null,
    label: 'group_send, DB 0',
    short: 'group_send',
    carries: '{"type": "chat.event", "payload": {...}} addressed to chat_room_7',
    transport: 'channels_redis, best effort, errors swallowed',
    consequence: 'every channel in the group gets a copy, or nobody does and a warning is logged',
    source: 'utils.py:36-43',
    severs: 'redis',
    severNote: 'this is the headline intervention: sever it and watch the row survive anyway',
    bestEffort: true,
  },
  {
    id: 'cache',
    from: 'daphne',
    to: 'redis',
    at: null,
    label: 'cache, DB 1',
    short: 'cache',
    carries: 'cached user permissions, 15 minute timeout',
    transport: 'django_redis',
    consequence:
      'nothing at all for chat. It shares a server with the channel layer and shares nothing else.',
    source: 'settings.py:113-122  "LOCATION": "redis://127.0.0.1:6379/1"',
    bestEffort: true,
  },
  {
    id: 'split-http',
    from: 'protocol-router',
    to: 'http-branch',
    at: 'daphne',
    label: 'scope["type"] == "http"',
    short: 'http',
    carries: 'every REST request',
    transport: 'get_asgi_application()',
    consequence: 'the ordinary Django middleware chain runs',
    source: 'routing.py:10',
  },
  {
    id: 'split-ws',
    from: 'protocol-router',
    to: 'ws-branch',
    at: 'daphne',
    label: 'scope["type"] == "websocket"',
    short: 'websocket',
    carries: 'every socket handshake',
    transport: 'three nested middlewares, then the URLRouter',
    consequence: 'scope["user"] is resolved before any consumer runs',
    source: 'routing.py:11-18',
  },
  {
    id: 'view-broadcast',
    from: 'view',
    to: 'broadcast-fn',
    at: 'http-branch',
    label: 'after the write, never before',
    short: 'after the write',
    carries: 'the already-serialized message',
    transport: 'a plain function call',
    consequence: 'the durable half is finished by the time this line runs',
    source: 'views.py:139',
    bestEffort: true,
  },
  {
    id: 'view-notify',
    from: 'view',
    to: 'notify-fn',
    at: 'http-branch',
    label: 'and then the badge',
    short: 'the badge',
    carries: 'recipient, title, and a link back to the room',
    transport: 'a plain function call, one line later',
    consequence: 'a Notification row, then a second best-effort push',
    source: 'views.py:141',
    bestEffort: true,
  },
  {
    id: 'consumer-layer',
    from: 'consumer',
    to: 'channel-layer',
    at: 'ws-branch',
    label: 'group_add at connect, group_discard at disconnect',
    short: 'group_add',
    carries: 'this socket’s channel name',
    transport: 'channels_redis',
    consequence: 'membership of chat_room_7 changes',
    source: 'consumers.py:71 and consumers.py:82',
    severs: 'redis',
    severNote: 'sever it and the consumer degrades rather than closing: broadcast_enabled goes False',
    bestEffort: true,
  },
  {
    id: 'notif-layer',
    from: 'notif-consumer',
    to: 'channel-layer',
    at: 'ws-branch',
    label: 'group_add, or close 4500',
    short: 'group_add',
    carries: 'this socket’s channel name',
    transport: 'channels_redis',
    consequence: 'the opposite policy: this consumer refuses the connection instead of degrading',
    source: 'notifications/consumers.py:21-29',
    severs: 'redis',
    severNote: 'sever it and the notifications socket closes 4500 while the chat socket stays open',
    bestEffort: true,
  },
  {
    id: 'add-send',
    from: 'group-add',
    to: 'group-send',
    at: 'channel-layer',
    label: 'the set it wrote is the set this reads',
    short: 'same set',
    carries: 'the membership of chat_room_7',
    transport: 'a Redis key, outliving any single worker',
    consequence:
      'a message sent from the HTTP worker reaches a socket held by a different worker entirely',
    source: 'settings.py:96  "hosts": [(\'127.0.0.1\', 6379)]',
  },
  {
    id: 'send-dispatch',
    from: 'group-send',
    to: 'dispatch',
    at: 'channel-layer',
    label: '"type" becomes the method name',
    short: 'type to method',
    carries: 'the envelope',
    transport: 'the consumer’s receive loop',
    consequence: 'chat_event() runs and writes to the socket',
    source: 'consumers.py:137-138',
  },
]

export function edgesAt(focus: string | null): AtlasEdge[] {
  return EDGES.filter((e) => e.at === focus)
}
