import { NextRequest, NextResponse } from 'next/server'
import { getDocumentById, updateDocument, deleteDocument } from '@/services/documentService'
import { documentSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { ZodError } from 'zod'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const doc = await getDocumentById(id)
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Document retrieved', data: doc }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = documentSchema.partial().parse(body)
    const updated = await updateDocument(id, validatedData)

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Updated document ${updated.name}`,
      entity: updated.id,
      user: 'Admin',
      role: 'Admin',
      type: 'Update',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Document updated successfully', data: updated }, { status: 200 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const doc = await getDocumentById(id)
    const deleted = await deleteDocument(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Deleted document ${doc?.name || id}`,
      entity: id,
      user: 'Admin',
      role: 'Admin',
      type: 'Delete',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Document deleted successfully', data: null }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
