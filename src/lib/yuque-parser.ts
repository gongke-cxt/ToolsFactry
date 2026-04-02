import type { DocNode } from '@/types/doc-converter'

/** 语雀 TOC 条目原始结构 */
interface YuqueTocEntry {
  type: 'TITLE' | 'DOC'
  title: string
  uuid: string
  url: string
  parent_uuid: string
  doc_id: string | number
  level: number
  visible: number
}

/** 语雀 appData.book 结构 */
interface YuqueBook {
  id: number
  slug: string
  name: string
  toc: YuqueTocEntry[]
}

interface YuqueAppData {
  book: YuqueBook
  group: {
    login: string
  }
}

/** 从 HTML 中提取 window.appData */
function extractAppData(html: string): YuqueAppData | null {
  const marker = 'window.appData = JSON.parse(decodeURIComponent("'
  const start = html.indexOf(marker)
  if (start === -1) return null

  const encodedStart = start + marker.length
  const encodedEnd = html.indexOf('"))', encodedStart)
  if (encodedEnd === -1) return null

  const encoded = html.substring(encodedStart, encodedEnd)
  const decoded = decodeURIComponent(encoded)
  return JSON.parse(decoded)
}

/** 从扁平 TOC 构建树形 DocNode[]，只保留有 doc_id 的文档节点 */
function buildDocTree(toc: YuqueTocEntry[], parentUuid: string): DocNode[] {
  const children = toc.filter(
    (e) => e.parent_uuid === parentUuid && e.visible === 1
  )

  return children.map((entry) => ({
    id: entry.doc_id ? String(entry.doc_id) : entry.uuid,
    title: entry.title,
    status: 'pending' as const,
    progress: 0,
    children: buildDocTree(toc, entry.uuid),
  }))
}

/** 通过 CORS 代理获取语雀页面 HTML */
async function fetchViaProxy(url: string): Promise<string> {
  const proxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  ]

  // 先尝试直接请求
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const text = await res.text()
      if (text.includes('window.appData')) return text
    }
  } catch {
    // CORS 限制，走代理
  }

  for (const proxyFn of proxies) {
    try {
      const proxyUrl = proxyFn(url)
      const res = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(15000),
      })
      if (res.ok) {
        const text = await res.text()
        if (text.includes('window.appData')) return text
      }
    } catch {
      continue
    }
  }

  throw new Error('无法获取语雀页面内容，请检查网络连接或文档是否为公开文档')
}

/**
 * 获取语雀页面 HTML 并解析出真实的目录结构
 */
export async function fetchYuqueToc(
  url: string,
  includeChildren: boolean
): Promise<{ title: string; docTree: DocNode[] }> {
  const match = url.match(/yuque\.com\/([^/]+)\/([^/?#]+)/)
  if (!match) {
    throw new Error('无法解析语雀文档地址')
  }

  const html = await fetchViaProxy(url)
  const appData = extractAppData(html)

  if (!appData?.book) {
    throw new Error('无法从页面提取文档信息，可能是私有文档或页面结构已变更')
  }

  const book = appData.book

  const docTree = includeChildren
    ? buildDocTree(book.toc, '')
    : [
        {
          id: String(book.id),
          title: book.name,
          status: 'pending' as const,
          progress: 0,
          children: [],
        },
      ]

  return {
    title: book.name,
    docTree,
  }
}
