import type { DiffResult, ViewMode } from '@/types/diff'

const CSS = `
body {
  margin: 0;
  padding: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #1e293b;
  background: #fff;
}
.container { max-width: 100%; margin: 0 auto; }
.header {
  background: #f1f5f9; border-bottom: 1px solid #e2e8f0;
  padding: 12px 16px; display: flex; gap: 16px; flex-wrap: wrap;
}
.header span { font-size: 13px; color: #475569; }
.header .added { color: #16a34a; font-weight: 600; }
.header .removed { color: #dc2626; font-weight: 600; }
table { width: 100%; border-collapse: collapse; }
td { padding: 1px 8px; vertical-align: top; white-space: pre-wrap; word-break: break-all; }
.gutter {
  width: 52px; min-width: 52px; text-align: right;
  color: #94a3b8; user-select: none; background: #f8fafc;
  border-right: 1px solid #e2e8f0; padding-right: 8px;
}
.gutter-right { border-left: 1px solid #e2e8f0; }
.hunk-header td {
  background: #eff6ff; color: #3b82f6; font-weight: 600;
  padding: 4px 8px; font-size: 12px;
}
.line-added td.content { background: #dcfce7; }
.line-removed td.content { background: #fee2e2; }
.line-added td.gutter { background: #f0fdf4; }
.line-removed td.gutter { background: #fef2f2; }
.line-empty { background: #f8fafc; }
.split-table { width: 50%; float: left; }
.split-table:last-child { border-left: 1px solid #e2e8f0; }
.clearfix::after { content: ""; display: table; clear: both; }
@media print { body { color: #000; } }
`

export function exportAsHTML(result: DiffResult, viewMode: ViewMode): string {
  const lines = viewMode === 'split' ? result.leftLines : result.unifiedLines
  const rightLines = viewMode === 'split' ? result.rightLines : null

  const stats = `${result.addedCount} 增加 · ${result.removedCount} 删除`
  const title = result.identical ? '文本完全相同' : `差异对比报告 (${stats})`

  let tableHTML = ''

  if (viewMode === 'split') {
    tableHTML = `
    <div class="clearfix">
      <table class="split-table">
        <colgroup><col style="width:52px"><col></colgroup>
        ${renderSplitColumn(lines, 'left')}
      </table>
      <table class="split-table">
        <colgroup><col style="width:52px"><col></colgroup>
        ${renderSplitColumn(rightLines!, 'right')}
      </table>
    </div>`
  } else {
    tableHTML = `
    <table>
      <colgroup><col style="width:52px"><col style="width:52px"><col></colgroup>
      ${renderUnifiedRows(result)}
    </table>`
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>${title}</title><style>${CSS}</style></head>
<body>
<div class="header">
  <span class="added">+${result.addedCount} 增加</span>
  <span class="removed">-${result.removedCount} 删除</span>
  <span>${result.totalHunks} 个差异块</span>
</div>
${tableHTML}
</body></html>`
}

function renderSplitColumn(lines: { type: string; content: string; oldLineNumber?: number; newLineNumber?: number }[], side: 'left' | 'right'): string {
  const numKey = side === 'left' ? 'oldLineNumber' : 'newLineNumber'
  return lines.map(line => {
    const num = (line as any)[numKey]
    const cls = line.type === 'added' ? 'line-added' : line.type === 'removed' ? 'line-removed' : line.content === '' ? 'line-empty' : ''
    return `<tr class="${cls}">
      <td class="gutter">${num ?? ''}</td>
      <td class="content">${escapeHTML(line.content)}</td>
    </tr>`
  }).join('\n')
}

function renderUnifiedRows(result: DiffResult): string {
  let html = ''
  for (const hunk of result.hunks) {
    html += `<tr class="hunk-header"><td colspan="3">${escapeHTML(hunk.header)}</td></tr>`
    for (const line of hunk.lines) {
      const cls = line.type === 'added' ? 'line-added' : line.type === 'removed' ? 'line-removed' : ''
      html += `<tr class="${cls}">
        <td class="gutter">${line.oldLineNumber ?? ''}</td>
        <td class="gutter gutter-right">${line.newLineNumber ?? ''}</td>
        <td class="content">${escapeHTML(line.content)}</td>
      </tr>`
    }
  }
  return html
}

export function exportAsUnifiedDiff(result: DiffResult): string {
  const lines: string[] = ['--- original', '+++ modified']
  for (const hunk of result.hunks) {
    lines.push(hunk.header)
    for (const line of hunk.lines) {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
      lines.push(`${prefix}${line.content}`)
    }
  }
  return lines.join('\n')
}

function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
