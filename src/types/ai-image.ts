/** AI 图片生成器 - 类型定义 */

// ─── 引擎类型 ───
export type ImageEngine = 'midjourney' | 'doubao' | 'nanobanana'

export interface EngineOption {
  id: ImageEngine
  label: string
  desc: string
}

export const ENGINE_OPTIONS: EngineOption[] = [
  { id: 'midjourney', label: 'Midjourney', desc: '专业级AI绘图，支持放大/变换/图生文' },
  { id: 'doubao', label: '豆包 Seedream', desc: '火山方舟 Seedream 4.0 生图' },
  { id: 'nanobanana', label: 'Nano Banana 2', desc: 'Gemini 底座，支持超长比例' },
]

// ─── Midjourney 相关 ───
export type MjAction = 'IMAGINE' | 'UPSCALE' | 'VARIATION' | 'REROLL' | 'DESCRIBE' | 'BLEND'
export type MjStatus = 'NOT_START' | 'SUBMITTED' | 'IN_PROGRESS' | 'FAILURE' | 'SUCCESS'

export interface MjTask {
  id: string
  action: MjAction
  status: MjStatus
  prompt: string
  promptEn: string
  description: string
  submitTime: number
  startTime: number
  finishTime: number
  progress: string
  imageUrl: string
  failReason: string
  properties: Record<string, string>
}

export interface MjSubmitResponse {
  code: number
  description: string
  result: string
  properties: Record<string, unknown> | null
}

// ─── 豆包 Seedream 相关 ───
export type DoubaoSize = '1K' | '2K' | '4K'
export type DoubaoResponseFormat = 'url' | 'b64_json'

export interface DoubaoImageResult {
  url?: string
  b64_json?: string
  revised_prompt?: string
}

// ─── Nano Banana 2 相关 ───
export type NanoBananaSize = '512' | '1K' | '2K' | '4K'
export type NanoBananaRatio =
  | '1:1' | '1:4' | '4:1' | '1:8' | '8:1'
  | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4'
  | '9:16' | '16:9' | '21:9'

export interface NanoBananaImageResult {
  mimeType: string
  data: string
}

// ─── 通用任务状态 ───
export type TaskStatus = 'idle' | 'submitting' | 'queued' | 'processing' | 'success' | 'failure'

export interface GenerateTask {
  id: string
  engine: ImageEngine
  status: TaskStatus
  prompt: string
  progress: string
  imageUrl: string
  error: string
  createdAt: number
  mjTask?: MjTask
  images: string[]
}

// ─── 引擎配置 ───
export interface EngineConfig {
  midjourney: {
    baseUrl: string
    apiKey: string
  }
  doubao: {
    apiKey: string
  }
  nanobanana: {
    baseUrl: string
    apiKey: string
  }
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  midjourney: {
    baseUrl: 'https://api.geekai.pro',
    apiKey: 'sk-1nMCUT5v0g3UYYDHu1GZuQu3vansG9uyFfzBHlA0LECTMCyW',
  },
  doubao: {
    apiKey: 'd2a034d9-f0b8-4b67-b9f5-661be35d8048',
  },
  nanobanana: {
    baseUrl: 'https://api.apiyi.com',
    apiKey: 'sk-l0UTZWcBsvI1qHMAF6Ee88C18dC14e68944688286eD91b7b',
  },
}

// ─── 生成参数 ───
export interface MidjourneyParams {
  prompt: string
  base64Array?: string[]
  botType?: 'MID_JOURNEY' | 'niji'
}

export interface DoubaoParams {
  prompt: string
  size: DoubaoSize
  responseFormat: DoubaoResponseFormat
  model?: string
}

export const DOUBAO_MODELS = [
  { id: 'doubao-seedream-4-0-250828', label: 'Seedream 4.0' },
  { id: 'doubao-seedream-3.0-t2i', label: 'Seedream 3.0' },
]

export interface NanoBananaParams {
  prompt: string
  aspectRatio: NanoBananaRatio
  imageSize: NanoBananaSize
}

export const NANO_BANANA_RATIOS: { id: NanoBananaRatio; label: string }[] = [
  { id: '1:1', label: '1:1 正方形' },
  { id: '16:9', label: '16:9 宽屏' },
  { id: '9:16', label: '9:16 竖屏' },
  { id: '4:3', label: '4:3' },
  { id: '3:4', label: '3:4' },
  { id: '3:2', label: '3:2' },
  { id: '2:3', label: '2:3' },
  { id: '4:5', label: '4:5' },
  { id: '5:4', label: '5:4' },
  { id: '21:9', label: '21:9 超宽' },
  { id: '1:4', label: '1:4 超长竖' },
  { id: '4:1', label: '4:1 超长横' },
  { id: '1:8', label: '1:8 极长竖' },
  { id: '8:1', label: '8:1 极长横' },
]

export const NANO_BANANA_SIZES: { id: NanoBananaSize; label: string }[] = [
  { id: '512', label: '512px 快速预览' },
  { id: '1K', label: '1K 标准' },
  { id: '2K', label: '2K 高清' },
  { id: '4K', label: '4K 专业' },
]

export const DOUBAO_SIZES: { id: DoubaoSize; label: string }[] = [
  { id: '1K', label: '1K 标准' },
  { id: '2K', label: '2K 高清' },
  { id: '4K', label: '4K 专业' },
]
