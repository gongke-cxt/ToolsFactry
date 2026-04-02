import { themes, MarkdownTheme } from '@/lib/markdown/themes'
import { cn } from '@/lib/utils'

interface ThemeSelectorProps {
  current: string
  onChange: (id: string) => void
}

export function ThemeSelector({ current, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {themes.map((t: MarkdownTheme) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-smooth border",
            current === t.id
              ? "bg-primary text-primary-foreground border-primary shadow-glow"
              : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
          )}
        >
          {t.name}
        </button>
      ))}
    </div>
  )
}
