'use client'

import { useEffect, useState } from 'react'
import { CalendarRange } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import SaveSessionModal from '@/components/SaveSessionModal'
import { useDemoStore } from '@/store/demoStore'
import { calcMPS } from '@/lib/calculations/mps'
import { fmt2 } from '@/lib/format'

export default function MPSPage() {
  const { params, setMPSResult, getWeeklyProduction } = useDemoStore()
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const result = calcMPS(getWeeklyProduction(), {
      onHandInventory: params.onHandInventory,
      safetyStock: params.safetyStock,
      leadTime: params.leadTime,
    })
    setRows(result)
    setMPSResult(result)
  }, [])

  const totalMPS   = rows.reduce((a, r) => a + r.MPS, 0)
  const totalOrder = rows.filter(r => r.plannedOrderReceipt > 0).length

  const columns = [
    { key: 'week',                header: 'Minggu' },
    { key: 'grossRequirement',    header: 'GR' },
    { key: 'scheduledReceipts',   header: 'SR' },
    { key: 'onHand',              header: 'OH',    render: (r: any) => fmt2(r.onHand) },
    { key: 'PAB_I',               header: 'PAB I',  render: (r: any) => fmt2(r.PAB_I) },
    { key: 'netRequirements',     header: 'NR' },
    { key: 'plannedOrderReceipt', header: 'POR' },
    { key: 'PAB_II',              header: 'PAB II', render: (r: any) => fmt2(r.PAB_II) },
    { key: 'MPS',                 header: 'MPS',    render: (r: any) => (
      <span className="font-semibold text-primary">{r.MPS}</span>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-primary" />
            Master Production Schedule (MPS)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rencana produksi induk 12 minggu — basis untuk MRP
          </p>
        </div>
        <SaveSessionModal module="mps" getData={() => ({ rows })} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Safety Stock" value={`${params.safetyStock} unit`} />
        <MetricCard label="Total Produksi MPS" value={`${totalMPS} unit`} />
        <MetricCard label="Planned Orders" value={totalOrder} sub="dari 12 minggu" highlight />
      </div>

      <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
        <strong>Baris MPS:</strong> Demand per minggu berdasarkan disagregasi forecast → Chase Strategy.
        Nilai ini menjadi <em>Gross Requirements</em> di modul MRP.
      </div>

      <DataTable columns={columns as any} data={rows} />
    </div>
  )
}
