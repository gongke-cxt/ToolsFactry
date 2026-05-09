export type RenameMode = 'prefix' | 'suffix' | 'extension' | 'sequence' | 'find-replace' | 'regex'

export interface RenameRule {
  mode: RenameMode
  prefix: string
  suffix: string
  newExtension: string
  sequenceStart: number
  sequenceStep: number
  sequencePadding: number
  sequencePosition: 'prefix' | 'suffix' | 'replace'
  findText: string
  replaceText: string
  caseSensitive: boolean
  regexPattern: string
  regexFlags: string
  regexReplace: string
}

export interface FileEntry {
  id: string
  name: string
  file: File
  size: number
  type: string
  lastModified: number
}

export interface RenamePreview {
  id: string
  originalName: string
  newName: string
  hasConflict: boolean
  error?: string
}

export interface HistorySnapshot {
  rules: RenameRule[]
  appliedAt: number
}

export function createDefaultRule(mode: RenameMode): RenameRule {
  return {
    mode,
    prefix: '',
    suffix: '',
    newExtension: '',
    sequenceStart: 1,
    sequenceStep: 1,
    sequencePadding: 3,
    sequencePosition: 'prefix',
    findText: '',
    replaceText: '',
    caseSensitive: true,
    regexPattern: '',
    regexFlags: 'g',
    regexReplace: '',
  }
}
