// The Debug Configs drawer: all five real launch.json blocks, the two real
// compounds, and the venv-binding fork. Every "would this launch" answer
// comes from model.ts's debugConfigOutcomes(), never asserted here.

import { LAUNCH_JSON } from '../artifacts'
import { COMPOUNDS, debugConfigOutcomes, type SceneState } from '../model'
import { useStore } from '../store'
import { CodeBlock } from './CodeBlock'

export function DebugConfigs({ state }: { state: SceneState }) {
  const s = useStore()
  const outcomes = debugConfigOutcomes(state)

  return (
    <div>
      <p className="muted tiny">
        Every block below is copied from the real <code>.vscode/launch.json</code> in this repository, unchanged.
      </p>

      <label className="fork-pick">
        install a hypothetical package into:
        <select
          name="venv-binding"
          value={state.selectedVenv}
          onChange={(e) => s.setSelectedVenv(e.target.value as 'backend-venv' | 'lobola')}
        >
          <option value="backend-venv">backend/venv (the venv CLAUDE.md documents)</option>
          <option value="lobola">/home/molef/lobola (what launch.json actually uses)</option>
        </select>
      </label>

      <div className="debugconfig-list">
        {outcomes.map((o) => (
          <div key={o.id} className={`debugconfig ${o.wouldLaunch ? 'ok' : 'fail'}`}>
            <div className="debugconfig-head">
              <strong>{o.label}</strong>
              <span className={o.wouldLaunch ? 'badge' : 'badge dim'}>{o.wouldLaunch ? 'would launch' : 'would fail'}</span>
            </div>
            {o.interpreter && (
              <p className="muted tiny">
                interpreter: <code>{o.interpreter}</code>
              </p>
            )}
            <p className="because">{o.reason}</p>
            {o.errorString && <code className="reach-err">{o.errorString}</code>}
          </div>
        ))}
      </div>

      <h3>Compounds</h3>
      <p className="muted tiny">
        Exactly two, exactly two legs each. Neither includes the Chrome-debug leg: this scene will not pretend one does.
      </p>
      <ul className="compound-list">
        {COMPOUNDS.map((c) => (
          <li key={c.id}>
            <strong>{c.label}</strong>: {c.legs.join(' + ')}
          </li>
        ))}
      </ul>

      <CodeBlock code={LAUNCH_JSON} lang="json" caption=".vscode/launch.json" />
    </div>
  )
}
