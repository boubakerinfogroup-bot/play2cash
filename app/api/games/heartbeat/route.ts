// Game Heartbeat API Route (polling-based like PHP)
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { matchId, action } = await request.json()

    if (!matchId || !action) {
      return NextResponse.json(
        { success: false, error: 'Match ID and action are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'heartbeat':
        // Update last heartbeat
        await prisma.matchPlayer.updateMany({
          where: {
            matchId,
            userId: user.id
          },
          data: {
            lastHeartbeat: new Date()
          }
        })
        return NextResponse.json({ success: true })

      case 'check':
        // Check opponent status
        const match = await prisma.match.findUnique({
          where: { id: matchId },
          include: {
            players: true
          }
        })

        if (!match) {
          return NextResponse.json({ error: 'Match not found' })
        }

        const opponent = match.players.find(p => p.userId !== user.id)

        if (!opponent) {
          return NextResponse.json({ error: 'Opponent not found' })
        }

        // Check if match completed
        if (match.status === 'COMPLETED') {
          return NextResponse.json({
            match_completed: true,
            winner_id: match.winnerId
          })
        }

        // Check if opponent finished
        if (opponent.gameResult) {
          return NextResponse.json({
            opponent_finished: true,
            match_completed: false
          })
        }

        // Check if opponent left
        if (opponent.leftGame) {
          return NextResponse.json({
            opponent_left: true,
            match_completed: false
          })
        }

        // Check disconnect (no heartbeat for > 10 seconds, < 30 seconds)
        const now = new Date()
        const lastHeartbeat = opponent.lastHeartbeat
        let secondsSinceHeartbeat = 0

        if (lastHeartbeat) {
          secondsSinceHeartbeat = (now.getTime() - lastHeartbeat.getTime()) / 1000
        }

        if (lastHeartbeat && secondsSinceHeartbeat > 10 && secondsSinceHeartbeat < 30) {
          return NextResponse.json({
            opponent_disconnected: true,
            seconds_since_heartbeat: secondsSinceHeartbeat,
            match_completed: false
          })
        }

        return NextResponse.json({
          opponent_connected: true,
          match_completed: false
        })

      case 'leave':
        // Mark player as left
        await prisma.matchPlayer.updateMany({
          where: {
            matchId,
            userId: user.id
          },
          data: {
            leftGame: true,
            leftAt: new Date()
          }
        })

        // If match is active, award win to opponent
        const activeMatch = await prisma.match.findUnique({
          where: { id: matchId },
          include: {
            players: true
          }
        })

        if (activeMatch && activeMatch.status === 'ACTIVE') {
          const opponentPlayer = activeMatch.players.find(p => p.userId !== user.id)
          if (opponentPlayer) {
            const { resolveMatch: resolveMatchFn } = await import('@/lib/wallet')
            await resolveMatchFn(matchId, [
              { userId: opponentPlayer.userId, score: 999999 },
              { userId: user.id, score: 0 }
            ])
          }
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Heartbeat error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

