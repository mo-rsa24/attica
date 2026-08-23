// The anchored surface: level 0/1 of the atlas, always visible, with the
// reachability readout attached directly beside it (workspace.md). Clicking
// a node or edge opens the same popover a sidebar control would.

import { motion } from 'motion/react'
import { EDGES, NODES, edgeStatuses, type EdgeStatus } from '../atlas'
import { resolve, type SceneState } from '../model'
import { useStore } from '../store'

const LOGO_COLOR: Record<string, string> = {
  vite: '#8b5cf6',
  django: '#0c4b33',
  redis: '#a4262c',
  react: '#1d6fa5',
}

const STATUS_COLOR: Record<EdgeStatus, string> = {
  live: '#2f6f5e',
  dead: '#a4262c',
  unreached: '#c9c0b2',
}

export function Topology({ state }: { state: SceneState }) {
  const s = useStore()
  const out = resolve(state)
  const edgeStat = edgeStatuses(out.requests)

  const open = (id: string, kind: 'component' | 'node' | 'edge') => (e: React.MouseEvent) =>
    s.openPopover(id, kind, e.clientX, e.clientY)

  return (
    <div className="topology" data-tour="stage-strip">
      <svg viewBox="0 0 820 320" className="topo-svg" role="img" aria-label="Attica runtime topology">
        <defs>
          <marker id="arrow-live" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={STATUS_COLOR.live} />
          </marker>
          <marker id="arrow-dead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={STATUS_COLOR.dead} />
          </marker>
          <marker id="arrow-unreached" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={STATUS_COLOR.unreached} />
          </marker>
        </defs>

        {EDGES.map((edge) => {
          const a = NODES.find((n) => n.id === edge.source)!
          const b = NODES.find((n) => n.id === edge.target)!
          const status = edgeStat[edge.id]
          const midX = (a.x + b.x) / 2
          const midY = (a.y + b.y) / 2
          return (
            <g key={edge.id} className="topo-edge" onClick={open(edge.id, 'edge')}>
              <motion.line
                x1={a.x + 90}
                y1={a.y + 22}
                x2={b.x - 4}
                y2={b.y + 22}
                stroke={STATUS_COLOR[status]}
                strokeWidth={status === 'live' ? 2.5 : 2}
                strokeDasharray={status === 'unreached' ? '4 4' : status === 'dead' ? '2 3' : undefined}
                markerEnd={`url(#arrow-${status})`}
                animate={{ opacity: status === 'unreached' ? 0.45 : 1 }}
              />
              <rect x={midX - 8} y={midY + 4} width={16} height={16} fill="transparent" />
            </g>
          )
        })}

        {NODES.map((n) => {
          const isDown =
            (n.id === 'vite' && !state.viteServerUp) ||
            (n.id === 'channels' && state.backendMode === 'runserver') ||
            (n.id === 'redis' && !state.redisChannelUp && !state.redisCacheUp)
          return (
            <g
              key={n.id}
              className={`topo-node ${isDown ? 'down' : ''} ${s.focusProcess === n.id ? 'focus' : ''}`}
              transform={`translate(${n.x},${n.y})`}
              onClick={open(n.id, 'node')}
              onMouseEnter={() => s.setFocusProcess(n.id)}
              onMouseLeave={() => s.setFocusProcess(null)}
            >
              <rect
                width={n.id === 'browser' ? 90 : 150}
                height={44}
                rx={8}
                fill="#fff"
                stroke={isDown ? STATUS_COLOR.dead : n.logo ? LOGO_COLOR[n.logo] : '#c9c0b2'}
                strokeWidth={2}
              />
              <text x={10} y={18} className="topo-label">
                {n.label}
              </text>
              <text x={10} y={34} className="topo-sub">
                {n.sub}
              </text>
              {n.id === 'redis' && (
                <>
                  <circle cx={140} cy={10} r={5} fill={state.redisChannelUp ? STATUS_COLOR.live : STATUS_COLOR.dead} />
                  <circle cx={140} cy={22} r={5} fill={state.redisCacheUp ? STATUS_COLOR.live : STATUS_COLOR.dead} />
                </>
              )}
            </g>
          )
        })}
      </svg>

      <div className="topo-readout">
        <div className="topo-readout-head">reachability, right now</div>
        <ul className="reach-list">
          {out.requests.map((r) => (
            <li key={r.path} className={r.ok ? 'ok' : 'fail'}>
              <code>{r.kind === 'ws' ? '/ws' : `/${r.path}`}</code>
              <span className="reach-detail">
                {r.ok ? `reachable via ${r.hops.map((h) => h.process).join(' → ')}` : `fails at ${r.failedAt}`}
              </span>
              {!r.ok && r.errorString && <code className="reach-err">{r.errorString}</code>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
