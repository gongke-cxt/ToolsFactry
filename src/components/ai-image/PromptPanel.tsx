import { useState, useRef, useCallback } from 'react'
import type { ImageEngine } from '@/types/ai-image'
import { ENGINE_OPTIONS } from '@/types/ai-image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Sparkles, Loader2, ImagePlus, X, FileSearch } from 'lucide-react'

interface PromptPanelProps {
  engine: ImageEngine
  isGenerating: boolean
  referenceImages: string[]
  onReferenceImagesChange: (images: string[]) => void
  onGenerate: (prompt: string) => void
  onDescribe?: (base64: string) => void
}

export function PromptPanel({ engine, isGenerating, referenceImages, onReferenceImagesChange, onGenerate, onDescribe }: PromptPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!prompt.trim() && referenceImages.length === 0) return
    // Midjourney: 有参考图 → 图生文 (Describe)，无参考图 → 文生图 (Imagine)
    if (engine === 'midjourney' && referenceImages.length > 0) {
      onDescribe?.(referenceImages[0])
    } else {
      onGenerate(prompt.trim())
    }
  }

  const addImage = useCallback((dataUrl: string) => {
    onReferenceImagesChange([...referenceImages, dataUrl])
  }, [referenceImages, onReferenceImagesChange])

  const removeImage = useCallback((index: number) => {
    onReferenceImagesChange(referenceImages.filter((_, i) => i !== index))
  }, [referenceImages, onReferenceImagesChange])

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      addImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [addImage])

  // 重置并触发 file input（解决重复选同一文件不触发 onChange 的问题）
  const triggerFileInput = () => {
    const input = fileInputRef.current
    if (input) {
      input.value = ''
      input.click()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(f => processFile(f))
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    files.forEach(f => processFile(f))
  }

  const currentEngine = ENGINE_OPTIONS.find(e => e.id === engine)
  const showRefImage = engine === 'nanobanana' || engine === 'midjourney'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>当前引擎: <strong className="text-foreground">{currentEngine?.label}</strong> - {currentEngine?.desc}</span>
      </div>

      {/* 隐藏的 file input，始终渲染以保持 ref 有效 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 拖拽区域（所有引擎通用） */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 rounded-lg pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-primary">
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium">松开以添加图片</span>
            </div>
          </div>
        )}

        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片..."
          className="min-h-[120px] text-base border-0 bg-transparent focus-visible:ring-0 resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
          }}
        />

        {/* 已添加图片预览 */}
        {showRefImage && referenceImages.length > 0 && (
          <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-3 mx-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImagePlus className="h-3.5 w-3.5" />
              {engine === 'midjourney' ? 'Describe 图片' : '参考图'} ({referenceImages.length}) — 拖入/点击添加更多
            </div>
            <div className="flex flex-wrap gap-2">
              {referenceImages.map((img, i) => (
                <div key={i} className="relative inline-block shrink-0">
                  <img src={img} alt={`图片 ${i + 1}`} className="h-16 w-16 rounded-md border object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center hover:bg-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={triggerFileInput}
                className="h-16 w-16 rounded-md border border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors text-muted-foreground"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* 底部工具栏：无图片时显示添加按钮 */}
        {showRefImage && referenceImages.length === 0 && (
          <div className="px-3 pb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {engine === 'midjourney' ? '选择图片 (Describe 图生文)' : '添加参考图'}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isGenerating || (!prompt.trim() && referenceImages.length === 0)}
          className={cn('gap-2', isGenerating && 'animate-pulse')}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              {engine === 'midjourney' && referenceImages.length > 0 ? (
                <FileSearch className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {engine === 'midjourney' && referenceImages.length > 0
                ? '图生文 (Describe)'
                : referenceImages.length > 0
                  ? '图生图'
                  : '生成图片'}
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">Ctrl+Enter 快捷提交</span>
      </div>
    </div>
  )
}
