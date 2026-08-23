// The smallest version that genuinely exhibits the concept: one room, one POST,
// one row, one group_send, one socket. Whole artifacts, not abstractions of them,
// and reproducible by hand in a few minutes.

import { CodeBlock } from '../ui/CodeBlock'

export function Stage1Minimal() {
  return (
    <>
      <div className="card">
        <h2>The whole path is about twenty lines</h2>
        <p className="lede">
          Strip Attica down to one message going from one browser to another and almost nothing is
          left. Four files, and the interesting part of each is short enough to read whole.
        </p>
      </div>

      <div className="card">
        <h3>1. The server declares two protocols</h3>
        <p>
          One process, one port, two stacks. <code>ProtocolTypeRouter</code> reads the ASGI scope and
          picks. The HTTP side is ordinary Django and knows nothing about sockets; the WebSocket side
          never touches a database table directly.
        </p>
        <CodeBlock snippet="routing" hot={10} caption="The http branch is the entire REST API, in one line." />
      </div>

      <div className="card">
        <h3>2. The client opens a socket, and addresses it to itself</h3>
        <p>
          Note <code>window.location.host</code>: the browser is talking to :5173, not :8000. It only
          works because Vite forwards it, which is why the proxy is a component in this scene and not
          a footnote.
        </p>
        <CodeBlock snippet="socket" hot={123} />
        <p style={{ marginTop: 10 }}>
          The dependency on <code>tokens</code> is doing quiet work: when AuthProvider refreshes the
          access token, this memo produces a new URL, the effect tears the old socket down, and a
          fresh one connects with the new credential.
        </p>
      </div>

      <div className="card">
        <h3>3. The write, and only then the broadcast</h3>
        <p>
          Read the order rather than the content. The row is saved, stamped, and serialized. The
          broadcast is the second-to-last line in the method, after everything durable has already
          happened.
        </p>
        <CodeBlock snippet="view" hot={139} caption="Line 134 writes. Line 139 tells people. Never the other way round." />
      </div>

      <div className="card">
        <h3>4. The consumer holds a socket and forwards what it is handed</h3>
        <p>
          Two lines. It does not query, it does not decide, it does not persist. Whatever arrives on
          the channel goes out on the wire.
        </p>
        <CodeBlock snippet="dispatch" hot={138} />
        <p style={{ marginTop: 10, marginBottom: 0 }}>
          That is the minimal version and it works. Everything from here is what happens when it is
          not a toy: several workers, a dead Redis, an expired token, two people typing at once.
        </p>
      </div>

      <div className="card">
        <h3>Check you have it</h3>
        <p style={{ marginBottom: 0 }}>
          Without scrolling back: which of those four pieces would you delete to make the system lose
          a message? The answer is only the third one, and only the first half of it. Everything else
          is delivery.
        </p>
      </div>
    </>
  )
}
