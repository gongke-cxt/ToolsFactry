import { Globe, Type, User, Wifi } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import type { QRInputType, ContactData, WiFiData } from '@/types'
import { cn } from '@/lib/utils'

interface InputSectionProps {
  inputType: QRInputType
  onInputTypeChange: (type: QRInputType) => void
  urlValue: string
  onUrlChange: (v: string) => void
  textValue: string
  onTextChange: (v: string) => void
  contact: ContactData
  onContactChange: (c: ContactData) => void
  wifi: WiFiData
  onWiFiChange: (w: WiFiData) => void
}

const tabs: { type: QRInputType; label: string; icon: React.ElementType }[] = [
  { type: 'url', label: 'URL', icon: Globe },
  { type: 'text', label: '文本', icon: Type },
  { type: 'contact', label: '联系人', icon: User },
  { type: 'wifi', label: 'WiFi', icon: Wifi },
]

export function InputSection({
  inputType, onInputTypeChange,
  urlValue, onUrlChange,
  textValue, onTextChange,
  contact, onContactChange,
  wifi, onWiFiChange,
}: InputSectionProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
          数据类型
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {tabs.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onInputTypeChange(type)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-smooth cursor-pointer",
                inputType === type
                  ? "border-primary bg-accent text-accent-foreground shadow-glow"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in">
        {inputType === 'url' && (
          <div className="space-y-2">
            <Label htmlFor="url">网址链接</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={urlValue}
              onChange={(e) => onUrlChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">输入要编码的完整URL地址</p>
          </div>
        )}

        {inputType === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="text">文本内容</Label>
            <Textarea
              id="text"
              placeholder="输入要编码的文本内容..."
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              已输入 {textValue.length} 个字符
            </p>
          </div>
        )}

        {inputType === 'contact' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="c-name">姓名 *</Label>
              <Input id="c-name" placeholder="张三" value={contact.name}
                onChange={(e) => onContactChange({ ...contact, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-phone">电话</Label>
                <Input id="c-phone" placeholder="+86 138xxxx" value={contact.phone}
                  onChange={(e) => onContactChange({ ...contact, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">邮箱</Label>
                <Input id="c-email" type="email" placeholder="email@example.com" value={contact.email}
                  onChange={(e) => onContactChange({ ...contact, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="c-company">公司</Label>
                <Input id="c-company" placeholder="公司名称" value={contact.company}
                  onChange={(e) => onContactChange({ ...contact, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-title">职位</Label>
                <Input id="c-title" placeholder="职位名称" value={contact.title}
                  onChange={(e) => onContactChange({ ...contact, title: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-url">个人网站</Label>
              <Input id="c-url" placeholder="https://..." value={contact.url}
                onChange={(e) => onContactChange({ ...contact, url: e.target.value })} />
            </div>
          </div>
        )}

        {inputType === 'wifi' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="w-ssid">网络名称 (SSID) *</Label>
              <Input id="w-ssid" placeholder="MyWiFi" value={wifi.ssid}
                onChange={(e) => onWiFiChange({ ...wifi, ssid: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w-pass">密码</Label>
              <Input id="w-pass" type="password" placeholder="WiFi密码" value={wifi.password}
                onChange={(e) => onWiFiChange({ ...wifi, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w-enc">加密方式</Label>
              <Select id="w-enc" value={wifi.encryption}
                onChange={(e) => onWiFiChange({ ...wifi, encryption: e.target.value as WiFiData['encryption'] })}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">无密码</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={wifi.hidden}
                onChange={(e) => onWiFiChange({ ...wifi, hidden: e.target.checked })}
                className="rounded border-input accent-primary" />
              隐藏网络
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
