import { useEffect, useRef } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [value])

  return (
    <div className="flex flex-col h-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 w-full resize-none bg-background text-foreground font-mono text-sm leading-relaxed p-5 outline-none placeholder:text-muted-foreground"
        placeholder="在此输入 Markdown 内容..."
        spellCheck={false}
      />
    </div>
  )
}
