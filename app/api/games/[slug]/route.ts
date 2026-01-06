// Get game by slug API Route
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: { slug: params.slug, isActive: true }
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ game })
  } catch (error: any) {
    console.error('Error loading game:', error)
    return NextResponse.json(
      { error: 'Failed to load game' },
      { status: 500 }
    )
  }
}

