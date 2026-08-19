'use client'

import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useData } from '@/components/data-provider'
import type { Vehicle } from '@/lib/data'
import { vehicleSchema } from '@/lib/validation/schemas'
import {
  FormProps,
  useFormReset,
} from '@/components/forms/entity-forms'

import { useAuth } from '@/components/auth-provider'

function emptyVehicleForm() {
  return {
    name: '',
    model: '',
    modelNumber: '',
    plateNumber: '',
    registrationNumber: '',
    year: new Date().getFullYear(),
    color: '',
    chassisNumber: '',
    engineNumber: '',
    type: '',
    fuelType: '',
    registrationExpiry: '',
    department: '',
    notes: '',
  }
}

export function VehicleFormDialog({ open, onOpenChange, initialData }: FormProps<Vehicle>) {
  const { addVehicle, updateVehicle } = useData()
  const { user } = useAuth()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyVehicleForm,
    initialData ? initialData : null
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const creatorString = user?.name ? `${user.name} (${user.role})` : 'Daniel Okoro (Admin)'

    const payload = {
      name: form.name.trim(),
      model: form.model.trim(),
      modelNumber: initialData?.modelNumber || '',
      plateNumber: form.plateNumber.trim(),
      registrationNumber: form.registrationNumber.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      color: form.color.trim(),
      chassisNumber: form.chassisNumber.trim(),
      engineNumber: form.engineNumber.trim(),
      type: form.type.trim(),
      fuelType: form.fuelType.trim(),
      registrationExpiry: form.registrationExpiry,
      department: form.department.trim(),
      notes: form.notes.trim(),
      createdBy: initialData?.createdBy || creatorString,
      odometer: initialData?.odometer || 0,
      status: initialData?.status || 'Active',
      insurer: initialData?.insurer || '',
      insuranceExpiry: initialData?.insuranceExpiry || '',
      driver: initialData?.driver || '',
    }

    const validation = vehicleSchema.safeParse(payload)
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
      result = await updateVehicle(initialData.id, payload)
    } else {
      result = await addVehicle(payload)
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
      title={initialData ? 'Edit Vehicle' : 'New Vehicle'}
      description={initialData ? 'Update vehicle registration and department details.' : 'Add a new vehicle to the fleet. Saved to MongoDB.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update Vehicle' : 'Save Vehicle'}
      onSubmit={handleSubmit}
      className="sm:max-w-xl"
    >
      <FormGrid cols={2}>
        <FormField label="Vehicle Brand" htmlFor="vehicle-brand" required error={errors.name}>
          <Input id="vehicle-brand" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} placeholder="e.g. Volvo FH16" />
        </FormField>
        <FormField label="Plate Number" htmlFor="vehicle-plate" required error={errors.plateNumber}>
          <Input id="vehicle-plate" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} disabled={isSubmitting} placeholder="e.g. AA-1234" />
        </FormField>
        <FormField label="Model" htmlFor="vehicle-model" required error={errors.model}>
          <Input id="vehicle-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Manufacture Year" htmlFor="vehicle-manufacture-year" required error={errors.year}>
          <Input id="vehicle-manufacture-year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Color" htmlFor="vehicle-color">
          <Input id="vehicle-color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Chassis Number" htmlFor="vehicle-chassis">
          <Input id="vehicle-chassis" value={form.chassisNumber} onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Engine Number" htmlFor="vehicle-engine">
          <Input id="vehicle-engine" value={form.engineNumber} onChange={(e) => setForm({ ...form, engineNumber: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Registration No." htmlFor="vehicle-reg">
          <Input id="vehicle-reg" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Registration Expiry" htmlFor="vehicle-reg-exp">
          <Input id="vehicle-reg-exp" type="date" value={form.registrationExpiry} onChange={(e) => setForm({ ...form, registrationExpiry: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Vehicle Type" htmlFor="vehicle-type" required error={errors.type}>
          <Input id="vehicle-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={isSubmitting} placeholder="e.g. Heavy Truck" />
        </FormField>
        <FormField label="Fuel Type" htmlFor="vehicle-fuel" required error={errors.fuelType}>
          <Input id="vehicle-fuel" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} disabled={isSubmitting} placeholder="e.g. Diesel" />
        </FormField>
        <FormField label="Department" htmlFor="vehicle-dept" required error={errors.department}>
          <Input id="vehicle-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} disabled={isSubmitting} />
        </FormField>
      </FormGrid>
      <FormField label="Notes" htmlFor="vehicle-notes">
        <Textarea id="vehicle-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} disabled={isSubmitting} />
      </FormField>
    </FormDialog>
  )
}
