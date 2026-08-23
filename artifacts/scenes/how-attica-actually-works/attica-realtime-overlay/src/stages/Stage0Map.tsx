// The entry level. The scene opens on the map, so this stage is orientation for
// the surface above it, not a separate lesson: what the four boxes are, what the
// two line styles mean, and what to click first.

import { LEVELS, NODES } from '../atlas'
import { useStore } from '../store'

export function Stage0Map() {
  const { setFocus } = useStore()
  return (
    <>
      <div className="card">
        <h2>Four processes, and one of them is optional</h2>
        <p className="lede">
          Attica is a Django REST API with a WebSocket overlay bolted alongside it. The map above is
          the whole system: a browser, one ASGI server holding both protocols, Redis, and the
          database. Everything the scene argues comes down to which of those four you can lose
          without losing data.
        </p>
        <p>
          Click any box to see what it is and what it is doing right now. Boxes with a corner mark
          open: double-click, or use the button in the panel, and the map becomes what is inside
          them.
        </p>
      </div>

      <div className="card">
        <h3>The two line styles, and they never change meaning</h3>
        <dl className="kv" style={{ marginTop: 8 }}>
          <dt>solid</dt>
          <dd>
            a durable path. It either completed or the request failed loudly. The write to SQLite is
            the only one on this board.
          </dd>
          <dt>dashed</dt>
          <dd>
            best effort. It can fail and nothing upstream will learn about it. Every real-time path
            in Attica is one of these, on purpose.
          </dd>
        </dl>
        <p style={{ marginTop: 10, fontSize: 13.5, color: 'var(--ink-dim)' }}>
          That asymmetry is the design. A dashed line is allowed to fail precisely because a solid
          one already finished.
        </p>
      </div>

      <div className="card">
        <h3>Where you can go from here</h3>
        {LEVELS.map((l) => (
          <div key={l.id} style={{ padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.06em' }}>
              {l.id}
            </span>
            <div style={{ fontSize: 13.5 }}>
              <strong>{l.blurb}.</strong>{' '}
              <span style={{ color: 'var(--ink-dim)' }}>{l.reveals}</span>
            </div>
          </div>
        ))}
        <div className="ctl" style={{ marginTop: 12 }}>
          <label>jump to</label>
          {['daphne', 'browser'].map((id) => (
            <button key={id} className="opt" onClick={() => setFocus(id)}>
              inside {NODES.find((n) => n.id === id)?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>The one asymmetry worth carrying with you</h3>
        <p style={{ marginBottom: 0 }}>
          Redis holds no messages. Not one. It holds the set of sockets currently in each room, and
          it copies envelopes between processes. If it vanished this second, every message ever sent
          in Attica would still be in <code>db.sqlite3</code>. Kill it from the map and watch which
          readout at the bottom moves and which one does not.
        </p>
      </div>
    </>
  )
}
