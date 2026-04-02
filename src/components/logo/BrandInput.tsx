import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Industry } from '@/types/logo'
import { INDUSTRIES } from '@/types/logo'
import { cn } from '@/lib/utils'

interface BrandInputProps {
  brandName: string
  onBrandNameChange: (v: string) => void
  slogan: string
  onSloganChange: (v: string) => void
  industry: Industry
  onIndustryChange: (v: Industry) => void
}

export function BrandInput({
  brandName, onBrandNameChange,
  slogan, onSloganChange,
  industry, onIndustryChange,
}: BrandInputProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="brandName">品牌名称 *</Label>
        <Input
          id="brandName"
          placeholder="输入品牌名称"
          value={brandName}
          onChange={(e) => onBrandNameChange(e.target.value)}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">这是 Logo 的核心文字</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slogan">品牌口号（选填）</Label>
        <Input
          id="slogan"
          placeholder="一句描述你的品牌"
          value={slogan}
          onChange={(e) => onSloganChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">选择行业</Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {INDUSTRIES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onIndustryChange(id)}
              className={cn(
                "rounded-md border px-2 py-1.5 text-xs font-medium transition-smooth cursor-pointer",
                industry === id
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
