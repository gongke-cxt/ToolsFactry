export type Platform = 'youtube' | 'twitter' | 'bilibili' | 'vimeo' | 'unknown'

export type DownloadMode = 'video' | 'audio'

export type VideoQuality = '2160p' | '1080p' | '720p' | '480p' | '360p'
export type AudioQuality = '320kbps' | '192kbps' | '128kbps'

export type VideoFormat = 'mp4' | 'webm'
export type AudioFormat = 'mp3' | 'aac' | 'flac'

export type DownloadStatus = 'pending' | 'analyzing' | 'downloading' | 'done' | 'error'

export interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: number // seconds
  platform: Platform
  author: string
}

export interface PlaylistItem {
  id: string
  index: number
  title: string
  duration: number
  thumbnail: string
  selected: boolean
}

export interface DownloadItem {
  id: string
  url: string
  videoInfo: VideoInfo | null
  mode: DownloadMode
  quality: VideoQuality | AudioQuality
  format: VideoFormat | AudioFormat
  status: DownloadStatus
  progress: number
  speed: string
  fileSize: string
  error: string | null
  downloadUrl?: string
}

export interface DownloadConfig {
  mode: DownloadMode
  videoQuality: VideoQuality
  audioQuality: AudioQuality
  videoFormat: VideoFormat
  audioFormat: AudioFormat
}

export const VIDEO_QUALITIES: { value: VideoQuality; label: string; desc: string }[] = [
  { value: '2160p', label: '4K', desc: '2160p' },
  { value: '1080p', label: '1080p', desc: '全高清' },
  { value: '720p', label: '720p', desc: '高清' },
  { value: '480p', label: '480p', desc: '标清' },
  { value: '360p', label: '360p', desc: '流畅' },
]

export const AUDIO_QUALITIES: { value: AudioQuality; label: string; desc: string }[] = [
  { value: '320kbps', label: '320kbps', desc: '极高' },
  { value: '192kbps', label: '192kbps', desc: '较高' },
  { value: '128kbps', label: '128kbps', desc: '标准' },
]

export const VIDEO_FORMATS: { value: VideoFormat; label: string }[] = [
  { value: 'mp4', label: 'MP4' },
  { value: 'webm', label: 'WebM' },
]

export const AUDIO_FORMATS: { value: AudioFormat; label: string }[] = [
  { value: 'mp3', label: 'MP3' },
  { value: 'aac', label: 'AAC' },
  { value: 'flac', label: 'FLAC' },
]

export const DEFAULT_CONFIG: DownloadConfig = {
  mode: 'video',
  videoQuality: '1080p',
  audioQuality: '320kbps',
  videoFormat: 'mp4',
  audioFormat: 'mp3',
}
