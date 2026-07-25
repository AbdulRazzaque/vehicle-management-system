import { dbConnect } from '@/lib/db/connect'
import { MaintenanceModel, type IMaintenance } from '@/models/Maintenance'
import { nextId } from '@/lib/form-utils'

export async function getAllMaintenance(): Promise<IMaintenance[]> {
  await dbConnect()
  return MaintenanceModel.find({}).sort({ createdAt: -1 }).lean() as unknown as IMaintenance[]
}

export async function getMaintenanceById(id: string): Promise<IMaintenance | null> {
  await dbConnect()
  return MaintenanceModel.findOne({ id }).lean() as unknown as IMaintenance | null
}

export async function createMaintenance(data: Partial<IMaintenance>): Promise<IMaintenance> {
  await dbConnect()
  if (!data.id) {
    const existingRecords = await MaintenanceModel.find({}, { id: 1 }).lean()
    const existingIds = existingRecords.map((m) => m.id)
    data.id = nextId('MNT', existingIds)
  }
  const record = await MaintenanceModel.create(data)
  return record.toObject()
}

export async function updateMaintenance(id: string, data: Partial<IMaintenance>): Promise<IMaintenance | null> {
  await dbConnect()
  const updated = await MaintenanceModel.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean()
  return updated as unknown as IMaintenance | null
}

export async function deleteMaintenance(id: string): Promise<boolean> {
  await dbConnect()
  const res = await MaintenanceModel.deleteOne({ id })
  return res.deletedCount > 0
}
