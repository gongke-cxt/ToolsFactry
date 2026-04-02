import type { EngineConfig } from '@/types/ai-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Settings2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface ConfigPanelProps {
  config: EngineConfig
  onChange: (config: EngineConfig) => void
}

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const toggleKey = (key: string) => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))

  const update = (section: keyof EngineConfig, field: string, value: string) => {
    onChange({
      ...config,
      [section]: { ...config[section], [field]: value },
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          API 配置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Midjourney */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Midjourney</Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <div className="flex gap-1">
                <Input
                  type={showKeys['mj'] ? 'text' : 'password'}
                  value={config.midjourney.apiKey}
                  onChange={e => update('midjourney', 'apiKey', e.target.value)}
                  placeholder="sk-..."
                  className="h-8 text-xs"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toggleKey('mj')}>
                  {showKeys['mj'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Base URL</Label>
              <Input
                type="text"
                value={config.midjourney.baseUrl}
                onChange={e => update('midjourney', 'baseUrl', e.target.value)}
                placeholder="https://api.geekai.pro"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 豆包 */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-primary">豆包 Seedream</Label>
          <div>
            <Label className="text-xs text-muted-foreground">API Key</Label>
            <div className="flex gap-1">
              <Input
                type={showKeys['doubao'] ? 'text' : 'password'}
                value={config.doubao.apiKey}
                onChange={e => update('doubao', 'apiKey', e.target.value)}
                placeholder="火山方舟 API Key"
                className="h-8 text-xs"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toggleKey('doubao')}>
                {showKeys['doubao'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Nano Banana */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-primary">Nano Banana 2</Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <div className="flex gap-1">
                <Input
                  type={showKeys['nb'] ? 'text' : 'password'}
                  value={config.nanobanana.apiKey}
                  onChange={e => update('nanobanana', 'apiKey', e.target.value)}
                  placeholder="sk-..."
                  className="h-8 text-xs"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toggleKey('nb')}>
                  {showKeys['nb'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Base URL</Label>
              <Input
                type="text"
                value={config.nanobanana.baseUrl}
                onChange={e => update('nanobanana', 'baseUrl', e.target.value)}
                placeholder="https://api.apiyi.com"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
