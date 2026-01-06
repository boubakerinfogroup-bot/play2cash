
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

        // 2. Seed Games (Light version)
        const games = [
            { name: 'Fast Math Duel', nameAr: 'مباراة الرياضيات السريعة', slug: 'fast-math', isActive: true },
            { name: 'Memory Grid', nameAr: 'مباراة الذاكرة', slug: 'memory-grid', isActive: true },
            { name: 'Memory Card', nameAr: 'بطاقات الذاكرة', slug: 'memory-card', isActive: true },
            { name: 'Trivia Duel', nameAr: 'المعلومات العامة', slug: 'trivia', isActive: true },
            { name: 'Color Run', nameAr: 'سباق الألوان', slug: 'color-run', isActive: true },
            { name: 'Logic Maze', nameAr: 'متاهة المنطق', slug: 'logic-maze', isActive: true },
        ]

        for (const game of games) {
            await prisma.game.upsert({
                where: { slug: game.slug },
                update: {},
                create: {
                    ...game,
                    description: 'Game description',
                    descriptionAr: 'الوصف',
                }
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
