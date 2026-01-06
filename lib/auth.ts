// Secure Authentication - NO passwords for users
// Security Logic: Name + WhatsApp + Email must ALL match to access account
// - If ALL 3 are new → Create new account
// - If ALL 3 match existing user → Login
// - If ANY mismatch → Show specific error

import { prisma, generateAccountId } from './db'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'

export interface User {
  id: string
  name: string
  whatsapp: string
  email: string
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
    const trimmedName = name.trim()
    const trimmedWhatsapp = whatsapp.trim()
    const trimmedEmail = email.trim().toLowerCase()

    // Check if ANY of the identifiers exist in the database
    const existingByWhatsapp = await prisma.user.findUnique({
      where: { whatsapp: trimmedWhatsapp }
    })

    const existingByEmail = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    })

    const existingByName = await prisma.user.findUnique({
      where: { name: trimmedName }
    })

    // Case 1: All three match the same user - ALLOW LOGIN
    if (existingByWhatsapp && existingByEmail && existingByName) {
      // Check if they all belong to the same user
      if (
        existingByWhatsapp.id === existingByEmail.id &&
        existingByEmail.id === existingByName.id
      ) {
        // Perfect match - login the user
        const user = formatUser(existingByWhatsapp)
        await createSession(user.id, language)
        return {
          success: true,
          user
        }
      }
    }

    // Case 2: ANY identifier exists but not all match - DENY with specific error
    if (existingByWhatsapp) {
      // WhatsApp exists, check if other fields match
      if (existingByWhatsapp.name !== trimmedName) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Nom d\'utilisateur incorrect pour ce numéro WhatsApp'
            : 'اسم المستخدم غير صحيح لرقم الواتساب هذا'
        }
      }
      if (existingByWhatsapp.email !== trimmedEmail) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Email incorrect pour ce numéro WhatsApp'
            : 'البريد الإلكتروني غير صحيح لرقم الواتساب هذا'
        }
      }
    }

    if (existingByEmail) {
      // Email exists, check if other fields match
      if (existingByEmail.whatsapp !== trimmedWhatsapp) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Numéro WhatsApp incorrect pour cet email'
            : 'رقم الواتساب غير صحيح لهذا البريد الإلكتروني'
        }
      }
      if (existingByEmail.name !== trimmedName) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Nom d\'utilisateur incorrect pour cet email'
            : 'اسم المستخدم غير صحيح لهذا البريد الإلكتروني'
        }
      }
    }

    if (existingByName) {
      // Name exists, check if other fields match
      if (existingByName.whatsapp !== trimmedWhatsapp) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Numéro WhatsApp incorrect pour ce nom d\'utilisateur'
            : 'رقم الواتساب غير صحيح لاسم المستخدم هذا'
        }
      }
      if (existingByName.email !== trimmedEmail) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Email incorrect pour ce nom d\'utilisateur'
            : 'البريد الإلكتروني غير صحيح لاسم المستخدم هذا'
        }
      }
    }

    // Case 3: None of the identifiers exist - CREATE NEW ACCOUNT
    const accountId = await generateAccountId()

    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        whatsapp: trimmedWhatsapp,
        email: trimmedEmail,
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
    console.error('Authentication error:', error)

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'whatsapp') {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Ce numéro WhatsApp est déjà utilisé'
            : 'رقم الواتساب مستخدم بالفعل'
        }
      }
      if (field === 'email') {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Cet email est déjà utilisé'
            : 'البريد الإلكتروني مستخدم بالفعل'
        }
      }
      if (field === 'name') {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Ce nom d\'utilisateur est déjà utilisé'
            : 'اسم المستخدم مستخدم بالفعل'
        }
      }
    }

    return {
      success: false,
      user: null,
      error: error?.message || 'Erreur lors de l\'authentification'
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
