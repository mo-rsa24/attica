// Workspace contract: one anchored surface (the topology diagram, always
// visible with its reachability readout attached) and everything else behind
// a toolbar of drawers, or a popover anchored to the click that opened it.

import { useEffect } from 'react'
import { STAGES } from './components'
import { decodeState, encodeState, type SceneState } from './model'
import { useStore } from './store'
import { Changeset } from './ui/Changeset'
import { DebugConfigs } from './ui/DebugConfigs'
import { Drawer } from './ui/Drawer'
import { Experiment } from './ui/Experiment'
import { Fork } from './ui/Fork'
import { Inspector } from './ui/Inspector'
import { Probes } from './ui/Probes'
import { Timeline } from './ui/Timeline'
import { Toolbar } from './ui/Toolbar'
import { Topology } from './ui/Topology'
import { Tour } from './ui/Tour'
import { Stage0Problem } from './stages/Stage0Problem'
import { Stage1Minimal } from './stages/Stage1Minimal'
import { Stage2Mechanism } from './stages/Stage2Mechanism'
import { Stage3Failures } from './stages/Stage3Failures'
import { Stage4Build } from './stages/Stage4Build'
import './styles.css'

export default function App() {
  const s = useStore()

  const state: SceneState = {
    viteServerUp: s.viteServerUp,
    proxyRoutes: s.proxyRoutes,
    redisChannelUp: s.redisChannelUp,
    redisCacheUp: s.redisCacheUp,
    backendMode: s.backendMode,
    jwtInterceptorEnabled: s.jwtInterceptorEnabled,
    selectedDebugConfig: s.selectedDebugConfig,
    selectedVenv: s.selectedVenv,
    requestLifecyclePlayhead: s.requestLifecyclePlayhead,
    breakpointsArmed: s.breakpointsArmed,
  }
  const encoded = encodeState(state)

  useEffect(() => {
    const read = () => {
      const st = useStore.getState()
      const stage = location.hash.match(/#\/stage\/(\d)/)
      if (stage) st.setStage(Number(stage[1]))
      const packed = location.hash.match(/\/s\/([^/?#]+)/)
      if (packed) {
        const decoded = decodeState(decodeURIComponent(packed[1]))
        if (decoded) st.loadState(decoded)
      }
    }
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])

  useEffect(() => {
    const h = `#/stage/${s.stage}/s/${encoded}`
    if (location.hash !== h) history.replaceState(null, '', h)
  }, [s.stage, encoded])

  useEffect(() => {
    if (!useStore.getState().seenTour) useStore.getState().startTour()
  }, [])

  return (
    <div className="app">
      <header>
        <div className="titlerow">
          <div className="title">Attica's runtime topology</div>
          <button className="tourlink" onClick={() => s.startTour()}>
            tour
          </button>
        </div>
        <nav className="stagestrip">
          {STAGES.map((label, i) => (
            <a key={i} href={`#/stage/${i}`} className={i === s.stage ? 'on' : ''} onClick={() => s.setStage(i)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <Changeset />
        <Topology state={state} />

        {s.stage === 0 && <Stage0Problem state={state} />}
        {s.stage === 1 && <Stage1Minimal state={state} />}
        {s.stage === 2 && <Stage2Mechanism state={state} />}
        {s.stage === 3 && <Stage3Failures state={state} />}
        {s.stage === 4 && <Stage4Build />}
      </main>

      <div className="side">
        <div className="claimcard">
          <strong>The claim</strong>
          <p className="tiny">
            One "hit save" instant, carried by four independently-failing processes glued by a dev-only proxy.
            Reproducing a bug across that seam needs two debuggers, in sync.
          </p>
        </div>
        <Toolbar />
      </div>

      <Inspector state={state} />

      {s.openDrawer === 'debug-configs' && (
        <Drawer title="Debug configs" onClose={() => s.openDrawerFn(null)}>
          <DebugConfigs state={state} />
        </Drawer>
      )}
      {s.openDrawer === 'timeline' && (
        <Drawer title="Request timeline" onClose={() => s.openDrawerFn(null)}>
          <Timeline />
        </Drawer>
      )}
      {s.openDrawer === 'history' && (
        <Drawer title="Probes, invariants & history" onClose={() => s.openDrawerFn(null)}>
          <Probes state={state} />
          <h3>History</h3>
          <Experiment state={state} />
        </Drawer>
      )}
      {s.forkOpen && (
        <Drawer title="Compare with an alternative" onClose={() => s.setForkOpen(false)}>
          <Fork state={state} />
        </Drawer>
      )}

      <Tour state={state} />
    </div>
  )
}
