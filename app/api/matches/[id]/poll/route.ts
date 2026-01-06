import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const matchId = params.id

        // Get match with all related data
        const match = await prisma.match.findUnique({
            where: { id: matchId },
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
                        id: true,
                        name: true,
                        accountId: true
                    }
                },
                players: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                accountId: true
                            }
                        }
                    }
                },
                joinRequests: {
                    where: {
                        status: 'PENDING'
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                accountId: true,
                                whatsapp: true
                            }
                        }
                    }
                }
            }
        })

        if (!match) {
            return NextResponse.json(
                { success: false, error: 'Match not found' },
                { status: 404 }
            )
        }

        // Check if user has access to this match
        const isCreator = match.createdBy === user.id
        const isPlayer = match.players.some(p => p.userId === user.id)
        const hasRequested = match.joinRequests.some(r => r.userId === user.id)

        if (!isCreator && !isPlayer && !hasRequested) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            match: {
                id: match.id,
                gameId: match.gameId,
                gameName: match.game.name,
                gameSlug: match.game.slug,
                stake: parseFloat(match.stake.toString()),
                platformFee: parseFloat(match.platformFee.toString()),
                status: match.status,
                shareLink: match.shareLink,
                createdAt: match.createdAt,
                startedAt: match.startedAt,
                completedAt: match.completedAt,
                creator: match.creator,
                players: match.players.map(p => ({
                    id: p.id,
                    userId: p.userId,
                    user: p.user,
                    score: parseFloat(p.score.toString()),
                    joinedAt: p.joinedAt
                })),
                joinRequests: match.joinRequests.map(r => ({
                    id: r.id,
                    userId: r.userId,
                    user: r.user,
                    status: r.status,
                    createdAt: r.createdAt
                })),
                isCreator,
                isPlayer
            }
        })
    } catch (error: any) {
        console.error('Poll match error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
