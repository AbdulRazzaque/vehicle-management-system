import mongoose, { Schema, Model } from 'mongoose'

export interface INotification {
  id: string
  category: 'Maintenance Due' | 'Registration Expiry' | 'Insurance Expiry' | 'Low Inventory' | 'Critical Repair'
  title: string
  detail: string
  severity: 'info' | 'warning' | 'critical'
  time: string
  read: boolean
  dismissed: boolean
  vehicleId?: string
  registrationExpiry?: string
  createdAt?: Date
  updatedAt?: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    id: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    severity: { type: String, required: true },
    time: { type: String, default: 'Just now' },
    read: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false },
    vehicleId: { type: String, default: '' },
    registrationExpiry: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
)

if (mongoose.models.Notification) {
  delete (mongoose.models as any).Notification
}

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
