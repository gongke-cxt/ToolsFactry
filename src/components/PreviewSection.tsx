import { Download, Image, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQRCode } from '@/hooks/useQRCode'
import type { QRStyleConfig } from '@/types'
import QRCodeStyling from 'qr-code-styling'
import { useCallback } from 'react'

interface PreviewSectionProps {
  data: string
  style: QRStyleConfig
  dataLabel: string
}

export function PreviewSection({ data, style, dataLabel }: PreviewSectionProps) {
  const { containerRef, download } = useQRCode({ data, style })

  const downloadAtSize = useCallback(async (size: number) => {
    if (!data) return
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      data,
      margin: style.margin,
      dotsOptions: { color: style.fgColor, type: style.dotType },
      backgroundOptions: { color: style.bgColor },
      cornersSquareOptions: { type: style.cornerSquareType, color: style.fgColor },
      cornersDotOptions: { type: style.cornerDotType, color: style.fgColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 6 },
      ...(style.logoFile ? { image: style.logoFile } : {}),
    })
    await qr.download({ name: `qrcode-${size}`, extension: 'png' })
  }, [data, style])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* QR Code Preview */}
      <div className="relative">
        <div
          className="absolute -inset-4 rounded-2xl opacity-40 blur-xl transition-smooth"
          style={{ backgroundColor: style.fgColor + '18' }}
        />
        <div
          ref={containerRef}
          className="relative rounded-xl border border-border bg-card p-4 shadow-elegant animate-scale-in flex items-center justify-center"
          style={{
            minWidth: Math.min(style.size + 32, 380),
            minHeight: Math.min(style.size + 32, 380),
          }}
        />
      </div>

      {/* Data info */}
      <div className="w-full max-w-sm text-center">
        <p className="text-xs text-muted-foreground mb-1">编码内容</p>
        <p className="text-sm text-foreground font-medium truncate px-2" title={data}>
          {data || '等待输入数据...'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{dataLabel}</p>
      </div>

      {/* Download Buttons */}
      <div className="flex gap-3 w-full max-w-sm">
        <Button
          onClick={() => download('png')}
          className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth"
          disabled={!data}
        >
          <Image className="h-4 w-4 mr-2" />
          下载 PNG
        </Button>
        <Button
          onClick={() => download('svg')}
          variant="outline"
          className="flex-1"
          disabled={!data}
        >
          <FileCode className="h-4 w-4 mr-2" />
          下载 SVG
        </Button>
      </div>

      {/* Multi-size download */}
      <div className="space-y-2 w-full max-w-sm">
        <p className="text-xs text-muted-foreground text-center">高分辨率导出</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[256, 512, 1024, 2048].map(s => (
            <button
              key={s}
              onClick={() => downloadAtSize(s)}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-smooth cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!data}
            >
              <Download className="h-3 w-3 inline mr-1" />
              {s}x{s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
