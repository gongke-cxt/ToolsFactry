export type QRInputType = 'url' | 'text' | 'contact' | 'wifi'

export type DotType = 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'
export type CornerSquareType = 'dot' | 'square' | 'extra-rounded'
export type CornerDotType = 'dot' | 'square'

export interface QRStyleConfig {
  fgColor: string
  bgColor: string
  dotType: DotType
  cornerSquareType: CornerSquareType
  cornerDotType: CornerDotType
  logoFile: string | null
  size: number
  margin: number
}

export interface ContactData {
  name: string
  phone: string
  email: string
  company: string
  title: string
  url: string
}

export interface WiFiData {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export interface QRData {
  type: QRInputType
  value: string
  contact?: ContactData
  wifi?: WiFiData
}

export interface BatchItem {
  id: string
  label: string
  data: string
  type: QRInputType
}

export const DEFAULT_STYLE: QRStyleConfig = {
  fgColor: '#6366f1',
  bgColor: '#ffffff',
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  logoFile: null,
  size: 300,
  margin: 10,
}

export const DEFAULT_CONTACT: ContactData = {
  name: '',
  phone: '',
  email: '',
  company: '',
  title: '',
  url: '',
}

export const DEFAULT_WIFI: WiFiData = {
  ssid: '',
  password: '',
  encryption: 'WPA',
  hidden: false,
}

export function formatContactToVCard(contact: ContactData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${contact.name}`,
    `FN:${contact.name}`,
  ]
  if (contact.phone) lines.push(`TEL:${contact.phone}`)
  if (contact.email) lines.push(`EMAIL:${contact.email}`)
  if (contact.company) lines.push(`ORG:${contact.company}`)
  if (contact.title) lines.push(`TITLE:${contact.title}`)
  if (contact.url) lines.push(`URL:${contact.url}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

export function formatWiFi(wifi: WiFiData): string {
  const hidden = wifi.hidden ? 'H:true' : ''
  return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};${hidden};`
}
