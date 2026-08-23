// What opens when you click a state, a transition, or a part. What it is, what
// it holds right now, the real artifact, how to break it, and the counterfactual
// computed by the same model.

import { TRANSITIONS, stateById, type Part } from '../machine'
import { changeset } from '../lab'
import { FIELDS, run, type Config, type MachineEvent, type Outcome } from '../model'
import { useStore } from '../store'
import { CodeBlock } from './CodeBlock'

type Opt = { value: string | boolean; label: string }

const OPTIONS: Partial<Record<keyof Config, Opt[]>> = {
  step2Live: [
    { value: false, label: 'redirects to step1 (as shipped)' },
    { value: true, label: 'routed live' },
  ],
  network: [
    { value: 'up', label: 'saves reach the server' },
    { value: 'save-fails', label: 'saves fail' },
  ],
  staleLocal: [
    { value: false, label: 'clean' },
    { value: true, label: "holds another draft's steps" },
  ],
  route: [
    { value: 'bare', label: '/listing/1' },
    { value: 'explicit-step5', label: '/listing/1/step5' },
  ],
  storedStepOverride: [
    { value: 'none', label: 'as saved' },
    { value: 'unknown', label: 'a value the lookup rejects' },
  ],
  bookings: [
    { value: 'none', label: 'no requests' },
    { value: 'pending', label: '1 still pending' },
    { value: 'approved', label: 'all approved' },
  ],
  priorEventId: [
    { value: false, label: 'absent' },
    { value: true, label: 'in draft.data' },
  ],
  whitelistLive: [
    { value: false, label: 'as shipped (no effect)' },
    { value: true, label: 'wired up' },
  ],
}

const LABEL: Partial<Record<keyof Config, string>> = {
  step2Live: 'the step2 route',
  network: 'the save call',
  staleLocal: 'localStorage',
  route: 'the URL you return to',
  storedStepOverride: 'current_step holds',
  bookings: 'booking requests',
  priorEventId: 'published_event_id',
  whitelistLive: 'the whitelist',
}

export function Controls({ keys }: { keys: (keyof Config)[] }) {
  const { config, setConfig } = useStore()
  return (
    <>
      {keys.map((k) => {
        const opts = OPTIONS[k]
        if (!opts) return null
        return (
          <div className="ctl" key={k}>
            <label>{LABEL[k] ?? k}</label>
            {opts.map((o) => (
              <button
                key={String(o.value)}
                className="opt"
                aria-pressed={config[k] === o.value}
                onClick={() =>
                  setConfig({ [k]: o.value } as Partial<Config>, `${LABEL[k] ?? k}: ${o.label}`)
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        )
      })}
    </>
  )
}

export function StateInspector({ id, outcome }: { id: string; outcome: Outcome }) {
  const s = stateById(id)
  if (!s) return null
  const m = outcome.machine
  const collected = FIELDS.filter((f) => f.collectedOn === id)
  const stored = m.server[id as keyof typeof m.server] || []

  return (
    <>
      <h3>{s.label}</h3>
      <div className="what">{s.holds}</div>

      <div className="sect">right now</div>
      <div className="mono" style={{ fontSize: 12.5 }}>
        {String(m.at) === id ? 'you are here. ' : ''}
        {stored.length > 0
          ? `data.steps.${id} holds ${stored.length} field(s)`
          : `data.steps.${id} is absent from the draft`}
      </div>

      {collected.length > 0 && (
        <>
          <div className="sect">it collects</div>
          <div style={{ fontSize: 13 }}>
            {collected.map((f) => (
              <div key={f.id}>
                {f.label} → <code>steps.{f.storedUnder}</code> → <code>{f.column}</code>
                {f.storedUnder !== id && <span className="pill warn" style={{ marginLeft: 6 }}>not its own bucket</span>}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sect">what it saves</div>
      <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
        {s.persists === 'json'
          ? 'a JSON payload, through saveStep, on the way out'
          : s.persists === 'asset'
            ? 'files, through the multipart asset endpoint. Its Next sends an empty JSON payload.'
            : s.persists === 'nothing'
              ? 'nothing. Its Next exists only to move current_step.'
              : 'not a wizard screen'}
      </div>

      <div className="sect">the file</div>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-dim)' }}>
        {s.file}
      </div>

      {id === 'step2' && (
        <>
          <div className="sect">why it is a ghost</div>
          <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
            It is not in STEP_SEQUENCE, so getNextStep treats it as a fixed point and getStepProgress
            scores it 0. And its route is a redirect, so it never renders at all.
          </div>
          <CodeBlock snippet="routes" hot={121} />
          <Controls keys={['step2Live']} />
        </>
      )}
      {id === 'step3' && <CodeBlock snippet="step3write" hot={182} caption="Step 3's schedule is written into step1's bucket, not its own." />}
      {id === 'published' && <CodeBlock snippet="publish" hot={515} />}
    </>
  )
}

export function TransitionInspector({ id }: { id: string }) {
  const t = TRANSITIONS.find((x) => x.id === id)
  if (!t) return null
  const from = stateById(t.from)
  const to = stateById(t.to)
  return (
    <>
      <h3>
        {from?.label} → {to?.label}
      </h3>
      <div className="what">{t.label}</div>

      <div className="sect">what runs on the way</div>
      <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{t.does}</div>

      <div className="sect">declared at</div>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-dim)' }}>
        {t.source}
      </div>

      {t.kind === 'redirect' && <Controls keys={['step2Live']} />}
      {t.kind === 'publish' && (
        <>
          <CodeBlock snippet="projection" hot={386} caption="Every column has a fallback, because nothing upstream guarantees a value." />
          <Controls keys={['priorEventId', 'bookings']} />
        </>
      )}
      {t.id === 't1' && <CodeBlock snippet="saveStep" hot={417} />}
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

      <Controls keys={[part.controls]} />

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

/** The counterfactual, computed by the canonical model, never by a renderer rule. */
function ablate(part: Part, config: Config, events: MachineEvent[], now: Outcome): string | null {
  const flip: Partial<Config> = {}
  switch (part.controls) {
    case 'step2Live':
      flip.step2Live = !config.step2Live
      break
    case 'network':
      flip.network = config.network === 'up' ? 'save-fails' : 'up'
      break
    case 'staleLocal':
      flip.staleLocal = !config.staleLocal
      break
    case 'route':
      flip.route = config.route === 'bare' ? 'explicit-step5' : 'bare'
      break
    case 'storedStepOverride':
      flip.storedStepOverride = config.storedStepOverride === 'none' ? 'unknown' : 'none'
      break
    case 'whitelistLive':
      flip.whitelistLive = !config.whitelistLive
      break
    case 'priorEventId':
      flip.priorEventId = !config.priorEventId
      break
    case 'bookings':
      flip.bookings = config.bookings === 'pending' ? 'none' : 'pending'
      break
    default:
      return null
  }
  const diff = changeset(now, run({ ...config, ...flip }, events))
  if (diff.length === 0) return 'nothing changes from where you are: it is not load-bearing in this run.'
  return diff.map((d) => `${d.observable}: ${d.before} becomes ${d.after}`).join('; ') + '.'
}
