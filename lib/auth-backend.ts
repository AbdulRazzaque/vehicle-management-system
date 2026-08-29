import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { UserModel } from '@/models/User'
import { dbConnect } from './db/connect'

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies()
    const identifier = cookieStore.get('session')?.value
    if (!identifier) {
      return null
    }
    await dbConnect()
    const lowerIdentifier = identifier.toLowerCase()
    const user = await UserModel.findOne({
      $or: [
        { username: identifier },
        { username: lowerIdentifier },
        { email: identifier },
        { email: lowerIdentifier },
      ],
    }).lean()
    if (!user) {
      return null
    }
    return {
      id: user.id,
      name: user.name,
      username: user.username || user.email || user.name.toLowerCase().replace(/\s+/g, ''),
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error)
    return null
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ success: false, error: 'Unauthorized: Please log in' }, { status: 401 })
}

export function forbiddenResponse(message = 'Forbidden: Access denied') {
  return NextResponse.json({ success: false, error: message }, { status: 403 })
}
