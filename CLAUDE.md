# CLAUDE.md — GarlicFlow: MRP II Interactive Website
## Instruksi untuk Claude Code — Stack: Next.js + Prisma + Supabase + Shadcn

> **BACA SELURUH DOKUMEN INI SEBELUM MENULIS SATU BARIS KOD PUN.**
> Dokumen ini adalah sumber kebenaran tunggal. Jangan improvisasi stack, jangan install library baru tanpa alasan jelas, jangan ubah angka-angka data penelitian.

---

## 0. Kondisi Project Saat Ini

Project sudah di-setup dengan struktur berikut (JANGAN setup ulang):
```
MRP-SYSTEM-DW/
├── .next/
├── node_modules/
├── prisma/          ← sudah ada, schema BELUM dibuat
├── public/
├── src/
├── .env             ← sudah ada, perlu diisi
├── .env.example
├── AGENTS.md
├── CLAUDE.md        ← file ini
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
├── tsconfig.json
```

**Yang sudah terinstall:** Next.js, Prisma, Supabase client, Shadcn UI (ada components/ui/), Tailwind CSS.

**Yang belum dikerjakan:**
1. Prisma schema belum dibuat
2. Supabase belum terhubung (.env belum diisi)
3. Belum ada halaman/komponen apapun
4. Belum ada kalkulasi engine

---

## 1. Tech Stack — Final, Tidak Boleh Diubah

```
Framework    : Next.js 14+ (App Router)
Language     : TypeScript
Styling      : Tailwind CSS + Shadcn UI
Database     : Supabase (PostgreSQL)
ORM          : Prisma
Auth         : Supabase Auth
State        : Zustand (untuk state demo antar modul)
Charts       : Recharts
Icons        : Lucide React
Deploy       : Vercel
```

Install dependencies yang mungkin belum ada:
```bash
npm install zustand recharts
npm install @supabase/ssr
```

---

## 2. Environment Variables (.env)

Isi .env dengan nilai dari dashboard Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

DATABASE_URL="postgresql://postgres.YOUR_PROJECT:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOUR_PROJECT:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

## 3. Prisma Schema (prisma/schema.prisma)

Buat schema ini persis:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  forecastResult  ForecastResult?
  aggregateResult AggregateResult?
  mrpResult       MrpResult?
  mpsResult       MpsResult?
  rccpResult      RccpResult?
  crpResult       CrpResult?
  pacEntries      PacEntry[]

  @@index([userId])
}

model DemandData {
  id        String   @id @default(cuid())
  sessionId String
  period    Int
  label     String
  value     Float
  createdAt DateTime @default(now())

  @@unique([sessionId, period])
  @@index([sessionId])
}

model ForecastResult {
  id              String   @id @default(cuid())
  sessionId       String   @unique
  session         Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  bestMethod      String
  maeValue        Float
  mseValue        Float
  mapeValue       Float
  futureForecasts Json
  params          Json
  createdAt       DateTime @default(now())
}

model AggregateResult {
  id             String   @id @default(cuid())
  sessionId      String   @unique
  session        Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  chosenStrategy String
  weeklyPlan     Json
  totalCost      Float
  createdAt      DateTime @default(now())
}

model MpsResult {
  id        String   @id @default(cuid())
  sessionId String   @unique
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  rows      Json
  createdAt DateTime @default(now())
}

model RccpResult {
  id             String   @id @default(cuid())
  sessionId      String   @unique
  session        Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  rows           Json
  avgUtilization Float
  createdAt      DateTime @default(now())
}

model MrpResult {
  id           String   @id @default(cuid())
  sessionId    String   @unique
  session      Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  bestMethod   String
  lflRows      Json
  eoqRows      Json
  poqRows      Json
  fprRows      Json
  lflTotalCost Float
  eoqTotalCost Float
  poqTotalCost Float
  fprTotalCost Float
  createdAt    DateTime @default(now())
}

model CrpResult {
  id          String   @id @default(cuid())
  sessionId   String   @unique
  session     Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  fermentation Json
  packaging    Json
  createdAt   DateTime @default(now())
}

model PacEntry {
  id              String   @id @default(cuid())
  sessionId       String
  session         Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  batchCode       String
  batchDate       DateTime
  inputGrams      Float
  outputGrams     Float
  estimatedOutput Float
  conversionRate  Float
  status          String
  notes           String?
  createdAt       DateTime @default(now())

  @@index([sessionId])
}
```

Setelah schema dibuat:
```bash
npx prisma generate
npx prisma db push
```

---

## 4. Struktur Folder src/ — Buat Persis Ini

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  ← Landing
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── story/page.tsx
│   ├── methodology/page.tsx
│   ├── results/page.tsx
│   ├── dashboard/page.tsx        ← list sesi user (protected)
│   ├── api/
│   │   └── sessions/
│   │       ├── route.ts          ← GET list, POST create
│   │       └── [id]/
│   │           ├── route.ts      ← GET, DELETE
│   │           └── save/route.ts ← POST simpan modul
│   └── demo/
│       ├── layout.tsx            ← sidebar stepper
│       ├── page.tsx              ← redirect ke forecast
│       ├── forecast/page.tsx
│       ├── aggregate/page.tsx
│       ├── rrp/page.tsx
│       ├── mps/page.tsx
│       ├── rccp/page.tsx
│       ├── mrp/page.tsx
│       ├── crp/page.tsx
│       └── pac/page.tsx
├── components/
│   ├── ui/                       ← Shadcn (SUDAH ADA, jangan hapus)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── StepProgress.tsx
│   ├── DataTable.tsx
│   ├── MetricCard.tsx
│   ├── SaveSessionModal.tsx
│   └── charts/
│       ├── ForecastChart.tsx
│       ├── CapacityChart.tsx
│       └── CostCompareChart.tsx
├── lib/
│   ├── prisma.ts
│   ├── supabase.ts               ← browser client
│   ├── supabase-server.ts        ← server client
│   ├── calculations/
│   │   ├── forecast.ts
│   │   ├── aggregate.ts
│   │   ├── rrp.ts
│   │   ├── mps.ts
│   │   ├── rccp.ts
│   │   ├── mrp.ts
│   │   ├── crp.ts
│   │   └── pac.ts
│   └── data/
│       └── defaults.ts
├── store/
│   └── demoStore.ts
└── types/
    └── mrp.ts
```

---

## 5. Utility Files

### src/lib/prisma.ts
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### src/lib/supabase.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### src/lib/supabase-server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
```

---

## 6. TypeScript Types (src/types/mrp.ts)

```typescript
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
```

---

## 7. Data Default dari Skripsi (src/lib/data/defaults.ts)

JANGAN UBAH ANGKA-ANGKA INI. Semua berasal dari skripsi dan Excel penelitian.

```typescript
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
```

---

## 8. Kalkulasi Engine (src/lib/calculations/)

Semua file ini pure TypeScript — tidak ada React, tidak ada Prisma.

### forecast.ts

```typescript
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
```

### mrp.ts — PALING PENTING

```typescript
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
```

### aggregate.ts
```typescript
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
```

### rrp.ts
```typescript
export function calcRRP(weeklyProduction: number[], p: { processTime:number; availableHours:number }) {
  return weeklyProduction.map((production,i) => {
    const needed  = +(production*p.processTime).toFixed(2)
    const surplus = +(p.availableHours-needed).toFixed(2)
    return { week:i+1, demand:production, production, avgProcessTime:p.processTime,
      resourceNeeded:needed, resourceAvailable:p.availableHours, surplus,
      status: surplus>=0 ? 'Cukup' : 'Kurang' }
  })
}
```

### mps.ts
```typescript
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
```

### rccp.ts
```typescript
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
```

### crp.ts
```typescript
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
```

### pac.ts
```typescript
import type { PACBatch } from '@/types/mrp'

export function analyzeBatches(batches: Omit<PACBatch,'conversionRate'|'status'>[]) {
  return batches.map(b => {
    const cr = b.inputGrams>0 ? +(b.outputGrams/b.inputGrams).toFixed(3) : 0
    return { ...b, conversionRate:cr, conversionPct:+(cr*100).toFixed(1),
      status: cr>=0.72 ? 'ON TRACK' : 'BELOW TARGET' as PACBatch['status'] }
  })
}

export function calcPACSummary(batches: PACBatch[]) {
  const avg = batches.reduce((a,b)=>a+b.conversionRate,0)/batches.length
  return { avgConversionRate:+avg.toFixed(3), avgConversionPct:+(avg*100).toFixed(1),
    onTrack:batches.filter(b=>b.status==='ON TRACK').length,
    belowTarget:batches.filter(b=>b.status==='BELOW TARGET').length, targetRate:0.76 }
}
```

---

## 9. Zustand Store (src/store/demoStore.ts)

```typescript
import { create } from 'zustand'
import type { ForecastOutput, MRPComparisonResult, RCCPRow, CRPRow, PACBatch } from '@/types/mrp'
import { DEFAULT_DEMAND, DEFAULT_PARAMS, DEFAULT_MPS_WEEKLY } from '@/lib/data/defaults'

interface DemoState {
  sessionId: string | null
  sessionName: string | null
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
  resetDemo: () => void
}

export const useDemoStore = create<DemoState>((set, get) => ({
  sessionId: null, sessionName: null,
  demandData: DEFAULT_DEMAND, params: DEFAULT_PARAMS,
  forecastResult: null, aggregateResult: null, rrpResult: null,
  mpsResult: null, rccpResult: null, mrpResult: null, crpResult: null,
  pacBatches: [], completedSteps: [], currentStep: 0,

  setSessionId: (id,name) => set({ sessionId:id, sessionName:name }),
  setForecastResult: (r) => set(s=>({ forecastResult:r, completedSteps:[...new Set([...s.completedSteps,0])] })),
  setAggregateResult: (r) => set(s=>({ aggregateResult:r, completedSteps:[...new Set([...s.completedSteps,1])] })),
  setRRPResult: (r) => set(s=>({ rrpResult:r, completedSteps:[...new Set([...s.completedSteps,2])] })),
  setMPSResult: (r) => set(s=>({ mpsResult:r, completedSteps:[...new Set([...s.completedSteps,3])] })),
  setRCCPResult: (r) => set(s=>({ rccpResult:r, completedSteps:[...new Set([...s.completedSteps,4])] })),
  setMRPResult: (r) => set(s=>({ mrpResult:r, completedSteps:[...new Set([...s.completedSteps,5])] })),
  setCRPResult: (r) => set(s=>({ crpResult:r, completedSteps:[...new Set([...s.completedSteps,6])] })),
  setPACBatches: (b) => set(s=>({ pacBatches:b, completedSteps:[...new Set([...s.completedSteps,7])] })),
  setCurrentStep: (step) => set({ currentStep:step }),
  setParam: (key,value) => set(s=>({ params:{...s.params,[key]:value} })),

  getWeeklyDemand: () => {
    const s = get()
    if (s.forecastResult?.futureForecasts) {
      const weekly: number[] = []
      s.forecastResult.futureForecasts.forEach(m => {
        const pw = Math.ceil(m/4)
        for (let w=0; w<4; w++) weekly.push(pw)
      })
      return weekly
    }
    return DEFAULT_MPS_WEEKLY
  },

  resetDemo: () => set({ sessionId:null, sessionName:null, forecastResult:null,
    aggregateResult:null, rrpResult:null, mpsResult:null, rccpResult:null,
    mrpResult:null, crpResult:null, pacBatches:[], completedSteps:[], currentStep:0 }),
}))
```

---

## 10. Formatting Helpers — Gunakan di Semua Komponen

```typescript
// src/lib/format.ts
export const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(v)

export const formatPct = (v: number, d = 1) => `${v.toFixed(d)}%`

export const fmt2 = (v: number) => v.toFixed(2)

// JANGAN PERNAH tampilkan 359.09999999999997 atau angka float artifact ke user
```

---

## 11. API Routes Pattern

Setiap route di src/app/api/:
1. Ambil user dari Supabase: `const { data: { user } } = await supabase.auth.getUser()`
2. Jika tidak ada: `return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`
3. Validasi kepemilikan resource sebelum query
4. Gunakan Prisma untuk DB operations
5. Return `NextResponse.json(result)`

Routes yang perlu dibuat:
- `GET /api/sessions` — list sesi milik user
- `POST /api/sessions` — buat sesi baru `{ name: string }`
- `GET /api/sessions/[id]` — detail sesi + semua hasil
- `DELETE /api/sessions/[id]` — hapus sesi
- `POST /api/sessions/[id]/save` — simpan hasil modul `{ module: string, data: object }`

---

## 12. Urutan Implementasi

Kerjakan berurutan, laporkan setiap langkah sebelum lanjut:

```
[ ] 1.  npm install zustand recharts @supabase/ssr
[ ] 2.  Minta user isi .env (Supabase credentials)
[ ] 3.  Buat prisma/schema.prisma (Section 3)
[ ] 4.  npx prisma generate && npx prisma db push
[ ] 5.  Buat src/lib/prisma.ts, supabase.ts, supabase-server.ts
[ ] 6.  Buat src/types/mrp.ts
[ ] 7.  Buat src/lib/data/defaults.ts
[ ] 8.  Buat src/lib/format.ts
[ ] 9.  Buat semua src/lib/calculations/*.ts
[ ] 10. Verifikasi kalkulasi: jalankan test inline untuk angka di Section 13
[ ] 11. Buat src/store/demoStore.ts
[ ] 12. Buat src/app/layout.tsx + Navbar.tsx
[ ] 13. Buat halaman auth: login, register
[ ] 14. Buat API routes
[ ] 15. Buat src/app/dashboard/page.tsx
[ ] 16. Buat src/app/demo/layout.tsx (sidebar stepper)
[ ] 17. Buat semua demo pages (forecast → mrp adalah prioritas)
[ ] 18. Buat Landing, Story, Methodology, Results pages
[ ] 19. Integrasi SaveSessionModal
[ ] 20. Test end-to-end
```

---

## 13. Verifikasi Angka Wajib Sebelum Lanjut ke UI

| Test | Input | Expected |
|------|-------|----------|
| RRP week 1 | production=27, processTime=0.2, available=7 | resourceNeeded=5.4, surplus=1.6 |
| RCCP kapasitas | 420 × 0.9 × 0.95 | 359.1 |
| MRP LFL numOrders | DEFAULT_MPS_WEEKLY, leadTime=2 | 12 order → orderingCost=240.000 ✓ |
| MRP FPR numOrders | DEFAULT_MPS_WEEKLY, fixedPeriod=4 | 3 order → orderingCost=60.000 ✓ |
| PAC batch 1 | input=5170, output=3836 | conversionRate=0.742 |

> **Catatan holding cost:** Ordering cost lebih kritikal — jika numOrders sudah tepat,
> implementasi dianggap valid. Holding cost sensitif terhadap logika PAB_II dan boleh
> sedikit berbeda dari benchmark Excel skripsi.

---

## 14. Yang Tidak Boleh Dilakukan

- Jangan setup ulang project (sudah ada)
- Jangan ubah angka di defaults.ts tanpa konfirmasi eksplisit
- Jangan install library baru tanpa alasan jelas
- Jangan tampilkan float artifact ke user (selalu format dulu)
- Jangan skip verifikasi angka di Section 13
- Jangan buat API route tanpa validasi auth
- Jangan hardcode angka di dalam JSX/TSX — semua dari defaults.ts

---

*Berdasarkan skripsi Andre Dwi Pratama (240310210050), UNPAD 2025.*
*Stack: Next.js + Prisma + Supabase + Shadcn — disesuaikan dengan project MRP-SYSTEM-DW yang sudah ada.*