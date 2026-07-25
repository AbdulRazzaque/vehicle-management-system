import { z } from 'zod'

export const vehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle Name is required'),
  model: z.string().min(1, 'Model is required'),
  modelNumber: z.string().optional().default(''),
  plateNumber: z.string().min(1, 'Plate Number is required'),
  registrationNumber: z.string().optional().default(''),
  year: z.number().int().min(1900).max(2100),
  color: z.string().optional().default(''),
  chassisNumber: z.string().optional().default(''),
  engineNumber: z.string().optional().default(''),
  type: z.string().min(1, 'Vehicle Type is required'),
  fuelType: z.string().min(1, 'Fuel Type is required'),
  insurer: z.string().optional().default(''),
  insuranceExpiry: z.string().optional().default(''),
  registrationExpiry: z.string().optional().default(''),
  department: z.string().min(1, 'Department is required'),
  driver: z.string().min(1, 'Driver is required'),
  status: z.enum(['Active', 'Maintenance', 'Repair', 'Inactive']).default('Active'),
  odometer: z.number().nonnegative().default(0),
  notes: z.string().optional().default(''),
})

export const maintenanceItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
})

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  vehicleName: z.string().min(1, 'Vehicle Name is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Maintenance Type is required'),
  vendor: z.string().min(1, 'Vendor is required'),
  odometer: z.number().nonnegative().default(0),
  description: z.string().min(1, 'Description is required'),
  nextDate: z.string().optional().default(''),
  status: z.enum(['Scheduled', 'In Progress', 'Completed']).default('Scheduled'),
  items: z.array(maintenanceItemSchema).optional().default([]),
})

export const repairItemSchema = z.object({
  name: z.string().min(1, 'Part/Item name is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitCost: z.number().nonnegative('Unit cost cannot be negative'),
})

export const repairSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  vehicleName: z.string().min(1, 'Vehicle Name is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Repair Type is required'),
  workshop: z.string().min(1, 'Workshop is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  status: z.enum(['Open', 'In Progress', 'Completed']).default('Open'),
  items: z.array(repairItemSchema).optional().default([]),
})

export const inventorySchema = z.object({
  code: z.string().min(1, 'Item Code is required'),
  name: z.string().min(1, 'Item Name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  unit: z.string().min(1, 'Unit is required'),
  purchasePrice: z.number().nonnegative('Purchase Price cannot be negative'),
  usagePrice: z.number().nonnegative('Usage Price cannot be negative'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  minStock: z.number().int().nonnegative('Minimum Stock cannot be negative'),
  supplier: z.string().min(1, 'Supplier is required'),
  location: z.string().min(1, 'Location is required'),
})

export const expenseSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  vehicleName: z.string().min(1, 'Vehicle Name is required'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
})

export const userSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Admin', 'Viewer']).default('Viewer'),
  department: z.string().min(1, 'Department is required'),
  status: z.enum(['Active', 'Suspended']).default('Active'),
  lastActive: z.string().optional().default('Just now'),
})

export const documentSchema = z.object({
  name: z.string().min(1, 'Document Name is required'),
  type: z.enum([
    'Registration',
    'Insurance',
    'Maintenance Invoice',
    'Repair Invoice',
    'Purchase Invoice',
    'Vehicle Image',
  ]),
  vehicle: z.string().min(1, 'Vehicle is required'),
  size: z.string().min(1, 'File Size is required'),
  uploadedBy: z.string().default('System User'),
  date: z.string().min(1, 'Date is required'),
})

export const auditLogSchema = z.object({
  action: z.string().min(1, 'Action description is required'),
  entity: z.string().min(1, 'Entity is required'),
  user: z.string().min(1, 'User is required'),
  role: z.string().min(1, 'Role is required'),
  timestamp: z.string().min(1, 'Timestamp is required'),
  type: z.enum(['Create', 'Update', 'Delete', 'Login', 'Export']),
})
