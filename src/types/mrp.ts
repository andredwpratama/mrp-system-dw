export interface DemandPoint {
  period: number
  label: string
  value: number
}

export interface SystemParams {
  orderCost: number
  holdingCostPerUnit: number
  processTime: number
  availableHours: number
  machineUtilization: number
  machineEfficiency: number
  conversionRate: number
  fermentationDays: number
  onHandInventory: number
  safetyStock: number
  leadTime: number
}

export interface ForecastError {
  t: number
  actual: number
  forecast: number
  error: number
  absError: number
  sqError: number
  pctError: number
}

export interface ForecastOutput {
  method: 'DMA' | 'DES' | 'Linear Regression'
  Ft: (number | null)[]
  errors: ForecastError[]
  MAE: number
  MSE: number
  MAPE: number
  futureForecasts: number[]
  alpha?: number
  a?: number
  b?: number
}

export interface MRPRow {
  period: number
  grossRequirements: number
  scheduledReceipts: number
  PAB_I: number
  netRequirements: number
  plannedOrderReceipt: number
  PAB_II: number
  plannedOrderRelease: number
}

export interface MRPMethodResult {
  method: 'LFL' | 'EOQ' | 'POQ' | 'FPR'
  rows: MRPRow[]
  holdingCost: number
  orderingCost: number
  totalCost: number
  numOrders: number
  lotValue?: number
}

export interface MRPComparisonResult {
  lfl: MRPMethodResult
  eoq: MRPMethodResult
  poq: MRPMethodResult
  fpr: MRPMethodResult
  best: MRPMethodResult
  bestMethod: string
}

export interface RCCPRow {
  week: number
  production: number
  availableTime: number
  utilization: number
  efficiency: number
  availableCapacity: number
  actualNeed: number
  surplus: number
  utilizationRate: number
  status: 'OK' | 'OVERLOAD'
}

export interface CRPRow {
  week: number
  lotSize: number
  setupTimePerUnit: number
  runTimePerUnit: number
  opTimePerUnit: number
  totalOpTime: number
  availableCapacity: number
  surplus: number
  loadFactor: number
  status: 'OK' | 'OVERLOAD'
}

export interface PACBatch {
  batchCode: string
  batchDate: string
  inputGrams: number
  outputGrams: number
  estimatedOutput: number
  conversionRate: number
  status: 'ON TRACK' | 'BELOW TARGET'
  notes?: string
}
