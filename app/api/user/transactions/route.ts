// Get User Transactions API Route
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount.toString()),
        balanceBefore: parseFloat(t.balanceBefore.toString()),
        balanceAfter: parseFloat(t.balanceAfter.toString()),
        description: t.description,
        createdAt: t.createdAt.toISOString(),
        matchId: t.matchId
      }))
    })
  } catch (error: any) {
    console.error('Error loading transactions:', error)
    return NextResponse.json(
      { error: 'Failed to load transactions' },
      { status: 500 }
    )
  }
}

