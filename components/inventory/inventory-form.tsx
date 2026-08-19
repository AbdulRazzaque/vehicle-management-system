'use client'

import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { useData } from '@/components/data-provider'
import type { InventoryItem } from '@/lib/data'
import { inventorySchema } from '@/lib/validation/schemas'
import {
  FormProps,
  useFormReset,
} from '@/components/forms/entity-forms'

function emptyInventoryForm() {
  return {
    name: '',
    category: '',
    brand: '',
    unit: '',
    purchasePrice: '',
    stock: '',
  }
}

import { useAuth } from '@/components/auth-provider'

export function InventoryFormDialog({ open, onOpenChange, initialData }: FormProps<InventoryItem>) {
  const { inventory, addInventoryItem, updateInventoryItem } = useData()
  const { user } = useAuth()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyInventoryForm,
    initialData ? {
      ...initialData,
      purchasePrice: String(initialData.purchasePrice),
      stock: String(initialData.stock),
    } as any : null
  )

  // Compute next auto code for preview (ITEM-01, ITEM-02, …)
  const nextCode = (() => {
    const codes = inventory.map((i) => i.code).filter((c) => c?.startsWith('ITEM-'))
    const nums = codes.map((c) => parseInt(c.slice(5), 10)).filter((n) => !isNaN(n))
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
    return `ITEM-${String(next).padStart(2, '0')}`
  })()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const creatorString = user?.name ? `${user.name} (${user.role})` : 'Aisha Bello (User)'

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      brand: form.brand.trim(),
      unit: form.unit.trim(),
      purchasePrice: Number(form.purchasePrice) || 0,
      usagePrice: 0,
      stock: Number(form.stock) || 0,
      minStock: 0,
      supplier: '',
      location: '',
      createdBy: initialData?.createdBy || creatorString,
    }

    const validation = inventorySchema.safeParse(payload)
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
      result = await updateInventoryItem(initialData.id, payload)
    } else {
      result = await addInventoryItem(payload)
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
      title={initialData ? 'Edit Item' : 'Add Item'}
      description={initialData ? 'Update spare part or inventory details.' : 'Add a new spare part to the catalog. Saved to MongoDB.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update Item' : 'Save Item'}
      onSubmit={handleSubmit}
      className="sm:max-w-lg"
    >
      {/* Item Code badge */}
      <div className="mb-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <span className="text-muted-foreground">Item Code:</span>
        <span className="font-mono font-semibold">
          {initialData ? initialData.code : nextCode}
        </span>
        {!initialData && (
          <span className="ml-auto text-xs text-muted-foreground">(auto-assigned)</span>
        )}
      </div>

      <FormGrid cols={2}>
        <FormField label="Item Name" htmlFor="inv-name" required error={errors.name} className="sm:col-span-2">
          <Input id="inv-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Category" htmlFor="inv-category" error={errors.category}>
          <Input id="inv-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={isSubmitting} placeholder="Optional" />
        </FormField>
        <FormField label="Brand" htmlFor="inv-brand" error={errors.brand}>
          <Input id="inv-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} disabled={isSubmitting} placeholder="Optional" />
        </FormField>
        <FormField label="Unit" htmlFor="inv-unit" required error={errors.unit}>
          <Input id="inv-unit" value={form.unit} placeholder="Piece, Litre, Set..." onChange={(e) => setForm({ ...form, unit: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Purchase Price" htmlFor="inv-purchase" required error={errors.purchasePrice}>
          <Input id="inv-purchase" type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Stock" htmlFor="inv-stock" required error={errors.stock} className="sm:col-span-2">
          <Input id="inv-stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} disabled={isSubmitting} />
        </FormField>
      </FormGrid>
    </FormDialog>
  )
}
