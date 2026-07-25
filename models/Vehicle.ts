import mongoose, { Schema, Document, Model } from 'mongoose'
import type { VehicleStatus } from '@/lib/data'

export interface IVehicle extends Document {
  id: string
  name: string
  model: string
  modelNumber: string
  plateNumber: string
  registrationNumber: string
  year: number
  color: string
  chassisNumber: string
  engineNumber: string
  type: string
  fuelType: string
  insurer: string
  insuranceExpiry: string
  registrationExpiry: string
  department: string
  driver: string
  status: VehicleStatus
  odometer: number
  notes: string
  createdAt?: Date
  updatedAt?: Date
}

const VehicleSchema = new Schema<IVehicle>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    model: { type: String, required: true },
    modelNumber: { type: String, default: '' },
    plateNumber: { type: String, required: true, unique: true, index: true },
    registrationNumber: { type: String, default: '' },
    year: { type: Number, required: true },
    color: { type: String, default: '' },
    chassisNumber: { type: String, default: '' },
    engineNumber: { type: String, default: '' },
    type: { type: String, required: true },
    fuelType: { type: String, required: true },
    insurer: { type: String, default: '' },
    insuranceExpiry: { type: String, default: '' },
    registrationExpiry: { type: String, default: '' },
    department: { type: String, required: true },
    driver: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Repair', 'Inactive'],
      default: 'Active',
    },
    odometer: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
)

export const VehicleModel: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema)
