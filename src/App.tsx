import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { QRGenerator } from '@/pages/QRGenerator'
import { ImageCompressor } from '@/pages/ImageCompressor'
import { LogoGenerator } from '@/pages/LogoGenerator'
import { MarkdownConverter } from '@/pages/MarkdownConverter'
import { VideoDownloader } from '@/pages/VideoDownloader'
import { JsonXmlConverter } from '@/pages/JsonXmlConverter'
import { PdfTools } from '@/pages/PdfTools'
import { DocConverter } from '@/pages/DocConverter'
import { useTheme } from '@/hooks/useTheme'

function App() {
  const { isDark, toggle } = useTheme()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-surface relative">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <img
            src="/hero-bg.png"
            alt=""
            className="absolute top-0 right-0 w-1/2 h-auto opacity-[0.04] dark:opacity-[0.06] select-none"
            loading="lazy"
          />
        </div>

        <Header isDark={isDark} onToggleTheme={toggle} />

        <main className="container mx-auto px-4 lg:px-8 py-8 relative">
          <Routes>
            <Route path="/" element={<Navigate to="/qr" replace />} />
            <Route path="/qr" element={<QRGenerator />} />
            <Route path="/compress" element={<ImageCompressor />} />
            <Route path="/logo" element={<LogoGenerator />} />
            <Route path="/markdown" element={<MarkdownConverter />} />
            <Route path="/download" element={<VideoDownloader />} />
            <Route path="/converter" element={<JsonXmlConverter />} />
            <Route path="/pdf" element={<PdfTools />} />
            <Route path="/doc-sync" element={<DocConverter />} />
          </Routes>
        </main>

        <footer className="border-t border-border py-6 mt-12">
          <div className="container mx-auto px-4 lg:px-8 text-center text-xs text-muted-foreground">
            ToolsFactry - 实用在线工具集
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
