import { Crumbs, JourneyMap, StageView } from './components/Atlas'
import { CallView } from './components/CallView'
import { ChangesetStrip } from './components/Changeset'
import { ForkDrawer, HistoryDrawer, ProbesDrawer, SourceDrawer } from './components/Drawers'
import { PopoverLayer } from './components/Popover'
import { Rail } from './components/Rail'
import { Runner } from './components/Runner'
import { Tour } from './components/Tour'
import { useScene } from './store'

export default function App() {
  const { level, world, drawer, toggleDrawer, startTour } = useScene()
  const call = level.kind === 'call' ? world.calls.find((c) => c.cid === level.cid) : null

  return (
    <div className="shell">
      <header className="topbar">
        <h1>The organizer journey, as it actually runs</h1>
        <span className="repo">/home/molef/Work/attica</span>
        <span className="spacer" />
        <div className="toolbar" data-tour="tour-toolbar">
          <button className={`tool${drawer === 'source' ? ' on' : ''}`} onClick={() => toggleDrawer('source')}>
            source
          </button>
          <button className={`tool${drawer === 'probes' ? ' on' : ''}`} onClick={() => toggleDrawer('probes')}>
            probes
          </button>
          <button className={`tool${drawer === 'history' ? ' on' : ''}`} onClick={() => toggleDrawer('history')}>
            history
          </button>
          <button className={`tool${drawer === 'fork' ? ' on' : ''}`} onClick={() => toggleDrawer('fork')}>
            fork
          </button>
          <button className="tool" onClick={startTour}>
            tour
          </button>
        </div>
      </header>

      <div className="body">
        <Rail />

        <main className="main">
          <Runner />
          <Crumbs />

          {level.kind === 'journey' && <JourneyMap />}
          {level.kind === 'stage' && <StageView stage={level.stage} />}
          {level.kind === 'call' && call && <CallView call={call} />}
          {level.kind === 'call' && !call && (
            <p className="note dim">That request is not in the current world. Run the journey again.</p>
          )}

          <ChangesetStrip />
        </main>
      </div>

      <PopoverLayer />
      <SourceDrawer />
      <ProbesDrawer />
      <HistoryDrawer />
      <ForkDrawer />
      <Tour />
    </div>
  )
}
