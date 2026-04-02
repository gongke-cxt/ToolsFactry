import { useState, useCallback } from 'react'
import {
  Trash2, Download, GripVertical, Loader2,
  Bookmark, Check, X, Scissors,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PdfDropZone } from './PdfDropZone'
import type { PdfFileItem, PageThumb, BookmarkItem } from '@/types/pdf'
import {
  loadPdfFile, renderAllThumbnails,
  removePages, reorderPages, extractPages,
  addBookmarks, downloadPdf,
} from '@/lib/pdf-engine'
import { cn } from '@/lib/utils'

export function EditView() {
  const [pdfFile, setPdfFile] = useState<PdfFileItem | null>(null)
  const [thumbs, setThumbs] = useState<PageThumb[]>([])
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [rangeInput, setRangeInput] = useState('')
  const [bmTitle, setBmTitle] = useState('')
  const [bmPage, setBmPage] = useState('')

  /* ---- load ---- */
  const handleFile = useCallback(async (files: File[]) => {
    if (files.length === 0) return
    setLoading(true)
    const item = await loadPdfFile(files[0])
    setPdfFile(item)
    const urls = await renderAllThumbnails(item.buffer, item.pageCount)
    const pages: PageThumb[] = urls.map((url, i) => ({
      id: `p-${i}`,
      pageIndex: i,
      dataUrl: url,
    }))
    setThumbs(pages)
    setPageOrder(pages.map((_, i) => i))
    setSelected(new Set())
    setBookmarks([])
    setLoading(false)
  }, [])

  const handleReset = useCallback(() => {
    setPdfFile(null)
    setThumbs([])
    setPageOrder([])
    setSelected(new Set())
    setBookmarks([])
  }, [])

  /* ---- selection ---- */
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    if (selected.size === thumbs.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(thumbs.map((t) => t.id)))
    }
  }, [selected.size, thumbs])

  /* ---- drag reorder ---- */
  const handleDrop = useCallback(
    (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault()
      if (dragIdx === null || dragIdx === dropIdx) return
      setPageOrder((prev) => {
        const next = [...prev]
        const [moved] = next.splice(dragIdx, 1)
        next.splice(dropIdx, 0, moved)
        return next
      })
      setDragIdx(null)
    },
    [dragIdx],
  )

  /* ---- actions ---- */
  const handleDeleteSelected = useCallback(async () => {
    if (!pdfFile) return
    setProcessing(true)
    try {
      const removeSet = new Set<number>()
      selected.forEach((id) => {
        const t = thumbs.find((th) => th.id === id)
        if (t) removeSet.add(t.pageIndex)
      })
      const bytes = await removePages(pdfFile, removeSet)
      downloadPdf(bytes, 'edited.pdf')
      handleReset()
    } finally {
      setProcessing(false)
    }
  }, [pdfFile, selected, thumbs, handleReset])

  const handleExtractRange = useCallback(async () => {
    if (!pdfFile || !rangeInput.trim()) return
    setProcessing(true)
    try {
      const indices = rangeInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const n = parseInt(s, 10)
          return isNaN(n) ? -1 : n - 1
        })
        .filter((n) => n >= 0 && n < pdfFile.pageCount)
      if (indices.length === 0) return
      const bytes = await extractPages(pdfFile, indices)
      downloadPdf(bytes, 'extracted.pdf')
      setRangeInput('')
    } finally {
      setProcessing(false)
    }
  }, [pdfFile, rangeInput])

  const handleExtractSelected = useCallback(async () => {
    if (!pdfFile || selected.size === 0) return
    setProcessing(true)
    try {
      const indices = Array.from(selected)
        .map((id) => thumbs.find((t) => t.id === id))
        .filter(Boolean)
        .map((t) => t!.pageIndex)
        .sort((a, b) => a - b)
      const bytes = await extractPages(pdfFile, indices)
      downloadPdf(bytes, 'extracted.pdf')
    } finally {
      setProcessing(false)
    }
  }, [pdfFile, selected, thumbs])

  const handleDownload = useCallback(async () => {
    if (!pdfFile) return
    setProcessing(true)
    try {
      let bytes = await reorderPages(pdfFile, pageOrder)
      if (bookmarks.length > 0) {
        const tempDoc = { ...pdfFile, buffer: bytes.buffer as ArrayBuffer }
        bytes = await addBookmarks(tempDoc, bookmarks)
      }
      downloadPdf(bytes, pdfFile.name)
    } finally {
      setProcessing(false)
    }
  }, [pdfFile, pageOrder, bookmarks])

  const handleAddBookmark = useCallback(() => {
    const title = bmTitle.trim()
    const page = parseInt(bmPage, 10)
    if (!title || isNaN(page) || page < 1 || !pdfFile || page > pdfFile.pageCount) return
    setBookmarks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, pageIndex: page - 1 },
    ])
    setBmTitle('')
    setBmPage('')
  }, [bmTitle, bmPage, pdfFile])

  /* ---- render ---- */
  if (!pdfFile) {
    return (
      <div className="space-y-4">
        <PdfDropZone multiple={false} onFiles={handleFile} />
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在加载并渲染页面...
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
          正在渲染页面缩略图...
        </div>
      )}

      {/* file info bar */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div className="text-sm">
          <span className="font-medium">{pdfFile.name}</span>
          <span className="text-muted-foreground ml-2">
            {pdfFile.pageCount} 页 · {(pdfFile.size / 1024).toFixed(0)} KB
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          更换文件
        </Button>
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={selectAll}>
          <Check className="h-3.5 w-3.5 mr-1" />
          {selected.size === thumbs.length ? '取消全选' : '全选'}
        </Button>
        <Button
          variant="outline" size="sm"
          disabled={selected.size === 0 || processing}
          onClick={handleDeleteSelected}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          删除选中 ({selected.size})
        </Button>
        <Button
          variant="outline" size="sm"
          disabled={selected.size === 0 || processing}
          onClick={handleExtractSelected}
        >
          <Scissors className="h-3.5 w-3.5 mr-1" />
          提取选中
        </Button>

        <div className="flex items-center gap-1 ml-auto">
          <input
            type="text"
            value={rangeInput}
            onChange={(e) => setRangeInput(e.target.value)}
            placeholder="页码范围，如 1-3,5,7"
            className="h-8 rounded-md border border-input bg-background px-2 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            variant="outline" size="sm"
            disabled={!rangeInput.trim() || processing}
            onClick={handleExtractRange}
          >
            按范围提取
          </Button>
        </div>
      </div>

      {/* page grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {pageOrder.map((origIdx, pos) => {
          const t = thumbs[origIdx]
          const isSelected = selected.has(t.id)
          return (
            <div
              key={t.id}
              draggable
              onDragStart={() => setDragIdx(pos)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, pos)}
              onDragEnd={() => setDragIdx(null)}
              onClick={() => toggleSelect(t.id)}
              className={cn(
                'group relative rounded-lg border-2 bg-card overflow-hidden cursor-pointer transition-smooth',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/40',
                dragIdx === pos && 'opacity-40 scale-95',
              )}
            >
              <div className="aspect-[3/4] bg-muted/30 flex items-center justify-center overflow-hidden">
                <img
                  src={t.dataUrl}
                  alt={`第 ${origIdx + 1} 页`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="absolute top-1 left-1">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-smooth" />
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="text-center text-xs text-muted-foreground py-1 bg-card">
                {origIdx + 1}
              </div>
            </div>
          )
        })}
      </div>

      {/* bookmarks */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          书签
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={bmTitle}
            onChange={(e) => setBmTitle(e.target.value)}
            placeholder="书签标题"
            className="h-8 rounded-md border border-input bg-background px-2 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="number"
            value={bmPage}
            onChange={(e) => setBmPage(e.target.value)}
            placeholder="页码"
            min={1}
            max={pdfFile.pageCount}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs w-16 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="sm" onClick={handleAddBookmark} disabled={!bmTitle.trim() || !bmPage}>
            添加
          </Button>
        </div>
        {bookmarks.length > 0 && (
          <ul className="space-y-1">
            {bookmarks.map((bm) => (
              <li
                key={bm.id}
                className="flex items-center gap-2 text-xs text-muted-foreground rounded-md px-2 py-1.5 hover:bg-accent/50 transition-smooth"
              >
                <Bookmark className="h-3 w-3 text-primary shrink-0" />
                <span className="flex-1 truncate">{bm.title}</span>
                <span className="text-muted-foreground">第 {bm.pageIndex + 1} 页</span>
                <button
                  onClick={() =>
                    setBookmarks((prev) => prev.filter((b) => b.id !== bm.id))
                  }
                  className="p-0.5 rounded hover:text-destructive transition-smooth"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* download */}
      <div className="flex justify-end">
        <Button onClick={handleDownload} disabled={processing}>
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              处理中...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              下载结果
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
