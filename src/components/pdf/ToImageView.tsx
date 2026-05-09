import { useState, useCallback, useMemo } from 'react'
import {
  Download, Loader2, GripVertical,
  X, ImageIcon, Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PdfDropZone } from './PdfDropZone'
import type { PdfFileItem, ImageExportOptions, ImageFormat } from '@/types/pdf'
import {
  loadPdfFile, renderPageThumbnail, renderPageToBlob,
  imageFileName, formatSize,
} from '@/lib/pdf-engine'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { cn } from '@/lib/utils'

interface TaskFile {
  id: string
  pdf: PdfFileItem
  thumbs: string[]
  /** pages to export – empty means all */
  selectedPages: Set<number>
  rangeInput: string
}

const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
  { value: 'png', label: 'PNG（无损）' },
  { value: 'jpeg', label: 'JPG（有损）' },
  { value: 'webp', label: 'WebP（有损）' },
]

const SCALE_OPTIONS = [
  { value: 1, label: '1x（72 dpi）' },
  { value: 2, label: '2x（144 dpi）' },
  { value: 3, label: '3x（216 dpi）' },
]

export function ToImageView() {
  const [tasks, setTasks] = useState<TaskFile[]>([])
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [exportOpts, setExportOpts] = useState<ImageExportOptions>({
    format: 'png',
    quality: 0.92,
    scale: 2,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(false)

  /* ---- add files ---- */
  const handleFiles = useCallback(async (files: File[]) => {
    setLoading(true)
    try {
      const newTasks: TaskFile[] = []
      for (const f of files) {
        const pdf = await loadPdfFile(f)
        const thumbs = await Promise.all(
          Array.from({ length: pdf.pageCount }, (_, i) =>
            renderPageThumbnail(pdf.buffer, i, 0.35),
          ),
        )
        newTasks.push({
          id: pdf.id,
          pdf,
          thumbs,
          selectedPages: new Set(Array.from({ length: pdf.pageCount }, (_, i) => i)),
          rangeInput: '',
        })
      }
      setTasks((prev) => [...prev, ...newTasks])
    } finally {
      setLoading(false)
    }
  }, [])

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearAll = useCallback(() => setTasks([]), [])

  /* ---- page selection per task ---- */
  const togglePage = useCallback((taskId: string, pageIdx: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const next = new Set(t.selectedPages)
        if (next.has(pageIdx)) next.delete(pageIdx)
        else next.add(pageIdx)
        return { ...t, selectedPages: next }
      }),
    )
  }, [])

  const toggleAllPages = useCallback((taskId: string, pageCount: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const allSelected = t.selectedPages.size === pageCount
        return {
          ...t,
          selectedPages: allSelected
            ? new Set()
            : new Set(Array.from({ length: pageCount }, (_, i) => i)),
        }
      }),
    )
  }, [])

  const applyRange = useCallback((taskId: string, pageCount: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const input = t.rangeInput.trim()
        if (!input) return t
        const indices = parseSimpleRange(input, pageCount)
        return { ...t, selectedPages: new Set(indices), rangeInput: '' }
      }),
    )
  }, [])

  /* ---- drag reorder tasks ---- */
  const handleDrop = useCallback(
    (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault()
      if (dragIdx === null || dragIdx === dropIdx) return
      setTasks((prev) => {
        const next = [...prev]
        const [moved] = next.splice(dragIdx, 1)
        next.splice(dropIdx, 0, moved)
        return next
      })
      setDragIdx(null)
    },
    [dragIdx],
  )

  /* ---- export ---- */
  const totalImages = useMemo(
    () => tasks.reduce((sum, t) => sum + t.selectedPages.size, 0),
    [tasks],
  )

  const handleExport = useCallback(async () => {
    if (tasks.length === 0 || totalImages === 0) return
    setProcessing(true)
    try {
      const pages = tasks.flatMap((t) =>
        Array.from(t.selectedPages).sort((a, b) => a - b).map((pi) => ({
          task: t,
          pageIndex: pi,
        })),
      )

      if (pages.length === 1) {
        const { task, pageIndex } = pages[0]
        const blob = await renderPageToBlob(task.pdf.buffer, pageIndex, exportOpts)
        saveAs(blob, imageFileName(task.pdf.name, pageIndex, exportOpts.format))
      } else {
        const zip = new JSZip()
        for (const { task, pageIndex } of pages) {
          const blob = await renderPageToBlob(task.pdf.buffer, pageIndex, exportOpts)
          zip.file(imageFileName(task.pdf.name, pageIndex, exportOpts.format), blob)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        saveAs(zipBlob, 'pdf-images.zip')
      }
    } finally {
      setProcessing(false)
    }
  }, [tasks, totalImages, exportOpts])

  /* ---- render ---- */
  if (tasks.length === 0) {
    return (
      <div className="space-y-4">
        <PdfDropZone multiple onFiles={handleFiles} />
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在加载并渲染页面缩略图...
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          加载中...
        </div>
      )}

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <PdfDropZone multiple hasFiles onFiles={handleFiles} />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setShowSettings((v) => !v)}
          >
            <Settings2 className="h-3.5 w-3.5 mr-1" />
            导出设置
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            清空全部
          </Button>
        </div>
      </div>

      {/* export settings panel */}
      {showSettings && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h4 className="text-sm font-semibold">导出设置</h4>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">格式</span>
              <select
                value={exportOpts.format}
                onChange={(e) =>
                  setExportOpts((o) => ({ ...o, format: e.target.value as ImageFormat }))
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">分辨率</span>
              <select
                value={exportOpts.scale}
                onChange={(e) =>
                  setExportOpts((o) => ({ ...o, scale: Number(e.target.value) }))
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {SCALE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            {exportOpts.format !== 'png' && (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">质量</span>
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={exportOpts.quality}
                  onChange={(e) =>
                    setExportOpts((o) => ({ ...o, quality: Number(e.target.value) }))
                  }
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground w-8">
                  {Math.round(exportOpts.quality * 100)}%
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* task list */}
      {tasks.map((task, ti) => (
        <TaskCard
          key={task.id}
          task={task}
          onTogglePage={(pi) => togglePage(task.id, pi)}
          onToggleAll={() => toggleAllPages(task.id, task.pdf.pageCount)}
          onApplyRange={() => applyRange(task.id, task.pdf.pageCount)}
          onRangeChange={(v) =>
            setTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, rangeInput: v } : t)),
            )
          }
          onRemove={() => removeTask(task.id)}
          onDragStart={() => setDragIdx(ti)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, ti)}
          onDragEnd={() => setDragIdx(null)}
          isDragging={dragIdx === ti}
        />
      ))}

      {/* export button */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          共 {tasks.length} 个文件 · {totalImages} 张图片待导出
        </span>
        <Button onClick={handleExport} disabled={processing || totalImages === 0}>
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {totalImages === 1 ? '下载图片' : `打包下载 ZIP (${totalImages} 张)`}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

/* ---------- sub-components ---------- */

interface TaskCardProps {
  task: TaskFile
  onTogglePage: (pageIdx: number) => void
  onToggleAll: () => void
  onApplyRange: () => void
  onRangeChange: (v: string) => void
  onRemove: () => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
  isDragging: boolean
}

function TaskCard({
  task,
  onTogglePage, onToggleAll, onApplyRange, onRangeChange,
  onRemove,
  onDragStart, onDragOver, onDrop, onDragEnd, isDragging,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(true)
  const allSelected = task.selectedPages.size === task.pdf.pageCount

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        'rounded-lg border bg-card transition-smooth',
        isDragging && 'opacity-40 scale-[0.98]',
      )}
    >
      {/* file header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
        <ImageIcon className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">{task.pdf.name}</span>
          <span className="text-xs text-muted-foreground">
            {task.pdf.pageCount} 页 · {formatSize(task.pdf.size)} · 已选 {task.selectedPages.size} 页
          </span>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground transition-smooth px-2 py-1 rounded hover:bg-accent/50"
        >
          {expanded ? '收起' : '展开'}
        </button>
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-smooth"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* page toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={onToggleAll}>
              {allSelected ? '取消全选' : '全选'}
            </Button>
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="text"
                value={task.rangeInput}
                onChange={(e) => onRangeChange(e.target.value)}
                placeholder="页码范围，如 1-3,5"
                className="h-8 rounded-md border border-input bg-background px-2 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button variant="outline" size="sm" disabled={!task.rangeInput.trim()} onClick={onApplyRange}>
                应用
              </Button>
            </div>
          </div>

          {/* page grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {task.thumbs.map((thumb, pi) => {
              const selected = task.selectedPages.has(pi)
              return (
                <div
                  key={pi}
                  onClick={() => onTogglePage(pi)}
                  className={cn(
                    'relative rounded-lg border-2 bg-card overflow-hidden cursor-pointer transition-smooth',
                    selected
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40 opacity-60',
                  )}
                >
                  <div className="aspect-[3/4] bg-muted/30 flex items-center justify-center overflow-hidden">
                    <img
                      src={thumb}
                      alt={`第 ${pi + 1} 页`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center text-xs text-muted-foreground py-0.5 bg-card">
                    {pi + 1}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- helpers ---------- */

function parseSimpleRange(input: string, maxPage: number): number[] {
  const indices = new Set<number>()
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean)
  for (const part of parts) {
    const match = part.match(/^(\d+)\s*-\s*(\d+)$/)
    if (match) {
      const start = Math.max(1, parseInt(match[1], 10))
      const end = Math.min(maxPage, parseInt(match[2], 10))
      for (let i = start; i <= end; i++) indices.add(i - 1)
    } else {
      const n = parseInt(part, 10)
      if (!isNaN(n) && n >= 1 && n <= maxPage) indices.add(n - 1)
    }
  }
  return Array.from(indices).sort((a, b) => a - b)
}
