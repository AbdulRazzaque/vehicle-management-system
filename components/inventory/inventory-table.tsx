'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, PackagePlus, PackageMinus, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/components/auth-provider'
import { useData } from '@/components/data-provider'
import { InventoryFormDialog } from '@/components/inventory/inventory-form'
import { currency, type InventoryItem } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function InventoryTable() {
  const { can } = useAuth()
  const { inventory, updateInventoryItem, deleteInventoryItem } = useData()
  const categories = Array.from(new Set(inventory.map((i) => i.category)))

  const [editing, setEditing] = useState<InventoryItem | null>(null)
  const [deleting, setDeleting] = useState<InventoryItem | null>(null)
  const [stockItem, setStockItem] = useState<{ item: InventoryItem; mode: 'in' | 'out' } | null>(null)
  const [stockQty, setStockQty] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!deleting) return
    setIsSubmitting(true)
    await deleteInventoryItem(deleting.id)
    setIsSubmitting(false)
    setDeleting(null)
  }

  const handleStockUpdate = async () => {
    if (!stockItem) return
    const qty = Number(stockQty)
    if (!qty || qty <= 0) {
      toast.error('Enter a valid positive quantity')
      return
    }

    setIsSubmitting(true)
    const newStock =
      stockItem.mode === 'in'
        ? stockItem.item.stock + qty
        : Math.max(0, stockItem.item.stock - qty)

    const updated = await updateInventoryItem(stockItem.item.id, { stock: newStock })
    setIsSubmitting(false)
    if (updated) {
      toast.success(
        `Stock ${stockItem.mode === 'in' ? 'added' : 'deducted'}: ${qty} ${stockItem.item.unit}`
      )
      setStockItem(null)
      setStockQty('1')
    }
  }

  const columns: Column<InventoryItem>[] = [
    {
      key: 'item',
      header: 'Item',
      render: (i) => (
        <div className="leading-tight">
          <p className="font-medium">{i.name}</p>
          <p className="text-xs text-muted-foreground">{i.code} · {i.brand}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (i) => <Badge variant="secondary">{i.category}</Badge>,
    },
    { key: 'location', header: 'Location', render: (i) => i.location },
    {
      key: 'stock',
      header: 'Stock Level',
      className: 'min-w-[180px]',
      render: (i) => {
        const low = i.stock < i.minStock
        const pct = Math.min(100, Math.round((i.stock / (i.minStock * 2)) * 100))
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={cn('font-medium', low && 'text-destructive')}>
                {i.stock} {i.unit}
              </span>
              <span className="text-muted-foreground">min {i.minStock}</span>
            </div>
            <Progress
              value={pct}
              className={cn(low && '[&_[data-slot=progress-indicator]]:bg-destructive')}
            />
          </div>
        )
      },
    },
    {
      key: 'price',
      header: 'Purchase Price',
      render: (i) => currency(i.purchasePrice),
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (i) => (
        <span className="text-xs font-medium text-foreground">{i.createdBy || 'Aisha Bello (User)'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (i) =>
        i.stock < i.minStock ? (
          <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
            Low Stock
          </Badge>
        ) : (
          <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
            In Stock
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={!can('manage:inventory')}
              onClick={(e) => { e.stopPropagation(); setStockItem({ item: i, mode: 'in' }); }}
            >
              <PackagePlus className="size-4" /> Stock In
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!can('manage:inventory')}
              onClick={(e) => { e.stopPropagation(); setStockItem({ item: i, mode: 'out' }); }}
            >
              <PackageMinus className="size-4" /> Stock Out
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!can('manage:inventory')}
              onClick={(e) => { e.stopPropagation(); setEditing(i); }}
            >
              <Pencil className="size-4" /> Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!can('manage:inventory')}
              onClick={(e) => { e.stopPropagation(); setDeleting(i); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable
        data={inventory}
        columns={columns}
        searchKeys={['name', 'code', 'brand', 'supplier', 'createdBy']}
        searchPlaceholder="Search items, codes, suppliers, creator..."
        filter={{
          placeholder: 'All categories',
          options: categories,
          accessor: (i) => i.category,
        }}
      />

      {/* EDIT DIALOG */}
      <InventoryFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initialData={editing}
      />

      {/* STOCK IN / OUT DIALOG */}
      <Dialog open={!!stockItem} onOpenChange={(o) => !o && setStockItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {stockItem?.mode === 'in' ? 'Stock In' : 'Stock Out'} - {stockItem?.item.name}
            </DialogTitle>
            <DialogDescription>
              Current Stock: {stockItem?.item.stock} {stockItem?.item.unit}. Adjust quantity below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantity</label>
            <Input
              type="number"
              min="1"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setStockItem(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleStockUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : stockItem?.mode === 'in' ? 'Add Stock' : 'Deduct Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Inventory Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleting?.name} ({deleting?.code})</span>? This action will permanently remove it from MongoDB.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
