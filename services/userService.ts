import { dbConnect } from '@/lib/db/connect'
import { UserModel, type ISystemUser } from '@/models/User'
import { nextId } from '@/lib/form-utils'

export async function getAllUsers(): Promise<ISystemUser[]> {
  await dbConnect()
  return UserModel.find({}).sort({ createdAt: -1 }).lean() as unknown as ISystemUser[]
}

export async function getUserById(id: string): Promise<ISystemUser | null> {
  await dbConnect()
  return UserModel.findOne({ id }).lean() as unknown as ISystemUser | null
}

export async function createUser(data: Partial<ISystemUser>): Promise<ISystemUser> {
  await dbConnect()
  if (data.username) {
    const existing = await UserModel.findOne({ username: data.username.toLowerCase() })
    if (existing) {
      throw new Error(`Username '${data.username}' already exists.`)
    }
  }
  if (!data.id) {
    const existingUsers = await UserModel.find({}, { id: 1 }).lean()
    const existingIds = existingUsers.map((u) => u.id)
    data.id = nextId('U', existingIds)
  }
  const user = await UserModel.create(data)
  return user.toObject()
}

export async function updateUser(id: string, data: Partial<ISystemUser>): Promise<ISystemUser | null> {
  await dbConnect()
  if (data.username) {
    const existing = await UserModel.findOne({ username: data.username.toLowerCase(), id: { $ne: id } })
    if (existing) {
      throw new Error(`Username '${data.username}' already exists.`)
    }
  }
  const updated = await UserModel.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean()
  return updated as unknown as ISystemUser | null
}

export async function deleteUser(id: string): Promise<boolean> {
  await dbConnect()
  const res = await UserModel.deleteOne({ id })
  return res.deletedCount > 0
}
