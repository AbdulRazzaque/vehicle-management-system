import { NextRequest, NextResponse } from 'next/server'
import { getAllVehicles, createVehicle } from '@/services/vehicleService'
import { vehicleSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-backend'
import { checkAndGenerateRegistrationExpiryNotifications } from '@/lib/notifications-backend'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    checkAndGenerateRegistrationExpiryNotifications().catch(() => {})

    const vehicles = await getAllVehicles()
    return NextResponse.json({ success: true, message: 'Vehicles retrieved successfully', data: vehicles }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const body = await req.json()
    const validatedData = vehicleSchema.parse(body)
    const newVehicle = await createVehicle(validatedData)

    await createAuditLog({
      action: `Created vehicle ${newVehicle.name} (${newVehicle.plateNumber})`,
      entity: newVehicle.id,
      user: user.name,
      role: user.role,
      type: 'Create',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Vehicle created successfully', data: newVehicle }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    if (error.code === 11000 || error.message?.includes('already exists')) {
      const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'plate number'
      return NextResponse.json({ success: false, error: error.message || `Vehicle with this ${field} already exists.` }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to create vehicle' }, { status: 500 })
  }
}
