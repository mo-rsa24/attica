// Stage 2: the load-bearing machinery, named exactly. The longest stage, and the
// one that decides whether the scene was worth building.

import { STEP_SEQUENCE, FIELDS, getStepProgress, run } from '../model'
import { useStore } from '../store'
import { CodeBlock } from '../ui/CodeBlock'

export function Stage2Mechanism() {
  const { config, events } = useStore()
  const o = run(config, events)

  return (
    <>
      <div className="card">
        <h2>Seven states, and one file that is not one of them</h2>
        <p className="lede">
          The machine is an array. Everything the wizard knows about order, progress and what comes
          next is an index into it, and the array is eight entries long with step 2 absent.
        </p>
        <CodeBlock snippet="sequence" hot={13} />
        <div className="seq">
          {STEP_SEQUENCE.map((s, i) => (
            <span key={s} className="seqitem">
              <em>{i}</em> {s} <span className="pct">{getStepProgress(s)}%</span>
            </span>
          ))}
          <span className="seqitem ghost">
            <em>-1</em> step2 <span className="pct">0%</span>
          </span>
        </div>
        <p style={{ marginBottom: 0 }}>
          That last entry is not a typo in the scene. <code>indexOf</code> returns −1 for step 2, so
          the progress bar reads 0% and, more importantly, Next becomes a fixed point.
        </p>
        <CodeBlock snippet="nextStep" hot={215} caption="index === -1 returns the step you gave it, so Next from an unknown step goes nowhere." />
      </div>

      <div className="card">
        <h3>Three places a value can be, and only one of them is durable</h3>
        <p>
          Watch the tier grid above while you type and press Next. A field appears in the form the
          moment you touch it, in the reducer a keystroke later, and on the server only when a save
          runs. Between those moments the three disagree, and every failure in stage 3 is a way of
          making that disagreement permanent.
        </p>
        <dl className="kv">
          <dt>form</dt>
          <dd>
            the step component's own useState. Wiped by any navigation, and never read by anything
            else.
          </dd>
          <dt>reducer</dt>
          <dd>
            mirrored into localStorage on every single state change, under one key with no draft id
            in it.
          </dd>
          <dt>server</dt>
          <dd>
            EventDraft.data.steps. The only tier that survives a different browser, and the only one
            publish can see.
          </dd>
        </dl>
        <CodeBlock snippet="persist" hot={192} caption="Every dispatch writes the whole store to one fixed key." />
      </div>

      <div className="card">
        <h3>The merge rule: local wins</h3>
        <p>
          When the layout loads a draft, it does not replace what the reducer holds. It merges the
          server's steps <em>under</em> the cached ones, so anything in the browser takes precedence
          over anything from the database.
        </p>
        <CodeBlock snippet="merge" hot={317} />
        <p style={{ marginBottom: 0 }}>
          That ordering is what makes an interrupted wizard feel seamless: your unsaved edits are
          still there when you come back. It is also, with one un-scoped storage key, what lets a
          different draft's answers arrive in this one. Same line, both consequences.
        </p>
      </div>

      <div className="card">
        <h3>A step's answers do not always live in its own bucket</h3>
        <p>
          Step 3 collects the schedule and writes it into <code>steps.step1</code>. Not a mistake:
          the publish projection reads <code>start_date</code> from step 1, so this is the two halves
          agreeing. It does mean the step key in <code>data</code> is not a reliable guide to which
          screen the organizer was on.
        </p>
        <CodeBlock snippet="step3write" hot={182} />
        <div className="maps">
          {FIELDS.map((f) => (
            <div className="maprow" key={f.id}>
              <span className="m1">{f.label}</span>
              <span className="arr">collected on</span>
              <span className="m2">{f.collectedOn}</span>
              <span className="arr">stored under</span>
              <span className={`m2 ${f.storedUnder !== f.collectedOn ? 'odd' : ''}`}>steps.{f.storedUnder}</span>
              <span className="arr">becomes</span>
              <span className="m3">{f.column}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Publishing is a projection, not a validation</h3>
        <p>
          The draft is a JSON bag and the Event is a table with columns. Publish is the function that
          turns one into the other, and every line of it is a fallback chain: try this key, then that
          key, then a literal.
        </p>
        <CodeBlock snippet="projection" hot={386} />
        <CodeBlock snippet="eventDate" hot={355} caption="No date anywhere in the draft resolves to today, silently." />
        <p style={{ marginBottom: 0 }}>
          Nothing in that function can fail. There is no branch that returns an error, and there is
          no validator upstream of it.{' '}
          {o.published ? (
            <span className="pill warn">
              your current run published with {o.defaultsUsed} column(s) defaulted
            </span>
          ) : (
            <>Press Publish on an empty draft in stage 3 and watch it succeed.</>
          )}
        </p>
      </div>

      <div className="card">
        <h3>And publishing twice does not make two events</h3>
        <p>
          The first publish writes the new Event's id back into the draft's own JSON. Every later
          publish reads it first and updates that row instead of inserting another.
        </p>
        <CodeBlock snippet="publish" hot={522} caption="The draft is kept after publishing, and stays editable." />
      </div>
    </>
  )
}
