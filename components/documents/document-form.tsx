'use client'

import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { useData } from '@/components/data-provider'
import { useAuth } from '@/components/auth-provider'
import { todayIso } from '@/lib/form-utils'
import type { FleetDocument } from '@/lib/data'
import { documentSchema } from '@/lib/validation/schemas'
import {
  FormProps,
  useFormReset,
  SelectField,
} from '@/components/forms/entity-forms'

const documentTypes: FleetDocument['type'][] = [
  'Registration',
  'Insurance',
  'Maintenance Invoice',
  'Repair Invoice',
  'Purchase Invoice',
  'Vehicle Image',
]

function emptyDocumentForm() {
  return {
    name: '',
    type: '' as FleetDocument['type'] | '',
    vehicle: '',
    size: '',
  }
}

export function DocumentFormDialog({ open, onOpenChange, initialData }: FormProps<FleetDocument>) {
  const { vehicles, addDocument, updateDocument } = useData()
  const { user } = useAuth()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyDocumentForm,
    initialData
  )

  const vehicleOptions = ['General', ...vehicles.map((v) => v.name)]

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const payload = {
      name: form.name.trim(),
      type: form.type as FleetDocument['type'],
      vehicle: form.vehicle,
      size: form.size.trim(),
      uploadedBy: initialData?.uploadedBy || user?.name || 'Admin',
      date: initialData?.date || todayIso(),
    }

    const validation = documentSchema.safeParse(payload)
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
      result = await updateDocument(initialData.id, payload)
    } else {
      result = await addDocument(payload)
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
      title={initialData ? 'Edit Document' : 'Upload Document'}
      description={initialData ? 'Update document info.' : 'Add a document to the fleet library. Saved to MongoDB.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update Document' : 'Upload'}
      onSubmit={handleSubmit}
      className="sm:max-w-lg"
    >
      <FormGrid cols={2}>
        <FormField label="Document Name" htmlFor="doc-name" required error={errors.name} className="sm:col-span-2">
          <Input id="doc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Type" htmlFor="doc-type" required error={errors.type}>
          <SelectField
            id="doc-type"
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v as FleetDocument['type'] })}
            placeholder="Select type"
            options={documentTypes}
          />
        </FormField>
        <FormField label="File Size" htmlFor="doc-size" required error={errors.size}>
          <Input id="doc-size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="1.2 MB" disabled={isSubmitting} />
        </FormField>
        <FormField label="Vehicle" htmlFor="doc-vehicle" required error={errors.vehicle} className="sm:col-span-2">
          <SelectField
            id="doc-vehicle"
            value={form.vehicle}
            onValueChange={(v) => setForm({ ...form, vehicle: v })}
            placeholder="Select vehicle (or general)"
            options={vehicleOptions}
          />
        </FormField>
      </FormGrid>
    </FormDialog>
  )
}
