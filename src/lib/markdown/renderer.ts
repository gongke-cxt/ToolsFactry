import { Marked } from 'marked'
import hljs from 'highlight.js'

export interface TocItem {
  id: string
  text: string
  level: number
}

let tocItems: TocItem[] = []

const renderer = {
  heading({ text, depth }: { text: string; depth: number }) {
    const raw = typeof text === 'string' ? text : String(text)
    const slug = raw
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '')

    tocItems.push({ id: slug, text: raw, level: depth })
    return `<h${depth} id="${slug}">${text}</h${depth}>`
  },
  code({ text, lang }: { text: string; lang?: string }) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    const highlighted = hljs.highlight(text, { language }).value
    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
  }
}

const marked = new Marked({ renderer: renderer as never })

export function parseMarkdown(source: string): { html: string; toc: TocItem[] } {
  tocItems = []
  const html = marked.parse(source) as string
  return { html, toc: [...tocItems] }
}
