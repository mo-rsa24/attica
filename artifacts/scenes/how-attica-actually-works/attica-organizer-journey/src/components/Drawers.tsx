// Everything with real width or a list shape lives behind the toolbar, overlaying
// the anchored surface rather than pushing it. Closing returns to exactly where the
// reader was.

import { PROBE_META, STEPS, run } from '../model/journey'
import { EXCURSIONS } from '../engagement'
import { useScene, type DrawerId } from '../store'
import { Code, excerptForDetailed } from './Code'
import { useState } from 'react'

function Shell({
  id, title, sub, children,
}: {
  id: Exclude<DrawerId, null>
  title: string
  sub: string
  children: React.ReactNode
}) {
  const { drawer, toggleDrawer } = useScene()
  if (drawer !== id) return null
  return (
    <>
      <div className="scrim" onClick={() => toggleDrawer(id)} />
      <div className="drawer">
        <div className="drawer-head">
          <h2>{title}</h2>
          <span className="sub">{sub}</span>
          <button className="x" onClick={() => toggleDrawer(id)}>
            ×
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------- source

export function SourceDrawer() {
  const { world, level } = useScene()
  const call = level.kind === 'call' ? world.calls.find((c) => c.cid === level.cid) : null

  return (
    <Shell
      id="source"
      title="Source"
      sub={call ? `${call.method} ${call.path}` : 'select a call to sync the highlight'}
    >
      {!call ? (
        <p className="note dim">
          Open a request from the journey map. The code for its three layers loads here with the
          responsible line highlighted.
        </p>
      ) : (
        <>
          <p className="note">
            <b>Frontend.</b> {call.trigger.note}
          </p>
          <Ex file={call.trigger.file} line={call.trigger.line} />
          <p className="note" style={{ marginTop: 16 }}>
            <b>Django view.</b> {call.handler.note}
          </p>
          <Ex file={call.handler.file} line={call.handler.line} />
          {call.serializer && (
            <>
              <p className="note" style={{ marginTop: 16 }}>
                <b>Then.</b> {call.serializer.note}
              </p>
              <Ex file={call.serializer.file} line={call.serializer.line} />
            </>
          )}
        </>
      )}
    </Shell>
  )
}

function Ex({ file, line }: { file: string; line: number }) {
  const r = excerptForDetailed(file, line)
  if (!r)
    return (
      <div className="filebar">
        <span className="f">{file}</span>
        <span>:{line} · no excerpt filed</span>
      </div>
    )
  if (!r.exact)
    return (
      <>
        <div className="filebar">
          <span className="f">{file}</span>
          <span>:{line} · line {line} is not in the filed excerpt. Nearest from the same file:</span>
        </div>
        <Code id={r.id} />
      </>
    )
  return <Code id={r.id} hit={line} />
}

// ---------------------------------------------------------------- probes

export function ProbesDrawer() {
  const { world, knobs, cursor } = useScene()

  const invariants = [
    {
      text: 'EventDraft rows never decrease',
      ok: world.tables.events_eventdraft.rows.length >= (cursor > 5 ? 1 : 0),
    },
    {
      text: 'no AvailabilitySlot is touched before approval',
      ok: world.tables.scheduling_availabilityslot.rows.length === 0,
    },
    {
      text: 'user_type never crosses the API boundary',
      ok: !knobs.serializeUserType,
    },
  ]

  return (
    <Shell id="probes" title="Probes" sub="each one serves a claim or a registered failure">
      {PROBE_META.map((p) => {
        const v = world.probes[p.id] ?? 0
        const bad =
          (p.id === 'dropdown_options' && v === 0 && cursor > STEPS.findIndex((s) => s.id === 'open_book_artist')) ||
          (p.id === 'user_type_crossings' && Number(v) > 0)
        return (
          <div className="probe" key={p.id}>
            <span>
              <div className="p-label">{p.label}</div>
              <div className="p-serves">{p.serves}</div>
            </span>
            <span className={`p-val${v === 0 ? ' zero' : ''}${bad ? ' bad' : ''}`}>{String(v)}</span>
          </div>
        )
      })}

      <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-faint)', margin: '20px 0 6px' }}>
        Invariants
      </h3>
      {invariants.map((iv) => (
        <div className="invariant" key={iv.text}>
          <span className={`mark${iv.ok ? '' : ' broken'}`}>{iv.ok ? 'holds' : 'broken'}</span>
          <span>{iv.text}</span>
        </div>
      ))}

      <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-faint)', margin: '20px 0 6px' }}>
        Excursions
      </h3>
      {EXCURSIONS.map((e) => (
        <ExcursionCard key={e.id} id={e.id} />
      ))}
    </Shell>
  )
}

function ExcursionCard({ id }: { id: string }) {
  const e = EXCURSIONS.find((x) => x.id === id)!
  const [val, setVal] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  return (
    <div className="excursion">
      <h4>Go and check it yourself</h4>
      <div className="step">Where: {e.where}</div>
      <div className="step">
        Do: <code>{e.what}</code>
      </div>
      <div className="step">Bring back: {e.bring}</div>
      <div className="row">
        <input value={val} onChange={(ev) => setVal(ev.target.value)} placeholder={e.bring} />
        <button className="ghost" onClick={() => setChecked(e.check(val))}>
          check
        </button>
      </div>
      {checked !== null && (
        <div className={`verdict ${checked ? 'ok' : 'no'}`}>
          {checked ? `Matches. ${e.hint}` : 'Not what the page expects. Run it again and paste exactly what came back.'}
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------- history

export function HistoryDrawer() {
  const { interventions, cursor, rewindTo, reset } = useScene()
  return (
    <Shell id="history" title="History" sub={`${interventions.length} intervention(s)`}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button className="ghost" onClick={() => rewindTo(0)}>
          rewind to start
        </button>
        <button className="ghost" onClick={reset}>
          reset everything
        </button>
      </div>
      {interventions.length === 0 && <p className="note dim">Nothing yet.</p>}
      {[...interventions].reverse().map((iv) => (
        <div className="hist" key={iv.n}>
          <span className="n">{iv.n}</span>
          <span>
            <div>{iv.label}</div>
            <div className="d">{iv.detail}</div>
          </span>
          <span className="c">
            {iv.changes.length} field{iv.changes.length === 1 ? '' : 's'}
            {iv.callsAdded.length > 0 && ` · ${iv.callsAdded.length} call`}
          </span>
        </div>
      ))}
      <p className="note dim" style={{ marginTop: 16 }}>
        Rewinding refolds the journey from step 0 under the current switches. It is not an undo stack:
        the world is always <span className="mono">run(knobs, cursor)</span>.
      </p>
      <div className="note dim mono" style={{ marginTop: 8 }}>
        cursor = {cursor} / {STEPS.length}
      </div>
    </Shell>
  )
}

// ------------------------------------------------------------------ fork

export function ForkDrawer() {
  const { knobs, cursor } = useScene()

  const a = run({ ...knobs, bookingEntry: 'book_artist_page', resourceExists: true }, cursor)
  const b = run({ ...knobs, bookingEntry: 'wizard_provider_card', resourceExists: true }, cursor)

  const lines: { label: string; a: string; b: string }[] = [
    { label: 'event context in the body', a: pick(a, 'ctx'), b: pick(b, 'ctx') },
    { label: 'first submit', a: pick(a, 'status'), b: pick(b, 'status') },
    { label: 'second submit', a: pick(a, 'status2'), b: pick(b, 'status2') },
    { label: 'BookingRequest rows', a: String(a.probes.booking_rows ?? 0), b: String(b.probes.booking_rows ?? 0) },
    { label: 'request.event_draft', a: pick(a, 'draftfk'), b: pick(b, 'draftfk') },
    { label: 'eligible for finalize_draft_bookings', a: pick(a, 'finalize'), b: pick(b, 'finalize') },
  ]

  return (
    <Shell
      id="fork"
      title="Counterfactual"
      sub="same journey, one axis differs: where the booking was submitted from"
    >
      <p className="note">
        Both worlds assume the artist opted in, so the only difference is the page the organizer
        used. Everything else, including the step cursor and every other switch, is shared.
      </p>
      <div className="fork">
        <div className="forkcol lose">
          <h3>BookArtistPage</h3>
          <div className="axis">/artists/4/book</div>
          {lines.map((l) => (
            <div className="forkline" key={l.label}>
              <span>{l.label}</span>
              <span className={`v${l.a !== l.b ? ' differ' : ''}`}>{l.a}</span>
            </div>
          ))}
        </div>
        <div className="forkcol win">
          <h3>ProviderCard</h3>
          <div className="axis">inside the wizard, step3</div>
          {lines.map((l) => (
            <div className="forkline" key={l.label}>
              <span>{l.label}</span>
              <span className={`v${l.a !== l.b ? ' differ' : ''}`}>{l.b}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="note" style={{ marginTop: 14 }}>
        <b>What the fork teaches.</b> The two pages look like two doors into one booking system. They
        are not. Only the wizard door writes <span className="mono">event_draft</span>, and{' '}
        <span className="mono">finalize_draft_bookings</span> selects on exactly that field, so only
        the wizard door can ever lead to a Booking row.
      </p>
      <p className="note dim">
        Ordering caveat: in the real app ProviderCard runs at wizard step3, before publish, which is
        why its request is still sitting on the draft when publish comes round. This journey runs the
        booking after publish, so the eligibility line above is about what the field allows, not about
        what this particular run would produce.
      </p>
      <div className="filebar">
        <span className="f">backend/main/scheduling/services.py</span>
        <span>:1821 · .filter(event_draft=draft, status=BookingRequest.Status.APPROVED)</span>
      </div>
    </Shell>
  )
}

function pick(w: ReturnType<typeof run>, what: string): string {
  const creates = w.calls.filter((c) => c.path === '/api/scheduling/requests/create/')
  const first = creates[0]
  const second = creates[1]
  const row = w.tables.scheduling_bookingrequest.rows[0]
  switch (what) {
    case 'ctx':
      if (!first) return 'not submitted yet'
      return first.requestBody?.includes('event_draft_id')
        ? 'event_draft_id'
        : first.requestBody?.includes('event_id')
          ? 'event_id'
          : 'none'
    case 'status':
      return first ? String(first.status) : '—'
    case 'status2':
      if (!second) return '—'
      return second.status === 200 ? '200 replayed' : String(second.status)
    case 'draftfk':
      return row ? String(row.fields.event_draft ?? 'null') : '—'
    case 'finalize':
      if (!row) return 'no request exists'
      return row.fields.event_draft ? 'yes, once approved' : 'never: event_draft is null'
    default:
      return '—'
  }
}
