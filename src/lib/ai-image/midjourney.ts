import type { MjTask, MjSubmitResponse } from '@/types/ai-image'

const DEFAULT_BASE = 'https://api.geekai.pro'

function getHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }
}

/** 提交 Imagine 绘图任务 */
export async function mjSubmitImagine(
  apiKey: string,
  prompt: string,
  baseUrl: string = DEFAULT_BASE,
  options?: { base64Array?: string[]; botType?: string },
): Promise<MjSubmitResponse> {
  const res = await fetch(`${baseUrl}/mj/submit/imagine`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      prompt,
      base64Array: options?.base64Array || [],
      botType: options?.botType || 'MID_JOURNEY',
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`)
  }
  return res.json()
}

/** 查询任务状态 */
export async function mjFetchTask(
  apiKey: string,
  taskId: string,
  baseUrl: string = DEFAULT_BASE,
): Promise<MjTask> {
  const res = await fetch(`${baseUrl}/mj/task/${taskId}`, {
    headers: getHeaders(apiKey),
  })
  if (!res.ok) throw new Error(`查询任务失败: HTTP ${res.status}`)
  return res.json()
}

/** 简化变更操作 (U1-U4, V1-V4, R) */
export async function mjSubmitSimpleChange(
  apiKey: string,
  taskId: string,
  action: string,
  baseUrl: string = DEFAULT_BASE,
): Promise<MjSubmitResponse> {
  const res = await fetch(`${baseUrl}/mj/submit/simple-change`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({ content: `${taskId} ${action}` }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`)
  }
  return res.json()
}

/** 提交 Describe (图生文) 任务 */
export async function mjSubmitDescribe(
  apiKey: string,
  base64Image: string,
  baseUrl: string = DEFAULT_BASE,
): Promise<MjSubmitResponse> {
  const res = await fetch(`${baseUrl}/mj/submit/describe`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({ base64: base64Image }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`)
  }
  return res.json()
}

/** 轮询直到任务完成 */
export async function mjPollUntilDone(
  apiKey: string,
  taskId: string,
  baseUrl: string = DEFAULT_BASE,
  onProgress?: (task: MjTask) => void,
  interval = 3000,
): Promise<MjTask> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const task = await mjFetchTask(apiKey, taskId, baseUrl)
        onProgress?.(task)
        if (task.status === 'SUCCESS' || task.status === 'FAILURE') {
          resolve(task)
          return
        }
        setTimeout(poll, interval)
      } catch (e) {
        reject(e)
      }
    }
    poll()
  })
}
