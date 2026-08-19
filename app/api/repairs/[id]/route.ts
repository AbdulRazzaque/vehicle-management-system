import { NextRequest, NextResponse } from 'next/server'
import { getRepairById, updateRepair, deleteRepair } from '@/services/repairService'
import { repairSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-backend'
import { ZodError } from 'zod'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const record = await getRepairById(id)
    if (!record) {
      return NextResponse.json({ success: false, error: 'Repair record not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Repair record retrieved', data: record }, { status: 200 })
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

    if (user.role === 'User') {
      const existing = await getRepairById(id)
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Repair record not found' }, { status: 404 })
      }

      if (body.status === 'Completed') {
        return forbiddenResponse('Users are not authorized to complete repair records')
      }

      if (body.cost !== undefined && Number(body.cost) !== (existing.cost ?? 0)) {
        return forbiddenResponse('Users are not authorized to update the cost value')
      }
    }

    const validatedData = repairSchema.partial().parse(body)
    const updated = await updateRepair(id, validatedData)

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Repair record not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Updated repair record ${updated.id} (${updated.vehicleName})`,
      entity: updated.id,
      user: user.name,
      role: user.role,
      type: 'Update',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Repair record updated successfully', data: updated }, { status: 200 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to update repair record' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== 'Admin') return forbiddenResponse('Only Admins can delete repair records')

    const { id } = await params
    const deleted = await deleteRepair(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Repair record not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Deleted repair record ${id}`,
      entity: id,
      user: user.name,
      role: user.role,
      type: 'Delete',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Repair record deleted successfully', data: null }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
