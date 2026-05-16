import { ArrowRight, BookOpen, FlaskConical, TrendingDown, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RESEARCH_RESULTS } from '@/lib/data/defaults'

const timeline = [
  {
    icon: TrendingDown,
    phase: 'Kondisi Awal',
    title: 'Produksi Manual & Tidak Terstruktur',
    desc: `Sebelum penelitian, UMKM bawang hitam di Ciamis mengandalkan buku produksi manual. Permintaan diasumsikan naik 10%/bulan tanpa metode statistik. Kapasitas utilisasi hanya ${(RESEARCH_RESULTS.before.capacityUtilization * 100).toFixed(0)}%, dan biaya pesan/tahun mencapai Rp ${RESEARCH_RESULTS.before.orderingCostPerYear.toLocaleString('id-ID')}.`,
  },
  {
    icon: BookOpen,
    phase: 'Penelitian',
    title: 'Skripsi UNPAD 2025 — Perancangan Sistem MRP II',
    desc: 'Andre Dwi Pratama (UNPAD, 2025) merancang sistem perencanaan produksi terintegrasi menggunakan framework MRP II: Forecasting → Aggregate Planning → MPS → RCCP → MRP → CRP → PAC. Data diambil dari 12 bulan historis produksi nyata (Agt 2024 – Jul 2025).',
  },
  {
    icon: FlaskConical,
    phase: 'Implementasi',
    title: 'Kalkulasi & Verifikasi Kapasitas',
    desc: 'Tiga metode peramalan (DMA, DES, Regresi Linear) dibandingkan. Metode terbaik (MAPE ~5.8%) digunakan untuk Aggregate Planning dengan Chase Strategy. MRP menggunakan 4 metode lot sizing (LFL, EOQ, POQ, FPR) dan ditemukan FPR memberikan total cost terendah.',
  },
  {
    icon: Lightbulb,
    phase: 'Hasil',
    title: `Efisiensi Biaya ${RESEARCH_RESULTS.after.costEfficiencyPct}% & Produktivitas Naik ${RESEARCH_RESULTS.after.productivityIncreasePct}%`,
    desc: `Dengan sistem MRP II, produktivitas naik dari ${RESEARCH_RESULTS.before.productivityPerHour} menjadi ${RESEARCH_RESULTS.after.productivityPerHour} unit/jam. Biaya pesan turun dari Rp ${RESEARCH_RESULTS.before.orderingCostPerYear.toLocaleString('id-ID')} menjadi Rp ${RESEARCH_RESULTS.after.orderingCostPerYear.toLocaleString('id-ID')}/tahun. Total penghematan Rp ${RESEARCH_RESULTS.after.annualSavings.toLocaleString('id-ID')}/tahun.`,
  },
]

export default function StoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
      <div className="space-y-3">
        <p className="text-sm text-primary font-medium uppercase tracking-wide">Latar Belakang</p>
        <h1 className="text-3xl font-bold">Mengapa GarlicFlow Dibuat?</h1>
        <p className="text-muted-foreground leading-relaxed">
          GarlicFlow lahir dari skripsi yang membuktikan bahwa sistem MRP II dapat secara nyata meningkatkan efisiensi
          produksi bawang hitam — bahkan di skala UMKM sekalipun. Ini bukan sekadar demo akademis; ini adalah bukti
          bahwa perencanaan berbasis data memberikan dampak nyata.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {timeline.map((item, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-5 pb-5 flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{item.phase}</p>
                <h3 className="font-semibold leading-snug">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Before vs After */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-2">
          <div className="p-5 bg-muted/60 space-y-3">
            <p className="font-semibold text-sm">Sebelum (Manual)</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>Sistem: {RESEARCH_RESULTS.before.systemType}</li>
              <li>Forecast: {RESEARCH_RESULTS.before.forecastMethod}</li>
              <li>Strategi: {RESEARCH_RESULTS.before.productionStrategy}</li>
              <li>Produktivitas: {RESEARCH_RESULTS.before.productivityPerHour} unit/jam</li>
              <li>Utilisasi: {(RESEARCH_RESULTS.before.capacityUtilization * 100).toFixed(0)}%</li>
            </ul>
          </div>
          <div className="p-5 bg-primary/5 border-l border-border space-y-3">
            <p className="font-semibold text-sm text-primary">Sesudah (MRP II)</p>
            <ul className="text-sm space-y-1.5">
              <li>Sistem: {RESEARCH_RESULTS.after.systemType}</li>
              <li>Forecast: {RESEARCH_RESULTS.after.forecastMethod}</li>
              <li>Strategi: {RESEARCH_RESULTS.after.productionStrategy}</li>
              <li>Produktivitas: {RESEARCH_RESULTS.after.productivityPerHour} unit/jam</li>
              <li>Utilisasi: {(RESEARCH_RESULTS.after.capacityUtilizationMin * 100).toFixed(0)}–{(RESEARCH_RESULTS.after.capacityUtilizationMax * 100).toFixed(0)}%</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/methodology" className={buttonVariants({ variant: 'outline' })}>
          Lihat Metodologi
        </Link>
        <Link href="/demo" className={buttonVariants() + ' gap-2'}>
          Coba Demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
