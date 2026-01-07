
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')

        if (key !== 'setup123') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Create Admin
        const passwordHash = await bcrypt.hash('admin', 10)
        const admin = await prisma.adminAccount.upsert({
            where: { username: 'admin' },
            update: {
                passwordHash // Reset password if exists
            },
            create: {
                username: 'admin',
                passwordHash,
            },
        })

        // 2. Seed Games - NEW 4-GAME LINEUP
        const games = [
            {
                name: 'Memory',
                nameAr: 'الذاكرة',
                slug: 'memory',
                description: 'Match pairs of cards',
                descriptionAr: 'طابق أزواج البطاقات',
                isActive: true
            },
            {
                name: 'Rocket',
                nameAr: 'الصاروخ',
                slug: 'rocket',
                description: 'Dodge falling obstacles',
                descriptionAr: 'تفادى العقبات الساقطة',
                isActive: true
            },
            {
                name: 'Sequence',
                nameAr: 'التسلسل',
                slug: 'sequence',
                description: 'Remember and repeat patterns',
                descriptionAr: 'تذكر وكرر الأنماط',
                isActive: true
            },
            {
                name: 'Dollars',
                nameAr: 'الدولارات',
                slug: 'dollars',
                description: 'Catch falling dollars',
                descriptionAr: 'اجمع الدولارات الساقطة',
                isActive: true
            },
        ]

        for (const game of games) {
            await prisma.game.upsert({
                where: { slug: game.slug },
                update: {
                    description: game.description,
                    descriptionAr: game.descriptionAr
                },
                create: game
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Admin recovered (admin/admin) and Games seeded.',
            adminId: admin.id
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
