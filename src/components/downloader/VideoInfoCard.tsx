import { Video, Music, Clock, User } from 'lucide-react'
import type { VideoInfo } from '@/types/downloader'
import { formatDuration, detectPlatform } from '@/lib/downloader'

interface VideoInfoCardProps {
  info: VideoInfo
  url: string
}

function PlatformBadge({ platform }: { platform: string }) {
  const labels: Record<string, string> = {
    youtube: 'YouTube',
    twitter: 'Twitter/X',
    bilibili: 'Bilibili',
    vimeo: 'Vimeo',
    unknown: '视频',
  }
  const colors: Record<string, string> = {
    youtube: 'bg-red-500/10 text-red-500 border-red-500/20',
    twitter: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    bilibili: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    vimeo: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    unknown: 'bg-muted text-muted-foreground border-border',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[platform] || colors.unknown}`}>
      {labels[platform] || '视频'}
    </span>
  )
}

export function VideoInfoCard({ info, url }: VideoInfoCardProps) {
  const platform = detectPlatform(url)
  const isPlaylist = /[?&]list=/.test(url)

  return (
    <div className="flex gap-4 p-4 rounded-lg border border-border bg-muted/30 animate-fade-in">
      {/* Thumbnail */}
      <div className="w-40 h-24 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 overflow-hidden relative">
        {info.thumbnail ? (
          <img
            src={info.thumbnail}
            alt={info.title}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : isPlaylist ? (
          <div className="flex flex-col items-center gap-1">
            <Video className="h-6 w-6 text-primary" />
            <span className="text-xs text-primary font-medium">播放列表</span>
          </div>
        ) : (
          <Video className="h-8 w-8 text-primary/60" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
            {info.title}
          </h4>
          <PlatformBadge platform={platform} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {info.author}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(info.duration)}
          </span>
          {info.duration > 0 && (
            <span className="flex items-center gap-1">
              <Music className="h-3 w-3" />
              {Math.floor(info.duration / 60)} 分钟
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
