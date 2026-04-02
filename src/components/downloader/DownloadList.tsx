import { CheckCircle2, XCircle, Loader2, Download, X, FileVideo, FileAudio, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DownloadItem } from '@/types/downloader'
import { formatDuration } from '@/lib/downloader'



interface DownloadListProps {
  items: DownloadItem[]
  onRemove: (id: string) => void
}
function StatusIcon({ status }: { status: DownloadItem['status'] }) {
  switch (status) {
    case 'pending': return <Download className="h-4 w-4 text-muted-foreground" />
    case 'analyzing': return <Loader2 className="h-4 w-4 text-primary animate-spin" />
    case 'downloading': return <Loader2 className="h-4 w-4 text-primary animate-spin" />
    case 'done': return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'error': return <XCircle className="h-4 w-4 text-destructive" />
  }
}
function ProgressBar({ progress, status }: { progress: number; status: DownloadItem['status'] }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300 ease-out',
          status === 'error' ? 'bg-destructive' : status === 'done'? 'bg-green-500' : 'bg-gradient-primary',
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
export function DownloadList({ items, onRemove }: DownloadListProps) {
  if (items.length === 0) return null
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 animate-fade-in"
        >
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
            item.mode === 'video' ? 'bg-primary/10' : 'bg-amber-500/10'
          )}>
            {item.mode === 'video'
              ? <FileVideo className="h-4 w-4 text-primary" />
              : <FileAudio className="h-4 w-4 text-amber-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-foreground truncate">
                {item.videoInfo?.title || '解析中...'}
              </p>
              <div className="flex items-center gap-1">
                {item.status === 'done' && item.downloadUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = item.downloadUrl!
                      link.download = ''
                      link.click()
                    }}
                  >
                    <Save className="h-3 w-3 mr-0.5" />
                    保存
                  </Button>
                )}
                <StatusIcon status={item.status} />
              </div>
            </div>
            {item.status === 'downloading' && (
              <div className="space-y-1">
                <ProgressBar progress={item.progress} status={item.status} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.progress}%</span>
                  <span>{item.speed}</span>
                  <span>{item.fileSize}</span>
                </div>
              </div>
            )}
            {item.status === 'done' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{item.fileSize}</span>
                <span className="text-green-500">{item.downloadUrl ? '下载完成 - 可保存文件' : '下载完成'}</span>
              </div>
            )}
            {item.status === 'error' && (
              <p className="text-xs text-destructive">{item.error || '下载失败'}</p>
            )}
            {(item.status === 'pending' || item.status === 'analyzing') && item.videoInfo && (
              <p className="text-xs text-muted-foreground">
                {formatDuration(item.videoInfo.duration)} · {String(item.quality).toUpperCase()} · {String(item.format).toUpperCase()}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onRemove(item.id)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  )
}