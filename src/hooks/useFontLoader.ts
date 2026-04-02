import { useState, useEffect } from 'react'
import { getGoogleFontsUrl } from '@/lib/logo/fonts'

export function useFontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    // Inject Google Fonts stylesheet
    const existingLink = document.querySelector('link[data-google-fonts]')
    if (!existingLink) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = getGoogleFontsUrl()
      link.setAttribute('data-google-fonts', 'logo-tool')
      document.head.appendChild(link)
    }

    // Wait for fonts to be ready
    document.fonts.ready.then(() => {
      setFontsLoaded(true)
    })
  }, [])

  return { fontsLoaded }
}
