'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import CapacityChart from '@/components/charts/CapacityChart'
import SaveSessionModal from '@/components/SaveSessionModal'
import { useDemoStore } from '@/store/demoStore'
import { calcRRP } from '@/lib/calculations/rrp'
import { fmt2 } from '@/lib/format'

export default function RRPPage() {
  const { getWeeklyDemand, params, setRRPResult } = useDemoStore()
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const weekly = getWeeklyDemand()
    const result = calcRRP(weekly, { processTime: params.processTime, availableHours: params.availableHours })
    setRows(result)
    setRRPResult(result)
  }, [])

  const overloads = rows.filter(r => r.status === 'Kurang').length
  const avgNeed   = rows.length ? rows.reduce((a, r) => a + r.resourceNeeded, 0) / rows.length : 0

  const columns = [
    { key: 'week',              header: 'Minggu' },
    { key: 'production',        header: 'Produksi' },
    { key: 'avgProcessTime',    header: 'Jam/Unit',   render: (r: any) => fmt2(r.avgProcessTime) },
    { key: 'resourceNeeded',    header: 'Jam Butuh',  render: (r: any) => fmt2(r.resourceNeeded) },
    { key: 'resourceAvailable', header: 'Jam Tersedia' },
    { key: 'surplus',           header: 'Surplus',    render: (r: any) => fmt2(r.surplus) },
    { key: 'status',            header: 'Status',     render: (r: any) => (
      <Badge variant="outline" className={r.status === 'Cukup' ? 'text-green-700 border-green-300' : 'text-destructive border-destructive/30'}>
        {r.status}
      </Badge>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Resource Requirement Planning (RRP)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kebutuhan sumber daya kasar berdasarkan rencana produksi
          </p>
        </div>
        <SaveSessionModal module="rrp" getData={() => ({ rows })} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Jam Tersedia/Minggu" value={`${params.availableHours} jam`} />
        <MetricCard label="Rata-rata Jam Dibutuhkan" value={fmt2(avgNeed)} sub="jam/minggu" />
        <MetricCard label="Minggu Kurang Kapasitas" value={overloads} highlight={overloads === 0} sub={overloads === 0 ? 'Semua cukup ✓' : 'perlu perhatian'} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Grafik Kebutuhan vs Kapasitas (48 Minggu)</CardTitle>
        </CardHeader>
        <CardContent>
          <CapacityChart data={rows} neededKey="resourceNeeded" availableKey="resourceAvailable" availableLabel="Jam Tersedia" />
        </CardContent>
      </Card>

      <DataTable columns={columns as any} data={rows} />
    </div>
  )
}
