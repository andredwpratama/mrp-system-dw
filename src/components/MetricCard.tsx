import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
  className?: string
}

export default function MetricCard({ label, value, sub, highlight, className }: MetricCardProps) {
  return (
    <Card className={cn(highlight && 'border-primary', className)}>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={cn('text-xl font-semibold', highlight && 'text-primary')}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}
