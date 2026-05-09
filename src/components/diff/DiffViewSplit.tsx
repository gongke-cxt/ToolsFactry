import { useRef, useCallback, useEffect } from 'react'
import type { DiffLine as DiffLineType, DiffHunk } from '@/types/diff'
import { DiffLine } from './DiffLine'

interface DiffViewSplitProps {
  hunks: DiffHunk[]
  leftLines: DiffLineType[]
  rightLines: DiffLineType[]
  currentHunk: number
}

export function DiffViewSplit({ hunks, leftLines, rightLines, currentHunk }: DiffViewSplitProps) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const syncingRef = useRef(false)

  const syncScroll = useCallback((source: 'left' | 'right') => {
    if (syncingRef.current) return
    syncingRef.current = true
    const sourceEl = source === 'left' ? leftRef.current : rightRef.current
    const targetEl = source === 'left' ? rightRef.current : leftRef.current
    if (!sourceEl || !targetEl) { syncingRef.current = false; return }

    const maxScrollS = sourceEl.scrollHeight - sourceEl.clientHeight
    const maxScrollT = targetEl.scrollHeight - targetEl.clientHeight
    if (maxScrollS <= 0 || maxScrollT <= 0) { syncingRef.current = false; return }

    const pct = sourceEl.scrollTop / maxScrollS
    targetEl.scrollTop = pct * maxScrollT
    requestAnimationFrame(() => { syncingRef.current = false })
  }, [])

  const setBothScrollTop = useCallback((top: number) => {
    if (leftRef.current) leftRef.current.scrollTop = top
    if (rightRef.current) rightRef.current.scrollTop = top
  }, [])

  useEffect(() => {
    if (currentHunk >= 0 && hunks.length > 0 && currentHunk < hunks.length) {
      const id = `diff-hunk-${currentHunk}`
      const el = document.getElementById(id)
      if (el) {
        const container = leftRef.current
        if (container) {
          const offset = el.offsetTop - container.clientHeight / 3
          setBothScrollTop(Math.max(0, offset))
        }
      }
    }
  }, [currentHunk, hunks.length, setBothScrollTop])

  if (leftLines.length === 0 && rightLines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        输入文本后显示差异对比
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-0 flex-1 min-h-0">
      {/* Left panel */}
      <div
        ref={leftRef}
        className="overflow-auto border-r border-border"
        onScroll={() => syncScroll('left')}
      >
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: 52 }} />
            <col />
          </colgroup>
          <tbody>
            {leftLines.map((line, i) => (
              <LineWrapper key={i} index={i} hunks={hunks}>
                <DiffLine line={line} showOldNumber gutterWidth="w-[52px]" />
              </LineWrapper>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right panel */}
      <div
        ref={rightRef}
        className="overflow-auto"
        onScroll={() => syncScroll('right')}
      >
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: 52 }} />
            <col />
          </colgroup>
          <tbody>
            {rightLines.map((line, i) => (
              <LineWrapper key={i} index={i} hunks={hunks}>
                <DiffLine line={line} showNewNumber gutterWidth="w-[52px]" />
              </LineWrapper>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LineWrapper({
  children,
  index,
  hunks,
}: {
  children: React.ReactNode
  index: number
  hunks: DiffHunk[]
}) {
  const hunkIdx = findHunkIndex(index, hunks)
  const id = hunkIdx >= 0 ? `diff-hunk-${hunkIdx}` : undefined
  return <>{id ? <tr id={id} className="hidden" /> : null}{children}</>
}

function findHunkIndex(lineIdx: number, hunks: DiffHunk[]): number {
  let offset = 0
  for (const hunk of hunks) {
    if (lineIdx >= offset && lineIdx < offset + hunk.lines.length) {
      return hunk.index
    }
    offset += hunk.lines.length
  }
  return -1
}
