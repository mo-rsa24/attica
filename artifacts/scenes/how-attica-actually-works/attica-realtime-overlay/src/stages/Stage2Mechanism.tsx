// The load-bearing machinery, named exactly. This is where the claim card lives
// in a map-first scene: reached by asking why the socket path is worth having,
// rather than shown as a title card before anyone has seen the system.

import { EXCURSIONS } from '../engagement'
import { run } from '../model'
import { useStore } from '../store'
import { CodeBlock } from '../ui/CodeBlock'
import { Excursion } from '../ui/Excursion'
import { Race } from '../ui/Race'

export function Stage2Mechanism() {
  const { state, setFocus } = useStore()
  const o = run(state)
  const swallow = EXCURSIONS.find((e) => e.id === 'swallow')!

  return (
    <>
      <div className="card">
        <h2>Why not just poll?</h2>
        <p className="lede">
          This is the comparison the architecture is making, and Attica has already made it in both
          directions: the socket is the fast path, and a GET every eight seconds is the fallback it
          keeps in the same file. Both lanes below deliver the same message from the same committed
          row.
        </p>
        <Race />
      </div>

      <div className="card">
        <h3>What a channel layer is actually for</h3>
        <p>
          The obvious question about the fast path: the view already knows the message, and the
          consumer already holds the socket, so why does a message need to go out to Redis and come
          back?
        </p>
        <p>
          Because they are not the same thing. The POST is handled by whichever worker picked it up.
          The counterpart's socket is held by whichever worker accepted that handshake. In one dev
          process they happen to coincide; under any real deployment they do not, and a consumer has
          no way to reach a socket it is not holding.
        </p>
        <p>
          So membership is kept outside every worker. <code>group_add</code> writes this socket's
          channel name into a set in Redis named <code>chat_room_7</code>. Any process at all can
          then address that set.
        </p>
        <CodeBlock snippet="layers" hot={94} caption="One line of settings decides whether the system can have a second worker." />
        <p style={{ marginBottom: 0 }}>
          Right now the group has <strong>{o.groupMembers.length}</strong> member
          {o.groupMembers.length === 1 ? '' : 's'}
          {o.groupMembersReadable
            ? o.groupMembers.length > 0 && <>: {o.groupMembers.join(', ')}</>
            : ', and with Redis unreachable that set cannot be read back at all'}
          .{' '}
          <button className="opt" onClick={() => setFocus('channel-layer')}>
            open the channel layer →
          </button>
        </p>
      </div>

      <div className="card">
        <h3>The dot becomes an underscore</h3>
        <p>
          The one piece of Channels machinery that is not obvious from reading either file alone.
          The envelope carries a <code>"type"</code>, and Channels turns that string into a method
          name by replacing dots with underscores, then calls it on every consumer in the group.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <CodeBlock snippet="broadcast" hot={40} />
          <CodeBlock snippet="dispatch" hot={137} />
        </div>
        <p style={{ marginBottom: 0 }}>
          <code>"chat.event"</code> on the left. <code>chat_event</code> on the right. Nothing else
          connects those two files, and if you rename one without the other the message is delivered
          to Redis, fanned out correctly, and then silently dropped by every consumer.
        </p>
      </div>

      <div className="card">
        <h3>The seam: where durable stops and best effort starts</h3>
        <p>
          One function marks the boundary, and its docstring states the whole architecture in a
          sentence. Read the <code>except</code>.
        </p>
        <CodeBlock snippet="broadcast" hot={19} caption="A bare except around the only line that can fail, and a log call instead of a raise." />
        <p>
          That is a deliberate decision, not an oversight. It says: a failure to <em>tell</em> people
          must never become a failure to <em>record</em>. The caller carries on, the response is 201,
          and the row is exactly as durable as it would have been on a perfect day.
        </p>
        <p style={{ marginBottom: 0 }}>
          It also has a cost, and the cost is that nobody upstream can distinguish a delivered
          message from an undelivered one. Stage 3 is what that buys you.
        </p>
        <Excursion ex={swallow} />
      </div>

      <div className="card">
        <h3>The merge is why arrival order does not matter</h3>
        <p>
          The client never trusts the wire for ordering. Every message that arrives, by socket or by
          poll or in a POST response, goes through one function that keys by id and sorts by{' '}
          <code>created_at</code>.
        </p>
        <CodeBlock snippet="merge" hot={135} />
        <p>
          Two things fall out of this for free. Duplicate delivery is harmless, which matters because
          the sender genuinely does receive its own message twice: once in the 201 body and once
          through its own fan-out.{' '}
          {o.senderDoubleDelivery && (
            <span className="pill warn">happening right now in this configuration</span>
          )}
        </p>
        <p style={{ marginBottom: 0 }}>
          And out-of-order arrival is corrected on render rather than prevented on the wire. The one
          leak: <code>Array.prototype.sort</code> is stable, so two messages with an identical{' '}
          <code>created_at</code> keep the order they arrived in. That tie is the only case where the
          socket's ordering reaches the screen.
        </p>
      </div>
    </>
  )
}
