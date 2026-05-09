import { diffLines } from 'diff'
import type { DiffLine, DiffHunk, DiffResult, DiffOptions } from '@/types/diff'

function normalizeLine(line: string): string {
  return line.trimEnd().replace(/\s+/g, ' ')
}

export function computeDiff(
  left: string,
  right: string,
  options: DiffOptions
): DiffResult {
  const { ignoreWhitespace } = options

  const leftLines = left.split('\n')
  const rightLines = right.split('\n')

  if (ignoreWhitespace) {
    const normalizedLeft = leftLines.map(normalizeLine)
    const normalizedRight = rightLines.map(normalizeLine)
    return buildResult(normalizedLeft.join('\n'), normalizedRight.join('\n'), leftLines, rightLines)
  }

  return buildResult(left, right, leftLines, rightLines)
}

function buildResult(
  normLeft: string,
  normRight: string,
  originalLeft: string[],
  originalRight: string[]
): DiffResult {
  const changes = diffLines(normLeft, normRight)
  const hunks = extractHunks(changes, originalLeft, originalRight)

  const addedCount = hunks.reduce((s, h) => s + h.lines.filter(l => l.type === 'added').length, 0)
  const removedCount = hunks.reduce((s, h) => s + h.lines.filter(l => l.type === 'removed').length, 0)
  const identical = addedCount === 0 && removedCount === 0

  const { leftLines, rightLines } = buildSplitLines(hunks)
  const unifiedLines = hunks.flatMap(h => h.lines)

  return {
    hunks,
    leftLines,
    rightLines,
    unifiedLines,
    addedCount,
    removedCount,
    totalHunks: hunks.length,
    identical,
  }
}

function extractHunks(
  changes: { value: string; added?: boolean; removed?: boolean }[],
  originalLeft: string[],
  originalRight: string[]
): DiffHunk[] {
  const allLines: DiffLine[] = []
  const leftSegments: string[][] = []
  const rightSegments: string[][] = []

  let leftOffset = 0
  let rightOffset = 0

  for (const change of changes) {
    const segLines = change.value.replace(/\n$/, '').split('\n')

    if (change.added) {
      for (let i = 0; i < segLines.length; i++) {
        const lineNum = rightOffset + i + 1
        allLines.push({ type: 'added', content: originalRight[rightOffset + i] ?? segLines[i], newLineNumber: lineNum })
        leftSegments.push([])
        rightSegments.push([originalRight[rightOffset + i] ?? segLines[i]])
      }
      rightOffset += segLines.length
    } else if (change.removed) {
      for (let i = 0; i < segLines.length; i++) {
        const lineNum = leftOffset + i + 1
        allLines.push({ type: 'removed', content: originalLeft[leftOffset + i] ?? segLines[i], oldLineNumber: lineNum })
        leftSegments.push([originalLeft[leftOffset + i] ?? segLines[i]])
        rightSegments.push([])
      }
      leftOffset += segLines.length
    } else {
      for (let i = 0; i < segLines.length; i++) {
        const lineNum = leftOffset + i + 1
        allLines.push({ type: 'unchanged', content: originalLeft[leftOffset + i] ?? segLines[i], oldLineNumber: lineNum, newLineNumber: rightOffset + i + 1 })
        leftSegments.push([originalLeft[leftOffset + i] ?? segLines[i]])
        rightSegments.push([originalRight[rightOffset + i] ?? segLines[i]])
      }
      leftOffset += segLines.length
      rightOffset += segLines.length
    }
  }

  const hunks: DiffHunk[] = []
  let i = 0
  while (i < allLines.length) {
    if (allLines[i].type === 'unchanged') {
      i++
      continue
    }

    const hunkStart = Math.max(0, i - 3)
    while (hunkStart > 0 && allLines[hunkStart].type !== 'unchanged') {
      // expand backward to nearest unchanged
    }

    let hunkEnd = i
    while (hunkEnd < allLines.length && allLines[hunkEnd].type !== 'unchanged') {
      hunkEnd++
    }
    hunkEnd = Math.min(allLines.length, hunkEnd + 3)

    const hunkLines = allLines.slice(hunkStart, hunkEnd)
    const oldStart = hunkLines.find(l => l.oldLineNumber !== undefined)?.oldLineNumber ?? 1
    const newStart = hunkLines.find(l => l.newLineNumber !== undefined)?.newLineNumber ?? 1
    const oldCount = hunkLines.filter(l => l.oldLineNumber !== undefined).length
    const newCount = hunkLines.filter(l => l.newLineNumber !== undefined).length

    hunks.push({
      index: hunks.length,
      oldStart,
      newStart,
      header: `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`,
      lines: hunkLines,
    })

    i = hunkEnd
  }

  return hunks
}

function buildSplitLines(hunks: DiffHunk[]): { leftLines: DiffLine[]; rightLines: DiffLine[] } {
  const leftLines: DiffLine[] = []
  const rightLines: DiffLine[] = []

  for (const hunk of hunks) {
    let li = 0
    let ri = 0
    const lines = hunk.lines

    while (li < lines.length || ri < lines.length) {
      if (li < lines.length && lines[li].type === 'removed') {
        leftLines.push(lines[li])
        rightLines.push({ type: 'unchanged', content: '' })
        li++
      } else if (ri < lines.length && lines[ri].type === 'added') {
        leftLines.push({ type: 'unchanged', content: '' })
        rightLines.push(lines[ri])
        ri++
      } else {
        if (li < lines.length) leftLines.push(lines[li])
        if (ri < lines.length) rightLines.push(lines[ri])
        li++
        ri++
      }
    }
  }

  return { leftLines, rightLines }
}
