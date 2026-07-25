import { NextRequest, NextResponse } from 'next/server'
import { getAllInventory, createInventoryItem } from '@/services/inventoryService'
import { inventorySchema } from '@/lib/validation/schemas'
import { createAuditLog } from '@/services/auditService'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const list = await getAllInventory()
    return NextResponse.json({ success: true, message: 'Inventory items retrieved', data: list }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = inventorySchema.parse(body)
    const newItem = await createInventoryItem(validatedData)

    await createAuditLog({
      action: `Created inventory item ${newItem.name} (${newItem.code})`,
      entity: newItem.id,
      user: 'Admin',
      role: 'Admin',
      type: 'Create',
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Inventory item created successfully', data: newItem }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    if (error.code === 11000 || error.message?.includes('already exists')) {
      return NextResponse.json({ success: false, error: error.message || 'Inventory item code already exists.' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to create inventory item' }, { status: 500 })
  }
}
