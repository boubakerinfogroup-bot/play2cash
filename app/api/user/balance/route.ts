import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Get fresh user balance from database
// Supports both authenticated session and userId parameter
export async function GET(request: NextRequest) {
  try {
    // First, try to get the authenticated user from session
    const sessionUser = await getCurrentUser()

    // If no session user, check for userId parameter
    const userIdParam = request.nextUrl.searchParams.get('userId')

    // Determine which user ID to use
    const userId = sessionUser?.id || userIdParam

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required or User ID parameter needed'
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        email: true,
        balance: true,
        languagePreference: true,
        isAdmin: true
      }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      balance: Number(user.balance),
      user: {
        ...user,
        balance: Number(user.balance)
      }
    })
  } catch (error: any) {
    console.error('Get balance error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
