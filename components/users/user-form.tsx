'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { useData } from '@/components/data-provider'
import type { SystemUser } from '@/lib/data'
import { userSchema, createUserSchema } from '@/lib/validation/schemas'
import {
  FormProps,
  useFormReset,
  SelectField,
} from '@/components/forms/entity-forms'

const userRoles: SystemUser['role'][] = ['Admin', 'User']
const userStatuses: SystemUser['status'][] = ['Active', 'Suspended']

type UserFormState = {
  name: string
  username: string
  role: SystemUser['role']
  department: string
  status: SystemUser['status']
  password?: string
  confirmPassword?: string
}

function emptyUserForm(): UserFormState {
  return {
    name: '',
    username: '',
    role: 'User' as SystemUser['role'],
    department: '',
    status: 'Active' as SystemUser['status'],
    password: '',
    confirmPassword: '',
  }
}

export function UserFormDialog({ open, onOpenChange, initialData }: FormProps<SystemUser>) {
  const { addUser, updateUser } = useData()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const initialFormData = initialData
    ? {
        name: initialData.name || '',
        username: initialData.username || '',
        role: initialData.role || 'User',
        department: initialData.department || '',
        status: initialData.status || 'Active',
        password: '',
        confirmPassword: '',
      }
    : null

  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset<UserFormState>(
    open,
    emptyUserForm,
    initialFormData
  )

  const isEditing = Boolean(initialData?.id)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const payload: Record<string, any> = {
      name: form.name.trim(),
      username: form.username.trim(),
      role: form.role,
      department: form.department.trim(),
      status: form.status,
      lastActive: initialData?.lastActive || 'Just now',
    }

    if (!isEditing || form.password) {
      payload.password = form.password
      payload.confirmPassword = form.confirmPassword
    }

    const validator = isEditing ? userSchema : createUserSchema
    const validation = validator.safeParse(payload)

    if (!validation.success) {
      const errMap: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const pathKey = String(issue.path[0] || 'form')
        if (!errMap[pathKey]) {
          errMap[pathKey] = issue.message
        }
      })
      setErrors(errMap as any)
      setIsSubmitting(false)
      return
    }

    let result
    if (isEditing && initialData?.id) {
      result = await updateUser(initialData.id, payload)
    } else {
      result = await addUser(payload as any)
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
      title={isEditing ? 'Edit User' : 'Create User'}
      description={isEditing ? 'Update user details & permissions.' : 'Create a new team member account with initial credentials.'}
      submitLabel={isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
      onSubmit={handleSubmit}
      className="sm:max-w-lg"
    >
      <FormGrid cols={2}>
        {/* Full Name */}
        <FormField label="Full Name" htmlFor="user-name" required error={errors.name} className="sm:col-span-2">
          <Input id="user-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} placeholder="e.g. John Doe" />
        </FormField>

        {/* Username */}
        <FormField label="Username" htmlFor="user-username" required error={errors.username} className="sm:col-span-2">
          <Input id="user-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={isSubmitting} placeholder="e.g. johndoe" />
        </FormField>

        {/* Department & Role side-by-side */}
        <FormField label="Department" htmlFor="user-department" required error={errors.department} className="sm:col-span-1">
          <Input id="user-department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} disabled={isSubmitting} placeholder="e.g. Operations" />
        </FormField>
        <FormField label="Role" htmlFor="user-role" required error={errors.role} className="sm:col-span-1">
          <SelectField id="user-role" value={form.role} onValueChange={(v) => setForm({ ...form, role: v as SystemUser['role'] })} placeholder="Select role" options={userRoles} />
        </FormField>
        
        {/* Password & Confirm Password */}
        {(!isEditing || form.password || errors.password || errors.confirmPassword) && (
          <>
            <FormField label={isEditing ? 'New Password' : 'Password'} htmlFor="user-password" required={!isEditing} error={errors.password} className="sm:col-span-2">
              <div className="relative">
                <Input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password || ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={isSubmitting}
                  placeholder="At least 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm Password" htmlFor="user-confirm-password" required={!isEditing} error={errors.confirmPassword} className="sm:col-span-2">
              <div className="relative">
                <Input
                  id="user-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword || ''}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  disabled={isSubmitting}
                  placeholder="Re-enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FormField>
          </>
        )}

        {/* Status */}
        <FormField label="Status" htmlFor="user-status" required error={errors.status} className="sm:col-span-2">
          <SelectField id="user-status" value={form.status} onValueChange={(v) => setForm({ ...form, status: v as SystemUser['status'] })} placeholder="Select status" options={userStatuses} />
        </FormField>
      </FormGrid>
    </FormDialog>
  )
}


