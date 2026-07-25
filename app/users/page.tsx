'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { UserTable } from '@/components/users/user-table'
import { AdminAction } from '@/components/admin-action'
import { UserFormDialog } from '@/components/forms/entity-forms'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, Lock } from 'lucide-react'
import UnderConstruction from '@/components/under-construction'

export default function UsersPage() {
  const { role } = useAuth()
  const [formOpen, setFormOpen] = useState(false)

  // return <UnderConstruction />
  return (

    <div>
      <PageHeader
        title="User Management"
        description="Manage team members and their access roles. Admins have full control; Viewers have read-only access."
        actions={
          <AdminAction
            permission="manage:users"
            icon={UserPlus}
            label="Invite User"
            onAction={() => setFormOpen(true)}
          />
        }
      />

      {role !== 'Admin' && (
        <Card className="mb-4 border-chart-4/40 bg-chart-4/10">
          <CardContent className="flex items-center gap-3 py-3 text-sm">
            <Lock className="size-4 text-chart-4" />
            <span>You are viewing as a Viewer. Switch to Admin in the top bar to manage users.</span>
          </CardContent>
        </Card>
      )}

      <UserTable />
      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
