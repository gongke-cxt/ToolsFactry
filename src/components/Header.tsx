import { useState } from 'react'
import { Moon, Sun, QrCode, ImageDown, Palette, FileCode, Video, ArrowRightLeft, FileText, BookCopy, Files, GitCompare, Wand2, ChevronDown } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  isDark: boolean
  onToggleTheme: () => void
}

const primaryNav = [
  { to: '/qr', label: '二维码', icon: QrCode },
  { to: '/compress', label: '图片压缩', icon: ImageDown },
  { to: '/pdf', label: 'PDF工具', icon: FileText },
  { to: '/converter', label: '格式转换', icon: ArrowRightLeft },
  { to: '/markdown', label: 'Markdown', icon: FileCode },
  { to: '/download', label: '视频下载', icon: Video },
  { to: '/ai-image', label: 'AI绘图', icon: Wand2 },
  { to: '/diff', label: '文本对比', icon: GitCompare },
]

const moreNav = [
  { to: '/logo', label: 'Logo生成', icon: Palette },
  { to: '/doc-sync', label: '文档互转', icon: BookCopy },
  { to: '/batch-rename', label: '批量重命名', icon: Files },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-smooth whitespace-nowrap",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
  )

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <header className="border-b border-border bg-card/80 glass sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center gap-1 px-4 lg:px-6">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0 mr-4 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-white font-extrabold text-sm">
            GK
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground hidden sm:inline">
            工具集
          </span>
        </NavLink>

        {/* Primary Nav */}
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
          {primaryNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}

          {/* More dropdown */}
          <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              onMouseEnter={() => setMoreOpen(true)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium transition-smooth whitespace-nowrap",
                moreOpen
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", moreOpen && "rotate-180")} />
              <span className="hidden lg:inline">更多</span>
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
                {moreNav.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={navLinkClass}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}
