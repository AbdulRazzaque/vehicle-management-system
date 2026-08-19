import { NextRequest, NextResponse } from 'next/server'
import { getVehicleById, updateVehicle, deleteVehicle } from '@/services/vehicleService'
import { vehicleSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-backend'
import { dismissVehicleRegistrationNotifications } from '@/lib/notifications-backend'
import { ZodError } from 'zod'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const vehicle = await getVehicleById(id)
    if (!vehicle) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Vehicle retrieved', data: vehicle }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const body = await req.json()
    const validatedData = vehicleSchema.partial().parse(body)
    const updated = await updateVehicle(id, validatedData)

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 })
    }

    dismissVehicleRegistrationNotifications(id).catch(() => {})

    await createAuditLog({
      action: `Updated vehicle ${updated.name} (${updated.plateNumber})`,
      entity: updated.id,
      user: user.name,
      role: user.role,
      type: 'Update',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Vehicle updated successfully', data: updated }, { status: 200 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    if (error.code === 11000 || error.message?.includes('already exists')) {
      return NextResponse.json({ success: false, error: error.message || 'Vehicle plate number already exists.' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to update vehicle' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== 'Admin') return forbiddenResponse('Only Admins can delete vehicles')

    const { id } = await params
    const vehicle = await getVehicleById(id)
    const deleted = await deleteVehicle(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Deleted vehicle ${vehicle?.name || id}`,
      entity: id,
      user: user.name,
      role: user.role,
      type: 'Delete',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Vehicle deleted successfully', data: null }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
