import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Files } from 'lucide-react'
import { DropZone } from '@/components/batch-rename/DropZone'
import { RulesPanel } from '@/components/batch-rename/RulesPanel'
import { FilePreviewList } from '@/components/batch-rename/FilePreviewList'
import { ActionBar } from '@/components/batch-rename/ActionBar'
import { generatePreviews } from '@/lib/batch-rename/core'
import {
  createDefaultRule,
  type FileEntry,
  type RenameMode,
  type RenameRule,
  type HistorySnapshot,
} from '@/types/batch-rename'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

function initRules(): Record<RenameMode, RenameRule> {
  const modes: RenameMode[] = ['prefix', 'suffix', 'extension', 'sequence', 'find-replace', 'regex']
  return Object.fromEntries(modes.map(m => [m, createDefaultRule(m)])) as Record<RenameMode, RenameRule>
}

export function BatchRename() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [rules, setRules] = useState<Record<RenameMode, RenameRule>>(initRules)
  const [activeMode, setActiveMode] = useState<RenameMode>('prefix')
  const [history, setHistory] = useState<HistorySnapshot[]>([])
  const [isApplying, setIsApplying] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const activeRules = useMemo(() => {
    const rule = rules[activeMode]
    const hasContent =
      (rule.mode === 'prefix' && rule.prefix) ||
      (rule.mode === 'suffix' && rule.suffix) ||
      (rule.mode === 'extension' && rule.newExtension) ||
      (rule.mode === 'sequence') ||
      (rule.mode === 'find-replace' && rule.findText) ||
      (rule.mode === 'regex' && rule.regexPattern)
    return hasContent ? [rule] : []
  }, [rules, activeMode])

  const previews = useMemo(
    () => generatePreviews(files, activeRules),
    [files, activeRules]
  )

  const changedCount = previews.filter(p => p.originalName !== p.newName).length
  const conflictCount = previews.filter(p => p.hasConflict).length

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleFilesAdded = useCallback((newFiles: FileEntry[]) => {
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleRuleUpdate = useCallback((mode: RenameMode, patch: Partial<RenameRule>) => {
    setRules(prev => ({
      ...prev,
      [mode]: { ...prev[mode], ...patch },
    }))
  }, [])

  const handleApply = useCallback(async () => {
    if (changedCount === 0 || conflictCount > 0) return

    setIsApplying(true)
    try {
      // Push current state to undo history
      setHistory(prev => [...prev, { rules: { ...rules }, appliedAt: Date.now() }])

      const zip = new JSZip()
      for (let i = 0; i < files.length; i++) {
        const preview = previews[i]
        const fileEntry = files[i]
        zip.file(preview.newName, fileEntry.file, {
          date: new Date(fileEntry.lastModified),
        })
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, 'renamed-files.zip')
      showToast(`已打包 ${changedCount} 个重命名文件`)
    } catch (err) {
      showToast('打包失败，请重试', 'error')
      // Rollback history on error
      setHistory(prev => prev.slice(0, -1))
    } finally {
      setIsApplying(false)
    }
  }, [files, previews, rules, changedCount, conflictCount, showToast])

  const handleUndo = useCallback(async () => {
    if (history.length === 0) return

    const last = history[history.length - 1]
    setRules(last.rules)

    // Download original-named files
    setIsApplying(true)
    try {
      const zip = new JSZip()
      for (const fileEntry of files) {
        zip.file(fileEntry.name, fileEntry.file, {
          date: new Date(fileEntry.lastModified),
        })
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, 'original-files.zip')
      setHistory(prev => prev.slice(0, -1))
      showToast('已撤销，下载原始文件名版本')
    } catch {
      showToast('撤销失败', 'error')
    } finally {
      setIsApplying(false)
    }
  }, [history, files, showToast])

  const handleClear = useCallback(() => {
    setFiles([])
    setRules(initRules())
    setHistory([])
  }, [])

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-elegant animate-slide-in-right ${
          toast.type === 'success'
            ? 'bg-success text-success-foreground'
            : 'bg-destructive text-destructive-foreground'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Files className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">批量重命名</h1>
          <p className="text-xs text-muted-foreground">拖入文件，设置规则，预览并一键重命名</p>
        </div>
      </div>

      {/* Drop zone */}
      <DropZone onFilesAdded={handleFilesAdded} fileCount={files.length} />

      {/* Main content */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Rules */}
          <div className="lg:col-span-5">
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">命名规则</CardTitle>
              </CardHeader>
              <CardContent>
                <RulesPanel
                  rules={rules}
                  activeMode={activeMode}
                  onModeChange={setActiveMode}
                  onRuleUpdate={handleRuleUpdate}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-7">
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">预览结果</CardTitle>
              </CardHeader>
              <CardContent>
                <FilePreviewList previews={previews} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Action bar */}
      <ActionBar
        fileCount={files.length}
        changedCount={changedCount}
        conflictCount={conflictCount}
        canApply={changedCount > 0}
        canUndo={history.length > 0}
        isApplying={isApplying}
        historyCount={history.length}
        onApply={handleApply}
        onUndo={handleUndo}
        onClear={handleClear}
      />
    </div>
  )
}
