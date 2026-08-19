import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMaintenanceItem {
  name: string
  quantity: number
  unitPrice: number
}

export interface IMaintenance extends Document {
  id: string
  vehicleId: string
  vehicleName: string
  date: string
  type: string
  vendor: string
  odometer: number
  description: string
  nextDate: string
  status: 'Scheduled' | 'In Progress' | 'Completed'
  items: IMaintenanceItem[]
  cost?: number
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

const MaintenanceItemSchema = new Schema<IMaintenanceItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
)

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    id: { type: String, required: true, unique: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    vehicleName: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
    vendor: { type: String, default: '' },
    odometer: { type: Number, default: 0 },
    description: { type: String, default: '' },
    nextDate: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Scheduled',
    },
    items: { type: [MaintenanceItemSchema], default: [] },
    cost: { type: Number, default: 0 },
    createdBy: { type: String, default: 'Daniel Okoro (Admin)' },
  },
  {
    timestamps: true,
  }
)

if (mongoose.models.Maintenance) {
  delete (mongoose.models as any).Maintenance
}

export const MaintenanceModel: Model<IMaintenance> =
  mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema)
