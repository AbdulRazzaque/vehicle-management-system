import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, createUser } from '@/services/userService'
import { userSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const list = await getAllUsers()
    return NextResponse.json({ success: true, message: 'Users retrieved', data: list }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = userSchema.parse(body)
    const newUser = await createUser(validatedData)

    await createAuditLog({
      action: `Invited user ${newUser.name} (${newUser.email})`,
      entity: newUser.id,
      user: 'Admin',
      role: 'Admin',
      type: 'Create',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'User invited successfully', data: newUser }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    if (error.code === 11000 || error.message?.includes('already exists')) {
      return NextResponse.json({ success: false, error: error.message || 'User email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to invite user' }, { status: 500 })
  }
}
