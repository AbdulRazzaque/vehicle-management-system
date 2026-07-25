'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FormDialog } from '@/components/forms/form-dialog'
import { FormField, FormGrid } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/components/data-provider'
import { useAuth } from '@/components/auth-provider'
import { todayIso } from '@/lib/form-utils'
import type {
  Vehicle,
  VehicleStatus,
  Maintenance,
  Repair,
  InventoryItem,
  Expense,
  FleetDocument,
  SystemUser,
} from '@/lib/data'
import {
  vehicleSchema,
  maintenanceSchema,
  repairSchema,
  inventorySchema,
  expenseSchema,
  userSchema,
  documentSchema,
} from '@/lib/validation/schemas'

type FormProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: T | null
}

function useFormReset<T>(open: boolean, initial: () => T, initialData?: T | null) {
  const [form, setForm] = useState<T>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData)
      } else {
        setForm(initial())
      }
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open, initialData]) // eslint-disable-line react-hooks/exhaustive-deps

  return { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting }
}

function SelectField({
  id,
  value,
  onValueChange,
  placeholder,
  options,
  className,
}: {
  id: string
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: string[]
  className?: string
}) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className ?? 'w-full'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const vehicleStatuses: VehicleStatus[] = ['Active', 'Maintenance', 'Repair', 'Inactive']
const maintenanceStatuses: Maintenance['status'][] = ['Scheduled', 'In Progress', 'Completed']
const repairPriorities: Repair['priority'][] = ['Low', 'Medium', 'High', 'Critical']
const repairStatuses: Repair['status'][] = ['Open', 'In Progress', 'Completed']
const expenseCategories = [
  'Fuel Cost',
  'Maintenance Cost',
  'Repair Cost',
  'Insurance Cost',
  'Registration Cost',
  'Tire Cost',
]
const documentTypes: FleetDocument['type'][] = [
  'Registration',
  'Insurance',
  'Maintenance Invoice',
  'Repair Invoice',
  'Purchase Invoice',
  'Vehicle Image',
]
const userRoles: SystemUser['role'][] = ['Admin', 'Viewer']
const userStatuses: SystemUser['status'][] = ['Active', 'Suspended']

// VEHICLE FORM DIALOG
function emptyVehicleForm() {
  return {
    name: '',
    model: '',
    modelNumber: '',
    plateNumber: '',
    registrationNumber: '',
    year: String(new Date().getFullYear()),
    color: '',
    chassisNumber: '',
    engineNumber: '',
    type: '',
    fuelType: '',
    insurer: '',
    insuranceExpiry: '',
    registrationExpiry: '',
    department: '',
    driver: '',
    status: 'Active' as VehicleStatus,
    odometer: '',
    notes: '',
  }
}

export function VehicleFormDialog({ open, onOpenChange, initialData }: FormProps<Vehicle>) {
  const { addVehicle, updateVehicle } = useData()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyVehicleForm,
    initialData ? { ...initialData, year: String(initialData.year), odometer: String(initialData.odometer) } as any : null
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const payload = {
      name: form.name.trim(),
      model: form.model.trim(),
      modelNumber: form.modelNumber.trim(),
      plateNumber: form.plateNumber.trim(),
      registrationNumber: form.registrationNumber.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      color: form.color.trim(),
      chassisNumber: form.chassisNumber.trim(),
      engineNumber: form.engineNumber.trim(),
      type: form.type.trim(),
      fuelType: form.fuelType.trim(),
      insurer: form.insurer.trim(),
      insuranceExpiry: form.insuranceExpiry || todayIso(),
      registrationExpiry: form.registrationExpiry || todayIso(),
      department: form.department.trim(),
      driver: form.driver.trim(),
      status: form.status,
      odometer: Number(form.odometer) || 0,
      notes: form.notes.trim(),
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
      title={initialData ? 'Edit Vehicle' : 'Add Vehicle'}
      description={initialData ? 'Update vehicle details.' : 'Fill in the vehicle details. Click Save to store in MongoDB.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update Vehicle' : 'Save Vehicle'}
      onSubmit={handleSubmit}
      className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
    >
      <FormGrid cols={2}>
        <FormField label="Vehicle Name" htmlFor="vehicle-name" required error={errors.name}>
          <Input id="vehicle-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Plate Number" htmlFor="vehicle-plate" required error={errors.plateNumber}>
          <Input id="vehicle-plate" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Model" htmlFor="vehicle-model" required error={errors.model}>
          <Input id="vehicle-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Model Number" htmlFor="vehicle-model-number">
          <Input id="vehicle-model-number" value={form.modelNumber} onChange={(e) => setForm({ ...form, modelNumber: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Type" htmlFor="vehicle-type" required error={errors.type}>
          <Input id="vehicle-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Heavy Truck, Van, SUV..." disabled={isSubmitting} />
        </FormField>
        <FormField label="Fuel Type" htmlFor="vehicle-fuel" required error={errors.fuelType}>
          <Input id="vehicle-fuel" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Year" htmlFor="vehicle-year" required error={errors.year}>
          <Input id="vehicle-year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Color" htmlFor="vehicle-color">
          <Input id="vehicle-color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Department" htmlFor="vehicle-department" required error={errors.department}>
          <Input id="vehicle-department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Driver" htmlFor="vehicle-driver" required error={errors.driver}>
          <Input id="vehicle-driver" value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Status" htmlFor="vehicle-status" required>
          <SelectField id="vehicle-status" value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })} placeholder="Select status" options={vehicleStatuses} />
        </FormField>
        <FormField label="Odometer (km)" htmlFor="vehicle-odometer">
          <Input id="vehicle-odometer" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Registration Number" htmlFor="vehicle-registration">
          <Input id="vehicle-registration" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Chassis Number" htmlFor="vehicle-chassis">
          <Input id="vehicle-chassis" value={form.chassisNumber} onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Engine Number" htmlFor="vehicle-engine">
          <Input id="vehicle-engine" value={form.engineNumber} onChange={(e) => setForm({ ...form, engineNumber: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Insurer" htmlFor="vehicle-insurer">
          <Input id="vehicle-insurer" value={form.insurer} onChange={(e) => setForm({ ...form, insurer: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Insurance Expiry" htmlFor="vehicle-insurance-expiry">
          <Input id="vehicle-insurance-expiry" type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Registration Expiry" htmlFor="vehicle-reg-expiry">
          <Input id="vehicle-reg-expiry" type="date" value={form.registrationExpiry} onChange={(e) => setForm({ ...form, registrationExpiry: e.target.value })} disabled={isSubmitting} />
        </FormField>
      </FormGrid>
      <FormField label="Notes" htmlFor="vehicle-notes">
        <Textarea id="vehicle-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} disabled={isSubmitting} />
      </FormField>
    </FormDialog>
  )
}

// MAINTENANCE FORM DIALOG
function emptyMaintenanceForm() {
  return {
    vehicleId: '',
    date: todayIso(),
    type: '',
    vendor: '',
    odometer: '',
    description: '',
    nextDate: '',
    status: 'Scheduled' as Maintenance['status'],
  }
}

export function MaintenanceFormDialog({ open, onOpenChange, initialData }: FormProps<Maintenance>) {
  const { vehicles, addMaintenance, updateMaintenance } = useData()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyMaintenanceForm,
    initialData ? { ...initialData, odometer: String(initialData.odometer) } as any : null
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

    const payload = {
      vehicleId: form.vehicleId,
      vehicleName: vehicle.name,
      date: form.date,
      type: form.type.trim(),
      vendor: form.vendor.trim(),
      odometer: Number(form.odometer) || vehicle.odometer,
      description: form.description.trim(),
      nextDate: form.nextDate || form.date,
      status: form.status,
      items: initialData?.items || [],
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
          <SelectField
            id="maint-vehicle"
            value={form.vehicleId}
            onValueChange={(v) => setForm({ ...form, vehicleId: v })}
            placeholder="Select vehicle"
            options={vehicles.map((v) => v.id)}
          />
        </FormField>
        <FormField label="Service Date" htmlFor="maint-date" required error={errors.date}>
          <Input id="maint-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Next Due Date" htmlFor="maint-next">
          <Input id="maint-next" type="date" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Service Type" htmlFor="maint-type" required error={errors.type}>
          <Input id="maint-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Vendor" htmlFor="maint-vendor" required error={errors.vendor}>
          <Input id="maint-vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Odometer (km)" htmlFor="maint-odometer">
          <Input id="maint-odometer" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Status" htmlFor="maint-status" required>
          <SelectField id="maint-status" value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Maintenance['status'] })} placeholder="Select status" options={maintenanceStatuses} />
        </FormField>
      </FormGrid>
      <FormField label="Description" htmlFor="maint-description" required error={errors.description}>
        <Textarea id="maint-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} disabled={isSubmitting} />
      </FormField>
    </FormDialog>
  )
}

// REPAIR FORM DIALOG
function emptyRepairForm() {
  return {
    vehicleId: '',
    date: todayIso(),
    type: '',
    workshop: '',
    description: '',
    priority: 'Medium' as Repair['priority'],
    status: 'Open' as Repair['status'],
  }
}

export function RepairFormDialog({ open, onOpenChange, initialData }: FormProps<Repair>) {
  const { vehicles, addRepair, updateRepair } = useData()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyRepairForm,
    initialData
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
            options={vehicles.map((v) => v.id)}
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
          <SelectField id="repair-status" value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Repair['status'] })} placeholder="Select status" options={repairStatuses} />
        </FormField>
      </FormGrid>
      <FormField label="Description" htmlFor="repair-description" required error={errors.description}>
        <Textarea id="repair-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} disabled={isSubmitting} />
      </FormField>
    </FormDialog>
  )
}

// INVENTORY FORM DIALOG
function emptyInventoryForm() {
  return {
    code: '',
    name: '',
    category: '',
    brand: '',
    unit: '',
    purchasePrice: '',
    usagePrice: '',
    stock: '',
    minStock: '',
    supplier: '',
    location: '',
  }
}

export function InventoryFormDialog({ open, onOpenChange, initialData }: FormProps<InventoryItem>) {
  const { addInventoryItem, updateInventoryItem } = useData()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyInventoryForm,
    initialData ? {
      ...initialData,
      purchasePrice: String(initialData.purchasePrice),
      usagePrice: String(initialData.usagePrice),
      stock: String(initialData.stock),
      minStock: String(initialData.minStock),
    } as any : null
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      brand: form.brand.trim(),
      unit: form.unit.trim(),
      purchasePrice: Number(form.purchasePrice) || 0,
      usagePrice: Number(form.usagePrice) || 0,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 0,
      supplier: form.supplier.trim(),
      location: form.location.trim(),
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
      <FormGrid cols={2}>
        <FormField label="Item Code" htmlFor="inv-code" required error={errors.code}>
          <Input id="inv-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Item Name" htmlFor="inv-name" required error={errors.name}>
          <Input id="inv-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Category" htmlFor="inv-category" required error={errors.category}>
          <Input id="inv-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Brand" htmlFor="inv-brand" required error={errors.brand}>
          <Input id="inv-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Unit" htmlFor="inv-unit" required error={errors.unit}>
          <Input id="inv-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Piece, Litre, Set..." disabled={isSubmitting} />
        </FormField>
        <FormField label="Location" htmlFor="inv-location" required error={errors.location}>
          <Input id="inv-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Purchase Price" htmlFor="inv-purchase" required error={errors.purchasePrice}>
          <Input id="inv-purchase" type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Usage Price" htmlFor="inv-usage" required error={errors.usagePrice}>
          <Input id="inv-usage" type="number" step="0.01" value={form.usagePrice} onChange={(e) => setForm({ ...form, usagePrice: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Stock" htmlFor="inv-stock" required error={errors.stock}>
          <Input id="inv-stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Minimum Stock" htmlFor="inv-min" required error={errors.minStock}>
          <Input id="inv-min" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Supplier" htmlFor="inv-supplier" required error={errors.supplier} className="sm:col-span-2">
          <Input id="inv-supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} disabled={isSubmitting} />
        </FormField>
      </FormGrid>
    </FormDialog>
  )
}

// EXPENSE FORM DIALOG
function emptyExpenseForm() {
  return {
    vehicleId: '',
    date: todayIso(),
    category: '',
    amount: '',
    description: '',
  }
}

export function ExpenseFormDialog({ open, onOpenChange, initialData }: FormProps<Expense>) {
  const { vehicles, addExpense, updateExpense } = useData()
  const { form, setForm, errors, setErrors, isSubmitting, setIsSubmitting } = useFormReset(
    open,
    emptyExpenseForm,
    initialData ? { ...initialData, amount: String(initialData.amount) } as any : null
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

    const payload = {
      vehicleId: form.vehicleId,
      vehicleName: vehicle.name,
      date: form.date,
      category: form.category,
      amount: Number(form.amount) || 0,
      description: form.description.trim(),
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
      description={initialData ? 'Update expense details.' : 'Record a vehicle-related expense. Saved to MongoDB.'}
      submitLabel={isSubmitting ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense'}
      onSubmit={handleSubmit}
      className="sm:max-w-lg"
    >
      <FormGrid cols={2}>
        <FormField label="Vehicle" htmlFor="exp-vehicle" required error={errors.vehicleId} className="sm:col-span-2">
          <SelectField
            id="exp-vehicle"
            value={form.vehicleId}
            onValueChange={(v) => setForm({ ...form, vehicleId: v })}
            placeholder="Select vehicle"
            options={vehicles.map((v) => v.id)}
          />
        </FormField>
        <FormField label="Date" htmlFor="exp-date" required error={errors.date}>
          <Input id="exp-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} disabled={isSubmitting} />
        </FormField>
        <FormField label="Category" htmlFor="exp-category" required error={errors.category}>
          <SelectField id="exp-category" value={form.category} onValueChange={(v) => setForm({ ...form, category: v })} placeholder="Select category" options={expenseCategories} />
        </FormField>
        <FormField label="Amount" htmlFor="exp-amount" required error={errors.amount}>
          <Input id="exp-amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} disabled={isSubmitting} />
        </FormField>
      </FormGrid>
      <FormField label="Description" htmlFor="exp-description" required error={errors.description}>
        <Textarea id="exp-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} disabled={isSubmitting} />
      </FormField>
    </FormDialog>
  )
}

// USER FORM DIALOG
function emptyUserForm() {
  return {
    name: '',
    email: '',
    role: 'Viewer' as SystemUser['role'],
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

// DOCUMENT FORM DIALOG
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
      uploadedBy: initialData?.uploadedBy || user.name || 'Admin',
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
