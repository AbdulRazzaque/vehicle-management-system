import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IExpense extends Document {
  id: string
  item: string
  itemType: 'Vehicle' | 'Inventory' | 'Custom'
  itemId?: string
  vehicleId?: string
  vehicleName?: string
  date: string
  category?: string
  amount: number
  description?: string
  paymentMethod?: string
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

const ExpenseSchema = new Schema<IExpense>(
  {
    id: { type: String, required: true, unique: true, index: true },
    item: { type: String, required: true },
    itemType: { type: String, enum: ['Vehicle', 'Inventory', 'Custom'], default: 'Custom' },
    itemId: { type: String, default: '' },
    vehicleId: { type: String, default: '' },
    vehicleName: { type: String, default: '' },
    date: { type: String, required: true },
    category: { type: String, default: '' },
    amount: { type: Number, required: true, default: 0 },
    description: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Cash' },
    createdBy: { type: String, default: 'Admin' },
  },
  {
    timestamps: true,
  }
)

if (mongoose.models.Expense) {
  delete (mongoose.models as any).Expense
}

export const ExpenseModel: Model<IExpense> =
  mongoose.model<IExpense>('Expense', ExpenseSchema)

