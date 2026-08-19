'use client'

import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { useData } from '@/components/data-provider'
import type { SystemUser } from '@/lib/data'
import { userSchema } from '@/lib/validation/schemas'
import {
  FormProps,
  useFormReset,
  SelectField,
} from '@/components/forms/entity-forms'

const userRoles: SystemUser['role'][] = ['Admin', 'User']
const userStatuses: SystemUser['status'][] = ['Active', 'Suspended']

function emptyUserForm() {
  return {
    name: '',
    email: '',
    role: 'User' as SystemUser['role'],
    department: '',
    status: 'Active' as SystemUser['status'],
  }
}

export function UserFormDialog({ open, onOpenChange, initialData }: FormProps<SystemUser>) {
  const { addUser, updateUser } = useData()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyUserForm,
    initialData
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      department: form.department.trim(),
      status: form.status,
      lastActive: initialData?.lastActive || 'Just now',
    }

    const validation = userSchema.safeParse(payload)
    if (!validation.success) {
      const errMap: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) errMap[String(issue.path[0])] = issue.message
      })
      setErrors(errMap as any)
      setIsSubmitting(false)
      return
    }

    let result
    if (initialData?.id) {
      result = await updateUser(initialData.id, payload)
    } else {
      result = await addUser(payload)
    }

    setIsSubmitting(false)
    if (result) {
      onOpenChange(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Edit User' : 'Invite User'}
      description={initialData ? 'Update user details & permissions.' : 'Send an invitation to a new team member. Saved to MongoDB.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update User' : 'Send Invite'}
      onSubmit={handleSubmit}
      className="sm:max-w-lg"
    >
      <FormGrid cols={2}>
        <FormField label="Full Name" htmlFor="user-name" required error={errors.name} className="sm:col-span-2">
          <Input id="user-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Email" htmlFor="user-email" required error={errors.email} className="sm:col-span-2">
          <Input id="user-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Department" htmlFor="user-department" required error={errors.department}>
          <Input id="user-department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Role" htmlFor="user-role" required>
          <SelectField id="user-role" value={form.role} onValueChange={(v) => setForm({ ...form, role: v as SystemUser['role'] })} placeholder="Select role" options={userRoles} />
        </FormField>
        <FormField label="Status" htmlFor="user-status" required>
          <SelectField id="user-status" value={form.status} onValueChange={(v) => setForm({ ...form, status: v as SystemUser['status'] })} placeholder="Select status" options={userStatuses} />
        </FormField>
      </FormGrid>
    </FormDialog>
  )
}
