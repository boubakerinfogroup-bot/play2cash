// Cancel Match API Route
import { NextRequest, NextResponse } from 'next/server'
import { cancelMatch } from '@/lib/matches'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const result = await cancelMatch(params.id, user.id)

    if (result.success) {
      return NextResponse.json({
        success: true
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to cancel match' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Cancel match error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

