'use client'

import { useEffect, useState } from 'react'
import { FlaskConical, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MetricCard from '@/components/MetricCard'
import DataTable from '@/components/DataTable'
import SaveSessionModal from '@/components/SaveSessionModal'
import { useDemoStore } from '@/store/demoStore'
import { analyzeBatches, calcPACSummary } from '@/lib/calculations/pac'
import { DEFAULT_PAC_BATCHES } from '@/lib/data/defaults'
import { fmt2, formatPct } from '@/lib/format'
import type { PACBatch } from '@/types/mrp'

type DraftBatch = Omit<PACBatch, 'conversionRate' | 'status'>

function emptyBatch(i: number): DraftBatch {
  return { batchCode: `B${i + 1}`, batchDate: '', inputGrams: 0, outputGrams: 0, estimatedOutput: 0 }
}

export default function PACPage() {
  const { setPACBatches, isCustomData } = useDemoStore()
  const [batches, setBatches] = useState<(PACBatch & { conversionPct: number })[]>([])
  const [drafts, setDrafts] = useState<DraftBatch[]>([emptyBatch(0)])

  // Guest mode: load default data
  useEffect(() => {
    if (!isCustomData) {
      const analyzed = analyzeBatches(DEFAULT_PAC_BATCHES) as (PACBatch & { conversionPct: number })[]
      setBatches(analyzed)
      setPACBatches(analyzed)
    }
  }, [isCustomData])

  // Logged-in mode: recalculate whenever drafts change
  useEffect(() => {
    if (!isCustomData) return
    const validDrafts = drafts.filter(d => d.inputGrams > 0 && d.outputGrams > 0)
    if (!validDrafts.length) return
    const analyzed = analyzeBatches(validDrafts) as (PACBatch & { conversionPct: number })[]
    setBatches(analyzed)
    setPACBatches(analyzed)
  }, [drafts, isCustomData])

  function addRow() {
    setDrafts(prev => [...prev, emptyBatch(prev.length)])
  }

  function removeRow(i: number) {
    setDrafts(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateDraft(i: number, key: keyof DraftBatch, value: string) {
    setDrafts(prev => prev.map((d, idx) =>
      idx === i ? { ...d, [key]: key === 'batchCode' || key === 'batchDate' ? value : Number(value) || 0 } : d
    ))
  }

  const summary = batches.length ? calcPACSummary(batches) : null

  const readColumns = [
    { key: 'batchCode',      header: 'Batch' },
    { key: 'batchDate',      header: 'Tanggal' },
    { key: 'inputGrams',     header: 'Input (g)',  render: (r: any) => r.inputGrams.toLocaleString('id-ID') },
    { key: 'outputGrams',    header: 'Output (g)', render: (r: any) => r.outputGrams.toLocaleString('id-ID') },
    { key: 'estimatedOutput',header: 'Est. Pcs' },
    { key: 'conversionRate', header: 'Konversi',   render: (r: any) => formatPct((r as any).conversionPct / 100) },
    { key: 'status',         header: 'Status',     render: (r: any) => (
      <Badge variant="outline" className={r.status === 'ON TRACK' ? 'text-green-700 border-green-300' : 'text-destructive border-destructive/30'}>
        {r.status}
      </Badge>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Production Activity Control (PAC)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitoring konversi bawang putih → bawang hitam per batch
          </p>
        </div>
        <SaveSessionModal module="pac" getData={() => ({ batches })} />
      </div>

      {/* Editable input for logged-in users */}
      {isCustomData && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Input Data Batch</CardTitle>
              <Button size="sm" variant="outline" onClick={addRow} className="gap-1.5 h-7 text-xs">
                <Plus className="h-3 w-3" /> Tambah Batch
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-[80px_120px_1fr_1fr_80px_32px] gap-2 text-xs text-muted-foreground pb-1">
              <span>Kode</span>
              <span>Tanggal</span>
              <span>Input (g)</span>
              <span>Output (g)</span>
              <span>Est. Pcs</span>
              <span />
            </div>
            {drafts.map((d, i) => (
              <div key={i} className="grid grid-cols-[80px_120px_1fr_1fr_80px_32px] gap-2 items-center">
                <Input
                  value={d.batchCode}
                  onChange={e => updateDraft(i, 'batchCode', e.target.value)}
                  placeholder="B1"
                  className="h-8 text-sm"
                />
                <Input
                  type="date"
                  value={d.batchDate}
                  onChange={e => updateDraft(i, 'batchDate', e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  value={d.inputGrams || ''}
                  onChange={e => updateDraft(i, 'inputGrams', e.target.value)}
                  placeholder="0"
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  value={d.outputGrams || ''}
                  onChange={e => updateDraft(i, 'outputGrams', e.target.value)}
                  placeholder="0"
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  value={d.estimatedOutput || ''}
                  onChange={e => updateDraft(i, 'estimatedOutput', e.target.value)}
                  placeholder="0"
                  className="h-8 text-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeRow(i)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={drafts.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label="Rata-rata Konversi"
            value={formatPct(summary.avgConversionRate)}
            highlight={summary.avgConversionRate >= 0.72}
            sub={`Target: ${formatPct(summary.targetRate)}`}
          />
          <MetricCard
            label="Batch ON TRACK"
            value={`${summary.onTrack} / ${batches.length}`}
            highlight={summary.onTrack === batches.length}
          />
          <MetricCard
            label="Batch Below Target"
            value={summary.belowTarget}
            sub={summary.belowTarget === 0 ? 'Semua batch OK ✓' : 'Perlu investigasi'}
            highlight={summary.belowTarget === 0}
          />
          <MetricCard
            label="Target Konversi"
            value={formatPct(summary.targetRate)}
            sub="Standar minimal produksi"
          />
        </div>
      )}

      <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
        <strong>Rumus konversi:</strong> Output (g) ÷ Input (g). Batch dinyatakan <em>ON TRACK</em> jika konversi ≥ 72% (target skripsi).
        {!isCustomData && ' Data dari lampiran skripsi — 4 batch produksi Agustus 2025.'}
      </div>

      {batches.length > 0 && <DataTable columns={readColumns as any} data={batches as any} />}

      {summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ringkasan Konversi per Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detail Batch</p>
                {batches.map(b => (
                  <div key={b.batchCode} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{b.batchCode} ({b.batchDate})</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatPct((b as any).conversionPct / 100)}</span>
                      <div className="h-2 rounded-full bg-primary/20 w-20 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${b.status === 'ON TRACK' ? 'bg-primary' : 'bg-destructive'}`}
                          style={{ width: `${Math.min(100, (b as any).conversionPct / summary.targetRate / 100 * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Analisis</p>
                <div className="text-sm space-y-1">
                  <p>Total Input:  <strong>{batches.reduce((a, b) => a + b.inputGrams, 0).toLocaleString('id-ID')} g</strong></p>
                  <p>Total Output: <strong>{batches.reduce((a, b) => a + b.outputGrams, 0).toLocaleString('id-ID')} g</strong></p>
                  <p>Avg Konversi: <strong className={summary.avgConversionRate >= 0.72 ? 'text-primary' : 'text-destructive'}>
                    {formatPct(summary.avgConversionRate)}
                  </strong></p>
                  <p className="text-muted-foreground pt-1 text-xs">
                    {summary.avgConversionRate >= summary.targetRate
                      ? '✓ Rata-rata konversi memenuhi target 76%'
                      : '⚠ Rata-rata konversi di bawah target — review proses fermentasi'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
