import { useState, useMemo, useCallback } from 'react'
import { Copy, Download, List, FileText, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkdownEditor } from '@/components/md/MarkdownEditor'
import { MarkdownPreview } from '@/components/md/MarkdownPreview'
import { ThemeSelector } from '@/components/md/ThemeSelector'
import { TableOfContents } from '@/components/md/TableOfContents'
import { parseMarkdown, TocItem } from '@/lib/markdown/renderer'
import { getTheme } from '@/lib/markdown/themes'
import { generateStandaloneHTML } from '@/lib/markdown/exporter'

const DEFAULT_MARKDOWN = `# Markdown 转 HTML 转换器

欢迎使用 **Markdown 转 HTML** 工具！左侧输入 Markdown，右侧实时预览样式化的 HTML。

## 功能特性

- **实时预览** — 输入即看到效果
- **多种主题** — GitHub、Medium、Newsprint、Slate、Elegant
- **代码高亮** — 自动识别语言并高亮
- **目录生成** — 自动提取标题生成 TOC
- **一键导出** — 下载完整独立的 HTML 文件

## 代码示例

\`\`\`typescript
interface Converter {
  parse(markdown: string): string
  highlight(code: string, lang: string): string
  generateTOC(headings: Heading[]): TOCItem[]
}

function createConverter(options: Options): Converter {
  const theme = loadTheme(options.themeId)
  const renderer = new MarkedRenderer(theme)

  return {
    parse: (md) => renderer.parse(md),
    highlight: (code, lang) => hljs.highlight(code, { language: lang }).value,
    generateTOC: (headings) => buildTOC(headings)
  }
}
\`\`\`

## 表格示例

| 主题 | 风格 | 适用场景 |
|------|------|----------|
| GitHub | 简洁专业 | 技术文档 |
| Medium | 编辑风格 | 博客文章 |
| Newsprint | 古典排版 | 长文阅读 |
| Slate | 暗色现代 | 护眼模式 |
| Elegant | 精致渐变 | 品牌展示 |

## 引用

> 好的工具应该是透明的——它让你专注于内容本身，而不是工具的使用方式。
>
> — 某位智者

## 列表

### 有序列表

1. 输入 Markdown 文本
2. 选择喜欢的主题
3. 实时查看预览效果
4. 复制或导出 HTML

### 无序列表

- 支持 **粗体**、*斜体*、~~删除线~~
- 支持 \`行内代码\` 和代码块
- 支持链接和图片
- 支持表格和引用

---

*开始输入你的 Markdown 内容吧！*
`

function buildTocHtml(items: TocItem[]): string {
  if (items.length === 0) return ''
  const lis = items.map(item => {
    const cls = item.level > 2 ? ` class="toc-h${item.level}"` : ''
    return `<li${cls}><a href="#${item.id}">${item.text}</a></li>`
  }).join('\n')
  return `<h2>目录</h2><ul>${lis}</ul>`
}

export function MarkdownConverter() {
  const [source, setSource] = useState(DEFAULT_MARKDOWN)
  const [themeId, setThemeId] = useState('github')
  const [showToc, setShowToc] = useState(false)
  const [copied, setCopied] = useState(false)

  const { html, toc } = useMemo(() => parseMarkdown(source), [source])
  const theme = useMemo(() => getTheme(themeId), [themeId])

  const wordCount = useMemo(() => source.trim().length, [source])

  const handleCopyHTML = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = html
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [html])

  const handleDownload = useCallback(() => {
    const tocHtml = buildTocHtml(toc)
    const fullHTML = generateStandaloneHTML(html, themeId, tocHtml)
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.html'
    a.click()
    URL.revokeObjectURL(url)
  }, [html, themeId, toc])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-1 mb-3 flex-wrap">
        <ThemeSelector current={themeId} onChange={setThemeId} />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {wordCount} 字符 · {toc.length} 标题
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowToc(v => !v)}
            className={showToc ? 'bg-accent text-accent-foreground' : ''}
          >
            <List className="h-4 w-4 mr-1.5" />
            目录
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyHTML}>
            {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
            {copied ? '已复制' : '复制 HTML'}
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1.5" />
            下载 HTML
          </Button>
        </div>
      </div>

      {/* TOC */}
      <TableOfContents items={toc} visible={showToc} />

      {/* Split view */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-elegant min-h-0">
        {/* Editor */}
        <div className="flex flex-col border-r border-border min-h-0">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Markdown 输入</span>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            <MarkdownEditor value={source} onChange={setSource} />
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-muted-foreground">
              预览 · {theme.name} 主题
            </span>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            <MarkdownPreview html={html} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  )
}
