import type { ColorPalette, ColorMood } from '@/types/logo'

export const PALETTES: ColorPalette[] = [
  // Trustworthy (blues)
  { id: 'trust-1', name: '深海蓝', mood: 'trustworthy', primary: '#1E40AF', secondary: '#3B82F6', accent: '#60A5FA', background: '#FFFFFF', text: '#1E293B' },
  { id: 'trust-2', name: '科技蓝', mood: 'trustworthy', primary: '#0F4C81', secondary: '#2D6DA3', accent: '#7AB8D8', background: '#F8FAFC', text: '#0F172A' },
  { id: 'trust-3', name: '商务蓝', mood: 'trustworthy', primary: '#1B365D', secondary: '#4A6D8C', accent: '#A5C4D4', background: '#FFFFFF', text: '#1B2432' },

  // Energetic (reds/oranges)
  { id: 'energy-1', name: '烈焰红', mood: 'energetic', primary: '#DC2626', secondary: '#F97316', accent: '#FBBF24', background: '#FFFFFF', text: '#1C1917' },
  { id: 'energy-2', name: '玫瑰红', mood: 'energetic', primary: '#E11D48', secondary: '#F43F5E', accent: '#FB923C', background: '#FFF7ED', text: '#18181B' },
  { id: 'energy-3', name: '活力橙', mood: 'energetic', primary: '#EA580C', secondary: '#F59E0B', accent: '#FCD34D', background: '#FFFFFF', text: '#292524' },

  // Natural (greens)
  { id: 'nat-1', name: '森林绿', mood: 'natural', primary: '#15803D', secondary: '#22C55E', accent: '#86EFAC', background: '#F0FDF4', text: '#14532D' },
  { id: 'nat-2', name: '翡翠绿', mood: 'natural', primary: '#166534', secondary: '#4ADE80', accent: '#BBF7D0', background: '#FFFFFF', text: '#1A2E1A' },
  { id: 'nat-3', name: '橄榄绿', mood: 'natural', primary: '#365314', secondary: '#84CC16', accent: '#BEF264', background: '#FEFCE8', text: '#1A2E05' },

  // Creative (purples)
  { id: 'cre-1', name: '梦幻紫', mood: 'creative', primary: '#7C3AED', secondary: '#A855F7', accent: '#C084FC', background: '#FFFFFF', text: '#1E1B4B' },
  { id: 'cre-2', name: '深紫', mood: 'creative', primary: '#6D28D9', secondary: '#8B5CF6', accent: '#DDD6FE', background: '#FAF5FF', text: '#2E1065' },
  { id: 'cre-3', name: '品红紫', mood: 'creative', primary: '#9333EA', secondary: '#D946EF', accent: '#F0ABFC', background: '#FFFFFF', text: '#3B0764' },

  // Luxury (gold/dark)
  { id: 'lux-1', name: '金黑', mood: 'luxury', primary: '#B8860B', secondary: '#DAA520', accent: '#FFD700', background: '#1A1A2E', text: '#F5F5DC' },
  { id: 'lux-2', name: '玫瑰金', mood: 'luxury', primary: '#C9B037', secondary: '#E2CA5A', accent: '#F5E6A3', background: '#0D0D0D', text: '#FAFAFA' },
  { id: 'lux-3', name: '铜棕', mood: 'luxury', primary: '#8B7355', secondary: '#C4A77D', accent: '#F2E8CF', background: '#1C1C1C', text: '#F5F0EB' },

  // Playful (multicolor)
  { id: 'play-1', name: '彩虹糖', mood: 'playful', primary: '#8B5CF6', secondary: '#EC4899', accent: '#06B6D4', background: '#FFFFFF', text: '#1E1B4B' },
  { id: 'play-2', name: '糖果色', mood: 'playful', primary: '#F43F5E', secondary: '#A855F7', accent: '#38BDF8', background: '#FFFBEB', text: '#18181B' },
  { id: 'play-3', name: '热带', mood: 'playful', primary: '#2DD4BF', secondary: '#818CF8', accent: '#FB923C', background: '#FFFFFF', text: '#134E4A' },

  // Minimal (monochrome)
  { id: 'min-1', name: '纯黑', mood: 'minimal', primary: '#18181B', secondary: '#52525B', accent: '#A1A1AA', background: '#FFFFFF', text: '#09090B' },
  { id: 'min-2', name: '石墨', mood: 'minimal', primary: '#1F2937', secondary: '#6B7280', accent: '#D1D5DB', background: '#F9FAFB', text: '#111827' },
  { id: 'min-3', name: '炭黑', mood: 'minimal', primary: '#0A0A0A', secondary: '#404040', accent: '#737373', background: '#FAFAFA', text: '#0A0A0A' },

  // Warm (earth tones)
  { id: 'warm-1', name: '琥珀', mood: 'warm', primary: '#92400E', secondary: '#D97706', accent: '#FDE68A', background: '#FFFBEB', text: '#451A03' },
  { id: 'warm-2', name: '赤陶', mood: 'warm', primary: '#9A3412', secondary: '#EA580C', accent: '#FED7AA', background: '#FFF7ED', text: '#431407' },
  { id: 'warm-3', name: '焦糖', mood: 'warm', primary: '#78350F', secondary: '#B45309', accent: '#FCD34D', background: '#FFFFFF', text: '#292524' },
]

export function getPalettesByMood(mood: ColorMood): ColorPalette[] {
  return PALETTES.filter(p => p.mood === mood)
}

export function getPalettesByMoods(moods: ColorMood[]): ColorPalette[] {
  return PALETTES.filter(p => moods.includes(p.mood))
}
