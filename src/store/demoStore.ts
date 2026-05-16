import { create } from 'zustand'
import type { ForecastOutput, MRPComparisonResult, RCCPRow, CRPRow, PACBatch } from '@/types/mrp'
import { DEFAULT_DEMAND, DEFAULT_PARAMS, DEFAULT_MPS_WEEKLY } from '@/lib/data/defaults'

interface DemoState {
  sessionId: string | null
  sessionName: string | null
  isCustomData: boolean
  demandData: typeof DEFAULT_DEMAND
  params: typeof DEFAULT_PARAMS
  forecastResult: ForecastOutput | null
  aggregateResult: any | null
  rrpResult: any | null
  mpsResult: any | null
  rccpResult: RCCPRow[] | null
  mrpResult: MRPComparisonResult | null
  crpResult: { fermentation: CRPRow[]; packaging: CRPRow[] } | null
  pacBatches: PACBatch[]
  completedSteps: number[]
  currentStep: number
  setSessionId: (id: string, name: string) => void
  setDemandData: (data: typeof DEFAULT_DEMAND) => void
  setAllParams: (p: typeof DEFAULT_PARAMS) => void
  setForecastResult: (r: ForecastOutput) => void
  setAggregateResult: (r: any) => void
  setRRPResult: (r: any) => void
  setMPSResult: (r: any) => void
  setRCCPResult: (r: RCCPRow[]) => void
  setMRPResult: (r: MRPComparisonResult) => void
  setCRPResult: (r: { fermentation: CRPRow[]; packaging: CRPRow[] }) => void
  setPACBatches: (b: PACBatch[]) => void
  setCurrentStep: (step: number) => void
  setParam: (key: keyof typeof DEFAULT_PARAMS, value: number) => void
  getWeeklyDemand: () => number[]
  getWeeklyProduction: () => number[]
  resetDemo: () => void
}

export const useDemoStore = create<DemoState>((set, get) => ({
  sessionId: null, sessionName: null,
  isCustomData: false,
  demandData: DEFAULT_DEMAND, params: DEFAULT_PARAMS,
  forecastResult: null, aggregateResult: null, rrpResult: null,
  mpsResult: null, rccpResult: null, mrpResult: null, crpResult: null,
  pacBatches: [], completedSteps: [], currentStep: 0,

  setSessionId: (id, name) => set({ sessionId: id, sessionName: name }),
  setDemandData: (data) => set({ demandData: data, isCustomData: true }),
  setAllParams: (p) => set({ params: p }),
  setForecastResult: (r) => set(s => ({ forecastResult: r, completedSteps: [...new Set([...s.completedSteps, 0])] })),
  setAggregateResult: (r) => set(s => ({ aggregateResult: r, completedSteps: [...new Set([...s.completedSteps, 1])] })),
  setRRPResult: (r) => set(s => ({ rrpResult: r, completedSteps: [...new Set([...s.completedSteps, 2])] })),
  setMPSResult: (r) => set(s => ({ mpsResult: r, completedSteps: [...new Set([...s.completedSteps, 3])] })),
  setRCCPResult: (r) => set(s => ({ rccpResult: r, completedSteps: [...new Set([...s.completedSteps, 4])] })),
  setMRPResult: (r) => set(s => ({ mrpResult: r, completedSteps: [...new Set([...s.completedSteps, 5])] })),
  setCRPResult: (r) => set(s => ({ crpResult: r, completedSteps: [...new Set([...s.completedSteps, 6])] })),
  setPACBatches: (b) => set(s => ({ pacBatches: b, completedSteps: [...new Set([...s.completedSteps, 7])] })),
  setCurrentStep: (step) => set({ currentStep: step }),
  setParam: (key, value) => set(s => ({ params: { ...s.params, [key]: value } })),

  getWeeklyDemand: () => {
    const s = get()
    if (s.forecastResult?.futureForecasts) {
      const weekly: number[] = []
      s.forecastResult.futureForecasts.forEach(m => {
        const pw = Math.ceil(m / 4)
        for (let w = 0; w < 4; w++) weekly.push(pw)
      })
      return weekly
    }
    return DEFAULT_MPS_WEEKLY
  },

  getWeeklyProduction: () => {
    const s = get()
    if (s.aggregateResult?.weeklyPlan?.length) {
      return s.aggregateResult.weeklyPlan.map((r: any) => r.production as number)
    }
    return DEFAULT_MPS_WEEKLY
  },

  resetDemo: () => set({
    sessionId: null, sessionName: null, isCustomData: false,
    demandData: DEFAULT_DEMAND, params: DEFAULT_PARAMS,
    forecastResult: null, aggregateResult: null, rrpResult: null, mpsResult: null,
    rccpResult: null, mrpResult: null, crpResult: null, pacBatches: [],
    completedSteps: [], currentStep: 0,
  }),
}))
