// The workspace contract's drawer primitive: slides in from the edge,
// overlays the anchored surface rather than pushing it down, closes back to
// exactly where the learner was.

import type { ReactNode } from 'react'

export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <strong>{title}</strong>
          <button onClick={onClose}>close</button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  )
}
