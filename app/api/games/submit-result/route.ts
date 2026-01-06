// Submit Game Result API Route
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

    const { matchId, score, gameData } = await request.json()

    if (!matchId || score === undefined) {
      return NextResponse.json(
        { success: false, error: 'Match ID and score are required' },
        { status: 400 }
      )
    }

    // Verify user is in match
    const matchPlayer = await prisma.matchPlayer.findFirst({
      where: {
        matchId,
        userId: user.id
      },
      include: {
        match: true
      }
    })

    if (!matchPlayer) {
      return NextResponse.json(
        { success: false, error: 'You are not in this match' },
        { status: 403 }
      )
    }

    if (matchPlayer.match.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Match is not active' },
        { status: 400 }
      )
    }

    // Use saveGameResult from lib/matches (handles resolution logic)
    const { saveGameResult } = await import('@/lib/matches')
    const result = await saveGameResult(matchId, user.id, score, gameData || {})
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to save result' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Submit result error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// resolveMatch is handled in saveGameResult function

