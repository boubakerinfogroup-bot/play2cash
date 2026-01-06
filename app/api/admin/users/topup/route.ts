// Admin Top-up User API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { createTransaction } from '@/lib/wallet'

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const { userId, amount } = await request.json()

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'User ID and valid amount are required' },
        { status: 400 }
      )
    }

    // Add balance to user
    const result = await createTransaction(
      userId,
      'DEPOSIT',
      amount,
      null,
      'Recharge manuelle par admin'
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to recharge' },
        { status: 400 }
      )
    }

    // Log admin action (adminId in admin_logs references users.id, but we use AdminAccount)
    // For now, skip admin logs as we don't have a user account for admin
    // This matches PHP behavior where admin_logs.admin_id comes from users table

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

