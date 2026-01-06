// Admin Manual Top-up/Withdraw by Account ID API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { createTransaction } from '@/lib/wallet'

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const { accountId, amount, action } = await request.json()

    if (!accountId || !amount || amount <= 0 || !action) {
      return NextResponse.json(
        { success: false, error: 'Account ID, amount, and action are required' },
        { status: 400 }
      )
    }

    if (!['manual_topup', 'manual_withdraw'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Find user by account_id
    const user = await prisma.user.findUnique({
      where: { accountId },
      select: { id: true, name: true, balance: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Compte introuvable' },
        { status: 404 }
      )
    }

    // Check balance for withdrawal
    if (action === 'manual_withdraw' && parseFloat(user.balance.toString()) < amount) {
      return NextResponse.json(
        { success: false, error: 'Solde insuffisant' },
        { status: 400 }
      )
    }

    // Create transaction
    const transactionType = action === 'manual_topup' ? 'DEPOSIT' : 'WITHDRAWAL'
    const transactionAmount = action === 'manual_topup' ? amount : -amount

    const result = await createTransaction(
      user.id,
      transactionType,
      transactionAmount,
      null,
      action === 'manual_topup' 
        ? `Recharge manuelle par admin (ID: ${accountId})`
        : `Retrait manuel par admin (ID: ${accountId})`
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Transaction failed' },
        { status: 400 }
      )
    }

    // Log admin action (adminId in admin_logs references users.id, but we use AdminAccount)
    // For now, skip admin logs as we don't have a user account for admin
    // This matches PHP behavior where admin_logs.admin_id comes from users table

    return NextResponse.json({
      success: true,
      message: `${action === 'manual_topup' ? 'Recharge' : 'Retrait'} effectué avec succès pour ${user.name} (${accountId})`
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
