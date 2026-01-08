import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
    try {
        console.log('Testing database connection...')

        // Try to fetch a user count
        const userCount = await prisma.user.count()
        console.log('✅ Database connection successful!')
        console.log(`Found ${userCount} users in the database`)

        // Try to fetch games
        const gameCount = await prisma.game.count()
        console.log(`Found ${gameCount} games in the database`)

        await prisma.$disconnect()
        process.exit(0)
    } catch (error) {
        console.error('❌ Database connection failed:')
        console.error(error)
        await prisma.$disconnect()
        process.exit(1)
    }
}

testConnection()
