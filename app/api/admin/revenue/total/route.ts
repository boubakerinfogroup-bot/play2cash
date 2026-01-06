import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Get all completed revenue records (5% platform commission)
        const result = await prisma.platformRevenue.aggregate({
            _sum: {
                amount: true
            }
        })

        const total = result._sum.amount || 0

        return NextResponse.json({
            success: true,
            total: Number(total)
        })
    } catch (error: any) {
        console.error('Error fetching revenue total:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            total: 0
        }, { status: 500 })
    }
}
