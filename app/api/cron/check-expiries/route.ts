import { NextResponse } from 'next/server'
import { checkAndGenerateRegistrationExpiryNotifications } from '@/lib/notifications-backend'

export async function GET() {
  try {
    await checkAndGenerateRegistrationExpiryNotifications()
    return NextResponse.json({
      success: true,
      message: 'Registration expiry notifications checked and generated successfully.',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process registration expiries' },
      { status: 500 }
    )
  }
}

export async function POST() {
  return GET()
}
