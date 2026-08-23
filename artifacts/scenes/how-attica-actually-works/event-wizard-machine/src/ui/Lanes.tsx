// The claim card, run as a comparison. One organizer, one answer, two paths.
// Both lanes fold the same event log through the same model; the only difference
// is which screen collected the answer.

import { FIELDS, initialConfig, run, type MachineEvent } from '../model'

// The organizer types an event type, presses Next, closes the tab, comes back.
const LOG: MachineEvent[] = [
  { t: 'create-draft' },
  { t: 'edit', field: 'category' },
  { t: 'next' },
  { t: 'close-tab' },
  { t: 'resume' },
]

// The same thing, but the answer was given on step 2, which the route sends
// straight past today. Switching it live is how you see what it used to do.
const LOG2: MachineEvent[] = [
  { t: 'create-draft' },
  { t: 'next' },
  { t: 'edit', field: 'category' },
  { t: 'next' },
  { t: 'close-tab' },
  { t: 'resume' },
]

export function Lanes() {
  const saved = run(initialConfig, LOG)
  const lost = run({ ...initialConfig, step2Live: true }, LOG2)
  const label = FIELDS.find((f) => f.id === 'category')!.label

  return (
    <div className="lanes" data-tour="lanes">
      <Lane
        name="typed on step 1"
        o={saved}
        note="saveStep sends it with the rest of the accumulated steps map"
      />
      <Lane
        name="typed on step 2"
        o={lost}
        note="its Next calls navigate and nothing else"
      />

      <dl className="kv" style={{ marginTop: 14, gridColumn: '1 / -1' }}>
        <dt>same answer</dt>
        <dd>
          the organizer picked an {label} in both lanes, then closed the tab and came back two days
          later.
        </dd>
        <dt>what differs</dt>
        <dd>
          only which screen collected it. One of them calls saveStep on the way out. The other one
          does not.
        </dd>
        <dt>the point</dt>
        <dd>
          this is not a hypothetical alternative. ListingStep2.jsx is in the repository, and it is
          the design the wizard was moved away from.
        </dd>
      </dl>
    </div>
  )
}

function Lane({ name, o, note }: { name: string; o: ReturnType<typeof run>; note: string }) {
  const survived = o.lostFields.length === 0
  return (
    <div className={`lane ${survived ? 'ok' : 'bad'}`}>
      <div className="lname">{name}</div>
      <div className="lnote">{note}</div>
      <div className="lresult">
        <span className={survived ? 'good' : 'gone'}>
          {survived ? 'still there when they came back' : 'gone'}
        </span>
      </div>
      <dl className="kv" style={{ marginTop: 8 }}>
        <dt>data.steps</dt>
        <dd className="mono">
          {Object.keys(o.machine.server).length ? Object.keys(o.machine.server).join(', ') : 'empty'}
        </dd>
        <dt>resumed on</dt>
        <dd>{o.resumesAt}</dd>
      </dl>
    </div>
  )
}
