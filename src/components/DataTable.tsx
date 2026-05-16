import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  header: string
  className?: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  className?: string
}

export default function DataTable<T extends Record<string, unknown>>({
  columns, data, className,
}: DataTableProps<T>) {
  return (
    <div className={cn('rounded-md border border-border overflow-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map(col => (
              <TableHead key={col.key as string} className={cn('text-xs font-medium whitespace-nowrap', col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} className="text-sm">
              {columns.map(col => (
                <TableCell key={col.key as string} className={cn('py-2', col.className)}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
