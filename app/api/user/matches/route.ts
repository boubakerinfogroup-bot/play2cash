// Get User Match History API Route
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

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'all'

    const where: any = {
      players: {
        some: {
          userId: user.id
        }
      },
      status: 'COMPLETED'
    }

    if (filter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      where.completedAt = { gte: today }
    } else if (filter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      where.completedAt = { gte: weekAgo }
    } else if (filter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      where.completedAt = { gte: monthAgo }
    } else if (filter === 'year') {
      const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      where.completedAt = { gte: yearAgo }
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        game: true,
        players: {
          where: {
            userId: user.id
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 100
    })

    return NextResponse.json({
      matches: matches.map(m => ({
        id: m.id,
        gameName: m.game.name,
        stake: parseFloat(m.stake.toString()),
        winnerId: m.winnerId,
        completedAt: m.completedAt?.toISOString(),
        won: m.winnerId === user.id,
        tie: !m.winnerId,
        score: m.players[0] ? parseFloat(m.players[0].score.toString()) : 0
      }))
    })
  } catch (error: any) {
    console.error('Error loading matches:', error)
    return NextResponse.json(
      { error: 'Failed to load matches' },
      { status: 500 }
    )
  }
}

