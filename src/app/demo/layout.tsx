'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import StepProgress from '@/components/StepProgress'
import MobileStepBar from '@/components/MobileStepBar'
import { createClient } from '@/lib/supabase'
import { useDemoStore } from '@/store/demoStore'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isCustomData = useDemoStore(s => s.isCustomData)
  const [isGuest, setIsGuest] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const loggedIn = !!data.user
      setIsGuest(!loggedIn)
      if (loggedIn && !isCustomData && pathname !== '/demo/setup') {
        router.replace('/demo/setup')
      }
    })
  }, [isCustomData, pathname])

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex gap-6 min-h-[calc(100vh-3.5rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Modul MRP II
          </p>
          <StepProgress />
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <MobileStepBar />

      {/* Main content */}
      <div className="flex-1 min-w-0 pb-16 lg:pb-0 space-y-4">
        {/* Guest mode banner */}
        {isGuest === true && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">
              Mode Demo — menampilkan data penelitian skripsi.
            </span>
            <Link href="/login" className="text-primary font-medium hover:underline ml-2 shrink-0">
              Login untuk data Anda sendiri →
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
