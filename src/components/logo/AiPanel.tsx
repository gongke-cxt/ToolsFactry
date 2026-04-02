import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { LogoConfig, AiProvider } from '@/types/logo'
import { buildLogoPrompt, generateWithAi } from '@/lib/logo/ai'

interface AiPanelProps {
  config: LogoConfig
  onResult: (imageUrl: string) => void
}

const PROVIDERS: { id: AiProvider; label: string; keyHint: string }[] = [
  { id: 'apiyi', label: 'APIYI (Nano Banana 2)', keyHint: 'sk-... (api.apiyi.com)' },
  { id: 'openai', label: 'OpenAI (DALL-E 3)', keyHint: 'sk-... (api.openai.com)' },
]

export function AiPanel({ config, onResult }: AiPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [provider, setProvider] = useState<AiProvider>(
    () => (localStorage.getItem('toolsfactry_ai_provider') as AiProvider) || 'apiyi',
  )
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('toolsfactry_ai_apikey') || '')
  const [refImage, setRefImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError('请先输入 API Key')
      return
    }
    localStorage.setItem('toolsfactry_ai_apikey', apiKey)
    localStorage.setItem('toolsfactry_ai_provider', provider)
    setIsGenerating(true)
    setError(null)

    const prompt = buildLogoPrompt(config)
    const result = await generateWithAi(provider, prompt, apiKey, refImage)

    if (result.success && result.imageUrl) {
      onResult(result.imageUrl)
    } else {
      setError(result.error || '生成失败')
    }
    setIsGenerating(false)
  }

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setRefImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-smooth cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI 增强生成（可选）
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3 animate-fade-in">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">AI 服务商</Label>
            <div className="flex gap-1.5">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setProvider(p.id); setError(null) }}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-smooth cursor-pointer ${
                    provider === p.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">API Key</Label>
            <Input
              type="password"
              placeholder={currentProvider.keyHint}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setError(null) }}
            />
            <p className="text-[10px] text-muted-foreground">密钥仅保存在您的浏览器中</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">参考图片（可选）</Label>
            <div className="flex items-center gap-2">
              {refImage ? (
                <div className="relative">
                  <img src={refImage} alt="参考图" className="h-12 w-12 rounded-md object-cover border border-border" />
                  <button
                    onClick={() => setRefImage(null)}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center cursor-pointer"
                  >×</button>
                </div>
              ) : (
                <label className="flex items-center gap-1 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                  <Upload className="h-3 w-3" />
                  上传参考图
                  <input type="file" accept="image/*" className="hidden" onChange={handleRefUpload} />
                </label>
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !apiKey.trim()}
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
            size="sm"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'AI 生成中...' : `AI 生成 Logo (${currentProvider.label})`}
          </Button>
        </div>
      )}
    </div>
  )
}
