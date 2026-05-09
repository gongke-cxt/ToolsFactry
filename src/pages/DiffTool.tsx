import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Card, CardContent,
} from '@/components/ui/card'
import { DiffToolbar } from '@/components/diff/DiffToolbar'
import { DiffInput } from '@/components/diff/DiffInput'
import { DiffViewSplit } from '@/components/diff/DiffViewSplit'
import { DiffViewUnified } from '@/components/diff/DiffViewUnified'
import { computeDiff } from '@/lib/diff/core'
import { exportAsHTML, exportAsUnifiedDiff } from '@/lib/diff/exporter'
import type { ViewMode } from '@/types/diff'

const SAMPLE_LEFT = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const items = [1, 2, 3, 4, 5];
const filtered = items.filter(i => i > 2);

class UserService {
  constructor() {
    this.users = [];
  }
  
  addUser(user) {
    this.users.push(user);
  }
  
  getUsers() {
    return this.users;
  }
}`

const SAMPLE_RIGHT = `function greet(name, greeting = "Hello") {
  console.log(\`\${greeting}, \${name}\`);
  return { success: true };
}

const items = [1, 2, 3, 4, 5, 6];
const filtered = items.filter(i => i > 3);

class UserService {
  constructor(db) {
    this.users = [];
    this.db = db;
  }
  
  addUser(user) {
    if (!user.email) throw new Error("Email required");
    this.users.push(user);
  }
  
  getUsers() {
    return [...this.users];
  }
  
  findById(id) {
    return this.users.find(u => u.id === id);
  }
}`

export function DiffTool() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [currentHunk, setCurrentHunk] = useState(0)

  const hasInput = leftText.length > 0 || rightText.length > 0

  const diffResult = useMemo(
    () => computeDiff(leftText, rightText, { ignoreWhitespace }),
    [leftText, rightText, ignoreWhitespace]
  )

  useEffect(() => {
    setCurrentHunk(0)
  }, [diffResult.totalHunks])

  const handlePrevHunk = useCallback(() => {
    setCurrentHunk(h => Math.max(0, h - 1))
  }, [])

  const handleNextHunk = useCallback(() => {
    setCurrentHunk(h => Math.min(diffResult.totalHunks - 1, h + 1))
  }, [diffResult.totalHunks])

  const handleExportHTML = useCallback(() => {
    const html = exportAsHTML(diffResult, viewMode)
    downloadFile(html, 'diff-report.html', 'text/html')
  }, [diffResult, viewMode])

  const handleExportUnified = useCallback(() => {
    const text = exportAsUnifiedDiff(diffResult)
    downloadFile(text, 'diff.patch', 'text/plain')
  }, [diffResult])

  const handleClear = useCallback(() => {
    setLeftText('')
    setRightText('')
  }, [])

  const handleLoadSample = useCallback(() => {
    setLeftText(SAMPLE_LEFT)
    setRightText(SAMPLE_RIGHT)
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gradient-primary">
          文本差异对比
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          粘贴两个版本的文本或代码，高亮显示所有差异变化
        </p>
      </div>

      <DiffToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        ignoreWhitespace={ignoreWhitespace}
        onIgnoreWhitespaceChange={setIgnoreWhitespace}
        currentHunk={currentHunk}
        totalHunks={diffResult.totalHunks}
        onPrevHunk={handlePrevHunk}
        onNextHunk={handleNextHunk}
        onExportHTML={handleExportHTML}
        onExportUnified={handleExportUnified}
        onClear={handleClear}
        onLoadSample={handleLoadSample}
        addedCount={diffResult.addedCount}
        removedCount={diffResult.removedCount}
        hasInput={hasInput}
      />

      <DiffInput
        leftText={leftText}
        rightText={rightText}
        onLeftChange={setLeftText}
        onRightChange={setRightText}
      />

      {/* Diff view */}
      <Card className="shadow-elegant">
        <CardContent className="p-0">
          <div className="flex flex-col" style={{ height: '500px' }}>
            {!hasInput ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                在上方输入原始文本和修改后文本开始对比，或点击「示例」加载样例
              </div>
            ) : diffResult.identical ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <span className="text-green-600 dark:text-green-400 text-lg font-medium">
                  两个文本完全相同
                </span>
                <span className="text-muted-foreground text-sm">{diffResult.leftLines.length} 行，无差异</span>
              </div>
            ) : viewMode === 'split' ? (
              <DiffViewSplit
                hunks={diffResult.hunks}
                leftLines={diffResult.leftLines}
                rightLines={diffResult.rightLines}
                currentHunk={currentHunk}
              />
            ) : (
              <DiffViewUnified
                hunks={diffResult.hunks}
                currentHunk={currentHunk}
                identical={diffResult.identical}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
