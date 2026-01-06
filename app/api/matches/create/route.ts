// Create Match API Route
import { NextRequest, NextResponse } from 'next/server'
import { createMatch } from '@/lib/matches'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { gameId, stake } = await request.json()

    if (!gameId || !stake) {
      return NextResponse.json(
        { success: false, error: 'Game ID and stake are required' },
        { status: 400 }
      )
    }

    const result = await createMatch(gameId, stake, user.id)

    if (result.success && result.matchId) {
      return NextResponse.json({
        success: true,
        match: {
          id: result.matchId,
          shareLink: result.shareLink
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create match' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Create match error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

