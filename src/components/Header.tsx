import { Moon, Sun, Wrench, QrCode, ImageDown, Palette, FileCode, Video, ArrowRightLeft, FileText, BookCopy } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
}

const navItems = [
  { to: '/qr', label: 'QR 二维码', icon: QrCode },
  { to: '/compress', label: '图片压缩', icon: ImageDown },
  { to: '/logo', label: 'Logo 生成', icon: Palette },
  { to: '/pdf', label: 'PDF 工具', icon: FileText },
  { to: '/converter', label: 'JSON/XML', icon: ArrowRightLeft },
  { to: '/markdown', label: 'Markdown', icon: FileCode },
  { to: '/download', label: '视频下载', icon: Video },
  { to: '/doc-sync', label: '文档互转', icon: BookCopy },
]

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 glass sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Brand + Nav */}
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary transition-smooth group-hover:shadow-glow">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
              ToolsFactry
            </span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}
