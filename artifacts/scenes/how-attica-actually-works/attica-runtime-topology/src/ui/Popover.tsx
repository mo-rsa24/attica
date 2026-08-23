// The workspace contract's popover primitive: anchored to the exact point
// that was clicked, closes on outside click or Escape, clamped to viewport.

import { useEffect, useRef, type ReactNode } from 'react'

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(v, hi))
}

export function Popover({
  x,
  y,
  onClose,
  width = 320,
  children,
}: {
  x: number
  y: number
  onClose: () => void
  width?: number
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const left = clamp(x + 12, 8, window.innerWidth - width - 8)
  const top = clamp(y - 20, 8, window.innerHeight - 120)

  return (
    <div className="popover" ref={ref} style={{ left, top, width }}>
      {children}
      <button className="popover-close" onClick={onClose} aria-label="close">
        ×
      </button>
    </div>
  )
}
