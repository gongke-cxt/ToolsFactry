import type { GenerateTask } from '@/types/ai-image'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash2, Maximize2, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react'

interface TaskCardProps {
  task: GenerateTask
  isActive: boolean
  onClick: () => void
  onRemove: () => void
  onMjAction?: (taskId: string, action: string) => void
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  idle: { icon: <Clock className="h-4 w-4" />, color: 'text-muted-foreground', label: '等待中' },
  submitting: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-blue-500', label: '提交中' },
  queued: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-yellow-500', label: '排队中' },
  processing: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-blue-500', label: '生成中' },
  success: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-500', label: '完成' },
  failure: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-500', label: '失败' },
}

function downloadImage(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function TaskCard({ task, isActive, onClick, onRemove, onMjAction }: TaskCardProps) {
  const s = statusConfig[task.status] || statusConfig.idle

  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer transition-smooth',
        isActive ? 'ring-2 ring-primary' : 'hover:shadow-elegant',
      )}
      onClick={onClick}
    >
      {/* 图片预览区 */}
      <div className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
        {task.imageUrl ? (
          <img
            src={task.imageUrl}
            alt={task.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {s.icon}
            <span className="text-sm">{s.label}</span>
            {task.progress && <span className="text-xs">{task.progress}</span>}
          </div>
        )}

        {/* 状态徽章 */}
        <div className={cn('absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm', s.color)}>
          {s.icon}
          {s.label}
        </div>
      </div>

      {/* 信息区 */}
      <div className="p-3 space-y-2">
        <p className="text-sm text-foreground line-clamp-2 leading-relaxed">{task.prompt}</p>

        {task.error && (
          <div className="flex items-start gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{task.error}</span>
          </div>
        )}

        {/* Midjourney 操作按钮 */}
        {task.engine === 'midjourney' && task.status === 'success' && task.images.length > 0 && onMjAction && (
          <div className="flex flex-wrap gap-1">
            {['U1', 'U2', 'U3', 'U4', 'V1', 'V2', 'V3', 'V4', 'R'].map(action => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={e => { e.stopPropagation(); onMjAction(task.id, action) }}
              >
                {action}
              </Button>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-1.5">
          {task.imageUrl && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={e => { e.stopPropagation(); downloadImage(task.imageUrl, `ai-image-${task.id}.png`) }}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={e => { e.stopPropagation(); window.open(task.imageUrl, '_blank') }}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={e => { e.stopPropagation(); onRemove() }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
