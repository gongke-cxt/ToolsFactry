import type { LogoVariant } from '@/types/logo'
import { cn } from '@/lib/utils'

interface LogoGridProps {
  variants: LogoVariant[]
  selectedIndex: number
  onSelect: (idx: number) => void
  onRegenerate: () => void
}

export function LogoGrid({ variants, selectedIndex, onSelect, onRegenerate }: LogoGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          生成了 <span className="font-semibold text-foreground">{variants.length}</span> 个方案
        </p>
        <button
          onClick={onRegenerate}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth cursor-pointer"
        >
          重新生成
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {variants.map((v, i) => (
          <button
            key={v.id}
            onClick={() => onSelect(i)}
            className={cn(
              "relative rounded-lg border bg-white p-3 transition-smooth cursor-pointer overflow-hidden",
              "hover:shadow-elegant",
              selectedIndex === i
                ? "border-primary ring-2 ring-primary/30 shadow-glow"
                : "border-border"
            )}
          >
            <div
              className="flex items-center justify-center aspect-square"
              dangerouslySetInnerHTML={{ __html: v.svgString }}
            />
            {selectedIndex === i && (
              <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary shadow-glow" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
