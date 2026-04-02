import type { DocNode, ConvertDirection } from '@/types/doc-converter'
import { fetchYuqueToc } from '@/lib/yuque-parser'

/** 计算文档树中所有文档总数 */
export function countDocs(nodes: DocNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countDocs(n.children), 0)
}

/** 统计已完成的文档数 */
export function countCompleted(nodes: DocNode[]): number {
  return nodes.reduce(
    (sum, n) => sum + (n.status === 'done' ? 1 : 0) + countCompleted(n.children),
    0,
  )
}

/** 解析源文档（获取文档信息和子文档树） */
export async function analyzeSource(
  sourceUrl: string,
  direction: ConvertDirection,
  includeChildren: boolean,
): Promise<{
  title: string
  docTree: DocNode[]
}> {
  if (direction === 'yuque2feishu') {
    return fetchYuqueToc(sourceUrl, includeChildren)
  }

  // 飞书方向暂用占位逻辑
  return {
    title: '飞书文档',
    docTree: [
      {
        id: 'placeholder',
        title: '根文档',
        status: 'pending',
        progress: 0,
        children: [],
      },
    ],
  }
}

/** 模拟转换单个文档 */
async function convertSingleDoc(
  node: DocNode,
  direction: ConvertDirection,
  onProgress: (id: string, progress: number) => void,
): Promise<void> {
  node.status = 'converting'

  const steps = direction === 'yuque2feishu'
    ? ['读取语雀文档内容', '解析 Markdown/HTML', '转换格式为飞书 Block', '上传图片资源', '写入飞书文档']
    : ['读取飞书文档内容', '解析 Block 结构', '转换格式为 Markdown', '下载图片资源', '写入语雀文档']

  for (let i = 0; i < steps.length; i++) {
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 400))
    const progress = Math.round(((i + 1) / steps.length) * 100)
    onProgress(node.id, progress)
  }

  node.status = 'done'
  node.progress = 100
}

/** 递归转换文档树 */
async function convertTree(
  nodes: DocNode[],
  direction: ConvertDirection,
  onProgress: (id: string, progress: number) => void,
): Promise<void> {
  for (const node of nodes) {
    await convertSingleDoc(node, direction, onProgress)
    if (node.children.length > 0) {
      await convertTree(node.children, direction, onProgress)
    }
  }
}

/** 模拟整个转换流程 */
export async function runConversion(
  docTree: DocNode[],
  direction: ConvertDirection,
  onProgress: (id: string, progress: number) => void,
): Promise<void> {
  await convertTree(docTree, direction, onProgress)
}

/** 获取转换方向的中文名 */
export function getDirectionLabel(direction: ConvertDirection): string {
  return direction === 'yuque2feishu' ? '语雀 → 飞书' : '飞书 → 语雀'
}

/** 获取平台图标名称 */
export function getPlatformFromUrl(url: string): 'yuque' | 'feishu' | null {
  if (/yuque\.com/.test(url)) return 'yuque'
  if (/feishu\.cn|lark\.suite|larksuite\.com/.test(url)) return 'feishu'
  return null
}
