import type { MRPRow, MRPMethodResult, MRPComparisonResult } from '@/types/mrp'

interface MRPParams {
  onHand: number
  safetyStock: number
  leadTime: number
  orderCost: number
  holdingCostPerUnit: number
  minLot?: number
}

export function calcLFL(grossReqs: number[], p: MRPParams): MRPMethodResult {
  const rows: MRPRow[] = []
  let onHand = p.onHand
  for (let i = 0; i < grossReqs.length; i++) {
    const PAB_I  = onHand - grossReqs[i]
    const netReq = Math.max(0, p.safetyStock - PAB_I)
    const receipt = netReq > 0 ? Math.max(netReq, p.minLot ?? 10) : 0
    const PAB_II = PAB_I + receipt
    rows.push({ period:i+1, grossRequirements:grossReqs[i], scheduledReceipts:0,
      PAB_I:+PAB_I.toFixed(2), netRequirements:netReq, plannedOrderReceipt:receipt,
      PAB_II:+PAB_II.toFixed(2),
      plannedOrderRelease: i>=p.leadTime ? (rows[i-p.leadTime]?.plannedOrderReceipt??0) : receipt })
    onHand = PAB_II
  }
  const holdingCost  = rows.reduce((acc,r)=>acc+Math.max(0,r.PAB_II)*p.holdingCostPerUnit,0)
  const numOrders    = rows.filter(r=>r.plannedOrderReceipt>0).length
  const orderingCost = numOrders * p.orderCost
  return { method:'LFL', rows, holdingCost, orderingCost, totalCost:holdingCost+orderingCost, numOrders }
}

export function calcEOQ(grossReqs: number[], p: MRPParams): MRPMethodResult {
  const D   = grossReqs.reduce((a,b)=>a+b,0)/grossReqs.length
  const eoq = Math.ceil(Math.sqrt((2*D*p.orderCost)/p.holdingCostPerUnit)/10)*10
  const rows: MRPRow[] = []
  let onHand = p.onHand
  for (let i = 0; i < grossReqs.length; i++) {
    const PAB_I  = onHand - grossReqs[i]
    const netReq = Math.max(0, p.safetyStock - PAB_I)
    const receipt = netReq > 0 ? eoq : 0
    const PAB_II = PAB_I + receipt
    rows.push({ period:i+1, grossRequirements:grossReqs[i], scheduledReceipts:0,
      PAB_I:+PAB_I.toFixed(2), netRequirements:netReq, plannedOrderReceipt:receipt,
      PAB_II:+PAB_II.toFixed(2),
      plannedOrderRelease: i>=p.leadTime ? (rows[i-p.leadTime]?.plannedOrderReceipt??0) : 0 })
    onHand = PAB_II
  }
  const holdingCost  = rows.reduce((acc,r)=>acc+Math.max(0,r.PAB_II)*p.holdingCostPerUnit,0)
  const numOrders    = rows.filter(r=>r.plannedOrderReceipt>0).length
  const orderingCost = numOrders * p.orderCost
  return { method:'EOQ', rows, holdingCost, orderingCost, totalCost:holdingCost+orderingCost, numOrders, lotValue:eoq }
}

export function calcPOQ(grossReqs: number[], p: MRPParams): MRPMethodResult {
  const D   = grossReqs.reduce((a,b)=>a+b,0)/grossReqs.length
  const eoq = Math.sqrt((2*D*p.orderCost)/p.holdingCostPerUnit)
  const poq = Math.max(2, Math.round(eoq/D))
  const rows: MRPRow[] = []
  let onHand = p.onHand
  for (let i = 0; i < grossReqs.length; i++) {
    const PAB_I  = onHand - grossReqs[i]
    const netReq = Math.max(0, p.safetyStock - PAB_I)
    let receipt  = 0
    if (i%poq===0 && netReq>0) {
      const futureSum = grossReqs.slice(i, i+poq).reduce((a,b)=>a+b,0)
      receipt = Math.max(futureSum, netReq)
    }
    const PAB_II = PAB_I + receipt
    rows.push({ period:i+1, grossRequirements:grossReqs[i], scheduledReceipts:0,
      PAB_I:+PAB_I.toFixed(2), netRequirements:netReq, plannedOrderReceipt:receipt,
      PAB_II:+PAB_II.toFixed(2),
      plannedOrderRelease: i>=p.leadTime ? (rows[i-p.leadTime]?.plannedOrderReceipt??0) : 0 })
    onHand = PAB_II
  }
  const holdingCost  = rows.reduce((acc,r)=>acc+Math.max(0,r.PAB_II)*p.holdingCostPerUnit,0)
  const numOrders    = rows.filter(r=>r.plannedOrderReceipt>0).length
  const orderingCost = numOrders * p.orderCost
  return { method:'POQ', rows, holdingCost, orderingCost, totalCost:holdingCost+orderingCost, numOrders, lotValue:poq }
}

export function calcFPR(grossReqs: number[], p: MRPParams, fixedPeriod = 4): MRPMethodResult {
  const rows: MRPRow[] = []
  let onHand = p.onHand
  for (let i = 0; i < grossReqs.length; i++) {
    const PAB_I  = onHand - grossReqs[i]
    const netReq = Math.max(0, p.safetyStock - PAB_I)
    let receipt  = 0
    if (i%fixedPeriod===0) {
      const futureNeeds = grossReqs.slice(i, i+fixedPeriod).reduce((a,b)=>a+b,0)
      const needed = futureNeeds + p.safetyStock - Math.max(0, PAB_I)
      if (needed > 0) receipt = needed
    }
    const PAB_II = PAB_I + receipt
    rows.push({ period:i+1, grossRequirements:grossReqs[i], scheduledReceipts:0,
      PAB_I:+PAB_I.toFixed(2), netRequirements:netReq, plannedOrderReceipt:receipt,
      PAB_II:+PAB_II.toFixed(2),
      plannedOrderRelease: i>=p.leadTime ? (rows[i-p.leadTime]?.plannedOrderReceipt??0) : 0 })
    onHand = PAB_II
  }
  const holdingCost  = rows.reduce((acc,r)=>acc+Math.max(0,r.PAB_II)*p.holdingCostPerUnit,0)
  const numOrders    = rows.filter(r=>r.plannedOrderReceipt>0).length
  const orderingCost = numOrders * p.orderCost
  return { method:'FPR', rows, holdingCost, orderingCost, totalCost:holdingCost+orderingCost, numOrders, lotValue:fixedPeriod }
}

export function compareAllMethods(grossReqs: number[], params: MRPParams): MRPComparisonResult {
  const lfl = calcLFL(grossReqs, params)
  const eoq = calcEOQ(grossReqs, params)
  const poq = calcPOQ(grossReqs, params)
  const fpr = calcFPR(grossReqs, params)
  const best = [lfl,eoq,poq,fpr].reduce((a,b) => a.totalCost < b.totalCost ? a : b)
  return { lfl, eoq, poq, fpr, best, bestMethod: best.method }
}
