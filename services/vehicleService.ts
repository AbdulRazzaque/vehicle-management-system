import { dbConnect } from '@/lib/db/connect'
import { VehicleModel, type IVehicle } from '@/models/Vehicle'
import { nextId } from '@/lib/form-utils'

export async function getAllVehicles(): Promise<IVehicle[]> {
  await dbConnect()
  return VehicleModel.find({}).sort({ createdAt: -1 }).lean() as unknown as IVehicle[]
}

export async function getVehicleById(id: string): Promise<IVehicle | null> {
  await dbConnect()
  return VehicleModel.findOne({ id }).lean() as unknown as IVehicle | null
}

export async function createVehicle(data: Partial<IVehicle>): Promise<IVehicle> {
  await dbConnect()
  if (data.plateNumber) {
    const existing = await VehicleModel.findOne({ plateNumber: data.plateNumber })
    if (existing) {
      throw new Error(`Vehicle with plate number '${data.plateNumber}' already exists`)
    }
  }
  if (!data.id) {
    const existingVehicles = await VehicleModel.find({}, { id: 1 }).sort({ createdAt: -1 }).limit(50).lean()
    const existingIds = existingVehicles.map((v) => v.id)
    data.id = nextId('VH', existingIds)
  }
  const vehicle = await VehicleModel.create(data)
  return vehicle.toObject()
}

export async function updateVehicle(id: string, data: Partial<IVehicle>): Promise<IVehicle | null> {
  await dbConnect()
  if (data.plateNumber) {
    const existing = await VehicleModel.findOne({ plateNumber: data.plateNumber, id: { $ne: id } })
    if (existing) {
      throw new Error(`Vehicle with plate number '${data.plateNumber}' already exists`)
    }
  }
  const updated = await VehicleModel.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean()
  return updated as unknown as IVehicle | null
}

export async function deleteVehicle(id: string): Promise<boolean> {
  await dbConnect()
  const res = await VehicleModel.deleteOne({ id })
  return res.deletedCount > 0
}
