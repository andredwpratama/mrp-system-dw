'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDemoStore } from '@/store/demoStore'
import { DEFAULT_DEMAND, DEFAULT_PARAMS } from '@/lib/data/defaults'
import type { DemandPoint, SystemParams } from '@/types/mrp'

const PARAM_META: { key: keyof SystemParams; label: string; unit: string; step: number }[] = [
  { key: 'orderCost',          label: 'Biaya Pesan (per order)',    unit: 'Rp',    step: 1000 },
  { key: 'holdingCostPerUnit', label: 'Biaya Simpan (per unit/mgg)',unit: 'Rp',    step: 100  },
  { key: 'processTime',        label: 'Waktu Proses',               unit: 'jam/unit', step: 0.01 },
  { key: 'availableHours',     label: 'Jam Tersedia',               unit: 'jam/hari', step: 0.5  },
  { key: 'machineUtilization', label: 'Utilisasi Mesin',            unit: '0–1',   step: 0.01 },
  { key: 'machineEfficiency',  label: 'Efisiensi Mesin',            unit: '0–1',   step: 0.01 },
  { key: 'conversionRate',     label: 'Conversion Rate Target',     unit: '0–1',   step: 0.01 },
  { key: 'fermentationDays',   label: 'Lama Fermentasi',            unit: 'hari',  step: 1    },
  { key: 'onHandInventory',    label: 'On-Hand Inventory',          unit: 'unit',  step: 1    },
  { key: 'safetyStock',        label: 'Safety Stock',               unit: 'unit',  step: 1    },
  { key: 'leadTime',           label: 'Lead Time',                  unit: 'minggu',step: 1    },
]

function emptyDemand(): DemandPoint[] {
  return Array.from({ length: 12 }, (_, i) => ({ period: i + 1, label: '', value: 0 }))
}

function emptyParams(): SystemParams {
  return {
    orderCost: 0, holdingCostPerUnit: 0, processTime: 0, availableHours: 0,
    machineUtilization: 0, machineEfficiency: 0, conversionRate: 0,
    fermentationDays: 0, onHandInventory: 0, safetyStock: 0, leadTime: 0,
  }
}

export default function SetupPage() {
  const router = useRouter()
  const { setDemandData, setAllParams } = useDemoStore()

  const [demand, setDemand] = useState<DemandPoint[]>(emptyDemand)
  const [params, setParams] = useState<SystemParams>(emptyParams)
  const [error, setError] = useState('')

  function fillExample() {
    setDemand(DEFAULT_DEMAND.map(d => ({ ...d })))
    setParams({ ...DEFAULT_PARAMS })
  }

  function updateDemandLabel(i: number, label: string) {
    setDemand(prev => prev.map((d, idx) => idx === i ? { ...d, label } : d))
  }

  function updateDemandValue(i: number, value: string) {
    setDemand(prev => prev.map((d, idx) => idx === i ? { ...d, value: Number(value) || 0 } : d))
  }

  function updateParam(key: keyof SystemParams, value: string) {
    setParams(prev => ({ ...prev, [key]: Number(value) || 0 }))
  }

  function validate(): string {
    for (let i = 0; i < demand.length; i++) {
      if (!demand[i].label.trim()) return `Periode ${i + 1}: nama periode belum diisi`
      if (demand[i].value <= 0) return `Periode ${i + 1}: permintaan harus > 0`
    }
    if (params.orderCost <= 0)           return 'Biaya Pesan harus > 0'
    if (params.holdingCostPerUnit <= 0)  return 'Biaya Simpan harus > 0'
    if (params.processTime <= 0)         return 'Waktu Proses harus > 0'
    if (params.availableHours <= 0)      return 'Jam Tersedia harus > 0'
    if (params.machineUtilization <= 0)  return 'Utilisasi Mesin harus > 0'
    if (params.machineEfficiency <= 0)   return 'Efisiensi Mesin harus > 0'
    if (params.safetyStock < 0)          return 'Safety Stock tidak boleh negatif'
    if (params.leadTime <= 0)            return 'Lead Time harus > 0'
    return ''
  }

  function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setDemandData(demand)
    setAllParams(params)
    router.push('/demo/forecast')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Setup Data
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Masukkan data historis dan parameter sistem Anda sebelum memulai kalkulasi.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fillExample} className="gap-1.5 shrink-0">
          <RefreshCw className="h-3.5 w-3.5" />
          Isi Contoh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Demand Data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Data Permintaan Historis (12 Periode)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 text-xs text-muted-foreground pb-1 px-1">
              <span>Label Periode</span>
              <span className="w-6 text-center">#</span>
              <span>Permintaan (unit)</span>
            </div>
            {demand.map((d, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <Input
                  placeholder={`cth: Agt ${new Date().getFullYear()}`}
                  value={d.label}
                  onChange={e => updateDemandLabel(i, e.target.value)}
                  className="h-8 text-sm"
                />
                <span className="w-6 text-center text-xs text-muted-foreground">{i + 1}</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={d.value || ''}
                  onChange={e => updateDemandValue(i, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Parameters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Parameter Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PARAM_META.map(p => (
              <div key={p.key} className="space-y-1">
                <Label htmlFor={p.key} className="text-xs">
                  {p.label}
                  <span className="text-muted-foreground ml-1">({p.unit})</span>
                </Label>
                <Input
                  id={p.key}
                  type="number"
                  min={0}
                  step={p.step}
                  placeholder="0"
                  value={params[p.key] || ''}
                  onChange={e => updateParam(p.key, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        Mulai Kalkulasi <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
