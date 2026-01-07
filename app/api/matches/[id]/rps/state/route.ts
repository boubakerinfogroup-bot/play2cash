import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const matchId = params.id

        const match = await prisma.match.findUnique({
            where: { id: matchId },
            select: {
                rpsGameState: true
            }
        })

        if (!match) {
            return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            gameState: match.rpsGameState
        })
    } catch (error: any) {
        console.error('RPS state error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
