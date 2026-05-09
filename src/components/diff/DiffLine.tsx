import type { DiffLine as DiffLineType } from '@/types/diff'
import { cn } from '@/lib/utils'

interface DiffLineProps {
  line: DiffLineType
  isCurrentHunk?: boolean
  showOldNumber?: boolean
  showNewNumber?: boolean
  gutterWidth?: string
}

export function DiffLine({
  line,
  isCurrentHunk = false,
  showOldNumber = false,
  showNewNumber = false,
  gutterWidth = 'w-[52px]',
}: DiffLineProps) {
  const isPlaceholder = line.content === '' && line.type === 'unchanged'

  return (
    <tr
      className={cn(
        'align-top',
        isCurrentHunk && 'ring-1 ring-inset ring-primary/30',
        line.type === 'added' && 'bg-green-50 dark:bg-green-950/20',
        line.type === 'removed' && 'bg-red-50 dark:bg-red-950/20',
        isPlaceholder && 'bg-muted/50',
      )}
    >
      {showOldNumber && (
        <td
          className={cn(
            gutterWidth,
            'min-w-[44px] text-right pr-2 select-none text-xs text-muted-foreground border-r border-border py-px',
            line.type === 'added' && 'text-green-700 dark:text-green-400',
            line.type === 'removed' && 'text-red-700 dark:text-red-400',
          )}
        >
          {line.oldLineNumber ?? ''}
        </td>
      )}
      {showNewNumber && (
        <td
          className={cn(
            gutterWidth,
            'min-w-[44px] text-right pr-2 select-none text-xs text-muted-foreground border-r border-border py-px',
            line.type === 'added' && 'text-green-700 dark:text-green-400',
            line.type === 'removed' && 'text-red-700 dark:text-red-400',
          )}
        >
          {line.newLineNumber ?? ''}
        </td>
      )}
      <td
        className={cn(
          'pl-3 py-px font-mono text-sm leading-relaxed whitespace-pre-wrap break-all',
          line.type === 'added' && 'text-green-900 dark:text-green-200',
          line.type === 'removed' && 'text-red-900 dark:text-red-200',
          isPlaceholder && 'text-transparent',
        )}
      >
        {line.content || '\u00A0'}
      </td>
    </tr>
  )
}
