import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCheck, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlaylistItem } from '@/types/downloader'
import { formatDuration } from '@/lib/downloader'

interface PlaylistViewProps {
  items: PlaylistItem[]
  onToggle: (id: string) => void
  onToggleAll: (selected: boolean) => void
}

export function PlaylistView({ items, onToggle, onToggleAll }: PlaylistViewProps) {
  const selectedCount = items.filter((i) => i.selected).length
  const allSelected = selectedCount === items.length

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ListChecks className="h-4 w-4 text-primary" />
          播放列表
          <span className="text-muted-foreground font-normal">
            ({selectedCount}/{items.length} 已选择)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleAll(!allSelected)}
          className="text-xs"
        >
          <CheckCheck className="h-3.5 w-3.5 mr-1" />
          {allSelected ? '取消全选' : '全选'}
        </Button>
      </div>

      {/* Video list */}
      <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-smooth cursor-pointer',
              item.selected ? 'bg-accent/50' : 'hover:bg-muted/50'
            )}
            onClick={() => onToggle(item.id)}
          >
            <Checkbox checked={item.selected} onCheckedChange={() => onToggle(item.id)} />

            <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
              {item.index}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{item.title}</p>
            </div>

            <span className="text-xs text-muted-foreground shrink-0">
              {formatDuration(item.duration)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
