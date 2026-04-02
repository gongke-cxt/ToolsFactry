import { useState } from 'react'
import type { ImageEngine } from '@/types/ai-image'
import { ENGINE_OPTIONS } from '@/types/ai-image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Sparkles, Loader2 } from 'lucide-react'

interface PromptPanelProps {
  engine: ImageEngine
  isGenerating: boolean
  onGenerate: (prompt: string) => void
  onDescribe?: (base64: string) => void
}

export function PromptPanel({ engine, isGenerating, onGenerate, onDescribe }: PromptPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [describeFile, setDescribeFile] = useState<string | null>(null)

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

  const currentEngine = ENGINE_OPTIONS.find(e => e.id === engine)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>当前引擎: <strong className="text-foreground">{currentEngine?.label}</strong> - {currentEngine?.desc}</span>
      </div>

      <Textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="描述你想要生成的图片..."
        className="min-h-[120px] text-base"
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
        }}
      />

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
