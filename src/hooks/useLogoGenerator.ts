import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { LogoConfig, LogoVariant, LogoEditorState } from '@/types/logo'
import { DEFAULT_EDITOR_STATE } from '@/types/logo'
import { generateLogoVariants } from '@/lib/logo/generator'
import { buildLogoSvg } from '@/lib/logo/svg-builder'

export function useLogoGenerator(config: LogoConfig, fontsLoaded: boolean) {
  const [variants, setVariants] = useState<LogoVariant[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [seed, setSeed] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editorState, setEditorState] = useState<LogoEditorState>(DEFAULT_EDITOR_STATE)
  const [aiResults, setAiResults] = useState<string[]>([])
  const hasGenerated = useRef(false)

  const doGenerate = useCallback((s: number) => {
    if (!config.brandName.trim() || !fontsLoaded) return
    setIsGenerating(true)
    requestAnimationFrame(() => {
      const results = generateLogoVariants(config, s)
      setVariants(results)
      setSelectedIndex(0)
      setEditorState(DEFAULT_EDITOR_STATE)
      setIsGenerating(false)
    })
  }, [config, fontsLoaded])

  // Re-generate when seed changes (after initial generation)
  useEffect(() => {
    if (seed > 0) {
      doGenerate(seed)
    }
  }, [seed, doGenerate])

  const generate = useCallback(() => {
    hasGenerated.current = true
    doGenerate(seed)
  }, [doGenerate, seed])

  const regenerate = useCallback(() => {
    setSeed(s => s + 1)
  }, [])

  const addAiResult = useCallback((imageUrl: string) => {
    setAiResults(prev => [...prev, imageUrl])
  }, [])

  const selectedVariant = useMemo(() => {
    if (selectedIndex < variants.length) return variants[selectedIndex]
    return null
  }, [variants, selectedIndex])

  const editedVariant = useMemo(() => {
    if (!selectedVariant) return null
    if (editorState === DEFAULT_EDITOR_STATE) return selectedVariant

    const font = editorState.fontOverride || selectedVariant.font
    const palette = editorState.paletteOverride || selectedVariant.palette

    const svgString = buildLogoSvg({
      brandName: config.brandName,
      slogan: config.slogan,
      font,
      palette,
      icon: selectedVariant.icon,
      layout: selectedVariant.layout,
      fontSize: editorState.fontSize,
      sloganFontSize: editorState.sloganFontSize,
      iconScale: editorState.iconScale,
    })

    return { ...selectedVariant, svgString, font, palette }
  }, [selectedVariant, editorState, config])

  return {
    variants,
    selectedIndex,
    setSelectedIndex,
    generate,
    regenerate,
    isGenerating,
    editorState,
    setEditorState,
    selectedVariant: editedVariant,
    aiResults,
    addAiResult,
  }
}
