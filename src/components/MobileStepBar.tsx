'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { useDemoStore } from '@/store/demoStore'
import { DEMO_STEPS } from '@/components/StepProgress'
import { cn } from '@/lib/utils'

export default function MobileStepBar() {
  const pathname = usePathname()
  const completedSteps = useDemoStore(s => s.completedSteps)

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-2 py-2">
      <div className="flex gap-1 overflow-x-auto">
        {DEMO_STEPS.map(step => {
          const isActive    = pathname === step.href
          const isCompleted = completedSteps.includes(step.index)
          return (
            <Link
              key={step.href}
              href={step.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] shrink-0 transition-colors',
                isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <span className={cn(
                'h-4 w-4 flex items-center justify-center rounded-full text-[9px] border',
                isActive || isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
              )}>
                {isCompleted && !isActive ? <Check className="h-2 w-2" /> : step.index + 1}
              </span>
              {step.shortLabel}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
