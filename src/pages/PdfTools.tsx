import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MergeView } from '@/components/pdf/MergeView'
import { EditView } from '@/components/pdf/EditView'
import type { ToolMode } from '@/types/pdf'
import { Merge, Scissors } from 'lucide-react'

const TABS: { mode: ToolMode; label: string; desc: string; icon: typeof Merge }[] = [
  { mode: 'merge', label: '合并 PDF', desc: '将多个 PDF 按顺序合并为一个文件', icon: Merge },
  { mode: 'edit', label: '拆分 & 编辑', desc: '拆分页面、删除页面、重排顺序、添加书签', icon: Scissors },
]

export function PdfTools() {
  const [mode, setMode] = useState<ToolMode>('merge')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">PDF 工具</h1>
        <p className="text-muted-foreground mt-1">
          合并、拆分、重排页面 — 全部在浏览器中完成，无需上传到服务器
        </p>
      </div>

      {/* tab bar */}
      <div className="flex gap-2">
        {TABS.map(({ mode: m, label, desc, icon: Icon }) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-smooth flex-1',
              mode === m
                ? 'border-primary bg-accent text-accent-foreground shadow-sm'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-left">
              <span className="block">{label}</span>
              <span className="block text-xs font-normal text-muted-foreground mt-0.5">{desc}</span>
            </span>
          </button>
        ))}
      </div>

      <Card className="shadow-elegant">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {mode === 'merge' ? '合并多个 PDF 文件' : '拆分或编辑 PDF 页面'}
          </CardTitle>
          <CardDescription>
            {mode === 'merge'
              ? '上传多个 PDF，拖动调整顺序，一键合并下载'
              : '上传一个 PDF，选择、删除、重排页面，按范围提取'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'merge' ? <MergeView /> : <EditView />}
        </CardContent>
      </Card>
    </div>
  )
}
