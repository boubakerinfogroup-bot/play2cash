// Admin Stats API Route
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const [
      totalUsers,
      totalMatches,
      totalRevenue,
      pendingDeposits,
      pendingWithdrawals
    ] = await Promise.all([
      prisma.user.count(),
      prisma.match.count({ where: { status: 'COMPLETED' } }),
      prisma.platformRevenue.aggregate({
        _sum: { amount: true }
      }),
      prisma.depositRequest.count({ where: { status: 'PENDING' } }),
      prisma.withdrawalRequest.count({ where: { status: 'PENDING' } })
    ])

    return NextResponse.json({
      totalUsers,
      totalMatches,
      totalRevenue: parseFloat(totalRevenue._sum.amount?.toString() || '0'),
      pendingDeposits,
      pendingWithdrawals
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unauthorized' },
      { status: 401 }
    )
  }
}

