import type { DemandPoint, ForecastOutput, ForecastError } from '@/types/mrp'

export function calcDMA(data: DemandPoint[], n = 3): ForecastOutput {
  const Xt = data.map(d => d.value)
  const len = Xt.length
  const St  = Array<number | null>(len).fill(null)
  const St2 = Array<number | null>(len).fill(null)

  for (let i = n - 1; i < len; i++)
    St[i] = Xt.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n

  for (let i = 2 * n - 2; i < len; i++) {
    const vals = (St.slice(i - n + 1, i + 1) as number[]).filter(v => v !== null)
    if (vals.length === n) St2[i] = vals.reduce((a, b) => a + b, 0) / n
  }

  const at = St.map((s, i) => s !== null && St2[i] !== null ? 2 * s! - St2[i]! : null)
  const bt = St.map((s, i) => s !== null && St2[i] !== null ? (2 / (n - 1)) * (s! - St2[i]!) : null)
  const Ft: (number | null)[] = Array(len).fill(null)
  for (let i = 2 * n - 2; i < len - 1; i++)
    if (at[i] !== null) Ft[i + 1] = at[i]! + bt[i]! * 1

  const errors: ForecastError[] = []
  for (let i = 2 * n - 1; i < len; i++) {
    if (Ft[i] !== null)
      errors.push({ t: i+1, actual: Xt[i], forecast: Ft[i]!, error: Xt[i]-Ft[i]!,
        absError: Math.abs(Xt[i]-Ft[i]!), sqError: (Xt[i]-Ft[i]!)**2,
        pctError: Math.abs((Xt[i]-Ft[i]!)/Xt[i])*100 })
  }

  const MAE  = errors.reduce((a,b)=>a+b.absError,0)/errors.length
  const MSE  = errors.reduce((a,b)=>a+b.sqError,0)/errors.length
  const MAPE = errors.reduce((a,b)=>a+b.pctError,0)/errors.length
  const last = [...at.keys()].filter(i=>at[i]!==null).pop()!
  const futureForecasts = Array.from({length:12},(_,m)=>Math.max(0,at[last]!+bt[last]!*(m+1)))

  return { method: 'DMA', Ft, errors, MAE, MSE, MAPE, futureForecasts }
}

export function calcDES(data: DemandPoint[], alpha = 0.3): ForecastOutput {
  const Xt = data.map(d => d.value)
  const n = Xt.length
  const St = Array<number>(n).fill(0)
  const St2 = Array<number>(n).fill(0)
  St[0] = St2[0] = Xt[0]
  for (let i = 1; i < n; i++) {
    St[i]  = alpha*Xt[i] + (1-alpha)*St[i-1]
    St2[i] = alpha*St[i] + (1-alpha)*St2[i-1]
  }
  const at = St.map((s,i) => 2*s - St2[i])
  const bt = St.map((s,i) => (alpha/(1-alpha))*(s-St2[i]))
  const Ft: (number|null)[] = Array(n).fill(null)
  for (let i = 1; i < n; i++) Ft[i] = at[i-1] + bt[i-1]*1

  const errors: ForecastError[] = []
  for (let i = 1; i < n; i++)
    errors.push({ t:i+1, actual:Xt[i], forecast:Ft[i]!, error:Xt[i]-Ft[i]!,
      absError:Math.abs(Xt[i]-Ft[i]!), sqError:(Xt[i]-Ft[i]!)**2,
      pctError:Math.abs((Xt[i]-Ft[i]!)/Xt[i])*100 })

  const MAE  = errors.reduce((a,b)=>a+b.absError,0)/errors.length
  const MSE  = errors.reduce((a,b)=>a+b.sqError,0)/errors.length
  const MAPE = errors.reduce((a,b)=>a+b.pctError,0)/errors.length
  const last = n-1
  const futureForecasts = Array.from({length:12},(_,m)=>Math.max(0,at[last]+bt[last]*(m+1)))
  return { method:'DES', Ft, errors, MAE, MSE, MAPE, futureForecasts, alpha }
}

export function calcLinearRegression(data: DemandPoint[]): ForecastOutput {
  const n = data.length
  const Xt = data.map(d => d.value)
  const t  = data.map((_,i) => i+1)
  const sumT  = t.reduce((a,b)=>a+b,0)
  const sumX  = Xt.reduce((a,b)=>a+b,0)
  const sumT2 = t.reduce((a,b)=>a+b*b,0)
  const sumTX = t.reduce((acc,ti,i)=>acc+ti*Xt[i],0)
  const b = (n*sumTX - sumT*sumX) / (n*sumT2 - sumT**2)
  const a = (sumX - b*sumT) / n
  const Ft = t.map(ti => a+b*ti)
  const errors: ForecastError[] = Xt.map((actual,i) => ({
    t:i+1, actual, forecast:Ft[i], error:actual-Ft[i],
    absError:Math.abs(actual-Ft[i]), sqError:(actual-Ft[i])**2,
    pctError:Math.abs((actual-Ft[i])/actual)*100
  }))
  const MAE  = errors.reduce((acc,e)=>acc+e.absError,0)/n
  const MSE  = errors.reduce((acc,e)=>acc+e.sqError,0)/n
  const MAPE = errors.reduce((acc,e)=>acc+e.pctError,0)/n
  const futureForecasts = Array.from({length:12},(_,m)=>Math.max(0,a+b*(n+m+1)))
  return { method:'Linear Regression', Ft, errors, MAE, MSE, MAPE, futureForecasts, a, b }
}

export function compareForecasts(data: DemandPoint[], desAlpha = 0.3) {
  const dma = calcDMA(data)
  const des = calcDES(data, desAlpha)
  const lr  = calcLinearRegression(data)
  const best = [dma,des,lr].reduce((a,b) => a.MAPE < b.MAPE ? a : b)
  return { dma, des, lr, best }
}
