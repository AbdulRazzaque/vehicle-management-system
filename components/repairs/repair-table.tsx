'use client'

import { useState } from 'react'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/components/auth-provider'
import { useData } from '@/components/data-provider'
import { RepairFormDialog } from '@/components/forms/entity-forms'
import { currency, sumItems, type Repair } from '@/lib/data'

export function RepairTable() {
  const { can } = useAuth()
  const { repairs, deleteRepair } = useData()
  const [selected, setSelected] = useState<Repair | null>(null)
  const [editing, setEditing] = useState<Repair | null>(null)
  const [deleting, setDeleting] = useState<Repair | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    await deleteRepair(deleting.id)
    setIsDeleting(false)
    setDeleting(null)
  }

  const columns: Column<Repair>[] = [
    {
      key: 'id',
      header: 'Record',
      render: (r) => (
        <div className="leading-tight">
          <p className="font-medium">{r.id}</p>
          <p className="text-xs text-muted-foreground">{r.vehicleName}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (r) => r.type },
    { key: 'workshop', header: 'Workshop', render: (r) => r.workshop },
    { key: 'date', header: 'Date', render: (r) => r.date },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
    {
      key: 'cost',
      header: 'Cost',
      render: (r) => <span className="font-medium">{currency(sumItems(r.items || []))}</span>,
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelected(r)}>
              <Eye className="size-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!can('manage:repairs')}
              onClick={() => setEditing(r)}
            >
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!can('manage:repairs')}
              onClick={() => setDeleting(r)}
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
        data={repairs}
        columns={columns}
        searchKeys={['id', 'vehicleName', 'type', 'workshop']}
        searchPlaceholder="Search repair records..."
        filter={{
          placeholder: 'All priorities',
          options: ['Low', 'Medium', 'High', 'Critical'],
          accessor: (r) => r.priority,
        }}
        onRowClick={(r) => setSelected(r)}
      />

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.id}
                  <StatusBadge status={selected.priority} />
                </DialogTitle>
                <DialogDescription>
                  {selected.vehicleName} · {selected.type} · {selected.workshop}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part / Labor</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selected.items || []).map((it) => (
                    <TableRow key={it.name}>
                      <TableCell>{it.name}</TableCell>
                      <TableCell className="text-right">{it.quantity}</TableCell>
                      <TableCell className="text-right">{currency(it.unitCost)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {currency(it.quantity * it.unitCost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-medium">
                      Total Cost
                    </TableCell>
                    <TableCell className="text-right text-base font-semibold text-primary">
                      {currency(sumItems(selected.items || []))}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT REPAIR DIALOG */}
      <RepairFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initialData={editing}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Repair Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete repair record <span className="font-semibold text-foreground">{deleting?.id} ({deleting?.vehicleName})</span>? This action will permanently remove it from MongoDB.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
