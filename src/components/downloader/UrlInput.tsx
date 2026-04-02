import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link, Search, ClipboardPaste, Youtube, Twitter } from 'lucide-react'
import type { Platform } from '@/types/downloader'
import { detectPlatform, isValidUrl } from '@/lib/downloader'

interface UrlInputProps {
  onAnalyze: (url: string) => void
  isAnalyzing: boolean
}

function PlatformIcon({ platform }: { platform: Platform }) {
  switch (platform) {
    case 'youtube':
      return <Youtube className="h-4 w-4 text-red-500" />
    case 'twitter':
      return <Twitter className="h-4 w-4 text-sky-400" />
    default:
      return <Link className="h-4 w-4 text-muted-foreground" />
  }
}

export function UrlInput({ onAnalyze, isAnalyzing }: UrlInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const platform = url ? detectPlatform(url) : 'unknown'

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      setError('')
    } catch {
      setError('无法访问剪贴板')
    }
  }, [])

  const handleAnalyze = useCallback(() => {
    if (!url.trim()) {
      setError('请输入视频链接')
      return
    }
    if (!isValidUrl(url.trim())) {
      setError('请输入有效的 URL')
      return
    }
    setError('')
    onAnalyze(url.trim())
  }, [url, onAnalyze])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze()
  }, [handleAnalyze])

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {url ? <PlatformIcon platform={platform} /> : <Link className="h-4 w-4 text-muted-foreground" />}
          </div>
          <Input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError('') }}
            onKeyDown={handleKeyDown}
            placeholder="粘贴视频链接 - 支持 YouTube、Twitter、Bilibili 等..."
            className="pl-10 pr-4 h-12 text-sm"
            disabled={isAnalyzing}
          />
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={handlePaste}
          className="h-12 px-3 shrink-0"
          disabled={isAnalyzing}
        >
          <ClipboardPaste className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">粘贴</span>
        </Button>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="h-12 px-5 bg-gradient-primary shrink-0"
        >
          {isAnalyzing ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-1.5" />
          )}
          <span>{isAnalyzing ? '分析中...' : '解析'}</span>
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive animate-fade-in">{error}</p>
      )}
    </div>
  )
}
