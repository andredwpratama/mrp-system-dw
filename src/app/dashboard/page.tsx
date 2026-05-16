import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, BarChart3, Trash2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      forecastResult: { select: { bestMethod: true, mapeValue: true } },
      mrpResult: { select: { bestMethod: true, fprTotalCost: true, lflTotalCost: true } },
    },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Sesi Saya</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user.email} · {sessions.length} sesi tersimpan
          </p>
        </div>
        <Link
          href="/demo"
          className={cn(buttonVariants(), 'bg-primary text-primary-foreground hover:bg-primary/90')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Sesi Baru
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">Belum ada sesi</CardTitle>
            <CardDescription className="mb-6">
              Mulai simulasi MRP II dan simpan hasilnya untuk diakses kembali.
            </CardDescription>
            <Link
              href="/demo"
              className={cn(buttonVariants(), 'bg-primary text-primary-foreground hover:bg-primary/90')}
            >
              Mulai Demo Pertama
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map(session => (
            <Card key={session.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{session.name}</CardTitle>
                  {session.mrpResult && (
                    <Badge variant="outline" className="text-xs shrink-0 border-primary text-primary">
                      {session.mrpResult.bestMethod}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {new Date(session.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                {session.forecastResult && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Forecast</span>
                    <span className="font-medium">
                      {session.forecastResult.bestMethod} · MAPE {session.forecastResult.mapeValue.toFixed(1)}%
                    </span>
                  </div>
                )}
                {session.mrpResult && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best MRP</span>
                    <span className="font-medium text-primary">
                      {formatRupiah(Math.min(session.mrpResult.lflTotalCost, session.mrpResult.fprTotalCost))}
                    </span>
                  </div>
                )}
                <div className="pt-3 flex gap-2">
                  <Link
                    href={`/api/sessions/${session.id}/delete`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 text-destructive border-destructive/30 hover:bg-destructive/10')}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Hapus
                  </Link>
                  <Link
                    href={`/demo?session=${session.id}`}
                    className={cn(buttonVariants({ size: 'sm' }), 'flex-1 bg-primary text-primary-foreground hover:bg-primary/90')}
                  >
                    Buka
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
