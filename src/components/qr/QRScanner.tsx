import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Copy, Check, ScanLine, Trash2, Link, FileText, User, Wifi, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// jsQR has no type definitions, declare module
declare module 'jsqr' {
  interface QRCode {
    binaryData: number[]
    data: string
    version: number
    location: {
      topLeftCorner: { x: number; y: number }
      topRightCorner: { x: number; y: number }
      bottomLeftCorner: { x: number; y: number }
      bottomRightCorner: { x: number; y: number }
    }
  }
  function jsQR(data: Uint8ClampedArray, width: number, height: number): QRCode | null
  export default jsQR
}

type ScanStatus = 'idle' | 'loading' | 'done' | 'error'
type ResultType = 'url' | 'vcard' | 'wifi' | 'text'

interface ScanResult {
  type: ResultType
  raw: string
  display: string
  detail?: Record<string, string>
}

function detectResultType(data: string): { type: ResultType; detail?: Record<string, string> } {
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return { type: 'url' }
  }
  if (data.startsWith('BEGIN:VCARD')) {
    const detail: Record<string, string> = {}
    const name = data.match(/FN[^:]*:(.+)/i)
    const phone = data.match(/TEL[^:]*:(.+)/i)
    const email = data.match(/EMAIL[^:]*:(.+)/i)
    const org = data.match(/ORG:(.+)/i)
    if (name) detail['姓名'] = name[1]
    if (phone) detail['电话'] = phone[1]
    if (email) detail['邮箱'] = email[1]
    if (org) detail['公司'] = org[1]
    return { type: 'vcard', detail }
  }
  if (data.startsWith('WIFI:')) {
    const detail: Record<string, string> = {}
    const ssid = data.match(/S:([^;]+)/i)
    const pass = data.match(/P:([^;]+)/i)
    const enc = data.match(/T:([^;]+)/i)
    if (ssid) detail['网络名'] = ssid[1]
    if (pass) detail['密码'] = pass[1]
    if (enc) detail['加密'] = enc[1]
    return { type: 'wifi', detail }
  }
  return { type: 'text' }
}

const typeIcons: Record<ResultType, React.ReactNode> = {
  url: <Link className="h-5 w-5 text-blue-500" />,
  vcard: <User className="h-5 w-5 text-green-500" />,
  wifi: <Wifi className="h-5 w-5 text-amber-500" />,
  text: <FileText className="h-5 w-5 text-muted-foreground" />,
}

const typeLabels: Record<ResultType, string> = {
  url: 'URL 链接',
  vcard: 'vCard 联系人',
  wifi: 'WiFi 凭证',
  text: '纯文本',
}

export function QRScanner() {
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const decodeImage = useCallback(async (file: File | Blob) => {
    setStatus('loading')
    setError(null)
    setResult(null)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = url
      })

      const maxDim = 2048
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = canvasRef.current!
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const imageData = ctx.getImageData(0, 0, width, height)

      const jsQR = (await import('jsqr')).default
      const code = jsQR(imageData.data, width, height)

      if (code) {
        const { type, detail } = detectResultType(code.data)
        setResult({
          type,
          raw: code.data,
          display: detail ? Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join('\n') : code.data,
          detail,
        })
        setStatus('done')
      } else {
        setError('未识别到二维码，请确保图片中包含清晰的二维码')
        setStatus('error')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '解码失败')
      setStatus('error')
    }
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片格式的文件')
      setStatus('error')
      return
    }
    decodeImage(file)
  }, [decodeImage])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const blob = items[i].getAsFile()
        if (blob) {
          decodeImage(blob)
          return
        }
      }
    }
  }, [decodeImage])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const handleCopy = useCallback(async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  const handleClear = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [previewUrl])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Drop zone */}
      <Card className="shadow-elegant">
        <CardContent
          className={cn(
            'relative flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed transition-smooth cursor-pointer min-h-[200px]',
            isDragOver
              ? 'border-primary bg-primary/5'
              : status === 'idle'
                ? 'border-border hover:border-primary/50 hover:bg-accent/30'
                : 'border-border',
          )}
          onClick={() => status !== 'loading' && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />

          {status === 'loading' ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">正在识别二维码...</p>
            </div>
          ) : status === 'idle' ? (
            <div className="text-center space-y-3">
              <ScanLine className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  拖拽图片到此处，或点击选择文件
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  也支持 Ctrl+V 粘贴剪贴板中的二维码图片
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="shadow-elegant border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-1" />
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview + Result */}
      {(previewUrl || result) && status !== 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Preview */}
          {previewUrl && (
            <div className="lg:col-span-5">
              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">扫码图片</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={previewUrl}
                      alt="上传的二维码"
                      className="w-full object-contain max-h-[320px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={cn(previewUrl ? 'lg:col-span-7' : 'lg:col-span-12')}>
              <Card className="shadow-elegant border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {typeIcons[result.type]}
                      <CardTitle className="text-sm">{typeLabels[result.type]}</CardTitle>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        已识别
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        {copied ? '已复制' : '复制'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleClear}>
                        <Upload className="h-4 w-4 mr-1" />
                        重新识别
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.detail ? (
                    <div className="space-y-2">
                      {Object.entries(result.detail).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-3 p-2.5 rounded-md bg-muted/30">
                          <span className="text-xs font-medium text-muted-foreground w-14 shrink-0 pt-0.5">{key}</span>
                          <span className="text-sm text-foreground break-all">{value}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border mt-3">
                        <p className="text-[11px] text-muted-foreground font-mono break-all">{result.raw}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {result.type === 'url' ? (
                        <a
                          href={result.raw}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {result.raw}
                        </a>
                      ) : (
                        <p className="text-sm text-foreground whitespace-pre-wrap break-all font-mono">
                          {result.raw}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* hint */}
      <canvas ref={canvasRef} className="hidden" />

      {status === 'idle' && (
        <Card className="shadow-elegant">
          <CardHeader><CardTitle className="text-sm">使用说明</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">1</div>
                <p className="text-sm font-medium">上传图片</p>
                <p className="text-xs text-muted-foreground">拖拽或点击上传含二维码的截图/照片</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">2</div>
                <p className="text-sm font-medium">自动识别</p>
                <p className="text-xs text-muted-foreground">Canvas 解析 QR 码内容，支持 URL/vCard/WiFi/文本</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">3</div>
                <p className="text-sm font-medium">复制使用</p>
                <p className="text-xs text-muted-foreground">一键复制识别结果，URL 可直接点击跳转</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
