import { useState, useCallback, useRef } from 'react'
import type {
  ImageEngine,
  GenerateTask,
  TaskStatus,
  MidjourneyParams,
  DoubaoParams,
  NanoBananaParams,
  MjTask,
} from '@/types/ai-image'

let taskIdCounter = 0
function nextId() {
  return `task-${Date.now()}-${++taskIdCounter}`
}

/** 通用后端请求封装 */
async function apiPost(path: string, body: unknown) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

async function apiGet(path: string) {
  const res = await fetch(path)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export function useAiImage() {
  const [tasks, setTasks] = useState<GenerateTask[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const pollTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  const updateTask = useCallback((id: string, patch: Partial<GenerateTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }, [])

  const addTask = useCallback((task: GenerateTask) => {
    setTasks(prev => [task, ...prev])
    setActiveTaskId(task.id)
    return task.id
  }, [])

  const stopPolling = useCallback((id: string) => {
    const timer = pollTimers.current.get(id)
    if (timer) {
      clearInterval(timer)
      pollTimers.current.delete(id)
    }
  }, [])

  // Midjourney 轮询 — 通过后端代理
  const startMjPolling = useCallback((internalId: string, mjTaskId: string) => {
    stopPolling(internalId)
    const timer = setInterval(async () => {
      try {
        const mjTask: MjTask = await apiGet(`/api/image/mj-task/${mjTaskId}`)

        let status: TaskStatus = 'processing'
        if (mjTask.status === 'SUCCESS') status = 'success'
        else if (mjTask.status === 'FAILURE') status = 'failure'
        else if (mjTask.status === 'NOT_START' || mjTask.status === 'SUBMITTED') status = 'queued'

        updateTask(internalId, {
          status,
          progress: mjTask.progress || '',
          imageUrl: mjTask.imageUrl || '',
          error: mjTask.failReason || '',
          mjTask,
          images: mjTask.imageUrl ? [mjTask.imageUrl] : [],
        })

        if (mjTask.status === 'SUCCESS' || mjTask.status === 'FAILURE') {
          stopPolling(internalId)
        }
      } catch (e) {
        updateTask(internalId, {
          status: 'failure',
          error: e instanceof Error ? e.message : '查询任务失败',
        })
        stopPolling(internalId)
      }
    }, 4000)
    pollTimers.current.set(internalId, timer)
  }, [updateTask, stopPolling])

  // ─── Midjourney 文生图 ───
  const generateMidjourney = useCallback(async (params: MidjourneyParams) => {
    const id = nextId()
    addTask({
      id, engine: 'midjourney', status: 'submitting', prompt: params.prompt,
      progress: '', imageUrl: '', error: '', createdAt: Date.now(), images: [],
    })

    try {
      const resp = await apiPost('/api/image/generate', {
        engine: 'midjourney',
        prompt: params.prompt,
        params: { base64Array: params.base64Array, botType: params.botType },
      })

      if (resp.code === 1 && resp.result) {
        updateTask(id, { status: 'queued', mjTask: { id: resp.result } as MjTask })
        startMjPolling(id, resp.result)
      } else if (resp.code === 22) {
        updateTask(id, { status: 'queued', progress: '排队中...' })
        if (resp.result) startMjPolling(id, resp.result)
      } else if (resp.code === 23) {
        updateTask(id, { status: 'failure', error: '队列已满，请稍后重试' })
      } else if (resp.code === 24) {
        updateTask(id, { status: 'failure', error: 'Prompt 可能包含敏感词' })
      } else {
        updateTask(id, { status: 'failure', error: resp.description || '提交失败' })
      }
      return id
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '提交失败' })
      return id
    }
  }, [addTask, updateTask, startMjPolling])

  // ─── Midjourney 变更操作 (U1-U4, V1-V4, R) ───
  const mjChange = useCallback(async (sourceTaskId: string, action: string) => {
    const sourceTask = tasks.find(t => t.id === sourceTaskId)
    const mjTaskId = sourceTask?.mjTask?.id
    if (!mjTaskId) throw new Error('找不到源任务')

    const id = nextId()
    addTask({
      id, engine: 'midjourney', status: 'submitting', prompt: `${action} from ${sourceTask.prompt}`,
      progress: '', imageUrl: '', error: '', createdAt: Date.now(), images: [],
    })

    try {
      const resp = await apiPost('/api/image/mj-change', { taskId: mjTaskId, action })
      if (resp.code === 1 && resp.result) {
        updateTask(id, { status: 'queued' })
        startMjPolling(id, resp.result)
      } else if (resp.code === 21 && resp.properties) {
        const props = resp.properties as { status?: string; imageUrl?: string }
        updateTask(id, {
          status: props.status === 'SUCCESS' ? 'success' : 'processing',
          imageUrl: props.imageUrl || '',
          images: props.imageUrl ? [props.imageUrl] : [],
        })
      } else {
        updateTask(id, { status: 'failure', error: resp.description || '操作失败' })
      }
      return id
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '操作失败' })
      return id
    }
  }, [tasks, addTask, updateTask, startMjPolling])

  // ─── Midjourney 图生文 (Describe) ───
  const mjDescribe = useCallback(async (base64Image: string) => {
    const id = nextId()
    addTask({
      id, engine: 'midjourney', status: 'submitting', prompt: '[Describe] 图生文',
      progress: '', imageUrl: '', error: '', createdAt: Date.now(), images: [],
    })

    try {
      const resp = await apiPost('/api/image/mj-describe', { base64: base64Image })
      if (resp.code === 1 && resp.result) {
        updateTask(id, { status: 'queued' })
        startMjPolling(id, resp.result)
      } else {
        updateTask(id, { status: 'failure', error: resp.description || '提交失败' })
      }
      return id
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '提交失败' })
      return id
    }
  }, [addTask, updateTask, startMjPolling])

  // ─── 豆包 Seedream 文生图 ───
  const generateDoubao = useCallback(async (params: DoubaoParams) => {
    const id = nextId()
    addTask({
      id, engine: 'doubao', status: 'submitting', prompt: params.prompt,
      progress: '', imageUrl: '', error: '', createdAt: Date.now(), images: [],
    })

    try {
      const result = await apiPost('/api/image/generate', {
        engine: 'doubao',
        prompt: params.prompt,
        params: { size: params.size, responseFormat: params.responseFormat, model: params.model },
      })

      const results = (result.data || []) as Array<{ url?: string; b64_json?: string }>
      const images = results.map(r => {
        if (r.url) return r.url
        if (r.b64_json) return `data:image/png;base64,${r.b64_json}`
        return ''
      }).filter(Boolean)

      updateTask(id, { status: 'success', images, imageUrl: images[0] || '' })
      return id
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '生成失败' })
      return id
    }
  }, [addTask, updateTask])

  // ─── Nano Banana 2 文生图 ───
  const generateNanoBanana = useCallback(async (params: NanoBananaParams) => {
    const id = nextId()
    addTask({
      id, engine: 'nanobanana', status: 'submitting', prompt: params.prompt,
      progress: '', imageUrl: '', error: '', createdAt: Date.now(), images: [],
    })

    try {
      updateTask(id, { status: 'processing', progress: '生成中...' })
      const result = await apiPost('/api/image/generate', {
        engine: 'nanobanana',
        prompt: params.prompt,
        params: {
          referenceImage: params.referenceImage,
        },
      })

      const dataUrl = result.dataUrl as string
      updateTask(id, { status: 'success', images: [dataUrl], imageUrl: dataUrl })
      return id
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '生成失败' })
      return id
    }
  }, [addTask, updateTask])

  // ─── 通用生成入口 ───
  const generate = useCallback(async (engine: ImageEngine, prompt: string, extra?: Record<string, unknown>) => {
    switch (engine) {
      case 'midjourney':
        return generateMidjourney({ prompt, ...(extra as Partial<MidjourneyParams>) })
      case 'doubao':
        return generateDoubao({
          prompt,
          size: (extra?.size as string) || '2K',
          responseFormat: (extra?.responseFormat as string) || 'url',
          model: extra?.model as string | undefined,
        })
      case 'nanobanana':
        return generateNanoBanana({
          prompt,
          aspectRatio: (extra?.aspectRatio as NanoBananaParams['aspectRatio']) || '1:1',
          imageSize: (extra?.imageSize as NanoBananaParams['imageSize']) || '1K',
          referenceImage: extra?.referenceImage as string | undefined,
        })
    }
  }, [generateMidjourney, generateDoubao, generateNanoBanana])

  const removeTask = useCallback((id: string) => {
    stopPolling(id)
    setTasks(prev => prev.filter(t => t.id !== id))
    if (activeTaskId === id) setActiveTaskId(null)
  }, [activeTaskId, stopPolling])

  const clearTasks = useCallback(() => {
    pollTimers.current.forEach((_, id) => stopPolling(id))
    setTasks([])
    setActiveTaskId(null)
  }, [stopPolling])

  const activeTask = tasks.find(t => t.id === activeTaskId) || null

  return {
    tasks, activeTask, activeTaskId, setActiveTaskId,
    generate, generateMidjourney, generateDoubao, generateNanoBanana,
    mjChange, mjDescribe, removeTask, clearTasks,
  }
}
