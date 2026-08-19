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
import { MaintenanceFormDialog } from '@/components/maintenance/maintenance-form'
import { currency, sumItems, type Maintenance } from '@/lib/data'

export function MaintenanceTable() {
  const { can, user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const { maintenance, deleteMaintenance } = useData()
  const [selected, setSelected] = useState<Maintenance | null>(null)
  const [editing, setEditing] = useState<Maintenance | null>(null)
  const [deleting, setDeleting] = useState<Maintenance | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    await deleteMaintenance(deleting.id)
    setIsDeleting(false)
    setDeleting(null)
  }

  const columns: Column<Maintenance>[] = [
    {
      key: 'id',
      header: 'Record',
      render: (m) => (
        <div className="leading-tight">
          <p className="font-medium">{m.id}</p>
          <p className="text-xs text-muted-foreground">{m.vehicleName}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (m) => m.type },
    { key: 'date', header: 'Date', render: (m) => m.date },
    {
      key: 'cost',
      header: 'Cost',
      render: (m) => (
        <span className="font-medium">{currency(m.cost && m.cost > 0 ? m.cost : sumItems(m.items || []))}</span>
      ),
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (m) => (
        <span className="text-xs font-medium text-foreground">{m.createdBy || 'Daniel Okoro (Admin)'}</span>
      ),
    },
    { key: 'status', header: 'Status', render: (m) => <StatusBadge status={m.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (m) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelected(m); }}>
              <Eye className="size-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!can('manage:maintenance')}
              onClick={(e) => { e.stopPropagation(); setEditing(m); }}
            >
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!isAdmin}
              onClick={(e) => { e.stopPropagation(); setDeleting(m); }}
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
        data={maintenance}
        columns={columns}
        searchKeys={['id', 'vehicleName', 'type', 'vendor', 'createdBy']}
        searchPlaceholder="Search maintenance records or creator..."
        filter={{
          placeholder: 'All statuses',
          options: ['Scheduled', 'In Progress', 'Completed'],
          accessor: (m) => m.status,
        }}
        onRowClick={(m) => setSelected(m)}
      />

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.id}</DialogTitle>
                <DialogDescription>
                  {selected.vehicleName} · {selected.type} · Created by: {selected.createdBy || 'Daniel Okoro (Admin)'}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
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
                      <TableCell className="text-right">{currency(it.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {currency(it.quantity * it.unitPrice)}
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
                      {currency(selected.cost && selected.cost > 0 ? selected.cost : sumItems(selected.items || []))}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT MAINTENANCE DIALOG */}
      <MaintenanceFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initialData={editing}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Maintenance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete maintenance record <span className="font-semibold text-foreground">{deleting?.id} ({deleting?.vehicleName})</span>? This action will permanently remove it from MongoDB.
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
