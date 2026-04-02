export interface CompressOptions {
  quality: number
  format: 'jpeg' | 'webp'
  maxWidth: number
}

export interface ImageItem {
  id: string
  file: File
  name: string
  originalSize: number
  originalUrl: string
  originalWidth: number
  originalHeight: number
  compressedBlob: Blob | null
  compressedUrl: string | null
  compressedSize: number
  status: 'pending' | 'processing' | 'done' | 'error'
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export function getSavingsPercent(original: number, compressed: number): number {
  if (original === 0) return 0
  return Math.round(((original - compressed) / original) * 100)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function compressImage(
  file: File,
  options: CompressOptions,
): Promise<{ blob: Blob; url: string; width: number; height: number }> {
  const url = URL.createObjectURL(file)
  const img = await loadImage(url)
  URL.revokeObjectURL(url)

  let { width, height } = img
  if (options.maxWidth > 0 && width > options.maxWidth) {
    height = Math.round((height * options.maxWidth) / width)
    width = options.maxWidth
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)

  const mimeType = options.format === 'webp' ? 'image/webp' : 'image/jpeg'
  const quality = options.quality / 100

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('压缩失败'))
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          width,
          height,
        })
      },
      mimeType,
      quality,
    )
  })
}

export async function processQueue<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  concurrency: number,
  onProgress?: (done: number, total: number) => void,
) {
  let done = 0
  const total = items.length
  const queue = items.map((item, i) => ({ item, index: i }))

  async function worker() {
    while (queue.length > 0) {
      const entry = queue.shift()!
      await fn(entry.item, entry.index)
      done++
      onProgress?.(done, total)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, total) },
    () => worker(),
  )
  await Promise.all(workers)
}

export function createImageItem(file: File): Promise<ImageItem> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        name: file.name,
        originalSize: file.size,
        originalUrl: url,
        originalWidth: img.width,
        originalHeight: img.height,
        compressedBlob: null,
        compressedUrl: null,
        compressedSize: 0,
        status: 'pending',
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        name: file.name,
        originalSize: file.size,
        originalUrl: '',
        originalWidth: 0,
        originalHeight: 0,
        compressedBlob: null,
        compressedUrl: null,
        compressedSize: 0,
        status: 'error',
      })
    }
    img.src = url
  })
}
