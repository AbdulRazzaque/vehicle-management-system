import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IExpense extends Document {
  id: string
  vehicleId: string
  vehicleName: string
  date: string
  category: string
  amount: number
  description: string
  createdAt?: Date
  updatedAt?: Date
}

const ExpenseSchema = new Schema<IExpense>(
  {
    id: { type: String, required: true, unique: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    vehicleName: { type: String, required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

export const ExpenseModel: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema)
