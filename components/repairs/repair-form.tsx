'use client'

import { useState } from 'react'
import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useData } from '@/components/data-provider'
import { useAuth } from '@/components/auth-provider'
import { todayIso } from '@/lib/form-utils'
import type { Repair } from '@/lib/data'
import { repairSchema } from '@/lib/validation/schemas'
import {
  FormProps,
  useFormReset,
  SelectField,
} from '@/components/forms/entity-forms'

const repairPriorities: Repair['priority'][] = ['Low', 'Medium', 'High', 'Critical']

function emptyRepairForm() {
  return {
    vehicleId: '',
    date: todayIso(),
    type: '',
    workshop: '',
    description: '',
    priority: 'Medium' as Repair['priority'],
    status: 'Scheduled' as Repair['status'],
    cost: '',
  }
}

export function RepairFormDialog({ open, onOpenChange, initialData }: FormProps<Repair>) {
  const { vehicles, addRepair, updateRepair } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyRepairForm,
    initialData ? { ...initialData, cost: String(initialData.cost ?? '') } as any : null
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const vehicle = vehicles.find((v) => v.id === form.vehicleId)
    if (!vehicle) {
      setErrors({ vehicleId: 'Select a valid vehicle' })
      setIsSubmitting(false)
      return
    }

    const creatorString = user?.name ? `${user.name} (${user.role})` : 'Daniel Okoro (Admin)'

    const payload = {
      vehicleId: form.vehicleId,
      vehicleName: vehicle.name,
      date: form.date,
      type: form.type.trim(),
      workshop: form.workshop.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      items: initialData?.items || [],
      cost: Number(form.cost) || 0,
      createdBy: initialData?.createdBy || creatorString,
    }

    const validation = repairSchema.safeParse(payload)
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
      result = await updateRepair(initialData.id, payload)
    } else {
      result = await addRepair(payload)
    }

    setIsSubmitting(false)
    if (result) {
      onOpenChange(false)
    }
  }

  const allowedStatuses = isAdmin
    ? ['Scheduled', 'In Progress', 'Completed']
    : ['Scheduled', 'In Progress']

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Edit Repair' : 'New Repair'}
      description={initialData ? 'Update repair details.' : 'Log a repair request. Saved to MongoDB.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update Repair' : 'Save Repair'}
      onSubmit={handleSubmit}
      className="sm:max-w-lg"
    >
      <FormGrid cols={2}>
        <FormField label="Vehicle" htmlFor="repair-vehicle" required error={errors.vehicleId} className="sm:col-span-2">
          <SelectField
            id="repair-vehicle"
            value={form.vehicleId}
            onValueChange={(v) => setForm({ ...form, vehicleId: v })}
            placeholder="Select vehicle"
            options={vehicles.map((v) => ({ value: v.id, label: v.name }))}
          />
        </FormField>
        <FormField label="Date" htmlFor="repair-date" required error={errors.date}>
          <Input id="repair-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Repair Type" htmlFor="repair-type" required error={errors.type}>
          <Input id="repair-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Workshop" htmlFor="repair-workshop" required error={errors.workshop}>
          <Input id="repair-workshop" value={form.workshop} onChange={(e) => setForm({ ...form, workshop: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Priority" htmlFor="repair-priority" required>
          <SelectField id="repair-priority" value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Repair['priority'] })} placeholder="Select priority" options={repairPriorities} />
        </FormField>
        <FormField label="Status" htmlFor="repair-status" required>
          <SelectField id="repair-status" value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Repair['status'] })} placeholder="Select status" options={allowedStatuses} />
        </FormField>
        <FormField label="Cost" htmlFor="repair-cost" error={errors.cost} className="sm:col-span-2">
          <Input id="repair-cost" type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} disabled={isSubmitting || !isAdmin} placeholder={isAdmin ? "Enter cost" : "Read-only for Users"} />
        </FormField>
      </FormGrid>
      <FormField label="Description" htmlFor="repair-description" error={errors.description}>
        <Textarea id="repair-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} disabled={isSubmitting} />
      </FormField>
    </FormDialog>
  )
}
