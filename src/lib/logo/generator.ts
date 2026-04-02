import type { LogoConfig, LogoVariant, FontConfig, ColorPalette, IconDef, LayoutConfig } from '@/types/logo'
import { getFontsByStyle } from '@/lib/logo/fonts'
import { getPalettesByMood } from '@/lib/logo/palettes'
import { getIconsByIndustry } from '@/lib/logo/icons'
import { getLayoutsForType, scoreFontStyle, scorePaletteIndustry } from '@/lib/logo/templates'
import { buildLogoSvg } from '@/lib/logo/svg-builder'

// Simple seeded PRNG (LCG)
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
    return (s >>> 0) / 0xFFFFFFFF
  }
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

interface ScoredCombo {
  font: FontConfig
  palette: ColorPalette
  icon: IconDef | null
  layout: LayoutConfig
  score: number
}

export function generateLogoVariants(config: LogoConfig, seed: number): LogoVariant[] {
  const rand = seededRandom(seed + hashString(config.brandName))

  // Step 1: Filter resources
  const fonts = getFontsByStyle(config.style)
  const palettes = getPalettesByMood(config.colorMood)
  const icons = config.logoType === 'wordmark' || config.logoType === 'lettermark'
    ? [] as IconDef[]
    : getIconsByIndustry(config.industry)
  const layouts = getLayoutsForType(config.logoType)

  // Fallbacks
  const safeFonts = fonts.length > 0 ? fonts : getFontsByStyle('modern')
  const safePalettes = palettes.length > 0 ? palettes : getPalettesByMood('creative')
  const safeIcons = icons.length > 0 ? icons : [null as unknown as IconDef]
  const safeLayouts = layouts.length > 0 ? layouts : getLayoutsForType('wordmark')

  // Step 2: Generate scored combinations
  const combos: ScoredCombo[] = []
  const used = new Set<string>()

  for (const font of safeFonts) {
    for (const palette of safePalettes) {
      for (const icon of safeIcons) {
        for (const layout of safeLayouts) {
          const key = `${font.id}-${palette.id}-${icon?.id ?? 'none'}-${layout.id}`
          if (used.has(key)) continue
          used.add(key)

          const fontScore = scoreFontStyle(font.compatibleStyles, config.style)
          const paletteScore = scorePaletteIndustry(palette.mood, config.industry)
          const jitter = rand() * 0.3

          combos.push({
            font,
            palette,
            icon: icon ?? null,
            layout,
            score: fontScore * 0.4 + paletteScore * 0.4 + jitter,
          })
        }
      }
    }
  }

  // Sort by score and pick top 9
  combos.sort((a, b) => b.score - a.score)
  const selected = combos.slice(0, 9)

  // Step 3: Build SVGs
  return selected.map((combo, i) => {
    const svgString = buildLogoSvg({
      brandName: config.brandName,
      slogan: config.slogan,
      font: combo.font,
      palette: combo.palette,
      icon: combo.icon,
      layout: combo.layout,
      fontSize: 48,
      sloganFontSize: 16,
      iconScale: combo.layout.iconScale,
    })

    const widthMatch = svgString.match(/width="(\d+)"/)
    const heightMatch = svgString.match(/height="(\d+)"/)

    return {
      id: `variant-${i}-${Date.now()}`,
      svgString,
      width: widthMatch ? parseInt(widthMatch[1]) : 200,
      height: heightMatch ? parseInt(heightMatch[1]) : 200,
      font: combo.font,
      palette: combo.palette,
      icon: combo.icon,
      layout: combo.layout,
      config,
    }
  })
}
