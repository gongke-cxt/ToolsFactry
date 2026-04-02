import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropZone } from '@/components/compressor/DropZone'
import { CompressControls } from '@/components/compressor/CompressControls'
import { ImageGrid } from '@/components/compressor/ImageGrid'
import { CompareSlider } from '@/components/compressor/CompareSlider'
import {
  compressImage, processQueue, createImageItem,
  type ImageItem, type CompressOptions,
} from '@/lib/compress'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export function ImageCompressor() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<'jpeg' | 'webp'>('jpeg')
  const [maxWidth, setMaxWidth] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [doneCount, setDoneCount] = useState(0)
  const [compareImage, setCompareImage] = useState<ImageItem | null>(null)

  const handleFilesAdded = useCallback(async (files: File[]) => {
    const newItems = await Promise.all(files.map(createImageItem))
    setImages(prev => [...prev, ...newItems])
  }, [])

  const handleCompress = useCallback(async () => {
    setIsProcessing(true)
    setDoneCount(0)

    const opts: CompressOptions = { quality, format, maxWidth }
    const pending = images.filter(img => img.status !== 'error')

    // Reset all to pending
    setImages(prev => prev.map(img =>
      img.status !== 'error' ? { ...img, status: 'pending' as const, compressedBlob: null, compressedUrl: null, compressedSize: 0 } : img
    ))

    await processQueue(
      pending,
      async (item) => {
        setImages(prev => prev.map(img =>
          img.id === item.id ? { ...img, status: 'processing' as const } : img
        ))

        try {
          const result = await compressImage(item.file, opts)
          setImages(prev => prev.map(img =>
            img.id === item.id
              ? { ...img, status: 'done' as const, compressedBlob: result.blob, compressedUrl: result.url, compressedSize: result.blob.size }
              : img
          ))
        } catch {
          setImages(prev => prev.map(img =>
            img.id === item.id ? { ...img, status: 'error' as const } : img
          ))
        }
      },
      4,
      (done) => setDoneCount(done),
    )

    setIsProcessing(false)
  }, [images, quality, format, maxWidth])

  const handleDownloadAll = useCallback(async () => {
    const done = images.filter(img => img.status === 'done' && img.compressedBlob)
    if (done.length === 0) return

    const zip = new JSZip()
    const ext = format === 'webp' ? '.webp' : '.jpg'

    for (const item of done) {
      const baseName = item.name.replace(/\.[^.]+$/, '')
      zip.file(`${baseName}${ext}`, item.compressedBlob!)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'compressed-images.zip')
  }, [images, format])

  const handleClear = useCallback(() => {
    images.forEach(img => {
      if (img.originalUrl) URL.revokeObjectURL(img.originalUrl)
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
    })
    setImages([])
    setDoneCount(0)
  }, [images])

  const totals = useMemo(() => {
    let totalOriginal = 0
    let totalCompressed = 0
    for (const img of images) {
      totalOriginal += img.originalSize
      if (img.status === 'done') totalCompressed += img.compressedSize
    }
    return { totalOriginal, totalCompressed }
  }, [images])

  const actualDoneCount = images.filter(i => i.status === 'done').length

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">图片压缩</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DropZone hasImages={images.length > 0} onFilesAdded={handleFilesAdded} />

          {images.length > 0 && (
            <CompressControls
              quality={quality}
              onQualityChange={setQuality}
              format={format}
              onFormatChange={setFormat}
              maxWidth={maxWidth}
              onMaxWidthChange={setMaxWidth}
              imageCount={images.length}
              totalOriginal={totals.totalOriginal}
              totalCompressed={totals.totalCompressed}
              doneCount={isProcessing ? doneCount : actualDoneCount}
              isProcessing={isProcessing}
              onCompress={handleCompress}
              onDownloadAll={handleDownloadAll}
              onClear={handleClear}
            />
          )}
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card className="shadow-elegant">
          <CardContent className="p-4">
            <ImageGrid images={images} onCompare={setCompareImage} />
          </CardContent>
        </Card>
      )}

      {compareImage && compareImage.compressedUrl && (
        <CompareSlider image={compareImage} onClose={() => setCompareImage(null)} />
      )}
    </div>
  )
}
