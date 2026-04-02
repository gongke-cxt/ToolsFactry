/** 文档转换方向 */
export type ConvertDirection = 'yuque2feishu' | 'feishu2yuque'

/** 单个文档的转换状态 */
export type DocStatus = 'pending' | 'converting' | 'done' | 'error'

/** 文档树节点（语雀/飞书子文档） */
export interface DocNode {
  id: string
  title: string
  status: DocStatus
  /** 子文档 */
  children: DocNode[]
  /** 转换进度 0-100 */
  progress: number
  /** 错误信息 */
  error?: string
}

/** 转换配置 */
export interface ConvertConfig {
  /** 源文档地址 */
  sourceUrl: string
  /** 目标文档地址 */
  targetUrl: string
  /** 转换方向 */
  direction: ConvertDirection
  /** 是否包含子文档 */
  includeChildren: boolean
}

/** 转换任务整体状态 */
export interface ConvertTask {
  id: string
  config: ConvertConfig
  status: 'idle' | 'analyzing' | 'converting' | 'done' | 'error'
  /** 源文档标题 */
  sourceTitle: string
  /** 文档树 */
  docTree: DocNode[]
  /** 总文档数 */
  totalDocs: number
  /** 已完成文档数 */
  completedDocs: number
  /** 整体进度 0-100 */
  progress: number
  /** 错误信息 */
  error?: string
}

/** URL 验证结果 */
export interface UrlValidation {
  valid: boolean
  platform?: 'yuque' | 'feishu'
  error?: string
}

/** 语雀文档 URL 特征 */
const YUQUE_PATTERNS = [
  /^https?:\/\/[^/]*\.yuque\.com\//,
  /^https?:\/\/yuque\.com\//,
]

/** 飞书文档 URL 特征 */
const FEISHU_PATTERNS = [
  /^https?:\/\/[^/]*\.feishu\.cn\//,
  /^https?:\/\/[^/]*\.lark\.suite\//,
  /^https?:\/\/[^/]*\.larksuite\.com\//,
]

/** 验证 URL 是否为语雀/飞书文档 */
export function validateDocUrl(url: string): UrlValidation {
  if (!url.trim()) {
    return { valid: false, error: '请输入文档地址' }
  }

  for (const pattern of YUQUE_PATTERNS) {
    if (pattern.test(url)) {
      return { valid: true, platform: 'yuque' }
    }
  }

  for (const pattern of FEISHU_PATTERNS) {
    if (pattern.test(url)) {
      return { valid: true, platform: 'feishu' }
    }
  }

  return { valid: false, error: '不支持的文档地址，请输入语雀或飞书文档链接' }
}

/** 自动检测转换方向 */
export function detectDirection(
  sourceUrl: string,
  targetUrl: string
): ConvertDirection | null {
  const source = validateDocUrl(sourceUrl)
  const target = validateDocUrl(targetUrl)
  if (!source.valid || !target.valid) return null
  if (source.platform === 'yuque' && target.platform === 'feishu') return 'yuque2feishu'
  if (source.platform === 'feishu' && target.platform === 'yuque') return 'feishu2yuque'
  return null
}
