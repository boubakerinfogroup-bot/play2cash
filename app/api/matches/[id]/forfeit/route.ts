import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const matchId = params.id
        const body = await request.json()
        const { userId } = body

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

        // Verify user is a player
        const isPlayer = match.players.some(p => p.userId === userId)
        if (!isPlayer) {
            return NextResponse.json({ success: false, error: 'Not a player in this match' }, { status: 403 })
        }

        // If match already completed, return existing result
        if (match.status === 'COMPLETED') {
            return NextResponse.json({
                success: true,
                matchCompleted: true,
                winnerId: match.winnerId
            })
        }

        // Find the opponent (winner)
        const winnerId = match.players.find(p => p.userId !== userId)?.userId
        if (!winnerId) {
            return NextResponse.json({ success: false, error: 'Opponent not found' }, { status: 404 })
        }

        // Calculate amounts
        const stake = Number(match.stake)
        const platformFee = stake * 0.05
        const winnerAmount = (stake * 2) - platformFee

        // Use transaction for atomic updates
        await prisma.$transaction(async (tx) => {
            // Get balances
            const winner = await tx.user.findUnique({
                where: { id: winnerId },
                select: { balance: true }
            })
            const loser = await tx.user.findUnique({
                where: { id: userId },
                select: { balance: true }
            })

            if (!winner || !loser) {
                throw new Error('User not found')
            }

            const winnerBalanceBefore = Number(winner.balance)
            const loserBalanceBefore = Number(loser.balance)

            // Update match to completed with forfeit
            await tx.match.update({
                where: { id: matchId },
                data: {
                    status: 'COMPLETED',
                    winnerId: winnerId,
                    completedAt: new Date(),
                    platformFee: platformFee,
                    player1Score: match.players[0].userId === winnerId ? 14 : 0,
                    player2Score: match.players[1].userId === winnerId ? 14 : 0
                }
            })

            // Deduct from loser
            await tx.user.update({
                where: { id: userId },
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
                    type: 'DEPOSIT',
                    description: `Won by forfeit - opponent disconnected`,
                    matchId: matchId,
                    balanceBefore: winnerBalanceBefore,
                    balanceAfter: winnerBalanceBefore + winnerAmount
                }
            })

            await tx.transaction.create({
                data: {
                    userId: userId,
                    amount: -stake,
                    type: 'WITHDRAWAL',
                    description: `Lost by forfeit - disconnected`,
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
    } catch (error: any) {
        console.error('Forfeit match error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
