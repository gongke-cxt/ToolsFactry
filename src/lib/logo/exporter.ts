import type { LogoVariant } from '@/types/logo'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

function svgToBlob(svgString: string): Blob {
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
}

async function svgToPng(svgString: string, size: number): Promise<Blob> {
  // Ensure fonts are embedded for canvas rendering
  const embeddedSvg = await embedFontsInSvg(svgString)
  const blob = svgToBlob(embeddedSvg)
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, size, size)
      // Scale to fit while maintaining aspect ratio
      const scale = Math.min(size / img.width, size / img.height)
      const dx = (size - img.width * scale) / 2
      const dy = (size - img.height * scale) / 2
      ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) resolve(blob)
          else reject(new Error('PNG generation failed'))
        },
        'image/png',
        1.0
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG load failed'))
    }
    img.src = url
  })
}

async function fetchFontBase64(family: string, weight: number): Promise<string | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`
    const cssRes = await fetch(cssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const cssText = await cssRes.text()

    // Extract woff2 URL
    const urlMatch = cssText.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/)
    if (!urlMatch) return null

    const fontUrl = urlMatch[1]
    const fontRes = await fetch(fontUrl)
    const buffer = await fontRes.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  } catch {
    return null
  }
}

async function embedFontsInSvg(svgString: string): Promise<string> {
  // Extract font-family from the SVG
  const fontMatches = [...svgString.matchAll(/font-family="([^"]+)"/g)]
  const fontFamilies = [...new Set(fontMatches.map(m => m[1]))]

  if (fontFamilies.length === 0) return svgString

  const weightMatches = [...svgString.matchAll(/font-weight="(\d+)"/g)]
  const weights = [...new Set(weightMatches.map(m => parseInt(m[1])))]

  const fontFaceRules: string[] = []
  for (const family of fontFamilies) {
    const cleanFamily = family.replace(/^'|'$/g, '').split(',')[0].trim()
    for (const weight of weights.length > 0 ? weights : [400]) {
      const base64 = await fetchFontBase64(cleanFamily, weight)
      if (base64) {
        fontFaceRules.push(
          `@font-face{font-family:'${cleanFamily}';src:url('data:font/woff2;base64,${base64}') format('woff2');font-weight:${weight};font-style:normal;}`
        )
      }
    }
  }

  if (fontFaceRules.length === 0) return svgString

  const styleBlock = `<style>${fontFaceRules.join('')}</style>`

  // Insert style into SVG
  if (svgString.includes('<defs>')) {
    return svgString.replace('<defs>', `<defs>${styleBlock}`)
  } else if (svgString.includes('>')) {
    // Insert after the first tag close (opening svg tag)
    const idx = svgString.indexOf('>') + 1
    return svgString.slice(0, idx) + `<defs>${styleBlock}</defs>` + svgString.slice(idx)
  }
  return svgString
}

export async function exportSvg(variant: LogoVariant, brandName: string): Promise<void> {
  const embedded = await embedFontsInSvg(variant.svgString)
  const blob = new Blob([embedded], { type: 'image/svg+xml;charset=utf-8' })
  saveAs(blob, `${brandName}-logo.svg`)
}

export async function exportPng(variant: LogoVariant, size: number, brandName: string): Promise<void> {
  const blob = await svgToPng(variant.svgString, size)
  saveAs(blob, `${brandName}-${size}.png`)
}

export async function exportAll(variant: LogoVariant, brandName: string): Promise<void> {
  const sizes = [64, 128, 256, 512, 1024]
  const zip = new JSZip()

  // Add SVG
  const embeddedSvg = await embedFontsInSvg(variant.svgString)
  zip.file(`${brandName}-logo.svg`, embeddedSvg)

  // Add PNGs in parallel
  await Promise.all(
    sizes.map(async (size) => {
      const pngBlob = await svgToPng(variant.svgString, size)
      zip.file(`${brandName}-${size}.png`, pngBlob)
    })
  )

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${brandName}-logo-pack.zip`)
}
