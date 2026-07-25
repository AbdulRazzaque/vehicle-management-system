'use client'

import { useState } from 'react'
import { Wrench, Clock, CircleCheck, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { AdminAction } from '@/components/admin-action'
import { MaintenanceTable } from '@/components/maintenance/maintenance-table'
import { MaintenanceFormDialog } from '@/components/forms/entity-forms'
import { useData } from '@/components/data-provider'
import { currency, sumItems } from '@/lib/data'

export default function MaintenancePage() {
  const { maintenance } = useData()
  const [formOpen, setFormOpen] = useState(false)

  const inProgress = maintenance.filter((m) => m.status === 'In Progress').length
  const scheduled = maintenance.filter((m) => m.status === 'Scheduled').length
  const totalCost = maintenance.reduce((a, m) => a + sumItems(m.items), 0)

  return (
    <div>
      <PageHeader
        title="Maintenance Management"
        description="Schedule, track, and cost service records with itemized parts."
      >
        <AdminAction
          permission="manage:maintenance"
          label="New Maintenance"
          onAction={() => setFormOpen(true)}
        />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Records" value={maintenance.length} icon={Wrench} tone="primary" />
        <StatCard label="In Progress" value={inProgress} icon={Clock} tone="warning" />
        <StatCard label="Scheduled" value={scheduled} icon={CircleCheck} tone="success" />
        <StatCard label="Total Cost" value={currency(totalCost)} icon={Wallet} tone="primary" />
      </div>

      <MaintenanceTable />
      <MaintenanceFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
