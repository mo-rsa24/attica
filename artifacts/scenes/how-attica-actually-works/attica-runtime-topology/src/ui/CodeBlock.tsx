import { useEffect, useState } from 'react'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import json from 'shiki/langs/json.mjs'
import javascript from 'shiki/langs/javascript.mjs'
import python from 'shiki/langs/python.mjs'
import githubLight from 'shiki/themes/github-light.mjs'

let hl: Promise<HighlighterCore> | null = null
function highlighter() {
  if (!hl)
    hl = createHighlighterCore({
      themes: [githubLight],
      langs: [json, javascript, python],
      engine: createJavaScriptRegexEngine(),
    })
  return hl
}

const KNOWN = new Set(['json', 'javascript', 'python'])

interface Props {
  code: string
  lang?: string
  /** 1-indexed lines to highlight. Driven by state, never by hand. */
  active?: number[]
  caption?: string
}

export function CodeBlock({ code, lang = 'javascript', active = [], caption }: Props) {
  const [html, setHtml] = useState<string>('')
  const useLang = KNOWN.has(lang) ? lang : 'text'

  useEffect(() => {
    let live = true
    highlighter().then((h) => {
      const out = h.codeToHtml(code, { lang: useLang, theme: 'github-light' })
      if (live) setHtml(out)
    })
    return () => {
      live = false
    }
  }, [code, useLang])

  const marks = new Set(active)

  return (
    <div className="codeblock">
      {caption && <div className="codecap">{caption}</div>}
      {html ? (
        <div
          className="shiki-wrap"
          ref={(el) => {
            if (!el) return
            el.querySelectorAll('.line').forEach((l, i) => l.classList.toggle('active-line', marks.has(i + 1)))
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="fallback">{code}</pre>
      )}
    </div>
  )
}
