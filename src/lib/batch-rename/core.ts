import type { RenameRule, RenamePreview, FileEntry } from '@/types/batch-rename'

export function applyRule(name: string, rule: RenameRule, index: number): string {
  const lastDot = name.lastIndexOf('.')
  const ext = lastDot > 0 ? name.slice(lastDot) : ''
  const baseName = lastDot > 0 ? name.slice(0, lastDot) : name

  switch (rule.mode) {
    case 'prefix':
      return rule.prefix ? rule.prefix + name : name

    case 'suffix':
      return rule.suffix ? baseName + rule.suffix + ext : name

    case 'extension': {
      if (!rule.newExtension) return name
      const newExt = rule.newExtension.startsWith('.') ? rule.newExtension : '.' + rule.newExtension
      return baseName + newExt
    }

    case 'sequence': {
      const num = String(rule.sequenceStart + index * rule.sequenceStep)
        .padStart(rule.sequencePadding, '0')
      switch (rule.sequencePosition) {
        case 'prefix': return num + '_' + name
        case 'suffix': return baseName + '_' + num + ext
        case 'replace': return num + ext
      }
      break
    }

    case 'find-replace': {
      if (!rule.findText) return name
      try {
        const escaped = rule.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const flags = rule.caseSensitive ? 'g' : 'gi'
        return name.replace(new RegExp(escaped, flags), rule.replaceText)
      } catch {
        return name
      }
    }

    case 'regex': {
      if (!rule.regexPattern) return name
      try {
        return name.replace(new RegExp(rule.regexPattern, rule.regexFlags), rule.regexReplace)
      } catch {
        return name
      }
    }
  }
  return name
}

export function generatePreviews(files: FileEntry[], rules: RenameRule[]): RenamePreview[] {
  const previews: RenamePreview[] = files.map((file, index) => {
    const newName = rules.reduce((name, rule) => applyRule(name, rule, index), file.name)
    return { id: file.id, originalName: file.name, newName, hasConflict: false }
  })

  const nameCount = new Map<string, number>()
  for (const p of previews) {
    nameCount.set(p.newName, (nameCount.get(p.newName) || 0) + 1)
  }
  for (const p of previews) {
    if ((nameCount.get(p.newName) || 0) > 1) p.hasConflict = true
    if (!p.newName.trim()) p.error = '文件名不能为空'
  }

  return previews
}

export function computeDiff(oldStr: string, newStr: string) {
  if (oldStr === newStr) return { prefix: oldStr, removed: '', added: '', suffix: '' }

  let prefixLen = 0
  const minLen = Math.min(oldStr.length, newStr.length)
  while (prefixLen < minLen && oldStr[prefixLen] === newStr[prefixLen]) prefixLen++

  let suffixLen = 0
  while (
    suffixLen < (oldStr.length - prefixLen) &&
    suffixLen < (newStr.length - prefixLen) &&
    oldStr[oldStr.length - 1 - suffixLen] === newStr[newStr.length - 1 - suffixLen]
  ) suffixLen++

  return {
    prefix: oldStr.slice(0, prefixLen),
    removed: oldStr.slice(prefixLen, oldStr.length - suffixLen),
    added: newStr.slice(prefixLen, newStr.length - suffixLen),
    suffix: suffixLen > 0 ? oldStr.slice(oldStr.length - suffixLen) : '',
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
