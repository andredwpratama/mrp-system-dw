import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { DEFAULT_PARAMS, DEFAULT_DEMAND } from '@/lib/data/defaults'

const modules = [
  {
    step: 1,
    code: 'Forecast',
    title: 'Peramalan Permintaan',
    methods: ['DMA (n=3)', 'DES (α=0.3)', 'Regresi Linear'],
    input: '12 bulan data historis (Agt 2024 – Jul 2025)',
    output: 'Forecast 12 bulan ke depan + MAE, MSE, MAPE per metode',
    winner: 'Metode terbaik dipilih otomatis berdasarkan MAPE terendah',
  },
  {
    step: 2,
    code: 'Aggregate',
    title: 'Perencanaan Agregat',
    methods: ['Chase Strategy', 'Level Strategy'],
    input: 'Forecast bulanan dari modul 1',
    output: 'Rencana produksi mingguan (disagregasi ÷ 4 minggu/bulan)',
    winner: 'Chase Strategy dipilih karena lebih fleksibel mengikuti demand',
  },
  {
    step: 3,
    code: 'RRP',
    title: 'Resource Requirement Planning',
    methods: ['Kapasitas kasar (jam mesin)'],
    input: 'Rencana produksi mingguan + jam tersedia/minggu',
    output: 'Grafik jam butuh vs tersedia selama 48 minggu',
    winner: 'Verifikasi awal sebelum MPS dikunci',
  },
  {
    step: 4,
    code: 'MPS',
    title: 'Master Production Schedule',
    methods: ['Lot for Lot', 'Chase-based disaggregation'],
    input: 'Rencana agregat Chase Strategy',
    output: 'Jadwal produksi mingguan: GR, SR, OH, PAB I/II, NR, POR, MPS',
    winner: 'Basis Gross Requirements untuk modul MRP',
  },
  {
    step: 5,
    code: 'RCCP',
    title: 'Rough-Cut Capacity Planning',
    methods: ['Bill of Resource (BOR)'],
    input: 'MPS mingguan + kapasitas mesin (utilisasi × efisiensi)',
    output: 'Status FEASIBLE/OVERLOAD per minggu + utilisasi %',
    winner: 'Verifikasi MPS sebelum dieksekusi ke MRP',
  },
  {
    step: 6,
    code: 'MRP',
    title: 'Material Requirements Planning',
    methods: ['LFL', 'EOQ', 'POQ', 'FPR (p=4)'],
    input: 'MPS (Gross Requirements) + on-hand, safety stock, lead time',
    output: 'Planned Order Receipt & Release per metode + total biaya',
    winner: 'FPR memberikan total cost terendah (Rp 230.000)',
  },
  {
    step: 7,
    code: 'CRP',
    title: 'Capacity Requirements Planning',
    methods: ['Fermentasi (12 hari)', 'Pengemasan (0.2 jam/unit)'],
    input: 'Planned Order Release dari MRP terbaik',
    output: 'Load factor per stasiun kerja per minggu',
    winner: 'Konfirmasi kapasitas detail sebelum produksi',
  },
  {
    step: 8,
    code: 'PAC',
    title: 'Production Activity Control',
    methods: ['Monitoring konversi per batch'],
    input: 'Data batch nyata: input gram, output gram',
    output: 'Conversion rate vs target 76%, status ON TRACK / BELOW TARGET',
    winner: 'Kontrol kualitas & efisiensi produksi aktual',
  },
]

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="space-y-3">
        <p className="text-sm text-primary font-medium uppercase tracking-wide">Metodologi</p>
        <h1 className="text-3xl font-bold">Framework MRP II yang Digunakan</h1>
        <p className="text-muted-foreground leading-relaxed">
          Sistem ini mengimplementasikan 8 modul MRP II secara berurutan. Setiap modul menghasilkan output
          yang menjadi input modul berikutnya — membentuk alur perencanaan produksi yang terintegrasi.
        </p>
      </div>

      {/* Parameter Sistem */}
      <div className="rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-semibold">Parameter Sistem (Data Skripsi)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['Order Cost', `Rp ${DEFAULT_PARAMS.orderCost.toLocaleString('id-ID')}/order`],
            ['Holding Cost', `Rp ${DEFAULT_PARAMS.holdingCostPerUnit}/unit/minggu`],
            ['Process Time', `${DEFAULT_PARAMS.processTime} jam/unit`],
            ['Available Hours', `${DEFAULT_PARAMS.availableHours} jam/hari`],
            ['Machine Utilization', `${(DEFAULT_PARAMS.machineUtilization * 100).toFixed(0)}%`],
            ['Machine Efficiency', `${(DEFAULT_PARAMS.machineEfficiency * 100).toFixed(0)}%`],
            ['Conversion Rate', `${(DEFAULT_PARAMS.conversionRate * 100).toFixed(0)}%`],
            ['Fermentation Days', `${DEFAULT_PARAMS.fermentationDays} hari`],
            ['Lead Time', `${DEFAULT_PARAMS.leadTime} minggu`],
          ].map(([k, v]) => (
            <div key={k} className="bg-muted/50 rounded-md px-3 py-2">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="font-medium">{v}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Data historis: {DEFAULT_DEMAND.length} bulan ({DEFAULT_DEMAND[0].label} – {DEFAULT_DEMAND[DEFAULT_DEMAND.length - 1].label}).
          Total permintaan: {DEFAULT_DEMAND.reduce((a, d) => a + d.value, 0)} unit.
        </p>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Alur 8 Modul</h2>
        {modules.map((m, i) => (
          <Card key={m.code} className="border-border">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {m.step}
                </div>
                <CardTitle className="text-sm">
                  <Badge variant="outline" className="mr-2 text-primary border-primary/30">{m.code}</Badge>
                  {m.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-4 pl-10 space-y-2 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {m.methods.map(met => (
                  <span key={met} className="bg-muted px-2 py-0.5 rounded text-xs font-medium">{met}</span>
                ))}
              </div>
              <p className="text-muted-foreground"><strong className="text-foreground">Input:</strong> {m.input}</p>
              <p className="text-muted-foreground"><strong className="text-foreground">Output:</strong> {m.output}</p>
              <p className="text-primary text-xs">→ {m.winner}</p>
              {i < modules.length - 1 && (
                <div className="text-muted-foreground/40 text-xs">↓ output menjadi input modul berikutnya</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/results" className={buttonVariants({ variant: 'outline' })}>
          Lihat Hasil Penelitian
        </Link>
        <Link href="/demo" className={buttonVariants() + ' gap-2'}>
          Coba Demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
