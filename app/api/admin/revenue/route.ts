// Admin Revenue API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'all'

    const now = new Date()
    let dateFilter: any = {}

    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateFilter = { gte: today }
    } else if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = { gte: monthStart }
    } else if (period === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1)
      dateFilter = { gte: yearStart }
    }

    const where = period !== 'all' ? { createdAt: dateFilter } : {}

    const revenue = await prisma.platformRevenue.findMany({
      where,
      include: {
        match: {
          include: {
            game: {
              select: { name: true }
            },
            winner: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = revenue.reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0)

    // Calculate stats
    const stats = await prisma.$transaction(async (tx) => {
      const matches = await tx.match.findMany({
        where: {
          status: 'COMPLETED',
          ...(period !== 'all' ? {
            completedAt: period === 'today' 
              ? { gte: new Date(new Date().setHours(0,0,0,0)) }
              : period === 'month'
              ? { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              : period === 'year'
              ? { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
              : {}
          } : {})
        },
        select: {
          stake: true,
          platformFee: true
        }
      })

      const totalMatches = matches.length
      const totalStakes = matches.reduce((sum, m) => sum + parseFloat(m.stake.toString()) * 2, 0)
      const totalRevenue = matches.reduce((sum, m) => sum + parseFloat(m.platformFee.toString()), 0)
      const totalPayouts = totalStakes - totalRevenue

      return { totalMatches, totalStakes, totalRevenue, totalPayouts }
    })

    return NextResponse.json({
      total,
      stats,
      revenue: revenue.map(r => ({
        id: r.id,
        matchId: r.matchId,
        gameName: r.match.game.name,
        stake: parseFloat(r.match.stake.toString()) * 2,
        amount: parseFloat(r.amount.toString()),
        payout: parseFloat(r.match.stake.toString()) * 2 - parseFloat(r.amount.toString()),
        winnerName: r.match.winner?.name || null,
        createdAt: r.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unauthorized' },
      { status: 401 }
    )
  }
}

