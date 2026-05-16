import type { SystemParams } from '@/types/mrp'

export function disaggregateToWeekly(monthlyForecast: number[]): number[] {
  const weekly: number[] = []
  monthlyForecast.forEach(m => {
    const pw = Math.ceil(m/4)
    for (let w=0; w<4; w++) weekly.push(pw)
  })
  return weekly
}

export function calcChaseStrategy(monthlyForecast: number[], p: SystemParams) {
  const weeklyDemand = disaggregateToWeekly(monthlyForecast)
  const plan = weeklyDemand.map((demand,i) => ({
    week:i+1, demand, production:demand, inventory:0,
    resourceNeeded:+(demand*p.processTime).toFixed(2),
    resourceAvailable:p.availableHours,
    surplus:+(p.availableHours-demand*p.processTime).toFixed(2),
    status: p.availableHours>=demand*p.processTime ? 'OK' : 'OVERLOAD',
  }))
  return { strategy:'Chase', plan, weeklyDemand }
}

export function calcLevelStrategy(monthlyForecast: number[], p: SystemParams) {
  const totalDemand = monthlyForecast.reduce((a,b)=>a+b,0)
  const prodPerWeek = Math.ceil(totalDemand/(monthlyForecast.length*4))
  const weeklyDemand = disaggregateToWeekly(monthlyForecast)
  let inventory = p.onHandInventory
  const plan = weeklyDemand.map((demand,i) => {
    inventory = inventory + prodPerWeek - demand
    return { week:i+1, demand, production:prodPerWeek, inventory:Math.max(0,inventory),
      resourceNeeded:+(prodPerWeek*p.processTime).toFixed(2),
      resourceAvailable:p.availableHours,
      surplus:+(p.availableHours-prodPerWeek*p.processTime).toFixed(2) }
  })
  return { strategy:'Level', plan, prodPerWeek }
}
