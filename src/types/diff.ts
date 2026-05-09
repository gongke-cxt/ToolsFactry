export type DiffLineType = 'added' | 'removed' | 'unchanged'

export type ViewMode = 'split' | 'unified'

export interface DiffLine {
  type: DiffLineType
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export interface DiffHunk {
  index: number
  oldStart: number
  newStart: number
  header: string
  lines: DiffLine[]
}

export interface DiffOptions {
  ignoreWhitespace: boolean
}

export interface DiffResult {
  hunks: DiffHunk[]
  leftLines: DiffLine[]
  rightLines: DiffLine[]
  unifiedLines: DiffLine[]
  addedCount: number
  removedCount: number
  totalHunks: number
  identical: boolean
}
