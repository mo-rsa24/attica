// Zustand. Holds the manipulable state, where the reader is, and the record of
// what they did. Never a derived value: anything derived comes from run() on
// each render.

import { create } from 'zustand'
import { BASELINE, replayState, type Intervention } from './lab'
import { decodeState, encodeState, initialState, type SceneState } from './model'

export type DrawerId = 'probes' | 'history' | 'compare' | null

function fromHash(): { state: SceneState; stage: number; focus: string | null } {
  const h = window.location.hash.replace(/^#\/?/, '')
  const parts = new URLSearchParams(h.includes('?') ? h.slice(h.indexOf('?') + 1) : '')
  const stageMatch = h.match(/stage\/(\d)/)
  const s = parts.get('s')
  const decoded = s ? decodeState(s) : null
  const focus = parts.get('at')
  return {
    state: decoded ?? { ...initialState },
    stage: stageMatch ? Number(stageMatch[1]) : 0,
    focus: focus && focus !== 'root' ? focus : null,
  }
}

const boot = fromHash()

interface Store {
  // --- canonical state ---
  state: SceneState

  // --- where the reader is ---
  stage: number
  /** The atlas node currently opened. null is the ECOSYSTEM board. */
  focus: string | null
  /** The lifecycle slot the timeline is parked on, or null for "all of it". */
  slotIndex: number | null

  // --- the workspace ---
  /** The node or edge whose popover is open, if any. */
  selected: { kind: 'node' | 'edge'; id: string; anchor: DOMRect } | null
  drawer: DrawerId
  /** Hovered semantic object id, for object permanence across views. */
  focusSid: string | null

  // --- the record ---
  baseline: SceneState
  history: Intervention[]

  // --- engagement ---
  tourStep: number | null
  prediction: { slot: string; picked: string } | null

  // --- actions ---
  apply(iv: Intervention): void
  setStage(n: number): void
  setFocus(id: string | null): void
  setSlot(i: number | null): void
  select(sel: Store['selected']): void
  setDrawer(d: DrawerId): void
  setSid(id: string | null): void
  reset(): void
  startTour(): void
  setTourStep(n: number | null): void
  predict(slot: string, picked: string): void
  clearPrediction(): void
}

export const useStore = create<Store>((set, get) => ({
  state: boot.state,
  stage: boot.stage,
  focus: boot.focus,
  slotIndex: null,
  selected: null,
  drawer: null,
  focusSid: null,
  baseline: boot.state,
  history: [],
  tourStep: null,
  prediction: null,

  apply(iv) {
    set((st) => {
      const next = { ...st.state, ...iv.patch }
      return { state: next, history: [...st.history, iv] }
    })
    syncHash(get())
  },

  setStage(n) {
    set({ stage: n, slotIndex: null, selected: null })
    syncHash(get())
  },

  setFocus(id) {
    set({ focus: id, selected: null })
    syncHash(get())
  },

  setSlot(i) {
    set({ slotIndex: i })
  },

  select(sel) {
    set({ selected: sel })
  },

  setDrawer(d) {
    set((st) => ({ drawer: st.drawer === d ? null : d }))
  },

  setSid(id) {
    set({ focusSid: id })
  },

  reset() {
    set((st) => ({ state: { ...st.baseline }, history: [], selected: null, slotIndex: null }))
    syncHash(get())
  },

  startTour() {
    set({ tourStep: 0 })
  },

  setTourStep(n) {
    set({ tourStep: n })
  },

  predict(slot, picked) {
    set({ prediction: { slot, picked } })
  },

  clearPrediction() {
    set({ prediction: null })
  },
}))

function syncHash(st: Store) {
  const at = st.focus ?? 'root'
  window.history.replaceState(
    null,
    '',
    `#/stage/${st.stage}?at=${at}&s=${encodeState(st.state)}`,
  )
}

/** A pasted deep link into an already-open tab is a same-document hash change,
 *  so nothing reloads and the store would keep its old stage. Listen for it, so
 *  every stage really is directly linkable rather than only on a cold load.
 *  syncHash uses replaceState, which does not fire hashchange, so this cannot loop. */
export function attachHashSync() {
  window.addEventListener('hashchange', () => {
    const next = fromHash()
    const cur = useStore.getState()
    if (
      next.stage === cur.stage &&
      next.focus === cur.focus &&
      encodeState(next.state) === encodeState(cur.state)
    )
      return
    useStore.setState({
      stage: next.stage,
      focus: next.focus,
      state: next.state,
      baseline: next.state,
      history: [],
      selected: null,
      slotIndex: null,
    })
  })
}

/** Replay must reproduce the current state exactly. The experiment drawer runs
 *  this live rather than asserting it in a comment. */
export function replayMatches(st: { baseline: SceneState; state: SceneState; history: Intervention[] }) {
  return encodeState(replayState(st.baseline, st.history)) === encodeState(st.state)
}

export { BASELINE }
