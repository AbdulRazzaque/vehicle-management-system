import { NextRequest, NextResponse } from 'next/server'
import { getExpenseById, updateExpense, deleteExpense } from '@/services/expenseService'
import { expenseSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { ZodError } from 'zod'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await getExpenseById(id)
    if (!item) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Expense retrieved', data: item }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = expenseSchema.partial().parse(body)
    const updated = await updateExpense(id, validatedData)

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Updated expense ${updated.id} (${updated.vehicleName})`,
      entity: updated.id,
      user: 'Admin',
      role: 'Admin',
      type: 'Update',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Expense updated successfully', data: updated }, { status: 200 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await deleteExpense(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 })
    }

    await createAuditLog({
      action: `Deleted expense ${id}`,
      entity: id,
      user: 'Admin',
      role: 'Admin',
      type: 'Delete',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Expense deleted successfully', data: null }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
