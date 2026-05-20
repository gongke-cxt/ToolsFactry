import { useState, useMemo } from 'react'
import { QrCode, Layers, ScanLine } from 'lucide-react'
import { InputSection } from '@/components/InputSection'
import { StyleSection } from '@/components/StyleSection'
import { PreviewSection } from '@/components/PreviewSection'
import { BatchSection } from '@/components/BatchSection'
import { QRScanner } from '@/components/qr/QRScanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  DEFAULT_STYLE, DEFAULT_CONTACT, DEFAULT_WIFI,
  formatContactToVCard, formatWiFi,
  type QRInputType, type QRStyleConfig, type ContactData, type WiFiData,
} from '@/types'

type SubTab = 'single' | 'batch' | 'scan'

export function QRGenerator() {
  const [subTab, setSubTab] = useState<SubTab>('single')
  const [inputType, setInputType] = useState<QRInputType>('url')
  const [urlValue, setUrlValue] = useState('https://example.com')
  const [textValue, setTextValue] = useState('')
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT)
  const [wifi, setWifi] = useState<WiFiData>(DEFAULT_WIFI)
  const [style, setStyle] = useState<QRStyleConfig>(DEFAULT_STYLE)

  const qrData = useMemo(() => {
    switch (inputType) {
      case 'url': return urlValue
      case 'text': return textValue
      case 'contact': return contact.name ? formatContactToVCard(contact) : ''
      case 'wifi': return wifi.ssid ? formatWiFi(wifi) : ''
      default: return ''
    }
  }, [inputType, urlValue, textValue, contact, wifi])

  const dataLabel = useMemo(() => {
    const labels: Record<QRInputType, string> = {
      url: 'URL 链接', text: '纯文本', contact: 'vCard 联系人', wifi: 'WiFi 凭证',
    }
    return labels[inputType]
  }, [inputType])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-tab switcher */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSubTab('single')}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-smooth cursor-pointer",
            subTab === 'single'
              ? "bg-gradient-primary text-primary-foreground shadow-glow"
              : "bg-card text-muted-foreground border border-border hover:text-foreground"
          )}
        >
          <QrCode className="h-4 w-4" />
          单个生成
        </button>
        <button
          onClick={() => setSubTab('batch')}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-smooth cursor-pointer",
            subTab === 'batch'
              ? "bg-gradient-primary text-primary-foreground shadow-glow"
              : "bg-card text-muted-foreground border border-border hover:text-foreground"
          )}
        >
          <Layers className="h-4 w-4" />
          批量生成
        </button>
        <button
          onClick={() => setSubTab('scan')}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-smooth cursor-pointer",
            subTab === 'scan'
              ? "bg-gradient-primary text-primary-foreground shadow-glow"
              : "bg-card text-muted-foreground border border-border hover:text-foreground"
          )}
        >
          <ScanLine className="h-4 w-4" />
          识别
        </button>
      </div>

      {subTab === 'scan' ? (
        <QRScanner />
      ) : subTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-elegant">
              <CardHeader><CardTitle className="text-base">数据输入</CardTitle></CardHeader>
              <CardContent>
                <InputSection
                  inputType={inputType} onInputTypeChange={setInputType}
                  urlValue={urlValue} onUrlChange={setUrlValue}
                  textValue={textValue} onTextChange={setTextValue}
                  contact={contact} onContactChange={setContact}
                  wifi={wifi} onWiFiChange={setWifi}
                />
              </CardContent>
            </Card>
            <Card className="shadow-elegant">
              <CardHeader><CardTitle className="text-base">外观样式</CardTitle></CardHeader>
              <CardContent>
                <StyleSection style={style} onStyleChange={setStyle} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-7">
            <Card className="shadow-elegant sticky top-24">
              <CardHeader><CardTitle className="text-base">实时预览</CardTitle></CardHeader>
              <CardContent>
                <PreviewSection data={qrData} style={style} dataLabel={dataLabel} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="shadow-elegant">
          <CardHeader><CardTitle className="text-base">批量生成二维码</CardTitle></CardHeader>
          <CardContent><BatchSection style={style} /></CardContent>
        </Card>
      )}
    </div>
  )
}
