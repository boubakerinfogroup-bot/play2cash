// Get Open Challenges API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameId = searchParams.get('gameId')
    const stakeFilter = searchParams.get('stake')

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

    // Build query
    const where: any = {
      status: 'WAITING',
      createdAt: {
        gte: tenMinutesAgo
      }
    }

    if (gameId) {
      where.gameId = gameId
    }

    if (stakeFilter) {
      where.stake = parseFloat(stakeFilter)
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        game: true,
        creator: {
          select: {
            name: true
          }
        },
        players: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter to only matches with < 2 players
    const openMatches = matches
      .filter(m => m.players.length < 2)
      .map(m => ({
        id: m.id,
        gameId: m.gameId,
        stake: parseFloat(m.stake.toString()),
        platformFee: parseFloat(m.platformFee.toString()),
        status: m.status,
        winnerId: m.winnerId,
        createdBy: m.createdBy,
        createdAt: m.createdAt.toISOString(),
        startedAt: m.startedAt?.toISOString(),
        completedAt: m.completedAt?.toISOString(),
        gameName: m.game.name,
        creatorName: m.creator.name,
        playerCount: m.players.length
      }))

    return NextResponse.json({ matches: openMatches })
  } catch (error: any) {
    console.error('Error loading open matches:', error)
    return NextResponse.json(
      { error: 'Failed to load matches' },
      { status: 500 }
    )
  }
}

