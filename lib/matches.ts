// Match System - Create, Join, Cancel
// Matches PHP behavior exactly

import { prisma } from './db'
import { createTransaction } from './wallet'
import { resolveMatch } from './wallet'

// Helper to create transaction within a Prisma transaction
async function createTransactionInTx(
  tx: any,
  userId: string,
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'STAKE' | 'WIN' | 'REFUND' | 'FEE',
  amount: number,
  matchId: string | null,
  description: string | null
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { balance: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const balanceBefore = parseFloat(user.balance.toString())
  const balanceAfter = balanceBefore + amount

  if (balanceAfter < 0) {
    throw new Error('Insufficient balance')
  }

  await tx.user.update({
    where: { id: userId },
    data: { balance: balanceAfter }
  })

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
}

export async function createMatch(
  gameId: string,
  stake: number,
  userId: string
): Promise<{ success: boolean; matchId?: string; error?: string }> {
  try {
    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check user balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true }
      })

      if (!user || parseFloat(user.balance.toString()) < stake) {
        throw new Error('Solde insuffisant')
      }

      // Lock stake (create transaction)
      await createTransactionInTx(
        tx,
        userId,
        'STAKE',
        -stake,
        null,
        'Mise pour défi'
      )

      // Generate share link
      const shareLink = Buffer.from(Math.random().toString()).toString('base64').slice(0, 32)

      // Create match
      const match = await tx.match.create({
        data: {
          gameId,
          stake,
          platformFee: 0.00, // Will be set to 5% when match completes
          status: 'WAITING',
          createdBy: userId,
          shareLink,
        }
      })

      // Add creator as player
      await tx.matchPlayer.create({
        data: {
          matchId: match.id,
          userId: userId,
        }
      })

      return { matchId: match.id }
    })

    return {
      success: true,
      matchId: result.matchId
    }
  } catch (error: any) {
    console.error('Create match error:', error)
    return {
      success: false,
      error: error?.message || 'Erreur lors de la création du défi'
    }
  }
}

export async function joinMatch(
  matchId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use transaction to prevent race conditions
    await prisma.$transaction(async (tx) => {
      // Get match and lock row (FOR UPDATE equivalent in Prisma)
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          players: true
        }
      })

      if (!match) {
        throw new Error('Match non trouvé')
      }

      // Check if match is waiting
      if (match.status !== 'WAITING') {
        throw new Error('Ce défi n\'est plus disponible')
      }

      // Check if already joined
      const alreadyJoined = match.players.some(p => p.userId === userId)
      if (alreadyJoined) {
        return // Already joined, this is OK
      }

      // Check if match is full
      if (match.players.length >= 2) {
        throw new Error('Ce défi est déjà complet')
      }

      // Check balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true }
      })

      if (!user || parseFloat(user.balance.toString()) < parseFloat(match.stake.toString())) {
        throw new Error('Votre solde est insuffisant pour rejoindre ce défi')
      }

      // Lock stake
      await createTransactionInTx(
        tx,
        userId,
        'STAKE',
        -parseFloat(match.stake.toString()),
        matchId,
        'Mise pour défi'
      )

      // Add player
      await tx.matchPlayer.create({
        data: {
          matchId,
          userId,
        }
      })

      // Update match status to active if now 2 players
      const updatedMatch = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          players: true
        }
      })

      if (updatedMatch && updatedMatch.players.length >= 2) {
        await tx.match.update({
          where: { id: matchId },
          data: {
            status: 'ACTIVE',
            startedAt: new Date()
          }
        })
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Join match error:', error)
    return {
      success: false,
      error: error?.message || 'Erreur lors de la connexion'
    }
  }
}

export async function cancelMatch(
  matchId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // Get match
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          players: true
        }
      })

      if (!match) {
        throw new Error('Match non trouvé')
      }

      // Check if user is creator
      if (match.createdBy !== userId) {
        throw new Error('Unauthorized')
      }

      // Check if match is waiting
      if (match.status !== 'WAITING') {
        throw new Error('Match cannot be cancelled')
      }

      // Check if at least 1 minute has passed
      const createdAt = new Date(match.createdAt)
      const now = new Date()
      const elapsedSeconds = (now.getTime() - createdAt.getTime()) / 1000

      if (elapsedSeconds < 60) {
        throw new Error(`Vous devez attendre ${Math.ceil(60 - elapsedSeconds)} secondes`)
      }

      // Refund stake
      const stake = parseFloat(match.stake.toString())
      await createTransactionInTx(
        tx,
        userId,
        'REFUND',
        stake,
        matchId,
        'Match annulé - remboursement'
      )

      // Update match status
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'CANCELLED',
          completedAt: new Date()
        }
      })
    })

    return { success: true }
  } catch (error: any) {
    console.error('Cancel match error:', error)
    return {
      success: false,
      error: error?.message || 'Erreur lors de l\'annulation'
    }
  }
}

export async function saveGameResult(
  matchId: string,
  userId: string,
  score: number,
  gameData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // Update player result
      await tx.matchPlayer.updateMany({
        where: {
          matchId,
          userId
        },
        data: {
          score,
          gameResult: gameData
        }
      })

      // Check if both players have submitted
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          players: true
        }
      })

      if (!match) {
        throw new Error('Match not found')
      }

      const bothSubmitted = match.players.every(p => p.gameResult !== null)

      // If first player finished, opponent gets score 0
      const currentPlayer = match.players.find(p => p.userId === userId)
      const opponent = match.players.find(p => p.userId !== userId)

      if (currentPlayer && opponent && !opponent.gameResult) {
        // First player finished - give opponent score 0
        await tx.matchPlayer.update({
          where: { id: opponent.id },
          data: {
            score: 0,
            gameResult: { status: 'did_not_finish', reason: 'Opponent finished first' }
          }
        })
      }

      // Resolve match if both submitted or first finished
      if (bothSubmitted || (currentPlayer?.gameResult && opponent?.gameResult)) {
        await resolveMatch(matchId)
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Save game result error:', error)
    return {
      success: false,
      error: error?.message || 'Failed to save result'
    }
  }
}
