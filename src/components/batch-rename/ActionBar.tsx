import { Button } from '@/components/ui/button'
import { Download, Undo2, Trash2 } from 'lucide-react'
import type { HistorySnapshot } from '@/types/batch-rename'

interface ActionBarProps {
  fileCount: number
  changedCount: number
  conflictCount: number
  canApply: boolean
  canUndo: boolean
  isApplying: boolean
  historyCount: number
  onApply: () => void
  onUndo: () => void
  onClear: () => void
}

export function ActionBar({
  fileCount,
  changedCount,
  conflictCount,
  canApply,
  canUndo,
  isApplying,
  historyCount,
  onApply,
  onUndo,
  onClear,
}: ActionBarProps) {
  if (fileCount === 0) return null

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Left: summary */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{fileCount}</span> 个文件
        </span>
        {changedCount > 0 && (
          <span className="text-success">
            <span className="font-semibold">{changedCount}</span> 个将重命名
          </span>
        )}
        {conflictCount > 0 && (
          <span className="text-destructive">
            <span className="font-semibold">{conflictCount}</span> 个冲突
          </span>
        )}
        {historyCount > 0 && (
          <span className="text-xs text-muted-foreground">
            可撤销 {historyCount} 步
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          清空
        </Button>

        {canUndo && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
          >
            <Undo2 className="h-4 w-4 mr-1.5" />
            撤销
          </Button>
        )}

        <Button
          size="sm"
          disabled={!canApply || conflictCount > 0 || isApplying}
          onClick={onApply}
        >
          <Download className="h-4 w-4 mr-1.5" />
          {isApplying ? '打包中...' : `应用重命名 (${changedCount})`}
        </Button>
      </div>
    </div>
  )
}
