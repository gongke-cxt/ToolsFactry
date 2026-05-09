export interface PdfFileItem {
  id: string
  name: string
  size: number
  pageCount: number
  buffer: ArrayBuffer
}

export interface PageThumb {
  id: string
  pageIndex: number
  dataUrl: string
}

export interface BookmarkItem {
  id: string
  title: string
  pageIndex: number
}

export type ToolMode = 'merge' | 'edit' | 'to-image'

export type ImageFormat = 'png' | 'jpeg' | 'webp'

export interface ImageExportOptions {
  format: ImageFormat
  quality: number        // 0-1 for jpeg/webp
  scale: number          // render scale (1 = 72dpi, 2 = 144dpi, 3 = 216dpi)
}

export interface PdfImageTask {
  id: string
  file: PdfFileItem
  pageIndices: number[]   // empty = all pages
}
