'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, Settings } from 'lucide-react'
import { useDemoStore } from '@/store/demoStore'
import { cn } from '@/lib/utils'

export const DEMO_STEPS = [
  { index: 0, label: 'Peramalan',       shortLabel: 'Forecast',   href: '/demo/forecast'  },
  { index: 1, label: 'Perencanaan Agg', shortLabel: 'Aggregate',  href: '/demo/aggregate' },
  { index: 2, label: 'RRP',             shortLabel: 'RRP',        href: '/demo/rrp'       },
  { index: 3, label: 'MPS',             shortLabel: 'MPS',        href: '/demo/mps'       },
  { index: 4, label: 'RCCP',            shortLabel: 'RCCP',       href: '/demo/rccp'      },
  { index: 5, label: 'MRP',             shortLabel: 'MRP',        href: '/demo/mrp'       },
  { index: 6, label: 'CRP',             shortLabel: 'CRP',        href: '/demo/crp'       },
  { index: 7, label: 'PAC',             shortLabel: 'PAC',        href: '/demo/pac'       },
]

export default function StepProgress() {
  const pathname = usePathname()
  const completedSteps = useDemoStore(s => s.completedSteps)
  const isCustomData   = useDemoStore(s => s.isCustomData)

  return (
    <nav className="flex flex-col gap-0.5">
      {/* Setup Data link — hanya untuk user yang sedang mengisi data sendiri */}
      {isCustomData && (
        <>
          <Link
            href="/demo/setup"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors',
              pathname === '/demo/setup'
                ? 'border-l-2 border-primary bg-primary/8 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Settings className="h-3.5 w-3.5 shrink-0" />
            <span>Setup Data</span>
          </Link>
          <div className="border-t border-border mx-3 my-1" />
        </>
      )}
      {DEMO_STEPS.map(step => {
        const isActive    = pathname === step.href
        const isCompleted = completedSteps.includes(step.index)

        return (
          <Link
            key={step.href}
            href={step.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
              isActive
                ? 'border-l-2 border-primary bg-primary/8 text-primary font-medium'
                : isCompleted
                  ? 'text-foreground hover:bg-muted'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium border',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : isCompleted
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground'
            )}>
              {isCompleted && !isActive ? <Check className="h-3 w-3" /> : step.index + 1}
            </span>
            <span className="truncate">{step.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
