import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type Choice = 'rock' | 'paper' | 'scissors'

function determineWinner(choice1: Choice, choice2: Choice): 1 | 2 | 'tie' {
    if (choice1 === choice2) return 'tie'
    if (
        (choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'paper' && choice2 === 'rock') ||
        (choice1 === 'scissors' && choice2 === 'paper')
    ) {
        return 1
    }
    return 2
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const matchId = params.id
        const body = await request.json()
        const { userId, roundNumber, choice }: { userId: string; roundNumber: number; choice: Choice } = body

        if (!choice || !['rock', 'paper', 'scissors'].includes(choice)) {
            return NextResponse.json({ success: false, error: 'Invalid choice' }, { status: 400 })
        }

        // Use transaction for atomic update
        const result = await prisma.$transaction(async (tx) => {
            const match = await tx.match.findUnique({
                where: { id: matchId },
                include: {
                    players: true
                }
            })

            if (!match) {
                throw new Error('Match not found')
            }

            // Determine if user is player1 or player2
            const playerIndex = match.players.findIndex(p => p.userId === userId)
            if (playerIndex === -1) {
                throw new Error('Not a player in this match')
            }

            const isPlayer1 = playerIndex === 0
            const gameState: any = match.rpsGameState || {
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

            // Find the round
            const round = gameState.rounds.find((r: any) => r.roundNumber === roundNumber)
            if (!round) {
                throw new Error('Invalid round number')
            }

            // Update player choice
            if (isPlayer1) {
                round.player1Choice = choice
                round.player1Submitted = true
            } else {
                round.player2Choice = choice
                round.player2Submitted = true
            }

            let bothSubmitted = false
            let roundWinner: 1 | 2 | 'tie' | null = null

            // If both players submitted, calculate winner
            if (round.player1Submitted && round.player2Submitted && round.player1Choice && round.player2Choice) {
                bothSubmitted = true
                roundWinner = determineWinner(round.player1Choice as Choice, round.player2Choice as Choice)
                round.winner = roundWinner

                // Update wins
                if (roundWinner === 1) {
                    gameState.player1Wins++
                } else if (roundWinner === 2) {
                    gameState.player2Wins++
                }

                // Check if game is complete (15 rounds or someone has 8 wins)
                if (roundNumber === 15 || gameState.player1Wins >= 8 || gameState.player2Wins >= 8) {
                    gameState.gameComplete = true
                    gameState.finalWinner = gameState.player1Wins > gameState.player2Wins ? 1 : gameState.player1Wins < gameState.player2Wins ? 2 : 'tie'
                } else {
                    // Move to next round
                    gameState.currentRound = roundNumber + 1
                }
            }

            // Update match
            await tx.match.update({
                where: { id: matchId },
                data: {
                    rpsGameState: gameState
                }
            })

            return { gameState, bothSubmitted, roundWinner }
        })

        return NextResponse.json({
            success: true,
            ...result
        })
    } catch (error: any) {
        console.error('RPS submit error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
