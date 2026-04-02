import { TocItem } from '@/lib/markdown/renderer'

interface TableOfContentsProps {
  items: TocItem[]
  visible: boolean
}

export function TableOfContents({ items, visible }: TableOfContentsProps) {
  if (!visible || items.length === 0) return null

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="p-4 border-b border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        目录
      </h3>
      <nav className="space-y-1 max-h-60 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-smooth rounded px-2 py-1 hover:bg-accent/50"
            style={{ paddingLeft: `${(item.level - 2) * 12 + 8}px` }}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  )
}
