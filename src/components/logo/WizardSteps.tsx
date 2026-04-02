import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardStepsProps {
  currentStep: number
  steps: string[]
}

export function WizardSteps({ currentStep, steps }: WizardStepsProps) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && (
            <div className={cn(
              "h-px w-8",
              i <= currentStep ? "bg-primary" : "bg-border"
            )} />
          )}
          <div className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-smooth",
            i < currentStep && "bg-primary/10 text-primary",
            i === currentStep && "bg-gradient-primary text-primary-foreground shadow-glow",
            i > currentStep && "text-muted-foreground"
          )}>
            {i < currentStep ? (
              <Check className="h-3 w-3" />
            ) : (
              <span className="flex h-4 w-4 items-center justify-center text-[10px]">{i + 1}</span>
            )}
            <span className="hidden sm:inline">{label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
