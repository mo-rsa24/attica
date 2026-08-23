// Stage 0: the problem, run as the comparison. No mechanism yet.

import { PARTS } from '../pipeline'
import type { SchedEvent } from '../model'
import { useStore } from '../store'
import { Lanes } from '../ui/Lanes'

/** Both check before either writes: the schedule the "put it on the bench"
 *  button loads, so the reader can step it themselves. */
const RACE: SchedEvent[] = [
  { t: 'txn', actor: 'A', phase: 'lock' },
  { t: 'txn', actor: 'A', phase: 'check' },
  { t: 'txn', actor: 'B', phase: 'lock' },
  { t: 'txn', actor: 'B', phase: 'check' },
  { t: 'txn', actor: 'A', phase: 'reserve' },
  { t: 'txn', actor: 'A', phase: 'insert' },
  { t: 'txn', actor: 'A', phase: 'commit' },
  { t: 'txn', actor: 'B', phase: 'reserve' },
  { t: 'txn', actor: 'B', phase: 'insert' },
  { t: 'txn', actor: 'B', phase: 'commit' },
]

export function Stage0Problem() {
  const { loadScenario, setConfig, config } = useStore()

  return (
    <>
      <div className="card">
        <h2>Two organizers want the same Saturday</h2>
        <p className="lede">
          They click within a second of each other. Nothing about that is unusual, and everything
          about what happens next depends on how availability is stored.
        </p>
        <p>
          The obvious design is one Booking table with a start and an end, and a query on every
          attempt: is there already an active booking overlapping this window? It is one table, one
          index, and about four lines. Below it is the design Attica actually has, running the same
          two attempts.
        </p>
        <p>
          On arrival the two agree, and that is the honest place to start: at capacity 1 with the
          lock held, all the extra models buy you is nothing. Two settings make them diverge, and
          they are the two controls under the lanes.
        </p>
        <Lanes />
        <div className="ctl" style={{ marginTop: 14 }}>
          <button
            className="opt"
            onClick={() => {
              setConfig({ locking: 'none', design: 'overlap-query', vendor: 'sqlite' }, 'set up the race')
              loadScenario('race', RACE, { locking: 'none', design: 'overlap-query', vendor: 'sqlite' }, 'ran the race on the bench')
            }}
          >
            put that schedule on the bench
          </button>
          <span className="dnote">
            then step it yourself and try a different order
          </span>
        </div>
      </div>

      <div className="card">
        <h3>The query is not wrong. It is just answering a question about the past.</h3>
        <p>
          <code>WHERE start_at &lt; :end AND end_at &gt; :start</code> is a correct overlap test. The
          problem is when it runs: both transactions ask it before either has written anything, so
          both get the same true answer, and both act on it.
        </p>
        <p>
          Two fixes are available and they are not the same fix. Serialize the readers so only one
          can be between the question and the answer at a time. Or give the database a rule it can
          enforce without being asked. Attica does both, in that order, and records which one caught
          each collision.
        </p>
        <p style={{ marginBottom: 0 }}>
          It also does a third thing that neither fix gives you: it turns availability into rows with
          a counter, so a resource that can take five bookings at once can say so. An overlap query
          has no way to express five.
        </p>
      </div>

      <div className="card">
        <h3>The three settings this whole scene turns on</h3>
        <p className="lede">
          Everything else is detail. These three decide which of the four outcomes you get.
        </p>
        {PARTS.filter((p) => p.stage === 0 || p.id === 'vendor').map((p) => (
          <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <strong style={{ fontSize: 13.5 }}>{p.label}</strong>
            <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>{p.what}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 3 }}>
              {p.source}
            </div>
          </div>
        ))}
        <p style={{ marginTop: 12, marginBottom: 0, fontSize: 13.5, color: 'var(--ink-dim)' }}>
          Right now: <strong>{config.design}</strong>, <strong>{config.locking}</strong>, on{' '}
          <strong>{config.vendor}</strong>.
        </p>
      </div>

      <div className="card">
        <h3>What is coming</h3>
        <dl className="kv">
          <dt>stage 1</dt>
          <dd>one rule becoming one slot row, and the four columns that do the work.</dd>
          <dt>stage 2</dt>
          <dd>the pipeline, the two locks, and the two constraints, with the map as the surface.</dd>
          <dt>stage 3</dt>
          <dd>six ways it costs you, including two that are quiet.</dd>
          <dt>stage 4</dt>
          <dd>build it in SQL and then Django, one race at a time.</dd>
        </dl>
        <p style={{ marginBottom: 0, color: 'var(--ink-faint)', fontSize: 13 }}>
          How the right-hand lane turns a recurring rule into that counter is stage 1. Until then it
          is allowed to be a black box.
        </p>
      </div>
    </>
  )
}
