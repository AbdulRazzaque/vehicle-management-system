'use client'

import { Wrench, Hammer, Boxes, Truck, User, FileText, Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useData } from '@/components/data-provider'
import { cn } from '@/lib/utils'

const iconMap = {
  Maintenance: Wrench,
  Repair: Hammer,
  Inventory: Boxes,
  Vehicle: Truck,
  User: User,
  Document: FileText,
  General: Activity,
} as const

export function ActivityFeed() {
  const { auditLogs } = useData()

  // Display the latest 6 audit logs
  const displayLogs = auditLogs.slice(0, 6)

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">
            Latest events across the fleet (Live)
          </p>
        </div>
      </div>
      {displayLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No recent activities found.</p>
      ) : (
        <ol className="relative space-y-4">
          {displayLogs.map((log) => {
            // Dynamically determine icon based on action text / type
            let category: keyof typeof iconMap = 'General'
            const textLower = log.action.toLowerCase()
            
            if (textLower.includes('maintenance') || textLower.includes('mnt')) {
              category = 'Maintenance'
            } else if (textLower.includes('repair') || textLower.includes('rpr')) {
              category = 'Repair'
            } else if (textLower.includes('inventory') || textLower.includes('inv')) {
              category = 'Inventory'
            } else if (textLower.includes('vehicle') || textLower.includes('vh')) {
              category = 'Vehicle'
            } else if (textLower.includes('user') || textLower.includes('usr')) {
              category = 'User'
            } else if (textLower.includes('document') || textLower.includes('doc')) {
              category = 'Document'
            }

            const Icon = iconMap[category]

            // Style tones
            const toneStyles = {
              Maintenance: 'bg-warning/10 text-warning',
              Repair: 'bg-destructive/10 text-destructive',
              Inventory: 'bg-primary/10 text-primary',
              Vehicle: 'bg-chart-5/10 text-chart-5',
              User: 'bg-success/10 text-success',
              Document: 'bg-chart-2/10 text-chart-2',
              General: 'bg-muted/10 text-muted-foreground',
            }[category]

            return (
              <li key={log.id || log.timestamp} className="flex gap-3">
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    toneStyles,
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{log.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.user} ({log.role}) · {log.timestamp}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}
