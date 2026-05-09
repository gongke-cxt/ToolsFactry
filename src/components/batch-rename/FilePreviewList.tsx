import { useState, useRef, useCallback, useMemo } from 'react'
import { ArrowRight, AlertCircle, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computeDiff } from '@/lib/batch-rename/core'
import type { RenamePreview } from '@/types/batch-rename'

const ROW_HEIGHT = 44
const BUFFER = 8

interface FilePreviewListProps {
  previews: RenamePreview[]
}

export function FilePreviewList({ previews }: FilePreviewListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const containerHeight = 480

  const viewport = useMemo(() => {
    const totalHeight = previews.length * ROW_HEIGHT
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER)
    const end = Math.min(
      previews.length - 1,
      Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER
    )
    return { totalHeight, start, end }
  }, [previews.length, scrollTop])

  const visibleItems = previews.slice(viewport.start, viewport.end + 1)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const changedCount = previews.filter(p => p.originalName !== p.newName).length
  const conflictCount = previews.filter(p => p.hasConflict).length

  if (previews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[480px] text-muted-foreground">
        <File className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">添加文件后在此预览重命名结果</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>共 <span className="font-semibold text-foreground">{previews.length}</span> 个文件</span>
        {changedCount > 0 && (
          <span className="text-success">
            将重命名 <span className="font-semibold">{changedCount}</span> 个
          </span>
        )}
        {conflictCount > 0 && (
          <span className="inline-flex items-center gap-1 text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span className="font-semibold">{conflictCount}</span> 个冲突
          </span>
        )}
      </div>

      {/* Virtual scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-auto rounded-lg border border-border bg-background"
        style={{ height: containerHeight }}
      >
        <div style={{ height: viewport.totalHeight, position: 'relative' }}>
          {visibleItems.map((preview, i) => {
            const actualIndex = viewport.start + i
            const changed = preview.originalName !== preview.newName
            const diff = changed ? computeDiff(preview.originalName, preview.newName) : null

            return (
              <div
                key={preview.id}
                className={cn(
                  "absolute left-0 right-0 flex items-center gap-3 px-4 transition-smooth",
                  preview.hasConflict && "bg-destructive/5",
                  !preview.hasConflict && changed && actualIndex % 2 === 0 && "bg-accent/20",
                  !changed && "opacity-50"
                )}
                style={{ top: actualIndex * ROW_HEIGHT, height: ROW_HEIGHT }}
              >
                {/* Index */}
                <span className="text-xs text-muted-foreground/60 w-8 text-right shrink-0 font-mono">
                  {actualIndex + 1}
                </span>

                {/* Original name */}
                <span className="text-sm text-foreground truncate min-w-0 flex-1 font-mono">
                  {preview.originalName}
                </span>

                {/* Arrow */}
                <ArrowRight className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  changed ? "text-primary" : "text-muted-foreground/30"
                )} />

                {/* New name with diff */}
                <span className="text-sm truncate min-w-0 flex-1 font-mono">
                  {diff ? (
                    <>
                      <span className="text-foreground">{diff.prefix}</span>
                      {diff.removed && (
                        <span className="bg-destructive/15 text-destructive line-through decoration-destructive/40">{diff.removed}</span>
                      )}
                      {diff.added && (
                        <span className="bg-success/15 text-success">{diff.added}</span>
                      )}
                      <span className="text-foreground">{diff.suffix}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{preview.newName}</span>
                  )}
                </span>

                {/* Status */}
                {preview.hasConflict && (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}
                {changed && !preview.hasConflict && (
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
