import type { NanoBananaRatio, NanoBananaSize } from '@/types/ai-image'

const DEFAULT_BASE = 'https://api.apiyi.com'
const ENDPOINT_PATH = '/v1beta/models/gemini-3.1-flash-image-preview:generateContent'

/** Nano Banana 2 文生图 */
export async function nanoBananaGenerate(
  apiKey: string,
  prompt: string,
  options: {
    aspectRatio?: NanoBananaRatio
    imageSize?: NanoBananaSize
    baseUrl?: string
    referenceImage?: string // base64
  } = {},
): Promise<string> {
  const baseUrl = options.baseUrl || DEFAULT_BASE
  const aspectRatio = options.aspectRatio || '1:1'
  const imageSize = options.imageSize || '1K'

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt },
  ]

  if (options.referenceImage) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: options.referenceImage,
      },
    })
  }

  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ['IMAGE'] as string[],
    },
  }

  // 带超时的 fetch（图片生成可能需要 30-120 秒）
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180_000)

  let res: Response
  try {
    res = await fetch(`${baseUrl}${ENDPOINT_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timeoutId)
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试')
    }
    throw new Error(`网络请求失败: ${e instanceof Error ? e.message : String(e)}`)
  }
  clearTimeout(timeoutId)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    const msg = (err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }

  const data = await res.json() as Record<string, unknown>

  // 检查 API 级别错误
  if (data.error) {
    const errObj = data.error as { message?: string; code?: string }
    throw new Error(errObj.message || errObj.code || 'API 返回错误')
  }

  const candidates = data.candidates as Array<{
    content?: {
      parts?: Array<Record<string, unknown>>
    }
    finishReason?: string
  }> | undefined

  if (!candidates?.length) {
    throw new Error('API 未返回候选结果')
  }

  const responseParts = candidates[0]?.content?.parts
  if (!responseParts?.length) {
    throw new Error('API 返回结果中无内容')
  }

  // 查找包含 inlineData 的 part
  const imagePart = responseParts.find((p): p is Record<string, unknown> & {
    inlineData: { mimeType: string; data: string }
  } => {
    return typeof p === 'object' && p !== null && 'inlineData' in p
      && typeof (p as Record<string, unknown>).inlineData === 'object'
  })

  if (!imagePart?.inlineData?.data) {
    // 降级：检查是否有文本内容（可能是纯文本响应）
    const textPart = responseParts.find(p => typeof p === 'object' && 'text' in p)
    if (textPart && typeof textPart.text === 'string') {
      throw new Error(`未返回图片数据，模型响应: ${textPart.text.substring(0, 200)}`)
    }
    const partKeys = responseParts.map(p => Object.keys(p)).join(', ')
    throw new Error(`未返回图片数据 (响应 parts 键: ${partKeys})`)
  }

  const { mimeType, data: b64 } = imagePart.inlineData
  return `data:${mimeType};base64,${b64}`
}
