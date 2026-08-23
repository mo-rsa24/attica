// The anchored surface. Three levels: journey, stage, call. Each level opens only
// where it reveals something the level above cannot show.

import { STAGES, STEPS } from '../model/journey'
import type { Call, StageId } from '../model/types'
import { useScene } from '../store'

export function Crumbs() {
  const { level, goto, world } = useScene()
  const call = level.kind === 'call' ? world.calls.find((c) => c.cid === level.cid) : null
  const stage: StageId | null =
    level.kind === 'stage' ? level.stage : call ? call.stage : null
  const stageMeta = stage ? STAGES.find((s) => s.id === stage) : null

  return (
    <div className="crumbs">
      <button onClick={() => goto({ kind: 'journey' })}>journey</button>
      {stageMeta && (
        <>
          <span>/</span>
          <button onClick={() => goto({ kind: 'stage', stage: stageMeta.id })}>
            {stageMeta.n}. {stageMeta.title}
          </button>
        </>
      )}
      {call && (
        <>
          <span>/</span>
          <span style={{ color: 'var(--ink)' }}>
            {call.method} {call.path}
          </span>
        </>
      )}
    </div>
  )
}

/** Level 1: the whole journey, with the stage-0 comparison living inside each card. */
export function JourneyMap() {
  const { world, goto, cursor } = useScene()
  return (
    <div className="mapgrid" data-tour="tour-map">
      {STAGES.map((s) => {
        const v = world.verdicts[s.id]
        const calls = world.calls.filter((c) => c.stage === s.id)
        const total = STEPS.filter((st) => st.stage === s.id).length
        const done = STEPS.slice(0, cursor).filter((st) => st.stage === s.id).length
        return (
          <button
            key={s.id}
            className={`stagecard${v.diverges ? ' diverges' : ''}`}
            onClick={() => goto({ kind: 'stage', stage: s.id })}
          >
            <div className="sc-head">
              <span className="sc-n">{s.n}</span>
              <span className="sc-title">{s.title}</span>
              <span className="sc-sub">{s.sub}</span>
            </div>
            <div className="sc-row names">
              <span className="tag">the names say</span>
              {v.names}
            </div>
            <div className={`sc-row trace${v.diverges ? ' bad' : ''}`}>
              <span className="tag">the trace says</span>
              {v.trace}
            </div>
            <div className="sc-foot">
              {done}/{total} steps run · {calls.length} request{calls.length === 1 ? '' : 's'}
            </div>
          </button>
        )
      })}
    </div>
  )
}

/** Level 2: every request this stage made, in order. */
export function StageView({ stage }: { stage: StageId }) {
  const { world, goto } = useScene()
  const calls = world.calls.filter((c) => c.stage === stage)
  const meta = STAGES.find((s) => s.id === stage)!

  return (
    <>
      <p className="note">
        <b>
          {meta.n}. {meta.title}
        </b>{' '}
        {world.verdicts[stage].trace}
      </p>
      {calls.length === 0 ? (
        <p className="note dim">No request has been made in this stage yet. Run the journey.</p>
      ) : (
        <div className="calllist">
          {calls.map((c) => (
            <CallRow key={c.cid} call={c} onOpen={() => goto({ kind: 'call', cid: c.cid })} />
          ))}
        </div>
      )}
      {world.log.filter(Boolean).length > 0 && stage === 'draft' && (
        <p className="note dim" style={{ marginTop: 12 }}>
          {world.log[world.log.length - 1]}
        </p>
      )}
    </>
  )
}

function CallRow({ call, onOpen }: { call: Call; onOpen: () => void }) {
  return (
    <button className={`callrow${call.status >= 400 ? ' err' : ''}`} onClick={onOpen}>
      <span className={`method ${call.method}`}>{call.method}</span>
      <span>
        <div className="callpath">{call.path}</div>
        <div className="callmeta">
          {call.trigger.file.split('/').pop()} → {call.handler.note.split(',')[0]}
          {call.writes.length > 0 && ` → writes ${call.writes.length} table${call.writes.length === 1 ? '' : 's'}`}
        </div>
      </span>
      <span className={`status${call.status >= 400 ? ' err' : ''}`}>{call.status}</span>
    </button>
  )
}
