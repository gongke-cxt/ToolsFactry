import { useState, useRef, useCallback, useEffect } from 'react'
import { X, GripVertical } from 'lucide-react'
import { formatBytes, getSavingsPercent } from '@/lib/compress'
import type { ImageItem } from '@/lib/compress'

interface CompareSliderProps {
  image: ImageItem
  onClose: () => void
}

export function CompareSlider({ image, onClose }: CompareSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
  }, [])

  const handleMouseDown = useCallback(() => { isDragging.current = true }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)
    const handleUp = () => { isDragging.current = false }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [handleMove])

  const savings = getSavingsPercent(image.originalSize, image.compressedSize)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 glass animate-fade-in p-4">
      <div className="relative w-full max-w-4xl rounded-xl border border-border bg-card shadow-elegant overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-foreground">{image.name}</span>
            <span className="text-muted-foreground">
              {formatBytes(image.originalSize)} → {formatBytes(image.compressedSize)}
            </span>
            <span className="text-primary font-semibold">节省 {savings}%</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Comparison area */}
        <div
          ref={containerRef}
          className="relative select-none cursor-ew-resize"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Compressed (base) */}
          <img
            src={image.compressedUrl!}
            alt="压缩后"
            className="block w-full h-auto max-h-[70vh] object-contain bg-muted"
            draggable={false}
          />

          {/* Original (clipped overlay) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <img
              src={image.originalUrl}
              alt="原图"
              className="block w-full h-auto max-h-[70vh] object-contain bg-muted"
              draggable={false}
            />
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary-foreground/80 pointer-events-none"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-elegant pointer-events-auto cursor-ew-resize">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-3 left-3 rounded-md bg-card/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm glass">
            原图
          </div>
          <div className="absolute top-3 right-3 rounded-md bg-card/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm glass">
            压缩后
          </div>
        </div>
      </div>
    </div>
  )
}
