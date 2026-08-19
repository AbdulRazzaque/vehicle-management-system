import { NextRequest, NextResponse } from 'next/server'
import { getAllMaintenance, createMaintenance } from '@/services/maintenanceService'
import { maintenanceSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-backend'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const list = await getAllMaintenance()
    return NextResponse.json({ success: true, message: 'Maintenance records retrieved', data: list }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const body = await req.json()

    if (user.role === 'User') {
      if (body.status === 'Completed') {
        return forbiddenResponse('Users are not authorized to create completed maintenance records')
      }
      if (body.cost && Number(body.cost) > 0) {
        return forbiddenResponse('Users are not authorized to set cost values')
      }
    }

    const validatedData = maintenanceSchema.parse(body)
    const newRecord = await createMaintenance(validatedData)

    await createAuditLog({
      action: `Created maintenance record ${newRecord.id} for ${newRecord.vehicleName}`,
      entity: newRecord.id,
      user: user.name,
      role: user.role,
      type: 'Create',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Maintenance record created successfully', data: newRecord }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Maintenance record with this ID already exists.' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to create maintenance record' }, { status: 500 })
  }
}
