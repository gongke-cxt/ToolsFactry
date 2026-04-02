import { useState, useCallback } from 'react'
import { Upload, FileUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PdfDropZoneProps {
  multiple?: boolean
  hasFiles?: boolean
  onFiles: (files: File[]) => void
}

export function PdfDropZone({ multiple = true, hasFiles = false, onFiles }: PdfDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const acceptFiles = useCallback(
    (fileList: FileList | File[]) => {
      const pdfs = Array.from(fileList).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
      )
      if (pdfs.length > 0) onFiles(pdfs)
    },
    [onFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      acceptFiles(e.dataTransfer.files)
    },
    [acceptFiles],
  )

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
    input.multiple = multiple
    input.accept = '.pdf,application/pdf'
    input.onchange = () => {
      if (input.files) acceptFiles(input.files)
    }
    input.click()
  }, [multiple, acceptFiles])

  if (hasFiles) {
    return (
      <button
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-smooth cursor-pointer w-full',
          isDragging
            ? 'border-primary bg-accent text-accent-foreground'
            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
        )}
      >
        <FileUp className="h-4 w-4 shrink-0" />
        继续添加 PDF 文件，或拖放至此处
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
        'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-smooth cursor-pointer',
        isDragging
          ? 'border-primary bg-accent text-accent-foreground scale-[1.01]'
          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
        <Upload className="h-7 w-7 text-accent-foreground" />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-foreground">
          {multiple ? '拖放 PDF 文件到这里' : '拖放一个 PDF 文件到这里'}
        </p>
        <p className="text-sm mt-1">或点击选择文件 · 仅支持 PDF 格式</p>
      </div>
    </div>
  )
}
