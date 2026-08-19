import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { UserModel } from '@/models/User'
import { dbConnect } from './db/connect'

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies()
    const email = cookieStore.get('session')?.value
    if (!email) {
      return null
    }
    await dbConnect()
    const user = await UserModel.findOne({ email }).lean()
    if (!user) {
      return null
    }
    return {
      id: user.id,
      name: user.name,
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
