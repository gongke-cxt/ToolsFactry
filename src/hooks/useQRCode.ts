import { useEffect, useRef, useCallback } from 'react'
import QRCodeStyling from 'qr-code-styling'
import type { QRStyleConfig } from '@/types'

interface UseQRCodeOptions {
  data: string
  style: QRStyleConfig
}

export function useQRCode({ data, style }: UseQRCodeOptions) {
  const qrCodeRef = useRef<QRCodeStyling | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: style.size,
      height: style.size,
      data: data || 'https://example.com',
      margin: style.margin,
      dotsOptions: {
        color: style.fgColor,
        type: style.dotType,
      },
      backgroundOptions: {
        color: style.bgColor,
      },
      cornersSquareOptions: {
        type: style.cornerSquareType,
        color: style.fgColor,
      },
      cornersDotOptions: {
        type: style.cornerDotType,
        color: style.fgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
      },
      ...(style.logoFile ? { image: style.logoFile } : {}),
    })

    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      qrCodeRef.current.append(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data: data || 'https://example.com',
        width: style.size,
        height: style.size,
        margin: style.margin,
        dotsOptions: {
          color: style.fgColor,
          type: style.dotType,
        },
        backgroundOptions: {
          color: style.bgColor,
        },
        cornersSquareOptions: {
          type: style.cornerSquareType,
          color: style.fgColor,
        },
        cornersDotOptions: {
          type: style.cornerDotType,
          color: style.fgColor,
        },
        ...(style.logoFile ? { image: style.logoFile } : {}),
      })
    }
  }, [data, style])

  const download = useCallback(async (extension: 'png' | 'svg', name = 'qrcode') => {
    if (qrCodeRef.current) {
      await qrCodeRef.current.download({
        name,
        extension,
      })
    }
  }, [])

  const getBlob = useCallback(async (extension: 'png' | 'svg' = 'png'): Promise<Blob | null> => {
    if (!qrCodeRef.current) return null
    const raw = await qrCodeRef.current.getRawData(extension)
    if (!raw) return null
    if (raw instanceof Blob) return raw
    return new Blob([raw])
  }, [])

  return { containerRef, download, getBlob }
}
