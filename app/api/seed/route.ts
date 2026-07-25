import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db/connect'
import { VehicleModel } from '@/models/Vehicle'
import { MaintenanceModel } from '@/models/Maintenance'
import { RepairModel } from '@/models/Repair'
import { InventoryModel } from '@/models/Inventory'
import { ExpenseModel } from '@/models/Expense'
import { UserModel } from '@/models/User'
import { DocumentModel } from '@/models/Document'
import { AuditLogModel } from '@/models/AuditLog'
import {
  vehicles as seedVehicles,
  maintenance as seedMaintenance,
  repairs as seedRepairs,
  inventory as seedInventory,
  expenses as seedExpenses,
  systemUsers as seedUsers,
  documents as seedDocuments,
  auditLogs as seedAuditLogs,
} from '@/lib/data'

export async function POST() {
  try {
    await dbConnect()

    const vehicleCount = await VehicleModel.countDocuments()
    if (vehicleCount === 0) {
      await VehicleModel.insertMany(seedVehicles)
    }

    const maintCount = await MaintenanceModel.countDocuments()
    if (maintCount === 0) {
      await MaintenanceModel.insertMany(seedMaintenance)
    }

    const repairCount = await RepairModel.countDocuments()
    if (repairCount === 0) {
      await RepairModel.insertMany(seedRepairs)
    }

    const invCount = await InventoryModel.countDocuments()
    if (invCount === 0) {
      await InventoryModel.insertMany(seedInventory)
    }

    const expCount = await ExpenseModel.countDocuments()
    if (expCount === 0) {
      await ExpenseModel.insertMany(seedExpenses)
    }

    const userCount = await UserModel.countDocuments()
    if (userCount === 0) {
      await UserModel.insertMany(seedUsers)
    }

    const docCount = await DocumentModel.countDocuments()
    if (docCount === 0) {
      await DocumentModel.insertMany(seedDocuments)
    }

    const auditCount = await AuditLogModel.countDocuments()
    if (auditCount === 0) {
      await AuditLogModel.insertMany(seedAuditLogs)
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully', data: null }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed database' },
      { status: 500 }
    )
  }
}
