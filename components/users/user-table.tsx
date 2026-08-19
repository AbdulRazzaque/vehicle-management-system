"use client"

import { useState } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { useData } from "@/components/data-provider"
import { UserFormDialog } from "@/components/users/user-form"
import type { SystemUser } from "@/lib/data"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)

export function UserTable() {
  const { user } = useAuth()
  const { systemUsers, deleteUser } = useData()
  const isAdmin = user?.role === "Admin"

  const [editing, setEditing] = useState<SystemUser | null>(null)
  const [deleting, setDeleting] = useState<SystemUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    await deleteUser(deleting.id)
    setIsDeleting(false)
    setDeleting(null)
  }

  const columns: Column<SystemUser>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(u.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{u.name}</div>
            <div className="text-xs text-muted-foreground">{u.email}</div>
          </div>
        </div>
      ),
    },
    { key: "department", header: "Department", sortable: true },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (u) => (
        <Badge variant={u.role === "Admin" ? "default" : "secondary"}>{u.role}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (u) => (
        <span className="flex items-center gap-2 text-sm">
          <span className={u.status === "Active" ? "size-2 rounded-full bg-chart-1" : "size-2 rounded-full bg-muted-foreground"} />
          {u.status}
        </span>
      ),
    },
    { key: "lastActive", header: "Last Active", render: (u) => <span className="text-muted-foreground">{u.lastActive}</span> },
    {
      key: "id",
      header: "",
      render: (u) =>
        isAdmin ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditing(u); }}>
                <Pencil className="size-4" /> Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleting(u); }} className="text-destructive focus:text-destructive">
                <Trash2 className="size-4" /> Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="text-xs text-muted-foreground">View only</span>
        ),
    },
  ]

  return (
    <>
      <DataTable
        data={systemUsers}
        columns={columns}
        searchKeys={["name", "email", "department"]}
        searchPlaceholder="Search users…"
        filters={[
          { key: "role", label: "Role", options: ["Admin", "User"] },
          { key: "status", label: "Status", options: ["Active", "Suspended"] },
        ]}
      />

      {/* EDIT USER DIALOG */}
      <UserFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initialData={editing}
      />

      {/* DELETE USER CONFIRMATION */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">{deleting?.name} ({deleting?.email})</span>? This action will permanently remove the account from MongoDB.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
