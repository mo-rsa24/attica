// The controls that drive the world, and the config options every inspector
// reuses. They sit under the bench, so the thing you press and the thing that
// moves are in one region.

import { SCENARIOS, type Config } from '../model'
import { useStore } from '../store'

type Opt = { value: string | number | boolean; label: string }

export const OPTIONS: Partial<Record<keyof Config, Opt[]>> = {
  design: [
    { value: 'slots', label: 'materialized slots' },
    { value: 'overlap-query', label: 'one table + overlap query' },
  ],
  vendor: [
    { value: 'sqlite', label: 'sqlite (dev)' },
    { value: 'postgresql', label: 'postgresql' },
  ],
  locking: [
    { value: 'select-for-update', label: 'SELECT FOR UPDATE' },
    { value: 'none', label: 'no lock' },
  ],
  slotCapacity: [
    { value: 1, label: 'capacity 1' },
    { value: 5, label: 'capacity 5' },
  ],
  attendees: [
    { value: 1, label: '1 attendee' },
    { value: 3, label: '3 attendees' },
  ],
  idem: [
    { value: 'none', label: 'no key' },
    { value: 'same-key-same-payload', label: 'same key, same payload' },
    { value: 'same-key-different-payload', label: 'same key, different payload' },
  ],
  dst: [
    { value: 'normal', label: 'ordinary date' },
    { value: 'spring-forward', label: 'spring forward' },
    { value: 'fall-back', label: 'fall back' },
  ],
  blackout: [
    { value: false, label: 'none' },
    { value: true, label: 'blackout covers it' },
  ],
  holdMinutes: [
    { value: 30, label: '30 min (default)' },
    { value: 5, label: '5 min' },
  ],
}

export const LABEL: Partial<Record<keyof Config, string>> = {
  design: 'design',
  vendor: 'database',
  locking: 'locking',
  slotCapacity: 'slot capacity',
  attendees: 'attendee_count',
  idem: 'Idempotency-Key',
  dst: 'the date',
  blackout: 'AvailabilityException',
  holdMinutes: 'checkout_hold_minutes',
}

export function ConfigControls({ keys }: { keys: (keyof Config)[] }) {
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
                onClick={() => setConfig({ [k]: o.value } as Partial<Config>, `${LABEL[k] ?? k}: ${o.label}`)}
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

export function Drive() {
  const { fire, loadScenario, reset } = useStore()
  return (
    <div className="drive" data-tour="drive">
      <ConfigControls keys={['design', 'locking', 'vendor', 'slotCapacity']} />

      <div className="driverow">
        <span className="dlabel">jobs</span>
        <button className="opt" onClick={() => fire({ t: 'materialize' }, 'ran materialize_availability_slots')}>
          materialize slots
        </button>
        <button className="opt" onClick={() => fire({ t: 'run-expire-holds' }, 'ran expire_draft_holds')}>
          expire holds
        </button>
        <span className="dsep" />
        <span className="dlabel">the clock</span>
        {[1, 29, 5].map((m) => (
          <button key={m} className="opt" onClick={() => fire({ t: 'tick', minutes: m }, `advanced the clock ${m} min`)}>
            +{m} min
          </button>
        ))}
      </div>

      <div className="driverow">
        <span className="dlabel">the hold path</span>
        <button className="opt" onClick={() => fire({ t: 'request', actor: 'A' }, 'A created a BookingRequest')}>
          A requests
        </button>
        <button className="opt" onClick={() => fire({ t: 'approve', actor: 'A' }, 'the provider approved A')}>
          approve
        </button>
        <button className="opt" onClick={() => fire({ t: 'pay', actor: 'A' }, 'A paid the deposit')}>
          A pays
        </button>
        <button className="opt" onClick={() => fire({ t: 'retry', actor: 'A' }, 'A retried the request')}>
          A retries
        </button>
      </div>

      <div className="driverow">
        <span className="dlabel">or run one</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className="opt"
            title={s.blurb}
            onClick={() => loadScenario(s.id, s.events, s.config, `ran the scenario: ${s.label}`)}
          >
            {s.label}
          </button>
        ))}
        <button className="opt" onClick={reset}>
          reset
        </button>
      </div>
    </div>
  )
}
