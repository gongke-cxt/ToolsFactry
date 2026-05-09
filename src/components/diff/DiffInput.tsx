import { useEffect, useRef } from 'react'

interface DiffInputProps {
  leftText: string
  rightText: string
  onLeftChange: (value: string) => void
  onRightChange: (value: string) => void
}

export function DiffInput({ leftText, rightText, onLeftChange, onRightChange }: DiffInputProps) {
  const leftRef = useRef<HTMLTextAreaElement>(null)
  const rightRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = leftRef.current
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
  }, [leftText])

  useEffect(() => {
    const el = rightRef.current
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
  }, [rightText])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card shadow-elegant">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground">原始文本</span>
        </div>
        <textarea
          ref={leftRef}
          value={leftText}
          onChange={e => onLeftChange(e.target.value)}
          placeholder="粘贴原始版本..."
          className="flex-1 w-full resize-none bg-transparent text-foreground font-mono text-sm leading-relaxed p-4 outline-none min-h-[200px] placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card shadow-elegant">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground">修改后文本</span>
        </div>
        <textarea
          ref={rightRef}
          value={rightText}
          onChange={e => onRightChange(e.target.value)}
          placeholder="粘贴修改后版本..."
          className="flex-1 w-full resize-none bg-transparent text-foreground font-mono text-sm leading-relaxed p-4 outline-none min-h-[200px] placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  )
}
