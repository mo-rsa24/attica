// The first-run tour. Spotlight plus a card, walking the six surfaces named
// in the spec. Generated from components.ts and engagement.ts; nothing here
// is authored per step beyond the six anchors themselves.
//
// It is a component that moves the scene: a step on another stage sets the
// stage, so the family's rule holds (nothing moves unless a component moved it).

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BACKEND_MODE_PREDICTION, LOCATIONS_PREDICTION, TOUR } from '../engagement'
import type { SceneState } from '../model'
import { useStore } from '../store'
import { Predict } from './Predict'

const CARD_W = 380

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(v, hi))
}

function place(rect: DOMRect | null, cardH: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (!rect) return { top: clamp(vh / 2 - cardH / 2, 16, vh - 16), left: vw / 2 - CARD_W / 2 }

  const gap = 20
  if (vh - rect.bottom - gap >= cardH + 16) return { top: rect.bottom + gap, left: clamp(rect.left, 16, vw - CARD_W - 16) }
  if (rect.top - gap >= cardH + 16) return { top: rect.top - gap - cardH, left: clamp(rect.left, 16, vw - CARD_W - 16) }

  const left = rect.left - CARD_W - gap >= 16 ? rect.left - CARD_W - gap : clamp(rect.right + gap, 16, vw - CARD_W - 16)
  return { top: clamp(rect.top, 16, Math.max(16, vh - cardH - 16)), left }
}

export function Tour({ state }: { state: SceneState }) {
  const s = useStore()
  const steps = TOUR
  const i = s.tourStep
  const step = i === null ? null : steps[i]
  const [rect, setRect] = useState<DOMRect | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [cardH, setCardH] = useState(240)

  const next = useCallback(() => {
    const at = useStore.getState().tourStep
    if (at === null) return
    if (at + 1 < steps.length) useStore.getState().goTourStep(at + 1)
    else useStore.getState().endTour()
  }, [steps.length])

  useEffect(() => {
    if (!step) return
    if (useStore.getState().stage !== step.stage) useStore.getState().setStage(step.stage)
  }, [step])

  useEffect(() => {
    if (!step) {
      setRect(null)
      return
    }
    const find = () => document.querySelector<HTMLElement>(`[data-tour="${step.id}"]`)
    const measure = () => {
      const el = find()
      setRect(el ? el.getBoundingClientRect() : null)
    }
    let frame = 0
    const onMove = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const settle = window.setTimeout(() => {
      const el = find()
      if (!el) {
        next()
        return
      }
      el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' })
      measure()
      window.setTimeout(measure, 260)
    }, 40)
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      clearTimeout(settle)
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [step, s.stage, next])

  useLayoutEffect(() => {
    const h = cardRef.current?.offsetHeight
    if (h && Math.abs(h - cardH) > 2) setCardH(h)
  }, [i, rect, cardH])

  useEffect(() => {
    if (i === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useStore.getState().endTour()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, next])

  if (i === null || !step) return null

  const pad = 8
  const spot = rect ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 } : null
  const card = place(rect, cardH)

  return (
    <div className="tour">
      {spot && <div className="tour-spot" style={spot} />}
      {!spot && <div className="tour-dim" />}
      <div className="tour-card" ref={cardRef} style={{ ...card, width: CARD_W }}>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        {step.tryThis && (
          <p className="tour-try">
            <span>try</span> {step.tryThis}
          </p>
        )}
        {step.real && <code className="tour-real">{step.real}</code>}
        {step.predictKind === 'backend-mode' && <Predict id="tour:backend-mode" prediction={BACKEND_MODE_PREDICTION} state={state} />}
        {step.predictKind === 'locations' && <Predict id="tour:locations" prediction={LOCATIONS_PREDICTION} state={state} />}
        <div className="tour-foot">
          <button onClick={() => s.endTour()}>skip</button>
          <span className="muted tiny">
            {i + 1} of {steps.length}
          </span>
          <span className="grow" />
          {i > 0 && <button onClick={() => s.goTourStep(i - 1)}>back</button>}
          <button className="primary" onClick={next}>
            {i + 1 === steps.length ? 'done' : 'next'}
          </button>
        </div>
      </div>
    </div>
  )
}
