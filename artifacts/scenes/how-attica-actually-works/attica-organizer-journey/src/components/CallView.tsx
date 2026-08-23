// Level 3: one request across all four layers. This is the animated code highlight:
// the frontend file that fired it, the wire, the Django view and serializer that
// handled it, and the rows it touched, side by side and all pointing at the same call.

import { TABLE_LABELS } from '../model/journey'
import type { Call, Source, TableName } from '../model/types'
import { useScene } from '../store'

function SourceButton({ src, label }: { src: Source; label?: string }) {
  const openPopover = useScene((s) => s.openPopover)
  return (
    <button
      className="src"
      onClick={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        openPopover(`src:${src.file}:${src.line}`, r.left, r.bottom + 6)
      }}
    >
      <span className="fl">
        {label ? `${label} ` : ''}
        {src.file}:{src.line}
      </span>
      <span className="nt">{src.note}</span>
    </button>
  )
}

function TableChip({ name, write }: { name: TableName; write?: boolean }) {
  const { world, openPopover } = useScene()
  const n = world.tables[name].rows.length
  return (
    <button
      className={`tablechip${write ? ' w' : ''}`}
      onClick={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        openPopover(`table:${name}`, r.left, r.bottom + 6)
      }}
    >
      {TABLE_LABELS[name]} <span className="dim">({n})</span>
    </button>
  )
}

export function CallView({ call }: { call: Call }) {
  const world = useScene((s) => s.world)

  return (
    <>
      <div className="lanes">
        <div className="lane fe">
          <h3>frontend</h3>
          <SourceButton src={call.trigger} />
          <div className="mono dim" style={{ fontSize: 10.5, marginTop: 8 }}>
            route {world.client.route}
          </div>
        </div>

        <div className="lane http">
          <h3>the wire</h3>
          <div
            className="mono"
            style={{ fontSize: 12, marginBottom: 8, wordBreak: 'break-all' }}
          >
            <span className={`method ${call.method}`} style={{ padding: '2px 6px', marginRight: 6 }}>
              {call.method}
            </span>
            {call.path}
          </div>
          {call.requestBody && (
            <>
              <div className="mono dim" style={{ fontSize: 9.5, margin: '8px 0 3px' }}>
                REQUEST
              </div>
              <pre className="payload">{call.requestBody}</pre>
            </>
          )}
          <div className="mono dim" style={{ fontSize: 9.5, margin: '8px 0 3px' }}>
            RESPONSE <span className={call.status >= 400 ? 'status err' : 'status'}>{call.status}</span>
          </div>
          <pre className="payload">{call.responseBody}</pre>
        </div>

        <div className="lane be">
          <h3>django</h3>
          <SourceButton src={call.handler} label="view" />
          {call.serializer && <SourceButton src={call.serializer} label="then" />}
        </div>

        <div className="lane db">
          <h3>tables</h3>
          {call.reads.length > 0 && (
            <>
              <div className="mono dim" style={{ fontSize: 9.5, marginBottom: 4 }}>
                READS
              </div>
              {call.reads.map((t) => (
                <TableChip key={t} name={t} />
              ))}
            </>
          )}
          {call.writes.length > 0 ? (
            <>
              <div className="mono dim" style={{ fontSize: 9.5, margin: '8px 0 4px' }}>
                WRITES
              </div>
              {call.writes.map((t) => (
                <TableChip key={t} name={t} write />
              ))}
            </>
          ) : (
            <div className="mono dim" style={{ fontSize: 10.5, marginTop: 8 }}>
              writes nothing
            </div>
          )}
        </div>
      </div>

      {call.surprise && (
        <div className={`surprise${call.status >= 400 ? ' bad' : ''}`}>{call.surprise}</div>
      )}

      <div className="screenline">
        <span className="k">route</span>
        <span className="v">{world.client.route}</span>
        <span className="k">on screen</span>
        <span className="v">{world.client.screen}</span>
        {Object.entries(world.client.localStorage).map(([k, v]) => (
          <Frag key={k} k={`localStorage['${k}']`} v={v} />
        ))}
      </div>
    </>
  )
}

function Frag({ k, v }: { k: string; v: string }) {
  return (
    <>
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </>
  )
}
