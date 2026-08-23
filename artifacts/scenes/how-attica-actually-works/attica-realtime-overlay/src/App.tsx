import { byId } from './atlas'
import { run } from './model'
import { useStore } from './store'
import { Stage0Map } from './stages/Stage0Map'
import { Stage1Minimal } from './stages/Stage1Minimal'
import { Stage2Mechanism } from './stages/Stage2Mechanism'
import { Stage3Failures } from './stages/Stage3Failures'
import { Stage4Build } from './stages/Stage4Build'
import { Canvas } from './ui/Canvas'
import { Changeset } from './ui/Changeset'
import { Drawer } from './ui/Drawer'
import { Experiment } from './ui/Experiment'
import { Fork } from './ui/Fork'
import { EdgeInspector, NodeInspector } from './ui/Inspector'
import { Popover } from './ui/Popover'
import { Probes } from './ui/Probes'
import { Timeline } from './ui/Timeline'
import { Toolbar } from './ui/Toolbar'
import { Tour } from './ui/Tour'

const STAGES = [
  { n: 0, label: 'the map' },
  { n: 1, label: 'the smallest version that works' },
  { n: 2, label: 'the mechanism' },
  { n: 3, label: 'where it costs you' },
  { n: 4, label: 'build it' },
]

export default function App() {
  const { state, stage, setStage, selected, select, drawer, setDrawer, startTour } = useStore()
  const outcome = run(state)

  // The map and the timeline are the anchored surface for the stages that are
  // about this system. Stage 4 is about code you are writing from nothing, so
  // the code becomes the surface there and the map would be decoration.
  const showMap = stage < 4

  return (
    <div className="shell">
      <header className="topbar">
        <h1>Attica: a REST-first backend and its WebSocket overlay</h1>
        <span className="sub">
          the row is committed before anyone is told, so every real-time path is droppable
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
          {showMap && (
            <>
              <Canvas outcome={outcome} />
              <Timeline outcome={outcome} />
              <div style={{ height: 14 }} />
              <Changeset />
            </>
          )}

          {stage === 0 && <Stage0Map />}
          {stage === 1 && <Stage1Minimal />}
          {stage === 2 && <Stage2Mechanism />}
          {stage === 3 && <Stage3Failures />}
          {stage === 4 && <Stage4Build />}
        </div>
      </div>

      <Toolbar />

      {selected && (
        <Popover anchor={selected.anchor} onClose={() => select(null)}>
          {selected.kind === 'node' ? (
            <NodeInspector node={byId(selected.id)!} />
          ) : (
            <EdgeInspector edge={EDGE(selected.id)} />
          )}
        </Popover>
      )}

      {drawer === 'probes' && (
        <Drawer title="probes and checks" onClose={() => setDrawer(null)}>
          <Probes />
        </Drawer>
      )}
      {drawer === 'history' && (
        <Drawer title="what you changed" onClose={() => setDrawer(null)}>
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

import { EDGES } from './atlas'
const EDGE = (id: string) => EDGES.find((e) => e.id === id)!
