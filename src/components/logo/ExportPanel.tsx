import { Download, Image, FileCode, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LogoVariant } from '@/types/logo'
import { EXPORT_SIZES } from '@/types/logo'
import { exportSvg, exportPng, exportAll } from '@/lib/logo/exporter'
import { useState } from 'react'

interface ExportPanelProps {
  variant: LogoVariant | null
  brandName: string
}

export function ExportPanel({ variant, brandName }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)

  if (!variant) return null

  const safeName = brandName.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_') || 'logo'

  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      await exportAll(variant, safeName)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Large preview */}
      <div className="flex items-center justify-center rounded-xl border border-border bg-white p-8 shadow-elegant">
        <div dangerouslySetInnerHTML={{ __html: variant.svgString }} />
      </div>

      {/* Main download buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => exportSvg(variant, safeName)}
          className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth"
        >
          <FileCode className="h-4 w-4 mr-2" />
          下载 SVG
        </Button>
        <Button
          variant="outline"
          onClick={() => exportPng(variant, 1024, safeName)}
          className="flex-1"
        >
          <Image className="h-4 w-4 mr-2" />
          下载 PNG
        </Button>
      </div>

      {/* Multi-size grid */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground text-center">按尺寸导出 PNG</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXPORT_SIZES.map(({ label, size }) => (
            <button
              key={size}
              onClick={() => exportPng(variant, size, safeName)}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-smooth cursor-pointer"
            >
              <Download className="h-3 w-3 inline mr-1" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Download all as ZIP */}
      <Button
        onClick={handleExportAll}
        disabled={isExporting}
        className="w-full"
        variant="outline"
      >
        <Archive className="h-4 w-4 mr-2" />
        {isExporting ? '正在打包...' : '全部下载 (SVG + 多尺寸 PNG ZIP)'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        生成的 Logo 可用于商业用途，建议下载 SVG 用于印刷和招牌
      </p>
    </div>
  )
}
