import { dbConnect } from '@/lib/db/connect'
import { DocumentModel, type IFleetDocument } from '@/models/Document'
import { nextId } from '@/lib/form-utils'

export async function getAllDocuments(): Promise<IFleetDocument[]> {
  await dbConnect()
  return DocumentModel.find({}).sort({ createdAt: -1 }).lean() as unknown as IFleetDocument[]
}

export async function getDocumentById(id: string): Promise<IFleetDocument | null> {
  await dbConnect()
  return DocumentModel.findOne({ id }).lean() as unknown as IFleetDocument | null
}

export async function createDocument(data: Partial<IFleetDocument>): Promise<IFleetDocument> {
  await dbConnect()
  if (!data.id) {
    const existingDocs = await DocumentModel.find({}, { id: 1 }).lean()
    const existingIds = existingDocs.map((d) => d.id)
    data.id = nextId('D', existingIds)
  }
  const doc = await DocumentModel.create(data)
  return doc.toObject()
}

export async function updateDocument(id: string, data: Partial<IFleetDocument>): Promise<IFleetDocument | null> {
  await dbConnect()
  const updated = await DocumentModel.findOneAndUpdate({ id }, { $set: data }, { new: true }).lean()
  return updated as unknown as IFleetDocument | null
}

export async function deleteDocument(id: string): Promise<boolean> {
  await dbConnect()
  const res = await DocumentModel.deleteOne({ id })
  return res.deletedCount > 0
}
