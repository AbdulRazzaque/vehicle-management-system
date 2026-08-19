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
  registrationExpiry: z.string().optional().default(''),
  department: z.string().min(1, 'Department is required'),
  notes: z.string().optional().default(''),
  createdBy: z.string().optional().default('Daniel Okoro (Admin)'),
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
  vendor: z.string().optional().default(''),
  odometer: z.number().nonnegative().optional().default(0),
  description: z.string().optional().default(''),
  nextDate: z.string().optional().default(''),
  status: z.enum(['Scheduled', 'In Progress', 'Completed']).default('Scheduled'),
  items: z.array(maintenanceItemSchema).optional().default([]),
  cost: z.number().nonnegative().optional().default(0),
  createdBy: z.string().optional().default('Daniel Okoro (Admin)'),
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
  description: z.string().optional().default(''),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  status: z.enum(['Scheduled', 'In Progress', 'Completed']).default('Scheduled'),
  items: z.array(repairItemSchema).optional().default([]),
  cost: z.number().nonnegative().optional().default(0),
  createdBy: z.string().optional().default('Daniel Okoro (Admin)'),
})

export const inventorySchema = z.object({
  code: z.string().optional().default(''),
  name: z.string().min(1, 'Item Name is required'),
  category: z.string().optional().default(''),
  brand: z.string().optional().default(''),
  unit: z.string().min(1, 'Unit is required'),
  purchasePrice: z.number().nonnegative('Purchase Price cannot be negative'),
  usagePrice: z.number().nonnegative().optional().default(0),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  minStock: z.number().int().nonnegative().optional().default(0),
  supplier: z.string().optional().default(''),
  location: z.string().optional().default(''),
  createdBy: z.string().optional().default('Aisha Bello (User)'),
})

export const expenseSchema = z.object({
  item: z.string().min(1, 'Item is required'),
  itemType: z.enum(['Vehicle', 'Inventory', 'Custom']).default('Custom'),
  itemId: z.string().optional().default(''),
  vehicleId: z.string().optional().default(''),
  vehicleName: z.string().optional().default(''),
  date: z.string().min(1, 'Date is required'),
  category: z.string().optional().default(''),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional().default(''),
  paymentMethod: z.string().optional().default('Cash'),
  createdBy: z.string().optional().default('Admin'),
})

export const userSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Admin', 'User']).default('User'),
  department: z.string().min(1, 'Department is required'),
  status: z.enum(['Active', 'Suspended']).default('Active'),
  lastActive: z.string().optional().default('Just now'),
  password: z.string().optional().default('password123'),
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
