// Zustand. The configuration, the schedule, where the reader is, and the record
// of what they did. Never a derived value.

import { create } from 'zustand'
import type { Intervention } from './lab'
import { decodeState, encodeState, initialConfig, type Config, type SchedEvent } from './model'

export type DrawerId = 'probes' | 'history' | 'compare' | null

function fromHash(): { config: Config; events: SchedEvent[]; stage: number } {
  const h = window.location.hash.replace(/^#\/?/, '')
  const stageMatch = h.match(/stage\/(\d)/)
  const q = h.includes('?') ? h.slice(h.indexOf('?') + 1) : ''
  const s = new URLSearchParams(q).get('s')
  const decoded = s ? decodeState(decodeURIComponent(s)) : null
  return {
    config: decoded?.config ?? { ...initialConfig },
    events: decoded?.events ?? [],
    stage: stageMatch ? Number(stageMatch[1]) : 0,
  }
}

const boot = fromHash()

interface Store {
  config: Config
  events: SchedEvent[]
  stage: number
  upTo: number | null
  focus: string | null
  selected: { kind: 'node' | 'edge' | 'part'; id: string; anchor: DOMRect } | null
  drawer: DrawerId
  baseConfig: Config
  baseEvents: SchedEvent[]
  history: Intervention[]
  tourStep: number | null

  setConfig(patch: Partial<Config>, label: string): void
  fire(e: SchedEvent, label: string): void
  loadScenario(id: string, events: SchedEvent[], config: Partial<Config> | undefined, label: string): void
  loadEncoded(config: Config, events: SchedEvent[], label: string): void
  setStage(n: number): void
  setUpTo(n: number | null): void
  setFocus(id: string | null): void
  select(sel: Store['selected']): void
  setDrawer(d: DrawerId): void
  reset(): void
  startTour(): void
  setTourStep(n: number | null): void
}

export const useStore = create<Store>((set, get) => ({
  config: boot.config,
  events: boot.events,
  stage: boot.stage,
  upTo: null,
  focus: null,
  selected: null,
  drawer: null,
  baseConfig: boot.config,
  baseEvents: boot.events,
  history: [],
  tourStep: null,

  setConfig(patch, label) {
    set((st) => ({
      config: { ...st.config, ...patch },
      history: [
        ...st.history,
        {
          target: Object.keys(patch)[0],
          operation: 'set',
          before: String(st.config[Object.keys(patch)[0] as keyof Config]),
          after: String(Object.values(patch)[0]),
          label,
          patch: { config: patch },
        },
      ],
    }))
    syncHash(get())
  },

  fire(e, label) {
    set((st) => ({
      events: [...st.events, e],
      upTo: null,
      history: [...st.history, { target: e.t, operation: 'event', label, patch: { append: e } }],
    }))
    syncHash(get())
  },

  loadScenario(id, events, config, label) {
    set((st) => ({
      events,
      config: { ...st.config, ...(config || {}) },
      upTo: null,
      history: [...st.history, { target: id, operation: 'scenario', label, patch: { events, config: config || {} } }],
    }))
    syncHash(get())
  },

  loadEncoded(config, events, label) {
    set((st) => ({
      config,
      events,
      upTo: null,
      history: [...st.history, { target: 'link', operation: 'load', label, patch: { config, events } }],
    }))
    syncHash(get())
  },

  setStage(n) {
    set({ stage: n, selected: null })
    syncHash(get())
  },

  setUpTo(n) {
    set({ upTo: n })
  },

  setFocus(id) {
    set({ focus: id, selected: null })
  },

  select(sel) {
    set({ selected: sel })
  },

  setDrawer(d) {
    set((st) => ({ drawer: st.drawer === d ? null : d }))
  },

  reset() {
    set((st) => ({
      config: { ...st.baseConfig },
      events: [...st.baseEvents],
      history: [],
      upTo: null,
      selected: null,
    }))
    syncHash(get())
  },

  startTour() {
    set({ tourStep: 0 })
  },

  setTourStep(n) {
    set({ tourStep: n })
  },
}))

function syncHash(st: Store) {
  const s = encodeURIComponent(encodeState(st.config, st.events))
  window.history.replaceState(null, '', `#/stage/${st.stage}?s=${s}`)
}

/** A pasted deep link into an open tab is a same-document hash change, so
 *  nothing reloads without this. */
export function attachHashSync() {
  window.addEventListener('hashchange', () => {
    const next = fromHash()
    const cur = useStore.getState()
    if (next.stage === cur.stage && encodeState(next.config, next.events) === encodeState(cur.config, cur.events)) return
    useStore.setState({
      stage: next.stage,
      config: next.config,
      events: next.events,
      baseConfig: next.config,
      baseEvents: next.events,
      history: [],
      upTo: null,
      selected: null,
    })
  })
}
