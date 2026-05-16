export function calcRRP(weeklyProduction: number[], p: { processTime:number; availableHours:number }) {
  return weeklyProduction.map((production,i) => {
    const needed  = +(production*p.processTime).toFixed(2)
    const surplus = +(p.availableHours-needed).toFixed(2)
    return { week:i+1, demand:production, production, avgProcessTime:p.processTime,
      resourceNeeded:needed, resourceAvailable:p.availableHours, surplus,
      status: surplus>=0 ? 'Cukup' : 'Kurang' }
  })
}
