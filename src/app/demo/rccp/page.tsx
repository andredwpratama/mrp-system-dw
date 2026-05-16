'use client'

import { useEffect, useState } from 'react'
import { Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import CapacityChart from '@/components/charts/CapacityChart'
import SaveSessionModal from '@/components/SaveSessionModal'
import { useDemoStore } from '@/store/demoStore'
import { calcRCCP } from '@/lib/calculations/rccp'
import { fmt2, formatPct } from '@/lib/format'

export default function RCCPPage() {
  const { params, setRCCPResult, getWeeklyProduction } = useDemoStore()
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const result = calcRCCP(getWeeklyProduction(), {
      processTime:       params.processTime,
      availableHours:    params.availableHours,
      machineUtilization: params.machineUtilization,
      machineEfficiency:  params.machineEfficiency,
    })
    setRows(result)
    setRCCPResult(result)
  }, [])

  const overloads  = rows.filter(r => r.status === 'OVERLOAD').length
  const avgUtil    = rows.length ? rows.reduce((a, r) => a + r.utilizationRate, 0) / rows.length : 0
  const availCap   = rows[0]?.availableCapacity ?? 0

  const columns = [
    { key: 'week',              header: 'Minggu' },
    { key: 'production',        header: 'Prod.' },
    { key: 'availableCapacity', header: 'Kap. Tersedia', render: (r: any) => fmt2(r.availableCapacity) },
    { key: 'actualNeed',        header: 'Kap. Butuh',   render: (r: any) => fmt2(r.actualNeed) },
    { key: 'surplus',           header: 'Surplus',      render: (r: any) => fmt2(r.surplus) },
    { key: 'utilizationRate',   header: 'Utilisasi(%)', render: (r: any) => formatPct(r.utilizationRate) },
    { key: 'status',            header: 'Status',       render: (r: any) => (
      <Badge variant="outline" className={r.status === 'OK' ? 'text-green-700 border-green-300' : 'text-destructive border-destructive/30'}>
        {r.status}
      </Badge>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Rough-Cut Capacity Planning (RCCP)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verifikasi kelayakan MPS terhadap kapasitas mesin
          </p>
        </div>
        <SaveSessionModal
          module="rccp"
          getData={() => ({ rows, avgUtilization: avgUtil })}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Kapasitas Efektif/Minggu"
          value={`${fmt2(availCap)} mnt`}
          sub={`420 × ${params.machineUtilization} × ${params.machineEfficiency}`}
        />
        <MetricCard label="Rata-rata Utilisasi" value={formatPct(avgUtil)} highlight={avgUtil < 90} />
        <MetricCard
          label="Status RCCP"
          value={overloads === 0 ? 'FEASIBLE' : `${overloads} Overload`}
          highlight={overloads === 0}
          sub={overloads === 0 ? 'MPS dapat dieksekusi ✓' : 'Perlu penyesuaian'}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Grafik Kapasitas vs Kebutuhan (12 Minggu)</CardTitle>
        </CardHeader>
        <CardContent>
          <CapacityChart data={rows} neededKey="actualNeed" availableKey="availableCapacity" availableLabel={`Kap. Efektif (${fmt2(availCap)} mnt)`} />
        </CardContent>
      </Card>

      <DataTable columns={columns as any} data={rows} />
    </div>
  )
}
