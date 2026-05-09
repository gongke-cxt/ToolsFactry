import { useState, useCallback, useRef, useEffect } from 'react'
import { ArrowRightLeft, Copy, Check, AlertCircle, CheckCircle2, Sparkles, Minimize2, FileCode2, Braces, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  type DataFormat,
  type ValidationError,
  formatJson,
  minifyJson,
  validateJson,
  formatXml,
  minifyXml,
  validateXml,
  jsonToXml,
  xmlToJson,
  detectFormat,
} from '@/lib/converter/core'

type ActionType = 'format' | 'minify' | 'json-to-xml' | 'xml-to-json'

interface ActionDef {
  id: ActionType
  label: string
  icon: React.ReactNode
  sourceFormat: DataFormat
  targetFormat: DataFormat
}

const actions: ActionDef[] = [
  { id: 'format', label: '美化', icon: <Sparkles className="h-4 w-4" />, sourceFormat: 'json', targetFormat: 'json' },
  { id: 'minify', label: '压缩', icon: <Minimize2 className="h-4 w-4" />, sourceFormat: 'json', targetFormat: 'json' },
  { id: 'json-to-xml', label: 'JSON → XML', icon: <ArrowRightLeft className="h-4 w-4" />, sourceFormat: 'json', targetFormat: 'xml' },
  { id: 'xml-to-json', label: 'XML → JSON', icon: <ArrowRightLeft className="h-4 w-4" />, sourceFormat: 'xml', targetFormat: 'json' },
]

export function JsonXmlConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [inputFormat, setInputFormat] = useState<DataFormat>('json')
  const [outputFormat, setOutputFormat] = useState<DataFormat>('json')
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!input.trim()) {
      setErrors([])
      setOutput('')
      return
    }
    const detected = detectFormat(input)
    setInputFormat(detected)

    if (detected === 'json') {
      setErrors(validateJson(input))
    } else {
      setErrors(validateXml(input))
    }
  }, [input])

  const handleAction = useCallback((action: ActionDef) => {
    if (!input.trim()) return

    let result
    switch (action.id) {
      case 'format':
        result = inputFormat === 'json' ? formatJson(input) : formatXml(input)
        break
      case 'minify':
        result = inputFormat === 'json' ? minifyJson(input) : minifyXml(input)
        break
      case 'json-to-xml':
        result = jsonToXml(input)
        break
      case 'xml-to-json':
        result = xmlToJson(input)
        break
    }

    if (result) {
      setOutput(result.output)
      setErrors(result.errors)
      setOutputFormat(action.targetFormat)
    }
  }, [input, inputFormat])

  const handleCopy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch {
      inputRef.current?.focus()
    }
  }, [])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setErrors([])
  }, [])

  const handleSample = useCallback(() => {
    const sample = {
      name: "GKDataToolsFactry",
      version: "1.0.0",
      features: ["JSON 转换", "XML 转换", "格式化", "压缩"],
      config: {
        theme: "dark",
        language: "zh-CN",
        nested: {
          deep: true,
          value: 42
        }
      }
    }
    setInput(JSON.stringify(sample))
  }, [])

  const isValid = errors.length === 0
  const hasInput = input.trim().length > 0

  return (
    <div className="animate-fade-in space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient-primary">
          JSON / XML 转换器
        </h1>
        <p className="text-muted-foreground text-sm">
          粘贴、格式化、转换 — 支持 JSON 与 XML 双向转换
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {actions.map((action) => {
          const disabled = !hasInput || (action.id === 'json-to-xml' && inputFormat === 'xml') || (action.id === 'xml-to-json' && inputFormat === 'json')
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => handleAction(action)}
              className={cn(
                "gap-1.5 transition-smooth",
                !disabled && "hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {action.icon}
              {action.label}
            </Button>
          )
        })}

        <div className="w-px h-6 bg-border mx-1" />

        <Button variant="ghost" size="sm" onClick={handlePaste} className="gap-1.5">
          <FileCode2 className="h-4 w-4" />
          粘贴
        </Button>
        <Button variant="ghost" size="sm" onClick={handleSample} className="gap-1.5">
          <FileText className="h-4 w-4" />
          示例
        </Button>
        <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5 text-destructive hover:text-destructive">
          清空
        </Button>
      </div>

      {/* Validation status */}
      {hasInput && (
        <div className={cn(
          "flex items-center gap-2 justify-center text-sm transition-smooth",
          isValid ? "text-green-600 dark:text-green-400" : "text-destructive"
        )}>
          {isValid ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>{inputFormat === 'json' ? 'JSON' : 'XML'} 语法有效</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>{errors[0]?.message}</span>
            </>
          )}
        </div>
      )}

      {/* Dual panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card className="border-border/50 shadow-elegant">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {inputFormat === 'json' ? <Braces className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                输入 ({inputFormat.toUpperCase()})
              </div>
              {hasInput && (
                <span className="text-xs text-muted-foreground">
                  {input.length} 字符
                </span>
              )}
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此粘贴 JSON 或 XML 内容..."
              spellCheck={false}
              className={cn(
                "w-full min-h-[400px] resize-y p-4 bg-transparent text-sm font-mono",
                "placeholder:text-muted-foreground/50 outline-none",
                "focus:ring-2 focus:ring-ring/20 rounded-b-lg",
                !isValid && hasInput && "text-destructive"
              )}
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="border-border/50 shadow-elegant">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {outputFormat === 'json' ? <Braces className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                输出 ({outputFormat.toUpperCase()})
              </div>
              <div className="flex items-center gap-2">
                {output && (
                  <span className="text-xs text-muted-foreground">
                    {output.length} 字符
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!output}
                  className="h-7 px-2 gap-1 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      复制
                    </>
                  )}
                </Button>
              </div>
            </div>
            <pre
              className={cn(
                "w-full min-h-[400px] p-4 text-sm font-mono whitespace-pre-wrap break-all overflow-auto",
                "text-foreground/90 rounded-b-lg",
                !output && "text-muted-foreground/40"
              )}
            >
              {output || '输出结果将显示在这里...'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
