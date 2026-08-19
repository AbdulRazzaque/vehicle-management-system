import { dbConnect } from '@/lib/db/connect'
import { AuditLogModel, type IAuditLog } from '@/models/AuditLog'
import { nextId } from '@/lib/form-utils'

export async function getAllAuditLogs(): Promise<IAuditLog[]> {
  await dbConnect()
  return AuditLogModel.find({}).sort({ createdAt: -1 }).lean() as unknown as IAuditLog[]
}

export async function createAuditLog(data: Partial<IAuditLog>): Promise<IAuditLog> {
  await dbConnect()
  if (!data.id) {
    const existingLogs = await AuditLogModel.find({}, { id: 1 }).sort({ createdAt: -1 }).limit(50).lean()
    const existingIds = existingLogs.map((l) => l.id)
    data.id = nextId('L', existingIds)
  }
  if (!data.timestamp) {
    data.timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16)
  }
  const log = await AuditLogModel.create(data)
  return log.toObject()
}
