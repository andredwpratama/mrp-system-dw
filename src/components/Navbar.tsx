'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Flame } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/story',       label: 'Cerita' },
  { href: '/methodology', label: 'Metodologi' },
  { href: '/results',     label: 'Hasil' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'GF'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Flame className="h-5 w-5 text-primary" />
          <span>GarlicFlow</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors hover:text-primary ${
                pathname === href ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full">Sesi Saya</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/demo" className="w-full">Mulai Demo</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Masuk
              </Link>
              <Link
                href="/demo"
                className={cn(buttonVariants({ size: 'sm' }), 'bg-primary text-primary-foreground hover:bg-primary/90')}
              >
                Coba Demo
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-sm py-1 ${pathname === href ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm" onClick={() => { setOpen(false); handleSignOut() }}>
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  Masuk
                </Link>
                <Link
                  href="/demo"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ size: 'sm' }), 'bg-primary text-primary-foreground hover:bg-primary/90')}
                >
                  Coba Demo
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
