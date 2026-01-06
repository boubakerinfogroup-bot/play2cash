// Prisma Client - Single instance for the app
import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper function to generate account_id (P2C-XXXXX)
export async function generateAccountId(): Promise<string> {
  const lastUser = await prisma.user.findFirst({
    where: {
      accountId: {
        startsWith: 'P2C-'
      }
    },
    orderBy: {
      accountId: 'desc'
    }
  })

  let nextId = 1
  if (lastUser?.accountId) {
    const lastNum = parseInt(lastUser.accountId.replace('P2C-', ''))
    nextId = lastNum + 1
  }

  return `P2C-${String(nextId).padStart(5, '0')}`
}

