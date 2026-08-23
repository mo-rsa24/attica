// The pipeline atlas. Opening a box preserves the world: the parent keeps its
// outline, the breadcrumb stays live, and nothing about the bench moves.

import { EDGES, LEVELS, NODES, edgesAt, nodeById, nodesAt, trail } from '../pipeline'
import type { Config, Outcome } from '../model'
import { useStore } from '../store'

const W = 1000
const H = 400

type Tone = 'ok' | 'warn' | 'bad' | 'none'

/** Node colour derives from the outcome, never from a renderer rule. */
function tone(id: string, o: Outcome, cfg: Config): Tone {
  const w = o.world
  switch (id) {
    case 'app':
      return o.incidentsBySource.application_check > 0 ? 'ok' : o.silent ? 'bad' : 'none'
    case 'db':
      return cfg.vendor === 'postgresql' ? 'ok' : 'warn'
    case 'jobs':
      return w.slots.length > 0 ? 'ok' : w.materializeRuns > 0 ? 'warn' : 'none'
    case 'incidents':
      return w.incidents.length > 0 ? 'ok' : o.silent ? 'bad' : 'none'
    case 'slot':
      return w.slots.length === 0 ? 'bad' : w.slots[0].isBookable ? 'ok' : 'warn'
    case 'booking':
      return o.overbooked ? 'bad' : o.activeBookings > 0 ? 'ok' : 'none'
    case 'hold':
      return w.holds.some((h) => h.status === 'expired' && h.paidAtMin !== null)
        ? 'bad'
        : w.holds.some((h) => h.status === 'active')
          ? 'ok'
          : 'none'
    case 'exclusion':
      return cfg.vendor === 'postgresql' ? 'ok' : 'bad'
    case 'checkconstraint':
      return w.crashed ? 'bad' : 'ok'
    case 'uniqslot':
      return w.materializeRuns > 1 ? 'ok' : 'none'
    case 'lockphase':
      return cfg.locking === 'none' ? 'bad' : 'ok'
    case 'reservephase':
      return w.crashed ? 'bad' : 'none'
    case 'expireandmat':
      return 'bad'
    case 'exception':
      return cfg.blackout ? 'warn' : 'none'
    default:
      return 'none'
  }
}

function liveValue(id: string, o: Outcome, cfg: Config): string | null {
  const w = o.world
  switch (id) {
    case 'db':
      return cfg.vendor === 'postgresql' ? 'exclusion constraint present' : 'constraint_present: None'
    case 'incidents':
      return `${w.incidents.length} row(s)`
    case 'slot':
      return w.slots.length ? o.capacityLine : 'no rows'
    case 'booking':
      return `${o.activeBookings} active`
    case 'jobs':
      return `${w.materializeRuns} materialize run(s)`
    case 'hold':
      return w.holds.length ? `${w.holds[0].status}, expires t+${w.holds[0].holdExpiresAtMin}` : 'none'
    case 'lockphase':
      return cfg.locking === 'none' ? 'switched off' : w.lockHeldBy ? `held by ${w.lockHeldBy}` : 'free'
    case 'exclusion':
      return cfg.vendor === 'postgresql' ? 'created' : 'never created on this vendor'
    case 'expireandmat':
      return 'ImportError on start'
    default:
      return null
  }
}

export function Map({ outcome, config }: { outcome: Outcome; config: Config }) {
  const { focus, setFocus, selected, select } = useStore()
  const parent = focus ? nodeById(focus) : null
  const nodes = nodesAt(focus)
  const edges = edgesAt(focus)
  const crumbs = trail(focus)
  const level = nodes[0]?.level ?? 'ECOSYSTEM'

  const open = (kind: 'node' | 'edge', id: string, el: Element) =>
    select({ kind, id, anchor: el.getBoundingClientRect() })

  return (
    <div className="board">
      <div className="breadcrumb" data-tour="breadcrumb">
        <button onClick={() => setFocus(null)} className={crumbs.length === 0 ? 'here' : ''}>
          the whole system
        </button>
        {crumbs.map((c, i) => (
          <span key={c.id} style={{ display: 'contents' }}>
            <span className="sep">›</span>
            <button onClick={() => setFocus(c.id)} className={i === crumbs.length - 1 ? 'here' : ''}>
              {c.label}
            </button>
          </span>
        ))}
        <span className="level">
          {level} · {LEVELS.find((l) => l.id === level)?.reveals}
        </span>
      </div>

      <svg className="map" viewBox={`0 0 ${W} ${H}`} role="img" data-tour="map">
        <defs>
          <marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="currentColor" />
          </marker>
        </defs>

        {parent && (
          <g className="nd ctx">
            <rect className="body" x={20} y={18} width={W - 40} height={H - 46} rx={12} />
            <text x={36} y={42}>
              inside {parent.label}
            </text>
          </g>
        )}

        {edges.map((e) => {
          const a = nodeById(e.from)
          const b = nodeById(e.to)
          if (!a || !b) return null
          const d = path(a, b)
          const mid = midOf(a, b)
          const isSel = selected?.kind === 'edge' && selected.id === e.id
          return (
            <g
              key={e.id}
              className={`ed ${e.bestEffort ? 'best' : ''} ${isSel ? 'sel' : ''}`}
              onClick={(ev) => open('edge', e.id, ev.currentTarget)}
              style={{ color: 'var(--ink-faint)' }}
            >
              <path className="hit" d={d} />
              <path className="line" d={d} markerEnd="url(#ar)" />
              <g transform={`translate(${mid.x} ${mid.y - 8})`}>
                <rect
                  x={-e.short.length * 3.3 - 5}
                  y={-9}
                  width={e.short.length * 6.6 + 10}
                  height={15}
                  rx={3}
                  fill="var(--bg)"
                  opacity={0.93}
                />
                <text textAnchor="middle" y={2}>
                  {e.short}
                </text>
              </g>
              <title>{e.carries}</title>
            </g>
          )
        })}

        {nodes.map((n) => {
          const t = tone(n.id, outcome, config)
          const isSel = selected?.kind === 'node' && selected.id === n.id
          const live = liveValue(n.id, outcome, config)
          return (
            <g
              key={n.id}
              className={`nd ${t} ${isSel ? 'sel' : ''}`}
              data-tour={`node:${n.id}`}
              onClick={(e) => open('node', n.id, e.currentTarget)}
              onDoubleClick={() => n.opens && setFocus(n.id)}
            >
              <rect className="body" x={n.x} y={n.y} width={n.w} height={n.h} rx={9} />
              {wrap(n.label, Math.floor(n.w / 7.4)).map((ln, i) => (
                <text className="name" key={i} x={n.x + 12} y={n.y + 22 + i * 15}>
                  {ln}
                </text>
              ))}
              {live && (
                <text className="live" x={n.x + 12} y={n.y + n.h - 10}>
                  {live}
                </text>
              )}
              {n.opens && (
                <path
                  className="opens"
                  d={`M${n.x + n.w - 20} ${n.y + n.h - 11} l7 -7 M${n.x + n.w - 13} ${n.y + n.h - 18} l-7 0 M${n.x + n.w - 13} ${n.y + n.h - 18} l0 7`}
                />
              )}
              <title>{n.opens ? 'click to inspect, double-click to open' : 'click to inspect'}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

type Box = { x: number; y: number; w: number; h: number }

function path(a: Box, b: Box) {
  const sameRow = Math.abs(a.y - b.y) < 24
  if (sameRow) {
    const ltr = b.x > a.x
    const x1 = ltr ? a.x + a.w : a.x
    const x2 = ltr ? b.x : b.x + b.w
    const y = a.y + a.h / 2
    const mx = (x1 + x2) / 2
    return `M${x1} ${y} C ${mx} ${y}, ${mx} ${y}, ${x2} ${y}`
  }
  const down = b.y > a.y
  const x1 = a.x + a.w / 2
  const y1 = down ? a.y + a.h : a.y
  const x2 = b.x + b.w / 2
  const y2 = down ? b.y : b.y + b.h
  const my = (y1 + y2) / 2
  return `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`
}

function midOf(a: Box, b: Box) {
  const sameRow = Math.abs(a.y - b.y) < 24
  if (sameRow) {
    const ltr = b.x > a.x
    const x1 = ltr ? a.x + a.w : a.x
    const x2 = ltr ? b.x : b.x + b.w
    return { x: (x1 + x2) / 2, y: a.y + a.h / 2 }
  }
  const down = b.y > a.y
  return {
    x: (a.x + a.w / 2 + b.x + b.w / 2) / 2,
    y: down ? (a.y + a.h + b.y) / 2 : (a.y + b.y + b.h) / 2,
  }
}

function wrap(text: string, per: number): string[] {
  const words = text.split(' ')
  const out: string[] = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > per) {
      out.push(line.trim())
      line = word
    } else line += ' ' + word
  }
  if (line.trim()) out.push(line.trim())
  return out.slice(0, 2)
}

export { NODES, EDGES }
