import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const map: Record<string, string> = {
  // vehicle / generic
  Active: 'border-success/30 bg-success/10 text-success',
  Completed: 'border-success/30 bg-success/10 text-success',
  Maintenance: 'border-warning/30 bg-warning/10 text-warning',
  'In Progress': 'border-primary/30 bg-primary/10 text-primary',
  Scheduled: 'border-chart-5/30 bg-chart-5/10 text-chart-5',
  Open: 'border-warning/30 bg-warning/10 text-warning',
  Repair: 'border-destructive/30 bg-destructive/10 text-destructive',
  Inactive: 'border-border bg-muted text-muted-foreground',
  Suspended: 'border-destructive/30 bg-destructive/10 text-destructive',
  // priority
  Low: 'border-border bg-muted text-muted-foreground',
  Medium: 'border-chart-5/30 bg-chart-5/10 text-chart-5',
  High: 'border-warning/30 bg-warning/10 text-warning',
  Critical: 'border-destructive/30 bg-destructive/10 text-destructive',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium', map[status] ?? 'bg-muted')}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </Badge>
  )
}
