import type { DemandPoint, SystemParams } from '@/types/mrp'

// Data permintaan historis — dari skripsi Tabel 3
export const DEFAULT_DEMAND: DemandPoint[] = [
  { period: 1,  label: 'Agt 24', value: 94 },
  { period: 2,  label: 'Sep 24', value: 77 },
  { period: 3,  label: 'Okt 24', value: 43 },
  { period: 4,  label: 'Nov 24', value: 53 },
  { period: 5,  label: 'Des 24', value: 65 },
  { period: 6,  label: 'Jan 25', value: 64 },
  { period: 7,  label: 'Feb 25', value: 72 },
  { period: 8,  label: 'Mar 25', value: 76 },
  { period: 9,  label: 'Apr 25', value: 71 },
  { period: 10, label: 'Mei 25', value: 74 },
  { period: 11, label: 'Jun 25', value: 63 },
  { period: 12, label: 'Jul 25', value: 51 },
]

// Parameter sistem — dari skripsi Tabel 4, 5, 6
export const DEFAULT_PARAMS: SystemParams = {
  orderCost: 20000,
  holdingCostPerUnit: 500,
  processTime: 0.2,
  availableHours: 7,
  machineUtilization: 0.90,
  machineEfficiency: 0.95,
  conversionRate: 0.76,
  fermentationDays: 12,
  onHandInventory: 10,
  safetyStock: 10,
  leadTime: 2,
}

// MPS mingguan — dari skripsi Tabel 21
export const DEFAULT_MPS_WEEKLY = [27,27,27,27,28,28,28,28,30,30,30,30]

// Hasil biaya MRP — dari Excel skripsi (angka pasti, JANGAN ubah)
export const MRP_COST_BENCHMARK = {
  LFL: { holdingCost: 84000,  orderingCost: 240000, totalCost: 324000 },
  EOQ: { holdingCost: 209000, orderingCost: 140000, totalCost: 349000 },
  POQ: { holdingCost: 229000, orderingCost: 120000, totalCost: 349000 },
  FPR: { holdingCost: 170000, orderingCost: 60000,  totalCost: 230000 },
} as const

// Hasil penelitian before vs after — dari skripsi BAB IV
export const RESEARCH_RESULTS = {
  before: {
    productivityPerHour: 4.53,
    capacityUtilization: 0.60,
    orderingCostPerYear: 480000,
    systemType: 'Manual (buku produksi)',
    forecastMethod: 'Asumsi +10%/bulan (tanpa statistik)',
    productionStrategy: 'Level Strategy (kontinu)',
  },
  after: {
    productivityPerHour: 7.55,
    capacityUtilizationMin: 0.29,
    capacityUtilizationMax: 0.35,
    orderingCostPerYear: 240000,
    systemType: 'Terintegrasi real-time (MRP II)',
    forecastMethod: 'Linear Regression (MAPE ~5.8%)',
    productionStrategy: 'Chase Strategy',
    annualSavings: 2165000,
    productivityIncreasePct: 66.8,
    costEfficiencyPct: 49.65,
  }
}

// BOM — dari skripsi Tabel 9
export const DEFAULT_BOM = {
  'Black Garlic':       { level: 0, unit: 'pcs', children: ['Kemasan Luar'] },
  'Kemasan Luar':       { level: 1, unit: 'pcs', quantity: 1, purchased: false,
                          children: ['Bawang Putih Tunggal','Aluminium Foil','Kemasan','Label','Silica Gel'] },
  'Bawang Putih Tunggal': { level: 2, unit: 'kg',  quantity: 0.1, purchased: true, onHand: 10, leadTime: 2, safetyStock: 10, price: 130000 },
  'Aluminium Foil':     { level: 2, unit: 'pcs', quantity: 1,   purchased: true, onHand: 20, leadTime: 1, safetyStock: 10, price: 875 },
  'Kemasan':            { level: 2, unit: 'pcs', quantity: 1,   purchased: true, onHand: 50, leadTime: 1, safetyStock: 20, price: 3000 },
  'Label':              { level: 2, unit: 'pcs', quantity: 1,   purchased: true, onHand: 50, leadTime: 1, safetyStock: 20, price: 1500 },
  'Silica Gel':         { level: 2, unit: 'pcs', quantity: 1,   purchased: true, onHand: 30, leadTime: 1, safetyStock: 10, price: 100 },
}

// HPP — dari skripsi Tabel 13
export const HPP = {
  materialPerMonth: 4065000,
  laborPerMonth: 5000000,
  overheadPerMonth: 555000,
  totalPerMonth: 9620000,
  perUnit: 48100,
}

// Data batch PAC contoh — dari skripsi Lampiran
export const DEFAULT_PAC_BATCHES = [
  { batchCode: 'B1', batchDate: '2025-08-02', inputGrams: 5170, outputGrams: 3836, estimatedOutput: 39 },
  { batchCode: 'B2', batchDate: '2025-08-08', inputGrams: 1604, outputGrams: 1354, estimatedOutput: 11 },
  { batchCode: 'B3', batchDate: '2025-08-14', inputGrams: 6481, outputGrams: 5058, estimatedOutput: 44 },
  { batchCode: 'B4', batchDate: '2025-08-17', inputGrams: 1645, outputGrams: 1315, estimatedOutput: 12 },
]
