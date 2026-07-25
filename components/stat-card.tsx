import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatTone = 'primary' | 'success' | 'warning' | 'destructive'

const toneMap: Record<StatTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  delta,
  hint,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: StatTone
  delta?: number
  hint?: string
}) {
  const positive = (delta ?? 0) >= 0
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-lg',
            toneMap[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      {(delta !== undefined || hint) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                'flex items-center gap-0.5 font-medium',
                positive ? 'text-success' : 'text-destructive',
              )}
            >
              {positive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  )
}
