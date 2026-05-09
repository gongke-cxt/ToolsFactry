import { useEffect, useCallback } from 'react'
import { Download, X } from 'lucide-react'

interface ImagePreviewModalProps {
  imageUrl: string | null
  fileName?: string
  onClose: () => void
}

export function ImagePreviewModal({ imageUrl, fileName, onClose }: ImagePreviewModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (imageUrl) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [imageUrl, handleKeyDown])

  if (!imageUrl) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* 下载按钮 */}
      <a
        href={imageUrl}
        download={fileName || 'image.png'}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <Download className="h-4 w-4" />
        下载
      </a>

      {/* 图片 */}
      <img
        src={imageUrl}
        alt="预览"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}
