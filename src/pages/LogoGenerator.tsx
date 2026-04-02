import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WizardSteps } from '@/components/logo/WizardSteps'
import { BrandInput } from '@/components/logo/BrandInput'
import { StylePicker } from '@/components/logo/StylePicker'
import { LogoGrid } from '@/components/logo/LogoGrid'
import { LogoPreview } from '@/components/logo/LogoPreview'
import { LogoEditor } from '@/components/logo/LogoEditor'
import { ExportPanel } from '@/components/logo/ExportPanel'
import { AiPanel } from '@/components/logo/AiPanel'
import { useFontLoader } from '@/hooks/useFontLoader'
import { useLogoGenerator } from '@/hooks/useLogoGenerator'
import type { Industry, LogoStyle, LogoType, ColorMood, LogoConfig } from '@/types/logo'

const STEPS = ['品牌信息', '选择样式', '编辑导出']

const DEFAULT_CONFIG: LogoConfig = {
  brandName: '',
  slogan: '',
  industry: 'technology',
  style: 'modern',
  logoType: 'combination',
  colorMood: 'creative',
}

export function LogoGenerator() {
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_CONFIG)
  const { fontsLoaded } = useFontLoader()

  const {
    variants, selectedIndex, setSelectedIndex,
    generate, regenerate, isGenerating,
    editorState, setEditorState,
    selectedVariant, aiResults, addAiResult,
  } = useLogoGenerator(config, fontsLoaded)

  const canGenerate = config.brandName.trim().length > 0 && fontsLoaded

  const updateConfig = <K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <WizardSteps currentStep={step} steps={STEPS} />

      {/* Step 0: Brand Input & Style */}
      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card className="shadow-elegant">
              <CardHeader><CardTitle className="text-base">品牌信息</CardTitle></CardHeader>
              <CardContent>
                <BrandInput
                  brandName={config.brandName}
                  onBrandNameChange={(v) => updateConfig('brandName', v)}
                  slogan={config.slogan}
                  onSloganChange={(v) => updateConfig('slogan', v)}
                  industry={config.industry}
                  onIndustryChange={(v) => updateConfig('industry', v as Industry)}
                />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-elegant">
              <CardHeader><CardTitle className="text-base">视觉偏好</CardTitle></CardHeader>
              <CardContent>
                <StylePicker
                  style={config.style}
                  onStyleChange={(v) => updateConfig('style', v as LogoStyle)}
                  logoType={config.logoType}
                  onLogoTypeChange={(v) => updateConfig('logoType', v as LogoType)}
                  colorMood={config.colorMood}
                  onColorMoodChange={(v) => updateConfig('colorMood', v as ColorMood)}
                  industry={config.industry}
                />
              </CardContent>
            </Card>
            <Button
              onClick={() => { generate(); setStep(1) }}
              disabled={!canGenerate}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth h-12 text-base"
            >
              {isGenerating ? '生成中...' : !fontsLoaded ? '加载字体中...' : '生成 Logo'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Generate & Edit */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">选择方案</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setStep(0)} className="text-muted-foreground">
                    修改设置
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <LogoGrid
                  variants={variants}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                  onRegenerate={regenerate}
                />
              </CardContent>
            </Card>

            {aiResults.length > 0 && (
              <Card className="shadow-elegant">
                <CardHeader><CardTitle className="text-base">AI 生成结果</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {aiResults.map((url, i) => (
                      <div key={i} className="rounded-lg border border-border overflow-hidden">
                        <img src={url} alt={`AI Logo ${i + 1}`} className="w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-elegant">
              <CardHeader><CardTitle className="text-base">预览</CardTitle></CardHeader>
              <CardContent>
                <LogoPreview variant={selectedVariant} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-elegant">
              <CardHeader><CardTitle className="text-base">自定义</CardTitle></CardHeader>
              <CardContent>
                <LogoEditor
                  variant={selectedVariant}
                  editorState={editorState}
                  onEditorChange={setEditorState}
                  style={config.style}
                  colorMood={config.colorMood}
                />
              </CardContent>
            </Card>

            <AiPanel config={config} onResult={addAiResult} />

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedVariant}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              导出 Logo
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Export */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">导出 Logo</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-muted-foreground">
                  返回编辑
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ExportPanel variant={selectedVariant} brandName={config.brandName} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
