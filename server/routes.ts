import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { v4 as uuid } from 'uuid'
import { ensureYtDlp, getVideoInfo, downloadVideo, getDownloadDir } from './ytdlp.js'
import { getActiveModels, getModelByProviderId } from './models.js'
import { proxyMjSubmit, proxyMjFetchTask, proxyDoubaoGenerate, proxyNanoBananaGenerate } from './image-proxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApiRouter(): express.Router {
  const router = express.Router()
  router.use(cors())
  router.use(express.json())

  // Ensure download dir
  const downloadDir = getDownloadDir()
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true })
  }

  // Serve downloaded files
  router.use('/files', express.static(downloadDir))

  // POST /api/info - Get video metadata
  router.post('/info', async (req, res) => {
    try {
      const { url } = req.body
      if (!url) {
        res.status(400).json({ error: 'Missing url' })
        return
      }

      const info = await getVideoInfo(url)

      const isPlaylist = Array.isArray(info.entries) && info.entries.length > 0

      res.json({
        id: info.id,
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration || 0,
        author: info.uploader || '',
        platform: info._platform || 'unknown',
        isPlaylist,
        entries: isPlaylist
          ? info.entries!.map((e, i) => ({
            id: e.id,
            index: i + 1,
            title: e.title,
            duration: e.duration || 0,
            thumbnail: e.thumbnail || '',
          }))
          : undefined,
      })
    } catch (err: any) {
      console.error('[/api/info] Error:', err.message)
      res.status(500).json({ error: err.message || 'Failed to get video info' })
    }
  })

  // POST /api/download - Download video, stream progress via SSE
  router.post('/download', async (req, res) => {
    const { url, mode, quality, format } = req.body
    if (!url || !mode || !quality || !format) {
      res.status(400).json({ error: 'Missing required fields: url, mode, quality, format' })
      return
    }

    const jobId = uuid()
    const ext = mode === 'audio' ? format : format
    const outputTemplate = path.join(downloadDir, `${jobId}.%(ext)s`)

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    sendEvent('start', { jobId })

    try {
      await downloadVideo(
        url,
        { mode, quality, format, outputTemplate },
        (progress) => {
          sendEvent('progress', progress)
        },
        req.socket.destroyed ? null : null,
      )

      // Find the actual output file (yt-dlp may change extension)
      const baseName = path.join(downloadDir, jobId)
      let filePath = ''
      const possibleExts = [ext, 'mp4', 'webm', 'mp3', 'aac', 'flac', 'mkv', 'm4a', 'ogg', 'opus']
      for (const e of possibleExts) {
        const candidate = `${baseName}.${e}`
        if (fs.existsSync(candidate)) {
          filePath = candidate
          break
        }
      }

      if (!filePath) {
        // Try to find any file starting with jobId
        const files = fs.readdirSync(downloadDir)
        const match = files.find(f => f.startsWith(jobId))
        if (match) filePath = path.join(downloadDir, match)
      }

      const fileName = filePath ? path.basename(filePath) : `${jobId}.${ext}`
      const fileSize = filePath ? fs.statSync(filePath).size : 0

      sendEvent('done', {
        jobId,
        fileName,
        fileSize,
        downloadUrl: `/api/files/${fileName}`,
      })
    } catch (err: any) {
      sendEvent('error', { jobId, error: err.message || 'Download failed' })
    }

    res.end()
  })

  // GET /api/models - 获取可用模型列表（脱敏，无 api_key）
  router.get('/models', async (_req, res) => {
    try {
      const models = await getActiveModels()
      const safe = models.map((m) => ({
        providerId: m.providerId,
        providerName: m.providerName,
        priority: m.priority,
        endpoint: m.endpoint,
        extraConfig: m.extraConfig,
      }))
      res.json({ models: safe })
    } catch (err: any) {
      console.error('[/api/models] Error:', err.message)
      res.status(500).json({ error: '获取模型列表失败' })
    }
  })

  // ─── AI 图片生成代理路由（API Key 不出后端）───

  // POST /api/image/generate - 通用生成入口
  router.post('/image/generate', async (req, res) => {
    try {
      const { engine, prompt, params } = req.body as {
        engine: string; prompt: string; params?: Record<string, unknown>
      }
      if (!engine || !prompt) { res.status(400).json({ error: 'Missing engine or prompt' }); return }

      if (engine === 'midjourney') {
        const apiKey = process.env.MJ_API_KEY || ''
        const baseUrl = process.env.MJ_BASE_URL || 'https://api.geekai.pro'
        if (!apiKey) { res.status(500).json({ error: 'Midjourney 未配置' }); return }
        const result = await proxyMjSubmit(apiKey, baseUrl, '/mj/submit/imagine', {
          prompt,
          base64Array: (params?.base64Array as string[]) || [],
          botType: (params?.botType as string) || 'MID_JOURNEY',
        })
        res.json(result)
      } else if (engine === 'doubao') {
        const model = await getModelByProviderId('jimeng')
        if (!model) { res.status(500).json({ error: '豆包模型未配置' }); return }
        const cfg = (model.extraConfig || {}) as Record<string, string>
        const results = await proxyDoubaoGenerate(
          model.apiKey, model.endpoint,
          cfg.imageGeneratePath || '/images/generations',
          prompt,
          { model: cfg.model || 'doubao-seedream-4-0-250828', size: (params?.size as string) || '2K', responseFormat: (params?.responseFormat as string) || 'url' },
        )
        res.json({ data: results })
      } else if (engine === 'nanobanana') {
        const model = await getModelByProviderId('banana')
        if (!model) { res.status(500).json({ error: 'Nano Banana 模型未配置' }); return }
        const dataUrl = await proxyNanoBananaGenerate(model.apiKey, model.endpoint, prompt, {
          referenceImage: params?.referenceImage as string | undefined,
        })
        res.json({ dataUrl })
      } else {
        res.status(400).json({ error: `Unknown engine: ${engine}` })
      }
    } catch (err: any) {
      console.error('[/api/image/generate] Error:', err.message)
      res.status(500).json({ error: err.message || '生成失败' })
    }
  })

  // GET /api/image/mj-task/:taskId - 查询 Midjourney 任务状态
  router.get('/image/mj-task/:taskId', async (req, res) => {
    try {
      const apiKey = process.env.MJ_API_KEY || ''
      const baseUrl = process.env.MJ_BASE_URL || 'https://api.geekai.pro'
      if (!apiKey) { res.status(500).json({ error: 'Midjourney 未配置' }); return }
      const result = await proxyMjFetchTask(apiKey, baseUrl, req.params.taskId)
      res.json(result)
    } catch (err: any) {
      console.error('[/api/image/mj-task] Error:', err.message)
      res.status(500).json({ error: err.message || '查询失败' })
    }
  })

  // POST /api/image/mj-change - Midjourney U/V/R 操作
  router.post('/image/mj-change', async (req, res) => {
    try {
      const { taskId, action } = req.body as { taskId: string; action: string }
      if (!taskId || !action) { res.status(400).json({ error: 'Missing taskId or action' }); return }
      const apiKey = process.env.MJ_API_KEY || ''
      const baseUrl = process.env.MJ_BASE_URL || 'https://api.geekai.pro'
      if (!apiKey) { res.status(500).json({ error: 'Midjourney 未配置' }); return }
      const result = await proxyMjSubmit(apiKey, baseUrl, '/mj/submit/simple-change', {
        content: `${taskId} ${action}`,
      })
      res.json(result)
    } catch (err: any) {
      console.error('[/api/image/mj-change] Error:', err.message)
      res.status(500).json({ error: err.message || '操作失败' })
    }
  })

  // POST /api/image/mj-describe - Midjourney 图生文
  router.post('/image/mj-describe', async (req, res) => {
    try {
      const { base64 } = req.body as { base64: string }
      if (!base64) { res.status(400).json({ error: 'Missing base64' }); return }
      const apiKey = process.env.MJ_API_KEY || ''
      const baseUrl = process.env.MJ_BASE_URL || 'https://api.geekai.pro'
      if (!apiKey) { res.status(500).json({ error: 'Midjourney 未配置' }); return }
      const result = await proxyMjSubmit(apiKey, baseUrl, '/mj/submit/describe', { base64 })
      res.json(result)
    } catch (err: any) {
      console.error('[/api/image/mj-describe] Error:', err.message)
      res.status(500).json({ error: err.message || '提交失败' })
    }
  })

  // GET /api/status - Check yt-dlp availability
  router.get('/status', async (_req, res) => {
    try {
      const yt = await ensureYtDlp()
      const version = await yt.getVersion()
      res.json({ available: true, version })
    } catch {
      res.json({ available: false, version: null })
    }
  })

  return router
}

export async function startServer(port = 3001) {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // API routes
  app.use('/api', createApiRouter())

  // Production: serve static frontend files
  const distDir = path.join(__dirname, '..', 'dist')
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir))
    // SPA fallback: non-API, non-file routes serve index.html (Express 5 compatible)
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
        res.sendFile(path.join(distDir, 'index.html'))
      } else {
        next()
      }
    })
    console.log('[server] Serving static files from dist/')
  }

  // Try to ensure yt-dlp on startup
  try {
    const yt = await ensureYtDlp()
    const ver = await yt.getVersion()
    console.log(`[server] yt-dlp ready: ${ver}`)
  } catch (err: any) {
    console.warn(`[server] yt-dlp not available: ${err.message}`)
    console.warn('[server] Will attempt to download on first use')
  }

  return new Promise<void>((resolve) => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`[server] Server running on http://0.0.0.0:${port}`)
      resolve()
    })
  })
}
