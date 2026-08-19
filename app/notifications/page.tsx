'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Bell, CalendarClock, PackageMinus, ShieldAlert, Check, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { useData } from '@/components/data-provider'
import { getLiveNotifications } from '@/lib/notifications-utils'
import type { Notification } from '@/lib/data'

const iconFor: Record<Notification['category'], typeof Bell> = {
  'Maintenance Due': Wrench,
  'Registration Expiry': CalendarClock,
  'Insurance Expiry': ShieldAlert,
  'Low Inventory': PackageMinus,
  'Critical Repair': AlertTriangle,
}

const severityStyles: Record<Notification['severity'], string> = {
  info: 'bg-chart-3/15 text-chart-3',
  warning: 'bg-chart-4/15 text-chart-4',
  critical: 'bg-destructive/15 text-destructive',
}

export default function NotificationsPage() {
  const { vehicles, inventory, repairs, maintenance } = useData()
  const liveAlerts = getLiveNotifications(vehicles, inventory, repairs, maintenance)

  const [readIds, setReadIds] = useState<string[]>([])

  const items = liveAlerts.map((alert) => ({
    ...alert,
    read: readIds.includes(alert.id),
  }))

  const unread = items.filter((n) => !n.read).length

  const markAll = () => {
    const allIds = items.map((n) => n.id)
    setReadIds(allIds)
    toast.success('All notifications marked as read')
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Automated alerts for maintenance, expiries, inventory and critical repairs."
        actions={
          <Button variant="outline" size="sm" onClick={markAll} disabled={unread === 0}>
            <Check className="size-4" />
            Mark all read
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Bell className="size-4" />
        <span>
          {unread} unread of {items.length} total alerts
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              All fleet systems operational. No active notifications.
            </CardContent>
          </Card>
        ) : (
          items.map((n) => {
            const Icon = iconFor[n.category]

            return (
              <Card
                key={n.id}
                className={cn('transition-colors', !n.read && 'border-l-4 border-l-primary bg-accent/30')}
              >
                <CardContent className="flex items-start gap-4 py-4">
                  <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', severityStyles[n.severity])}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      <Badge variant="outline" className="text-xs font-normal">
                        {n.category}
                      </Badge>
                      {!n.read && <span className="size-2 rounded-full bg-primary" aria-label="Unread" />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
