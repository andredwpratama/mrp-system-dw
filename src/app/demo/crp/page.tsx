'use client'

import { useEffect, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import CapacityChart from '@/components/charts/CapacityChart'
import SaveSessionModal from '@/components/SaveSessionModal'
import { useDemoStore } from '@/store/demoStore'
import { calcCRP } from '@/lib/calculations/crp'
import { DEFAULT_MPS_WEEKLY } from '@/lib/data/defaults'
import { fmt2 } from '@/lib/format'
import type { CRPRow } from '@/types/mrp'

export default function CRPPage() {
  const { params, setCRPResult, mrpResult } = useDemoStore()
  const [fermentation, setFermentation] = useState<CRPRow[]>([])
  const [packaging,    setPackaging]    = useState<CRPRow[]>([])

  useEffect(() => {
    // Planned order releases: derive from MRP result if available, else use DEFAULT_MPS_WEEKLY
    const releases = mrpResult
      ? mrpResult.best.rows.map(r => r.plannedOrderRelease)
      : DEFAULT_MPS_WEEKLY

    const ferm = calcCRP(releases, {
      availableTimeMinutes: params.availableHours * 60,
      utilization: params.machineUtilization,
      efficiency:  params.machineEfficiency,
      setupTimePerLot: 0,
      runTimePerUnit: 12 * 60 / 7 / params.machineEfficiency, // fermentation: 12 days / 7 days per week / efficiency → minutes per unit
    })

    const pack = calcCRP(releases, {
      availableTimeMinutes: params.availableHours * 60,
      utilization: params.machineUtilization,
      efficiency:  params.machineEfficiency,
      setupTimePerLot: 0,
      runTimePerUnit: params.processTime * 60, // processTime hours → minutes per unit
    })

    setFermentation(ferm)
    setPackaging(pack)
    setCRPResult({ fermentation: ferm, packaging: pack })
  }, [])

  const fermOverload = fermentation.filter(r => r.status === 'OVERLOAD').length
  const packOverload = packaging.filter(r => r.status === 'OVERLOAD').length
  const avgFermLoad  = fermentation.length ? fermentation.reduce((a, r) => a + r.loadFactor, 0) / fermentation.length : 0
  const avgPackLoad  = packaging.length ? packaging.reduce((a, r) => a + r.loadFactor, 0) / packaging.length : 0

  const columns = [
    { key: 'week',             header: 'Minggu' },
    { key: 'lotSize',          header: 'Lot' },
    { key: 'opTimePerUnit',    header: 'Mnt/Unit',  render: (r: any) => fmt2(r.opTimePerUnit) },
    { key: 'totalOpTime',      header: 'Total Mnt', render: (r: any) => fmt2(r.totalOpTime) },
    { key: 'availableCapacity',header: 'Kap. Tersedia', render: (r: any) => fmt2(r.availableCapacity) },
    { key: 'surplus',          header: 'Surplus',   render: (r: any) => fmt2(r.surplus) },
    { key: 'loadFactor',       header: 'Load (%)',  render: (r: any) => fmt2(r.loadFactor) },
    { key: 'status',           header: 'Status',    render: (r: any) => (
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
            <Settings2 className="h-5 w-5 text-primary" />
            Capacity Requirements Planning (CRP)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verifikasi kapasitas detail — fermentasi &amp; pengemasan
          </p>
        </div>
        <SaveSessionModal module="crp" getData={() => ({ fermentation, packaging })} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Overload Fermentasi" value={`${fermOverload} minggu`} highlight={fermOverload === 0} sub={fermOverload === 0 ? 'Semua OK ✓' : 'Perlu perhatian'} />
        <MetricCard label="Avg Load Fermentasi"  value={`${fmt2(avgFermLoad)}%`} />
        <MetricCard label="Overload Pengemasan"  value={`${packOverload} minggu`} highlight={packOverload === 0} sub={packOverload === 0 ? 'Semua OK ✓' : 'Perlu perhatian'} />
        <MetricCard label="Avg Load Pengemasan"  value={`${fmt2(avgPackLoad)}%`} />
      </div>

      <Tabs defaultValue="fermentation">
        <TabsList>
          <TabsTrigger value="fermentation">
            Fermentasi
            {fermOverload === 0 && <Badge className="ml-1.5 bg-primary text-primary-foreground text-[10px] px-1 py-0">OK</Badge>}
          </TabsTrigger>
          <TabsTrigger value="packaging">
            Pengemasan
            {packOverload === 0 && <Badge className="ml-1.5 bg-primary text-primary-foreground text-[10px] px-1 py-0">OK</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fermentation" className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground">
            Run time per unit dihitung dari durasi fermentasi {params.fermentationDays} hari ÷ {params.availableHours} jam kerja/hari × efisiensi mesin.
          </p>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Grafik Load Fermentasi vs Kapasitas</CardTitle>
            </CardHeader>
            <CardContent>
              <CapacityChart data={fermentation as any} neededKey="totalOpTime" availableKey="availableCapacity" availableLabel="Kap. Efektif (mnt)" />
            </CardContent>
          </Card>
          <DataTable columns={columns as any} data={fermentation as any} />
        </TabsContent>

        <TabsContent value="packaging" className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground">
            Run time per unit = {params.processTime * 60} mnt/unit (process time {params.processTime} jam × 60).
          </p>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Grafik Load Pengemasan vs Kapasitas</CardTitle>
            </CardHeader>
            <CardContent>
              <CapacityChart data={packaging as any} neededKey="totalOpTime" availableKey="availableCapacity" availableLabel="Kap. Efektif (mnt)" />
            </CardContent>
          </Card>
          <DataTable columns={columns as any} data={packaging as any} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
