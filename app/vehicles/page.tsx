'use client'

import { useState } from 'react'
import { Truck, CircleCheck, Wrench, Hammer } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { AdminAction } from '@/components/admin-action'
import { VehicleTable } from '@/components/vehicles/vehicle-table'
import { VehicleFormDialog } from '@/components/vehicles/vehicle-form'
import { useData } from '@/components/data-provider'
import { getFleetStats } from '@/lib/data'

export default function VehiclesPage() {
  const { vehicles, maintenance, repairs } = useData()
  const [formOpen, setFormOpen] = useState(false)

  const { total, active, inMaintenance, inRepair } = getFleetStats(vehicles, maintenance, repairs)

  return (
    <div>
      <PageHeader
        title="Vehicle Management"
        description="Manage your entire fleet, registration, drivers, and assignments."
      >
        <AdminAction
          permission="manage:vehicles"
          label="Add Vehicle"
          onAction={() => setFormOpen(true)}
        />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Vehicles" value={total} icon={Truck} tone="primary" />
        <StatCard label="Active" value={active} icon={CircleCheck} tone="success" />
        <StatCard label="Maintenance" value={inMaintenance} icon={Wrench} tone="warning" />
        <StatCard label="Repair" value={inRepair} icon={Hammer} tone="destructive" />
      </div>

      <VehicleTable />
      <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
