import { Download, Eye, Loader2, AlertCircle } from 'lucide-react'
import { formatBytes, getSavingsPercent } from '@/lib/compress'
import type { ImageItem } from '@/lib/compress'
import { cn } from '@/lib/utils'
import { saveAs } from 'file-saver'

interface ImageGridProps {
  images: ImageItem[]
  onCompare: (image: ImageItem) => void
}

export function ImageGrid({ images, onCompare }: ImageGridProps) {
  const handleDownload = (item: ImageItem) => {
    if (!item.compressedBlob) return
    const ext = item.compressedBlob.type === 'image/webp' ? '.webp' : '.jpg'
    const baseName = item.name.replace(/\.[^.]+$/, '')
    saveAs(item.compressedBlob, `${baseName}-compressed${ext}`)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {images.map((item) => {
        const savings = item.status === 'done'
          ? getSavingsPercent(item.originalSize, item.compressedSize)
          : 0

        return (
          <div
            key={item.id}
            className={cn(
              "group relative flex flex-col rounded-lg border bg-card overflow-hidden transition-smooth",
              item.status === 'done' && "border-border hover:shadow-elegant",
              item.status === 'processing' && "border-primary/30",
              item.status === 'error' && "border-destructive/30",
              item.status === 'pending' && "border-border opacity-75"
            )}
          >
            {/* Thumbnail */}
            <div className="relative aspect-square bg-muted overflow-hidden">
              {item.originalUrl && (
                <img
                  src={item.compressedUrl || item.originalUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}

              {/* Status overlay */}
              {item.status === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              )}
              {item.status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              )}

              {/* Savings badge */}
              {item.status === 'done' && savings > 0 && (
                <div className="absolute top-1.5 right-1.5 rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                  -{savings}%
                </div>
              )}

              {/* Hover actions */}
              {item.status === 'done' && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 opacity-0 group-hover:opacity-100 transition-smooth">
                  <button
                    onClick={() => onCompare(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-accent transition-smooth cursor-pointer"
                    title="对比"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-foreground shadow-md hover:bg-accent transition-smooth cursor-pointer"
                    title="下载"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2 space-y-0.5">
              <p className="text-xs font-medium text-foreground truncate" title={item.name}>
                {item.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatBytes(item.originalSize)}</span>
                {item.status === 'done' && (
                  <>
                    <span className="text-muted-foreground/50">→</span>
                    <span className="text-primary font-medium">{formatBytes(item.compressedSize)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
