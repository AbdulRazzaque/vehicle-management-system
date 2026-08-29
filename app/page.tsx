'use client'

import {
  Truck,
  CircleCheck,
  Wrench,
  Hammer,
  Boxes,
  TriangleAlert,
  CalendarDays,
  Wallet,
  Download,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import {
  MaintenanceRepairChart,
  ExpenseTrendChart,
  DepartmentChart,
  TopPartsChart,
  InventoryTrendChart,
} from '@/components/dashboard/charts'
import { useData } from '@/components/data-provider'
import { currency, getFleetStats } from '@/lib/data'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { vehicles, maintenance, repairs, inventory, expenses } = useData()

  const { total, active, inMaintenance, inRepair } = getFleetStats(vehicles, maintenance, repairs)
  const lowStock = inventory.filter((i) => i.stock < i.minStock).length
  const monthly = expenses.reduce((a, e) => a + (e.amount || 0), 0)

  return (
    <div>
      <PageHeader
        title="Fleet Dashboard"
        description="Real-time overview of vehicles, maintenance, inventory, and spend."
      >
        <Button variant="outline" size="sm">
          <CalendarDays className="size-4" /> Last 30 days
        </Button>
        <Button size="sm" onClick={() => toast.success('Exporting summary dashboard report...')}>
          <Download className="size-4" /> Export
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Vehicles" value={total} icon={Truck} tone="primary" hint="in system" />
        <StatCard label="Active" value={active} icon={CircleCheck} tone="success" hint="on the road" />
        <StatCard label="Under Maintenance" value={inMaintenance} icon={Wrench} tone="warning" hint="in workshop" />
        <StatCard label="Under Repair" value={inRepair} icon={Hammer} tone="destructive" hint="needs attention" />
        <StatCard label="Inventory Items" value={inventory.length} icon={Boxes} tone="primary" hint="SKUs tracked" />
        <StatCard label="Low Stock" value={lowStock} icon={TriangleAlert} tone="warning" hint="below minimum" />
        <StatCard label="Total Expenses" value={currency(monthly)} icon={Wallet} tone="primary" hint="vehicle & parts spend" />
        <StatCard label="Yearly Projection" value={currency(Math.round(monthly * 11.4))} icon={Wallet} tone="success" hint="projected YTD" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MaintenanceRepairChart />
        </div>
        <DepartmentChart />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <InventoryTrendChart />
        <TopPartsChart />
        <ExpenseTrendChart />
      </div>

      <div className="mt-4">
        <ActivityFeed />
      </div>
    </div>
  )
}
