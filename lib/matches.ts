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
): Promise<{ success: boolean; matchId?: string; shareLink?: string; error?: string }> {
  try {
    // Check user balance (but don't deduct yet)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    })

    if (!user || parseFloat(user.balance.toString()) < stake) {
      return {
        success: false,
        error: 'Solde insuffisant'
      }
    }

    // Generate share link
    const shareLink = Buffer.from(Math.random().toString()).toString('base64').slice(0, 32)

    // Create match with WAITING status
    // NOTE: Balance is NOT deducted here - only when match goes ACTIVE
    const match = await prisma.match.create({
      data: {
        gameId,
        stake,
        platformFee: stake * 0.05, // 5% platform fee
        status: 'WAITING',
        createdBy: userId,
        shareLink,
      }
    })

    return {
      success: true,
      matchId: match.id,
      shareLink: `${process.env.NEXT_PUBLIC_BASE_URL}/waiting-room/${match.id}`
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
    // Get match
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })

    if (!match) {
      return {
        success: false,
        error: 'Match non trouvé'
      }
    }

    // Check if user is creator
    if (match.createdBy !== userId) {
      return {
        success: false,
        error: 'Unauthorized'
      }
    }

    // Check if match is waiting
    if (match.status !== 'WAITING') {
      return {
        success: false,
        error: 'Match cannot be cancelled'
      }
    }

    // Check if at least 1 minute has passed
    const createdAt = new Date(match.createdAt)
    const now = new Date()
    const elapsedSeconds = (now.getTime() - createdAt.getTime()) / 1000

    if (elapsedSeconds < 60) {
      return {
        success: false,
        error: `Vous devez attendre ${Math.ceil(60 - elapsedSeconds)} secondes`
      }
    }

    // Update match status to CANCELLED
    // NOTE: No refund needed since balance was never deducted
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date()
      }
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

// Request to join a match (creates pending join request)
export async function requestJoinMatch(
  matchId: string,
  userId: string
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    // Check match exists and is waiting
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { joinRequests: true }
    })

    if (!match) {
      return { success: false, error: 'Match non trouvé' }
    }

    if (match.status !== 'WAITING') {
      return { success: false, error: 'Ce défi n\'est plus disponible' }
    }

    // Check user isn't the creator
    if (match.createdBy === userId) {
      return { success: false, error: 'Vous ne pouvez pas rejoindre votre propre défi' }
    }

    // Check user has sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    })

    if (!user || parseFloat(user.balance.toString()) < parseFloat(match.stake.toString())) {
      return { success: false, error: 'Solde insuffisant' }
    }

    // Check if already requested
    const existingRequest = match.joinRequests.find(r => r.userId === userId)
    if (existingRequest) {
      return { success: true, requestId: existingRequest.id }
    }

    // Create join request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        matchId,
        userId,
        status: 'PENDING'
      }
    })

    // Update match status to PENDING_ACCEPTANCE
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'PENDING_ACCEPTANCE' }
    })

    return {
      success: true,
      requestId: joinRequest.id
    }
  } catch (error: any) {
    console.error('Request join match error:', error)
    return {
      success: false,
      error: error?.message || 'Erreur lors de la demande'
    }
  }
}

// Accept join request and start countdown
export async function acceptJoinRequest(
  matchId: string,
  creatorId: string,
  requestId: string
): Promise<{ success: boolean; countdownStartTime?: Date; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get match
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { joinRequests: true }
      })

      if (!match) {
        throw new Error('Match non trouvé')
      }

      // Verify creator
      if (match.createdBy !== creatorId) {
        throw new Error('Unauthorized')
      }

      // Get join request
      const joinRequest = await tx.joinRequest.findUnique({
        where: { id: requestId }
      })

      if (!joinRequest) {
        throw new Error('Demande non trouvée')
      }

      // Check both users have sufficient balance
      const stake = parseFloat(match.stake.toString())

      const creator = await tx.user.findUnique({
        where: { id: creatorId },
        select: { balance: true }
      })

      const joiner = await tx.user.findUnique({
        where: { id: joinRequest.userId },
        select: { balance: true }
      })

      if (!creator || parseFloat(creator.balance.toString()) < stake) {
        throw new Error('Le créateur n\'a pas assez de solde')
      }

      if (!joiner || parseFloat(joiner.balance.toString()) < stake) {
        throw new Error('Le joueur n\'a pas assez de solde')
      }

      // Deduct stakes from BOTH players
      await createTransactionInTx(
        tx,
        creatorId,
        'STAKE',
        -stake,
        matchId,
        'Mise pour défi'
      )

      await createTransactionInTx(
        tx,
        joinRequest.userId,
        'STAKE',
        -stake,
        matchId,
        'Mise pour défi'
      )

      // Create MatchPlayer records
      await tx.matchPlayer.create({
        data: {
          matchId,
          userId: creatorId
        }
      })

      await tx.matchPlayer.create({
        data: {
          matchId,
          userId: joinRequest.userId
        }
      })

      // Update join request status
      await tx.joinRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' }
      })

      // Reject all other pending requests for this match
      await tx.joinRequest.updateMany({
        where: {
          matchId,
          id: { not: requestId },
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      })

      // Update match to COUNTDOWN status with game seed
      const countdownStartTime = new Date()
      const gameSeed = crypto.randomUUID()
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'COUNTDOWN',
          gameSeed: gameSeed,
          startedAt: countdownStartTime
        }
      })

      return { countdownStartTime }
    })

    return {
      success: true,
      countdownStartTime: result.countdownStartTime
    }
  } catch (error: any) {
    console.error('Accept join request error:', error)
    return {
      success: false,
      error: error?.message || 'Erreur lors de l\'acceptation'
    }
  }
}

// Reject join request
export async function rejectJoinRequest(
  matchId: string,
  creatorId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify creator owns the match
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })

    if (!match || match.createdBy !== creatorId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update request status
    await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    })

    // If this was the only pending request, set match back to WAITING
    const pendingRequests = await prisma.joinRequest.count({
      where: {
        matchId,
        status: 'PENDING'
      }
    })

    if (pendingRequests === 0) {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'WAITING' }
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Reject join request error:', error)
    return {
      success: false,
      error: error?.message || 'Erreur lors du rejet'
    }
  }
}

// Start match after 10-second countdown
export async function startMatchAfterCountdown(
  matchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })

    if (!match) {
      console.error('[startMatchAfterCountdown] Match not found:', matchId)
      return { success: false, error: 'Match non trouvé' }
    }

    console.log('[startMatchAfterCountdown] Current match status:', match.status)

    if (match.status !== 'COUNTDOWN') {
      console.error('[startMatchAfterCountdown] Invalid status. Expected COUNTDOWN, got:', match.status)
      return { success: false, error: `Match n'est pas en compte à rebours (status: ${match.status})` }
    }

    // Validate that gameSeed was set during acceptJoinRequest
    if (!match.gameSeed) {
      console.error('[startMatchAfterCountdown] No gameSeed found for match in COUNTDOWN status:', matchId)
      return { success: false, error: 'État de match invalide - pas de seed' }
    }

    console.log('[startMatchAfterCountdown] Using existing gameSeed, transitioning to ACTIVE')

    // Update to ACTIVE - PRESERVE the existing gameSeed!
    // The seed was already generated in acceptJoinRequest for deterministic gameplay
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'ACTIVE',
        // DO NOT regenerate gameSeed - it was already set in acceptJoinRequest
        // Preserving the seed ensures both players get the same game state
        startedAt: new Date()
      }
    })

    console.log('[startMatchAfterCountdown] Match started successfully:', matchId)
    return { success: true }
  } catch (error: any) {
    console.error('[startMatchAfterCountdown] Error:', error)
    return {
      success: false,
      error: error?.message || 'Erreur lors du démarrage'
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
