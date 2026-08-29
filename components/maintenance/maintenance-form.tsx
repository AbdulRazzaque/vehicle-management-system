'use client'

import { useState } from 'react'
import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useData } from '@/components/data-provider'
import { useAuth } from '@/components/auth-provider'
import { todayIso } from '@/lib/form-utils'
import type { Maintenance } from '@/lib/data'
import { maintenanceSchema } from '@/lib/validation/schemas'
import { VehicleSelect } from '@/components/forms/vehicle-select'
import {
  FormProps,
  useFormReset,
  SelectField,
} from '@/components/forms/entity-forms'

function emptyMaintenanceForm() {
  return {
    vehicleId: '',
    date: todayIso(),
    type: '',
    description: '',
    status: 'Scheduled' as Maintenance['status'],
    cost: '',
  }
}

export function MaintenanceFormDialog({ open, onOpenChange, initialData }: FormProps<Maintenance>) {
  const { vehicles, addMaintenance, updateMaintenance } = useData()
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyMaintenanceForm,
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
      vendor: '',
      odometer: vehicle.odometer,
      description: form.description.trim(),
      nextDate: form.date,
      status: form.status,
      items: initialData?.items || [],
      cost: Number(form.cost) || 0,
      createdBy: initialData?.createdBy || creatorString,
    }

    const validation = maintenanceSchema.safeParse(payload)
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
      result = await updateMaintenance(initialData.id, payload)
    } else {
      result = await addMaintenance(payload)
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
      title={initialData ? 'Edit Maintenance' : 'New Maintenance'}
      description={initialData ? 'Update maintenance record details.' : 'Schedule a maintenance record. Saved to MongoDB.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Save Record'}
      onSubmit={handleSubmit}
      className="sm:max-w-lg"
    >
      <FormGrid cols={2}>
        <FormField label="Vehicle" htmlFor="maint-vehicle" required error={errors.vehicleId} className="sm:col-span-2">
          <VehicleSelect
            id="maint-vehicle"
            value={form.vehicleId}
            onValueChange={(v) => setForm({ ...form, vehicleId: v })}
            vehicles={vehicles}
            placeholder="Select vehicle"
            disabled={isSubmitting}
            error={errors.vehicleId}
          />
        </FormField>
        <FormField label="Service Date" htmlFor="maint-date" required error={errors.date}>
          <Input id="maint-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Service Type" htmlFor="maint-type" required error={errors.type} className="sm:col-span-2">
          <Input id="maint-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Status" htmlFor="maint-status" required>
          <SelectField id="maint-status" value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Maintenance['status'] })} placeholder="Select status" options={allowedStatuses} />
        </FormField>
        <FormField label="Cost" htmlFor="maint-cost" error={errors.cost}>
          <Input id="maint-cost" type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} disabled={isSubmitting || !isAdmin} placeholder={isAdmin ? "Enter cost" : "Read-only for Users"} />
        </FormField>
      </FormGrid>
      <FormField label="Description" htmlFor="maint-description" error={errors.description}>
        <Textarea id="maint-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} disabled={isSubmitting} />
      </FormField>
    </FormDialog>
  )
}
