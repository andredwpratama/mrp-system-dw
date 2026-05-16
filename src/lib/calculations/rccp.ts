import type { RCCPRow } from '@/types/mrp'

export function calcRCCP(weeklyProduction: number[], p: { processTime:number; availableHours:number; machineUtilization:number; machineEfficiency:number }): RCCPRow[] {
  const availMins = p.availableHours * 60
  const availCap  = +(availMins * p.machineUtilization * p.machineEfficiency).toFixed(2)
  return weeklyProduction.map((production,i) => {
    const actualNeed = +(production * p.processTime * 60).toFixed(2)
    const surplus    = +(availCap - actualNeed).toFixed(2)
    const utilRate   = +((actualNeed/availCap)*100).toFixed(2)
    return { week:i+1, production, availableTime:availMins, utilization:p.machineUtilization,
      efficiency:p.machineEfficiency, availableCapacity:availCap, actualNeed, surplus,
      utilizationRate:utilRate, status: surplus>=0 ? 'OK' : 'OVERLOAD' }
  })
}
