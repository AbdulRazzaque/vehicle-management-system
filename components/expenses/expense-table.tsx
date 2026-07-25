'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { ExpenseFormDialog } from '@/components/forms/entity-forms'
import { currency, type Expense } from '@/lib/data'

export function ExpenseTable() {
  const { can } = useAuth()
  const { expenses, deleteExpense } = useData()
  const categories = Array.from(new Set(expenses.map((e) => e.category)))

  const [editing, setEditing] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState<Expense | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    await deleteExpense(deleting.id)
    setIsDeleting(false)
    setDeleting(null)
  }

  const columns: Column<Expense>[] = [
    {
      key: 'id',
      header: 'Expense',
      render: (e) => (
        <div className="leading-tight">
          <p className="font-medium">{e.id}</p>
          <p className="text-xs text-muted-foreground">{e.vehicleName}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (e) => <Badge variant="secondary">{e.category}</Badge>,
    },
    { key: 'description', header: 'Description', render: (e) => e.description },
    { key: 'date', header: 'Date', render: (e) => e.date },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (e) => (
        <span className="font-semibold">{currency(e.amount)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (e) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={!can('manage:expenses')}
              onClick={() => setEditing(e)}
            >
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!can('manage:expenses')}
              onClick={() => setDeleting(e)}
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
        data={expenses}
        columns={columns}
        searchKeys={['id', 'vehicleName', 'description', 'category']}
        searchPlaceholder="Search expenses..."
        filter={{
          placeholder: 'All categories',
          options: categories,
          accessor: (e) => e.category,
        }}
      />

      {/* EDIT DIALOG */}
      <ExpenseFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initialData={editing}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete expense <span className="font-semibold text-foreground">{deleting?.id} ({deleting?.vehicleName})</span>? This action will permanently remove it from MongoDB.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
