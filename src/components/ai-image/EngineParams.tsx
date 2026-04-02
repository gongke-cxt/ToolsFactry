import type { ImageEngine } from '@/types/ai-image'
import { NANO_BANANA_RATIOS, NANO_BANANA_SIZES, DOUBAO_SIZES, DOUBAO_MODELS } from '@/types/ai-image'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface EngineParamsProps {
  engine: ImageEngine
  params: Record<string, string>
  onChange: (params: Record<string, string>) => void
}

export function EngineParams({ engine, params, onChange }: EngineParamsProps) {
  const update = (key: string, value: string) => {
    onChange({ ...params, [key]: value })
  }

  if (engine === 'midjourney') {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Bot 类型</Label>
          <Select value={params.botType || 'MID_JOURNEY'} onChange={e => update('botType', e.target.value)}>
            <option value="MID_JOURNEY">Midjourney</option>
            <option value="niji">Niji (二次元)</option>
          </Select>
        </div>
      </div>
    )
  }

  if (engine === 'doubao') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>模型</Label>
          <Select value={params.model || DOUBAO_MODELS[0].id} onChange={e => update('model', e.target.value)}>
            {DOUBAO_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>分辨率</Label>
          <Select value={params.size || '2K'} onChange={e => update('size', e.target.value)}>
            {DOUBAO_SIZES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </Select>
        </div>
      </div>
    )
  }

  // nanobanana
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>宽高比</Label>
        <Select value={params.aspectRatio || '1:1'} onChange={e => update('aspectRatio', e.target.value)}>
          {NANO_BANANA_RATIOS.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-1">
        <Label>分辨率</Label>
        <Select value={params.imageSize || '1K'} onChange={e => update('imageSize', e.target.value)}>
          {NANO_BANANA_SIZES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </Select>
      </div>
    </div>
  )
}
