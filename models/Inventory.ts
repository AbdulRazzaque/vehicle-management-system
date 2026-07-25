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
  createdAt?: Date
  updatedAt?: Date
}

const InventorySchema = new Schema<IInventoryItem>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    unit: { type: String, required: true },
    purchasePrice: { type: Number, required: true, default: 0 },
    usagePrice: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    minStock: { type: Number, required: true, default: 0 },
    supplier: { type: String, required: true },
    location: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

export const InventoryModel: Model<IInventoryItem> =
  mongoose.models.Inventory || mongoose.model<IInventoryItem>('Inventory', InventorySchema)
