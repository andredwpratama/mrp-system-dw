'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { formatRupiah } from '@/lib/format'

interface MethodCost {
  method: string
  holdingCost: number
  orderingCost: number
  totalCost: number
}

interface CostCompareChartProps {
  data: MethodCost[]
  bestMethod: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="bg-card border border-border rounded p-2 text-xs space-y-1">
      <p className="font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatRupiah(p.value)}</p>
      ))}
    </div>
  )
}

export default function CostCompareChart({ data, bestMethod }: CostCompareChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D9CFC0" />
        <XAxis dataKey="method" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="holdingCost" name="Holding Cost" stackId="a" fill="#D4A96A" radius={[0, 0, 0, 0]} />
        <Bar dataKey="orderingCost" name="Ordering Cost" stackId="a" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.method === bestMethod ? '#854F0B' : '#B8732E'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
