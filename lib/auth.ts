// Secure Authentication - NO passwords for users
// Security Logic: Name + WhatsApp + Email must ALL match to access account
// - WhatsApp is the PRIMARY unique identifier (enforced in DB)
// - Name and Email uniqueness is enforced in application logic
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

    // Find all users that match ANY of the identifiers
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { whatsapp: trimmedWhatsapp },
          { email: trimmedEmail },
          { name: trimmedName }
        ]
      }
    })

    // Case 1: No existing users - CREATE NEW ACCOUNT
    if (users.length === 0) {
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
    }

    // Case 2: Check if all three identifiers match THE SAME user
    const exactMatch = users.find(
      u => u.name === trimmedName &&
        u.whatsapp === trimmedWhatsapp &&
        u.email === trimmedEmail
    )

    if (exactMatch) {
      // Perfect match - login
      const user = formatUser(exactMatch)
      await createSession(user.id, language)
      return {
        success: true,
        user
      }
    }

    // Case 3: Partial match - someone is trying to access with wrong credentials
    // Find which field(s) are wrong
    const userByWhatsapp = users.find(u => u.whatsapp === trimmedWhatsapp)
    const userByEmail = users.find(u => u.email === trimmedEmail)
    const userByName = users.find(u => u.name === trimmedName)

    if (userByWhatsapp) {
      // WhatsApp exists but other fields don't match
      if (userByWhatsapp.name !== trimmedName) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Nom incorrect. Ce numéro WhatsApp est déjà utilisé avec un autre nom. Vérifiez vos informations ou utilisez un autre numéro pour créer un nouveau compte.'
            : 'اسم غير صحيح. رقم الواتساب هذا مستخدم بالفعل باسم آخر. تحقق من معلوماتك أو استخدم رقمًا آخر لإنشاء حساب جديد.'
        }
      }
      if (userByWhatsapp.email !== trimmedEmail) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Email incorrect. Ce numéro WhatsApp est déjà utilisé avec un autre email. Vérifiez vos informations ou utilisez un autre numéro pour créer un nouveau compte.'
            : 'بريد غير صحيح. رقم الواتساب هذا مستخدم بالفعل ببريد آخر. تحقق من معلوماتك أو استخدم رقمًا آخر لإنشاء حساب جديد.'
        }
      }
    }

    if (userByEmail) {
      // Email exists but other fields don't match
      if (userByEmail.whatsapp !== trimmedWhatsapp) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Numéro WhatsApp incorrect. Cet email est déjà utilisé avec un autre numéro. Vérifiez vos informations ou utilisez un autre email pour créer un nouveau compte.'
            : 'رقم واتساب غير صحيح. هذا البريد مستخدم بالفعل برقم آخر. تحقق من معلوماتك أو استخدم بريدًا آخر لإنشاء حساب جديد.'
        }
      }
      if (userByEmail.name !== trimmedName) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Nom incorrect. Cet email est déjà utilisé avec un autre nom. Vérifiez vos informations ou utilisez un autre email pour créer un nouveau compte.'
            : 'اسم غير صحيح. هذا البريد مستخدم بالفعل باسم آخر. تحقق من معلوماتك أو استخدم بريدًا آخر لإنشاء حساب جديد.'
        }
      }
    }

    if (userByName) {
      // Name exists but other fields don't match
      if (userByName.whatsapp !== trimmedWhatsapp) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Numéro WhatsApp incorrect. Ce nom est déjà utilisé avec un autre numéro. Vérifiez vos informations ou utilisez un autre nom pour créer un nouveau compte.'
            : 'رقم واتساب غير صحيح. هذا الاسم مستخدم بالفعل برقم آخر. تحقق من معلوماتك أو استخدم اسمًا آخر لإنشاء حساب جديد.'
        }
      }
      if (userByName.email !== trimmedEmail) {
        return {
          success: false,
          user: null,
          error: language === 'fr'
            ? 'Email incorrect. Ce nom est déjà utilisé avec un autre email. Vérifiez vos informations ou utilisez un autre nom pour créer un nouveau compte.'
            : 'بريد غير صحيح. هذا الاسم مستخدم بالفعل ببريد آخر. تحقق من معلوماتك أو استخدم اسمًا آخر لإنشاء حساب جديد.'
        }
      }
    }

    // Shouldn't reach here, but just in case
    return {
      success: false,
      user: null,
      error: language === 'fr'
        ? 'Erreur d\'authentification. Vérifiez vos informations.'
        : 'خطأ في المصادقة. تحقق من معلوماتك.'
    }
  } catch (error: any) {
    console.error('Authentication error:', error)

    // Handle unique constraint violations (for WhatsApp which is unique in DB)
    if (error.code === 'P2002') {
      return {
        success: false,
        user: null,
        error: language === 'fr'
          ? 'Ce numéro WhatsApp est déjà utilisé'
          : 'رقم الواتساب مستخدم بالفعل'
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
