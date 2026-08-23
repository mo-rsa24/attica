// The anchored surface: the statechart, the three storage tiers directly under
// it, and the readouts the claim is about attached to the same region.
//
// Every colour on this chart is derived from run(config, events). Nothing here
// decides anything for itself.

import { STATES, TRANSITIONS, stateById } from '../machine'
import { FIELDS, type Config, type Outcome } from '../model'
import { useStore } from '../store'

const W = 1000
const H = 420

export function Chart({ outcome, config }: { outcome: Outcome; config: Config }) {
  const { selected, select } = useStore()
  const m = outcome.machine

  const inServer = new Set(Object.values(m.server).flat())
  const inLocal = new Set(Object.values(m.local).flat())
  const inForm = new Set(m.form)

  const open = (kind: 'state' | 'transition', id: string, el: Element) =>
    select({ kind, id, anchor: el.getBoundingClientRect() })

  const visibleStates = STATES.filter((s) => (s.id === 'step2' ? true : true))

  const readouts = [
    {
      k: 'where you are',
      v: m.at === null ? (m.draftExists ? 'nowhere' : 'no draft yet') : String(m.at),
      tone: m.at === null && m.draftExists ? 'bad' : 'ok',
    },
    {
      k: 'a resume lands on',
      v: outcome.resumesAt,
      tone: outcome.resumesAt.startsWith('nowhere') ? 'bad' : 'ok',
    },
    {
      k: 'typed but never saved',
      v:
        outcome.lostFields.length === 0
          ? 'nothing'
          : outcome.lostFields.map((l) => FIELDS.find((f) => f.id === l.field)?.label).join(', '),
      tone: outcome.lostFields.length ? 'bad' : 'ok',
    },
    {
      k: outcome.published ? 'columns filled by fallback' : 'waiting for a save',
      v: outcome.published
        ? `${outcome.defaultsUsed} of ${FIELDS.length}`
        : outcome.unsaved.length === 0
          ? 'nothing'
          : `${outcome.unsaved.length} field(s)`,
      tone: outcome.published ? (outcome.defaultsUsed ? 'warn' : 'ok') : outcome.unsaved.length ? 'warn' : 'ok',
    },
  ] as const

  return (
    <div className="board">
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" data-tour="chart">
        <defs>
          <marker id="a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="currentColor" />
          </marker>
        </defs>

        {TRANSITIONS.map((t) => {
          const a = stateById(t.from)
          const b = stateById(t.to)
          if (!a || !b) return null
          // The historical step1 -> step2 edge only exists with the redirect off.
          if (t.id === 't1to2' && !config.step2Live) return null
          if (t.id === 'tredirect' && config.step2Live) return null

          const d = edgePath(a, b)
          const live = m.at === t.to && lastWas(outcome, t)
          const isSel = selected?.kind === 'transition' && selected.id === t.id
          const cls = [
            'tr',
            t.kind === 'redirect' ? 'redirect' : '',
            live ? 'live' : '',
            isSel ? 'sel' : '',
          ]
            .filter(Boolean)
            .join(' ')
          const mid = midOf(a, b)
          return (
            <g key={t.id} className={cls} onClick={(e) => open('transition', t.id, e.currentTarget)} style={{ color: 'var(--ink-faint)' }}>
              <path className="hit" d={d} />
              <path className="line" d={d} markerEnd="url(#a)" />
              <g transform={`translate(${mid.x} ${mid.y - 8})`}>
                <rect x={-t.label.length * 3.3 - 5} y={-9} width={t.label.length * 6.6 + 10} height={15} rx={3} fill="var(--bg)" opacity={0.93} />
                <text textAnchor="middle" y={2}>
                  {t.label}
                </text>
              </g>
              <title>{t.does}</title>
            </g>
          )
        })}

        {visibleStates.map((s) => {
          const here = String(m.at) === s.id
          const published = s.id === 'published' && m.status === 'published'
          const ghost = s.id === 'step2' && !config.step2Live
          const isSel = selected?.kind === 'state' && selected.id === s.id
          const saved = s.id in m.server
          const cls = [
            'st',
            here || published ? 'here' : '',
            ghost ? 'ghost' : '',
            isSel ? 'sel' : '',
            s.persists === 'nothing' && s.id !== 'step2' ? 'empty' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <g key={s.id} className={cls} data-tour={`state:${s.id}`} onClick={(e) => open('state', s.id, e.currentTarget)}>
              <rect className="body" x={s.x} y={s.y} width={s.w} height={s.h} rx={9} />
              <text className="name" x={s.x + 12} y={s.y + 24}>
                {s.label}
              </text>
              <text className="sub" x={s.x + 12} y={s.y + 42}>
                {ghost ? 'excised' : s.persists === 'nothing' ? 'saves nothing' : s.persists === 'asset' ? 'files only' : saved ? 'saved' : ''}
              </text>
              {saved && !ghost && (
                <circle cx={s.x + s.w - 14} cy={s.y + 14} r={4} fill="var(--ok)" />
              )}
              {here && <rect className="ring" x={s.x - 4} y={s.y - 4} width={s.w + 8} height={s.h + 8} rx={12} />}
              <title>{s.holds}</title>
            </g>
          )
        })}

        {/* Drawn last, so their labels sit above any box the curve passes behind.
            They leave from wherever you actually are, because that is what those
            transitions do. */}
        {m.draftExists && m.at !== 'gone' && m.at !== null && (
          <LiveEdge from={stateById(String(m.at))!} to={stateById('gone')!} label="close the tab" dashed />
        )}
        {m.at === 'gone' && resumeTarget(outcome) && (
          <LiveEdge from={stateById('gone')!} to={stateById(resumeTarget(outcome)!)!} label="come back" dashed />
        )}
      </svg>

      <div className="readouts" data-tour="readouts">
        {readouts.map((r) => (
          <div key={r.k} className={`ro ${r.tone}`}>
            <div className="k">{r.k}</div>
            <div className="v">{r.v}</div>
          </div>
        ))}
      </div>

      <div className="tiers" data-tour="tiers">
        <div className="tierhead">
          <span>field</span>
          <span>form</span>
          <span>reducer + localStorage</span>
          <span>EventDraft.data</span>
        </div>
        {FIELDS.map((f) => (
          <div className="tierrow" key={f.id}>
            <span className="fname">
              {f.label}
              <em>
                {' '}
                {f.collectedOn} → steps.{f.storedUnder}
              </em>
            </span>
            <Cell on={inForm.has(f.id)} />
            <Cell on={inLocal.has(f.id)} />
            <Cell on={inServer.has(f.id)} note={f.transport === 'asset' ? 'never: files go up separately' : undefined} />
          </div>
        ))}
      </div>

      <p className="reason">{outcome.reason}</p>
    </div>
  )
}

function Cell({ on, note }: { on: boolean; note?: string }) {
  return (
    <span className={`cell ${on ? 'on' : ''}`} title={note}>
      {on ? '●' : note ? '—' : '○'}
    </span>
  )
}

function LiveEdge({
  from,
  to,
  label,
  dashed,
}: {
  from: { x: number; y: number; w: number; h: number }
  to: { x: number; y: number; w: number; h: number }
  label: string
  dashed?: boolean
}) {
  const d = edgePath(from, to)
  const mid = midOf(from, to)
  return (
    <g className={`tr live ${dashed ? 'dashed' : ''}`} style={{ color: 'var(--warn)' }}>
      <path className="line" d={d} markerEnd="url(#a)" />
      <g transform={`translate(${mid.x} ${mid.y - 8})`}>
        <rect x={-label.length * 3.3 - 5} y={-9} width={label.length * 6.6 + 10} height={15} rx={3} fill="var(--bg)" opacity={0.93} />
        <text textAnchor="middle" y={2}>
          {label}
        </text>
      </g>
    </g>
  )
}

type Box = { x: number; y: number; w: number; h: number }

function edgePath(a: Box, b: Box) {
  const sameRow = Math.abs(a.y - b.y) < 20
  if (sameRow) {
    const leftToRight = b.x > a.x
    const x1 = leftToRight ? a.x + a.w : a.x
    const x2 = leftToRight ? b.x : b.x + b.w
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
  const sameRow = Math.abs(a.y - b.y) < 20
  if (sameRow) {
    const leftToRight = b.x > a.x
    const x1 = leftToRight ? a.x + a.w : a.x
    const x2 = leftToRight ? b.x : b.x + b.w
    return { x: (x1 + x2) / 2, y: a.y + a.h / 2 }
  }
  const down = b.y > a.y
  return {
    x: (a.x + a.w / 2 + b.x + b.w / 2) / 2,
    y: down ? (a.y + a.h + b.y) / 2 : (a.y + b.y + b.h) / 2,
  }
}

/** Did the most recent event drive this transition? Used only for emphasis. */
function lastWas(o: Outcome, t: { from: string; to: string }) {
  return String(o.machine.at) === t.to
}

function resumeTarget(o: Outcome): string | null {
  const r = o.resumesAt
  if (r.startsWith('nowhere') || r.startsWith('no draft')) return null
  if (r.startsWith('step5')) return 'step5'
  return STATES.some((s) => s.id === r) ? r : null
}
