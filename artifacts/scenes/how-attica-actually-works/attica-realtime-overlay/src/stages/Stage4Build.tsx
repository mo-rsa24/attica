// Build it. Python and JavaScript, because that is what you will meet this
// concept in professionally and it is what Attica is written in.
//
// Every step opens with the previous step's failure, then the smallest code that
// answers it, then the same scenario surviving, then what it charged. Never a
// fix before its failure.

import { useState } from 'react'
import { RawCode } from '../ui/CodeBlock'

interface Step {
  n: number
  title: string
  /** The failure this step exists to answer. Always first. */
  failure: string
  body: string
  file: string
  lang: 'python' | 'javascript' | 'bash'
  code: string
  hot?: number[]
  run: string
  /** The scenario from `failure`, now surviving. */
  survives: string
  cost: string
}

const STEPS: Step[] = [
  {
    n: 1,
    title: 'One endpoint that writes a row',
    failure:
      'Nothing exists yet. Two people cannot exchange anything, so start with the only part that is ' +
      'not optional: making a message durable.',
    body:
      'A plain DRF view. It checks that you belong in the room, writes, and returns the row. No ' +
      'sockets, no Redis, no real-time anything. This is the entire foundation and it never changes ' +
      'again for the rest of the build.',
    file: 'chat/views.py',
    lang: 'python',
    code: `class ChatMessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        if request.user not in [room.organizer, room.vendor]:
            return Response({"detail": "Forbidden"}, status=403)
        messages = room.messages.order_by('created_at')
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        if request.user not in [room.organizer, room.vendor]:
            return Response({"detail": "Forbidden"}, status=403)
        payload = request.data.copy()
        payload['room'] = room.id
        payload['sender'] = request.user.id
        serializer = MessageSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        return Response(MessageSerializer(message).data, status=201)`,
    run: `$ curl -X POST localhost:8000/api/chat/rooms/7/messages/ \\
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \\
    -d '{"text": "can you do the 14th?"}'
{"id":4,"room":7,"sender":2,"text":"can you do the 14th?","created_at":"..."}`,
    survives:
      'The row is in the database. Restart the server, drop every connection, come back tomorrow: it ' +
      'is still there. That is the property everything else in this build is allowed to lack.',
    cost:
      'The other person has no idea it happened. They will see it the next time they ask, and nothing ' +
      'makes them ask.',
  },
  {
    n: 2,
    title: 'Make them ask, on a timer',
    failure:
      'From step 1: the vendor is looking at the room and does not see the message. They have to ' +
      'reload the page to find out anything happened.',
    body:
      'The dumbest thing that works, and it does work. Re-fetch the room every few seconds and merge ' +
      'what comes back. Write the merge properly now, because every later step depends on it: key by ' +
      'id so duplicates are free, sort by created_at so arrival order never matters.',
    file: 'DirectMessagePage.jsx',
    lang: 'javascript',
    code: `const appendMessages = useCallback((incoming = []) => {
    setMessages((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));
        incoming.forEach((msg) => {
            if (msg?.id) byId.set(msg.id, {...(byId.get(msg.id) || {}), ...msg});
        });
        const merged = Array.from(byId.values());
        merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        return merged;
    });
}, []);

useEffect(() => {
    const interval = setInterval(() => { fetchMessages(); }, 8000);
    return () => clearInterval(interval);
}, [fetchMessages]);`,
    hot: [12, 13, 14, 15],
    run: `GET /api/chat/rooms/7/messages/ 200   [t=0s]
GET /api/chat/rooms/7/messages/ 200   [t=8s]   <- the message appears here
GET /api/chat/rooms/7/messages/ 200   [t=16s]
GET /api/chat/rooms/7/messages/ 200   [t=24s]`,
    survives:
      'Step 1\'s scenario now resolves on its own. The vendor sees the message without touching ' +
      'anything, within eight seconds.',
    cost:
      'Two of them. Latency you cannot reduce without paying for it linearly, and load you pay whether ' +
      'or not anything happened: 100 open rooms is 750 GETs a minute, and on a quiet afternoon every ' +
      'single one returns rows the browser already has.',
  },
  {
    n: 3,
    title: 'A socket, and the failure that makes channel layers necessary',
    failure:
      'From step 2: you want the message to arrive in milliseconds, and you want to stop paying for ' +
      'queries that find nothing.',
    body:
      'The obvious first attempt. Accept a socket, and when a message arrives on it, send it back out. ' +
      'Run this with two browsers open and watch it fail in the most instructive way available: each ' +
      'browser only ever hears itself.',
    file: 'chat/consumers.py',
    lang: 'python',
    code: `class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs'].get('room_id')
        await self.accept()

    async def receive_json(self, content, **kwargs):
        # self.send reaches exactly one socket: this one.
        await self.send_json({'type': 'message', 'message': content})`,
    run: `browser A: sends "hello"  ->  browser A receives "hello"
browser B: nothing
browser B: sends "hi"     ->  browser B receives "hi"
browser A: nothing`,
    survives:
      'Nothing survives here. This is the step that fails, and it fails because a consumer instance ' +
      'holds one socket and has no way to name any other. There is no shared anything.',
    cost:
      'Worth sitting with. The instinct is to keep a list of connected consumers in a module-level ' +
      'variable. That works until you run a second worker, and then half your users stop hearing each ' +
      'other for reasons nothing in your code explains.',
  },
  {
    n: 4,
    title: 'Put the membership somewhere both workers can see',
    failure:
      'From step 3: a consumer cannot reach a socket it does not hold, and an in-process list breaks ' +
      'the moment there are two processes.',
    body:
      'Two lines of settings and one line at connect. group_add writes this socket\'s channel name into ' +
      'a set in Redis. The set outlives the request, the worker, and the deployment.',
    file: 'settings.py and chat/consumers.py',
    lang: 'python',
    code: `CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {"hosts": [('127.0.0.1', 6379)]},
    },
}

# and in ChatConsumer.connect, before accept():
        self.room_group_name = f"chat_room_{self.room_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)`,
    hot: [7, 8],
    run: `$ redis-cli -n 0 --scan --pattern 'asgi*'
asgi:group:chat_room_7
$ redis-cli -n 0 ZRANGE asgi:group:chat_room_7 0 -1
1) "specific.KJHGfdsa!abc123"
2) "specific.KJHGfdsa!def456"`,
    survives:
      'Two sockets, two channel names, one set, visible from outside both workers. Nothing is delivered ' +
      'yet, but the addressing problem from step 3 is solved.',
    cost:
      'A new process you now depend on for real-time, and a new failure mode: this group_add can raise. ' +
      'Decide now what happens when it does, because that decision is the difference between a banner ' +
      'and a silent gap.',
  },
  {
    n: 5,
    title: 'Send to the group, and handle the failure you just created',
    failure:
      'From step 4: membership exists but nothing addresses it. And group_add can throw, which would ' +
      'take the whole handshake down with it.',
    body:
      'group_send addresses the set. The dispatch is the part worth reading twice: the "type" in the ' +
      'envelope becomes a method name with dots turned into underscores, and Channels calls it on every ' +
      'consumer in the group. Catch the group_add failure and degrade instead of dying, then tell the ' +
      'client so it can fall back to what you built in step 2.',
    file: 'chat/consumers.py',
    lang: 'python',
    code: `    async def connect(self):
        self.broadcast_enabled = True
        self.room_group_name = f"chat_room_{self.room_id}"
        try:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        except Exception as exc:
            logger.warning("Failed to join chat group %s: %s", self.room_group_name, exc)
            self.broadcast_enabled = False
        await self.accept()
        if not self.broadcast_enabled:
            await self.send_json({"type": "warning",
                "detail": "Realtime updates unavailable; refresh to see new messages."})

    async def chat_event(self, event):
        await self.send(text_data=json.dumps(event['payload']))`,
    hot: [4, 5, 6, 7, 9, 10, 11],
    run: `browser A: sends "hello"  ->  A receives "hello", B receives "hello"   [~15 ms]`,
    survives:
      'Step 3\'s scenario now works: both browsers hear each other, through two different worker ' +
      'processes if you run two. And step 4\'s new failure is handled, with the client told about it.',
    cost:
      'The warning frame is doing quiet, essential work. Without it the client has no way to know it ' +
      'is degraded, and the poll from step 2 never mounts.',
  },
  {
    n: 6,
    title: 'Move the broadcast to the writer',
    failure:
      'From step 5: the socket is now a write path. A message only exists if the socket delivered it, ' +
      'which means a socket problem is a data problem.',
    body:
      'This is the step that makes the architecture REST-first rather than socket-first, and it is one ' +
      'function plus one line in the view. The view writes, then broadcasts. The broadcast helper ' +
      'swallows its own errors so that a delivery failure can never reach the caller.',
    file: 'chat/utils.py and chat/views.py',
    lang: 'python',
    code: `def broadcast_room_event(room_id: int, payload: dict) -> None:
    channel_layer = get_channel_layer()
    if not channel_layer:
        logger.info("Chat broadcast skipped: no channel layer configured")
        return
    try:
        async_to_sync(channel_layer.group_send)(
            f"chat_room_{room_id}",
            {"type": "chat.event", "payload": payload},
        )
    except Exception as exc:
        logger.warning("Chat broadcast skipped: %s", exc)


# in ChatMessageListCreateView.post, after the row is written and serialized:
        serialized = MessageSerializer(message).data
        broadcast_room_event(room.id, {"type": "message", "message": serialized})
        return Response(serialized, status=201)`,
    hot: [11, 12, 16],
    run: `POST /api/chat/rooms/7/messages/ 201 (Created)     [4 ms, the write]
[chat_room_7] chat.event -> 2 channels                [3 ms, the telling]`,
    survives:
      'Both earlier scenarios hold, and a new property appears that neither had: the ordering. The row ' +
      'is committed on line 134 and the broadcast happens on line 139. There is no arrangement of ' +
      'failures that reverses those two.',
    cost:
      'The client now receives its own message twice, once in the 201 body and once through its own ' +
      'fan-out. Step 2\'s merge already handles it, which is why that step wrote the Map properly.',
  },
  {
    n: 7,
    title: 'Kill Redis and prove it',
    failure:
      'From step 6: you have asserted that the overlay is droppable. Assertions are not evidence.',
    body:
      'Run the whole thing, open two browsers, stop Redis, and send. Then look in three places: the ' +
      'server log, the HTTP response, and the database.',
    file: 'terminal',
    lang: 'bash',
    code: `# with both browsers open and connected
$ redis-cli shutdown nosave

# browser A sends a message. server log:
WARNING Chat broadcast skipped: Error 111 connecting to 127.0.0.1:6379. Connection refused.

# browser A's network tab:
POST /api/chat/rooms/7/messages/ 201 (Created)

# and the database:
$ python manage.py shell -c "from chat.models import Message; \\
    print(Message.objects.filter(room_id=7).count())"
4`,
    run: `browser A: shows the message (it came back in the 201 body)
browser B: shows nothing, and reports no error
browser B after F5: shows the message`,
    survives:
      'The claim, on your own machine. The delivery failed completely and the row is untouched. Reload ' +
      'and everything is there, because the database never depended on any of it.',
    cost:
      'And now the honest half. Browser B was stale and nothing told it so. The 201 said success to the ' +
      'sender while the recipient got nothing, and no code anywhere is watching for that gap. If you ' +
      'want it watched, you have to build it: a heartbeat on the socket, an ack, or a periodic ' +
      'reconciliation. Attica has none of those, and that is the real price of the design.',
  },
]

export function Stage4Build() {
  const [i, setI] = useState(0)
  const s = STEPS[i]

  return (
    <>
      <div className="card">
        <h2>Build it, in the order the failures force</h2>
        <p className="lede">
          Seven steps, each one starting from the previous step's failure. If you type them out you
          end up with Attica's chat path, and more usefully you end up knowing why each line is
          there.
        </p>
        <div className="ctl">
          {STEPS.map((st, n) => (
            <button key={st.n} className="opt" aria-pressed={n === i} onClick={() => setI(n)}>
              {st.n}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
          STEP {s.n} OF 7 · THE FAILURE THIS ANSWERS
        </div>
        <p style={{ margin: '5px 0 14px', color: 'var(--warn)', fontSize: 14 }}>{s.failure}</p>

        <h3>{s.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{s.body}</p>

        <RawCode code={s.code} lang={s.lang} file={s.file} hotLines={s.hot} />

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
          RUN IT
        </div>
        <div className="term" style={{ marginTop: 5 }}>
          {s.run}
        </div>

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em', marginTop: 14 }}>
          THE SAME SCENARIO, NOW
        </div>
        <p style={{ fontSize: 14, marginTop: 4 }}>{s.survives}</p>

        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.05em' }}>
          WHAT IT CHARGED
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-dim)', marginTop: 4, marginBottom: 0 }}>{s.cost}</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="opt" disabled={i === 0} onClick={() => setI(i - 1)}>
            ← previous
          </button>
          <button className="opt" disabled={i === STEPS.length - 1} onClick={() => setI(i + 1)}>
            next step →
          </button>
        </div>
      </div>

      {i === STEPS.length - 1 && (
        <div className="card">
          <h3>What you can now say without looking</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--ink-dim)' }}>
            <li>Why the write has to precede the broadcast, and what breaks if you swap them.</li>
            <li>What a channel layer is for, in one sentence about two worker processes.</li>
            <li>
              How <code>chat.event</code> reaches <code>chat_event</code>, and what happens if you
              rename one of them.
            </li>
            <li>How to tell 4401 from 4403 from a silent gap, from the symptom alone.</li>
            <li>When the eight-second poll is the better answer, and it genuinely sometimes is.</li>
          </ul>
        </div>
      )}
    </>
  )
}
