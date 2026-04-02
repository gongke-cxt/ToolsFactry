import type { FontConfig, ColorPalette, IconDef, LayoutConfig, LogoType } from '@/types/logo'

// Text measurement cache
const measureCache = new Map<string, { width: number; height: number }>()
let measureCanvas: HTMLCanvasElement | null = null

function getMeasureCanvas(): HTMLCanvasElement {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCanvas.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden'
    document.body.appendChild(measureCanvas)
  }
  return measureCanvas
}

export function measureText(text: string, fontFamily: string, fontSize: number, fontWeight: number): { width: number; height: number } {
  const key = `${text}|${fontFamily}|${fontSize}|${fontWeight}`
  const cached = measureCache.get(key)
  if (cached) return cached

  const canvas = getMeasureCanvas()
  const ctx = canvas.getContext('2d')!
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`
  const metrics = ctx.measureText(text)
  const result = {
    width: metrics.width,
    height: fontSize * 1.2,
  }
  measureCache.set(key, result)
  return result
}

export function clearMeasureCache() {
  measureCache.clear()
}

// --- SVG construction helpers ---

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderFilledIcon(icon: IconDef, x: number, y: number, size: number, color: string): string {
  const scale = size / parseFloat(icon.viewBox.split(' ')[2] || '24')
  return `<g transform="translate(${x},${y}) scale(${scale})">` +
    icon.paths.map(p =>
      `<path d="${p}" fill="${color}"/>`
    ).join('') +
    '</g>'
}

function renderText(text: string, x: number, y: number, fontSize: number, fontWeight: number, fontFamily: string, color: string, letterSpacing: number, anchor: 'start' | 'middle' | 'end' = 'middle'): string {
  return `<text x="${x}" y="${y}" font-family="'${fontFamily}', sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" text-anchor="${anchor}" letter-spacing="${letterSpacing}">${escapeXml(text)}</text>`
}

// --- Layout renderers by LogoType ---

const PADDING = 24
const ICON_TEXT_GAP = 16
const SLOGAN_GAP = 6

interface BuildParams {
  brandName: string
  slogan: string
  font: FontConfig
  palette: ColorPalette
  icon: IconDef | null
  layout: LayoutConfig
  fontSize: number
  sloganFontSize: number
  iconScale: number
}

function buildWordmark(p: BuildParams): string {
  const nameSize = measureText(p.brandName, p.font.family, p.fontSize, p.font.weight)
  const sloganW = p.slogan ? measureText(p.slogan, p.font.family, p.sloganFontSize, Math.max(300, p.font.weight - 200)).width : 0
  const totalW = Math.max(nameSize.width, sloganW) + PADDING * 2
  const totalH = p.fontSize + (p.slogan ? p.sloganFontSize + SLOGAN_GAP : 0) + PADDING * 2
  const cx = totalW / 2
  const nameY = PADDING + p.fontSize * 0.8

  let svg = renderText(p.brandName, cx, nameY, p.fontSize, p.font.weight, p.font.family, p.palette.primary, p.font.letterSpacing)
  if (p.slogan) {
    const sloganY = nameY + SLOGAN_GAP + p.sloganFontSize * 0.6
    const sloganWeight = Math.max(300, p.font.weight - 200)
    svg += renderText(p.slogan, cx, sloganY, p.sloganFontSize, sloganWeight, p.font.family, p.palette.secondary, p.font.letterSpacing * 2)
  }

  return wrapSvg(totalW, totalH, svg)
}

function buildLettermark(p: BuildParams): string {
  const initials = p.brandName.split(/\s+/).map(w => w[0]).slice(0, 3).join('').toUpperCase()
  const letterSize = p.fontSize * 1.5
  const measured = measureText(initials, p.font.family, letterSize, p.font.weight)
  const boxSize = Math.max(measured.width + PADDING * 2, letterSize + PADDING * 2)
  const totalH = boxSize + (p.slogan ? p.sloganFontSize + SLOGAN_GAP : 0) + PADDING
  const cx = boxSize / 2

  const bgRect = `<rect x="0" y="0" width="${boxSize}" height="${boxSize}" rx="16" fill="${p.palette.primary}"/>`
  const letters = renderText(initials, cx, PADDING + letterSize * 0.55, letterSize, p.font.weight, p.font.family, p.palette.background, p.font.letterSpacing * 3)

  let slogan = ''
  if (p.slogan) {
    const sloganY = boxSize + SLOGAN_GAP + p.sloganFontSize
    const sloganWeight = Math.max(300, p.font.weight - 200)
    slogan = renderText(p.slogan, cx, sloganY, p.sloganFontSize, sloganWeight, p.font.family, p.palette.text, p.font.letterSpacing * 2)
  }

  return wrapSvg(boxSize, totalH, bgRect + letters + slogan)
}

function buildIconic(p: BuildParams): string {
  if (!p.icon) return buildWordmark(p)
  const iconSize = 64 * p.iconScale
  const nameSize = measureText(p.brandName, p.font.family, p.fontSize, p.font.weight)
  const sloganW = p.slogan ? measureText(p.slogan, p.font.family, p.sloganFontSize, Math.max(300, p.font.weight - 200)).width : 0
  const totalW = Math.max(iconSize, nameSize.width, sloganW) + PADDING * 2
  const totalH = iconSize + ICON_TEXT_GAP + p.fontSize + (p.slogan ? p.sloganFontSize + SLOGAN_GAP : 0) + PADDING * 2
  const cx = totalW / 2

  const iconSvg = renderFilledIcon(p.icon, cx - iconSize / 2, PADDING, iconSize, p.palette.primary)
  const nameY = PADDING + iconSize + ICON_TEXT_GAP + p.fontSize * 0.75
  const nameSvg = renderText(p.brandName, cx, nameY, p.fontSize, p.font.weight, p.font.family, p.palette.primary, p.font.letterSpacing)

  let sloganSvg = ''
  if (p.slogan) {
    const sloganY = nameY + SLOGAN_GAP + p.sloganFontSize * 0.6
    sloganSvg = renderText(p.slogan, cx, sloganY, p.sloganFontSize, Math.max(300, p.font.weight - 200), p.font.family, p.palette.secondary, p.font.letterSpacing * 2)
  }

  return wrapSvg(totalW, totalH, iconSvg + nameSvg + sloganSvg)
}

function buildCombination(p: BuildParams): string {
  if (!p.icon) return buildWordmark(p)
  const iconSize = 56 * p.iconScale
  const nameSize = measureText(p.brandName, p.font.family, p.fontSize, p.font.weight)
  const sloganW = p.slogan ? measureText(p.slogan, p.font.family, p.sloganFontSize, Math.max(300, p.font.weight - 200)).width : 0
  const textW = Math.max(nameSize.width, sloganW)
  const totalW = iconSize + ICON_TEXT_GAP + textW + PADDING * 2
  const contentH = Math.max(iconSize, p.fontSize + (p.slogan ? p.sloganFontSize + SLOGAN_GAP : 0))
  const totalH = contentH + PADDING * 2
  const iconX = PADDING
  const iconY = (totalH - iconSize) / 2
  const textX = iconX + iconSize + ICON_TEXT_GAP
  const textCx = textX + textW / 2

  const iconSvg = renderFilledIcon(p.icon, iconX, iconY, iconSize, p.palette.primary)
  const nameY = p.slogan ? totalH / 2 - 2 : (totalH + p.fontSize * 0.3) / 2
  const nameSvg = renderText(p.brandName, textCx, nameY, p.fontSize, p.font.weight, p.font.family, p.palette.primary, p.font.letterSpacing, 'middle')

  let sloganSvg = ''
  if (p.slogan) {
    const sloganY = nameY + p.sloganFontSize + 4
    sloganSvg = renderText(p.slogan, textCx, sloganY, p.sloganFontSize, Math.max(300, p.font.weight - 200), p.font.family, p.palette.secondary, p.font.letterSpacing * 2, 'middle')
  }

  return wrapSvg(totalW, totalH, iconSvg + nameSvg + sloganSvg)
}

function buildEmblem(p: BuildParams): string {
  const nameSize = measureText(p.brandName, p.font.family, p.fontSize, p.font.weight)
  const iconSize = p.icon ? 40 * p.iconScale : 0
  const innerW = Math.max(nameSize.width + 32, iconSize + 16)
  const diameter = innerW + PADDING * 2
  const cx = diameter / 2
  const cy = diameter / 2
  const totalH = diameter + (p.slogan ? p.sloganFontSize + SLOGAN_GAP + 4 : 0)

  const bgCircle = `<circle cx="${cx}" cy="${cy}" r="${diameter / 2}" fill="${p.palette.primary}"/>`

  let iconSvg = ''
  let nameOffset = -8
  if (p.icon) {
    iconSvg = renderFilledIcon(p.icon, cx - iconSize / 2, cy - p.fontSize / 2 - iconSize - 4, iconSize, p.palette.background)
    nameOffset = 4
  }

  const nameY = cy + nameOffset + p.fontSize * 0.35
  const nameSvg = renderText(p.brandName, cx, nameY, p.fontSize, p.font.weight, p.font.family, p.palette.background, p.font.letterSpacing)

  let sloganSvg = ''
  if (p.slogan) {
    const sloganY = diameter + SLOGAN_GAP + p.sloganFontSize
    sloganSvg = renderText(p.slogan, cx, sloganY, p.sloganFontSize, Math.max(300, p.font.weight - 200), p.font.family, p.palette.text, p.font.letterSpacing * 2)
  }

  return wrapSvg(diameter, totalH, bgCircle + iconSvg + nameSvg + sloganSvg)
}

function wrapSvg(w: number, h: number, content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(w)} ${Math.ceil(h)}" width="${Math.ceil(w)}" height="${Math.ceil(h)}">${content}</svg>`
}

// --- Main builder ---

export function buildLogoSvg(params: BuildParams): string {
  switch (inferEffectiveType(params.icon, params.layout)) {
    case 'wordmark': return buildWordmark(params)
    case 'lettermark': return buildLettermark(params)
    case 'iconic': return buildIconic(params)
    case 'combination': return buildCombination(params)
    case 'emblem': return buildEmblem(params)
    default: return buildWordmark(params)
  }
}

function inferEffectiveType(icon: IconDef | null, layout: LayoutConfig): LogoType {
  if (layout.compatibleLogoTypes.length === 1) return layout.compatibleLogoTypes[0]
  if (!icon) return 'wordmark'
  return layout.compatibleLogoTypes[0]
}
