// Admin Authentication
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string }
    const admin = await prisma.adminAccount.findUnique({
      where: { id: decoded.adminId }
    })

    return admin
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }
  return admin
}

