import YTDlpWrap from 'yt-dlp-wrap'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BIN_PATH = path.join(__dirname, '..', 'bin', 'yt-dlp.exe')
const DOWNLOAD_DIR = path.join(__dirname, '..', 'downloads')

let ytdlp: YTDlpWrap | null = null

export async function ensureYtDlp(): Promise<YTDlpWrap> {
  if (ytdlp) return ytdlp

  // Try system yt-dlp first
  try {
    const test = new YTDlpWrap('yt-dlp')
    await test.getVersion()
    ytdlp = test
    return ytdlp
  } catch {
    // Not in PATH, try local binary
  }

  // Try local binary
  try {
    const test = new YTDlpWrap(BIN_PATH)
    await test.getVersion()
    ytdlp = test
    return ytdlp
  } catch {
    // Not downloaded yet
  }

  // Auto-download
  console.log('[yt-dlp] Downloading yt-dlp binary...')
  await YTDlpWrap.downloadFromGithub(BIN_PATH)
  ytdlp = new YTDlpWrap(BIN_PATH)
  console.log('[yt-dlp] Download complete:', await ytdlp.getVersion())
  return ytdlp
}

export function getDownloadDir(): string {
  return DOWNLOAD_DIR
}

export interface VideoMetadata {
  id: string
  title: string
  thumbnail: string
  duration: number
  uploader: string
  webpage_url: string
  _platform: string
  entries?: VideoMetadata[]
}

export async function getVideoInfo(url: string): Promise<VideoMetadata> {
  const yt = await ensureYtDlp()
  const info = await yt.getVideoInfo([url])
  return info as VideoMetadata
}

export async function downloadVideo(
  url: string,
  options: {
    mode: 'video' | 'audio'
    quality: string
    format: string
    outputTemplate: string
  },
  onProgress: (progress: { percent: number; speed: string; eta: string }) => void,
  abortSignal?: AbortSignal | null,
): Promise<string> {
  const yt = await ensureYtDlp()

  const args: string[] = [url, '--no-warnings']

  if (options.mode === 'audio') {
    args.push(
      '-x', '--audio-format', options.format,
      '--audio-quality', options.quality === '320kbps' ? '0' : options.quality === '192kbps' ? '2' : '5',
    )
  } else {
    const heightMap: Record<string, string> = {
      '2160p': '2160',
      '1080p': '1080',
      '720p': '720',
      '480p': '480',
      '360p': '360',
    }
    const height = heightMap[options.quality] || '720'
    args.push(
      '-f', `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`,
      '--merge-output-format', options.format,
    )
  }

  args.push('-o', options.outputTemplate)

  const emitter = yt.exec(args, {}, abortSignal)

  return new Promise((resolve, reject) => {
    let lastError = ''
    emitter.on('progress', (progress) => {
      onProgress({
        percent: progress.percent ?? 0,
        speed: progress.currentSpeed ?? '',
        eta: progress.eta ?? '',
      })
    })
    emitter.on('ytDlpEvent', (_eventType, eventData) => {
      if (eventData.toLowerCase().includes('error')) {
        lastError = eventData
      }
    })
    emitter.on('error', (err) => {
      reject(new Error(lastError || err.message))
    })
    emitter.on('close', (code) => {
      if (code === 0) {
        resolve(options.outputTemplate)
      } else {
        reject(new Error(lastError || `yt-dlp exited with code ${code}`))
      }
    })
  })
}
