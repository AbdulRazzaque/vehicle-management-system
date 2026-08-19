import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { success: true, message: 'Seeding is disabled', data: null },
    { status: 200 }
  )
}
