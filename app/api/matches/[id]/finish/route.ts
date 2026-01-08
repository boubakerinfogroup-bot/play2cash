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

        // FIRST PLAYER TO FINISH WINS! - It's a race
        // Get the latest match state
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

        if (!updatedMatch) {
            return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 })
        }

        // If match is already completed, just return success
        if (updatedMatch.status === 'COMPLETED') {
            return NextResponse.json({
                success: true,
                matchCompleted: true,
                winnerId: updatedMatch.winnerId
            })
        }

        // This player finished first - they WIN!
        const winnerId = userId
        const loserId = updatedMatch.players.find(p => p.userId !== userId)?.userId

        if (!loserId) {
            return NextResponse.json({ success: false, error: 'Opponent not found' }, { status: 404 })
        }

        // Calculate amounts
        const stake = Number(updatedMatch.stake)
        const platformFee = stake * 0.05
        const winnerAmount = (stake * 2) - platformFee

        // Use transaction to ensure atomic updates
        try {
            await prisma.$transaction(async (tx) => {
                // Get current balances
                const winner = await tx.user.findUnique({
                    where: { id: winnerId },
                    select: { balance: true }
                })
                const loser = await tx.user.findUnique({
                    where: { id: loserId },
                    select: { balance: true }
                })

                if (!winner || !loser) {
                    throw new Error('User not found')
                }

                const winnerBalanceBefore = Number(winner.balance)
                const loserBalanceBefore = Number(loser.balance)

                // Update match to COMPLETED
                await tx.match.update({
                    where: { id: matchId },
                    data: {
                        status: 'COMPLETED',
                        winnerId: winnerId,
                        completedAt: new Date(),
                        settledAt: new Date(),
                        platformFee: platformFee,
                        // Set both scores - winner has their score, loser gets 0
                        player1Score: playerIndex === 0 ? score : 0,
                        player2Score: playerIndex === 1 ? score : 0
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

                // Record transactions with balance tracking
                await tx.transaction.create({
                    data: {
                        userId: winnerId,
                        amount: winnerAmount,
                        type: 'MATCH_WIN',
                        description: `Won match - finished first!`,
                        matchId: matchId,
                        balanceBefore: winnerBalanceBefore,
                        balanceAfter: winnerBalanceBefore + winnerAmount
                    }
                })

                await tx.transaction.create({
                    data: {
                        userId: loserId,
                        amount: -stake,
                        type: 'MATCH_LOSS',
                        description: `Lost match - opponent finished first`,
                        matchId: matchId,
                        balanceBefore: loserBalanceBefore,
                        balanceAfter: loserBalanceBefore - stake
                    }
                })
            })

            return NextResponse.json({
                success: true,
                matchCompleted: true,
                winnerId: winnerId
            })
        } catch (txError: any) {
            console.error('Transaction error:', txError)
            return NextResponse.json({ success: false, error: 'Failed to settle match' }, { status: 500 })
        }
    } catch (error: any) {
        console.error('Finish match error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
