import { useState, useCallback } from 'react'
import type { ImageEngine } from '@/types/ai-image'
import { ENGINE_OPTIONS } from '@/types/ai-image'
import { useAiImage } from '@/hooks/useAiImage'
import { PromptPanel } from '@/components/ai-image/PromptPanel'
import { EngineParams } from '@/components/ai-image/EngineParams'
import { TaskCard } from '@/components/ai-image/TaskCard'
import { ImagePreviewModal } from '@/components/ai-image/ImagePreviewModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImageIcon, Trash2, Wand2 } from 'lucide-react'

export function AiImageGenerator() {
  const [engine, setEngine] = useState<ImageEngine>('midjourney')
  const [params, setParams] = useState<Record<string, string>>({})
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const {
    tasks,
    activeTask,
    activeTaskId,
    setActiveTaskId,
    generate,
    generateMidjourney,
    mjChange,
    mjDescribe,
    removeTask,
    clearTasks,
  } = useAiImage()

  const isGenerating = tasks.some(t => ['submitting', 'queued', 'processing'].includes(t.status))

  const handleGenerate = useCallback(async (prompt: string) => {
    if (engine === 'midjourney') {
      await generateMidjourney({
        prompt,
        botType: (params.botType as 'MID_JOURNEY' | 'niji') || 'MID_JOURNEY',
      })
    } else {
      await generate(engine, prompt, { ...params, referenceImage: referenceImage || undefined })
    }
  }, [engine, params, referenceImage, generate, generateMidjourney])

  const handleDescribe = useCallback(async (base64: string) => {
    await mjDescribe(base64)
  }, [mjDescribe])

  const handleMjAction = useCallback(async (taskId: string, action: string) => {
    await mjChange(taskId, action)
  }, [mjChange])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Wand2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI 图片生成</h1>
            <p className="text-sm text-muted-foreground">支持 Midjourney / 豆包 Seedream / Nano Banana 2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tasks.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearTasks} className="gap-1.5 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              清空全部
            </Button>
          )}
        </div>
      </div>

      {/* 引擎选择 + 参数 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 引擎 Tab */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">选择引擎</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ENGINE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => { setEngine(opt.id); setParams({}); setReferenceImage(null) }}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg border transition-smooth',
                  engine === opt.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-accent/30',
                )}
              >
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* 参数 + Prompt */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <EngineParams engine={engine} params={params} onChange={setParams} />
            <PromptPanel
              engine={engine}
              isGenerating={isGenerating}
              referenceImage={referenceImage}
              onReferenceChange={setReferenceImage}
              onGenerate={handleGenerate}
              onDescribe={handleDescribe}
            />
          </CardContent>
        </Card>
      </div>

      {/* 活动任务大图预览 */}
      {activeTask?.imageUrl && (
        <Card>
          <CardContent className="p-4">
            <div
              className="relative flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden cursor-zoom-in"
              style={{ maxHeight: '70vh' }}
              onClick={() => setPreviewImage(activeTask.imageUrl)}
            >
              <img
                src={activeTask.imageUrl}
                alt={activeTask.prompt}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-foreground">{activeTask.prompt}</p>
              {activeTask.mjTask?.properties?.finalPrompt && (
                <p className="text-xs text-muted-foreground">
                  Final Prompt: {activeTask.mjTask.properties.finalPrompt}
                </p>
              )}
            </div>
            {/* Midjourney 操作栏 */}
            {activeTask.engine === 'midjourney' && activeTask.status === 'success' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground leading-7">放大:</span>
                {['U1', 'U2', 'U3', 'U4'].map(action => (
                  <Button key={action} variant="outline" size="sm" onClick={() => handleMjAction(activeTask.id, action)}>
                    {action}
                  </Button>
                ))}
                <span className="text-xs text-muted-foreground leading-7 ml-2">变换:</span>
                {['V1', 'V2', 'V3', 'V4'].map(action => (
                  <Button key={action} variant="outline" size="sm" onClick={() => handleMjAction(activeTask.id, action)}>
                    {action}
                  </Button>
                ))}
                <Button variant="secondary" size="sm" className="ml-2" onClick={() => handleMjAction(activeTask.id, 'R')}>
                  R 重绘
                </Button>
              </div>
            )}
            {/* Describe 结果展示 */}
            {activeTask.engine === 'midjourney' && activeTask.mjTask?.action === 'DESCRIBE' && activeTask.status === 'success' && activeTask.mjTask.properties?.finalPrompt && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-medium mb-1">识别结果:</p>
                <p className="text-sm whitespace-pre-wrap">{activeTask.mjTask.properties.finalPrompt}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 任务列表 */}
      {tasks.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4" />
            生成记录 ({tasks.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isActive={task.id === activeTaskId}
                onClick={() => setActiveTaskId(task.id)}
                onRemove={() => removeTask(task.id)}
                onPreview={imageUrl => setPreviewImage(imageUrl)}
                onMjAction={engine === 'midjourney' ? handleMjAction : undefined}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Wand2 className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">还没有生成记录</p>
          <p className="text-sm mt-1">输入描述文字，选择引擎开始生成</p>
        </div>
      )}

      {/* 图片预览弹窗 */}
      <ImagePreviewModal
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  )
}
