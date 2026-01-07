import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const matchId = params.id

        // Initialize RPS game state
        const initialState = {
            currentRound: 1,
            rounds: Array.from({ length: 15 }, (_, i) => ({
                roundNumber: i + 1,
                player1Choice: null,
                player2Choice: null,
                winner: null,
                player1Submitted: false,
                player2Submitted: false
            })),
            player1Wins: 0,
            player2Wins: 0,
            gameComplete: false,
            finalWinner: null
        }

        await prisma.match.update({
            where: { id: matchId },
            data: {
                rpsGameState: initialState
            }
        })

        return NextResponse.json({ success: true, gameState: initialState })
    } catch (error: any) {
        console.error('RPS init error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
