import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  id: string
  action: string
  entity: string
  user: string
  role: string
  timestamp: string
  type: 'Create' | 'Update' | 'Delete' | 'Login' | 'Export'
  createdAt?: Date
  updatedAt?: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    user: { type: String, required: true },
    role: { type: String, required: true },
    timestamp: { type: String, required: true },
    type: {
      type: String,
      enum: ['Create', 'Update', 'Delete', 'Login', 'Export'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
