import { dbConnect } from '@/lib/db/connect'
import { InventoryModel, type IInventoryItem } from '@/models/Inventory'
import { nextId } from '@/lib/form-utils'

export async function getAllInventory(): Promise<IInventoryItem[]> {
  await dbConnect()
  return InventoryModel.find({}).sort({ createdAt: -1 }).lean() as unknown as IInventoryItem[]
}

export async function getInventoryById(id: string): Promise<IInventoryItem | null> {
  await dbConnect()
  return InventoryModel.findOne({ id }).lean() as unknown as IInventoryItem | null
}

export async function createInventoryItem(data: Partial<IInventoryItem>): Promise<IInventoryItem> {
  await dbConnect()
  const existingItems = await InventoryModel.find({}, { id: 1, code: 1 }).sort({ createdAt: -1 }).limit(50).lean()

  // Auto-generate id
  if (!data.id) {
    const existingIds = existingItems.map((i) => i.id)
    data.id = nextId('INV', existingIds)
  }

  // Auto-generate code (ITEM-01, ITEM-02, …)
  if (!data.code) {
    const existingCodes = existingItems.map((i) => i.code).filter(Boolean)
    data.code = nextId('ITEM', existingCodes)
  } else {
    const existing = await InventoryModel.findOne({ code: data.code })
    if (existing) {
      throw new Error(`Inventory item with code '${data.code}' already exists`)
    }
  }

  const item = await InventoryModel.create(data)
  return item.toObject()
}

export async function updateInventoryItem(id: string, data: Partial<IInventoryItem>): Promise<IInventoryItem | null> {
  await dbConnect()
  if (data.code) {
    const existing = await InventoryModel.findOne({ code: data.code, id: { $ne: id } })
    if (existing) {
      throw new Error(`Inventory item with code '${data.code}' already exists`)
    }
  }
  const updated = await InventoryModel.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean()
  return updated as unknown as IInventoryItem | null
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  await dbConnect()
  const res = await InventoryModel.deleteOne({ id })
  return res.deletedCount > 0
}
