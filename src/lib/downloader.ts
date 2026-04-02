import type { Platform, PlaylistItem, VideoInfo } from '@/types/downloader'

// ============================================================
// Utility functions (shared between frontend & backend)
// ============================================================

const PLATFORM_RULES: { pattern: RegExp; platform: Platform }[] = [
  { pattern: /(?:youtube\.com\/(?:watch|embed|shorts)|youtu\.be\/)/, platform: 'youtube' },
  { pattern: /(?:twitter\.com|x\.com\/)\w+\/status/, platform: 'twitter' },
  { pattern: /bilibili\.com\/video/, platform: 'bilibili' },
  { pattern: /vimeo\.com\//, platform: 'vimeo' },
]

export function detectPlatform(url: string): Platform {
  for (const { pattern, platform } of PLATFORM_RULES) {
    if (pattern.test(url)) return platform
  }
  return 'unknown'
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

export function isPlaylistUrl(url: string): boolean {
  return /[?&]list=/.test(url) || /\/playlist/.test(url)
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatFileSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(1)} MB`
}

let idCounter = 0
export function nextId(): string {
  return `dl_${++idCounter}_${Date.now()}`
}

export function estimateFileSize(
  durationSec: number,
  quality: string,
  mode: 'video' | 'audio',
): number {
  if (mode === 'audio') {
    const kbps = quality === '320kbps' ? 320 : quality === '192kbps' ? 192 : 128
    return (durationSec * kbps) / (8 * 1024)
  }
  const mbpsMap: Record<string, number> = {
    '2160p': 25, '1080p': 8, '720p': 5, '480p': 2.5, '360p': 1.5,
  }
  const mbps = mbpsMap[quality] || 5
  return (durationSec * mbps) / 8
}

// ============================================================
// Mock data (fallback when backend is unavailable)
// ============================================================

const MOCK_TITLES = [
  'Amazing Nature Documentary - Full HD Experience',
  'How to Build Modern Web Applications in 2026',
  'Tech Review: The Future of AI Computing',
  'Music Mix - Deep Focus & Productivity',
  'Travel Vlog: Exploring Hidden Gems',
  'Cooking Masterclass - Professional Techniques',
]

function randomTitle(): string {
  return MOCK_TITLES[Math.floor(Math.random() * MOCK_TITLES.length)]
}

function randomDuration(): number {
  return Math.floor(Math.random() * 3600) + 60
}

export function generateMockVideoInfo(url: string): VideoInfo {
  const platform = detectPlatform(url)
  return {
    id: nextId(),
    title: randomTitle(),
    thumbnail: '',
    duration: randomDuration(),
    platform,
    author: platform === 'youtube' ? 'TechChannel' : platform === 'twitter' ? '@user' : 'Creator',
  }
}

export function generateMockPlaylist(_url: string): PlaylistItem[] {
  const count = Math.floor(Math.random() * 8) + 3
  return Array.from({ length: count }, (_, i) => ({
    id: nextId(),
    index: i + 1,
    title: randomTitle(),
    duration: randomDuration(),
    thumbnail: '',
    selected: true,
  }))
}

export function simulateDownload(
  onProgress: (progress: number, speed: string) => void,
  onComplete: () => void,
): () => void {
  let progress = 0
  let cancelled = false
  const speeds = ['2.4 MB/s', '3.1 MB/s', '4.8 MB/s', '5.2 MB/s', '3.7 MB/s', '6.1 MB/s']

  const interval = setInterval(() => {
    if (cancelled) { clearInterval(interval); return }
    const increment = Math.random() * 8 + 2
    progress = Math.min(progress + increment, 100)
    const speed = speeds[Math.floor(Math.random() * speeds.length)]
    onProgress(Math.round(progress), speed)
    if (progress >= 100) { clearInterval(interval); onComplete() }
  }, 300)
  return () => { cancelled = true; clearInterval(interval) }
}

