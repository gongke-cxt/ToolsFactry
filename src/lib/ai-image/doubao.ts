import type { DoubaoImageResult } from '@/types/ai-image'

const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'

/** 豆包 Seedream 文生图 */
export async function doubaoGenerate(
  apiKey: string,
  prompt: string,
  options: {
    size?: string
    responseFormat?: string
    model?: string
  } = {},
): Promise<DoubaoImageResult[]> {
  const model = options.model || 'doubao-seedream-4-0-250828'
  const size = options.size || '2K'
  const responseFormat = options.responseFormat || 'url'

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
      response_format: responseFormat,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    const msg = (err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }

  const data = await res.json() as { data: DoubaoImageResult[] }
  return data.data || []
}
