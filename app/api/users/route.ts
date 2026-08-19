import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, createUser } from '@/services/userService'
import { userSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-backend'
import { UserModel } from '@/models/User'
import { dbConnect } from '@/lib/db/connect'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()
    if (user.role !== 'Admin') return forbiddenResponse('Only Admins can access users list')

    const list = await getAllUsers()
    return NextResponse.json({ success: true, message: 'Users retrieved', data: list }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const userCount = await UserModel.countDocuments()

    let requesterName = 'Registration System'
    let requesterRole = 'User'

    try {
      const user = await getAuthenticatedUser()
      if (user) {
        requesterName = user.name
        requesterRole = user.role
      }
    } catch {
      // Ignore authentication lookup errors for public registrations
    }

    const body = await req.json()

    // If this is the first user in the database, force the role to Admin
    if (userCount === 0) {
      body.role = 'Admin'
    }

    const validatedData = userSchema.parse(body)
    const newUser = await createUser(validatedData)

    await createAuditLog({
      action: userCount === 0
        ? `Bootstrapped first Admin user ${newUser.name} (${newUser.email})`
        : `Invited user ${newUser.name} (${newUser.email})`,
      entity: newUser.id,
      user: requesterName,
      role: requesterRole,
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
