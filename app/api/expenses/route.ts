import { NextRequest, NextResponse } from 'next/server'
import { getAllExpenses, createExpense } from '@/services/expenseService'
import { expenseSchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const list = await getAllExpenses()
    return NextResponse.json({ success: true, message: 'Expenses retrieved', data: list }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = expenseSchema.parse(body)
    const newExpense = await createExpense(validatedData)

    await createAuditLog({
      action: `Logged expense ${newExpense.id} ($${newExpense.amount}) for ${newExpense.vehicleName}`,
      entity: newExpense.id,
      user: 'Admin',
      role: 'Admin',
      type: 'Create',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Expense logged successfully', data: newExpense }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to log expense' }, { status: 500 })
  }
}
