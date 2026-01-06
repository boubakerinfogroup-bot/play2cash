// Create Deposit Request API Route
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

    const { amount, whatsapp } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!whatsapp || whatsapp.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'WhatsApp number required' },
        { status: 400 }
      )
    }

    // Check for existing pending request
    const existing = await prisma.depositRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending deposit request' },
        { status: 400 }
      )
    }

    // Create request
    await prisma.depositRequest.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        whatsapp: whatsapp.trim()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error creating deposit request:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

