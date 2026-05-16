import Link from 'next/link'
import { Flame } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-primary" />
          <span>GarlicFlow</span>
          <span className="mx-2">·</span>
          <span>Berdasarkan skripsi Andre Dwi Pratama, UNPAD 2025</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/story" className="hover:text-primary transition-colors">Cerita</Link>
          <Link href="/methodology" className="hover:text-primary transition-colors">Metodologi</Link>
          <Link href="/results" className="hover:text-primary transition-colors">Hasil</Link>
          <Link href="/demo" className="hover:text-primary transition-colors">Demo</Link>
        </div>
      </div>
    </footer>
  )
}
