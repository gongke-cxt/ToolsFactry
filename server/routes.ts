import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { v4 as uuid } from 'uuid'
import { ensureYtDlp, getVideoInfo, downloadVideo, getDownloadDir } from './ytdlp.js'
import { getActiveModels } from './models.js'

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

  // GET /api/models - 获取可用模型列表
  router.get('/models', async (_req, res) => {
    try {
      const models = await getActiveModels()
      // 不暴露 api_key 给前端，返回脱敏后的数据
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

  // GET /api/models/config - 获取模型配置（含 api_key，供后端调用用）
  router.get('/models/config', async (_req, res) => {
    try {
      const models = await getActiveModels()
      res.json({ models })
    } catch (err: any) {
      console.error('[/api/models/config] Error:', err.message)
      res.status(500).json({ error: '获取模型配置失败' })
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
