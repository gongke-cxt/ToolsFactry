import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Download, Trash2, FileSpreadsheet, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { QRStyleConfig, BatchItem } from '@/types'
import Papa from 'papaparse'
import QRCodeStyling from 'qr-code-styling'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface BatchSectionProps {
  style: QRStyleConfig
}

export function BatchSection({ style }: BatchSectionProps) {
  const [items, setItems] = useState<BatchItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const previewRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const qrInstances = useRef<Map<string, QRCodeStyling>>(new Map())

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        const parsed: BatchItem[] = rows.map((row, i) => ({
          id: `batch-${i}-${Date.now()}`,
          label: row['label'] || row['name'] || row['标签'] || row['名称'] || `项目 ${i + 1}`,
          data: row['data'] || row['url'] || row['text'] || row['数据'] || row['链接'] || '',
          type: 'url' as const,
        })).filter(item => item.data.trim() !== '')
        setItems(parsed)
      },
    })
  }

  const renderQR = useCallback((item: BatchItem, container: HTMLDivElement) => {
    const existing = qrInstances.current.get(item.id)
    if (existing) {
      existing.update({ data: item.data })
      return
    }

    const qr = new QRCodeStyling({
      width: 160,
      height: 160,
      data: item.data,
      margin: 5,
      dotsOptions: { color: style.fgColor, type: style.dotType },
      backgroundOptions: { color: style.bgColor },
      cornersSquareOptions: { type: style.cornerSquareType, color: style.fgColor },
      cornersDotOptions: { type: style.cornerDotType, color: style.fgColor },
      ...(style.logoFile ? { image: style.logoFile, imageOptions: { crossOrigin: 'anonymous', margin: 4 } } : {}),
    })

    container.innerHTML = ''
    qr.append(container)
    qrInstances.current.set(item.id, qr)
  }, [style])

  useEffect(() => {
    items.forEach(item => {
      const container = previewRefs.current.get(item.id)
      if (container) renderQR(item, container)
    })
  }, [items, renderQR])

  const downloadAll = async () => {
    if (items.length === 0) return
    setIsGenerating(true)

    try {
      const zip = new JSZip()

      for (const item of items) {
        const qr = new QRCodeStyling({
          width: style.size,
          height: style.size,
          data: item.data,
          margin: style.margin,
          dotsOptions: { color: style.fgColor, type: style.dotType },
          backgroundOptions: { color: style.bgColor },
          cornersSquareOptions: { type: style.cornerSquareType, color: style.fgColor },
          cornersDotOptions: { type: style.cornerDotType, color: style.fgColor },
          ...(style.logoFile ? { image: style.logoFile, imageOptions: { crossOrigin: 'anonymous', margin: 4 } } : {}),
        })

        const blob = await qr.getRawData('png')
        if (blob) {
          const safeName = item.label.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_')
          zip.file(`${safeName}.png`, blob)
        }
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'qrcodes-batch.zip')
    } finally {
      setIsGenerating(false)
    }
  }

  const clearAll = () => {
    setItems([])
    qrInstances.current.clear()
    if (fileRef.current) fileRef.current.value = ''
  }

  const setPreviewRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      previewRefs.current.set(id, el)
      const item = items.find(i => i.id === id)
      if (item) renderQR(item, el)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          上传 CSV 文件
        </Label>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />

        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-smooth cursor-pointer"
        >
          <FileSpreadsheet className="h-8 w-8" />
          <div className="text-center">
            <p className="text-sm font-medium">点击上传 CSV 文件</p>
            <p className="text-xs mt-1">支持列名: data/url/text/链接/数据, label/name/标签/名称</p>
          </div>
        </button>
      </div>

      {/* Actions */}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            共 <span className="font-semibold text-foreground">{items.length}</span> 个二维码
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              清空
            </Button>
            <Button size="sm" onClick={downloadAll} disabled={isGenerating}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              {isGenerating ? (
                <Package className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isGenerating ? '打包中...' : '全部下载 (ZIP)'}
            </Button>
          </div>
        </div>
      )}

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 animate-fade-in"
            >
              <div ref={setPreviewRef(item.id)} className="flex items-center justify-center" />
              <p className="text-xs text-foreground font-medium truncate max-w-full" title={item.label}>
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-full" title={item.data}>
                {item.data}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Upload className="h-10 w-10 opacity-30" />
          <p className="text-sm">上传 CSV 文件开始批量生成</p>
          <p className="text-xs">CSV 示例: label, data</p>
        </div>
      )}
    </div>
  )
}
