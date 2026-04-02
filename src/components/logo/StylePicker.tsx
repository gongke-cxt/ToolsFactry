import type { LogoStyle, LogoType, ColorMood } from '@/types/logo'
import { LOGO_STYLES, LOGO_TYPES, COLOR_MOODS, INDUSTRY_MOOD_MAP } from '@/types/logo'
import type { Industry } from '@/types/logo'
import { cn } from '@/lib/utils'

interface StylePickerProps {
  style: LogoStyle
  onStyleChange: (v: LogoStyle) => void
  logoType: LogoType
  onLogoTypeChange: (v: LogoType) => void
  colorMood: ColorMood
  onColorMoodChange: (v: ColorMood) => void
  industry: Industry
}

export function StylePicker({
  style, onStyleChange,
  logoType, onLogoTypeChange,
  colorMood, onColorMoodChange,
  industry,
}: StylePickerProps) {
  const recommended = INDUSTRY_MOOD_MAP[industry] || []

  return (
    <div className="space-y-6">
      {/* Logo Style */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">视觉风格</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LOGO_STYLES.map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => onStyleChange(id)}
              className={cn(
                "flex flex-col rounded-lg border p-3 text-left transition-smooth cursor-pointer",
                style === id
                  ? "border-primary bg-accent shadow-glow"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                style === id ? "text-accent-foreground" : "text-foreground"
              )}>{label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Type */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Logo 类型</Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {LOGO_TYPES.map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => onLogoTypeChange(id)}
              className={cn(
                "flex flex-col items-center rounded-lg border p-3 transition-smooth cursor-pointer",
                logoType === id
                  ? "border-primary bg-accent shadow-glow"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Mini preview icon */}
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md mb-2",
                logoType === id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <TypeIcon type={id} />
              </div>
              <span className={cn(
                "text-xs font-medium",
                logoType === id ? "text-accent-foreground" : "text-foreground"
              )}>{label}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 text-center">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Mood */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          主色调
          {recommended.length > 0 && (
            <span className="ml-2 text-primary font-normal">推荐: {recommended.slice(0, 2).map(m => COLOR_MOODS.find(c => c.id === m)?.label).join(', ')}</span>
          )}
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COLOR_MOODS.map(({ id, label, desc, preview }) => (
            <button
              key={id}
              onClick={() => onColorMoodChange(id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2.5 text-left transition-smooth cursor-pointer",
                colorMood === id
                  ? "border-primary bg-accent shadow-glow"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex gap-0.5 shrink-0">
                {preview.map((c, i) => (
                  <div key={i} className="h-5 w-5 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="min-w-0">
                <div className={cn(
                  "text-xs font-medium",
                  colorMood === id ? "text-accent-foreground" : "text-foreground"
                )}>{label}</div>
                <div className="text-[10px] text-muted-foreground truncate">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props}>{children}</label>
}

function TypeIcon({ type }: { type: LogoType }) {
  const svgs: Record<LogoType, string> = {
    wordmark: '<text x="12" y="16" font-size="10" font-weight="700" fill="currentColor" text-anchor="middle" font-family="sans-serif">Ab</text>',
    lettermark: '<rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" opacity="0.15"/><text x="12" y="17" font-size="12" font-weight="700" fill="currentColor" text-anchor="middle" font-family="sans-serif">A</text>',
    iconic: '<circle cx="12" cy="9" r="4" fill="currentColor" opacity="0.6"/><text x="12" y="21" font-size="7" font-weight="600" fill="currentColor" text-anchor="middle" font-family="sans-serif">Ab</text>',
    combination: '<circle cx="7" cy="12" r="4" fill="currentColor" opacity="0.6"/><text x="16" y="15" font-size="8" font-weight="700" fill="currentColor" text-anchor="start" font-family="sans-serif">Ab</text>',
    emblem: '<circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/><text x="12" y="15" font-size="9" font-weight="700" fill="currentColor" text-anchor="middle" font-family="sans-serif">Ab</text>',
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" dangerouslySetInnerHTML={{ __html: svgs[type] }} />
  )
}
