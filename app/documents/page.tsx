'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { DataTable, type Column } from '@/components/data-table'
import { AdminAction } from '@/components/admin-action'
import { DocumentFormDialog } from '@/components/forms/entity-forms'
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
import { useData } from '@/components/data-provider'
import type { FleetDocument } from '@/lib/data'
import { Upload, FileText, ImageIcon, Download, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const { documents, deleteDocument } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FleetDocument | null>(null)
  const [deleting, setDeleting] = useState<FleetDocument | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    await deleteDocument(deleting.id)
    setIsDeleting(false)
    setDeleting(null)
  }

  const columns: Column<FleetDocument>[] = [
    {
      key: 'name',
      header: 'Document',
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            {d.type === 'Vehicle Image' ? (
              <ImageIcon className="size-4 text-chart-2" />
            ) : (
              <FileText className="size-4 text-chart-3" />
            )}
          </div>
          <div>
            <div className="font-medium">{d.name}</div>
            <div className="text-xs text-muted-foreground">{d.size}</div>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', sortable: true, render: (d) => <Badge variant="outline">{d.type}</Badge> },
    { key: 'vehicle', header: 'Vehicle', sortable: true },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { key: 'date', header: 'Date', sortable: true, render: (d) => <span className="text-muted-foreground">{d.date}</span> },
    {
      key: 'id',
      header: '',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => toast.success(`Downloading ${d.name}…`)}>
            <Download className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(d)}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleting(d)} className="text-destructive focus:text-destructive">
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Centralized storage for registration, insurance, invoices and vehicle images."
        actions={
          <AdminAction
            permission="manage:documents"
            icon={Upload}
            label="Upload Document"
            onAction={() => setFormOpen(true)}
          />
        }
      />
      <DataTable
        data={documents}
        columns={columns}
        searchKeys={['name', 'vehicle', 'uploadedBy']}
        searchPlaceholder="Search documents…"
        filters={[
          {
            key: 'type',
            label: 'Type',
            options: ['Registration', 'Insurance', 'Maintenance Invoice', 'Repair Invoice', 'Purchase Invoice', 'Vehicle Image'],
          },
        ]}
      />

      {/* UPLOAD NEW DOCUMENT DIALOG */}
      <DocumentFormDialog open={formOpen} onOpenChange={setFormOpen} />

      {/* EDIT DOCUMENT DIALOG */}
      <DocumentFormDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initialData={editing} />

      {/* DELETE DOCUMENT CONFIRMATION */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleting?.name}</span>? This action will permanently remove it from MongoDB.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
