// The anchored surface. Always visible, no clicks required, with the readouts
// the claim is about attached to it rather than parked in a panel elsewhere.
//
// Opening a box preserves the world: the parent keeps its outline and label in
// the breadcrumb, siblings fade rather than vanish, and closing puts everything
// back exactly where it was.

import { useRef } from 'react'
import { EDGES, LEVELS, NODES, byId, edgesAt, nodesAt, trail, type AtlasEdge, type AtlasNode } from '../atlas'
import type { Outcome, SceneState } from '../model'
import { useStore } from '../store'
import { IconAt } from './Icons'

const W = 1000
const H = 520

type Health = 'ok' | 'warn' | 'bad' | 'none'

/** Node colour comes from the model's outcome, never from a renderer rule. */
export function nodeHealth(id: string, o: Outcome, s: SceneState): Health {
  const slot = (sid: string) => o.slots.find((x) => x.id === sid)
  switch (id) {
    case 'browser':
    case 'client':
    case 'merge':
      return o.counterpartSees ? (o.pollActive ? 'warn' : 'ok') : o.messageDurable ? 'bad' : 'warn'
    case 'poll':
      return o.pollActive ? 'warn' : 'none'
    case 'vite-proxy':
      return s.viteProxy ? 'ok' : 'bad'
    case 'daphne':
    case 'protocol-router':
      return s.server === 'runserver' ? 'warn' : 'ok'
    case 'redis':
    case 'channel-layer':
      return s.redis === 'up' ? 'ok' : s.redis === 'down-after-connect' ? 'bad' : 'warn'
    case 'sqlite':
    case 'view':
      return o.messageDurable ? 'ok' : 'bad'
    case 'http-branch':
      return o.httpStatus === 201 || o.httpStatus === null ? 'ok' : 'bad'
    case 'ws-branch':
    case 'consumer':
      return o.socket.connected ? (o.socket.broadcastEnabled ? 'ok' : 'warn') : 'bad'
    case 'notif-consumer':
      return s.redis === 'up' ? 'ok' : 'bad'
    case 'broadcast-fn':
    case 'group-send':
      return slot('group-send')?.status === 'ran' ? 'ok' : 'bad'
    case 'notify-fn':
      return slot('notify')?.status === 'ran' ? 'ok' : 'bad'
    case 'group-add':
      return o.socket.broadcastEnabled ? 'ok' : 'bad'
    case 'dispatch':
      return slot('consumer-send')?.status === 'ran' ? 'ok' : 'none'
    default:
      return 'none'
  }
}

/** Edge state, likewise derived. `cut` means this configuration severed it. */
export function edgeHealth(e: AtlasEdge, o: Outcome, s: SceneState): 'live' | 'cut' | 'none' {
  const slot = (sid: string) => o.slots.find((x) => x.id === sid)
  switch (e.id) {
    case 'http':
      return s.viteProxy ? (o.httpStatus === 201 ? 'live' : 'none') : 'cut'
    case 'ws':
      return o.socket.connected ? 'live' : 'cut'
    case 'write':
      return o.messageDurable ? 'live' : 'cut'
    case 'layer':
    case 'consumer-layer':
      return slot('group-send')?.status === 'ran' ? 'live' : 'cut'
    case 'notif-layer':
      return s.redis === 'up' ? 'live' : 'cut'
    case 'view-broadcast':
      return slot('broadcast')?.status === 'ran' ? 'live' : 'cut'
    case 'view-notify':
      return slot('notify')?.status === 'ran' ? 'live' : 'cut'
    case 'add-send':
      return o.socket.broadcastEnabled ? 'live' : 'cut'
    case 'send-dispatch':
      return slot('consumer-send')?.status === 'ran' ? 'live' : 'cut'
    default:
      return 'none'
  }
}

function ports(a: AtlasNode, b: AtlasNode, off: number) {
  const ac = { x: a.x + a.w, y: a.y + a.h / 2 + off }
  const bc = { x: b.x, y: b.y + b.h / 2 + off }
  // Vertical stack: leave the bottom and enter the top instead.
  if (b.y > a.y + a.h) {
    return {
      x1: a.x + a.w / 2 + off,
      y1: a.y + a.h,
      x2: b.x + b.w / 2 + off,
      y2: b.y,
      vertical: true,
    }
  }
  return { x1: ac.x, y1: ac.y, x2: bc.x, y2: bc.y, vertical: false }
}

export function Canvas({ outcome }: { outcome: Outcome }) {
  const { state, focus, setFocus, selected, select } = useStore()
  const svgRef = useRef<SVGSVGElement>(null)

  const parent = focus ? byId(focus) : null
  const level = parent
    ? (LEVELS.find((l) => l.id === nodesAt(focus)[0]?.level)?.id ?? 'ECOSYSTEM')
    : 'ECOSYSTEM'
  const nodes = nodesAt(focus)
  const edges = edgesAt(focus)
  const crumbs = trail(focus)

  const open = (kind: 'node' | 'edge', id: string, el: Element) =>
    select({ kind, id, anchor: el.getBoundingClientRect() })

  const readouts: { k: string; v: string; tone: Health }[] = [
    {
      k: 'row committed',
      v: outcome.messageDurable ? `yes, ${outcome.dbRowCount} rows` : 'no row written',
      tone: outcome.messageDurable ? 'ok' : 'bad',
    },
    {
      k: 'second browser sees it',
      v: outcome.counterpartSees
        ? `yes, after ${outcome.counterpartSeesAtMs} ms`
        : outcome.variant === 'blocked-by-authz'
          ? 'no, correctly'
          : 'no, not until reload',
      tone: outcome.counterpartSees ? 'ok' : outcome.variant === 'blocked-by-authz' ? 'warn' : 'bad',
    },
    {
      k: 'database ahead of screen by',
      v: `${outcome.divergence} row${outcome.divergence === 1 ? '' : 's'}`,
      tone: outcome.divergence === 0 ? 'ok' : 'bad',
    },
    {
      k: 'delivered by',
      v:
        outcome.variant === 'delivered-push'
          ? 'the socket'
          : outcome.variant === 'delivered-poll'
            ? `the ${state.pollIntervalMs} ms poll`
            : 'nothing',
      tone: outcome.variant === 'delivered-push' ? 'ok' : outcome.counterpartSees ? 'warn' : 'bad',
    },
  ]

  return (
    <div className="board">
      <div className="breadcrumb" data-tour="breadcrumb">
        <button onClick={() => setFocus(null)} className={crumbs.length === 0 ? 'here' : ''}>
          the four processes
        </button>
        {crumbs.map((c, i) => (
          <span key={c.id} style={{ display: 'contents' }}>
            <span className="sep">›</span>
            <button
              onClick={() => setFocus(c.id)}
              className={i === crumbs.length - 1 ? 'here' : ''}
            >
              {c.label}
            </button>
          </span>
        ))}
        <span className="level">
          {level} · {LEVELS.find((l) => l.id === level)?.reveals}
        </span>
      </div>

      <svg className="map" viewBox={`0 0 ${W} ${H}`} ref={svgRef} role="img">
        <defs>
          <marker id="arw" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="currentColor" />
          </marker>
        </defs>

        {/* The parent's own outline, kept so opening a box reads as looking
            inside it rather than navigating somewhere else. */}
        {parent && (
          <g className="n-box ctx">
            <rect className="body" x={22} y={20} width={W - 44} height={400} rx={12} />
            <text x={38} y={44}>
              inside {parent.label}
            </text>
          </g>
        )}

        {edges.map((e, i) => {
          const a = byId(e.from)
          const b = byId(e.to)
          if (!a || !b) return null
          const same = edges.filter((x) => x.from === e.from && x.to === e.to)
          const idx = same.indexOf(e)
          const off = same.length > 1 ? (idx - (same.length - 1) / 2) * 46 : 0
          const p = ports(a, b, off)
          const mx = (p.x1 + p.x2) / 2
          const d = p.vertical
            ? `M${p.x1} ${p.y1} C ${p.x1} ${(p.y1 + p.y2) / 2}, ${p.x2} ${(p.y1 + p.y2) / 2}, ${p.x2} ${p.y2}`
            : `M${p.x1} ${p.y1} C ${mx} ${p.y1}, ${mx} ${p.y2}, ${p.x2} ${p.y2}`
          const h = edgeHealth(e, outcome, state)
          const isSel = selected?.kind === 'edge' && selected.id === e.id
          const cls = ['edge', e.bestEffort ? 'best' : '', h === 'live' ? 'live' : h === 'cut' ? 'cut' : '', isSel ? 'sel' : '']
            .filter(Boolean)
            .join(' ')
          return (
            <g
              key={e.id}
              className={cls}
              data-tour={`edge:${e.id}`}
              onClick={(ev) => open('edge', e.id, ev.currentTarget)}
              style={{ color: 'var(--ink-faint)' }}
            >
              <path className="hit" d={d} />
              <path className="line" d={d} markerEnd="url(#arw)" />
              {h === 'cut' && (
                <g transform={`translate(${(p.x1 + p.x2) / 2} ${(p.y1 + p.y2) / 2})`}>
                  <line className="cutmark" x1={-7} y1={-7} x2={7} y2={7} />
                  <line className="cutmark" x1={7} y1={-7} x2={-7} y2={7} />
                </g>
              )}
              <g transform={`translate(${(p.x1 + p.x2) / 2} ${(p.y1 + p.y2) / 2 - (h === 'cut' ? 18 : 9)})`}>
                <rect
                  x={-e.short.length * 3.4 - 5}
                  y={-9}
                  width={e.short.length * 6.8 + 10}
                  height={15}
                  rx={3}
                  fill="var(--bg)"
                  opacity={0.92}
                />
                <text x={0} y={2} textAnchor="middle">
                  {e.short}
                </text>
              </g>
              <title>{`${e.label}: ${e.carries}`}</title>
              {i === -1 && null}
            </g>
          )
        })}

        {nodes.map((n) => {
          const h = nodeHealth(n.id, outcome, state)
          const isSel = selected?.kind === 'node' && selected.id === n.id
          const live = liveValue(n, outcome, state)
          return (
            <g
              key={n.id}
              className={`n-box ${h} ${isSel ? 'sel' : ''}`}
              data-tour={`node:${n.id}`}
              onClick={(ev) => open('node', n.id, ev.currentTarget)}
              onDoubleClick={() => n.opens && setFocus(n.id)}
            >
              <rect className="body" x={n.x} y={n.y} width={n.w} height={n.h} rx={10} />
              <IconAt slug={n.icon} x={n.x + 14} y={n.y + 14} size={17} />
              <text x={n.x + (n.icon ? 38 : 14)} y={n.y + 27}>
                {n.label}
              </text>
              {wrap(n.what, Math.floor(n.w / 6.1)).slice(0, 3).map((ln, i) => (
                <text className="sub" key={i} x={n.x + 14} y={n.y + 48 + i * 14}>
                  {ln}
                </text>
              ))}
              {live && (
                <text className={`state ${h}`} x={n.x + 14} y={n.y + n.h - 12} fill={toneFill(h)}>
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

        {/* The readouts, attached to the surface itself. */}
        <g className="readout">
          {readouts.map((r, i) => {
            const w = (W - 44 - 3 * 10) / 4
            const x = 22 + i * (w + 10)
            return (
              <g key={r.k}>
                <rect x={x} y={434} width={w} height={54} />
                <text className="k" x={x + 12} y={454}>
                  {r.k}
                </text>
                <text className={`v ${r.tone}`} x={x + 12} y={474} fill={toneFill(r.tone)}>
                  {r.v}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      <p className="lede" style={{ marginTop: 10, fontSize: 14 }}>
        {outcome.reason}
      </p>
    </div>
  )
}

function toneFill(t: Health) {
  return t === 'ok' ? 'var(--ok)' : t === 'bad' ? 'var(--bad)' : t === 'warn' ? 'var(--warn)' : 'var(--ink-dim)'
}

/** The live value the node is contributing right now: what makes inspection
 *  worth a click rather than a static description. */
function liveValue(n: AtlasNode, o: Outcome, s: SceneState): string | null {
  switch (n.id) {
    case 'redis':
    case 'channel-layer':
      return s.redis === 'up' ? 'reachable' : s.redis
    case 'daphne':
      return s.server
    case 'sqlite':
      return `${o.dbRowCount} rows in room 7`
    case 'browser':
      return `${o.screenRowCount} rows on screen`
    case 'vite-proxy':
      return s.viteProxy ? 'forwarding' : 'off'
    case 'client':
      return `writes over ${s.sendPath.toUpperCase()}`
    case 'poll':
      return o.pollActive ? `every ${s.pollIntervalMs} ms, ${o.queriesPerMinute}/min` : 'not mounted'
    case 'ws-branch':
      return o.socket.closeCode ? `close ${o.socket.closeCode}` : `token ${s.token}`
    case 'consumer':
      return `broadcast_enabled = ${o.socket.broadcastEnabled ? 'True' : 'False'}`
    case 'notif-consumer':
      return s.redis === 'up' ? 'open' : 'close 4500'
    case 'group-add':
      return o.groupMembersReadable
        ? `${o.groupMembers.length} in chat_room_7`
        : `${o.groupMembers.length} joined, set unreadable`
    case 'group-send':
      return o.slots.find((x) => x.id === 'group-send')?.status ?? null
    case 'dispatch':
      return o.slots.find((x) => x.id === 'consumer-send')?.status === 'ran' ? 'chat_event() ran' : 'never called'
    case 'merge':
      return s.concurrentSends ? '2 senders at once' : '1 sender'
    case 'http-branch':
      return o.httpStatus === null ? 'no request' : `HTTP ${o.httpStatus}`
    case 'view':
      return o.messageDurable ? 'wrote 1 row' : 'never ran'
    case 'broadcast-fn':
      return o.slots.find((x) => x.id === 'group-send')?.status === 'ran' ? 'sent' : 'swallowed'
    default:
      return null
  }
}

function wrap(text: string, per: number): string[] {
  const words = text.split(' ')
  const out: string[] = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > per) {
      out.push(line.trim())
      line = w
    } else line += ' ' + w
  }
  if (line.trim()) out.push(line.trim())
  return out
}

export { EDGES, NODES }
