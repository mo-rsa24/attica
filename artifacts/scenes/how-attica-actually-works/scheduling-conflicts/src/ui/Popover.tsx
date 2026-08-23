// Anchored to the exact element that was clicked, clamped to the viewport,
// closing back to where the reader was. Inspection never means leaving.

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function Popover({
  anchor,
  onClose,
  children,
}: {
  anchor: DOMRect
  onClose(): void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: -9999, top: -9999 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const box = el.getBoundingClientRect()
    const gap = 10
    // Beside the anchor when there is room, below it otherwise, then clamped so
    // the clicked element stays visible.
    let left = anchor.right + gap
    if (left + box.width > window.innerWidth - 12) left = anchor.left - box.width - gap
    if (left < 12) left = Math.min(anchor.left, window.innerWidth - box.width - 12)
    let top = anchor.top
    if (top + box.height > window.innerHeight - 12) top = window.innerHeight - box.height - 12
    if (top < 12) top = 12
    setPos({ left, top })
  }, [anchor])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', onKey)
    // Deferred so the click that opened it does not immediately close it.
    const t = setTimeout(() => window.addEventListener('mousedown', onDown), 0)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
      clearTimeout(t)
    }
  }, [onClose])

  return (
    <div className="pop" ref={ref} style={{ left: pos.left, top: pos.top }} role="dialog">
      <button className="x" onClick={onClose} aria-label="close">
        ×
      </button>
      {children}
    </div>
  )
}
