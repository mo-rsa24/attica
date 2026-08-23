// Off-page prompts with a return the page can check. Four fields, all required.
// Where a return genuinely cannot be checked, it says unverified in one word
// rather than faking a check.

import { useState } from 'react'
import type { Excursion as Ex } from '../engagement'
import { FIELDS, decodeState, run, whitelistWouldDrop } from '../model'
import { useStore } from '../store'

export function Excursion({ ex }: { ex: Ex }) {
  return (
    <div className="excursion">
      <h4>{ex.id === 'lose-a-field' ? 'Find another way to lose work' : ex.where.split(',')[0]}</h4>
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
  // Read off the model, not written down here.
  const dropped = whitelistWouldDrop('step5')

  return (
    <div style={{ marginTop: 8 }}>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="how many of step 5's fields" spellCheck={false} />
      <button
        className="opt"
        style={{ marginLeft: 8 }}
        onClick={() =>
          setMsg(
            Number(v.trim()) === dropped.length
              ? `Yes: ${dropped.length}. It would have thrown away ${dropped.join(', ')}, which is everything step 5 collects. Its whitelist for step5 lists budget and guest_count, and step 5 sends neither.`
              : `No: ${dropped.length}. The whitelist for step5 allows only budget and guest_count, and step 5 sends ${dropped.join(', ')}.`,
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
    const lostWithoutStep2 = o.lostFields.filter(() => !decoded.config.step2Live)
    const names = lostWithoutStep2.map((l) => FIELDS.find((f) => f.id === l.field)?.label ?? l.field)
    setMsg({
      ok: lostWithoutStep2.length > 0,
      text:
        lostWithoutStep2.length > 0
          ? `Found: ${names.join(', ')} never reached EventDraft.data, and the step 2 control was off. Reason given by the model: ${lostWithoutStep2[0].where}.`
          : decoded.config.step2Live
            ? 'This run has the step 2 control switched on, which was the one route excluded. Try another.'
            : 'Decoded and folded: every field typed in this run reached the server. Loaded it so you can keep going from here.',
    })
    loadEncoded(decoded.config, decoded.events, 'loaded a run from an excursion')
  }

  return (
    <div style={{ marginTop: 8 }}>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="paste the link, or the part after s=" spellCheck={false} />
      <button className="opt" style={{ marginLeft: 8 }} onClick={submit}>
        check it
      </button>
      {msg && (
        <p style={{ marginTop: 8, fontSize: 13, color: msg.ok ? 'var(--ok)' : 'var(--ink-dim)' }}>{msg.text}</p>
      )}
    </div>
  )
}
