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

export type ToolMode = 'merge' | 'edit'
