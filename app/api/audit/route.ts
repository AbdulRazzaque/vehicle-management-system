import { NextRequest, NextResponse } from 'next/server'
import { getAllAuditLogs, createAuditLog } from '@/services/auditService'
import { auditLogSchema } from '@/lib/validation/schemas'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const list = await getAllAuditLogs()
    return NextResponse.json({ success: true, message: 'Audit logs retrieved', data: list }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = auditLogSchema.parse(body)
    const newLog = await createAuditLog(validatedData)
    return NextResponse.json({ success: true, message: 'Audit log created successfully', data: newLog }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to record audit log' }, { status: 500 })
  }
}
