import Link from 'next/link'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RESEARCH_RESULTS, MRP_COST_BENCHMARK, HPP } from '@/lib/data/defaults'
import { formatRupiah } from '@/lib/format'

const beforeAfter = [
  {
    label: 'Sistem Perencanaan',
    before: RESEARCH_RESULTS.before.systemType,
    after: RESEARCH_RESULTS.after.systemType,
    better: true,
  },
  {
    label: 'Metode Forecast',
    before: RESEARCH_RESULTS.before.forecastMethod,
    after: RESEARCH_RESULTS.after.forecastMethod,
    better: true,
  },
  {
    label: 'Strategi Produksi',
    before: RESEARCH_RESULTS.before.productionStrategy,
    after: RESEARCH_RESULTS.after.productionStrategy,
    better: true,
  },
  {
    label: 'Produktivitas (unit/jam)',
    before: `${RESEARCH_RESULTS.before.productivityPerHour}`,
    after: `${RESEARCH_RESULTS.after.productivityPerHour}`,
    better: true,
    badge: `+${RESEARCH_RESULTS.after.productivityIncreasePct}%`,
  },
  {
    label: 'Utilisasi Kapasitas',
    before: `${(RESEARCH_RESULTS.before.capacityUtilization * 100).toFixed(0)}%`,
    after: `${(RESEARCH_RESULTS.after.capacityUtilizationMin * 100).toFixed(0)}–${(RESEARCH_RESULTS.after.capacityUtilizationMax * 100).toFixed(0)}%`,
    better: true,
  },
  {
    label: 'Biaya Pesan/Tahun',
    before: formatRupiah(RESEARCH_RESULTS.before.orderingCostPerYear),
    after: formatRupiah(RESEARCH_RESULTS.after.orderingCostPerYear),
    better: true,
    badge: `-${RESEARCH_RESULTS.after.costEfficiencyPct}%`,
  },
]

const mrpComparison = [
  { method: 'LFL', ...MRP_COST_BENCHMARK.LFL, best: false },
  { method: 'EOQ', ...MRP_COST_BENCHMARK.EOQ, best: false },
  { method: 'POQ', ...MRP_COST_BENCHMARK.POQ, best: false },
  { method: 'FPR', ...MRP_COST_BENCHMARK.FPR, best: true  },
]

export default function ResultsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="space-y-3">
        <p className="text-sm text-primary font-medium uppercase tracking-wide">Hasil Penelitian</p>
        <h1 className="text-3xl font-bold">Dampak Implementasi MRP II</h1>
        <p className="text-muted-foreground leading-relaxed">
          Hasil kuantitatif dari skripsi UNPAD 2025 — perbandingan sebelum dan sesudah implementasi
          sistem MRP II pada produksi bawang hitam UMKM Ciamis.
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Penghematan/Tahun', value: formatRupiah(RESEARCH_RESULTS.after.annualSavings), positive: true },
          { label: 'Efisiensi Biaya', value: `${RESEARCH_RESULTS.after.costEfficiencyPct}%`, positive: true },
          { label: 'Naik Produktivitas', value: `${RESEARCH_RESULTS.after.productivityIncreasePct}%`, positive: true },
          { label: 'MAPE Forecast', value: '~5.8%', positive: true },
          { label: 'Metode MRP Terbaik', value: 'FPR (p=4)', positive: true },
          { label: 'Total Cost MRP', value: formatRupiah(MRP_COST_BENCHMARK.FPR.totalCost), positive: true },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
            <p className="text-2xl font-bold text-primary">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Before vs After */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Perbandingan Sebelum vs Sesudah</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Aspek</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Sebelum</th>
                  <th className="text-left px-4 py-2.5 font-medium text-primary">Sesudah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {beforeAfter.map(row => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 text-muted-foreground font-medium text-xs">{row.label}</td>
                    <td className="px-4 py-3 text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-destructive/60 flex-shrink-0" />
                      {row.before}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="font-medium">{row.after}</span>
                        {row.badge && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-1 py-0">{row.badge}</Badge>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MRP Cost Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Perbandingan Biaya 4 Metode MRP</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Metode</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Holding Cost</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Ordering Cost</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mrpComparison.map(m => (
                  <tr key={m.method} className={m.best ? 'bg-primary/5' : ''}>
                    <td className="px-4 py-3 font-medium">
                      {m.method}
                      {m.best && <Badge className="ml-2 bg-primary text-primary-foreground text-[10px] px-1 py-0">Terbaik</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatRupiah(m.holdingCost)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatRupiah(m.orderingCost)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${m.best ? 'text-primary' : ''}`}>{formatRupiah(m.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* HPP */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Harga Pokok Produksi (HPP)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {[
              ['Material/Bulan', formatRupiah(HPP.materialPerMonth)],
              ['Tenaga Kerja/Bulan', formatRupiah(HPP.laborPerMonth)],
              ['Overhead/Bulan', formatRupiah(HPP.overheadPerMonth)],
              ['HPP/Unit', formatRupiah(HPP.perUnit)],
            ].map(([k, v]) => (
              <div key={k} className="bg-muted/50 rounded-md px-3 py-2">
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Total HPP/bulan: {formatRupiah(HPP.totalPerMonth)}</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/methodology" className={buttonVariants({ variant: 'outline' })}>
          Lihat Metodologi
        </Link>
        <Link href="/demo" className={buttonVariants() + ' gap-2'}>
          Coba Demo Sendiri <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
