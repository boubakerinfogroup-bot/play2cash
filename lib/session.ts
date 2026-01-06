// Simple session management using cookies
import { cookies } from 'next/headers'

export async function setUserSession(userId: string, lang: 'fr' | 'ar' = 'fr') {
  const cookieStore = await cookies()
  cookieStore.set('user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  cookieStore.set('language', lang, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

export async function getUserSession(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('user_id')?.value || null
}

export async function getLanguageSession(): Promise<'fr' | 'ar'> {
  const cookieStore = await cookies()
  return (cookieStore.get('language')?.value as 'fr' | 'ar') || 'fr'
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
}

