import { PARTS, partById } from './pipeline'
import { run, runPrefix } from './model'
import { useStore } from './store'
import { Stage0Problem } from './stages/Stage0Problem'
import { Stage1Minimal } from './stages/Stage1Minimal'
import { Stage2Mechanism } from './stages/Stage2Mechanism'
import { Stage3Failures } from './stages/Stage3Failures'
import { Stage4Build } from './stages/Stage4Build'
import { Bench } from './ui/Bench'
import { Changeset } from './ui/Changeset'
import { Drive } from './ui/Controls'
import { Drawer } from './ui/Drawer'
import { EventLog } from './ui/EventLog'
import { Experiment } from './ui/Experiment'
import { Fork } from './ui/Fork'
import { EdgeInspector, NodeInspector, PartInspector } from './ui/Inspector'
import { Map } from './ui/Map'
import { Popover } from './ui/Popover'
import { Probes } from './ui/Probes'
import { Toolbar } from './ui/Toolbar'
import { Tour } from './ui/Tour'

const STAGES = [
  { n: 0, label: 'why not just query' },
  { n: 1, label: 'one rule, one row' },
  { n: 2, label: 'the mechanism' },
  { n: 3, label: 'where it costs you' },
  { n: 4, label: 'build it' },
]

export default function App() {
  const { config, events, upTo, stage, setStage, selected, select, drawer, setDrawer, startTour } = useStore()
  const outcome = upTo == null ? run(config, events) : runPrefix(config, events, upTo)

  // The bench is the anchored surface everywhere the scene is about this system.
  // The map joins it from stage 1, once there is a pipeline worth navigating.
  const showBench = stage < 4
  const showMap = stage >= 1 && stage < 4

  return (
    <div className="shell">
      <header className="topbar">
        <h1>Attica scheduling: availability, holds, and conflicts</h1>
        <span className="sub">
          materialized slots with a counter, two locks, and a record of which layer caught it
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
          {showMap && <Map outcome={outcome} config={config} />}
          {showBench && (
            <>
              <Bench outcome={outcome} config={config} />
              <Drive />
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
                The list the scene is built from. Click one to inspect it; its controls appear where
                you clicked.
              </p>
              <div className="parts">
                {PARTS.map((p) => (
                  <button
                    key={p.id}
                    className="part"
                    data-tour={`part:${p.id}`}
                    onClick={(e) =>
                      select({ kind: 'part', id: p.id, anchor: e.currentTarget.getBoundingClientRect() })
                    }
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
          {selected.kind === 'node' && <NodeInspector id={selected.id} outcome={outcome} />}
          {selected.kind === 'edge' && <EdgeInspector id={selected.id} />}
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
