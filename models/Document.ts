import mongoose, { Schema, Document, Model } from 'mongoose'
import type { FleetDocument } from '@/lib/data'

export interface IFleetDocument extends Document {
  id: string
  name: string
  type: FleetDocument['type']
  vehicle: string
  size: string
  uploadedBy: string
  date: string
  createdAt?: Date
  updatedAt?: Date
}

const DocumentSchema = new Schema<IFleetDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'Registration',
        'Insurance',
        'Maintenance Invoice',
        'Repair Invoice',
        'Purchase Invoice',
        'Vehicle Image',
      ],
      required: true,
    },
    vehicle: { type: String, required: true },
    size: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    date: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

export const DocumentModel: Model<IFleetDocument> =
  mongoose.models.Document || mongoose.model<IFleetDocument>('Document', DocumentSchema)
