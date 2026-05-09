import { useState, useRef, useCallback } from 'react'
import type { ImageEngine } from '@/types/ai-image'
import { ENGINE_OPTIONS } from '@/types/ai-image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Sparkles, Loader2, ImagePlus, X } from 'lucide-react'

interface PromptPanelProps {
  engine: ImageEngine
  isGenerating: boolean
  referenceImage: string | null
  onReferenceChange: (image: string | null) => void
  onGenerate: (prompt: string) => void
  onDescribe?: (base64: string) => void
}

export function PromptPanel({ engine, isGenerating, referenceImage, onReferenceChange, onGenerate, onDescribe }: PromptPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [describeFile, setDescribeFile] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!prompt.trim() && !describeFile) return
    if (engine === 'midjourney' && describeFile) {
      onDescribe?.(describeFile)
    } else {
      onGenerate(prompt.trim())
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setDescribeFile(result)
    }
    reader.readAsDataURL(file)
  }

  // 参考图处理（拖拽/粘贴）
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      onReferenceChange(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [onReferenceChange])

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
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const currentEngine = ENGINE_OPTIONS.find(e => e.id === engine)
  const showRefImage = engine === 'nanobanana' || engine === 'doubao'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>当前引擎: <strong className="text-foreground">{currentEngine?.label}</strong> - {currentEngine?.desc}</span>
      </div>

      {/* 拖拽参考图区域 */}
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
              <span className="text-sm font-medium">松开以添加参考图</span>
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

        {/* 参考图预览 */}
        {showRefImage && referenceImage && (
          <div className="px-3 pb-3 flex items-start gap-2 border-t border-border/50 pt-3 mx-3">
            <div className="relative inline-block shrink-0">
              <img src={referenceImage} alt="参考图" className="h-16 rounded-md border object-cover" />
              <button
                onClick={() => onReferenceChange(null)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center hover:bg-destructive/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground pt-1">
              参考图已添加，拖拽新图片可替换
            </div>
          </div>
        )}

        {/* 底部工具栏 */}
        {showRefImage && !referenceImage && (
          <div className="px-3 pb-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) processFile(file)
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              添加参考图
            </button>
          </div>
        )}
      </div>

      {/* Midjourney Describe: 图片上传 */}
      {engine === 'midjourney' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">图生文 (Describe) - 上传图片获取描述</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-smooth"
          />
          {describeFile && (
            <div className="relative inline-block">
              <img src={describeFile} alt="上传预览" className="h-20 rounded-md border" />
              <button
                onClick={() => setDescribeFile(null)}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
              >
                x
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isGenerating || (!prompt.trim() && !describeFile)}
          className={cn('gap-2', isGenerating && 'animate-pulse')}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {describeFile && engine === 'midjourney' ? '图生文' : '生成图片'}
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">Ctrl+Enter 快捷提交</span>
      </div>
    </div>
  )
}
