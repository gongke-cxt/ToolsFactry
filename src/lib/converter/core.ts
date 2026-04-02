export type DataFormat = 'json' | 'xml'

export interface ValidationError {
  line?: number
  column?: number
  message: string
}

export interface ConversionResult {
  success: boolean
  output: string
  errors: ValidationError[]
}

export function formatJson(input: string, indent: number = 2): ConversionResult {
  try {
    const parsed = JSON.parse(input)
    return {
      success: true,
      output: JSON.stringify(parsed, null, indent),
      errors: [],
    }
  } catch (e) {
    const err = e as SyntaxError
    const match = err.message.match(/position\s+(\d+)/)
    const pos = match ? parseInt(match[1]) : 0
    const beforeError = input.substring(0, pos)
    const line = beforeError.split('\n').length
    const column = pos - beforeError.lastIndexOf('\n')
    return {
      success: false,
      output: '',
      errors: [{ line, column, message: err.message }],
    }
  }
}

export function minifyJson(input: string): ConversionResult {
  try {
    const parsed = JSON.parse(input)
    return {
      success: true,
      output: JSON.stringify(parsed),
      errors: [],
    }
  } catch (e) {
    const err = e as SyntaxError
    return {
      success: false,
      output: '',
      errors: [{ message: err.message }],
    }
  }
}

export function validateJson(input: string): ValidationError[] {
  if (!input.trim()) return []
  try {
    JSON.parse(input)
    return []
  } catch (e) {
    const err = e as SyntaxError
    const match = err.message.match(/position\s+(\d+)/)
    const pos = match ? parseInt(match[1]) : 0
    const beforeError = input.substring(0, pos)
    const line = beforeError.split('\n').length
    const column = pos - beforeError.lastIndexOf('\n')
    return [{ line, column, message: err.message }]
  }
}

export function formatXml(input: string, indent: number = 2): ConversionResult {
  try {
    const parsed = parseXml(input)
    return {
      success: true,
      output: serializeXml(parsed, indent),
      errors: [],
    }
  } catch (e) {
    return {
      success: false,
      output: '',
      errors: [{ message: (e as Error).message }],
    }
  }
}

export function minifyXml(input: string): ConversionResult {
  try {
    const parsed = parseXml(input)
    return {
      success: true,
      output: serializeXmlCompact(parsed),
      errors: [],
    }
  } catch (e) {
    return {
      success: false,
      output: '',
      errors: [{ message: (e as Error).message }],
    }
  }
}

export function validateXml(input: string): ValidationError[] {
  if (!input.trim()) return []
  try {
    parseXml(input)
    return []
  } catch (e) {
    return [{ message: (e as Error).message }]
  }
}

interface XmlNode {
  tag: string
  attributes: Record<string, string>
  children: XmlNode[]
  text?: string
  cdata?: string
}

function parseXml(input: string): XmlNode {
  const parser = new DOMParser()
  const doc = parser.parseFromString(input, 'text/xml')
  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new Error(errorNode.textContent || 'XML 解析错误')
  }
  return domNodeToXmlNode(doc.documentElement)
}

function domNodeToXmlNode(el: Element): XmlNode {
  const attributes: Record<string, string> = {}
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i]
    attributes[attr.name] = attr.value
  }

  const children: XmlNode[] = []
  let text = ''
  let hasElementChildren = false

  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i]
    if (child.nodeType === Node.ELEMENT_NODE) {
      hasElementChildren = true
      children.push(domNodeToXmlNode(child as Element))
    } else if (child.nodeType === Node.TEXT_NODE) {
      const val = child.textContent?.trim() || ''
      if (val) text += val
    } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
      text = child.textContent || ''
    }
  }

  return {
    tag: el.tagName,
    attributes,
    children,
    text: hasElementChildren && !text ? undefined : text || undefined,
  }
}

function serializeXml(node: XmlNode, indent: number, level: number = 0): string {
  const pad = ' '.repeat(indent * level)
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${escapeXmlAttr(v)}"`)
    .join('')

  if (node.children.length === 0 && !node.text) {
    return `${pad}<${node.tag}${attrs} />`
  }

  if (node.children.length === 0 && node.text !== undefined) {
    const escaped = escapeXmlText(node.text)
    if (escaped.length <= 60 && !escaped.includes('\n')) {
      return `${pad}<${node.tag}${attrs}>${escaped}</${node.tag}>`
    }
    const innerPad = ' '.repeat(indent * (level + 1))
    return `${pad}<${node.tag}${attrs}>\n${innerPad}${escaped}\n${pad}</${node.tag}>`
  }

  const childrenXml = node.children
    .map((c) => serializeXml(c, indent, level + 1))
    .join('\n')

  return `${pad}<${node.tag}${attrs}>\n${childrenXml}\n${pad}</${node.tag}>`
}

function serializeXmlCompact(node: XmlNode): string {
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${escapeXmlAttr(v)}"`)
    .join('')

  if (node.children.length === 0 && !node.text) {
    return `<${node.tag}${attrs} />`
  }

  if (node.children.length === 0 && node.text !== undefined) {
    return `<${node.tag}${attrs}>${escapeXmlText(node.text)}</${node.tag}>`
  }

  const childrenXml = node.children.map((c) => serializeXmlCompact(c)).join('')
  return `<${node.tag}${attrs}>${childrenXml}</${node.tag}>`
}

function escapeXmlText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeXmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function jsonToXml(input: string, rootTag: string = 'root'): ConversionResult {
  try {
    const parsed = JSON.parse(input)
    const xmlNode = jsonValueToXmlNode(rootTag, parsed)
    return {
      success: true,
      output: '<?xml version="1.0" encoding="UTF-8"?>\n' + serializeXml(xmlNode, 2),
      errors: [],
    }
  } catch (e) {
    return {
      success: false,
      output: '',
      errors: [{ message: (e as Error).message }],
    }
  }
}

function jsonValueToXmlNode(tag: string, value: unknown): XmlNode {
  if (value === null || value === undefined) {
    return { tag, attributes: {}, children: [], text: '' }
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    const children: XmlNode[] = []

    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        const safeKey = xmlSafeTag(key)
        for (const item of val) {
          children.push(jsonValueToXmlNode(safeKey, item))
        }
      } else {
        children.push(jsonValueToXmlNode(xmlSafeTag(key), val))
      }
    }

    return { tag, attributes: {}, children }
  }

  if (Array.isArray(value)) {
    const safeTag = xmlSafeTag('item')
    const children = value.map((item) => jsonValueToXmlNode(safeTag, item))
    return { tag, attributes: {}, children }
  }

  return {
    tag,
    attributes: {},
    children: [],
    text: String(value),
  }
}

function xmlSafeTag(key: string): string {
  let safe = key.replace(/[^a-zA-Z0-9_-]/g, '_')
  if (/^[0-9_-]/.test(safe)) {
    safe = '_' + safe
  }
  return safe || '_'
}

export function xmlToJson(input: string): ConversionResult {
  try {
    const node = parseXml(input)
    const obj = xmlNodeToJson(node)
    return {
      success: true,
      output: JSON.stringify(obj, null, 2),
      errors: [],
    }
  } catch (e) {
    return {
      success: false,
      output: '',
      errors: [{ message: (e as Error).message }],
    }
  }
}

function xmlNodeToJson(node: XmlNode): unknown {
  if (node.children.length === 0 && node.text !== undefined) {
    const trimmed = node.text.trim()
    if (trimmed === '') return ''
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10)
    if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed)
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (trimmed === 'null') return null
    return trimmed
  }

  if (node.children.length === 0) {
    return null
  }

  const result: Record<string, unknown> = {}
  const tagCount: Record<string, number> = {}

  for (const child of node.children) {
    tagCount[child.tag] = (tagCount[child.tag] || 0) + 1
  }

  for (const child of node.children) {
    const val = xmlNodeToJson(child)
    if (tagCount[child.tag] > 1) {
      if (!Array.isArray(result[child.tag])) {
        result[child.tag] = []
      }
      ;(result[child.tag] as unknown[]).push(val)
    } else {
      result[child.tag] = val
    }
  }

  return result
}

export function detectFormat(input: string): DataFormat {
  const trimmed = input.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"')) {
    return 'json'
  }
  if (trimmed.startsWith('<')) {
    return 'xml'
  }
  return 'json'
}
