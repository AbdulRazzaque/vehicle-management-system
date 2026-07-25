'use client'

import { PageHeader } from '@/components/page-header'
import { DataTable, type Column } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useData } from '@/components/data-provider'
import type { AuditLog } from '@/lib/data'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

const typeStyles: Record<AuditLog['type'], string> = {
  Create: 'bg-chart-1/15 text-chart-1',
  Update: 'bg-chart-3/15 text-chart-3',
  Delete: 'bg-destructive/15 text-destructive',
  Login: 'bg-chart-2/15 text-chart-2',
  Export: 'bg-chart-4/15 text-chart-4',
}

export default function AuditPage() {
  const { auditLogs } = useData()

  const columns: Column<AuditLog>[] = [
    { key: 'timestamp', header: 'Timestamp', sortable: true, render: (l) => <span className="font-mono text-xs text-muted-foreground">{l.timestamp}</span> },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (l) => <Badge className={typeStyles[l.type]} variant="secondary">{l.type}</Badge>,
    },
    { key: 'action', header: 'Action', render: (l) => <span className="font-medium">{l.action}</span> },
    { key: 'entity', header: 'Entity', sortable: true, render: (l) => <span className="font-mono text-xs">{l.entity}</span> },
    {
      key: 'user',
      header: 'User',
      sortable: true,
      render: (l) => (
        <div>
          <div className="text-sm">{l.user}</div>
          <div className="text-xs text-muted-foreground">{l.role}</div>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable record of every create, update, delete, login and export action in the system."
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success('Exporting audit log…')}>
            <Download className="size-4" />
            Export Log
          </Button>
        }
      />
      <DataTable
        data={auditLogs}
        columns={columns}
        searchKeys={['action', 'entity', 'user']}
        searchPlaceholder="Search audit log…"
        filters={[{ key: 'type', label: 'Type', options: ['Create', 'Update', 'Delete', 'Login', 'Export'] }]}
      />
    </div>
  )
}
