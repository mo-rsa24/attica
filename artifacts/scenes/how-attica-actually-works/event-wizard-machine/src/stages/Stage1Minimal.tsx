// Stage 1: the smallest thing that genuinely exhibits the concept. Whole
// artifacts, not abstractions of them.

import { CodeBlock } from '../ui/CodeBlock'

export function Stage1Minimal() {
  return (
    <>
      <div className="card">
        <h2>Four calls make a wizard resumable</h2>
        <p className="lede">
          Not eight screens, not a state library. One row created up front, one PATCH per step, one
          field saying where you are, and one lookup on the way back in. Everything else in the
          wizard is form design.
        </p>
      </div>

      <div className="card">
        <h3>1. The row exists before the first question</h3>
        <p>
          The draft is created when the organizer presses Start, not when they first save something.
          That is what gives every later step an id to PATCH against, and it is why an abandoned
          wizard leaves a row behind rather than nothing.
        </p>
        <CodeBlock snippet="create" hot={59} caption="An empty steps map and a current_step. That is the entire starting state." />
      </div>

      <div className="card">
        <h3>2. The row is three columns doing the work</h3>
        <p>
          <code>status</code> is a real enum. <code>current_step</code> is a plain string. And{' '}
          <code>data</code> is a JSON field with no schema at all: whatever the client sends is what
          the draft holds.
        </p>
        <CodeBlock snippet="model" hot={114} caption="No choices on current_step, and no validators anywhere on data." />
        <p style={{ marginBottom: 0 }}>
          Both of those are deliberate and both have consequences. A schemaless <code>data</code>
          means a new step needs no migration. It also means nothing catches a typo in a step key
          until you notice a field missing from a published event.
        </p>
      </div>

      <div className="card">
        <h3>3. Every Next is a PATCH carrying everything</h3>
        <p>
          Not just this step: the whole accumulated steps map, every time. That is why pressing Next
          on step 7 also re-sends what you typed on step 1, and why one successful save late in the
          wizard can rescue several earlier ones.
        </p>
        <CodeBlock snippet="saveStep" hot={418} caption="current_step moves in the same request that carries the data." />
      </div>

      <div className="card">
        <h3>4. Coming back is one lookup</h3>
        <p>
          The layout loads the draft, then asks a single question: does the URL already name a step?
          If it does, stay there. If it does not, send them to whatever <code>current_step</code>{' '}
          says.
        </p>
        <CodeBlock snippet="layout" hot={88} />
        <p style={{ marginBottom: 0 }}>
          That is the whole resume mechanism. It is eight lines, and everything the wizard promises
          about surviving a closed tab rests on them.
        </p>
      </div>

      <div className="card">
        <h3>Check you have it</h3>
        <p style={{ marginBottom: 0 }}>
          Without scrolling back: if an organizer fills step 1 and closes the tab before pressing
          Next, what is in the database? A row, with <code>current_step</code> of <code>step1</code>{' '}
          and an empty <code>data.steps</code>. The row exists because Start created it. The answers
          are missing because Next is what sends them.
        </p>
      </div>
    </>
  )
}
