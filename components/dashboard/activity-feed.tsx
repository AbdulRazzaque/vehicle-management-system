import { Wrench, Hammer, Boxes, Truck, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { activities, type Activity } from '@/lib/data'
import { cn } from '@/lib/utils'

const iconMap = {
  Maintenance: Wrench,
  Repair: Hammer,
  Inventory: Boxes,
  Vehicle: Truck,
  User: User,
} as const

const toneMap: Record<Activity['type'], string> = {
  Maintenance: 'bg-warning/10 text-warning',
  Repair: 'bg-destructive/10 text-destructive',
  Inventory: 'bg-primary/10 text-primary',
  Vehicle: 'bg-chart-5/10 text-chart-5',
  User: 'bg-success/10 text-success',
}

export function ActivityFeed() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">
            Latest events across the fleet
          </p>
        </div>
      </div>
      <ol className="relative space-y-4">
        {activities.map((a) => {
          const Icon = iconMap[a.type]
          return (
            <li key={a.id} className="flex gap-3">
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  toneMap[a.type],
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{a.text}</p>
                <p className="text-xs text-muted-foreground">
                  {a.user} · {a.time}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
