import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const gameId = searchParams.get('gameId')

        // Build query
        const where: any = {
            status: 'WAITING'
        }

        if (gameId) {
            where.gameId = gameId
        }

        // Get all waiting matches
        const matches = await prisma.match.findMany({
            where,
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50 // Limit to 50 most recent
        })

        // Filter out matches created by current user
        const liveRooms = matches
            .filter(m => m.createdBy !== user.id)
            .map(m => ({
                id: m.id,
                gameId: m.gameId,
                gameName: m.game.name,
                gameSlug: m.game.slug,
                stake: parseFloat(m.stake.toString()),
                creator: m.creator,
                createdAt: m.createdAt
            }))

        return NextResponse.json({
            success: true,
            rooms: liveRooms
        })
    } catch (error: any) {
        console.error('Get live rooms error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
