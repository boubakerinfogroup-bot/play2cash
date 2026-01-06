// Admin Deposits API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const deposits = await prisma.depositRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            name: true,
            accountId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      deposits: deposits.map(d => ({
        id: d.id,
        userId: d.userId,
        userName: d.user.name,
        accountId: d.user.accountId,
        amount: parseFloat(d.amount.toString()),
        whatsapp: d.whatsapp,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        adminNotes: d.adminNotes
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

    const deposit = await prisma.depositRequest.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!deposit || deposit.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Deposit request not found or already processed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Approve deposit
      await prisma.$transaction(async (tx) => {
        // Update request status (processedBy should be admin account ID as string)
        await tx.depositRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            processedAt: new Date(),
            processedBy: admin.id,
            adminNotes: notes || null
          }
        })

        // Add balance to user
        const user = await tx.user.findUnique({
          where: { id: deposit.userId },
          select: { balance: true }
        })

        if (user) {
          const balanceBefore = parseFloat(user.balance.toString())
          const balanceAfter = balanceBefore + parseFloat(deposit.amount.toString())

          await tx.user.update({
            where: { id: deposit.userId },
            data: { balance: balanceAfter }
          })

          await tx.transaction.create({
            data: {
              userId: deposit.userId,
              type: 'DEPOSIT',
              amount: parseFloat(deposit.amount.toString()),
              balanceBefore,
              balanceAfter,
              description: 'Dépôt approuvé'
            }
          })
        }
      })

      return NextResponse.json({ success: true })
    } else if (action === 'reject') {
      // Reject deposit
      await prisma.depositRequest.update({
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

