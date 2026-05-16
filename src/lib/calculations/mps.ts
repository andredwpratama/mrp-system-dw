export function calcMPS(weeklyDemand: number[], p: { onHandInventory:number; safetyStock:number; leadTime:number }) {
  let onHand = p.onHandInventory
  return weeklyDemand.map((demand,i) => {
    const PAB_I  = onHand + demand - demand
    const netReq = Math.max(0, p.safetyStock - PAB_I)
    const receipt = netReq > 0 ? Math.ceil(netReq/10)*10 : 0
    const PAB_II = PAB_I + receipt
    const row = { week:i+1, grossRequirement:demand, scheduledReceipts:0, onHand,
      PAB_I:+PAB_I.toFixed(2), netRequirements:netReq, plannedOrderReceipt:receipt,
      PAB_II:+PAB_II.toFixed(2), plannedOrderRelease:receipt, MPS:demand, ATP:0 }
    onHand = PAB_II
    return row
  })
}
