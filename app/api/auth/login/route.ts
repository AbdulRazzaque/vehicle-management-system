import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/models/User'
import { dbConnect } from '@/lib/db/connect'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const { email, password, rememberMe } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // Default password for all users is password123 unless specified otherwise
    const isPasswordValid = user.password === password || (!user.password && password === 'password123')
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status === 'Suspended') {
      return NextResponse.json({ success: false, error: 'Your account is suspended. Please contact Admin.' }, { status: 403 })
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : undefined // 30 days or session
    const isSecure = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https'
    
    response.cookies.set('session', user.email, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('role', user.role, {
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
