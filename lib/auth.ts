// Simple Authentication - NO passwords for users
// Login = Name + WhatsApp + Email
// If user exists → login, if not → create new user

import { prisma, generateAccountId } from './db'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'

export interface User {
  id: string
  name: string
  whatsapp: string
  email: string | null
  balance: number
  accountId: string | null
  languagePreference: 'fr' | 'ar'
  isAdmin: boolean
}

export async function registerOrLogin(
  name: string,
  whatsapp: string,
  email: string,
  language: 'fr' | 'ar' = 'fr'
): Promise<{ success: boolean; user: User | null; error?: string }> {
  try {
    // Check if user exists by WhatsApp
    const existingUser = await prisma.user.findUnique({
      where: { whatsapp: whatsapp.trim() }
    })

    if (existingUser) {
      // User exists - login (return existing user)
      const user = formatUser(existingUser)
      await createSession(user.id, language)
      return {
        success: true,
        user
      }
    }

    // Create new user (email is required)
    if (!email || email.trim() === '') {
      return {
        success: false,
        user: null,
        error: 'Email requis'
      }
    }

    // Generate account_id
    const accountId = await generateAccountId()

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        balance: 0.00,
        accountId: accountId,
        languagePreference: language,
      }
    })

    const user = formatUser(newUser)
    await createSession(user.id, language)

    return {
      success: true,
      user
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return {
      success: false,
      user: null,
      error: error?.message || 'Erreur lors de l\'inscription'
    }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return null
    }

    return formatUser(user)
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  return user
}

async function createSession(userId: string, language: 'fr' | 'ar') {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
  const cookieStore = await cookies()
  
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  cookieStore.set('language', language, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  cookieStore.delete('language')
}

function formatUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    whatsapp: user.whatsapp,
    email: user.email,
    balance: parseFloat(user.balance.toString()),
    accountId: user.accountId,
    languagePreference: user.languagePreference || 'fr',
    isAdmin: user.isAdmin || false,
  }
}
