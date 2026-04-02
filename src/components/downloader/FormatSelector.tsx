import { Video, Music } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DownloadConfig, DownloadMode } from '@/types/downloader'
import {
  VIDEO_QUALITIES, AUDIO_QUALITIES,
  VIDEO_FORMATS, AUDIO_FORMATS,
} from '@/types/downloader'

interface FormatSelectorProps {
  config: DownloadConfig
  onChange: (config: DownloadConfig) => void
}

export function FormatSelector({ config, onChange }: FormatSelectorProps) {
  const setMode = (mode: DownloadMode) => onChange({ ...config, mode })

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => setMode('video')}
          className={cn(
            'flex-1 h-10 rounded-lg border transition-smooth',
            config.mode === 'video'
              ? 'bg-accent text-accent-foreground border-primary/30 shadow-glow'
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          <Video className="h-4 w-4 mr-2" />
          视频
        </Button>
        <Button
          variant="ghost"
          onClick={() => setMode('audio')}
          className={cn(
            'flex-1 h-10 rounded-lg border transition-smooth',
            config.mode === 'audio'
              ? 'bg-accent text-accent-foreground border-primary/30 shadow-glow'
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          <Music className="h-4 w-4 mr-2" />
          音频
        </Button>
      </div>

      {/* Quality & Format */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">画质</label>
          <Select
            value={config.mode === 'video' ? config.videoQuality : config.audioQuality}
            onChange={(e) => {
              if (config.mode === 'video') {
                onChange({ ...config, videoQuality: e.target.value as DownloadConfig['videoQuality'] })
              } else {
                onChange({ ...config, audioQuality: e.target.value as DownloadConfig['audioQuality'] })
              }
            }}
          >
            {(config.mode === 'video' ? VIDEO_QUALITIES : AUDIO_QUALITIES).map((q) => (
              <option key={q.value} value={q.value}>
                {q.label} - {q.desc}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">格式</label>
          <Select
            value={config.mode === 'video' ? config.videoFormat : config.audioFormat}
            onChange={(e) => {
              if (config.mode === 'video') {
                onChange({ ...config, videoFormat: e.target.value as DownloadConfig['videoFormat'] })
              } else {
                onChange({ ...config, audioFormat: e.target.value as DownloadConfig['audioFormat'] })
              }
            }}
          >
            {(config.mode === 'video' ? VIDEO_FORMATS : AUDIO_FORMATS).map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}
