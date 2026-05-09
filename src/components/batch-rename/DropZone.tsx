import { useState, useCallback, useRef } from 'react'
import { Upload, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileEntry } from '@/types/batch-rename'

interface DropZoneProps {
  onFilesAdded: (files: FileEntry[]) => void
  fileCount: number
}

export function DropZone({ onFilesAdded, fileCount }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const folderRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const entries: FileEntry[] = Array.from(fileList)
      .filter(f => !f.name.startsWith('.'))
      .map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        file,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified,
      }))
    if (entries.length > 0) onFilesAdded(entries)
  }, [onFilesAdded])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleFolderInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    e.target.value = ''
  }, [processFiles])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center transition-smooth cursor-pointer",
        isDragOver
          ? "border-primary bg-accent/50 shadow-glow scale-[1.01]"
          : "border-border hover:border-primary/40 hover:bg-accent/20"
      )}
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFolderInput}
      />
      <input
        ref={folderRef}
        type="file"
        {...{ webkitdirectory: 'true', directory: 'true' } as React.InputHTMLAttributes<HTMLInputElement>}
        className="hidden"
        onChange={handleFolderInput}
      />

      <div className="flex flex-col items-center gap-3">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl transition-smooth",
          isDragOver ? "bg-primary/20 scale-110" : "bg-accent"
        )}>
          <Upload className={cn("h-7 w-7 transition-smooth", isDragOver ? "text-primary" : "text-muted-foreground")} />
        </div>

        {fileCount === 0 ? (
          <>
            <p className="text-sm font-medium text-foreground">
              拖拽文件到此处，或点击选择文件
            </p>
            <div className="flex items-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-smooth"
              >
                选择文件
              </button>
              <span className="text-muted-foreground/30 mx-1">|</span>
              <button
                onClick={() => folderRef.current?.click()}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-smooth inline-flex items-center gap-1"
              >
                <FolderOpen className="h-3 w-3" />
                选择文件夹
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">支持批量添加，可处理 1000+ 文件</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            已加载 <span className="text-primary font-semibold">{fileCount}</span> 个文件
            <span className="text-muted-foreground/60"> · 继续拖拽可追加更多</span>
          </p>
        )}
      </div>
    </div>
  )
}
