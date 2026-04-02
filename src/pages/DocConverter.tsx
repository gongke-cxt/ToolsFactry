import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ArrowRightLeft,
  Link,
  FolderTree,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConvertDirection, DocNode, UrlValidation } from '@/types/doc-converter'
import {
  validateDocUrl,
  detectDirection,
} from '@/types/doc-converter'
import {
  analyzeSource,
  runConversion,
  countDocs,
  countCompleted,
  getDirectionLabel,
} from '@/lib/doc-converter'

/* ------------------------------------------------------------------ */
/*  DocTreeRow - 递归渲染单个文档节点                                    */
/* ------------------------------------------------------------------ */

function DocTreeRow({
  node,
  depth,
}: {
  node: DocNode
  depth: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0

  const statusIcon = {
    pending: <FileText className="h-3.5 w-3.5 text-muted-foreground" />,
    converting: <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />,
    done: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
    error: <AlertCircle className="h-3.5 w-3.5 text-destructive" />,
  }[node.status]

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-smooth',
          node.status === 'converting' && 'bg-accent/50',
          node.status === 'done' && 'text-muted-foreground',
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5" />
        )}
        {statusIcon}
        <span className="truncate flex-1">{node.title}</span>
        {node.status === 'converting' && (
          <span className="text-xs text-primary font-medium tabular-nums">
            {node.progress}%
          </span>
        )}
        {node.status === 'done' && (
          <span className="text-xs text-green-500">完成</span>
        )}
        {node.status === 'error' && (
          <span className="text-xs text-destructive">{node.error}</span>
        )}
      </div>
      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <DocTreeRow key={child.id} node={child} depth={depth + 1} />
        ))}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  ProgressBar - 总体进度条                                            */
/* ------------------------------------------------------------------ */

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  if (status === 'idle' || status === 'analyzing') return null
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {status === 'converting'
            ? '正在转换...'
            : status === 'done'
              ? '转换完成'
              : '准备中...'}
        </span>
        <span className="font-medium tabular-nums">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            status === 'done' ? 'bg-green-500' : 'bg-gradient-primary',
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  UrlInputField - 带验证的 URL 输入                                   */
/* ------------------------------------------------------------------ */

function UrlInputField({
  label,
  placeholder,
  value,
  onChange,
  validation,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  validation: UrlValidation
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'pl-10 h-11',
            validation.valid && 'border-green-500/50 focus-visible:ring-green-500/30',
            validation.error && value && 'border-destructive/50 focus-visible:ring-destructive/30',
          )}
        />
      </div>
      {value && !validation.valid && validation.error && (
        <p className="text-xs text-destructive">{validation.error}</p>
      )}
      {validation.valid && validation.platform && (
        <p className="text-xs text-green-500">
          已识别为{validation.platform === 'yuque' ? '语雀' : '飞书'}文档
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  DocConverter - 主页面                                              */
/* ------------------------------------------------------------------ */

export function DocConverter() {
  const [sourceUrl, setSourceUrl] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [includeChildren, setIncludeChildren] = useState(true)

  const [status, setStatus] = useState<
    'idle' | 'analyzing' | 'converting' | 'done' | 'error'
  >('idle')
  const [direction, setDirection] = useState<ConvertDirection | null>(null)
  const [sourceTitle, setSourceTitle] = useState('')
  const [docTree, setDocTree] = useState<DocNode[]>([])
  const [progress, setProgress] = useState(0)
  const [totalDocs, setTotalDocs] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const sourceValidation = validateDocUrl(sourceUrl)
  const targetValidation = validateDocUrl(targetUrl)
  const canStart =
    sourceValidation.valid &&
    targetValidation.valid &&
    status !== 'analyzing' &&
    status !== 'converting'

  /** 交换源和目标 */
  const handleSwap = useCallback(() => {
    setSourceUrl(targetUrl)
    setTargetUrl(sourceUrl)
  }, [sourceUrl, targetUrl])

  /** 开始转换 */
  const handleStart = useCallback(async () => {
    const dir = detectDirection(sourceUrl, targetUrl)
    if (!dir) {
      setErrorMsg('源文档和目标文档必须来自不同平台')
      setStatus('error')
      return
    }

    setDirection(dir)
    setStatus('analyzing')
    setErrorMsg('')
    setDocTree([])
    setProgress(0)

    try {
      const result = await analyzeSource(sourceUrl, dir, includeChildren)
      setSourceTitle(result.title)
      setDocTree(result.docTree)
      setTotalDocs(countDocs(result.docTree))

      setStatus('converting')

      await runConversion(result.docTree, dir, (_id, _p) => {
        // 重新计算整体进度
        setDocTree([...result.docTree])
        const completed = countCompleted(result.docTree)
        const total = countDocs(result.docTree)
        setProgress(total > 0 ? (completed / total) * 100 : 0)
      })

      // 最终刷新
      setDocTree([...result.docTree])
      setProgress(100)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '转换过程发生未知错误')
      setStatus('error')
    }
  }, [sourceUrl, targetUrl, includeChildren])

  /** 重置 */
  const handleReset = useCallback(() => {
    setStatus('idle')
    setDirection(null)
    setSourceTitle('')
    setDocTree([])
    setProgress(0)
    setTotalDocs(0)
    setErrorMsg('')
  }, [])

  const completedDocs = countCompleted(docTree)

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary mb-2">
          <ArrowRightLeft className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">语雀 & 飞书文档互转</h1>
        <p className="text-sm text-muted-foreground">
          粘贴源文档和目标文档链接，一键转换格式并同步子文档
        </p>
      </div>

      {/* 输入区 */}
      <Card className="shadow-elegant">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">文档地址</CardTitle>
          <CardDescription>
            分别输入源文档和目标文档的链接，系统会自动检测平台和转换方向
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UrlInputField
            label="源文档地址"
            placeholder="粘贴语雀或飞书文档链接..."
            value={sourceUrl}
            onChange={setSourceUrl}
            validation={sourceValidation}
          />

          {/* 交换按钮 */}
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="rounded-full h-8 w-8"
              title="交换源和目标"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </Button>
          </div>

          <UrlInputField
            label="目标文档地址"
            placeholder="粘贴目标平台的文档链接..."
            value={targetUrl}
            onChange={setTargetUrl}
            validation={targetValidation}
          />

          {/* 选项 */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-children"
                checked={includeChildren}
                onCheckedChange={(v) => setIncludeChildren(!!v)}
              />
              <label
                htmlFor="include-children"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                包含子文档一起转换
              </label>
            </div>
            {direction && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                {getDirectionLabel(direction)}
              </span>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-1">
            {status === 'done' || status === 'error' ? (
              <Button
                onClick={handleReset}
                className="flex-1 h-11"
                variant="outline"
              >
                重新开始
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="flex-1 h-11 bg-gradient-primary text-sm font-medium"
                disabled={!canStart}
              >
                {status === 'analyzing' && (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    正在解析文档...
                  </>
                )}
                {status === 'converting' && (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    正在转换...
                  </>
                )}
                {status === 'idle' && '开始转换'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 进度和文档树 */}
      {(status === 'analyzing' || status === 'converting' || status === 'done' || status === 'error') && (
        <Card className="shadow-elegant">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">
                  {status === 'analyzing' ? '解析文档结构...' : '文档转换'}
                </CardTitle>
              </div>
              {totalDocs > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {completedDocs} / {totalDocs} 篇文档
                </span>
              )}
            </div>
            {sourceTitle && (
              <CardDescription className="truncate">{sourceTitle}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 总进度条 */}
            <ProgressBar progress={progress} status={status} />

            {/* 文档树 */}
            {docTree.length > 0 && (
              <div className="border rounded-lg p-2 max-h-80 overflow-y-auto space-y-0.5 bg-muted/30">
                {docTree.map((node) => (
                  <DocTreeRow key={node.id} node={node} depth={0} />
                ))}
              </div>
            )}

            {/* 完成提示 */}
            {status === 'done' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>
                  转换完成！共 {totalDocs} 篇文档已成功从
                  {direction === 'yuque2feishu' ? '语雀' : '飞书'}
                  转换到
                  {direction === 'yuque2feishu' ? '飞书' : '语雀'}
                  。
                </span>
              </div>
            )}

            {/* 错误提示 */}
            {status === 'error' && errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      {status === 'idle' && (
        <Card className="shadow-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <p className="text-sm font-medium">粘贴源文档</p>
                <p className="text-xs text-muted-foreground">
                  输入语雀或飞书文档链接
                </p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <p className="text-sm font-medium">指定目标</p>
                <p className="text-xs text-muted-foreground">
                  粘贴目标平台的文档地址
                </p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-muted/50 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">
                  3
                </div>
                <p className="text-sm font-medium">开始转换</p>
                <p className="text-xs text-muted-foreground">
                  自动识别方向，实时查看进度
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
