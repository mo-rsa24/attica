// First visit only, skippable, re-runnable from the toolbar, reduced-motion aware.
// Generated from the surfaces the scene already declares.

import { useEffect, useState } from 'react'
import { TOUR } from '../engagement'
import { useScene } from '../store'

const SEEN = 'attica-journey-tour-seen'

export function Tour() {
  const { tour, tourNext, endTour, startTour } = useScene()
  const [box, setBox] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (localStorage.getItem(SEEN) !== '1') startTour()
  }, [startTour])

  useEffect(() => {
    if (tour === null) return
    if (tour >= TOUR.length) {
      localStorage.setItem(SEEN, '1')
      endTour()
      return
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${TOUR[tour].anchor}"]`)
    if (!el) {
      setBox(null)
      return
    }
    el.classList.add('spot')
    setBox(el.getBoundingClientRect())
    return () => el.classList.remove('spot')
  }, [tour, endTour])

  if (tour === null || tour >= TOUR.length) return null
  const stop = TOUR[tour]

  const top = box ? Math.min(box.bottom + 12, window.innerHeight - 190) : window.innerHeight / 2 - 90
  const left = box ? Math.max(14, Math.min(box.left, window.innerWidth - 350)) : window.innerWidth / 2 - 165

  return (
    <div className="tourcard" style={{ top, left }}>
      <h3>{stop.title}</h3>
      <p>{stop.body}</p>
      <div className="row">
        <button className="ghost" onClick={() => { localStorage.setItem(SEEN, '1'); endTour() }}>
          skip
        </button>
        <button className="run-btn" onClick={tourNext}>
          {tour === TOUR.length - 1 ? 'start' : 'next'}
        </button>
        <span className="n">
          {tour + 1} / {TOUR.length}
        </span>
      </div>
    </div>
  )
}
