// Admin Withdrawals API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            name: true,
            accountId: true,
            balance: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        userId: w.userId,
        userName: w.user.name,
        accountId: w.user.accountId,
        amount: parseFloat(w.amount.toString()),
        whatsapp: w.whatsapp,
        status: w.status,
        createdAt: w.createdAt.toISOString(),
        adminNotes: w.adminNotes,
        userBalance: parseFloat(w.user.balance.toString())
      }))
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const { id, action, notes } = await request.json()

    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID and action are required' },
        { status: 400 }
      )
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!withdrawal || withdrawal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Withdrawal request not found or already processed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Approve withdrawal
      await prisma.$transaction(async (tx) => {
        // Update request status
        await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            processedAt: new Date(),
            processedBy: admin.id,
            adminNotes: notes || null
          }
        })

        // Deduct balance from user
        const user = await tx.user.findUnique({
          where: { id: withdrawal.userId },
          select: { balance: true }
        })

        if (user) {
          const balanceBefore = parseFloat(user.balance.toString())
          const balanceAfter = balanceBefore - parseFloat(withdrawal.amount.toString())

          if (balanceAfter < 0) {
            throw new Error('Insufficient balance')
          }

          await tx.user.update({
            where: { id: withdrawal.userId },
            data: { balance: balanceAfter }
          })

          await tx.transaction.create({
            data: {
              userId: withdrawal.userId,
              type: 'WITHDRAWAL',
              amount: -parseFloat(withdrawal.amount.toString()),
              balanceBefore,
              balanceAfter,
              description: 'Retrait approuvé'
            }
          })
        }
      })

      return NextResponse.json({ success: true })
    } else if (action === 'reject') {
      // Reject withdrawal
      await prisma.withdrawalRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          processedBy: admin.id,
          adminNotes: notes || null
        }
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

