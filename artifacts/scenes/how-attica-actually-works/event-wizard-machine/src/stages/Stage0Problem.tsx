// Stage 0: the problem, run as the comparison. No mechanism yet, and saying so
// out loud is better than half-explaining it.

import { Lanes } from '../ui/Lanes'

export function Stage0Problem() {
  return (
    <>
      <div className="card">
        <h2>An organizer starts an event, then life happens</h2>
        <p className="lede">
          They fill in a screen, and before they finish the wizard the tab closes. A phone call, a
          flat battery, a Monday. When they come back, what is still there?
        </p>
        <p>
          The answer depends entirely on which screen they were on, and the difference is not
          cosmetic. Below is the same answer given on two different screens of the same wizard.
        </p>
        <Lanes />
      </div>

      <div className="card">
        <h3>Why this is the argument and not a bug report</h3>
        <p>
          Every multi-step form has to decide where a half-finished answer lives. Keep it in the
          component and the code is simpler, the form is faster, and you validate the whole thing
          once at the end. Push it to the server on every step and you pay a request per screen and
          you can never validate the whole thing, because there is no moment when you have it all.
        </p>
        <p style={{ marginBottom: 0 }}>
          Attica made that choice one way, and then had to make its publish step lenient enough to
          cope. That trade is what the rest of this scene is about: how the machine works, and what
          it costs.
        </p>
      </div>

      <div className="card">
        <h3>What is coming</h3>
        <dl className="kv">
          <dt>stage 1</dt>
          <dd>the four calls that make a wizard resumable, whole and short enough to read.</dd>
          <dt>stage 2</dt>
          <dd>
            the machine itself: seven states, three places a value can live, and the merge rule that
            decides which one wins.
          </dd>
          <dt>stage 3</dt>
          <dd>six ways it goes wrong, each one reachable from the controls.</dd>
          <dt>stage 4</dt>
          <dd>build it yourself, starting from the failure that makes each piece necessary.</dd>
        </dl>
        <p style={{ marginBottom: 0, color: 'var(--ink-faint)', fontSize: 13 }}>
          How the left lane actually gets that answer to the server is stage 2. Until then it is
          allowed to be a black box.
        </p>
      </div>
    </>
  )
}
