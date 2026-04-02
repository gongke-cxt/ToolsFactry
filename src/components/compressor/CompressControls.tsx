import { Zap, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { formatBytes } from '@/lib/compress'

interface CompressControlsProps {
  quality: number
  onQualityChange: (q: number) => void
  format: 'jpeg' | 'webp'
  onFormatChange: (f: 'jpeg' | 'webp') => void
  maxWidth: number
  onMaxWidthChange: (w: number) => void
  imageCount: number
  totalOriginal: number
  totalCompressed: number
  doneCount: number
  isProcessing: boolean
  onCompress: () => void
  onDownloadAll: () => void
  onClear: () => void
}

export function CompressControls({
  quality, onQualityChange,
  format, onFormatChange,
  maxWidth, onMaxWidthChange,
  imageCount, totalOriginal, totalCompressed, doneCount,
  isProcessing, onCompress, onDownloadAll, onClear,
}: CompressControlsProps) {
  const allDone = doneCount === imageCount && imageCount > 0
  const savings = totalOriginal > 0
    ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {imageCount > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
          <div className="text-sm">
            <span className="text-muted-foreground">图片: </span>
            <span className="font-semibold text-foreground">{imageCount} 张</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">原始: </span>
            <span className="font-semibold text-foreground">{formatBytes(totalOriginal)}</span>
          </div>
          {totalCompressed > 0 && (
            <>
              <div className="text-sm">
                <span className="text-muted-foreground">压缩后: </span>
                <span className="font-semibold text-foreground">{formatBytes(totalCompressed)}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">节省: </span>
                <span className="font-semibold text-primary">{savings}%</span>
              </div>
            </>
          )}
          {isProcessing && (
            <div className="text-sm text-muted-foreground ml-auto">
              处理中 {doneCount}/{imageCount}...
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {isProcessing && (
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-primary rounded-full transition-all duration-300"
            style={{ width: `${(doneCount / imageCount) * 100}%` }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5 flex-1 min-w-[180px]">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            质量: {quality}%
          </Label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="w-full accent-primary"
            disabled={isProcessing}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>最小体积</span>
            <span>最高质量</span>
          </div>
        </div>

        <div className="space-y-1.5 w-28">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">格式</Label>
          <Select
            value={format}
            onChange={(e) => onFormatChange(e.target.value as 'jpeg' | 'webp')}
            disabled={isProcessing}
          >
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </Select>
        </div>

        <div className="space-y-1.5 w-32">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">最大宽度</Label>
          <Select
            value={String(maxWidth)}
            onChange={(e) => onMaxWidthChange(Number(e.target.value))}
            disabled={isProcessing}
          >
            <option value="0">不限制</option>
            <option value="1920">1920px</option>
            <option value="1280">1280px</option>
            <option value="800">800px</option>
          </Select>
        </div>

        <div className="flex gap-2 ml-auto">
          {imageCount > 0 && (
            <Button variant="outline" size="sm" onClick={onClear} disabled={isProcessing}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              清空
            </Button>
          )}
          {allDone && (
            <Button size="sm" variant="outline" onClick={onDownloadAll}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              全部下载 ZIP
            </Button>
          )}
          <Button
            size="sm"
            onClick={onCompress}
            disabled={imageCount === 0 || isProcessing}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            {isProcessing ? '压缩中...' : '开始压缩'}
          </Button>
        </div>
      </div>
    </div>
  )
}
