// The one place truth is computed.
//
// Pure: imports nothing from React, the store, or any component. Every panel in
// the scene reads run(state) and nothing else. No panel builds an error string
// from a boolean, because the real strings live here, copied from the Attica
// source they come from.
//
// Shape: dynamic. run(state) folds a fixed 14-slot lifecycle, one slot per real
// step in Attica's send path, and marks each slot ran / skipped / failed. The
// slots are always all present so that two configurations can be compared
// without the layout moving (laboratory.md, "comparisons inherit the baseline").
//
// The claim this model exists to make checkable: slot `db-insert` strictly
// precedes slot `broadcast` in every world. The row is durable before anyone is
// told about it.

// ---------------------------------------------------------------------------
// State: the only directly manipulable things
// ---------------------------------------------------------------------------

/** Where the channel layer stands. Four real configurations, four code paths. */
export type RedisState =
  | 'up'
  /** CHANNEL_LAYERS absent entirely: get_channel_layer() returns None. */
  | 'not-configured'
  /** Redis unreachable when the socket connects: group_add raises. */
  | 'down-before-connect'
  /** group_add succeeded, then Redis died: group_send raises. The dangerous one. */
  | 'down-after-connect'

/** What the second browser presents to WebSocketJWTAuthMiddleware. */
export type TokenState = 'valid' | 'expired' | 'absent' | 'valid-non-member'

/** Which writer the client uses. Attica's UI uses `rest`; `socket` exists in
 *  ChatConsumer._handle_send and no shipped screen calls it. */
export type SendPath = 'rest' | 'socket'

/** daphne speaks WebSocket. manage.py runserver serves HTTP only, because
 *  `daphne` is not in INSTALLED_APPS, so Channels does not patch runserver. */
export type ServerState = 'daphne' | 'runserver'

export interface SceneState {
  redis: RedisState
  token: TokenState
  sendPath: SendPath
  server: ServerState
  /** Vite's dev-server proxy. Off means /api and /ws never reach :8000. */
  viteProxy: boolean
  /** Real: 8000, from DirectMessagePage.jsx:260. */
  pollIntervalMs: number
  /** How many chat rooms are open across all users, for the poll's query cost. */
  openRooms: number
  /** Two participants POSTing at once, for the ordering lesson. */
  concurrentSends: boolean
}

export const initialState: SceneState = {
  redis: 'up',
  token: 'valid',
  sendPath: 'rest',
  server: 'daphne',
  viteProxy: true,
  pollIntervalMs: 8000,
  openRooms: 100,
  concurrentSends: false,
}

/** Messages already in room 7 before this send. */
export const ROWS_BEFORE = 3

// ---------------------------------------------------------------------------
// Illustrative durations
//
// Every number the scene shows carries its provenance. These are illustrative:
// plausible local-loopback figures, not measured on your machine, and the UI
// labels them illustrative wherever a total is displayed. The three numbers
// that are REAL are pollIntervalMs (8000), RECONNECT_MS (4000) and
// TYPING_DEBOUNCE_MS (500), all read straight out of DirectMessagePage.jsx.
// ---------------------------------------------------------------------------

export const RECONNECT_MS = 4000 // DirectMessagePage.jsx:246
export const TYPING_DEBOUNCE_MS = 500 // DirectMessagePage.jsx:164
export const ACCESS_TOKEN_MINUTES = 30 // settings.py:215

const D = {
  compose: 0,
  proxyHttp: 1,
  authz: 1,
  dbInsert: 4,
  dbDelivered: 2,
  serialize: 1,
  broadcast: 0,
  groupSend: 3,
  fanout: 2,
  consumerSend: 1,
  clientMerge: 1,
  notify: 3,
} as const

// ---------------------------------------------------------------------------
// The lifecycle slots
// ---------------------------------------------------------------------------

export type SlotId =
  | 'compose'
  | 'proxy-http'
  | 'authz'
  | 'db-insert'
  | 'db-delivered'
  | 'serialize'
  | 'broadcast'
  | 'group-send'
  | 'fanout'
  | 'consumer-send'
  | 'client-merge'
  | 'notify'
  | 'http-201'
  | 'poll-tick'

export type SlotStatus = 'ran' | 'skipped' | 'failed'

export type Actor = 'client' | 'proxy' | 'django' | 'redis' | 'consumer' | 'db' | 'counterpart'

export interface Slot {
  id: SlotId
  /** What this step is, in the domain's own words. */
  label: string
  actor: Actor
  status: SlotStatus
  /** The real line, log string, status code or close code this step produced. */
  detail: string
  /** Where it lives in the Attica source. */
  source: string
  /** Cumulative milliseconds when this step completed. Illustrative. */
  atMs: number | null
}

/** What became of the message. This is the prediction space, and it is derived,
 *  never authored: Predict.tsx offers exactly these five. */
export type Variant =
  | 'delivered-push'
  | 'delivered-poll'
  | 'durable-not-delivered'
  | 'blocked-by-authz'
  | 'never-sent'

export const VARIANTS: { id: Variant; label: string; blurb: string }[] = [
  {
    id: 'delivered-push',
    label: 'delivered over the socket',
    blurb: 'row committed, and the second browser was pushed the message',
  },
  {
    id: 'delivered-poll',
    label: 'delivered by the 8-second poll',
    blurb: 'row committed, nothing pushed, the timer picked it up',
  },
  {
    id: 'durable-not-delivered',
    label: 'committed, but nobody was told',
    blurb: 'row committed, no push, and no poll running to recover it',
  },
  {
    id: 'blocked-by-authz',
    label: 'refused: not a participant',
    blurb: 'the watching user is not in this room, so both the socket and the GET refuse',
  },
  {
    id: 'never-sent',
    label: 'never written at all',
    blurb: 'the POST itself did not succeed, so there is no row',
  },
]

/** One edge of the model's own why-chain. Rendered by the "why?" affordance and
 *  by nothing else: a changeset says what changed, this says why. */
export interface ProvEdge {
  from: string
  to: string
  because: string
}

export interface SocketReport {
  connected: boolean
  closeCode: number | null
  closeMeaning: string
  /** ChatConsumer.broadcast_enabled after connect(). */
  broadcastEnabled: boolean
  /** The {"type": "warning", ...} frame ChatConsumer sends when it degrades. */
  warningFrame: boolean
  /** Does the client's socketError flag get set, which is what starts the poll? */
  socketError: boolean
  log: string[]
}

export interface Outcome {
  slots: Slot[]
  variant: Variant
  /** One plain sentence naming what happened and why. */
  reason: string

  messageDurable: boolean
  httpStatus: number | null
  httpDetail: string
  counterpartSees: boolean
  /** When the second browser saw it. null means not without a reload. */
  counterpartSeesAtMs: number | null

  socket: SocketReport
  groupMembers: string[]
  /** Can that membership set still be read back? Redis down means unknown,
   *  which is a different answer from empty. */
  groupMembersReadable: boolean
  pollActive: boolean

  dbRowCount: number
  screenRowCount: number
  divergence: number

  /** GETs per minute across all open rooms while the poll is the delivery path. */
  queriesPerMinute: number
  /** Illustrative end-to-end push latency. */
  pushLatencyMs: number | null

  /** Real log lines and command output, in the order they are emitted. */
  transcript: string[]
  provenance: ProvEdge[]
  /** Does the sender's own copy arrive twice (POST body plus its own fan-out)? */
  senderDoubleDelivery: boolean
  /** Arrival order over the wire, then the order after appendMessages sorts. */
  ordering: { arrival: string[]; onScreen: string[]; tie: boolean } | null
}

// ---------------------------------------------------------------------------
// The real strings
// ---------------------------------------------------------------------------

const REDIS_REFUSED = 'Error 111 connecting to 127.0.0.1:6379. Connection refused.'

export const CLOSE_MEANINGS: Record<number, string> = {
  1006: 'abnormal closure: the handshake never completed, so no code was sent',
  4401: 'ChatConsumer.connect: scope["user"] is anonymous (consumers.py:60)',
  4403: 'ChatConsumer.connect: user is neither room.organizer nor room.vendor (consumers.py:63)',
  4500: 'NotificationConsumer.connect: group_add failed (notifications/consumers.py:28)',
}

// ---------------------------------------------------------------------------
// The socket half
// ---------------------------------------------------------------------------

function socketReport(s: SceneState): SocketReport {
  const log: string[] = []

  if (s.server === 'runserver') {
    return {
      connected: false,
      closeCode: 1006,
      closeMeaning:
        'manage.py runserver is the plain WSGI dev server: `daphne` is not in INSTALLED_APPS, ' +
        'so Channels does not patch runserver and /ws/ has no handler. The upgrade 404s.',
      broadcastEnabled: false,
      warningFrame: false,
      socketError: true,
      log: ['WebSocket connection to \'ws://localhost:5173/ws/chat/rooms/7/\' failed'],
    }
  }

  if (!s.viteProxy) {
    return {
      connected: false,
      closeCode: 1006,
      closeMeaning:
        'the client builds its URL from window.location.host, which is :5173. Without the ' +
        "'/ws' proxy entry there is nothing on :5173 to upgrade the connection.",
      broadcastEnabled: false,
      warningFrame: false,
      socketError: true,
      log: ['WebSocket connection to \'ws://localhost:5173/ws/chat/rooms/7/\' failed'],
    }
  }

  if (s.token === 'absent' || s.token === 'expired') {
    return {
      connected: false,
      closeCode: 4401,
      closeMeaning: CLOSE_MEANINGS[4401],
      broadcastEnabled: false,
      warningFrame: false,
      socketError: true,
      log: [
        s.token === 'expired'
          ? 'UntypedToken(token) raised TokenError: token is expired'
          : 'no ?token= and no Authorization header: scope["user"] = AnonymousUser()',
      ],
    }
  }

  if (s.token === 'valid-non-member') {
    return {
      connected: false,
      closeCode: 4403,
      closeMeaning: CLOSE_MEANINGS[4403],
      broadcastEnabled: false,
      warningFrame: false,
      socketError: true,
      log: ['_user_in_room(): user is not in [room.organizer, room.vendor]'],
    }
  }

  // Authenticated participant on a real ASGI server. Now the channel layer decides
  // whether this socket is merely open or actually joined to the room's group.
  if (s.redis === 'not-configured') {
    log.push('No channel layer configured; realtime disabled for room 7')
    return {
      connected: true,
      closeCode: null,
      closeMeaning: '',
      broadcastEnabled: false,
      warningFrame: true,
      socketError: true, // the client sets socketError on the warning frame
      log,
    }
  }

  if (s.redis === 'down-before-connect') {
    log.push(`Failed to join chat group chat_room_7: ${REDIS_REFUSED}`)
    return {
      connected: true,
      closeCode: null,
      closeMeaning: '',
      broadcastEnabled: false,
      warningFrame: true,
      socketError: true,
      log,
    }
  }

  // 'up' and 'down-after-connect' both join successfully: group_add ran while
  // Redis was still reachable. This is exactly why down-after-connect is the
  // dangerous case, and the whole reason it is a separate state value.
  return {
    connected: true,
    closeCode: null,
    closeMeaning: '',
    broadcastEnabled: true,
    warningFrame: false,
    socketError: false,
    log,
  }
}

// ---------------------------------------------------------------------------
// run(): fold the lifecycle
// ---------------------------------------------------------------------------

export function run(s: SceneState): Outcome {
  const sock = socketReport(s)
  const transcript: string[] = []
  const prov: ProvEdge[] = []
  const slots: Slot[] = []
  let t = 0

  const skipAll = (ids: SlotId[], detail: string) =>
    ids.forEach((id) => slots.push({ ...SLOT_META[id], status: 'skipped', detail, atMs: null }))

  const ran = (id: SlotId, detail: string, ms: number) => {
    t += ms
    slots.push({ ...SLOT_META[id], status: 'ran', detail, atMs: t })
  }
  const failed = (id: SlotId, detail: string) =>
    slots.push({ ...SLOT_META[id], status: 'failed', detail, atMs: null })

  // 1. compose ------------------------------------------------------------
  ran(
    'compose',
    `typing fires sendTyping(), debounced ${TYPING_DEBOUNCE_MS} ms leading, over the socket`,
    D.compose,
  )

  // 2. the proxy hop ------------------------------------------------------
  if (!s.viteProxy) {
    failed(
      'proxy-http',
      "POST /api/chat/rooms/7/messages/ hits Vite on :5173, which has no such route. " +
        'Vite answers 404 (its SPA fallback only rewrites GETs that accept text/html), ' +
        "res.ok is false, and sendMessage throws 'Failed to send message.'",
    )
    transcript.push('POST http://localhost:5173/api/chat/rooms/7/messages/ 404 (Not Found)')
    transcript.push('Failed to send message.')
    skipAll(
      ['authz', 'db-insert', 'db-delivered', 'serialize', 'broadcast', 'group-send', 'fanout', 'consumer-send', 'client-merge', 'notify', 'http-201'],
      'never reached: the request did not leave the dev server',
    )
    pushPoll(slots, s, sock, transcript)
    prov.push({
      from: 'viteProxy = off',
      to: 'POST 404',
      because: "vite.config.js has no '/api' entry, so :5173 does not forward to :8000",
    })
    prov.push({ from: 'POST 404', to: 'no row written', because: 'the view never ran' })
    return assemble(s, sock, slots, transcript, prov, {
      variant: 'never-sent',
      reason:
        'The proxy is off, so the POST never left :5173. Nothing was written and there is nothing to deliver.',
      messageDurable: false,
      httpStatus: 404,
      httpDetail: 'Cannot POST /api/chat/rooms/7/messages/',
      counterpartSees: false,
      counterpartSeesAtMs: null,
      pushLatencyMs: null,
    })
  }
  ran('proxy-http', "vite.config.js:15 '/api': 'http://localhost:8000' forwards the POST", D.proxyHttp)

  // 3. authz --------------------------------------------------------------
  if (s.token === 'expired' || s.token === 'absent') {
    failed(
      'authz',
      'the same access token is on the POST. JWTAuthentication rejects it and DRF answers 401 ' +
        'before ChatMessageListCreateView.post runs.',
    )
    transcript.push('POST /api/chat/rooms/7/messages/ 401 (Unauthorized)')
    transcript.push('{"detail":"Given token not valid for any token type"}')
    skipAll(
      ['db-insert', 'db-delivered', 'serialize', 'broadcast', 'group-send', 'fanout', 'consumer-send', 'client-merge', 'notify', 'http-201'],
      'never reached: authentication failed',
    )
    pushPoll(slots, s, sock, transcript)
    prov.push({
      from: `token = ${s.token}`,
      to: 'HTTP 401 and close 4401',
      because:
        'one token governs both doors: DRF rejects it on the POST, WebSocketJWTAuthMiddleware ' +
        'resolves AnonymousUser on the handshake',
    })
    prov.push({
      from: 'HTTP 401',
      to: 'no row written',
      because: 'ChatMessageListCreateView.post never ran',
    })
    return assemble(s, sock, slots, transcript, prov, {
      variant: 'never-sent',
      reason:
        `The access token is ${s.token}. Both doors refuse it, so nothing was written. ` +
        `In the running app AuthProvider usually refreshes it first (ACCESS_TOKEN_LIFETIME is ${ACCESS_TOKEN_MINUTES} minutes), ` +
        'and because wsUrl depends on tokens, the refresh rebuilds the socket URL and reconnects.',
      messageDurable: false,
      httpStatus: 401,
      httpDetail: 'Given token not valid for any token type',
      counterpartSees: false,
      counterpartSeesAtMs: null,
      pushLatencyMs: null,
    })
  }
  ran(
    'authz',
    'request.user in [room.organizer, room.vendor] passes (views.py:127)',
    D.authz,
  )

  // 4 and 5. the writes ---------------------------------------------------
  // These two slots are the claim. They run before `broadcast` in every world
  // that reaches them, and model.checks.ts asserts exactly that.
  ran('db-insert', 'INSERT INTO chat_message ... (serializer.save(), views.py:134)', D.dbInsert)
  ran(
    'db-delivered',
    'UPDATE chat_message SET delivered_at = now() WHERE id = 4 (views.py:135)',
    D.dbDelivered,
  )
  ran('serialize', 'MessageSerializer(message).data (views.py:138)', D.serialize)

  // 7 to 11. the overlay --------------------------------------------------
  const socketWriter = s.sendPath === 'socket'
  let counterpartSees = false
  let counterpartAt: number | null = null
  let pushLatency: number | null = null

  if (s.redis === 'not-configured') {
    failed('broadcast', 'get_channel_layer() returned None (utils.py:32)')
    transcript.push('INFO Chat broadcast skipped: no channel layer configured')
    skipAll(['group-send', 'fanout', 'consumer-send', 'client-merge'], 'no channel layer to send through')
    failed('notify', 'notify_new_message also finds no channel layer; the Notification row is still created')
    prov.push({
      from: 'CHANNEL_LAYERS absent',
      to: 'get_channel_layer() is None',
      because: 'broadcast_room_event returns early rather than raising (utils.py:33-35)',
    })
  } else if (s.redis === 'down-after-connect') {
    ran('broadcast', 'get_channel_layer() returns the configured RedisChannelLayer', D.broadcast)
    failed(
      'group-send',
      `_safe_group_send caught the error and swallowed it: ${REDIS_REFUSED}`,
    )
    transcript.push(`WARNING Chat broadcast skipped: ${REDIS_REFUSED}`)
    skipAll(['fanout', 'consumer-send', 'client-merge'], 'the send never reached Redis')
    failed('notify', `notify_new_message logs: Failed to broadcast notification: ${REDIS_REFUSED}`)
    prov.push({
      from: 'redis down after connect',
      to: 'group_send raised',
      because: 'the exception is caught in _safe_group_send and logged, not re-raised (utils.py:17-20)',
    })
    prov.push({
      from: 'group_send swallowed',
      to: 'POST still returns 201',
      because:
        'the docstring says it plainly: handlers continue "so that the message remains persisted in the database"',
    })
    prov.push({
      from: 'no warning frame and no close',
      to: 'socketError stays false',
      because: 'the client only sets socketError on close, error, or a warning frame',
    })
    prov.push({
      from: 'socketError false',
      to: 'the 8-second poll never starts',
      because: 'the poll effect is gated on socketError (DirectMessagePage.jsx:258-259)',
    })
  } else if (s.redis === 'down-before-connect') {
    // The sender's POST still calls group_send, and it still fails: Redis is down
    // for everyone, not only for the socket that could not join.
    ran('broadcast', 'get_channel_layer() returns the configured RedisChannelLayer', D.broadcast)
    failed('group-send', `_safe_group_send caught the error and swallowed it: ${REDIS_REFUSED}`)
    transcript.push(`WARNING Chat broadcast skipped: ${REDIS_REFUSED}`)
    skipAll(['fanout', 'consumer-send', 'client-merge'], 'the send never reached Redis')
    failed('notify', `notify_new_message logs: Failed to broadcast notification: ${REDIS_REFUSED}`)
    prov.push({
      from: 'redis down before connect',
      to: 'group_add raised at handshake',
      because: 'ChatConsumer caught it and set broadcast_enabled = False (consumers.py:72-74)',
    })
    prov.push({
      from: 'broadcast_enabled = False',
      to: 'the warning frame was sent',
      because: 'consumers.py:76-78 sends {"type": "warning", ...} right after accept()',
    })
    prov.push({
      from: 'warning frame',
      to: 'socketError = true, poll starts',
      because: 'DirectMessagePage.jsx:238-240 sets socketError on a warning payload',
    })
  } else if (!sock.connected) {
    // Redis is fine; the second browser simply has no socket.
    ran('broadcast', 'get_channel_layer() returns the configured RedisChannelLayer', D.broadcast)
    ran('group-send', 'group_send("chat_room_7", {"type": "chat.event", "payload": ...})', D.groupSend)
    ran('fanout', 'Redis delivers to every channel name in the group', D.fanout)
    if (s.token === 'valid-non-member') {
      skipAll(['consumer-send', 'client-merge'], 'that user was never added to chat_room_7')
    } else {
      skipAll(['consumer-send', 'client-merge'], 'the second browser holds no channel in this group')
    }
    ran('notify', 'group_send("notifications_<vendor id>", {"type": "notification.new", ...})', D.notify)
    prov.push({
      from: sock.closeCode === 4403 ? 'close 4403' : 'no socket',
      to: 'the group has one member, not two',
      because: 'group_add only ran for the sockets that completed connect()',
    })
  } else {
    // The healthy path.
    ran('broadcast', 'broadcast_room_event(7, {"type": "message", ...}) (views.py:139)', D.broadcast)
    ran(
      'group-send',
      'group_send("chat_room_7", {"type": "chat.event", "payload": {"type": "message", ...}})',
      D.groupSend,
    )
    ran('fanout', 'Redis delivers to both channel names registered in chat_room_7', D.fanout)
    ran(
      'consumer-send',
      'Channels turns the event type "chat.event" into the method name chat_event, ' +
        'which calls self.send(text_data=json.dumps(event["payload"])) (consumers.py:137-138)',
      D.consumerSend,
    )
    ran(
      'client-merge',
      'onmessage sees type "message", appendMessages() merges by id into a Map and sorts by created_at',
      D.clientMerge,
    )
    counterpartSees = true
    counterpartAt = t
    pushLatency = t
    ran('notify', 'group_send("notifications_<vendor id>", {"type": "notification.new", ...})', D.notify)
    transcript.push('[chat_room_7] chat.event -> 2 channels')
    prov.push({
      from: 'group_add at connect',
      to: 'chat_room_7 has 2 members',
      because: 'both sockets completed connect() while the channel layer was reachable',
    })
    prov.push({
      from: 'group_send',
      to: 'the second browser rendered the message',
      because: 'Redis fanned the event out to every channel name in the group',
    })
  }

  // 12. the response ------------------------------------------------------
  if (socketWriter) {
    ran(
      'http-201',
      sock.broadcastEnabled
        ? 'no POST on this path: _handle_send already wrote the row and broadcast it'
        : '_broadcast returned False, so ChatConsumer echoes the message back to the sender ' +
          'alone with send_json (consumers.py:110-111)',
      1,
    )
    transcript.push(
      sock.broadcastEnabled
        ? 'ws frame in:  {"type": "send_message", "text": "..."}'
        : 'ws frame out: {"type": "message", "message": {...}}   (sender only)',
    )
  } else {
    ran('http-201', 'HTTP 201 Created, and the sender appends its own copy (jsx:381)', 1)
    transcript.push('POST /api/chat/rooms/7/messages/ 201 (Created)')
  }

  // 13. the fallback ------------------------------------------------------
  const polled = pushPoll(slots, s, sock, transcript)
  if (polled && !counterpartSees) {
    counterpartSees = true
    counterpartAt = s.pollIntervalMs
    prov.push({
      from: 'socketError = true',
      to: `a GET every ${s.pollIntervalMs} ms`,
      because: 'the poll effect runs while socketError is set (DirectMessagePage.jsx:258-264)',
    })
    prov.push({
      from: 'the poll tick',
      to: 'the second browser caught up',
      because: 'fetchMessages() re-reads the room from the database, which always had the row',
    })
  }

  // The outcome ------------------------------------------------------------
  let variant: Variant
  let reason: string

  if (s.token === 'valid-non-member') {
    variant = 'blocked-by-authz'
    reason =
      'The watching user is not a participant in room 7. The socket closed 4403 and the GET would ' +
      'answer 403 too, so no fallback exists and none should: this failure is the authorization ' +
      'check working.'
  } else if (counterpartSees && pushLatency !== null) {
    variant = 'delivered-push'
    reason = `Committed, then broadcast. The second browser rendered it about ${pushLatency} ms later (illustrative).`
  } else if (counterpartSees) {
    variant = 'delivered-poll'
    reason =
      `Nothing was pushed, but the client knew it was degraded and fell back to a GET every ` +
      `${s.pollIntervalMs} ms. The row was in the database the whole time.`
  } else {
    variant = 'durable-not-delivered'
    reason =
      'The row is committed and the POST returned 201, but the broadcast was swallowed and nothing ' +
      'told the client it was degraded. The second browser stays stale until it reloads.'
  }

  return assemble(s, sock, slots, transcript, prov, {
    variant,
    reason,
    messageDurable: true,
    httpStatus: socketWriter ? null : 201,
    httpDetail: socketWriter ? 'no HTTP request on the socket write path' : 'Created',
    counterpartSees,
    counterpartSeesAtMs: counterpartAt,
    pushLatencyMs: pushLatency,
  })
}

/** The poll slot. Returns whether the poll is running, which is the only thing
 *  that can recover a message the overlay failed to deliver. */
function pushPoll(slots: Slot[], s: SceneState, sock: SocketReport, transcript: string[]): boolean {
  // A non-member gets 403 from the GET as well, so the poll cannot recover
  // anything for them. This is the one case where the fallback is correctly absent.
  if (s.token === 'valid-non-member') {
    slots.push({
      ...SLOT_META['poll-tick'],
      status: 'skipped',
      detail: 'the GET answers 403 for a non-participant too (views.py:119-120)',
      atMs: null,
    })
    return false
  }
  if (!sock.socketError) {
    slots.push({
      ...SLOT_META['poll-tick'],
      status: 'skipped',
      detail:
        'socketError is false, so the poll effect never mounts. Nothing is wrong as far as the client knows.',
      atMs: null,
    })
    return false
  }
  if (s.token === 'expired' || s.token === 'absent' || !s.viteProxy) {
    slots.push({
      ...SLOT_META['poll-tick'],
      status: 'failed',
      detail: !s.viteProxy
        ? 'the GET 404s on :5173 for the same reason the POST did'
        : 'the GET carries the same rejected token and answers 401',
      atMs: null,
    })
    return false
  }
  slots.push({
    ...SLOT_META['poll-tick'],
    status: 'ran',
    detail: `GET /api/chat/rooms/7/messages/ every ${s.pollIntervalMs} ms while socketError is set`,
    atMs: s.pollIntervalMs,
  })
  transcript.push(`GET /api/chat/rooms/7/messages/ 200 (OK)   [poll, every ${s.pollIntervalMs} ms]`)
  return true
}

interface Partial1 {
  variant: Variant
  reason: string
  messageDurable: boolean
  httpStatus: number | null
  httpDetail: string
  counterpartSees: boolean
  counterpartSeesAtMs: number | null
  pushLatencyMs: number | null
}

function assemble(
  s: SceneState,
  sock: SocketReport,
  slots: Slot[],
  transcript: string[],
  provenance: ProvEdge[],
  p: Partial1,
): Outcome {
  const sends = s.concurrentSends ? 2 : 1
  const written = p.messageDurable ? sends : 0
  const dbRowCount = ROWS_BEFORE + written
  const screenRowCount = ROWS_BEFORE + (p.counterpartSees ? written : 0)

  // The sender is a member of chat_room_7 too, so its own message comes back to
  // it over the socket as well as in the 201 body. Two arrivals, one id: the Map
  // in appendMessages is what stops it rendering twice.
  const senderDoubleDelivery = p.variant === 'delivered-push' && s.sendPath === 'rest'

  // Who actually completed group_add. The two sockets are independent: each
  // joined only if its own handshake got that far, and only if there was a
  // reachable channel layer at that moment.
  const layerWasUpAtConnect = s.redis === 'up' || s.redis === 'down-after-connect'
  const groupMembers: string[] = []
  if (layerWasUpAtConnect) {
    groupMembers.push('specific.<sender channel>')
    if (sock.connected && sock.broadcastEnabled) groupMembers.push('specific.<counterpart channel>')
  }
  // And whether we can still read that set back. With Redis unreachable the
  // membership is not zero, it is unknown, and saying "2" would claim knowledge
  // the running system does not have.
  const groupMembersReadable = s.redis === 'up'

  const ordering = s.concurrentSends && p.variant === 'delivered-push'
    ? {
        arrival: ['msg 5 (vendor)', 'msg 4 (organizer)'],
        onScreen: ['msg 4 (organizer)', 'msg 5 (vendor)'],
        tie: false,
      }
    : null

  return {
    slots,
    variant: p.variant,
    reason: p.reason,
    messageDurable: p.messageDurable,
    httpStatus: p.httpStatus,
    httpDetail: p.httpDetail,
    counterpartSees: p.counterpartSees,
    counterpartSeesAtMs: p.counterpartSeesAtMs,
    socket: sock,
    groupMembers,
    groupMembersReadable,
    pollActive: slots.some((x) => x.id === 'poll-tick' && x.status === 'ran'),
    dbRowCount,
    screenRowCount,
    divergence: dbRowCount - screenRowCount,
    queriesPerMinute: Math.round((60000 / s.pollIntervalMs) * s.openRooms),
    pushLatencyMs: p.pushLatencyMs,
    transcript: [...sock.log, ...transcript],
    provenance,
    senderDoubleDelivery,
    ordering,
  }
}

// ---------------------------------------------------------------------------
// Slot metadata: the label, the actor and the source line, one place only
// ---------------------------------------------------------------------------

type SlotMeta = Omit<Slot, 'status' | 'detail' | 'atMs'>

export const SLOT_META: Record<SlotId, SlotMeta> = {
  compose: {
    id: 'compose',
    label: 'the organizer types',
    actor: 'client',
    source: 'frontend/src/pages/DirectMessagePage.jsx:160-164',
  },
  'proxy-http': {
    id: 'proxy-http',
    label: 'Vite forwards the POST',
    actor: 'proxy',
    source: 'frontend/vite.config.js:14-18',
  },
  authz: {
    id: 'authz',
    label: 'is this user in the room',
    actor: 'django',
    source: 'backend/main/chat/views.py:127',
  },
  'db-insert': {
    id: 'db-insert',
    label: 'the row is written',
    actor: 'db',
    source: 'backend/main/chat/views.py:134',
  },
  'db-delivered': {
    id: 'db-delivered',
    label: 'delivered_at is stamped',
    actor: 'db',
    source: 'backend/main/chat/views.py:135',
  },
  serialize: {
    id: 'serialize',
    label: 'the row becomes JSON',
    actor: 'django',
    source: 'backend/main/chat/views.py:138',
  },
  broadcast: {
    id: 'broadcast',
    label: 'is there a channel layer',
    actor: 'django',
    source: 'backend/main/chat/utils.py:32-35',
  },
  'group-send': {
    id: 'group-send',
    label: 'send to the room group',
    actor: 'redis',
    source: 'backend/main/chat/utils.py:36-43',
  },
  fanout: {
    id: 'fanout',
    label: 'Redis fans out to the group',
    actor: 'redis',
    source: "settings.py:92-99, 'channels_redis.core.RedisChannelLayer'",
  },
  'consumer-send': {
    id: 'consumer-send',
    label: 'chat.event becomes chat_event',
    actor: 'consumer',
    source: 'backend/main/chat/consumers.py:137-138',
  },
  'client-merge': {
    id: 'client-merge',
    label: 'the second browser merges it',
    actor: 'counterpart',
    source: 'frontend/src/pages/DirectMessagePage.jsx:126-138',
  },
  notify: {
    id: 'notify',
    label: 'the notification badge',
    actor: 'redis',
    source: 'backend/main/notifications/utils.py:31-58',
  },
  'http-201': {
    id: 'http-201',
    label: 'the sender gets its copy',
    actor: 'client',
    source: 'backend/main/chat/views.py:142, frontend jsx:380-381',
  },
  'poll-tick': {
    id: 'poll-tick',
    label: 'the fallback poll',
    actor: 'counterpart',
    source: 'frontend/src/pages/DirectMessagePage.jsx:258-264',
  },
}

export const SLOT_ORDER: SlotId[] = [
  'compose',
  'proxy-http',
  'authz',
  'db-insert',
  'db-delivered',
  'serialize',
  'broadcast',
  'group-send',
  'fanout',
  'consumer-send',
  'client-merge',
  'notify',
  'http-201',
  'poll-tick',
]

// ---------------------------------------------------------------------------
// The state round trip. Excursion 1 depends on this being honest: a reader's
// script encodes a state, the scene decodes it and runs the same run().
// ---------------------------------------------------------------------------

export function encodeState(s: SceneState): string {
  return [
    s.redis,
    s.token,
    s.sendPath,
    s.server,
    s.viteProxy ? '1' : '0',
    String(s.pollIntervalMs),
    String(s.openRooms),
    s.concurrentSends ? '1' : '0',
  ].join('~')
}

export function decodeState(raw: string): SceneState | null {
  const p = raw.split('~')
  if (p.length !== 8) return null
  const [redis, token, sendPath, server, proxy, poll, rooms, concurrent] = p
  const redisOk = ['up', 'not-configured', 'down-before-connect', 'down-after-connect']
  const tokenOk = ['valid', 'expired', 'absent', 'valid-non-member']
  if (!redisOk.includes(redis) || !tokenOk.includes(token)) return null
  if (sendPath !== 'rest' && sendPath !== 'socket') return null
  if (server !== 'daphne' && server !== 'runserver') return null
  const pollMs = Number(poll)
  const roomCount = Number(rooms)
  if (!Number.isFinite(pollMs) || pollMs <= 0) return null
  if (!Number.isFinite(roomCount) || roomCount <= 0) return null
  return {
    redis: redis as RedisState,
    token: token as TokenState,
    sendPath,
    server,
    viteProxy: proxy === '1',
    pollIntervalMs: pollMs,
    openRooms: roomCount,
    concurrentSends: concurrent === '1',
  }
}
