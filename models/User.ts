import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISystemUser extends Document {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Viewer'
  department: string
  status: 'Active' | 'Suspended'
  lastActive: string
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<ISystemUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['Admin', 'Viewer'], default: 'Viewer' },
    department: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    lastActive: { type: String, default: 'Just now' },
  },
  {
    timestamps: true,
  }
)

export const UserModel: Model<ISystemUser> =
  mongoose.models.User || mongoose.model<ISystemUser>('User', UserSchema)
