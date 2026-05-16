'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ForecastChartProps {
  labels: string[]
  actual: number[]
  dma: (number | null)[]
  des: (number | null)[]
  lr: number[]
}

export default function ForecastChart({ labels, actual, dma, des, lr }: ForecastChartProps) {
  const data = labels.map((label, i) => ({
    label,
    Aktual: actual[i],
    DMA: dma[i] !== null ? +(dma[i]!).toFixed(2) : undefined,
    DES: des[i] !== null ? +(des[i]!).toFixed(2) : undefined,
    'Reg. Linear': +lr[i].toFixed(2),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D9CFC0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 12, borderColor: '#D9CFC0' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Aktual"      stroke="#2D1F0E" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="DMA"         stroke="#854F0B" strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls />
        <Line type="monotone" dataKey="DES"         stroke="#B8732E" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
        <Line type="monotone" dataKey="Reg. Linear" stroke="#D4A96A" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
