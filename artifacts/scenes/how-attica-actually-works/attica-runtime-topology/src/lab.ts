// The laboratory primitives. Pure: imports the model, nothing else.
//
// Intervention: the semantic unit of learner experimentation. Every action
// that changes canonical state records one; history, replay and reset derive
// from the list. Changeset: what became different after an intervention,
// mechanically diffed between two outcomes. Probes: named selectors over the
// outcome, each tracing to a claim-card field or failure mode.
//
// Contract: concept-scene/references/laboratory.md

import { initialState, type Outcome, type SceneState } from './model'

export interface Intervention {
  target: string
  operation: 'set' | 'toggle' | 'scenario' | 'load'
  before?: string
  after?: string
  label: string
  patch: Partial<SceneState>
}

export const BASELINE: SceneState = {
  ...initialState,
  proxyRoutes: { ...initialState.proxyRoutes },
  breakpointsArmed: { ...initialState.breakpointsArmed },
}

export function replayState(baseline: SceneState, history: Intervention[]): SceneState {
  return history.reduce<SceneState>(
    (s, iv) => ({
      ...s,
      ...iv.patch,
      proxyRoutes: iv.patch.proxyRoutes ? { ...s.proxyRoutes, ...iv.patch.proxyRoutes } : s.proxyRoutes,
    }),
    { ...baseline, proxyRoutes: { ...baseline.proxyRoutes } },
  )
}

// ---------------------------------------------------------------------------
// Changeset
// ---------------------------------------------------------------------------

export interface Change {
  observable: string
  before: string
  after: string
}

function reqSummary(o: Outcome) {
  return o.requests.map((r) => `${r.path}:${r.ok ? 'ok' : r.failedAt}`).join(' ')
}

const OBSERVED: [string, (o: Outcome) => string][] = [
  ['request reachability', reqSummary],
  ['consumers live', (o) => o.consumers.filter((c) => c.liveNow).map((c) => c.id).join(',') || 'none'],
  ['jwt outcome', (o) => (o.jwt.ok ? 'succeeds (silent refresh)' : 'fails (401)')],
  ['debug configs that would launch', (o) => String(o.debugConfigs.filter((d) => d.wouldLaunch).length)],
  ['debug config package resolution', (o) => o.debugConfigs.map((d) => d.reason).join(' | ')],
]

export function changeset(prev: Outcome, next: Outcome): Change[] {
  return OBSERVED.filter(([, f]) => f(prev) !== f(next)).map(([observable, f]) => ({
    observable,
    before: f(prev),
    after: f(next),
  }))
}

// ---------------------------------------------------------------------------
// Probes: each traces to a claim-card field or a registered failure mode.
// ---------------------------------------------------------------------------

export interface Probe {
  id: string
  label: string
  traces: string
  select(o: Outcome, s: SceneState): string
}

export const PROBES: Probe[] = [
  {
    id: 'touches',
    label: 'which processes does /api touch?',
    traces: 'Consequence field: the claim about four independent processes',
    select: (o) => o.requests.find((r) => r.path === 'api')!.hops.map((h) => h.process).join(' → '),
  },
  {
    id: 'redis-load-bearing',
    label: 'is Redis load-bearing for /api right now?',
    traces: 'Do-not field: REST survives a Redis outage',
    select: (o) => (o.requests.find((r) => r.path === 'api')!.redisLoadBearing ? 'yes' : 'no'),
  },
  {
    id: 'ws-status',
    label: 'is the WebSocket path reachable?',
    traces: 'claim: the seam that needs two debuggers',
    select: (o) => {
      const ws = o.requests.find((r) => r.kind === 'ws')!
      return ws.ok ? 'reachable' : `fails at ${ws.failedAt}`
    },
  },
  {
    id: 'launchable',
    label: 'debug configs that would actually launch',
    traces: 'honest-failure rule: vscode-debug-config',
    select: (o) => `${o.debugConfigs.filter((d) => d.wouldLaunch).length} of ${o.debugConfigs.length}`,
  },
]
