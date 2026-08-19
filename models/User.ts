import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISystemUser extends Document {
  id: string
  name: string
  email: string
  role: 'Admin' | 'User'
  department: string
  status: 'Active' | 'Suspended'
  lastActive: string
  password?: string
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<ISystemUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' },
    department: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    lastActive: { type: String, default: 'Just now' },
    password: { type: String, default: 'password123' },
  },
  {
    timestamps: true,
  }
)

if (mongoose.models.User) {
  delete (mongoose.models as any).User
}

export const UserModel: Model<ISystemUser> =
  mongoose.model<ISystemUser>('User', UserSchema)
