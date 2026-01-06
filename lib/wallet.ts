// Wallet System - Transaction Logic
// Matches PHP behavior exactly

import { prisma } from './db'
import type { TransactionType } from '@prisma/client'

/**
 * Create a transaction and update user balance atomically
 * Matches PHP createTransaction() function exactly
 */
export async function createTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  matchId: string | null,
  description: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use Prisma transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Get current balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const balanceBefore = parseFloat(user.balance.toString())
      const balanceAfter = balanceBefore + amount

      // Check if balance would go negative (for withdrawals/stakes)
      if (balanceAfter < 0) {
        throw new Error('Insufficient balance')
      }

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: balanceAfter }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          matchId,
          type,
          amount,
          balanceBefore,
          balanceAfter,
          description
        }
      })
    })

    return { success: true }
  } catch (error: any) {
    console.error('Transaction error:', error)
    return {
      success: false,
      error: error?.message || 'Transaction failed'
    }
  }
}

/**
 * Resolve match - Calculate winner, platform fee, and update balances
 * Matches PHP resolveMatch() function exactly
 */
export async function resolveMatch(matchId: string): Promise<{
  success: boolean
  winnerId?: string | null
  tie?: boolean
  error?: string
}> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get match with players
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          players: {
            orderBy: { score: 'desc' }
          }
        }
      })

      if (!match || match.players.length < 2) {
        throw new Error('Invalid match')
      }

      const player1 = match.players[0]
      const player2 = match.players[1]

      // Check for tie
      if (parseFloat(player1.score.toString()) === parseFloat(player2.score.toString())) {
        // Refund both players
        const stake = parseFloat(match.stake.toString())

        // Refund player 1
        const user1 = await tx.user.findUnique({
          where: { id: player1.userId },
          select: { balance: true }
        })
        if (user1) {
          const balanceBefore = parseFloat(user1.balance.toString())
          const balanceAfter = balanceBefore + stake
          await tx.user.update({
            where: { id: player1.userId },
            data: { balance: balanceAfter }
          })
          await tx.transaction.create({
            data: {
              userId: player1.userId,
              matchId,
              type: 'REFUND',
              amount: stake,
              balanceBefore,
              balanceAfter,
              description: 'Match nul - remboursement'
            }
          })
        }

        // Refund player 2
        const user2 = await tx.user.findUnique({
          where: { id: player2.userId },
          select: { balance: true }
        })
        if (user2) {
          const balanceBefore = parseFloat(user2.balance.toString())
          const balanceAfter = balanceBefore + stake
          await tx.user.update({
            where: { id: player2.userId },
            data: { balance: balanceAfter }
          })
          await tx.transaction.create({
            data: {
              userId: player2.userId,
              matchId,
              type: 'REFUND',
              amount: stake,
              balanceBefore,
              balanceAfter,
              description: 'Match nul - remboursement'
            }
          })
        }

        await tx.match.update({
          where: { id: matchId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        })

        return { tie: true, winnerId: null }
      }

      // Determine winner (highest score)
      const winner = player1.score > player2.score ? player1 : player2

      // Calculate winnings (5% platform fee)
      const totalPot = parseFloat(match.stake.toString()) * 2
      const platformFeeAmount = totalPot * 0.05 // 5% platform commission
      const winnings = totalPot - platformFeeAmount // Winner gets 95%

      // Update platform_fee in match record
      await tx.match.update({
        where: { id: matchId },
        data: {
          platformFee: platformFeeAmount,
          status: 'COMPLETED',
          winnerId: winner.userId,
          completedAt: new Date()
        }
      })

      // Log platform revenue
      await tx.platformRevenue.create({
        data: {
          matchId,
          amount: platformFeeAmount
        }
      })

      // Award winner
      const winnerUser = await tx.user.findUnique({
        where: { id: winner.userId },
        select: { balance: true }
      })
      if (winnerUser) {
        const balanceBefore = parseFloat(winnerUser.balance.toString())
        const balanceAfter = balanceBefore + winnings
        await tx.user.update({
          where: { id: winner.userId },
          data: { balance: balanceAfter }
        })
        await tx.transaction.create({
          data: {
            userId: winner.userId,
            matchId,
            type: 'WIN',
            amount: winnings,
            balanceBefore,
            balanceAfter,
            description: 'Victoire au match'
          }
        })
      }

      return { winnerId: winner.userId, tie: false }
    })

    return {
      success: true,
      winnerId: result.winnerId,
      tie: result.tie
    }
  } catch (error: any) {
    console.error('Match resolution error:', error)
    return {
      success: false,
      error: error?.message || 'Match resolution failed'
    }
  }
}

