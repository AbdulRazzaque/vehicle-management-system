import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-backend'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }
    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
