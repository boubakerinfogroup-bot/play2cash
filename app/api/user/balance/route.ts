import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Get fresh user balance from database
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
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
