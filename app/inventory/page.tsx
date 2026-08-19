'use client'

import { useState } from 'react'
import { Boxes, TriangleAlert, Wallet, Truck } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { AdminAction } from '@/components/admin-action'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { InventoryFormDialog } from '@/components/inventory/inventory-form'
import { useData } from '@/components/data-provider'
import { currency } from '@/lib/data'

export default function InventoryPage() {
  const { inventory } = useData()
  const [formOpen, setFormOpen] = useState(false)

  const lowStock = inventory.filter((i) => i.stock < i.minStock).length
  const stockValue = inventory.reduce(
    (a, i) => a + i.stock * i.purchasePrice,
    0,
  )
  const suppliers = new Set(inventory.map((i) => i.supplier)).size

  return (
    <div>
      <PageHeader
        title="Spare Parts & Inventory"
        description="Track stock levels, suppliers, stock movements, and low-stock alerts."
      >
        <AdminAction
          permission="manage:inventory"
          label="Add Item"
          onAction={() => setFormOpen(true)}
        />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Items" value={inventory.length} icon={Boxes} tone="primary" />
        <StatCard label="Low Stock" value={lowStock} icon={TriangleAlert} tone="warning" />
        <StatCard label="Stock Value" value={currency(stockValue)} icon={Wallet} tone="success" />
        <StatCard label="Suppliers" value={suppliers} icon={Truck} tone="primary" />
      </div>

      <InventoryTable />
      <InventoryFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
