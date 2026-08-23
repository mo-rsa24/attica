import { PARTS, partById } from './machine'
import { run, runPrefix } from './model'
import { useStore } from './store'
import { Stage0Problem } from './stages/Stage0Problem'
import { Stage1Minimal } from './stages/Stage1Minimal'
import { Stage2Mechanism } from './stages/Stage2Mechanism'
import { Stage3Failures } from './stages/Stage3Failures'
import { Stage4Build } from './stages/Stage4Build'
import { Changeset } from './ui/Changeset'
import { Chart } from './ui/Chart'
import { Drawer } from './ui/Drawer'
import { Drive } from './ui/Drive'
import { EventLog } from './ui/EventLog'
import { Experiment } from './ui/Experiment'
import { Fork } from './ui/Fork'
import { PartInspector, StateInspector, TransitionInspector } from './ui/Inspector'
import { Popover } from './ui/Popover'
import { Probes } from './ui/Probes'
import { Toolbar } from './ui/Toolbar'
import { Tour } from './ui/Tour'

const STAGES = [
  { n: 0, label: 'the problem' },
  { n: 1, label: 'the smallest version that works' },
  { n: 2, label: 'the machine' },
  { n: 3, label: 'where it costs you' },
  { n: 4, label: 'build it' },
]

export default function App() {
  const { config, events, upTo, stage, setStage, selected, select, drawer, setDrawer, startTour } = useStore()
  // The chart shows the folded prefix when the timeline is scrubbed, so the
  // diagram and the log are two views of one execution.
  const outcome = upTo == null ? run(config, events) : runPrefix(config, events, upTo)

  // The machine is the anchored surface for the stages that are about it. Stage 4
  // builds one from nothing, where the code is the surface instead.
  const showMachine = stage < 4

  return (
    <div className="shell">
      <header className="topbar">
        <h1>Attica's event wizard, as a state machine</h1>
        <span className="sub">
          every Next writes the whole draft to the server, so the wizard survives a closed tab
        </span>
        <span className="spacer" />
        <button className="quiet" onClick={startTour}>
          tour
        </button>
      </header>

      <nav className="stagestrip" data-tour="stage-strip">
        {STAGES.map((s) => (
          <button key={s.n} aria-current={stage === s.n} onClick={() => setStage(s.n)}>
            <span className="num">{s.n}</span>
            {s.label}
          </button>
        ))}
      </nav>

      <div className="body">
        <div className="wrap">
          {showMachine && (
            <>
              <Chart outcome={outcome} config={config} />
              <Drive outcome={outcome} />
              <EventLog config={config} events={events} />
              <div style={{ height: 14 }} />
              <Changeset />
            </>
          )}

          {stage === 0 && <Stage0Problem />}
          {stage === 1 && <Stage1Minimal />}
          {stage === 2 && <Stage2Mechanism />}
          {stage === 3 && <Stage3Failures />}
          {stage === 4 && <Stage4Build />}

          {stage === 3 && (
            <div className="card">
              <h3>Every part, and how to break it</h3>
              <p className="lede">
                The list the scene is built from. Click one to inspect it, and its controls appear
                where you clicked.
              </p>
              <div className="parts">
                {PARTS.map((p) => (
                  <button
                    key={p.id}
                    className="part"
                    data-tour={`part:${p.id}`}
                    onClick={(e) => select({ kind: 'part', id: p.id, anchor: e.currentTarget.getBoundingClientRect() })}
                  >
                    <span className="pname">
                      {p.label}
                      {p.suspect && <span className="dotflag" title="flagged in the closing note" />}
                    </span>
                    <span className="pfile">{p.source.split(':')[0].split('/').pop()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Toolbar />

      {selected && (
        <Popover anchor={selected.anchor} onClose={() => select(null)}>
          {selected.kind === 'state' && <StateInspector id={selected.id} outcome={outcome} />}
          {selected.kind === 'transition' && <TransitionInspector id={selected.id} />}
          {selected.kind === 'part' && <PartInspector part={partById(selected.id)!} outcome={outcome} />}
        </Popover>
      )}

      {drawer === 'probes' && (
        <Drawer title="probes and checks" onClose={() => setDrawer(null)}>
          <Probes />
        </Drawer>
      )}
      {drawer === 'history' && (
        <Drawer title="what you did" onClose={() => setDrawer(null)}>
          <Experiment />
        </Drawer>
      )}
      {drawer === 'compare' && (
        <Drawer title="two worlds, one difference" onClose={() => setDrawer(null)}>
          <Fork />
        </Drawer>
      )}

      <Tour />
    </div>
  )
}
