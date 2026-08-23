// A request's hop list, drawn as a lane of connected boxes: the visual used
// by both the stage 0 race and the counterfactual fork, so the two
// comparisons are commensurable (workspace.md: comparisons inherit the
// baseline layout).

import { motion } from 'motion/react'
import type { RequestTrace } from '../model'

export function Lane({ title, subtitle, trace }: { title: string; subtitle: string; trace: RequestTrace }) {
  return (
    <div className={`lane ${trace.ok ? '' : 'lane-failed'}`}>
      <div className="lane-head">
        <div>
          <strong>{title}</strong>
          <div className="muted">{subtitle}</div>
        </div>
        <div className="lane-total">{trace.ok ? 'reachable' : 'fails'}</div>
      </div>

      <div className="lane-hops">
        {trace.hops.map((h, i) => (
          <motion.div
            key={h.process + i}
            className={`hop ${h.ok ? '' : 'hop-failed'}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
          >
            <span className="hop-proc">{h.process}</span>
            <span className="hop-label muted tiny">{h.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="because">{trace.because}</div>
      {!trace.ok && trace.errorString && <code className="reach-err">{trace.errorString}</code>}
    </div>
  )
}
