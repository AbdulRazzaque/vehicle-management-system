import { NextRequest, NextResponse } from 'next/server'
import { getAllDocuments, createDocument } from '@/services/documentService'
import { documentSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const list = await getAllDocuments()
    return NextResponse.json({ success: true, message: 'Documents retrieved', data: list }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = documentSchema.parse(body)
    const newDoc = await createDocument(validatedData)

    await createAuditLog({
      action: `Uploaded document ${newDoc.name} for ${newDoc.vehicle}`,
      entity: newDoc.id,
      user: newDoc.uploadedBy || 'Admin',
      role: 'Admin',
      type: 'Create',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Document uploaded successfully', data: newDoc }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to upload document' }, { status: 500 })
  }
}
