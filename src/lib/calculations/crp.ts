import type { CRPRow } from '@/types/mrp'

export function calcCRP(plannedOrderRelease: number[], p: { availableTimeMinutes?:number; utilization?:number; efficiency?:number; setupTimePerLot?:number; runTimePerUnit?:number }): CRPRow[] {
  const { availableTimeMinutes=420, utilization=0.90, efficiency=0.95, setupTimePerLot=0, runTimePerUnit=7 } = p
  const availCap = +(availableTimeMinutes * utilization * efficiency).toFixed(2)
  return plannedOrderRelease.map((lotSize,i) => {
    const setupPerUnit  = lotSize>0 ? +(setupTimePerLot/lotSize).toFixed(2) : 0
    const opTimePerUnit = +(setupPerUnit+runTimePerUnit).toFixed(2)
    const totalOpTime   = +(lotSize*opTimePerUnit).toFixed(2)
    const surplus       = +(availCap-totalOpTime).toFixed(2)
    const loadFactor    = totalOpTime>0 ? +((totalOpTime/availCap)*100).toFixed(2) : 0
    return { week:i+1, lotSize, setupTimePerUnit:setupPerUnit, runTimePerUnit, opTimePerUnit,
      totalOpTime, availableCapacity:availCap, surplus, loadFactor, status:surplus>=0?'OK':'OVERLOAD' }
  })
}
