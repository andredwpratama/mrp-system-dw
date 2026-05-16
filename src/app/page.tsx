import Link from 'next/link'
import { ArrowRight, BarChart3, FlaskConical, Gauge, Package, TrendingUp } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { RESEARCH_RESULTS } from '@/lib/data/defaults'

const features = [
  { icon: TrendingUp,  label: 'Peramalan Permintaan', desc: 'DMA, DES & Regresi Linear otomatis, MAPE-ranked.' },
  { icon: BarChart3,   label: 'Perencanaan Agregat',  desc: 'Chase vs Level Strategy, pilih & lanjutkan ke MPS.' },
  { icon: Gauge,       label: 'RCCP & CRP',           desc: 'Verifikasi kapasitas kasar & detail sebelum eksekusi.' },
  { icon: Package,     label: '4 Metode Lot Sizing',  desc: 'LFL, EOQ, POQ, FPR — perbandingan biaya real-time.' },
  { icon: FlaskConical,label: 'PAC Monitoring',       desc: 'Tracking konversi bawang putih → bawang hitam per batch.' },
]

const stats = [
  { label: 'Efisiensi Biaya',     value: `${RESEARCH_RESULTS.after.costEfficiencyPct}%`, sub: 'penghematan biaya pesan/tahun' },
  { label: 'Peningkatan Produktivitas', value: `${RESEARCH_RESULTS.after.productivityIncreasePct}%`, sub: 'unit/jam naik 4.53 → 7.55' },
  { label: 'Penghematan/Tahun',  value: 'Rp 2.165.000', sub: 'vs. sistem manual sebelumnya' },
  { label: 'Akurasi Forecast',    value: '~5.8%', sub: 'MAPE Linear Regression' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
            Skripsi UNPAD 2025 — Black Garlic MRP II
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Sistem <span className="text-primary">MRP II</span> Interaktif
            <br />untuk Produksi Bawang Hitam
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dari peramalan permintaan hingga kontrol aktivitas produksi — semua terintegrasi,
            berbasis data penelitian nyata, dapat disimpan per sesi.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link href="/demo" className={buttonVariants({ size: 'lg' }) + ' gap-2'}>
              Coba Demo Gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/methodology" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Lihat Metodologi
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">Modul yang Tersedia</h2>
            <p className="text-muted-foreground mt-2">8 modul MRP II terintegrasi dalam satu alur demo interaktif</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.label} className="rounded-xl border border-border bg-card p-5 space-y-2 hover:border-primary/40 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">{f.label}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
            <div className="rounded-xl border border-primary bg-primary/5 p-5 space-y-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Simpan & Bandingkan Sesi</h3>
              <p className="text-sm text-muted-foreground">Login dan simpan setiap sesi perhitungan untuk dibandingkan di dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Mulai Demo Sekarang</h2>
          <p className="opacity-90 text-sm">Tidak perlu login. Isi parameter, jalankan kalkulasi, dan lihat hasilnya langsung.</p>
          <Link href="/demo" className={buttonVariants({ variant: 'secondary', size: 'lg' }) + ' gap-2'}>
            Mulai Demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
