import { PDFDocument, PDFName, PDFString } from 'pdf-lib'
import type { PdfFileItem, BookmarkItem } from '@/types/pdf'
import { saveAs } from 'file-saver'

type PdfjsDoc = {
  numPages: number
  getPage(n: number): Promise<{
    getViewport(p: { scale: number }): { width: number; height: number }
    render(p: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<void> }
  }>
  destroy(): void
}

let pdfjsReady = false

async function getPdfjs() {
  if (!pdfjsReady) {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker.mjs'
    pdfjsReady = true
    return pdfjsLib
  }
  return import('pdfjs-dist')
}

/* ---------- load ---------- */

export async function loadPdfFile(file: File): Promise<PdfFileItem> {
  const buffer = await file.arrayBuffer()
  const pdf = await PDFDocument.load(buffer)
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    pageCount: pdf.getPageCount(),
    buffer,
  }
}

/* ---------- thumbnails ---------- */

export async function renderPageThumbnail(
  buffer: ArrayBuffer,
  pageIndex: number,
  scale = 0.4,
): Promise<string> {
  const pdfjsLib = await getPdfjs()
  const task = pdfjsLib.getDocument({ data: buffer.slice(0) })
  const pdf: PdfjsDoc = await task.promise
  const page = await pdf.getPage(pageIndex + 1)
  const vp = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = vp.width
  canvas.height = vp.height
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport: vp }).promise
  pdf.destroy()
  return canvas.toDataURL('image/jpeg', 0.8)
}

export async function renderAllThumbnails(
  buffer: ArrayBuffer,
  pageCount: number,
  onProgress?: (done: number) => void,
): Promise<string[]> {
  const pdfjsLib = await getPdfjs()
  const task = pdfjsLib.getDocument({ data: buffer.slice(0) })
  const pdf: PdfjsDoc = await task.promise
  const results: string[] = []

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const vp = page.getViewport({ scale: 0.4 })
    const canvas = document.createElement('canvas')
    canvas.width = vp.width
    canvas.height = vp.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport: vp }).promise
    results.push(canvas.toDataURL('image/jpeg', 0.8))
    onProgress?.(i)
  }

  pdf.destroy()
  return results
}

/* ---------- merge ---------- */

export async function mergeFiles(files: PdfFileItem[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()
  for (const f of files) {
    const src = await PDFDocument.load(f.buffer)
    const copied = await merged.copyPages(src, src.getPageIndices())
    copied.forEach((p) => merged.addPage(p))
  }
  return merged.save()
}

/* ---------- extract pages ---------- */

export async function extractPages(
  file: PdfFileItem,
  indices: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(file.buffer)
  const doc = await PDFDocument.create()
  const pages = await doc.copyPages(src, indices)
  pages.forEach((p) => doc.addPage(p))
  return doc.save()
}

/* ---------- delete pages ---------- */

export async function removePages(
  file: PdfFileItem,
  removeSet: Set<number>,
): Promise<Uint8Array> {
  const src = await PDFDocument.load(file.buffer)
  const keep = src.getPageIndices().filter((i) => !removeSet.has(i))
  const doc = await PDFDocument.create()
  const pages = await doc.copyPages(src, keep)
  pages.forEach((p) => doc.addPage(p))
  return doc.save()
}

/* ---------- reorder ---------- */

export async function reorderPages(
  file: PdfFileItem,
  order: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(file.buffer)
  const doc = await PDFDocument.create()
  const pages = await doc.copyPages(src, order)
  pages.forEach((p) => doc.addPage(p))
  return doc.save()
}

/* ---------- bookmarks ---------- */

export async function addBookmarks(
  file: PdfFileItem,
  bookmarks: BookmarkItem[],
): Promise<Uint8Array> {
  if (bookmarks.length === 0) return new Uint8Array(file.buffer)

  const doc = await PDFDocument.load(file.buffer)
  const pages = doc.getPages()
  const ctx = doc.context

  const items = bookmarks.map((bm) => {
    const dict = ctx.obj({})
    dict.set(PDFName.of('Title'), PDFString.of(bm.title))
    dict.set(PDFName.of('Dest'), ctx.obj([pages[bm.pageIndex].ref, PDFName.of('Fit')]))
    return dict
  })

  for (let i = 0; i < items.length; i++) {
    if (i > 0) items[i].set(PDFName.of('Prev'), items[i - 1])
    if (i < items.length - 1) items[i].set(PDFName.of('Next'), items[i + 1])
  }

  const root = ctx.obj({})
  root.set(PDFName.of('Type'), PDFName.of('Outlines'))
  root.set(PDFName.of('First'), items[0])
  root.set(PDFName.of('Last'), items[items.length - 1])
  root.set(PDFName.of('Count'), ctx.obj(items.length))
  items.forEach((item) => item.set(PDFName.of('Parent'), root))
  doc.catalog.set(PDFName.of('Outlines'), root)

  return doc.save()
}

/* ---------- download helper ---------- */

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  saveAs(blob, filename)
}

/* ---------- format helpers ---------- */

export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function parsePageRanges(input: string, maxPage: number): number[] {
  const indices = new Set<number>()
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean)
  for (const part of parts) {
    const match = part.match(/^(\d+)\s*-\s*(\d+)$/)
    if (match) {
      const start = Math.max(1, parseInt(match[1], 10))
      const end = Math.min(maxPage, parseInt(match[2], 10))
      for (let i = start; i <= end; i++) indices.add(i - 1)
    } else {
      const n = parseInt(part, 10)
      if (!isNaN(n) && n >= 1 && n <= maxPage) indices.add(n - 1)
    }
  }
  return Array.from(indices).sort((a, b) => a - b)
}
