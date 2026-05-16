'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

interface CapacityRow {
  week: number
  [key: string]: number | string | undefined
}

interface CapacityChartProps {
  data: CapacityRow[]
  availableKey?: string
  neededKey?: string
  availableLabel?: string
}

export default function CapacityChart({
  data,
  availableKey = 'availableCapacity',
  neededKey = 'actualNeed',
  availableLabel = 'Kapasitas Tersedia',
}: CapacityChartProps) {
  const available = data[0]?.[availableKey] ?? data[0]?.resourceAvailable ?? 0

  const chartData = data.map(row => ({
    week: `W${row.week}`,
    Dibutuhkan: +(row[neededKey] ?? row.resourceNeeded ?? 0),
    status: row.status ?? (((row[neededKey] ?? 0) > available) ? 'OVERLOAD' : 'OK'),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D9CFC0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderColor: '#D9CFC0' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine y={available} stroke="#854F0B" strokeDasharray="6 3" label={{ value: availableLabel, position: 'insideTopRight', fontSize: 11, fill: '#854F0B' }} />
        <Bar dataKey="Dibutuhkan" radius={[3, 3, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.status === 'OVERLOAD' ? '#C9401A' : '#854F0B'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
