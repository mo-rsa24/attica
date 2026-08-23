// Off-page prompts with a return the page can check.

import { useState } from 'react'
import type { Excursion as Ex } from '../engagement'
import { decodeState, run } from '../model'
import { useStore } from '../store'

/** Booking.ACTIVE_STATES, models.py:412. The excursion's answer is read off
 *  this, not written down in the check. */
const ACTIVE_STATES = ['hold', 'confirmed', 'in_progress', 'reschedule_pending', 'disputed']

export function Excursion({ ex }: { ex: Ex }) {
  return (
    <div className="excursion">
      <h4>{ex.id === 'find-silence' ? 'Find the quiet double booking' : ex.where.split(',')[0]}</h4>
      <dl>
        <div className="f">where</div>
        <p className="v">{ex.where}</p>
        <div className="f">do</div>
        <p className="v">{ex.does}</p>
        <div className="f">bring back</div>
        <p className="v">{ex.returns}</p>
        <div className="f">what it means</div>
        <p className="v">{ex.means}</p>
      </dl>
      {ex.check === 'number' && <NumberCheck />}
      {ex.check === 'state' && <StateCheck />}
      {ex.check === 'none' && <span className="pill">unverified</span>}
    </div>
  )
}

function NumberCheck() {
  const [v, setV] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <div style={{ marginTop: 8 }}>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="how many statuses" spellCheck={false} />
      <button
        className="opt"
        style={{ marginLeft: 8 }}
        onClick={() =>
          setMsg(
            Number(v.trim()) === ACTIVE_STATES.length
              ? `Yes: ${ACTIVE_STATES.length}, and they match Booking.ACTIVE_STATES exactly today: ${ACTIVE_STATES.join(', ')}. Nothing enforces that they keep matching.`
              : `No: ${ACTIVE_STATES.length}. The WHERE clause lists ${ACTIVE_STATES.join(', ')}, which is the same set Python calls ACTIVE_STATES, written out a second time in SQL.`,
          )
        }
      >
        check it
      </button>
      {msg && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-dim)' }}>{msg}</p>}
    </div>
  )
}

function StateCheck() {
  const { loadEncoded } = useStore()
  const [v, setV] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = () => {
    const raw = v.trim().includes('s=') ? decodeURIComponent(v.trim().split('s=')[1]) : v.trim()
    const decoded = decodeState(raw)
    if (!decoded) {
      setMsg({ ok: false, text: 'That is not a run this scene can decode. Paste the whole address bar, or just the part after s=.' })
      return
    }
    const o = run(decoded.config, decoded.events)
    setMsg({
      ok: o.silent,
      text: o.silent
        ? `Found it: ${o.activeBookings} active bookings on one resource and ${o.world.incidents.length} incidents. Nothing raised, nothing logged, and both organizers were told yes.`
        : o.world.crashed
          ? `Close: this run ends in an uncaught ${o.world.crashed.split(':')[0]}, which is also unrecorded, but it does at least fail loudly. Keep looking for the one that succeeds twice.`
          : `Decoded and folded: ${o.activeBookings} booking(s) and ${o.world.incidents.length} incident(s). Not a silent double booking. Loaded it so you can keep going from here.`,
    })
    loadEncoded(decoded.config, decoded.events, 'loaded a run from an excursion')
  }

  return (
    <div style={{ marginTop: 8 }}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="paste the link, or the part after s="
        spellCheck={false}
      />
      <button className="opt" style={{ marginLeft: 8 }} onClick={submit}>
        check it
      </button>
      {msg && <p style={{ marginTop: 8, fontSize: 13, color: msg.ok ? 'var(--ok)' : 'var(--ink-dim)' }}>{msg.text}</p>}
    </div>
  )
}
