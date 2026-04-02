export type Industry =
  | 'technology' | 'food' | 'health' | 'education' | 'finance'
  | 'retail' | 'creative' | 'sports' | 'nature' | 'travel'
  | 'legal' | 'beauty' | 'automotive' | 'realestate' | 'other'

export type LogoStyle =
  | 'modern' | 'classic' | 'playful' | 'elegant'
  | 'minimalist' | 'bold' | 'geometric' | 'handwritten'
  | 'luxury' | 'warm'

export type LogoType =
  | 'wordmark' | 'lettermark' | 'iconic' | 'combination' | 'emblem'

export type ColorMood =
  | 'trustworthy' | 'energetic' | 'natural' | 'creative'
  | 'luxury' | 'playful' | 'minimal' | 'warm'
  | 'bold' | 'elegant'

export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace'

export interface LogoConfig {
  brandName: string
  slogan: string
  industry: Industry
  style: LogoStyle
  logoType: LogoType
  colorMood: ColorMood
}

export interface ColorPalette {
  id: string
  name: string
  mood: ColorMood
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface FontConfig {
  id: string
  family: string
  weight: number
  category: FontCategory
  letterSpacing: number
  compatibleStyles: LogoStyle[]
}

export interface IconDef {
  id: string
  name: string
  category: Industry
  viewBox: string
  paths: string[]
}

export interface LayoutConfig {
  id: string
  type: 'horizontal' | 'vertical' | 'stacked' | 'centered' | 'emblem-circle' | 'emblem-shield'
  compatibleLogoTypes: LogoType[]
  iconScale: number
  textAlign: 'left' | 'center' | 'right'
  gap: number
  padding: number
}

export interface LogoVariant {
  id: string
  svgString: string
  width: number
  height: number
  font: FontConfig
  palette: ColorPalette
  icon: IconDef | null
  layout: LayoutConfig
  config: LogoConfig
}

export interface LogoEditorState {
  fontOverride: FontConfig | null
  paletteOverride: ColorPalette | null
  iconScale: number
  letterSpacing: number
  fontSize: number
  sloganFontSize: number
}

export type AiProvider = 'openai' | 'apiyi'

export interface AiConfig {
  apiKey: string
  provider: AiProvider
  referenceImage: string | null
  isGenerating: boolean
  results: string[]
}

export const INDUSTRIES: { id: Industry; label: string }[] = [
  { id: 'technology', label: '科技' },
  { id: 'food', label: '餐饮' },
  { id: 'health', label: '医疗健康' },
  { id: 'education', label: '教育' },
  { id: 'finance', label: '金融' },
  { id: 'retail', label: '零售' },
  { id: 'creative', label: '创意设计' },
  { id: 'sports', label: '运动健身' },
  { id: 'nature', label: '环保' },
  { id: 'travel', label: '旅游' },
  { id: 'legal', label: '法律' },
  { id: 'beauty', label: '美容' },
  { id: 'automotive', label: '汽车' },
  { id: 'realestate', label: '房地产' },
  { id: 'other', label: '其他' },
]

export const LOGO_STYLES: { id: LogoStyle; label: string; desc: string }[] = [
  { id: 'modern', label: '现代', desc: '简洁几何，扁平设计' },
  { id: 'classic', label: '经典', desc: '传统衬线，稳重可靠' },
  { id: 'playful', label: '活泼', desc: '圆润友好，明亮色彩' },
  { id: 'elegant', label: '优雅', desc: '纤细精致，高级感' },
  { id: 'minimalist', label: '极简', desc: '少即是多，大量留白' },
  { id: 'bold', label: '粗犷', desc: '重磅字体，冲击力强' },
  { id: 'geometric', label: '几何', desc: '几何图形，结构感强' },
  { id: 'handwritten', label: '手写', desc: '手写风格，温暖亲切' },
  { id: 'luxury', label: '奢华', desc: '金色点缀，高端质感' },
  { id: 'warm', label: '温暖', desc: '圆润柔和，亲和力强' },
]

export const LOGO_TYPES: { id: LogoType; label: string; desc: string }[] = [
  { id: 'wordmark', label: '文字标', desc: '纯文字品牌名' },
  { id: 'lettermark', label: '字母标', desc: '首字母缩写' },
  { id: 'iconic', label: '图标标', desc: '图标 + 文字' },
  { id: 'combination', label: '组合标', desc: '图标与文字并排' },
  { id: 'emblem', label: '徽章标', desc: '图文一体徽章' },
]

export const COLOR_MOODS: { id: ColorMood; label: string; desc: string; preview: string[] }[] = [
  { id: 'trustworthy', label: '信任', desc: '蓝色系，专业可靠', preview: ['#1E40AF', '#3B82F6', '#60A5FA'] },
  { id: 'energetic', label: '活力', desc: '红橙色，热情奔放', preview: ['#DC2626', '#F97316', '#FBBF24'] },
  { id: 'natural', label: '自然', desc: '绿色系，环保健康', preview: ['#15803D', '#22C55E', '#86EFAC'] },
  { id: 'creative', label: '创意', desc: '紫色系，创新灵感', preview: ['#7C3AED', '#A855F7', '#C084FC'] },
  { id: 'luxury', label: '奢华', desc: '金黑色，高端品质', preview: ['#B8860B', '#1A1A2E', '#FFD700'] },
  { id: 'playful', label: '趣味', desc: '多彩混搭，活泼有趣', preview: ['#8B5CF6', '#EC4899', '#06B6D4'] },
  { id: 'minimal', label: '极简', desc: '黑白灰，简约克制', preview: ['#18181B', '#52525B', '#A1A1AA'] },
  { id: 'warm', label: '温暖', desc: '暖棕色，温馨舒适', preview: ['#92400E', '#D97706', '#FDE68A'] },
  { id: 'bold', label: '大胆', desc: '强烈对比，冲击力强', preview: ['#DC2626', '#000000', '#FFD700'] },
  { id: 'elegant', label: '优雅', desc: '淡雅柔美，精致高级', preview: ['#C084FC', '#F9A8D4', '#FDE68A'] },
]

export const INDUSTRY_MOOD_MAP: Record<Industry, ColorMood[]> = {
  technology: ['trustworthy', 'creative', 'minimal'],
  food: ['warm', 'energetic', 'natural'],
  health: ['trustworthy', 'natural', 'minimal'],
  education: ['trustworthy', 'creative', 'warm'],
  finance: ['trustworthy', 'luxury', 'minimal'],
  retail: ['playful', 'energetic', 'warm'],
  creative: ['creative', 'playful', 'energetic'],
  sports: ['energetic', 'bold', 'playful'],
  nature: ['natural', 'warm', 'minimal'],
  travel: ['energetic', 'creative', 'playful'],
  legal: ['trustworthy', 'luxury', 'minimal'],
  beauty: ['luxury', 'elegant', 'warm'],
  automotive: ['bold', 'trustworthy', 'minimal'],
  realestate: ['trustworthy', 'warm', 'luxury'],
  other: ['creative', 'trustworthy', 'minimal'],
}

export const EXPORT_SIZES = [
  { label: '图标 64x64', size: 64 },
  { label: '小图 128x128', size: 128 },
  { label: '标准 256x256', size: 256 },
  { label: '中图 512x512', size: 512 },
  { label: '高清 1024x1024', size: 1024 },
  { label: '超清 2048x2048', size: 2048 },
]

export const DEFAULT_EDITOR_STATE: LogoEditorState = {
  fontOverride: null,
  paletteOverride: null,
  iconScale: 1,
  letterSpacing: 0,
  fontSize: 48,
  sloganFontSize: 16,
}
