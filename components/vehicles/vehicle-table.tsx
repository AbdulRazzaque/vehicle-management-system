'use client'

import { useState } from 'react'
import { Truck, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { DataTable, type Column } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/auth-provider'
import { useData } from '@/components/data-provider'
import { VehicleFormDialog } from '@/components/vehicles/vehicle-form'
import type { Vehicle } from '@/lib/data'

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  )
}

export function VehicleTable() {
  const { can, user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const { vehicles, deleteVehicle } = useData()
  const [selected, setSelected] = useState<Vehicle | null>(null)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState<Vehicle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    await deleteVehicle(deleting.id)
    setIsDeleting(false)
    setDeleting(null)
  }

  const columns: Column<Vehicle>[] = [
    {
      key: 'name',
      header: 'Vehicle',
      render: (v) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
              <Truck className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="font-medium">{v.name}</p>
            <p className="text-xs text-muted-foreground">{v.id} · {v.plateNumber}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (v) => v.type },
    { key: 'department', header: 'Department', render: (v) => v.department },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (v) => (
        <span className="text-xs font-medium text-foreground">
          {v.createdBy || 'Daniel Okoro (Admin)'}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (v) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelected(v); }}>
              <Eye className="size-4" /> View details
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!can('manage:vehicles')}
              onClick={(e) => { e.stopPropagation(); setEditing(v); }}
            >
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!isAdmin}
              onClick={(e) => { e.stopPropagation(); setDeleting(v); }}
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
        data={vehicles}
        columns={columns}
        searchKeys={['name', 'plateNumber', 'driver', 'id', 'department', 'createdBy']}
        searchPlaceholder="Search by name, plate, driver, creator..."
        filter={{
          placeholder: 'All statuses',
          options: ['Active', 'Maintenance', 'Repair', 'Inactive'],
          accessor: (v) => v.status,
        }}
        onRowClick={(v) => setSelected(v)}
      />

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <DialogTitle>{selected.name}</DialogTitle>
                    <DialogDescription>
                      {selected.id} · {selected.plateNumber}
                    </DialogDescription>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={selected.status} />
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <DetailRow label="Model" value={selected.model} />
                <DetailRow label="Model No." value={selected.modelNumber} />
                <DetailRow label="Year" value={selected.year} />
                <DetailRow label="Color" value={selected.color} />
                <DetailRow label="Type" value={selected.type} />
                <DetailRow label="Fuel" value={selected.fuelType} />
                <DetailRow label="Chassis No." value={selected.chassisNumber} />
                <DetailRow label="Engine No." value={selected.engineNumber} />
                <DetailRow label="Registration" value={selected.registrationNumber} />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <DetailRow label="Department" value={selected.department} />
                <DetailRow label="Reg. Expiry" value={selected.registrationExpiry} />
                <DetailRow label="Created By" value={selected.createdBy || 'Daniel Okoro (Admin)'} />
              </div>

              {selected.notes && (
                <>
                  <Separator />
                  <DetailRow label="Notes" value={selected.notes} />
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT VEHICLE DIALOG */}
      <VehicleFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initialData={editing}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleting?.name} ({deleting?.plateNumber})</span>? This action will permanently remove the record from MongoDB.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
