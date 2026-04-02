import type { LogoVariant } from '@/types/logo'
import { FONTS, getFontsByStyle } from '@/lib/logo/fonts'
import { PALETTES } from '@/lib/logo/palettes'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { LogoEditorState, LogoStyle, ColorMood } from '@/types/logo'

interface LogoEditorProps {
  variant: LogoVariant | null
  editorState: LogoEditorState
  onEditorChange: (s: LogoEditorState) => void
  style: LogoStyle
  colorMood: ColorMood
}

export function LogoEditor({ variant, editorState, onEditorChange, style, colorMood }: LogoEditorProps) {
  if (!variant) return null

  const compatibleFonts = getFontsByStyle(style)
  const displayFonts = compatibleFonts.length > 0 ? compatibleFonts : FONTS.slice(0, 8)
  const moodPalettes = PALETTES.filter(p => p.mood === colorMood)
  const allPalettes = moodPalettes.length > 0 ? moodPalettes : PALETTES.slice(0, 8)

  return (
    <div className="space-y-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">自定义调整</p>

      {/* Font selector */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">字体</Label>
        <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
          {displayFonts.map(f => (
            <button
              key={f.id}
              onClick={() => onEditorChange({ ...editorState, fontOverride: f })}
              className={cn(
                "text-left px-2 py-1.5 rounded-md text-sm transition-smooth cursor-pointer",
                editorState.fontOverride?.id === f.id
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/50"
              )}
              style={{ fontFamily: `"${f.family}", sans-serif`, fontWeight: f.weight }}
            >
              {f.family}
            </button>
          ))}
        </div>
      </div>

      {/* Palette selector */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">配色</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {allPalettes.map(p => (
            <button
              key={p.id}
              onClick={() => onEditorChange({ ...editorState, paletteOverride: p })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border p-2 transition-smooth cursor-pointer",
                editorState.paletteOverride?.id === p.id
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex gap-0.5">
                {[p.primary, p.secondary, p.accent].map((c, i) => (
                  <div key={i} className="h-4 w-4 rounded-full border border-border/30" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        <SliderControl
          label="图标大小"
          value={editorState.iconScale}
          min={0.3}
          max={2}
          step={0.1}
          onChange={(v) => onEditorChange({ ...editorState, iconScale: v })}
        />
        <SliderControl
          label="字间距"
          value={editorState.letterSpacing}
          min={-0.1}
          max={0.3}
          step={0.01}
          onChange={(v) => onEditorChange({ ...editorState, letterSpacing: v })}
        />
        <SliderControl
          label="文字大小"
          value={editorState.fontSize}
          min={24}
          max={80}
          step={2}
          onChange={(v) => onEditorChange({ ...editorState, fontSize: v })}
        />
        <SliderControl
          label="口号大小"
          value={editorState.sloganFontSize}
          min={10}
          max={28}
          step={1}
          onChange={(v) => onEditorChange({ ...editorState, sloganFontSize: v })}
        />
      </div>
    </div>
  )
}

function SliderControl({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-1.5"
      />
    </div>
  )
}
