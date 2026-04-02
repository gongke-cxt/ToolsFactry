import { useMemo } from 'react'
import { MarkdownTheme } from '@/lib/markdown/themes'

interface MarkdownPreviewProps {
  html: string
  theme: MarkdownTheme
}

export function MarkdownPreview({ html, theme }: MarkdownPreviewProps) {
  const content = useMemo(() => {
    return html || '<p style="color:#999;text-align:center;margin-top:40%">在左侧输入 Markdown 开始预览</p>'
  }, [html])

  return (
    <div className="h-full overflow-auto">
      <style>{theme.styles}</style>
      <div
        className="md-body"
        style={{ minHeight: '100%' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
