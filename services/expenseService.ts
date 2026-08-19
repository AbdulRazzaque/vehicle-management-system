import { dbConnect } from '@/lib/db/connect'
import { ExpenseModel, type IExpense } from '@/models/Expense'
import { nextId } from '@/lib/form-utils'

export async function getAllExpenses(): Promise<IExpense[]> {
  await dbConnect()
  return ExpenseModel.find({}).sort({ createdAt: -1 }).lean() as unknown as IExpense[]
}

export async function getExpenseById(id: string): Promise<IExpense | null> {
  await dbConnect()
  return ExpenseModel.findOne({ id }).lean() as unknown as IExpense | null
}

export async function createExpense(data: Partial<IExpense>): Promise<IExpense> {
  await dbConnect()
  if (!data.id) {
    const existingExpenses = await ExpenseModel.find({}, { id: 1 }).sort({ createdAt: -1 }).limit(50).lean()
    const existingIds = existingExpenses.map((e) => e.id)
    data.id = nextId('EXP', existingIds)
  }
  const item = await ExpenseModel.create(data)
  return item.toObject()
}

export async function updateExpense(id: string, data: Partial<IExpense>): Promise<IExpense | null> {
  await dbConnect()
  const updated = await ExpenseModel.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean()
  return updated as unknown as IExpense | null
}

export async function deleteExpense(id: string): Promise<boolean> {
  await dbConnect()
  const res = await ExpenseModel.deleteOne({ id })
  return res.deletedCount > 0
}
