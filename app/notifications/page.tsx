'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Bell, CalendarClock, PackageMinus, ShieldAlert, Check, Wrench, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { useData } from '@/components/data-provider'
import { getLiveNotifications } from '@/lib/notifications-utils'
import type { Notification, Vehicle } from '@/lib/data'
import { VehicleFormDialog } from '@/components/vehicles/vehicle-form'

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
  const { vehicles, inventory, repairs, maintenance, refreshAllData } = useData()
  const liveAlerts = getLiveNotifications(vehicles, inventory, repairs, maintenance)

  const [readIds, setReadIds] = useState<string[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const allItems = liveAlerts.map((alert) => ({
    ...alert,
    read: readIds.includes(alert.id),
  }))

  const items = allItems.filter((n) => !dismissedIds.includes(n.id))
  const unread = items.filter((n) => !n.read).length

  const markAll = () => {
    const allIds = items.map((n) => n.id)
    setReadIds((prev) => Array.from(new Set([...prev, ...allIds])))
    toast.success('All notifications marked as read')
  }

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id])
    toast.success('Notification dismissed')
  }

  const handleFormChange = (open: boolean) => {
    if (!open) {
      if (editingVehicle) {
        const vehicleNotifs = items.filter(
          (n) => n.vehicleId === editingVehicle.id && n.category === 'Registration Expiry'
        )
        if (vehicleNotifs.length > 0) {
          const idsToDismiss = vehicleNotifs.map((n) => n.id)
          setDismissedIds((prev) => Array.from(new Set([...prev, ...idsToDismiss])))
        }
      }
      setEditingVehicle(null)
      refreshAllData()
    }
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
            const targetVehicle = n.vehicleId
              ? vehicles.find((v) => v.id === n.vehicleId)
              : vehicles.find(
                  (v) =>
                    (n.detail && v.name && n.detail.toLowerCase().includes(v.name.toLowerCase())) ||
                    (v.plateNumber && n.detail.includes(v.plateNumber))
                )

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
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                    <div className="flex items-center gap-1">
                      {targetVehicle && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary hover:bg-accent"
                          title="Edit Vehicle"
                          onClick={() => setEditingVehicle(targetVehicle)}
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit Vehicle</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Dismiss Notification"
                        onClick={() => handleDismiss(n.id)}
                      >
                        <X className="size-4" />
                        <span className="sr-only">Dismiss Notification</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <VehicleFormDialog
        open={!!editingVehicle}
        onOpenChange={handleFormChange}
        initialData={editingVehicle}
      />
    </div>
  )
}
