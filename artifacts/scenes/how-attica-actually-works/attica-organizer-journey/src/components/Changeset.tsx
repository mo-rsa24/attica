// Attached directly under the anchored surface: what actually changed, diffed
// between the model's two outcomes. "why?" renders the model's own provenance chain
// and nothing else. Two values moving together is never drawn as causality.

import { TABLE_LABELS } from '../model/journey'
import { useScene } from '../store'

const fmt = (v: unknown) => {
  if (v === undefined) return '—'
  if (v === null) return 'null'
  if (typeof v === 'string') return v.length > 70 ? v.slice(0, 70) + '…' : v
  const s = JSON.stringify(v)
  return s.length > 70 ? s.slice(0, 70) + '…' : s
}

/**
 * Which why-chain, if any, explains this field right now. Step-scoped chains are
 * only offered on the step that emitted them, so a later change to the same field
 * never inherits an earlier, unrelated explanation.
 */
function whyKey(table: string, sid: string, field: string, step: string | null, has: (k: string) => boolean) {
  if (step && has(`${step}:${table}.${sid}.${field}`)) return `${step}:${table}.${sid}.${field}`
  const exact = `${table}.${sid}.${field}`
  if (has(exact)) return exact
  if (table === 'scheduling_bookingrequest' && field === '(row)' && has('no_slot')) return 'no_slot'
  return null
}

function clientWhyKey(field: string, step: string | null, has: (k: string) => boolean) {
  if (step && has(`${step}:client.${field}`)) return `${step}:client.${field}`
  return has(`client.${field}`) ? `client.${field}` : null
}

export function ChangesetStrip() {
  const { changeset, world, openPopover } = useScene()
  const has = (k: string) => k in world.why

  if (!changeset) {
    return (
      <div className="changeset" data-tour="tour-changeset">
        <div className="cs-head">
          <span className="lbl">Changeset</span>
          <span className="det">nothing has happened yet</span>
        </div>
        <div className="cs-empty">
          Run a step or flip a switch. Whatever moves shows up here, with the line that moved it.
        </div>
      </div>
    )
  }

  const n = changeset.rows.length + changeset.client.length

  return (
    <div className="changeset" data-tour="tour-changeset">
      <div className="cs-head">
        <span className="lbl">{changeset.label}</span>
        <span className="det">{changeset.detail}</span>
        <span className="n">
          {n} field{n === 1 ? '' : 's'} changed
        </span>
      </div>
      {n === 0 ? (
        <div className="cs-empty">
          Nothing changed. The action ran and left every row and every piece of client state where it was.
        </div>
      ) : (
        <div className="cs-list">
          {changeset.client.map((c, i) => {
            const ck = clientWhyKey(c.field, world.lastStep, has)
            return (
              <div className="cs-item" key={`c${i}`}>
                <span className="where">browser · {c.field}</span>
                <span className="val">
                  <span className="b">{fmt(c.before)}</span>
                  <span className="arrow">→</span>
                  <span className="a">{fmt(c.after)}</span>
                </span>
                {ck ? (
                  <button
                    className="why"
                    onClick={(e) => {
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      openPopover(`why:${ck}`, r.left - 480, r.bottom + 6)
                    }}
                  >
                    why?
                  </button>
                ) : (
                  <span />
                )}
              </div>
            )
          })}
          {changeset.rows.map((r, i) => {
            const wk = whyKey(r.table, r.sid, r.field, world.lastStep, has)
            return (
              <div className="cs-item" key={`r${i}`}>
                <span className="where">
                  {TABLE_LABELS[r.table]} · {r.sid.split(':')[1]} · {r.field}
                </span>
                <span className="val">
                  <span className="b">{fmt(r.before)}</span>
                  <span className="arrow">→</span>
                  <span className="a">{fmt(r.after)}</span>
                  <span className="dim"> ({r.source.file.split('/').pop()}:{r.source.line})</span>
                </span>
                {wk ? (
                  <button
                    className="why"
                    onClick={(e) => {
                      const el = (e.currentTarget as HTMLElement).getBoundingClientRect()
                      openPopover(`why:${wk}`, el.left - 480, el.bottom + 6)
                    }}
                  >
                    why?
                  </button>
                ) : (
                  <span />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
