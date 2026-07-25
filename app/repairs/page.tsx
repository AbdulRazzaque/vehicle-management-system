'use client'

import { useState } from 'react'
import { Hammer, TriangleAlert, Clock, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { AdminAction } from '@/components/admin-action'
import { RepairTable } from '@/components/repairs/repair-table'
import { RepairFormDialog } from '@/components/forms/entity-forms'
import { useData } from '@/components/data-provider'
import { currency, sumItems } from '@/lib/data'

export default function RepairsPage() {
  const { repairs } = useData()
  const [formOpen, setFormOpen] = useState(false)

  const critical = repairs.filter((r) => r.priority === 'Critical').length
  const open = repairs.filter((r) => r.status !== 'Completed').length
  const totalCost = repairs.reduce((a, r) => a + sumItems(r.items), 0)

  return (
    <div>
      <PageHeader
        title="Repair Management"
        description="Track repairs, parts, priorities, and workshop assignments."
      >
        <AdminAction
          permission="manage:repairs"
          label="New Repair"
          onAction={() => setFormOpen(true)}
        />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Repairs" value={repairs.length} icon={Hammer} tone="primary" />
        <StatCard label="Critical" value={critical} icon={TriangleAlert} tone="destructive" />
        <StatCard label="Open" value={open} icon={Clock} tone="warning" />
        <StatCard label="Total Cost" value={currency(totalCost)} icon={Wallet} tone="primary" />
      </div>

      <RepairTable />
      <RepairFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
