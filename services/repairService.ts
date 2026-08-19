import { dbConnect } from '@/lib/db/connect'
import { RepairModel, type IRepair } from '@/models/Repair'
import { nextId } from '@/lib/form-utils'

export async function getAllRepairs(): Promise<IRepair[]> {
  await dbConnect()
  return RepairModel.find({}).sort({ createdAt: -1 }).lean() as unknown as IRepair[]
}

export async function getRepairById(id: string): Promise<IRepair | null> {
  await dbConnect()
  return RepairModel.findOne({ id }).lean() as unknown as IRepair | null
}

export async function createRepair(data: Partial<IRepair>): Promise<IRepair> {
  await dbConnect()
  if (!data.id) {
    const existingRecords = await RepairModel.find({}, { id: 1 }).sort({ createdAt: -1 }).limit(50).lean()
    const existingIds = existingRecords.map((r) => r.id)
    data.id = nextId('RPR', existingIds)
  }
  const record = await RepairModel.create(data)
  return record.toObject()
}

export async function updateRepair(id: string, data: Partial<IRepair>): Promise<IRepair | null> {
  await dbConnect()
  const updated = await RepairModel.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean()
  return updated as unknown as IRepair | null
}

export async function deleteRepair(id: string): Promise<boolean> {
  await dbConnect()
  const res = await RepairModel.deleteOne({ id })
  return res.deletedCount > 0
}
