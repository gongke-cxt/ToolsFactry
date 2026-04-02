import { useState, useCallback } from 'react'
import { GripVertical, X, FileText, Loader2, Merge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PdfDropZone } from './PdfDropZone'
import type { PdfFileItem } from '@/types/pdf'
import {
  loadPdfFile,
  mergeFiles,
  downloadPdf,
  formatSize,
} from '@/lib/pdf-engine'
import { cn } from '@/lib/utils'

export function MergeView() {
  const [files, setFiles] = useState<PdfFileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [merging, setMerging] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const handleFiles = useCallback(async (incoming: File[]) => {
    setLoading(true)
    const items = await Promise.all(incoming.map(loadPdfFile))
    setFiles((prev) => [...prev, ...items])
    setLoading(false)
  }, [])

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleMerge = useCallback(async () => {
    if (files.length < 2) return
    setMerging(true)
    try {
      const result = await mergeFiles(files)
      downloadPdf(result, 'merged.pdf')
    } finally {
      setMerging(false)
    }
  }, [files])

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault()
      if (dragIdx === null || dragIdx === dropIdx) return
      setFiles((prev) => {
        const next = [...prev]
        const [moved] = next.splice(dragIdx, 1)
        next.splice(dropIdx, 0, moved)
        return next
      })
      setDragIdx(null)
    },
    [dragIdx],
  )

  return (
    <div className="space-y-5">
      <PdfDropZone multiple hasFiles={files.length > 0} onFiles={handleFiles} />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在加载文件...
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            已添加 {files.length} 个文件 · 拖动调整合并顺序
          </p>
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li
                key={f.id}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={() => setDragIdx(null)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-smooth cursor-grab active:cursor-grabbing',
                  dragIdx === i && 'opacity-40 scale-[0.98]',
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="flex-1 text-sm font-medium truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {f.pageCount} 页 · {formatSize(f.size)}
                </span>
                <button
                  onClick={() => handleRemove(f.id)}
                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-smooth"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length >= 2 && (
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            合计 {files.reduce((s, f) => s + f.pageCount, 0)} 页
          </p>
          <Button onClick={handleMerge} disabled={merging}>
            {merging ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                合并中...
              </>
            ) : (
              <>
                <Merge className="h-4 w-4 mr-2" />
                合并并下载
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
