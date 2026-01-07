import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id

    // Get match with full details
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        game: true,
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
    }

    if (match.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'Match not completed' }, { status: 400 })
    }

    // Build result object
    const result = {
      id: match.id,
      gameName: match.game.name,
      stake: Number(match.stake),
      platformFee: Number(match.platformFee),
      winnerId: match.winnerId,
      player1: {
        id: match.players[0].userId,
        name: match.players[0].user.name,
        score: match.player1Score || 0
      },
      player2: {
        id: match.players[1].userId,
        name: match.players[1].user.name,
        score: match.player2Score || 0
      }
    }

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Get result error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
