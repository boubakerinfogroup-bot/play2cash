// Create Withdrawal Request API Route
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

    const { amount: rawAmount, whatsapp } = await request.json()
    const amountStr = rawAmount ? String(rawAmount).replace(',', '.') : '0'
    const amount = parseFloat(amountStr)

    if (isNaN(amount) || amount <= 0) {
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

    // Check balance
    if (user.balance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Check for existing pending request
    const existing = await prisma.withdrawalRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending withdrawal request' },
        { status: 400 }
      )
    }

    // Create request
    await prisma.withdrawalRequest.create({
      data: {
        userId: user.id,
        amount: amount,
        whatsapp: whatsapp.trim()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error creating withdrawal request:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

