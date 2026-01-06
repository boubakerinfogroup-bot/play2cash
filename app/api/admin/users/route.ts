// Admin Users API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({
      users: users.map(u => {
        // Handle Prisma Decimal type conversion
        // Prisma Decimal is a Decimal.js object that needs toString() then parseFloat
        const balance = parseFloat(u.balance.toString())
        
        return {
          id: u.id,
          name: u.name,
          whatsapp: u.whatsapp,
          email: u.email,
          balance: balance,
          accountId: u.accountId,
          createdAt: u.createdAt.toISOString(),
          isAdmin: u.isAdmin
        }
      })
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

