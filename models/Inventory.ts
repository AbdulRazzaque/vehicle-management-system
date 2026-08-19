import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IInventoryItem extends Document {
  id: string
  code: string
  name: string
  category: string
  brand: string
  unit: string
  purchasePrice: number
  usagePrice: number
  stock: number
  minStock: number
  supplier: string
  location: string
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

const InventorySchema = new Schema<IInventoryItem>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: '' },
    brand: { type: String, default: '' },
    unit: { type: String, required: true },
    purchasePrice: { type: Number, required: true, default: 0 },
    usagePrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    minStock: { type: Number, default: 0 },
    supplier: { type: String, default: '' },
    location: { type: String, default: '' },
    createdBy: { type: String, default: 'Aisha Bello (User)' },
  },
  {
    timestamps: true,
  }
)

if (mongoose.models.Inventory) {
  delete (mongoose.models as any).Inventory
}

export const InventoryModel: Model<IInventoryItem> =
  mongoose.model<IInventoryItem>('Inventory', InventorySchema)
