// The controls that drive the machine. Every button is one real user action,
// and pressing it appends a semantic event to the log.
//
// These sit directly under the chart, so the thing you press and the thing that
// moves are in the same region.

import { FIELDS, SCENARIOS, type MachineEvent, type Outcome } from '../model'
import { useStore } from '../store'

export function Drive({ outcome }: { outcome: Outcome }) {
  const { fire, loadScenario, reset } = useStore()
  const m = outcome.machine
  const at = m.at

  const can = {
    create: !m.draftExists,
    edit: m.draftExists && at !== null && at !== 'gone',
    next: m.draftExists && at !== null && at !== 'gone' && at !== 'review',
    back: m.draftExists && typeof at === 'string' && at !== 'gone' && at !== 'step1' && at !== 'step2',
    exit: m.draftExists && at !== null && at !== 'gone' && at !== 'step2',
    close: m.draftExists && at !== 'gone',
    resume: m.draftExists && at === 'gone',
    publish: m.draftExists && at === 'review',
  }

  // Only the fields the screen you are on actually collects.
  const here = FIELDS.filter((f) => f.collectedOn === at)

  const go = (e: MachineEvent, label: string) => fire(e, label)

  return (
    <div className="drive" data-tour="controls">
      <div className="driverow">
        <span className="dlabel">the organizer</span>
        <button className="opt" disabled={!can.create} onClick={() => go({ t: 'create-draft' }, 'started a draft')}>
          start a draft
        </button>
        {here.length > 0
          ? here.map((f) => (
              <button
                key={f.id}
                className="opt"
                disabled={!can.edit}
                onClick={() => go({ t: 'edit', field: f.id }, `typed the ${f.label}`)}
              >
                type the {f.label}
              </button>
            ))
          : can.edit && <span className="dnote">this screen collects nothing</span>}
      </div>

      <div className="driverow">
        <span className="dlabel">navigation</span>
        <button className="opt" disabled={!can.back} onClick={() => go({ t: 'back' }, 'pressed Back')}>
          Back
        </button>
        <button className="opt primary" disabled={!can.next} onClick={() => go({ t: 'next' }, 'pressed Next')}>
          Next
        </button>
        <button className="opt" disabled={!can.exit} onClick={() => go({ t: 'save-and-exit' }, 'pressed Save & exit')}>
          Save &amp; exit
        </button>
        <button className="opt" disabled={!can.publish} onClick={() => go({ t: 'publish' }, 'pressed Publish')}>
          Publish
        </button>
      </div>

      <div className="driverow">
        <span className="dlabel">life happens</span>
        <button className="opt" disabled={!can.close} onClick={() => go({ t: 'close-tab' }, 'closed the tab')}>
          close the tab
        </button>
        <button className="opt" disabled={!can.resume} onClick={() => go({ t: 'resume' }, 'came back later')}>
          come back
        </button>
        <span className="dsep" />
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
