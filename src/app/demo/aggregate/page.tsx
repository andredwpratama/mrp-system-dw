'use client'

import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import CapacityChart from '@/components/charts/CapacityChart'
import SaveSessionModal from '@/components/SaveSessionModal'
import { useDemoStore } from '@/store/demoStore'
import { calcChaseStrategy, calcLevelStrategy } from '@/lib/calculations/aggregate'
import { fmt2 } from '@/lib/format'

export default function AggregatePage() {
  const { forecastResult, params, setAggregateResult } = useDemoStore()
  const [chase, setChase] = useState<any>(null)
  const [level, setLevel] = useState<any>(null)
  const [chosen, setChosen] = useState<'Chase' | 'Level'>('Chase')

  useEffect(() => {
    if (!forecastResult?.futureForecasts) return
    const c = calcChaseStrategy(forecastResult.futureForecasts, params)
    const l = calcLevelStrategy(forecastResult.futureForecasts, params)
    setChase(c)
    setLevel(l)
    setAggregateResult({ chosenStrategy: 'Chase', weeklyPlan: c.plan, totalCost: 0 })
  }, [forecastResult])

  if (!forecastResult) return (
    <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
      <p>Belum ada hasil forecast.</p>
      <a href="/demo/forecast" className="text-primary text-sm underline">Jalankan modul Forecast terlebih dahulu →</a>
    </div>
  )
  if (!chase || !level) return <div className="flex items-center justify-center h-64 text-muted-foreground">Menghitung...</div>

  const columns = [
    { key: 'week',              header: 'Minggu' },
    { key: 'demand',            header: 'Demand' },
    { key: 'production',        header: 'Produksi' },
    { key: 'resourceNeeded',    header: 'Jam Butuh', render: (r: any) => fmt2(r.resourceNeeded) },
    { key: 'resourceAvailable', header: 'Jam Tersedia' },
    { key: 'surplus',           header: 'Surplus',   render: (r: any) => fmt2(r.surplus) },
    { key: 'status',            header: 'Status',    render: (r: any) => (
      <Badge variant="outline" className={r.status === 'OK' ? 'text-green-700 border-green-300' : 'text-destructive border-destructive/30'}>
        {r.status}
      </Badge>
    )},
  ]

  const overloadChase = chase.plan.filter((r: any) => r.status === 'OVERLOAD').length
  const overloadLevel = level.plan.filter((r: any) => r.status === 'OVERLOAD').length

  function handleChoose(s: 'Chase' | 'Level') {
    setChosen(s)
    const plan = s === 'Chase' ? chase.plan : level.plan
    setAggregateResult({ chosenStrategy: s, weeklyPlan: plan, totalCost: 0 })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Perencanaan Agregat
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Strategi Chase vs Level — disagregasi ke mingguan</p>
        </div>
        <SaveSessionModal
          module="aggregate"
          getData={() => ({ chosenStrategy: chosen, weeklyPlan: (chosen === 'Chase' ? chase : level).plan, totalCost: 0 })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Chase Strategy — Overload" value={`${overloadChase} minggu`} highlight={overloadChase === 0} />
        <MetricCard label="Level Strategy — Overload" value={`${overloadLevel} minggu`} highlight={overloadLevel === 0} />
      </div>

      <Tabs defaultValue="chase" onValueChange={v => handleChoose(v === 'chase' ? 'Chase' : 'Level')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="chase">
              Chase Strategy {overloadChase === 0 && <Badge className="ml-1.5 bg-primary text-primary-foreground text-[10px] px-1 py-0">Direkomendasikan</Badge>}
            </TabsTrigger>
            <TabsTrigger value="level">Level Strategy</TabsTrigger>
          </TabsList>
          <span className="text-xs text-muted-foreground">Dipilih: <strong className="text-primary">{chosen}</strong></span>
        </div>

        <TabsContent value="chase" className="space-y-4 mt-4">
          <CapacityChart data={chase.plan} neededKey="resourceNeeded" availableKey="resourceAvailable" availableLabel="Jam Tersedia" />
          <DataTable columns={columns as any} data={chase.plan} />
        </TabsContent>
        <TabsContent value="level" className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground">Produksi konstan: <strong>{level.prodPerWeek} unit/minggu</strong></p>
          <CapacityChart data={level.plan} neededKey="resourceNeeded" availableKey="resourceAvailable" availableLabel="Jam Tersedia" />
          <DataTable columns={columns as any} data={level.plan} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
