// The event log is the timeline. All 14 slots are always drawn, so killing Redis
// visibly greys four of them out rather than shortening the strip: two
// configurations stay comparable because the layout never moves.

import { SLOT_CODE } from '../code'
import type { Outcome } from '../model'
import { useStore } from '../store'
import { CodeBlock } from './CodeBlock'

export function Timeline({ outcome }: { outcome: Outcome }) {
  const { slotIndex, setSlot } = useStore()
  const sel = slotIndex == null ? null : outcome.slots[slotIndex]
  const total = outcome.slots.filter((s) => s.status === 'ran').reduce((m, s) => Math.max(m, s.atMs ?? 0), 0)

  return (
    <div className="timeline" data-tour="timeline">
      <div className="head">
        <h3>one message, all the way through</h3>
        <span className="note">
          {outcome.slots.filter((s) => s.status === 'ran').length} of {outcome.slots.length} steps ran
        </span>
        <span className="spacer" />
        <span className="note illus">
          {total} ms to the last push step, illustrative
        </span>
      </div>

      {/* Fourteen labels at once is a wall of text, so the strip carries the
          step number and the name lands in the detail pane below. Attention
          budget: the reader should never have to visually debug the interface. */}
      <div className="slots">
        {outcome.slots.map((s, i) => (
          <button
            key={s.id}
            className={`slot ${s.status} ${slotIndex === i ? 'sel' : ''}`}
            onClick={() => setSlot(slotIndex === i ? null : i)}
            title={`${i + 1}. ${s.label}: ${s.status}`}
          >
            <span className="bar" />
            <span className="lab">{String(i + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      {sel ? (
        <div className="slotdetail">
          <div className="who">
            {sel.actor} · {sel.status}
            {sel.atMs != null ? ` · at ${sel.atMs} ms` : ''}
          </div>
          <div className="lab">{sel.label}</div>
          <div className="det">{sel.detail}</div>
          <div className="src">{sel.source}</div>
          {SLOT_CODE[sel.id] && (
            <CodeBlock snippet={SLOT_CODE[sel.id]!.snippet} hot={SLOT_CODE[sel.id]!.line} />
          )}
        </div>
      ) : (
        <div className="slotdetail">
          <div className="det" style={{ color: 'var(--ink-faint)' }}>
            Click any step to see what it did, and the line of Attica that did it. The four that
            matter most are <strong style={{ color: 'var(--ink-dim)' }}>the row is written</strong> and{' '}
            <strong style={{ color: 'var(--ink-dim)' }}>send to the room group</strong>: the first
            always comes before the second, which is the whole argument.
          </div>
        </div>
      )}
    </div>
  )
}
