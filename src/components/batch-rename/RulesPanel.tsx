import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Type, FilePenLine, Hash, Search, Code2, ArrowRightToLine, ArrowRightFromLine } from 'lucide-react'
import type { RenameMode, RenameRule } from '@/types/batch-rename'

const MODES: { key: RenameMode; label: string; icon: React.ElementType }[] = [
  { key: 'prefix', label: '前缀', icon: ArrowRightToLine },
  { key: 'suffix', label: '后缀', icon: ArrowRightFromLine },
  { key: 'extension', label: '扩展名', icon: FilePenLine },
  { key: 'sequence', label: '序号', icon: Hash },
  { key: 'find-replace', label: '查找替换', icon: Search },
  { key: 'regex', label: '正则表达式', icon: Code2 },
]

interface RulesPanelProps {
  rules: Record<RenameMode, RenameRule>
  activeMode: RenameMode
  onModeChange: (mode: RenameMode) => void
  onRuleUpdate: (mode: RenameMode, patch: Partial<RenameRule>) => void
}

export function RulesPanel({ rules, activeMode, onModeChange, onRuleUpdate }: RulesPanelProps) {
  const rule = rules[activeMode]

  const update = (patch: Partial<RenameRule>) => onRuleUpdate(activeMode, patch)

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-1.5">
        {MODES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-smooth",
              activeMode === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Mode-specific inputs */}
      <div className="space-y-4 animate-fade-in" key={activeMode}>
        {activeMode === 'prefix' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">前缀文本</label>
            <Input
              placeholder="输入要添加的前缀，如: project_"
              value={rule.prefix}
              onChange={(e) => update({ prefix: e.target.value })}
            />
            <p className="text-xs text-muted-foreground/70">
              将在文件名最前面插入指定文本
            </p>
          </div>
        )}

        {activeMode === 'suffix' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">后缀文本</label>
            <Input
              placeholder="输入要添加的后缀，如: _backup"
              value={rule.suffix}
              onChange={(e) => update({ suffix: e.target.value })}
            />
            <p className="text-xs text-muted-foreground/70">
              将在扩展名之前插入指定文本
            </p>
          </div>
        )}

        {activeMode === 'extension' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">新扩展名</label>
            <Input
              placeholder="输入新扩展名，如: jpg"
              value={rule.newExtension}
              onChange={(e) => update({ newExtension: e.target.value })}
            />
            <p className="text-xs text-muted-foreground/70">
              替换所有文件的扩展名
            </p>
          </div>
        )}

        {activeMode === 'sequence' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">起始值</label>
                <Input
                  type="number"
                  min={0}
                  value={rule.sequenceStart}
                  onChange={(e) => update({ sequenceStart: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">步长</label>
                <Input
                  type="number"
                  min={1}
                  value={rule.sequenceStep}
                  onChange={(e) => update({ sequenceStep: Number(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">补零位数</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={rule.sequencePadding}
                  onChange={(e) => update({ sequencePadding: Number(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">序号位置</label>
              <Select
                value={rule.sequencePosition}
                onChange={(e) => update({ sequencePosition: e.target.value as RenameRule['sequencePosition'] })}
              >
                <option value="prefix">前缀 (001_filename.txt)</option>
                <option value="suffix">后缀 (filename_001.txt)</option>
                <option value="replace">替换 (001.txt)</option>
              </Select>
            </div>
          </div>
        )}

        {activeMode === 'find-replace' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">查找文本</label>
              <Input
                placeholder="要查找的文本"
                value={rule.findText}
                onChange={(e) => update({ findText: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">替换为</label>
              <Input
                placeholder="替换后的文本（留空则删除）"
                value={rule.replaceText}
                onChange={(e) => update({ replaceText: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={rule.caseSensitive}
                onCheckedChange={(v) => update({ caseSensitive: v })}
              />
              <span className="text-xs text-muted-foreground">区分大小写</span>
            </label>
          </div>
        )}

        {activeMode === 'regex' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">正则表达式</label>
              <Input
                placeholder="如: \d{4}-\d{2}-\d{2}"
                value={rule.regexPattern}
                onChange={(e) => update({ regexPattern: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">替换为</label>
              <Input
                placeholder="替换文本，支持 $1, $2 捕获组"
                value={rule.regexReplace}
                onChange={(e) => update({ regexReplace: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">标志位</label>
              <Input
                placeholder="g, i, m 等"
                value={rule.regexFlags}
                onChange={(e) => update({ regexFlags: e.target.value })}
                className="font-mono w-24"
              />
            </div>
            {rule.regexPattern && (
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">正则预览</p>
                <code className="text-xs text-foreground font-mono">
                  /{rule.regexPattern}/{rule.regexFlags}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
