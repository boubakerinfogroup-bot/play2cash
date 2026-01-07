import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const matchId = params.id
        const body = await request.json()
        const { userId, score } = body

        // Get match
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                players: true
            }
        })

        if (!match) {
            return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
        }

        // Find player index
        const playerIndex = match.players.findIndex(p => p.userId === userId)
        if (playerIndex === -1) {
            return NextResponse.json({ success: false, error: 'Not a player in this match' }, { status: 403 })
        }

        // Update score
        const scoreField = playerIndex === 0 ? 'player1Score' : 'player2Score'
        await prisma.match.update({
            where: { id: matchId },
            data: {
                [scoreField]: score
            }
        })

        // Check if both players have finished
        const updatedMatch = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                players: {
                    include: {
                        user: true
                    }
                }
            }
        })

        const player1Score = updatedMatch!.player1Score
        const player2Score = updatedMatch!.player2Score

        // If both scores are set, determine winner and settle
        if (player1Score !== null && player2Score !== null) {
            const player1 = updatedMatch!.players[0]
            const player2 = updatedMatch!.players[1]

            // Determine winner (highest score)
            const winnerId = player1Score > player2Score ? player1.userId : player2.userId
            const loserId = player1Score > player2Score ? player2.userId : player1.userId

            // Calculate amounts
            const stake = Number(updatedMatch!.stake)
            const platformFee = stake * 0.05
            const winnerAmount = (stake * 2) - platformFee

            // Use transaction to ensure atomic updates
            await prisma.$transaction(async (tx) => {
                // Update match
                await tx.match.update({
                    where: { id: matchId },
                    data: {
                        status: 'COMPLETED',
                        winnerId: winnerId,
                        completedAt: new Date(),
                        settledAt: new Date(),
                        platformFee: platformFee
                    }
                })

                // Deduct from loser
                await tx.user.update({
                    where: { id: loserId },
                    data: {
                        balance: {
                            decrement: stake
                        }
                    }
                })

                // Add to winner
                await tx.user.update({
                    where: { id: winnerId },
                    data: {
                        balance: {
                            increment: winnerAmount
                        }
                    }
                })

                // Record transactions
                await tx.transaction.create({
                    data: {
                        userId: winnerId,
                        amount: winnerAmount,
                        type: 'MATCH_WIN',
                        description: `Won match #${updatedMatch!.shortId}`,
                        matchId: matchId
                    }
                })

                await tx.transaction.create({
                    data: {
                        userId: loserId,
                        amount: -stake,
                        type: 'MATCH_LOSS',
                        description: `Lost match #${updatedMatch!.shortId}`,
                        matchId: matchId
                    }
                })
            })

            return NextResponse.json({
                success: true,
                matchCompleted: true,
                winnerId: winnerId
            })
        }

        return NextResponse.json({
            success: true,
            matchCompleted: false
        })
    } catch (error: any) {
        console.error('Finish match error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
