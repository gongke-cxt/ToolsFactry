import { useState, useCallback } from 'react'
import { Upload, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  hasImages: boolean
  onFilesAdded: (files: File[]) => void
}

export function DropZone({ hasImages, onFilesAdded }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const acceptFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length > 0) onFilesAdded(imageFiles)
  }, [onFilesAdded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    acceptFiles(e.dataTransfer.files)
  }, [acceptFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.onchange = () => {
      if (input.files) acceptFiles(input.files)
    }
    input.click()
  }, [acceptFiles])

  if (hasImages) {
    return (
      <button
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-smooth cursor-pointer w-full",
          isDragging
            ? "border-primary bg-accent text-accent-foreground"
            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
        )}
      >
        <ImagePlus className="h-4 w-4 shrink-0" />
        继续添加图片，或拖放至此处
      </button>
    )
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-16 transition-smooth cursor-pointer",
        isDragging
          ? "border-primary bg-accent text-accent-foreground scale-[1.01]"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
        <Upload className="h-8 w-8 text-accent-foreground" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">拖放图片到这里</p>
        <p className="text-sm mt-1">或点击选择文件 · 支持 JPG, PNG, WebP</p>
        <p className="text-xs mt-2 text-muted-foreground">可一次选择数百张图片</p>
      </div>
    </div>
  )
}
