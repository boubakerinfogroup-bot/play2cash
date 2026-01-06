// Get Match by ID API Route
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
        game: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        creator: {
          select: {
            name: true
          }
        },
        players: {
          include: {
            user: {
              select: {
                name: true
              }
            },
            match: {
              include: {
                game: {
                  select: {
                    slug: true
                  }
                }
              }
            }
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

    return NextResponse.json({
      match: {
        id: match.id,
        gameId: match.gameId,
        gameName: match.game.name,
        gameSlug: match.game.slug,
        stake: parseFloat(match.stake.toString()),
        platformFee: parseFloat(match.platformFee.toString()),
        status: match.status,
        winnerId: match.winnerId,
        createdBy: match.createdBy,
        creatorName: match.creator.name,
        createdAt: match.createdAt.toISOString(),
        startedAt: match.startedAt?.toISOString(),
        completedAt: match.completedAt?.toISOString(),
        shareLink: match.shareLink,
        players: match.players.map(p => ({
          id: p.id,
          userId: p.userId,
          userName: p.user.name,
          score: parseFloat(p.score.toString()),
          gameResult: p.gameResult,
          joinedAt: p.joinedAt.toISOString(),
          game: {
            slug: match.game.slug
          }
        }))
      }
    })
  } catch (error: any) {
    console.error('Error loading match:', error)
    return NextResponse.json(
      { error: 'Failed to load match' },
      { status: 500 }
    )
  }
}

