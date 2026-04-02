import { Upload, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { QRStyleConfig, DotType, CornerSquareType, CornerDotType } from '@/types'
import { useRef } from 'react'

interface StyleSectionProps {
  style: QRStyleConfig
  onStyleChange: (s: QRStyleConfig) => void
}

const dotTypes: { value: DotType; label: string }[] = [
  { value: 'rounded', label: '圆角' },
  { value: 'dots', label: '圆点' },
  { value: 'classy', label: '经典' },
  { value: 'classy-rounded', label: '经典圆角' },
  { value: 'square', label: '方形' },
  { value: 'extra-rounded', label: '超圆角' },
]

const cornerSquareTypes: { value: CornerSquareType; label: string }[] = [
  { value: 'extra-rounded', label: '圆角' },
  { value: 'dot', label: '圆点' },
  { value: 'square', label: '方形' },
]

const cornerDotTypes: { value: CornerDotType; label: string }[] = [
  { value: 'dot', label: '圆点' },
  { value: 'square', label: '方形' },
]

const presetColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#1e1e1e',
]

export function StyleSection({ style, onStyleChange }: StyleSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onStyleChange({ ...style, logoFile: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    onStyleChange({ ...style, logoFile: null })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      {/* Foreground color */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          前景颜色
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              value={style.fgColor}
              onChange={(e) => onStyleChange({ ...style, fgColor: e.target.value })}
              className="h-10 w-10 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presetColors.map(c => (
              <button
                key={c}
                onClick={() => onStyleChange({ ...style, fgColor: c })}
                className="h-7 w-7 rounded-md border border-border transition-smooth hover:scale-110 cursor-pointer"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background color */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          背景颜色
        </Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={style.bgColor}
            onChange={(e) => onStyleChange({ ...style, bgColor: e.target.value })}
            className="h-10 w-10 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
          />
          <span className="text-sm text-muted-foreground font-mono">{style.bgColor}</span>
        </div>
      </div>

      {/* Dot style */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          码点样式
        </Label>
        <Select value={style.dotType}
          onChange={(e) => onStyleChange({ ...style, dotType: e.target.value as DotType })}>
          {dotTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </Select>
      </div>

      {/* Corner styles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            角框样式
          </Label>
          <Select value={style.cornerSquareType}
            onChange={(e) => onStyleChange({ ...style, cornerSquareType: e.target.value as CornerSquareType })}>
            {cornerSquareTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            角点样式
          </Label>
          <Select value={style.cornerDotType}
            onChange={(e) => onStyleChange({ ...style, cornerDotType: e.target.value as CornerDotType })}>
            {cornerDotTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </Select>
        </div>
      </div>

      {/* Logo upload */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          中间 Logo
        </Label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        {style.logoFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <img src={style.logoFile} alt="Logo" className="h-10 w-10 rounded-md object-cover" />
            <span className="text-sm text-foreground flex-1">已上传</span>
            <button onClick={removeLogo}
              className="text-muted-foreground hover:text-destructive transition-smooth cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-smooth cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            点击上传 Logo 图片
          </button>
        )}
      </div>

      {/* Size */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          尺寸: {style.size}px
        </Label>
        <input
          type="range"
          min={150}
          max={600}
          step={10}
          value={style.size}
          onChange={(e) => onStyleChange({ ...style, size: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>150px</span>
          <span>600px</span>
        </div>
      </div>
    </div>
  )
}
