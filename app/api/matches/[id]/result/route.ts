// Get Match Result API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        game: true,
        players: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            score: 'desc'
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    if (match.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Match not completed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      match: {
        id: match.id,
        gameName: match.game.name,
        stake: parseFloat(match.stake.toString()),
        platformFee: parseFloat(match.platformFee.toString()),
        winnerId: match.winnerId,
        players: match.players.map(p => ({
          userId: p.userId,
          userName: p.user.name,
          score: parseFloat(p.score.toString())
        }))
      }
    })
  } catch (error: any) {
    console.error('Error loading match result:', error)
    return NextResponse.json(
      { error: 'Failed to load match result' },
      { status: 500 }
    )
  }
}

