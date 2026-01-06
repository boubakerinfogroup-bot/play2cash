import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { acceptJoinRequest } from '@/lib/matches'

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

        const matchId = params.id
        const { requestId } = await request.json()

        if (!requestId) {
            return NextResponse.json(
                { success: false, error: 'Request ID required' },
                { status: 400 }
            )
        }

        const result = await acceptJoinRequest(matchId, user.id, requestId)

        if (result.success) {
            return NextResponse.json({
                success: true,
                countdownStartTime: result.countdownStartTime
            })
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            )
        }
    } catch (error: any) {
        console.error('Accept join error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
