export const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

export const formatPct = (v: number, d = 1) => `${v.toFixed(d)}%`

export const fmt2 = (v: number) => v.toFixed(2)
