// Slides over the workspace rather than pushing it down, so the map stays put
// and closing returns to exactly the same view. The drawer supplies the header
// and the close button; panels inside it never draw their own.

import { useEffect, type ReactNode } from 'react'

export function Drawer({
  title,
  onClose,
  children,
}: {
  title: string
  onClose(): void
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={title}>
        <div className="dhead">
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="close">
            ×
          </button>
        </div>
        <div className="dbody">{children}</div>
      </aside>
    </>
  )
}
