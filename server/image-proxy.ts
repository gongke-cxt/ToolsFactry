/**
 * AI 图片生成后端代理
 * 所有外部 API 调用在此完成，API Key 不暴露给前端
 */

// ─── Midjourney 代理 ───

export async function proxyMjSubmit(
  apiKey: string,
  baseUrl: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function proxyMjFetchTask(
  apiKey: string,
  baseUrl: string,
  taskId: string,
): Promise<unknown> {
  const res = await fetch(`${baseUrl}/mj/task/${taskId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  })
  if (!res.ok) throw new Error(`查询任务失败: HTTP ${res.status}`)
  return res.json()
}

// ─── 豆包 Seedream 代理 ───

export async function proxyDoubaoGenerate(
  apiKey: string,
  endpoint: string,
  imageGeneratePath: string,
  prompt: string,
  options: {
    model?: string
    size?: string
    responseFormat?: string
  } = {},
): Promise<unknown> {
  const model = options.model || 'doubao-seedream-4-0-250828'
  const size = options.size || '2K'
  const responseFormat = options.responseFormat || 'url'

  const url = `${endpoint}${imageGeneratePath}`
  const res = await fetch(url, {
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
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`)
  }

  const data = await res.json() as { data: unknown[] }
  return data.data || []
}

// ─── Nano Banana 2 代理 ───

/** 从 data URL 中提取 { mimeType, base64 } */
function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) throw new Error('无效的 Data URL 格式')
  return { mimeType: match[1], base64: match[2] }
}

export async function proxyNanoBananaGenerate(
  apiKey: string,
  baseUrl: string,
  prompt: string,
  options: {
    referenceImages?: string[]
  } = {},
): Promise<string> {
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt },
  ]

  // 添加参考图（data URL → 提取纯 base64）
  if ((options.referenceImages || []).length > 0) {
    console.log(`[nanobanana] 处理 ${options.referenceImages!.length} 张参考图`)
  }
  for (const dataUrl of (options.referenceImages || [])) {
    try {
      const { mimeType, base64 } = parseDataUrl(dataUrl)
      parts.push({
        inlineData: { mimeType, data: base64 },
      })
    } catch {
      console.warn('[nanobanana] 跳过无效参考图:', dataUrl.substring(0, 50))
    }
  }

  const endpointPath = '/v1beta/models/gemini-3.1-flash-image-preview:generateContent'
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300_000)

  let res: Response
  try {
    res = await fetch(`${baseUrl}${endpointPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['IMAGE'],
        },
      }),
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
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`)
  }

  const data = await res.json() as Record<string, unknown>

  if (data.error) {
    const errObj = data.error as { message?: string }
    throw new Error(errObj.message || 'API 返回错误')
  }

  const candidates = data.candidates as Array<{
    content?: { parts?: Array<Record<string, unknown>> }
  }> | undefined

  if (!candidates?.length) throw new Error('API 未返回候选结果')

  const responseParts = candidates[0]?.content?.parts
  if (!responseParts?.length) throw new Error('API 返回结果中无内容')

  const imagePart = responseParts.find((p) => {
    return typeof p === 'object' && p !== null && 'inlineData' in p
      && typeof p.inlineData === 'object'
  })

  if (!imagePart) {
    const textPart = responseParts.find(p => 'text' in p)
    if (textPart && typeof textPart.text === 'string') {
      throw new Error(`未返回图片数据，模型响应: ${(textPart.text as string).substring(0, 200)}`)
    }
    throw new Error('未返回图片数据')
  }

  const inlineData = imagePart.inlineData as { mimeType: string; data: string }
  return `data:${inlineData.mimeType};base64,${inlineData.data}`
}
