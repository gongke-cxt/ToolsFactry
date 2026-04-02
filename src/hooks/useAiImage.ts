import { useState, useCallback, useRef } from 'react'
import type {
  ImageEngine,
  GenerateTask,
  TaskStatus,
  MidjourneyParams,
  DoubaoParams,
  NanoBananaParams,
  EngineConfig,
  MjTask,
} from '@/types/ai-image'
import { DEFAULT_ENGINE_CONFIG } from '@/types/ai-image'
import { mjSubmitImagine, mjFetchTask, mjSubmitSimpleChange, mjSubmitDescribe } from '@/lib/ai-image/midjourney'
import { doubaoGenerate } from '@/lib/ai-image/doubao'
import { nanoBananaGenerate } from '@/lib/ai-image/nanobanana'

let taskIdCounter = 0
function nextId() {
  return `task-${Date.now()}-${++taskIdCounter}`
}

export function useAiImage() {
  const [tasks, setTasks] = useState<GenerateTask[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [config, setConfig] = useState<EngineConfig>(DEFAULT_ENGINE_CONFIG)
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

  const startMjPolling = useCallback((internalId: string, mjTaskId: string, engineCfg: { baseUrl: string; apiKey: string }) => {
    stopPolling(internalId)
    const timer = setInterval(async () => {
      try {
        const mjTask: MjTask = await mjFetchTask(engineCfg.apiKey, mjTaskId, engineCfg.baseUrl)

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
    const { baseUrl, apiKey } = config.midjourney
    if (!apiKey) throw new Error('请先配置 Midjourney API Key')

    const id = nextId()
    addTask({
      id,
      engine: 'midjourney',
      status: 'submitting',
      prompt: params.prompt,
      progress: '',
      imageUrl: '',
      error: '',
      createdAt: Date.now(),
      images: [],
    })

    try {
      const resp = await mjSubmitImagine(apiKey, params.prompt, baseUrl, {
        base64Array: params.base64Array,
        botType: params.botType,
      })

      if (resp.code === 1 && resp.result) {
        updateTask(id, { status: 'queued', mjTask: { id: resp.result } as MjTask })
        startMjPolling(id, resp.result, { baseUrl, apiKey })
        return id
      } else if (resp.code === 22) {
        updateTask(id, { status: 'queued', progress: '排队中...' })
        if (resp.result) startMjPolling(id, resp.result, { baseUrl, apiKey })
        return id
      } else if (resp.code === 23) {
        updateTask(id, { status: 'failure', error: '队列已满，请稍后重试' })
        return id
      } else if (resp.code === 24) {
        updateTask(id, { status: 'failure', error: 'Prompt 可能包含敏感词' })
        return id
      } else {
        updateTask(id, { status: 'failure', error: resp.description || '提交失败' })
        return id
      }
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '提交失败' })
      return id
    }
  }, [config, addTask, updateTask, startMjPolling])

  // ─── Midjourney 变更操作 (U1-U4, V1-V4, R) ───
  const mjChange = useCallback(async (sourceTaskId: string, action: string) => {
    const { baseUrl, apiKey } = config.midjourney
    if (!apiKey) throw new Error('请先配置 Midjourney API Key')

    // 找到源任务获取 mjTaskId
    const sourceTask = tasks.find(t => t.id === sourceTaskId)
    const mjTaskId = sourceTask?.mjTask?.id
    if (!mjTaskId) throw new Error('找不到源任务')

    const id = nextId()
    addTask({
      id,
      engine: 'midjourney',
      status: 'submitting',
      prompt: `${action} from ${sourceTask.prompt}`,
      progress: '',
      imageUrl: '',
      error: '',
      createdAt: Date.now(),
      images: [],
    })

    try {
      const resp = await mjSubmitSimpleChange(apiKey, mjTaskId, action, baseUrl)
      if (resp.code === 1 && resp.result) {
        updateTask(id, { status: 'queued' })
        startMjPolling(id, resp.result, { baseUrl, apiKey })
      } else if (resp.code === 21 && resp.properties) {
        // 任务已存在，直接获取结果
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
  }, [config, tasks, addTask, updateTask, startMjPolling])

  // ─── Midjourney 图生文 (Describe) ───
  const mjDescribe = useCallback(async (base64Image: string) => {
    const { baseUrl, apiKey } = config.midjourney
    if (!apiKey) throw new Error('请先配置 Midjourney API Key')

    const id = nextId()
    addTask({
      id,
      engine: 'midjourney',
      status: 'submitting',
      prompt: '[Describe] 图生文',
      progress: '',
      imageUrl: '',
      error: '',
      createdAt: Date.now(),
      images: [],
    })

    try {
      const resp = await mjSubmitDescribe(apiKey, base64Image, baseUrl)
      if (resp.code === 1 && resp.result) {
        updateTask(id, { status: 'queued' })
        startMjPolling(id, resp.result, { baseUrl, apiKey })
      } else {
        updateTask(id, { status: 'failure', error: resp.description || '提交失败' })
      }
      return id
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '提交失败' })
      return id
    }
  }, [config, addTask, updateTask, startMjPolling])

  // ─── 豆包 Seedream 文生图 ───
  const generateDoubao = useCallback(async (params: DoubaoParams) => {
    const { apiKey } = config.doubao
    if (!apiKey) throw new Error('请先配置豆包 API Key')

    const id = nextId()
    addTask({
      id,
      engine: 'doubao',
      status: 'submitting',
      prompt: params.prompt,
      progress: '',
      imageUrl: '',
      error: '',
      createdAt: Date.now(),
      images: [],
    })

    try {
      const results = await doubaoGenerate(apiKey, params.prompt, {
        size: params.size,
        responseFormat: params.responseFormat,
        model: params.model,
      })

      const images = results.map(r => {
        if (r.url) return r.url
        if (r.b64_json) return `data:image/png;base64,${r.b64_json}`
        return ''
      }).filter(Boolean)

      updateTask(id, {
        status: 'success',
        images,
        imageUrl: images[0] || '',
      })
      return id
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '生成失败' })
      return id
    }
  }, [config, addTask, updateTask])

  // ─── Nano Banana 2 文生图 ───
  const generateNanoBanana = useCallback(async (params: NanoBananaParams) => {
    const { baseUrl, apiKey } = config.nanobanana
    if (!apiKey) throw new Error('请先配置 Nano Banana API Key')

    const id = nextId()
    addTask({
      id,
      engine: 'nanobanana',
      status: 'submitting',
      prompt: params.prompt,
      progress: '',
      imageUrl: '',
      error: '',
      createdAt: Date.now(),
      images: [],
    })

    try {
      updateTask(id, { status: 'processing', progress: '生成中...' })
      const dataUrl = await nanoBananaGenerate(apiKey, params.prompt, {
        aspectRatio: params.aspectRatio,
        imageSize: params.imageSize,
        baseUrl,
      })

      updateTask(id, {
        status: 'success',
        images: [dataUrl],
        imageUrl: dataUrl,
      })
      return id
    } catch (e) {
      updateTask(id, { status: 'failure', error: e instanceof Error ? e.message : '生成失败' })
      return id
    }
  }, [config, addTask, updateTask])

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
    tasks,
    activeTask,
    activeTaskId,
    setActiveTaskId,
    config,
    setConfig,
    generate,
    generateMidjourney,
    generateDoubao,
    generateNanoBanana,
    mjChange,
    mjDescribe,
    removeTask,
    clearTasks,
  }
}
