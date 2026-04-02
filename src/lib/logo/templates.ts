import type { LayoutConfig, LogoStyle, LogoType, Industry, ColorMood } from '@/types/logo'

export const LAYOUTS: LayoutConfig[] = [
  {
    id: 'centered-text',
    type: 'centered',
    compatibleLogoTypes: ['wordmark', 'lettermark'],
    iconScale: 0,
    textAlign: 'center',
    gap: 8,
    padding: 24,
  },
  {
    id: 'icon-top',
    type: 'vertical',
    compatibleLogoTypes: ['iconic'],
    iconScale: 1,
    textAlign: 'center',
    gap: 16,
    padding: 24,
  },
  {
    id: 'icon-left',
    type: 'horizontal',
    compatibleLogoTypes: ['combination'],
    iconScale: 0.9,
    textAlign: 'left',
    gap: 16,
    padding: 24,
  },
  {
    id: 'emblem-circle',
    type: 'emblem-circle',
    compatibleLogoTypes: ['emblem'],
    iconScale: 0.7,
    textAlign: 'center',
    gap: 8,
    padding: 24,
  },
  {
    id: 'stacked',
    type: 'stacked',
    compatibleLogoTypes: ['wordmark', 'iconic'],
    iconScale: 0.85,
    textAlign: 'center',
    gap: 12,
    padding: 20,
  },
  {
    id: 'compact',
    type: 'horizontal',
    compatibleLogoTypes: ['combination', 'iconic'],
    iconScale: 0.7,
    textAlign: 'left',
    gap: 10,
    padding: 16,
  },
]

export function getLayoutsForType(logoType: LogoType): LayoutConfig[] {
  return LAYOUTS.filter(l => l.compatibleLogoTypes.includes(logoType))
}

// Scoring helpers for template matching

export function scoreFontStyle(fontStyles: LogoStyle[], targetStyle: LogoStyle): number {
  const idx = fontStyles.indexOf(targetStyle)
  if (idx === -1) return 0
  // Closer to beginning = better match (first style in compatibleStyles is primary)
  return 1 - idx * 0.15
}

export function scorePaletteIndustry(mood: ColorMood, industry: Industry): number {
  const INDUSTRY_MOOD_MAP: Record<string, ColorMood[]> = {
    technology: ['trustworthy', 'creative', 'minimal'],
    food: ['warm', 'energetic', 'natural'],
    health: ['trustworthy', 'natural', 'minimal'],
    education: ['trustworthy', 'creative', 'warm'],
    finance: ['trustworthy', 'luxury', 'minimal'],
    retail: ['playful', 'energetic', 'warm'],
    creative: ['creative', 'playful', 'energetic'],
    sports: ['energetic', 'playful'],
    nature: ['natural', 'warm', 'minimal'],
    travel: ['energetic', 'creative', 'playful'],
    legal: ['trustworthy', 'luxury', 'minimal'],
    beauty: ['luxury', 'creative', 'warm'],
    automotive: ['bold', 'trustworthy', 'minimal'],
    realestate: ['trustworthy', 'warm', 'luxury'],
    other: ['creative', 'trustworthy', 'minimal'],
  }
  const moods = INDUSTRY_MOOD_MAP[industry] || ['creative']
  const idx = moods.indexOf(mood)
  if (idx === -1) return 0.3 // Non-matching but still usable
  return 1 - idx * 0.2
}
