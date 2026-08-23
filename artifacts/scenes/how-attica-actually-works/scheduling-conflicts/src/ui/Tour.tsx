// The first-run tour. One absolutely positioned element with a large box-shadow
// spread as the dim: no mask, no SVG, no library.
//
// The tour drives the shared state, so a step anchored to another level sets the
// level first. Nothing moves in this scene without a component moving it, and
// the tour is registered as one of those components.

import { useEffect, useLayoutEffect, useState } from 'react'
import { TOUR } from '../engagement'
import { useStore } from '../store'

const KEY = 'scheduling-conflicts:toured'

export function Tour() {
  const { tourStep, setTourStep, setStage } = useStore()
  const [rect, setRect] = useState<DOMRect | null>(null)

  // First visit only.
  useEffect(() => {
    if (!localStorage.getItem(KEY)) useStore.getState().startTour()
  }, [])

  const step = tourStep == null ? null : TOUR[tourStep]

  // Put the scene where the step expects it, before measuring the anchor.
  useEffect(() => {
    if (!step?.goTo) return
    if (step.goTo.stage != null) setStage(step.goTo.stage)
  }, [tourStep, step, setStage])

  useLayoutEffect(() => {
    if (!step) return
    let raf = 0
    const measure = () => {
      const el = document.querySelector(`[data-tour="${step.anchor}"]`)
      if (!el) {
        // A step whose anchor is not in the DOM is skipped rather than pointing
        // at nothing.
        setTourStep(tourStep! + 1 < TOUR.length ? tourStep! + 1 : null)
        return
      }
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      raf = requestAnimationFrame(() => setRect(el.getBoundingClientRect()))
    }
    const t = setTimeout(measure, 60)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(t)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [tourStep, step, setTourStep])

  const end = () => {
    localStorage.setItem(KEY, '1')
    setTourStep(null)
    setRect(null)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tourStep == null) return
      if (e.key === 'Escape') end()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft' && tourStep > 0) setTourStep(tourStep - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const next = () => {
    if (tourStep == null) return
    if (tourStep + 1 >= TOUR.length) end()
    else setTourStep(tourStep + 1)
  }

  if (!step || !rect) return null

  const pad = 7
  const below = rect.bottom + 14 + 210 < window.innerHeight
  const cardTop = below ? rect.bottom + 14 : Math.max(12, rect.top - 224)
  const cardLeft = Math.min(Math.max(12, rect.left), window.innerWidth - 372)

  return (
    <>
      <div
        className="spot"
        style={{
          left: rect.left - pad,
          top: rect.top - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
      />
      <div className="tourcard" style={{ left: cardLeft, top: cardTop }}>
        <h3>{step.heading}</h3>
        <p>{step.body}</p>
        {step.tryIt && <p className="try">Try: {step.tryIt}</p>}
        {step.real && (
          <div className="term" style={{ fontSize: 11.5 }}>
            <span className="err">{step.real}</span>
          </div>
        )}
        <div className="foot">
          <span className="n">
            {tourStep! + 1}/{TOUR.length}
          </span>
          <span className="spacer" />
          <button onClick={end}>skip</button>
          <button className="go" onClick={next}>
            {tourStep! + 1 >= TOUR.length ? 'done' : 'next'}
          </button>
        </div>
      </div>
    </>
  )
}
