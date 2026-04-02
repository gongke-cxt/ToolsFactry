import type { LogoVariant } from '@/types/logo'

interface LogoPreviewProps {
  variant: LogoVariant | null
}

export function LogoPreview({ variant }: LogoPreviewProps) {
  if (!variant) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        选择一个方案查看大图
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="absolute -inset-6 rounded-2xl opacity-30 blur-xl"
          style={{ backgroundColor: variant.palette.primary + '25' }}
        />
        {/* White background card for consistent preview */}
        <div
          className="relative rounded-xl border border-border bg-white p-8 shadow-elegant animate-scale-in flex items-center justify-center"
          style={{ minWidth: 280, minHeight: 200 }}
        >
          <div dangerouslySetInnerHTML={{ __html: variant.svgString }} />
        </div>
      </div>

      {/* Color palette preview */}
      <div className="flex items-center gap-2">
        {[variant.palette.primary, variant.palette.secondary, variant.palette.accent, variant.palette.background].map((c, i) => (
          <div
            key={i}
            className="h-5 w-5 rounded-full border border-border/50"
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{variant.palette.name}</span>
      </div>
    </div>
  )
}
