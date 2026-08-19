'use client'

import { useState, useRef, useEffect } from 'react'
import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useData } from '@/components/data-provider'
import { useAuth } from '@/components/auth-provider'
import { todayIso } from '@/lib/form-utils'
import type { Expense } from '@/lib/data'
import { expenseSchema } from '@/lib/validation/schemas'
import {
  FormProps,
  useFormReset,
} from '@/components/forms/entity-forms'
import { Truck, Boxes, Plus, Check } from 'lucide-react'

function emptyExpenseForm() {
  return {
    item: '',
    itemType: 'Custom' as 'Vehicle' | 'Inventory' | 'Custom',
    itemId: '',
    vehicleId: '',
    vehicleName: '',
    date: todayIso(),
    amount: '',
    description: '',
  }
}

export function ExpenseFormDialog({ open, onOpenChange, initialData }: FormProps<Expense>) {
  const { vehicles, inventory, addExpense, updateExpense } = useData()
  const { user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyExpenseForm,
    initialData
      ? {
          item: initialData.item || initialData.vehicleName || '',
          itemType: initialData.itemType || (initialData.vehicleId ? 'Vehicle' : 'Custom'),
          itemId: initialData.itemId || initialData.vehicleId || '',
          vehicleId: initialData.vehicleId || '',
          vehicleName: initialData.vehicleName || '',
          date: initialData.date,
          amount: String(initialData.amount),
          description: initialData.description || '',
        } as any
      : null
  )

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtered suggestion options
  const searchLower = (form.item || '').toLowerCase().trim()

  const filteredVehicles = vehicles.filter(
    (v) => v.name.toLowerCase().includes(searchLower) || v.id.toLowerCase().includes(searchLower) || v.plateNumber.toLowerCase().includes(searchLower)
  )

  const filteredInventory = inventory.filter(
    (i) => i.name.toLowerCase().includes(searchLower) || i.code.toLowerCase().includes(searchLower) || (i.brand && i.brand.toLowerCase().includes(searchLower))
  )

  // Handle typing in Item input smoothly
  const handleInputChange = (val: string) => {
    // Check exact match to update itemType dynamically
    const exactVehicle = vehicles.find((v) => v.name.toLowerCase() === val.trim().toLowerCase())
    const exactInventory = inventory.find((i) => i.name.toLowerCase() === val.trim().toLowerCase())

    if (exactVehicle) {
      setForm((prev) => ({
        ...prev,
        item: val,
        itemType: 'Vehicle',
        itemId: exactVehicle.id,
        vehicleId: exactVehicle.id,
        vehicleName: exactVehicle.name,
      }))
    } else if (exactInventory) {
      setForm((prev) => ({
        ...prev,
        item: val,
        itemType: 'Inventory',
        itemId: exactInventory.id,
        vehicleId: '',
        vehicleName: '',
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        item: val,
        itemType: 'Custom',
        itemId: '',
        vehicleId: '',
        vehicleName: '',
      }))
    }

    setDropdownOpen(true)
  }

  // Handle clicking a vehicle suggestion
  const selectVehicle = (v: (typeof vehicles)[0]) => {
    setForm((prev) => ({
      ...prev,
      item: v.name,
      itemType: 'Vehicle',
      itemId: v.id,
      vehicleId: v.id,
      vehicleName: v.name,
    }))
    setDropdownOpen(false)
  }

  // Handle clicking an inventory suggestion
  const selectInventory = (i: (typeof inventory)[0]) => {
    setForm((prev) => ({
      ...prev,
      item: i.name,
      itemType: 'Inventory',
      itemId: i.id,
      vehicleId: '',
      vehicleName: '',
    }))
    setDropdownOpen(false)
  }

  // Handle clicking custom text option
  const selectCustom = () => {
    setForm((prev) => ({
      ...prev,
      itemType: 'Custom',
      itemId: '',
      vehicleId: '',
      vehicleName: '',
    }))
    setDropdownOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const payload = {
      item: form.item.trim(),
      itemType: form.itemType,
      itemId: form.itemId,
      vehicleId: form.vehicleId,
      vehicleName: form.vehicleName,
      date: form.date,
      category: form.itemType === 'Vehicle' ? 'Vehicle Expense' : form.itemType === 'Inventory' ? 'Inventory Expense' : 'General Expense',
      amount: Number(form.amount) || 0,
      description: form.description.trim(),
      createdBy: user?.name || 'Admin',
    }

    const validation = expenseSchema.safeParse(payload)
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
      result = await updateExpense(initialData.id, payload)
    } else {
      result = await addExpense(payload)
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
      title={initialData ? 'Edit Expense' : 'Log Expense'}
      description={initialData ? 'Update expense transaction record.' : 'Record a new expense for vehicles, inventory items, or custom expenses.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense'}
      onSubmit={handleSubmit}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        {/* Smooth Autocomplete Item Field */}
        <FormField
          label="Item (Select Vehicle/Inventory or type Custom Item)"
          htmlFor="exp-item"
          required
          error={errors.item}
        >
          <div className="relative" ref={containerRef}>
            <Input
              id="exp-item"
              type="text"
              placeholder="Type or select: e.g. Volvo FH16, Brake Pads, Keyboard, Fuel Can..."
              value={form.item}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setDropdownOpen(true)}
              disabled={isSubmitting}
              autoComplete="off"
            />

            {/* Suggestions Dropdown */}
            {dropdownOpen && (
              <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
                {/* Vehicles Group */}
                {filteredVehicles.length > 0 && (
                  <div className="p-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Truck className="size-3 text-blue-500" /> Vehicles
                    </div>
                    {filteredVehicles.map((v) => (
                      <button
                        key={`v-${v.id}`}
                        type="button"
                        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => selectVehicle(v)}
                      >
                        <span className="font-medium">{v.name}</span>
                        <span className="text-[10px] text-muted-foreground">{v.id} · {v.plateNumber}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Inventory Group */}
                {filteredInventory.length > 0 && (
                  <div className="p-1 border-t border-border/50">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Boxes className="size-3 text-purple-500" /> Inventory Parts
                    </div>
                    {filteredInventory.map((i) => (
                      <button
                        key={`i-${i.id}`}
                        type="button"
                        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => selectInventory(i)}
                      >
                        <span className="font-medium">{i.name}</span>
                        <span className="text-[10px] text-muted-foreground">{i.code}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Option */}
                {form.item.trim() !== '' && (
                  <div className="p-1 border-t border-border/50">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-accent transition-colors font-medium"
                      onClick={selectCustom}
                    >
                      <Plus className="size-3.5" />
                      Use &quot;{form.item}&quot; as Custom Item
                    </button>
                  </div>
                )}

                {filteredVehicles.length === 0 && filteredInventory.length === 0 && !form.item.trim() && (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    Start typing to see vehicles, inventory items, or add custom expenses.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Item Type Badge */}
          {form.item && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Type:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  form.itemType === 'Vehicle'
                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    : form.itemType === 'Inventory'
                    ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}
              >
                {form.itemType}
              </span>
            </div>
          )}
        </FormField>

        <FormGrid cols={2}>
          <FormField label="Date" htmlFor="exp-date" required error={errors.date}>
            <Input
              id="exp-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Amount ($)" htmlFor="exp-amount" required error={errors.amount}>
            <Input
              id="exp-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              disabled={isSubmitting}
            />
          </FormField>
        </FormGrid>

        <FormField label="Description (Optional)" htmlFor="exp-description" error={errors.description}>
          <Textarea
            id="exp-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Add details, invoice notes, or receipt memo..."
            disabled={isSubmitting}
          />
        </FormField>
      </div>
    </FormDialog>
  )
}
