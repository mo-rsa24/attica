// Component values, current stage, current step. Never a derived value:
// everything derived comes from model.resolve() or lifecycle.ts on each
// render.

import { create } from 'zustand'
import { REGISTRY } from './components'
import { decodeState, type DebugConfigId, type ProxyPath, type SceneState, type VenvId } from './model'
import { BASELINE, type Intervention } from './lab'
import { TOUR_KEY } from './engagement'

export type DrawerId = 'debug-configs' | 'timeline' | 'history' | null

export interface PopoverState {
  id: string
  kind: 'component' | 'node' | 'edge'
  x: number
  y: number
}

interface Store extends SceneState {
  stage: number
  popover: PopoverState | null
  openDrawer: DrawerId
  tourStep: number | null
  seenTour: boolean
  predictions: Record<string, string>
  excursions: Record<string, string>
  baseline: SceneState
  history: Intervention[]
  lastChange: { prev: SceneState; next: SceneState } | null
  forkOpen: boolean
  focusProcess: string | null

  set<K extends keyof SceneState>(k: K, v: SceneState[K]): void
  toggleProxyPath(path: ProxyPath): void
  setStage(n: number): void
  setPlayhead(n: number): void
  toggleBreakpoint(which: 'frontend' | 'backend'): void
  setSelectedDebugConfig(id: DebugConfigId): void
  setSelectedVenv(id: VenvId): void
  openPopover(id: string, kind: PopoverState['kind'], x: number, y: number): void
  closePopover(): void
  openDrawerFn(id: DrawerId): void
  reset(): void
  applyScenario(patch: Partial<SceneState>, label?: string): void
  loadState(s: SceneState): void
  dismissChange(): void
  setForkOpen(open: boolean): void
  setFocusProcess(id: string | null): void
  startTour(): void
  goTourStep(n: number): void
  endTour(): void
  commitPrediction(id: string, choice: string): void
  setExcursion(id: string, value: string): void
}

function sceneOf(s: Store): SceneState {
  return {
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
}

function fmt(v: unknown): string {
  if (typeof v === 'boolean') return v ? 'on' : 'off'
  if (typeof v === 'object' && v !== null) return JSON.stringify(v)
  return String(v)
}

function labelOf(id: string): string {
  return REGISTRY.find((c) => c.id === id)?.label ?? id
}

function fromHash(): { scene: Partial<SceneState>; stage?: number } {
  if (typeof location === 'undefined') return { scene: {} }
  const out: { scene: Partial<SceneState>; stage?: number } = { scene: {} }
  const stage = location.hash.match(/#\/stage\/(\d)/)
  if (stage) out.stage = Number(stage[1])
  const packed = location.hash.match(/\/s\/([^/?#]+)/)
  if (packed) {
    const decoded = decodeState(decodeURIComponent(packed[1]))
    if (decoded) out.scene = decoded
  }
  return out
}

function seen(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(TOUR_KEY, '1')
  } catch {
    // a locked-down browser context still runs the scene; it just offers the tour again
  }
}

const arrival = fromHash()
const SESSION_BASELINE: SceneState = {
  ...BASELINE,
  ...arrival.scene,
  proxyRoutes: { ...BASELINE.proxyRoutes, ...(arrival.scene.proxyRoutes ?? {}) },
}

export const useStore = create<Store>((set) => ({
  ...SESSION_BASELINE,
  stage: arrival.stage ?? 0,
  popover: null,
  openDrawer: null,
  tourStep: null,
  seenTour: seen(),
  predictions: {},
  excursions: {},
  baseline: SESSION_BASELINE,
  history: [],
  lastChange: null,
  forkOpen: false,
  focusProcess: null,

  set: (k, v) =>
    set((s) => {
      const prev = sceneOf(s)
      const iv: Intervention = {
        target: String(k),
        operation: typeof v === 'boolean' ? 'toggle' : 'set',
        before: fmt(prev[k]),
        after: fmt(v),
        label: `${labelOf(String(k))}: ${fmt(prev[k])} → ${fmt(v)}`,
        patch: { [k]: v } as Partial<SceneState>,
      }
      return {
        [k]: v,
        history: [...s.history, iv],
        lastChange: { prev, next: { ...prev, [k]: v } },
      } as never
    }),

  toggleProxyPath: (path) =>
    set((s) => {
      const prev = sceneOf(s)
      const proxyRoutes = { ...prev.proxyRoutes, [path]: !prev.proxyRoutes[path] }
      const iv: Intervention = {
        target: 'proxyRoutes',
        operation: 'toggle',
        before: fmt(prev.proxyRoutes[path]),
        after: fmt(proxyRoutes[path]),
        label: `vite proxy '/${path}': ${prev.proxyRoutes[path] ? 'on → off' : 'off → on'}`,
        patch: { proxyRoutes },
      }
      return { proxyRoutes, history: [...s.history, iv], lastChange: { prev, next: { ...prev, proxyRoutes } } }
    }),

  setStage: (n) => set({ stage: n, popover: null }),
  setPlayhead: (n) => set({ requestLifecyclePlayhead: n }),
  toggleBreakpoint: (which) =>
    set((s) => ({ breakpointsArmed: { ...s.breakpointsArmed, [which]: !s.breakpointsArmed[which] } })),
  setSelectedDebugConfig: (id) => set({ selectedDebugConfig: id }),
  setSelectedVenv: (id) =>
    set((s) => {
      const prev = sceneOf(s)
      const iv: Intervention = {
        target: 'selectedVenv',
        operation: 'set',
        before: prev.selectedVenv,
        after: id,
        label: `install target venv: ${prev.selectedVenv} → ${id}`,
        patch: { selectedVenv: id },
      }
      return { selectedVenv: id, history: [...s.history, iv], lastChange: { prev, next: { ...prev, selectedVenv: id } } }
    }),

  openPopover: (id, kind, x, y) => set({ popover: { id, kind, x, y }, openDrawer: null }),
  closePopover: () => set({ popover: null }),
  openDrawerFn: (id) => set((s) => ({ openDrawer: s.openDrawer === id ? null : id, popover: null })),

  reset: () =>
    set((s) => ({
      ...s.baseline,
      proxyRoutes: { ...s.baseline.proxyRoutes },
      breakpointsArmed: { ...s.baseline.breakpointsArmed },
      history: [],
      lastChange: null,
      forkOpen: false,
      popover: null,
      openDrawer: null,
    })),

  applyScenario: (patch, label = 'apply scenario') =>
    set((s) => {
      const prev = sceneOf(s)
      const iv: Intervention = { target: Object.keys(patch).join(', '), operation: 'scenario', label, patch }
      const proxyRoutes = patch.proxyRoutes ? { ...prev.proxyRoutes, ...patch.proxyRoutes } : prev.proxyRoutes
      return {
        ...patch,
        proxyRoutes,
        history: [...s.history, iv],
        lastChange: { prev, next: { ...prev, ...patch, proxyRoutes } },
      } as never
    }),

  loadState: (next) =>
    set((s) => {
      const prev = sceneOf(s)
      const iv: Intervention = { target: 'all', operation: 'load', label: 'load an encoded state', patch: { ...next } }
      return { ...next, history: [...s.history, iv], lastChange: { prev, next } }
    }),

  dismissChange: () => set({ lastChange: null }),
  setForkOpen: (open) => set({ forkOpen: open, openDrawer: null }),
  setFocusProcess: (id) => set({ focusProcess: id }),

  startTour: () => set({ tourStep: 0, popover: null, openDrawer: null }),
  goTourStep: (n) => set({ tourStep: n }),
  endTour: () => {
    markSeen()
    set({ tourStep: null, seenTour: true })
  },

  commitPrediction: (id, choice) => set((s) => ({ predictions: { ...s.predictions, [id]: choice } })),
  setExcursion: (id, value) => set((s) => ({ excursions: { ...s.excursions, [id]: value } })),
}))
