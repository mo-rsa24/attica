// Renders a real error string or transcript line. Never builds one from a
// boolean: if the string is not on the model's outcome, it does not appear.

export function ErrorLine({ text, ok }: { text: string | null; ok: boolean }) {
  if (!text) return <div className="term-ok">no error: this path is currently reachable.</div>
  return (
    <pre className={`terminal ${ok ? '' : 'failed'}`}>
      <div className="t-err">{text}</div>
    </pre>
  )
}
