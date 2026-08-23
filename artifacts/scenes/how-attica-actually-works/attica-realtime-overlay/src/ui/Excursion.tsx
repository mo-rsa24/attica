// Off-page prompts with a return the page can check. Four fields, all required.
// Where a return genuinely cannot be checked, it says unverified in one word
// rather than faking a check.

import { useState } from 'react'
import type { Excursion as Ex } from '../engagement'
import { decodeState, initialState, run } from '../model'
import { useStore } from '../store'

export function Excursion({ ex }: { ex: Ex }) {
  return (
    <div className="excursion">
      <h4>{ex.id === 'falsify' ? 'Try to prove this scene wrong' : ex.where.split(',')[0]}</h4>
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
      {ex.check === 'state' && <StateCheck />}
      {ex.check === 'number' && <NumberCheck />}
      {ex.check === 'none' && <span className="pill">unverified</span>}
    </div>
  )
}

function StateCheck() {
  const { apply } = useStore()
  const [v, setV] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = () => {
    const s = decodeState(v.trim())
    if (!s) {
      setMsg({ ok: false, text: 'That is not a state this scene can decode. Check the separator is ~.' })
      return
    }
    const o = run(s)
    const lost = o.messageDurable && o.dbRowCount === 0
    setMsg({
      ok: lost,
      text: lost
        ? 'You found one. The claim is wrong and the scene should be fixed.'
        : `Decoded and run: the outcome is "${o.variant}", with ${o.dbRowCount} rows committed. ` +
          'No message was lost, so this state does not falsify the claim. The scene has loaded it ' +
          'so you can look at it.',
    })
    apply({
      target: 'state',
      operation: 'load',
      label: `loaded a state from an excursion: ${v.trim()}`,
      patch: s,
    })
  }

  return (
    <div style={{ marginTop: 8 }}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={`e.g. ${['up', 'valid', 'rest', 'daphne', '1', '8000', '100', '0'].join('~')}`}
        spellCheck={false}
      />
      <button className="opt" style={{ marginLeft: 8 }} onClick={submit}>
        check it
      </button>
      {msg && (
        <p style={{ marginTop: 8, fontSize: 13, color: msg.ok ? 'var(--bad)' : 'var(--ink-dim)' }}>{msg.text}</p>
      )}
    </div>
  )
}

function NumberCheck() {
  const [v, setV] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  // The answer is read off the model, not written down here.
  const truth = run({ ...initialState, redis: 'down-after-connect' }).httpStatus

  return (
    <div style={{ marginTop: 8 }}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="the HTTP status the POST returns"
        spellCheck={false}
      />
      <button
        className="opt"
        style={{ marginLeft: 8 }}
        onClick={() =>
          setMsg(
            Number(v.trim()) === truth
              ? `Yes: ${truth}. The broadcast is not part of the write, so its failure never reaches the response.`
              : `No: the model says ${truth}. The bare \`except Exception\` in _safe_group_send is the line that decides it.`,
          )
        }
      >
        check it
      </button>
      {msg && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-dim)' }}>{msg}</p>}
    </div>
  )
}
