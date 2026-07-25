import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRepairItem {
  name: string
  quantity: number
  unitCost: number
}

export interface IRepair extends Document {
  id: string
  vehicleId: string
  vehicleName: string
  date: string
  type: string
  workshop: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Completed'
  items: IRepairItem[]
  createdAt?: Date
  updatedAt?: Date
}

const RepairItemSchema = new Schema<IRepairItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
  },
  { _id: false }
)

const RepairSchema = new Schema<IRepair>(
  {
    id: { type: String, required: true, unique: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    vehicleName: { type: String, required: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
    workshop: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed'],
      default: 'Open',
    },
    items: { type: [RepairItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
)

export const RepairModel: Model<IRepair> =
  mongoose.models.Repair || mongoose.model<IRepair>('Repair', RepairSchema)
