import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash2, ListVideo, Video, AlertTriangle } from 'lucide-react'
import { UrlInput } from '@/components/downloader/UrlInput'
import { VideoInfoCard } from '@/components/downloader/VideoInfoCard'
import { FormatSelector } from '@/components/downloader/FormatSelector'
import { DownloadList } from '@/components/downloader/DownloadList'
import { PlaylistView } from '@/components/downloader/PlaylistView'
import type { DownloadItem, DownloadConfig, PlaylistItem, VideoInfo } from '@/types/downloader'
import { DEFAULT_CONFIG } from '@/types/downloader'
import {
  isPlaylistUrl,
  generateMockVideoInfo, generateMockPlaylist,
  simulateDownload, nextId, estimateFileSize, formatFileSize,
} from '@/lib/downloader'

type CancelFn = () => void

export function VideoDownloader() {
  const [url, setUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
  const [isPlaylist, setIsPlaylist] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [config, setConfig] = useState<DownloadConfig>(DEFAULT_CONFIG)
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [backendAvailable, setBackendAvailable] = useState(false)

  const cancelFns = useRef<Map<string, CancelFn>>(new Map())

  // Check backend on mount
  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(d => setBackendAvailable(d.available === true))
      .catch(() => setBackendAvailable(false))
  }, [])

  // Analyze URL - try real API, fallback to mock
  const handleAnalyze = useCallback(async (inputUrl: string) => {
    setUrl(inputUrl)
    setIsAnalyzing(true)
    setVideoInfo(null)
    setPlaylist([])
    setIsPlaylist(false)

    if (backendAvailable) {
      try {
        const res = await fetch('/api/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputUrl }),
        })
        if (res.ok) {
          const data = await res.json()
          setVideoInfo({
            id: data.id,
            title: data.title,
            thumbnail: data.thumbnail || '',
            duration: data.duration || 0,
            platform: data.platform || 'unknown',
            author: data.author || '',
          })
          if (data.isPlaylist && data.entries?.length > 0) {
            setIsPlaylist(true)
            setPlaylist(data.entries.map((p: PlaylistItem) => ({
              ...p,
              id: String(p.id),
              selected: true,
            })))
          }
          setIsAnalyzing(false)
          return
        }
      } catch {
        // Fall through to mock
      }
    }

    // Mock fallback
    await new Promise(r => setTimeout(r, 800))
    const info = generateMockVideoInfo(inputUrl)
    setVideoInfo(info)
    if (isPlaylistUrl(inputUrl)) {
      setIsPlaylist(true)
      setPlaylist(generateMockPlaylist(inputUrl))
    }
    setIsAnalyzing(false)
  }, [backendAvailable])

  const startDownload = useCallback((info: VideoInfo, itemUrl: string) => {
    const quality = config.mode === 'video' ? config.videoQuality : config.audioQuality
    const format = config.mode === 'video' ? config.videoFormat : config.audioFormat
    const fileSize = estimateFileSize(info.duration, quality, config.mode)

    const itemId = nextId()
    const item: DownloadItem = {
      id: itemId,
      url: itemUrl,
      videoInfo: info,
      mode: config.mode,
      quality,
      format,
      status: 'downloading',
      progress: 0,
      speed: '',
      fileSize: formatFileSize(fileSize),
      error: null,
    }

    setDownloads(prev => [item, ...prev])

    if (backendAvailable) {
      startRealDownload(itemId, itemUrl, quality, format)
    } else {
      startMockDownload(itemId)
    }
  }, [config, backendAvailable])

  const startRealDownload = useCallback((itemId: string, dlUrl: string, quality: string, format: string) => {
    // Use fetch with SSE via POST
    const controller = new AbortController()
    cancelFns.current.set(itemId, () => controller.abort())

    fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: dlUrl, mode: config.mode, quality, format }),
      signal: controller.signal,
    })
      .then(async res => {
        if (!res.ok || !res.body) throw new Error('Download request failed')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.percent !== undefined) {
                  setDownloads(prev => prev.map(d =>
                    d.id === itemId ? { ...d, progress: data.percent, speed: data.speed || d.speed } : d
                  ))
                }
                if (data.downloadUrl) {
                  setDownloads(prev => prev.map(d =>
                    d.id === itemId ? { ...d, status: 'done' as const, progress: 100, downloadUrl: data.downloadUrl } : d
                  ))
                  cancelFns.current.delete(itemId)
                }
              } catch { /* skip malformed */ }
            }
          }
        }
      })
      .catch(err => {
        if (controller.signal.aborted) return
        setDownloads(prev => prev.map(d =>
          d.id === itemId ? { ...d, status: 'error' as const, error: err.message || '下载失败' } : d
        ))
        cancelFns.current.delete(itemId)
      })
  }, [config])

  const startMockDownload = useCallback((itemId: string) => {
    const cancel = simulateDownload(
      (progress, speed) => {
        setDownloads(prev => prev.map(d =>
          d.id === itemId ? { ...d, progress, speed } : d
        ))
      },
      () => {
        setDownloads(prev => prev.map(d =>
          d.id === itemId ? { ...d, status: 'done' as const, progress: 100 } : d
        ))
        cancelFns.current.delete(itemId)
      },
    )
    cancelFns.current.set(itemId, cancel)
  }, [])

  const handleDownload = useCallback(() => {
    if (!videoInfo) return
    if (isPlaylist && playlist.length > 0) {
      for (const p of playlist.filter(x => x.selected)) {
        startDownload({
          id: p.id, title: p.title, thumbnail: p.thumbnail,
          duration: p.duration, platform: videoInfo.platform, author: videoInfo.author,
        }, url)
      }
    } else {
      startDownload(videoInfo, url)
    }
  }, [videoInfo, playlist, isPlaylist, url, startDownload])

  const handleTogglePlaylistItem = useCallback((id: string) => {
    setPlaylist(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item))
  }, [])

  const handleToggleAll = useCallback((selected: boolean) => {
    setPlaylist(prev => prev.map(item => ({ ...item, selected })))
  }, [])

  const handleRemoveDownload = useCallback((id: string) => {
    const cancel = cancelFns.current.get(id)
    if (cancel) { cancel(); cancelFns.current.delete(id) }
    setDownloads(prev => prev.filter(d => d.id !== id))
  }, [])

  const handleClearDone = useCallback(() => {
    downloads.filter(d => d.status === 'done').forEach(d => {
      cancelFns.current.delete(d.id)
    })
    setDownloads(prev => prev.filter(d => d.status !== 'done'))
  }, [downloads])

  const doneCount = downloads.filter(d => d.status === 'done').length
  const activeCount = downloads.filter(d => d.status === 'downloading').length
  const selectedPlaylistCount = playlist.filter(p => p.selected).length

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {backendAvailable === false && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>后端未连接 — 使用模拟数据演示（启动后端可连接真实下载）</span>
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary mb-2">
          <Video className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">视频下载器</h1>
        <p className="text-sm text-muted-foreground">
          粘贴视频链接，选择画质和格式，一键下载离线观看
        </p>
        {backendAvailable && (
          <span className="text-xs text-green-500">后端已连接</span>
        )}
      </div>

      <Card className="shadow-elegant">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">视频链接</CardTitle>
          <CardDescription>支持 YouTube、Twitter/X、Bilibili、Vimeo 等平台</CardDescription>
        </CardHeader>
        <CardContent>
          <UrlInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </CardContent>
      </Card>

      {videoInfo && (
        <Card className="shadow-elegant">
          <CardContent className="space-y-5 pt-6">
            <VideoInfoCard info={videoInfo} url={url} />

            {isPlaylist && playlist.length > 0 && (
              <PlaylistView items={playlist} onToggle={handleTogglePlaylistItem} onToggleAll={handleToggleAll} />
            )}

            <FormatSelector config={config} onChange={setConfig} />

            <Button
              onClick={handleDownload}
              className="w-full h-12 bg-gradient-primary text-sm font-medium"
              disabled={isPlaylist ? selectedPlaylistCount === 0 : false}
            >
              <Download className="h-4 w-4 mr-2" />
              {isPlaylist ? `下载选中视频 (${selectedPlaylistCount})` : '开始下载'}
            </Button>
          </CardContent>
        </Card>
      )}

      {downloads.length > 0 && (
        <Card className="shadow-elegant">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListVideo className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">下载队列</CardTitle>
                <span className="text-xs text-muted-foreground">
                  ({activeCount} 进行中 · {doneCount} 完成)
                </span>
              </div>
              {doneCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearDone} className="text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  清除已完成
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DownloadList items={downloads} onRemove={handleRemoveDownload} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
