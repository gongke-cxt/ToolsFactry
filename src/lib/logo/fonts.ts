import type { FontConfig, LogoStyle } from '@/types/logo'

export const FONTS: FontConfig[] = [
  // Sans-serif
  { id: 'inter', family: 'Inter', weight: 700, category: 'sans-serif', letterSpacing: -0.02, compatibleStyles: ['modern', 'minimalist', 'bold'] },
  { id: 'montserrat', family: 'Montserrat', weight: 700, category: 'sans-serif', letterSpacing: 0, compatibleStyles: ['modern', 'geometric', 'bold'] },
  { id: 'poppins', family: 'Poppins', weight: 600, category: 'sans-serif', letterSpacing: 0, compatibleStyles: ['playful', 'modern', 'geometric'] },
  { id: 'raleway', family: 'Raleway', weight: 500, category: 'sans-serif', letterSpacing: 0.05, compatibleStyles: ['elegant', 'minimalist', 'modern'] },
  { id: 'outfit', family: 'Outfit', weight: 600, category: 'sans-serif', letterSpacing: 0, compatibleStyles: ['modern', 'geometric', 'minimalist'] },

  // Serif
  { id: 'playfair', family: 'Playfair Display', weight: 700, category: 'serif', letterSpacing: 0.02, compatibleStyles: ['classic', 'elegant', 'luxury'] },
  { id: 'merriweather', family: 'Merriweather', weight: 700, category: 'serif', letterSpacing: 0, compatibleStyles: ['classic', 'elegant'] },
  { id: 'lora', family: 'Lora', weight: 600, category: 'serif', letterSpacing: 0, compatibleStyles: ['classic', 'elegant', 'handwritten'] },
  { id: 'ebgaramond', family: 'EB Garamond', weight: 600, category: 'serif', letterSpacing: 0.02, compatibleStyles: ['classic', 'elegant', 'luxury'] },

  // Display
  { id: 'bebasneue', family: 'Bebas Neue', weight: 400, category: 'display', letterSpacing: 0.08, compatibleStyles: ['bold', 'modern', 'geometric'] },
  { id: 'righteous', family: 'Righteous', weight: 400, category: 'display', letterSpacing: 0.02, compatibleStyles: ['playful', 'bold', 'geometric'] },
  { id: 'abrilfatface', family: 'Abril Fatface', weight: 400, category: 'display', letterSpacing: 0.02, compatibleStyles: ['bold', 'elegant', 'luxury'] },
  { id: 'josefinsans', family: 'Josefin Sans', weight: 600, category: 'display', letterSpacing: 0.1, compatibleStyles: ['geometric', 'minimalist', 'elegant'] },
  { id: 'spacegrotesk', family: 'Space Grotesk', weight: 600, category: 'display', letterSpacing: 0, compatibleStyles: ['modern', 'geometric', 'minimalist'] },

  // Handwriting
  { id: 'pacifico', family: 'Pacifico', weight: 400, category: 'handwriting', letterSpacing: 0, compatibleStyles: ['handwritten', 'playful'] },
  { id: 'caveat', family: 'Caveat', weight: 600, category: 'handwriting', letterSpacing: 0, compatibleStyles: ['handwritten', 'playful', 'warm'] },
  { id: 'dancingscript', family: 'Dancing Script', weight: 600, category: 'handwriting', letterSpacing: 0, compatibleStyles: ['handwritten', 'elegant'] },

  // Chinese
  { id: 'notosanssc', family: 'Noto Sans SC', weight: 700, category: 'sans-serif', letterSpacing: 0.05, compatibleStyles: ['modern', 'bold', 'minimalist'] },
  { id: 'notoserifsc', family: 'Noto Serif SC', weight: 700, category: 'serif', letterSpacing: 0.05, compatibleStyles: ['classic', 'elegant'] },

  // Monospace
  { id: 'jetbrainsmono', family: 'JetBrains Mono', weight: 700, category: 'monospace', letterSpacing: 0, compatibleStyles: ['modern', 'geometric', 'minimalist'] },
]

export function getGoogleFontsUrl(): string {
  const families = FONTS.map(f => {
    const name = f.family.replace(/ /g, '+')
    return `family=${name}:wght@${f.weight}`
  })
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

export function getFontsByStyle(style: LogoStyle): FontConfig[] {
  return FONTS.filter(f => f.compatibleStyles.includes(style))
}

export function getSloganFont(font: FontConfig): string {
  const weight = Math.max(300, font.weight - 200)
  return `${weight} 14px "${font.family}"`
}
