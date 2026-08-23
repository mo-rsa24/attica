// Three drawers, no more. Everything that instruments, records or compares is
// behind one of these; nothing about the map moves when one opens.

import { useStore } from '../store'

export function Toolbar() {
  const { drawer, setDrawer, history } = useStore()
  return (
    <div className="toolbar" data-tour="toolbar">
      <button aria-pressed={drawer === 'probes'} onClick={() => setDrawer('probes')}>
        probes
      </button>
      <button aria-pressed={drawer === 'history'} onClick={() => setDrawer('history')}>
        history{history.length > 0 && <span className="dot"> ·{history.length}</span>}
      </button>
      <button aria-pressed={drawer === 'compare'} onClick={() => setDrawer('compare')}>
        compare
      </button>
    </div>
  )
}
