// Prisma Client - Single instance for the app
import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL
  if (process.env.NODE_ENV !== 'production') {
    console.log('DB URL available:', !!url)
  }

  // Log the host to verify connection (security: masks password)
  if (url && typeof url === 'string') {
    try {
      const masked = url.replace(/:[^:@]*@/, ':****@')
      console.log('🔌 PRISMA CONNECTING TO:', masked)
    } catch (e) {
      console.log('🔌 PRISMA CONNECTING (Failed to mask URL)')
    }
  }

  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: url,
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

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

