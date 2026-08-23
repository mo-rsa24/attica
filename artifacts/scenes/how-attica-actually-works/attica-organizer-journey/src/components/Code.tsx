// Code is behavior, not static text: the responsible line is highlighted and the
// gutter carries the real line numbers from the repo.

import { CODE } from '../model/code'

const PY_KW = /\b(class|def|return|if|elif|else|for|in|not|and|or|None|True|False|import|from|with|as|try|except|raise|lambda|pass|yield)\b/g
const JS_KW = /\b(const|let|var|function|return|if|else|for|of|in|await|async|new|try|catch|finally|throw|export|default|import|from|null|undefined|true|false)\b/g

const HOLD_OPEN = '\u0091'
const HOLD_CLOSE = '\u0092'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Deterministic, dependency-free. Enough to read Python and JSX; no grammar downloads. */
function highlight(line: string, lang: 'py' | 'jsx' | 'json' | 'text'): string {
  if (lang === 'text') return esc(line)

  // Comment tail first, so keywords inside a comment are left alone.
  const commentAt = lang === 'py' ? line.indexOf('#') : line.indexOf('//')
  const head = commentAt >= 0 ? line.slice(0, commentAt) : line
  const tail = commentAt >= 0 ? `<span class="tk-com">${esc(line.slice(commentAt))}</span>` : ''

  // Lift string literals out before touching anything else, then put them back,
  // so a keyword inside a string is not coloured as a keyword.
  const held: string[] = []
  const stripped = head.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, (m) => {
    held.push(`<span class="tk-str">${esc(m)}</span>`)
    return `${HOLD_OPEN}${held.length - 1}${HOLD_CLOSE}`
  })

  let out = esc(stripped)
  out = out.replace(lang === 'py' ? PY_KW : JS_KW, '<span class="tk-kw">$1</span>')
  out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tk-num">$1</span>')
  out = out.replace(/\b([A-Za-z_][\w.]*)(?=\()/g, '<span class="tk-fn">$1</span>')
  out = out.replace(
    new RegExp(`${HOLD_OPEN}(?:<span class="tk-num">)?(\\d+)(?:</span>)?${HOLD_CLOSE}`, 'g'),
    (_m, i: string) => held[Number(i)],
  )

  return out + tail
}

export function Code({ id, hit }: { id: string; hit?: number }) {
  const ex = CODE[id]
  if (!ex) return <div className="note dim">no excerpt registered for {id}</div>
  const lines = ex.text.split('\n')
  return (
    <>
      <div className="filebar">
        <span className="f">{ex.file}</span>
        <span> : {ex.first}</span>
        {hit !== undefined && <span> · line {hit} is the one responsible</span>}
      </div>
      <pre className="code">
        {lines.map((l, i) => {
          const n = ex.first + i
          return (
            <div key={i} className={`ln${hit === n ? ' hit' : ''}`}>
              <span className="no">{n}</span>
              <span dangerouslySetInnerHTML={{ __html: highlight(l, ex.lang) || '&nbsp;' }} />
            </div>
          )
        })}
      </pre>
    </>
  )
}

const FILE_TO_EXCERPTS: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {}
  for (const [id, ex] of Object.entries(CODE)) {
    ;(out[ex.file] ??= []).push(id)
  }
  return out
})()

/**
 * The excerpt whose real line range contains `line`. Returns exact:false when only a
 * different region of the same file is filed, so the reader is never shown one piece
 * of code labelled as another.
 */
export function excerptFor(file: string, line: number): string | null {
  const r = excerptForDetailed(file, line)
  return r?.exact ? r.id : null
}

export function excerptForDetailed(file: string, line: number): { id: string; exact: boolean } | null {
  const ids = FILE_TO_EXCERPTS[file]
  if (!ids?.length) return null
  for (const id of ids) {
    const ex = CODE[id]
    const span = ex.text.split('\n').length
    if (line >= ex.first && line < ex.first + span) return { id, exact: true }
  }
  return { id: ids[0], exact: false }
}
