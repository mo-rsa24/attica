// Code as behavior, not a caption. One line is highlighted at a time: the line
// currently responsible for the state the scene is in. Progressive reveal, per
// concept-scene/references/behavior.md.

import { useEffect, useState } from 'react'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import python from 'shiki/langs/python.mjs'
import sql from 'shiki/langs/sql.mjs'
import theme from 'shiki/themes/github-dark-default.mjs'
import { SNIPPETS } from '../code'

const cache = new Map<string, string>()

// Two grammars, named explicitly. The convenience `codeToHtml` from 'shiki'
// pulls in every language it knows, which would put emacs-lisp and wolfram in
// the bundle of a scene about Postgres.
let hl: Promise<HighlighterCore> | null = null
function highlighter() {
  hl ??= createHighlighterCore({
    themes: [theme],
    langs: [python, sql],
    engine: createOnigurumaEngine(import('shiki/wasm')),
  })
  return hl
}

async function codeToHtml(code: string, opts: { lang: string; theme: string }) {
  const h = await highlighter()
  return h.codeToHtml(code, { lang: opts.lang, theme: opts.theme })
}

export function CodeBlock({
  snippet,
  hot,
  caption,
}: {
  snippet: string
  /** The real file line to highlight, or null for none. */
  hot?: number | null
  caption?: string
}) {
  const s = SNIPPETS[snippet]
  const [html, setHtml] = useState<string | null>(cache.get(snippet) ?? null)

  useEffect(() => {
    if (!s || cache.has(snippet)) return
    let alive = true
    codeToHtml(s.text, { lang: s.lang, theme: 'github-dark-default' }).then((raw) => {
      const h = tighten(raw)
      cache.set(snippet, h)
      if (alive) setHtml(h)
    })
    return () => {
      alive = false
    }
  }, [snippet, s])

  if (!s) return null

  // Shiki emits one <span class="line"> per line. Tag the active one by index.
  let body = html ?? `<pre><code>${escapeHtml(s.text)}</code></pre>`
  if (html && hot != null) {
    const idx = hot - s.firstLine
    let n = -1
    body = html.replace(/<span class="line"/g, () => {
      n++
      return n === idx ? '<span class="line hot"' : '<span class="line"'
    })
  }

  return (
    <div className="code">
      <div className="chead">
        <span>{s.file}</span>
        <span style={{ marginLeft: 'auto' }}>
          lines {s.firstLine}
          {'–'}
          {s.firstLine + s.text.split('\n').length - 1}
          {hot != null ? ` · running line ${hot}` : ''}
        </span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      {caption && (
        <div style={{ padding: '8px 13px', fontSize: 12.5, color: 'var(--ink-dim)', borderTop: '1px solid var(--line)' }}>
          {caption}
        </div>
      )}
    </div>
  )
}

/** Shiki emits `</span>\n<span class="line">` between lines. Our `.line` rule is
 *  display:block so a highlight can span the full width, which makes that
 *  newline render as a second, empty line box and double every code block's
 *  height. Drop the separators; the block display supplies the break. */
function tighten(html: string) {
  return html.replace(/<\/span>\n<span class="line"/g, '</span><span class="line"')
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)
}

/** For code the reader is writing rather than code Attica already contains: the
 *  build track in stage 4. Same highlighting, same active-line behaviour. */
export function RawCode({
  code,
  lang,
  file,
  hotLines,
  caption,
}: {
  code: string
  lang: 'python' | 'sql'
  file: string
  /** Zero-based line indexes to highlight: what changed since the last step. */
  hotLines?: number[]
  caption?: string
}) {
  const key = `${file}:${code.length}:${code.slice(0, 24)}`
  const [html, setHtml] = useState<string | null>(cache.get(key) ?? null)

  useEffect(() => {
    if (cache.has(key)) return
    let alive = true
    codeToHtml(code, { lang, theme: 'github-dark-default' }).then((raw) => {
      const h = tighten(raw)
      cache.set(key, h)
      if (alive) setHtml(h)
    })
    return () => {
      alive = false
    }
  }, [key, code, lang])

  let body = html ?? `<pre><code>${escapeHtml(code)}</code></pre>`
  if (html && hotLines?.length) {
    let n = -1
    body = html.replace(/<span class="line"/g, () => {
      n++
      return hotLines.includes(n) ? '<span class="line hot"' : '<span class="line"'
    })
  }

  return (
    <div className="code">
      <div className="chead">
        <span>{file}</span>
        {hotLines?.length ? (
          <span style={{ marginLeft: 'auto' }}>{hotLines.length} line(s) new since the last step</span>
        ) : null}
      </div>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      {caption && (
        <div style={{ padding: '8px 13px', fontSize: 12.5, color: 'var(--ink-dim)', borderTop: '1px solid var(--line)' }}>
          {caption}
        </div>
      )}
    </div>
  )
}
