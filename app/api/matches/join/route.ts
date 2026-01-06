// Join Match API Route
import { NextRequest, NextResponse } from 'next/server'
import { joinMatch } from '@/lib/matches'
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

    const { matchId } = await request.json()

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'Match ID is required' },
        { status: 400 }
      )
    }

    const result = await joinMatch(matchId, user.id)

    if (result.success) {
      return NextResponse.json({
        success: true,
        matchId
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to join match' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Join match error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

