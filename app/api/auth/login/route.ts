// Login/Register API Route
import { NextRequest, NextResponse } from 'next/server'
import { registerOrLogin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { name, whatsapp, email, language } = await request.json()

    if (!name || !whatsapp || !email) {
      return NextResponse.json(
        { success: false, error: 'Name, WhatsApp, and Email are required' },
        { status: 400 }
      )
    }

    const result = await registerOrLogin(name, whatsapp, email, language || 'fr')

    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        user: result.user
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Registration failed' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

