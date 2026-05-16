import type { PACBatch } from '@/types/mrp'

export function analyzeBatches(batches: Omit<PACBatch,'conversionRate'|'status'>[]) {
  return batches.map(b => {
    const cr = b.inputGrams>0 ? +(b.outputGrams/b.inputGrams).toFixed(3) : 0
    return { ...b, conversionRate:cr, conversionPct:+(cr*100).toFixed(1),
      status: cr>=0.72 ? 'ON TRACK' : 'BELOW TARGET' as PACBatch['status'] }
  })
}

export function calcPACSummary(batches: PACBatch[]) {
  const avg = batches.reduce((a,b)=>a+b.conversionRate,0)/batches.length
  return { avgConversionRate:+avg.toFixed(3), avgConversionPct:+(avg*100).toFixed(1),
    onTrack:batches.filter(b=>b.status==='ON TRACK').length,
    belowTarget:batches.filter(b=>b.status==='BELOW TARGET').length, targetRate:0.76 }
}
