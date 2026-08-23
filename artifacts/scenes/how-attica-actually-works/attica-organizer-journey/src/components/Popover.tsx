// Anchored to whatever was clicked, for inspecting exactly one thing. Closing it
// returns the reader to where they were: nothing on the anchored surface moves.

import { useEffect } from 'react'
import { TABLE_LABELS } from '../model/journey'
import type { TableName } from '../model/types'
import { useScene } from '../store'
import { Code, excerptFor } from './Code'

export function PopoverLayer() {
  const { popover, closePopover, world } = useScene()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopover()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closePopover])

  if (!popover) return null

  const [kind, ...rest] = popover.key.split(':')
  const arg = rest.join(':')

  const x = Math.max(12, Math.min(popover.x, window.innerWidth - 632))
  const y = Math.max(12, Math.min(popover.y, window.innerHeight - 220))

  let title = ''
  let body: React.ReactNode = null

  if (kind === 'src') {
    const line = Number(arg.split(':').pop())
    const file = arg.slice(0, arg.lastIndexOf(':'))
    const id = excerptFor(file, line)
    title = `${file}:${line}`
    body = id ? <Code id={id} hit={line} /> : <div className="note dim">No excerpt filed for this file.</div>
  } else if (kind === 'table') {
    const name = arg as TableName
    const t = world.tables[name]
    title = `${TABLE_LABELS[name]} · ${t.rows.length} row${t.rows.length === 1 ? '' : 's'}`
    body =
      t.rows.length === 0 ? (
        <div className="note dim">Empty.</div>
      ) : (
        <pre className="payload" style={{ maxHeight: 400 }}>
          {t.rows
            .map((r) => `id=${r.id}\n${JSON.stringify(r.fields, null, 2)}`)
            .join('\n\n')}
        </pre>
      )
  } else if (kind === 'why') {
    const w = world.why[arg]
    title = 'why?'
    body = w ? (
      <>
        <p className="note">
          <b>{w.claim}</b>
        </p>
        {w.chain.map((c, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div className="note" style={{ marginBottom: 4 }}>
              {i + 1}. {c.text}
            </div>
            {c.source && (
              <div className="filebar">
                <span className="f">{c.source.file}</span>
                <span>
                  :{c.source.line} · {c.source.note}
                </span>
              </div>
            )}
          </div>
        ))}
        <p className="note dim" style={{ marginTop: 12, marginBottom: 0 }}>
          This chain is emitted by the model alongside the change. It is not inferred from what moved
          at the same time.
        </p>
      </>
    ) : (
      <div className="note dim">No provenance filed for this field.</div>
    )
  }

  return (
    <>
      <div className="scrim" style={{ background: 'transparent', zIndex: 55 }} onClick={closePopover} />
      <div className="pop" style={{ left: x, top: y }}>
        <div className="pop-head">
          <span>{title}</span>
          <button className="x" onClick={closePopover}>
            ×
          </button>
        </div>
        <div className="pop-body">{body}</div>
      </div>
    </>
  )
}
