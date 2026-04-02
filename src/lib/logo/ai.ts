import type { LogoConfig, AiProvider } from '@/types/logo'

export interface AiGenerateResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export function buildLogoPrompt(config: LogoConfig): string {
  const styleMap: Record<string, string> = {
    modern: 'modern and clean, flat design, geometric shapes',
    classic: 'classic and timeless, serif typography, established feel',
    playful: 'playful and fun, rounded shapes, bright and friendly',
    elegant: 'elegant and refined, thin lines, sophisticated spacing',
    minimalist: 'minimalist, extremely simple, single element, lots of whitespace',
    bold: 'bold and impactful, heavy typography, strong presence',
    geometric: 'geometric and structured, angular shapes, precise alignment',
    handwritten: 'handwritten style, organic curves, warm and personal',
  }

  const typeMap: Record<string, string> = {
    wordmark: 'text-only wordmark featuring the brand name',
    lettermark: 'lettermark using the initials/monogram',
    iconic: 'icon-based logo with an icon above the brand name',
    combination: 'combination mark with icon beside the brand name',
    emblem: 'emblem style with all elements enclosed in a shape',
  }

  const parts = [
    `A professional ${styleMap[config.style] || 'modern'} logo design`,
    `for a ${config.industry} brand called "${config.brandName}"`,
    `The logo should be a ${typeMap[config.logoType] || 'combination mark'}`,
    `Color palette: ${config.colorMood} tones`,
    config.slogan ? `Include the tagline: "${config.slogan}"` : '',
    'Clean vector design on a white background, professional quality, suitable for business use',
    'No mockups, no text artifacts, no misspelled words',
  ]

  return parts.filter(Boolean).join('. ') + '.'
}

export async function generateWithAi(
  provider: AiProvider,
  prompt: string,
  apiKey: string,
  _referenceImage?: string | null,
): Promise<AiGenerateResult> {
  if (!apiKey.trim()) {
    return { success: false, error: '请输入 API Key' }
  }

  if (provider === 'apiyi') {
    return generateWithApiyi(prompt, apiKey, _referenceImage)
  }

  return generateWithOpenai(prompt, apiKey, _referenceImage)
}

async function generateWithOpenai(
  prompt: string,
  apiKey: string,
  _referenceImage?: string | null,
): Promise<AiGenerateResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'b64_json',
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const msg = (err as { error?: { message?: string } }).error?.message || response.statusText
      if (response.status === 401) return { success: false, error: 'API Key 无效' }
      if (response.status === 429) return { success: false, error: '请求过于频繁，请稍后重试' }
      return { success: false, error: msg }
    }

    const data = await response.json() as { data: { b64_json: string }[] }
    const b64 = data.data?.[0]?.b64_json
    if (!b64) return { success: false, error: '未返回图片数据' }

    return { success: true, imageUrl: `data:image/png;base64,${b64}` }
  } catch {
    return { success: false, error: '网络错误，请检查连接' }
  }
}

async function generateWithApiyi(
  prompt: string,
  apiKey: string,
  referenceImage?: string | null,
): Promise<AiGenerateResult> {
  try {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
    ]

    if (referenceImage) {
      const matches = referenceImage.match(/^data:(image\/\w+);base64,(.+)$/)
      if (matches) {
        parts.push({
          inlineData: { mimeType: matches[1], data: matches[2] },
        })
      }
    }

    const response = await fetch(
      'https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
          },
        }),
      },
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const msg =
        (err as { error?: { message?: string } }).error?.message || response.statusText
      if (response.status === 401) return { success: false, error: 'API Key 无效' }
      if (response.status === 429) return { success: false, error: '请求过于频繁，请稍后重试' }
      return { success: false, error: msg }
    }

    const data = (await response.json()) as {
      candidates: Array<{
        content: {
          parts: Array<{ inlineData?: { mimeType: string; data: string } }>
        }
      }>
    }
    const b64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
    if (!b64) return { success: false, error: '未返回图片数据' }

    return { success: true, imageUrl: `data:image/png;base64,${b64}` }
  } catch {
    return { success: false, error: '网络错误，请检查连接' }
  }
}
