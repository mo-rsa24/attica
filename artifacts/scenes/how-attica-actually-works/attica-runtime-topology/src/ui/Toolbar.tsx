// The workspace contract's toolbar: a slim, always-visible row summoning the
// drawers. Four buttons, under the five-button ceiling.

import { useStore } from '../store'

export function Toolbar() {
  const s = useStore()
  const item = (id: 'debug-configs' | 'timeline' | 'history', label: string) => (
    <button data-tour={`toolbar:${id}`} className={s.openDrawer === id ? 'on' : ''} onClick={() => s.openDrawerFn(id)}>
      {label}
    </button>
  )
  return (
    <div className="toolbar" data-tour="toolbar">
      {item('debug-configs', 'debug configs')}
      {item('timeline', 'request timeline')}
      {item('history', 'history')}
      <button data-tour="toolbar:compare" className={s.forkOpen ? 'on' : ''} onClick={() => s.setForkOpen(!s.forkOpen)}>
        compare
      </button>
    </div>
  )
}
