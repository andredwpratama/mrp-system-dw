'use client'

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import ForecastChart from '@/components/charts/ForecastChart'
import SaveSessionModal from '@/components/SaveSessionModal'
import { useDemoStore } from '@/store/demoStore'
import { compareForecasts } from '@/lib/calculations/forecast'
import { formatPct, fmt2 } from '@/lib/format'

export default function ForecastPage() {
  const { demandData, params, forecastResult, setForecastResult } = useDemoStore()
  const [result, setResult] = useState(forecastResult ? { dma: null, des: null, lr: null, best: forecastResult } as any : null)

  useEffect(() => {
    const r = compareForecasts(demandData, params.machineEfficiency > 0 ? 0.3 : 0.3)
    setResult(r)
    setForecastResult(r.best)
  }, [])

  if (!result) return <div className="flex items-center justify-center h-64 text-muted-foreground">Menghitung...</div>

  const { dma, des, lr, best } = result

  const methods = [
    { key: 'dma', label: 'DMA (n=3)', data: dma },
    { key: 'des', label: 'DES (α=0.3)', data: des },
    { key: 'lr',  label: 'Reg. Linear', data: lr },
  ]

  const errorColumns = [
    { key: 't',         header: 'Per.' },
    { key: 'actual',    header: 'Aktual' },
    { key: 'forecast',  header: 'Forecast', render: (r: any) => fmt2(r.forecast) },
    { key: 'error',     header: 'Error',    render: (r: any) => fmt2(r.error) },
    { key: 'absError',  header: '|Error|',  render: (r: any) => fmt2(r.absError) },
    { key: 'sqError',   header: 'Error²',   render: (r: any) => fmt2(r.sqError) },
    { key: 'pctError',  header: 'MAPE(%)',  render: (r: any) => fmt2(r.pctError) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Peramalan Permintaan
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Perbandingan DMA, DES, dan Regresi Linear pada 12 bulan historis
          </p>
        </div>
        <SaveSessionModal
          module="forecast"
          getData={() => ({
            bestMethod: best.method,
            maeValue: best.MAE,
            mseValue: best.MSE,
            mapeValue: best.MAPE,
            futureForecasts: best.futureForecasts,
            params: { alpha: best.alpha, a: best.a, b: best.b },
          })}
        />
      </div>

      {/* Best method banner */}
      <Card className="border-primary bg-primary/5">
        <CardContent className="pt-4 pb-4 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Metode Terbaik (MAPE terendah)</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-primary">{best.method}</span>
              <Badge className="bg-primary text-primary-foreground">Terpilih</Badge>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">MAE</p>
              <p className="font-semibold">{fmt2(best.MAE)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">MSE</p>
              <p className="font-semibold">{fmt2(best.MSE)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">MAPE</p>
              <p className="font-semibold text-primary">{formatPct(best.MAPE)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perbandingan 3 metode */}
      <div className="grid grid-cols-3 gap-3">
        {methods.map(m => (
          <MetricCard
            key={m.key}
            label={m.label}
            value={formatPct(m.data.MAPE)}
            sub={`MAE: ${fmt2(m.data.MAE)} · MSE: ${fmt2(m.data.MSE)}`}
            highlight={m.data.method === best.method}
          />
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Grafik Aktual vs Forecast (12 Periode)</CardTitle>
        </CardHeader>
        <CardContent>
          <ForecastChart
            labels={demandData.map(d => d.label)}
            actual={demandData.map(d => d.value)}
            dma={dma.Ft}
            des={des.Ft}
            lr={lr.Ft}
          />
        </CardContent>
      </Card>

      {/* Detail tiap metode */}
      <Tabs defaultValue="best">
        <TabsList>
          <TabsTrigger value="best">{best.method} (Terbaik)</TabsTrigger>
          {methods.filter(m => m.data.method !== best.method).map(m => (
            <TabsTrigger key={m.key} value={m.key}>{m.label}</TabsTrigger>
          ))}
        </TabsList>
        {methods.map(m => (
          <TabsContent key={m.key} value={m.data.method === best.method ? 'best' : m.key} className="mt-4">
            <DataTable columns={errorColumns as any} data={m.data.errors} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Forecast 12 bulan ke depan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Forecast 12 Bulan ke Depan ({best.method})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {best.futureForecasts.map((v: number, i: number) => (
              <div key={i} className="text-center p-2 rounded-md bg-muted">
                <p className="text-[10px] text-muted-foreground">Bln {i + 1}</p>
                <p className="text-sm font-medium">{Math.round(v)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
