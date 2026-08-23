// What opens when you click a node, an edge or a part.

import { EDGES, nodeById, type Part } from '../pipeline'
import { changeset } from '../lab'
import { run, type Config, type Outcome, type SchedEvent } from '../model'
import { useStore } from '../store'
import { CodeBlock } from './CodeBlock'
import { ConfigControls } from './Controls'

/** Code shown with a node, where the node has a real artifact behind it. */
const NODE_CODE: Record<string, { snippet: string; hot?: number }> = {
  slot: { snippet: 'constraints', hot: 232 },
  exclusion: { snippet: 'exclusion', hot: 8 },
  checkconstraint: { snippet: 'constraints', hot: 232 },
  uniqslot: { snippet: 'constraints', hot: 228 },
  db: { snippet: 'monitor', hot: 3265 },
  materializecmd: { snippet: 'materialize', hot: 2522 },
  expireholds: { snippet: 'expireHolds', hot: 1747 },
  hold: { snippet: 'pay', hot: 1554 },
  exception: { snippet: 'exceptions', hot: 2387 },
  lockphase: { snippet: 'locks', hot: 349 },
  checkphase: { snippet: 'locks', hot: 358 },
  reservephase: { snippet: 'locks', hot: 369 },
  insertphase: { snippet: 'dbCatch', hot: 653 },
  idem: { snippet: 'idem', hot: 123 },
  booking: { snippet: 'activeStates', hot: 412 },
  app: { snippet: 'createBooking', hot: 583 },
}

const NODE_CONTROLS: Partial<Record<string, (keyof Config)[]>> = {
  db: ['vendor'],
  exclusion: ['vendor'],
  slot: ['slotCapacity', 'blackout'],
  exception: ['blackout'],
  hold: ['holdMinutes'],
  lockphase: ['locking'],
  idem: ['idem'],
  materializecmd: ['dst'],
  app: ['design'],
}

export function NodeInspector({ id, outcome }: { id: string; outcome: Outcome }) {
  const { setFocus, config } = useStore()
  const n = nodeById(id)
  if (!n) return null
  const code = NODE_CODE[id]
  const controls = NODE_CONTROLS[id]

  return (
    <>
      <h3>{n.label}</h3>
      <div className="what">{n.what}</div>

      <div className="sect">right now</div>
      <div className="mono" style={{ fontSize: 12.5 }}>
        {liveLine(id, outcome, config)}
      </div>

      <div className="sect">where it lives</div>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-dim)' }}>
        {n.source}
      </div>

      {code && <CodeBlock snippet={code.snippet} hot={code.hot ?? null} />}
      {controls && <ConfigControls keys={controls} />}

      {n.opens && (
        <button className="opt" style={{ marginTop: 12 }} onClick={() => setFocus(n.id)}>
          open {n.label} →
        </button>
      )}
    </>
  )
}

export function EdgeInspector({ id }: { id: string }) {
  const e = EDGES.find((x) => x.id === id)
  if (!e) return null
  return (
    <>
      <h3>
        {nodeById(e.from)?.label} → {nodeById(e.to)?.label}
      </h3>
      <div className="what">{e.short}</div>
      <dl className="kv">
        <dt>carries</dt>
        <dd>{e.carries}</dd>
        <dt>result</dt>
        <dd>{e.consequence}</dd>
      </dl>
      <div className="sect">declared at</div>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-dim)' }}>
        {e.source}
      </div>
      {e.bestEffort && (
        <>
          <div className="sect">best effort</div>
          <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
            _record_conflict_incident wraps its own create in a bare except and returns None on failure, because
            conflict tracking must never block the booking flow's error response.
          </div>
        </>
      )}
    </>
  )
}

export function PartInspector({ part, outcome }: { part: Part; outcome: Outcome }) {
  const { config, events } = useStore()
  const ablation = ablate(part, config, events, outcome)
  return (
    <>
      <h3>{part.label}</h3>
      <div className="what">{part.what}</div>

      <div className="sect">the real thing</div>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-dim)', whiteSpace: 'pre-wrap' }}>
        {part.real}
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>
        {part.source}
      </div>

      <div className="sect">break it</div>
      <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{part.breaks}</div>

      <ConfigControls keys={[part.controls]} />

      {ablation && (
        <>
          <div className="sect">what changes if you do</div>
          <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{ablation}</div>
        </>
      )}

      {part.suspect && (
        <div className="pill warn" style={{ marginTop: 12 }}>
          flagged in the closing note
        </div>
      )}
    </>
  )
}

function liveLine(id: string, o: Outcome, cfg: Config): string {
  const w = o.world
  switch (id) {
    case 'slot':
      return w.slots.length
        ? `${w.slots.length} row: ${o.capacityLine}, ${w.slots[0].isBookable ? 'bookable' : 'is_bookable=False'}`
        : 'no rows materialized'
    case 'booking':
      return `${o.activeBookings} active booking(s)`
    case 'incidents':
      return `${w.incidents.length} row(s): ${o.incidentsBySource.application_check} application_check, ${o.incidentsBySource.db_constraint} db_constraint`
    case 'db':
    case 'exclusion':
      return cfg.vendor === 'postgresql'
        ? 'constraint_present: True'
        : 'constraint_present: None. The function only asks on postgresql, so None means unknown, and here unknown means absent.'
    case 'lockphase':
      return cfg.locking === 'none' ? 'switched off for this run' : w.lockHeldBy ? `held by ${w.lockHeldBy}` : 'free'
    case 'hold':
      return w.holds.length
        ? `${w.holds[0].status}, expires t+${w.holds[0].holdExpiresAtMin}, paid_at ${w.holds[0].paidAtMin ?? 'null'}`
        : 'no session'
    case 'idem':
      return w.idem.length ? `${w.idem.length} record(s) stored` : 'no records yet'
    default:
      return o.reason
  }
}

function ablate(part: Part, config: Config, events: SchedEvent[], now: Outcome): string | null {
  const flip: Partial<Config> = {}
  switch (part.controls) {
    case 'design':
      flip.design = config.design === 'slots' ? 'overlap-query' : 'slots'
      break
    case 'locking':
      flip.locking = config.locking === 'none' ? 'select-for-update' : 'none'
      break
    case 'vendor':
      flip.vendor = config.vendor === 'sqlite' ? 'postgresql' : 'sqlite'
      break
    case 'slotCapacity':
      flip.slotCapacity = config.slotCapacity === 1 ? 5 : 1
      break
    case 'attendees':
      flip.attendees = config.attendees === 1 ? 3 : 1
      break
    case 'blackout':
      flip.blackout = !config.blackout
      break
    case 'dst':
      flip.dst = config.dst === 'normal' ? 'spring-forward' : 'normal'
      break
    case 'idem':
      flip.idem = config.idem === 'none' ? 'same-key-same-payload' : 'none'
      break
    case 'holdMinutes':
      flip.holdMinutes = config.holdMinutes === 30 ? 5 : 30
      break
    default:
      return null
  }
  const diff = changeset(now, run({ ...config, ...flip }, events))
  if (diff.length === 0) return 'nothing changes on this schedule: it is not load-bearing here.'
  return diff.map((d) => `${d.observable}: ${d.before} becomes ${d.after}`).join('; ') + '.'
}
