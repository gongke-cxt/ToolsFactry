import { useRef, useEffect } from 'react'
import type { DiffHunk } from '@/types/diff'
import { DiffLine } from './DiffLine'
import { cn } from '@/lib/utils'

interface DiffViewUnifiedProps {
  hunks: DiffHunk[]
  currentHunk: number
  identical: boolean
}

export function DiffViewUnified({ hunks, currentHunk }: DiffViewUnifiedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentHunk >= 0 && hunks.length > 0 && currentHunk < hunks.length) {
      const id = `diff-hunk-${currentHunk}`
      const el = document.getElementById(id)
      if (el && containerRef.current) {
        const offset = el.offsetTop - containerRef.current.clientHeight / 3
        containerRef.current.scrollTop = Math.max(0, offset)
      }
    }
  }, [currentHunk, hunks.length])

  if (hunks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        输入文本后显示差异对比
      </div>
    )
  }

  return (
    <div ref={containerRef} className="overflow-auto flex-1 min-h-0">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: 52 }} />
          <col style={{ width: 52 }} />
          <col />
        </colgroup>
        <tbody>
          {hunks.flatMap(hunk => [
            <tr
              key={`hunk-header-${hunk.index}`}
              id={`diff-hunk-${hunk.index}`}
              className={cn(
                'bg-blue-50 dark:bg-blue-950/30',
                currentHunk === hunk.index && 'ring-1 ring-inset ring-primary/30',
              )}
            >
              <td colSpan={3} className="px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">
                {hunk.header}
              </td>
            </tr>,
            ...hunk.lines.map((line, i) => (
              <DiffLine
                key={`${hunk.index}-${i}`}
                line={line}
                showOldNumber
                showNewNumber
                isCurrentHunk={currentHunk === hunk.index}
              />
            )),
          ])}
        </tbody>
      </table>
    </div>
  )
}
