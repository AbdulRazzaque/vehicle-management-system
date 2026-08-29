import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAllUsers, createUser } from '@/services/userService'
import { createUserSchema } from '@/lib/validation/schemas'
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
    const requester = await getAuthenticatedUser()

    // Requester authorization check (except for initial system bootstrapping when count === 0)
    if (userCount > 0) {
      if (!requester) {
        return unauthorizedResponse()
      }
      if (requester.role !== 'Admin') {
        return forbiddenResponse('Only Admins can create users')
      }
    }

    const requesterName = requester?.name || 'Registration System'
    const requesterRole = requester?.role || 'User'

    const body = await req.json()

    // If this is the first user in the database, force the role to Admin
    if (userCount === 0) {
      body.role = 'Admin'
    }

    const validatedData = createUserSchema.parse(body)

    // Check duplicate username
    const existing = await UserModel.findOne({ username: validatedData.username.toLowerCase() })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Username already exists.' }, { status: 409 })
    }

    // Securely hash password using bcrypt
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    const userPayload = {
      ...validatedData,
      username: validatedData.username.toLowerCase(),
      password: hashedPassword,
    }
    delete (userPayload as any).confirmPassword

    const newUser = await createUser(userPayload)

    await createAuditLog({
      action: userCount === 0
        ? `Bootstrapped first Admin user ${newUser.name} (@${newUser.username})`
        : `Created user ${newUser.name} (@${newUser.username})`,
      entity: newUser.id,
      user: requesterName,
      role: requesterRole,
      type: 'Create',
    }).catch(() => {})

    // Omit hashed password from response data
    const safeUser = { ...newUser }
    delete safeUser.password

    return NextResponse.json({ success: true, message: 'User created successfully', data: safeUser }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    if (error.code === 11000 || error.message?.includes('already exists')) {
      return NextResponse.json({ success: false, error: 'Username already exists.' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to create user' }, { status: 500 })
  }
}

