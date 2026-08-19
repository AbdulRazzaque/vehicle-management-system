import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser, deleteUser } from '@/services/userService'
import { userSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-backend'
import { ZodError } from 'zod'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getAuthenticatedUser()
    if (!requester) return unauthorizedResponse()
    if (requester.role !== 'Admin') return forbiddenResponse('Only Admins can view users details')

    const { id } = await params
    const user = await getUserById(id)
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'User retrieved', data: user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getAuthenticatedUser()
    if (!requester) return unauthorizedResponse()
    if (requester.role !== 'Admin') return forbiddenResponse('Only Admins can update users')

    const { id } = await params
    const body = await req.json()
    const validatedData = userSchema.partial().parse(body)
    const updated = await updateUser(id, validatedData)

    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Updated user ${updated.name} (${updated.email})`,
      entity: updated.id,
      user: requester.name,
      role: requester.role,
      type: 'Update',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'User updated successfully', data: updated }, { status: 200 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    if (error.code === 11000 || error.message?.includes('already exists')) {
      return NextResponse.json({ success: false, error: error.message || 'User email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getAuthenticatedUser()
    if (!requester) return unauthorizedResponse()
    if (requester.role !== 'Admin') return forbiddenResponse('Only Admins can delete users')

    const { id } = await params
    const user = await getUserById(id)
    const deleted = await deleteUser(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Deleted user ${user?.name || id}`,
      entity: id,
      user: requester.name,
      role: requester.role,
      type: 'Delete',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'User deleted successfully', data: null }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
