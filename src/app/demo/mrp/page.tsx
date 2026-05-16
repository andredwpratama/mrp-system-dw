'use client'

import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import CostCompareChart from '@/components/charts/CostCompareChart'
import SaveSessionModal from '@/components/SaveSessionModal'
import { useDemoStore } from '@/store/demoStore'
import { compareAllMethods } from '@/lib/calculations/mrp'
import { MRP_COST_BENCHMARK } from '@/lib/data/defaults'
import { formatRupiah, fmt2 } from '@/lib/format'

export default function MRPPage() {
  const { params, setMRPResult, mrpResult, getWeeklyProduction, isCustomData } = useDemoStore()
  const [result, setResult] = useState(mrpResult)

  useEffect(() => {
    const r = compareAllMethods(getWeeklyProduction(), {
      onHand: params.onHandInventory,
      safetyStock: params.safetyStock,
      leadTime: params.leadTime,
      orderCost: params.orderCost,
      holdingCostPerUnit: params.holdingCostPerUnit,
    })
    setResult(r)
    setMRPResult(r)
  }, [])

  if (!result) return <div className="flex items-center justify-center h-64 text-muted-foreground">Menghitung...</div>

  const { lfl, eoq, poq, fpr, best } = result

  const chartData = [lfl, eoq, poq, fpr].map(m => ({
    method: m.method,
    holdingCost: m.holdingCost,
    orderingCost: m.orderingCost,
    totalCost: m.totalCost,
  }))

  const methodMeta: Record<string, { label: string; lotDesc: string }> = {
    LFL: { label: 'Lot for Lot',            lotDesc: 'Pesan sesuai kebutuhan bersih' },
    EOQ: { label: 'Economic Order Quantity', lotDesc: `EOQ = ${eoq.lotValue} unit/order` },
    POQ: { label: 'Period Order Quantity',   lotDesc: `Interval = ${poq.lotValue} periode` },
    FPR: { label: 'Fixed Period Requirement',lotDesc: `Period tetap = ${fpr.lotValue} minggu` },
  }

  const allMethods = [lfl, eoq, poq, fpr]

  const columns = [
    { key: 'period',              header: 'Per.' },
    { key: 'grossRequirements',   header: 'GR' },
    { key: 'scheduledReceipts',   header: 'SR' },
    { key: 'PAB_I',               header: 'PAB I',  render: (r: any) => fmt2(r.PAB_I) },
    { key: 'netRequirements',     header: 'NR' },
    { key: 'plannedOrderReceipt', header: 'POR',    render: (r: any) => (
      r.plannedOrderReceipt > 0
        ? <span className="font-semibold text-primary">{r.plannedOrderReceipt}</span>
        : <span className="text-muted-foreground">—</span>
    )},
    { key: 'PAB_II',              header: 'PAB II', render: (r: any) => fmt2(r.PAB_II) },
    { key: 'plannedOrderRelease', header: 'Release', render: (r: any) => (
      r.plannedOrderRelease > 0 ? r.plannedOrderRelease : <span className="text-muted-foreground">—</span>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Material Requirements Planning (MRP)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Perbandingan 4 metode lot sizing — LFL, EOQ, POQ, FPR
          </p>
        </div>
        <SaveSessionModal
          module="mrp"
          getData={() => ({
            bestMethod: best.method,
            lflCost: lfl.totalCost,
            eoqCost: eoq.totalCost,
            poqCost: poq.totalCost,
            fprCost: fpr.totalCost,
          })}
        />
      </div>

      {/* Best method banner */}
      <div className="rounded-lg border border-primary bg-primary/5 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Metode Terbaik (Total Cost Terendah)</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-primary">{best.method} — {methodMeta[best.method].label}</span>
            <Badge className="bg-primary text-primary-foreground">Terpilih</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{methodMeta[best.method].lotDesc}</p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Holding Cost</p>
            <p className="font-semibold">{formatRupiah(best.holdingCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ordering Cost</p>
            <p className="font-semibold">{formatRupiah(best.orderingCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="font-semibold text-primary">{formatRupiah(best.totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Cost metrics */}
      <div className="grid grid-cols-4 gap-3">
        {allMethods.map(m => (
          <MetricCard
            key={m.method}
            label={`${m.method} — Total Cost`}
            value={formatRupiah(m.totalCost)}
            sub={`${m.numOrders}× order · HC: ${formatRupiah(m.holdingCost)}`}
            highlight={m.method === best.method}
          />
        ))}
      </div>

      {/* Benchmark note — only for demo mode with default data */}
      {!isCustomData && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
          <strong>Benchmark skripsi (FPR terbaik):</strong>{' '}
          HC: {formatRupiah(MRP_COST_BENCHMARK.FPR.holdingCost)} · OC: {formatRupiah(MRP_COST_BENCHMARK.FPR.orderingCost)} · Total: {formatRupiah(MRP_COST_BENCHMARK.FPR.totalCost)}.{' '}
          Ordering cost (jumlah order) sesuai skripsi; small holding cost delta karena perbedaan interpretasi rounding PAB.
        </div>
      )}

      {/* Chart */}
      <CostCompareChart data={chartData} bestMethod={best.method} />

      {/* Per-method tables */}
      <Tabs defaultValue={best.method.toLowerCase()}>
        <TabsList>
          {allMethods.map(m => (
            <TabsTrigger key={m.method} value={m.method.toLowerCase()}>
              {m.method}
              {m.method === best.method && (
                <Badge className="ml-1.5 bg-primary text-primary-foreground text-[10px] px-1 py-0">Best</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {allMethods.map(m => (
          <TabsContent key={m.method} value={m.method.toLowerCase()} className="mt-4 space-y-2">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{methodMeta[m.method].lotDesc}</span>
              <span>·</span>
              <span>{m.numOrders} planned orders</span>
              <span>·</span>
              <span>Total: <strong className="text-foreground">{formatRupiah(m.totalCost)}</strong></span>
            </div>
            <DataTable columns={columns as any} data={m.rows as any} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
