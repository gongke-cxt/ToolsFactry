import { useState } from 'react'
import {
  Columns, AlignLeft, ChevronUp, ChevronDown,
  Download, Eraser, FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/types/diff'

interface DiffToolbarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  ignoreWhitespace: boolean
  onIgnoreWhitespaceChange: (v: boolean) => void
  currentHunk: number
  totalHunks: number
  onPrevHunk: () => void
  onNextHunk: () => void
  onExportHTML: () => void
  onExportUnified: () => void
  onClear: () => void
  onLoadSample: () => void
  addedCount: number
  removedCount: number
  hasInput: boolean
}

export function DiffToolbar({
  viewMode,
  onViewModeChange,
  ignoreWhitespace,
  onIgnoreWhitespaceChange,
  currentHunk,
  totalHunks,
  onPrevHunk,
  onNextHunk,
  onExportHTML,
  onExportUnified,
  onClear,
  onLoadSample,
  addedCount,
  removedCount,
  hasInput,
}: DiffToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {/* View mode toggle */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
        <button
          onClick={() => onViewModeChange('split')}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-smooth",
            viewMode === 'split'
              ? "bg-gradient-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Columns className="h-3.5 w-3.5" />
          并排
        </button>
        <button
          onClick={() => onViewModeChange('unified')}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-smooth",
            viewMode === 'unified'
              ? "bg-gradient-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <AlignLeft className="h-3.5 w-3.5" />
          统一
        </button>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Ignore whitespace */}
      <div className="flex items-center gap-1.5">
        <Checkbox
          id="ignore-ws"
          checked={ignoreWhitespace}
          onCheckedChange={v => onIgnoreWhitespaceChange(!!v)}
        />
        <Label htmlFor="ignore-ws" className="text-xs cursor-pointer">忽略空格</Label>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Stats */}
      {hasInput && (
        <span className="text-xs text-muted-foreground">
          <span className="text-green-600 dark:text-green-400 font-medium">+{addedCount}</span>
          {' '}&middot;{' '}
          <span className="text-red-600 dark:text-red-400 font-medium">-{removedCount}</span>
          {totalHunks > 0 && (
            <> &middot; {totalHunks} 个差异块</>
          )}
        </span>
      )}

      {/* Navigation */}
      {totalHunks > 0 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={currentHunk <= 0}
            onClick={onPrevHunk}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[40px] text-center tabular-nums">
            {currentHunk + 1}/{totalHunks}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={currentHunk >= totalHunks - 1}
            onClick={onNextHunk}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div className="w-px h-6 bg-border" />

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onLoadSample}>
          <FileText className="h-3 w-3" />
          示例
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onClear}>
          <Eraser className="h-3 w-3" />
          清空
        </Button>

        {/* Export dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            disabled={!hasInput}
            onClick={() => setExportOpen(v => !v)}
          >
            <Download className="h-3 w-3" />
            导出
          </Button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-elegant py-1 min-w-[160px]">
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-smooth"
                  onClick={() => { onExportHTML(); setExportOpen(false) }}
                >
                  导出 HTML 报告
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-smooth"
                  onClick={() => { onExportUnified(); setExportOpen(false) }}
                >
                  导出 Unified Diff
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
