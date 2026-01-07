
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

        // 2. Seed Games - FINAL 7 GAMES ONLY
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
                name: 'Rock Paper Scissors',
                nameAr: 'حجر ورقة مقص',
                slug: 'rps',
                description: 'Classic RPS battle',
                descriptionAr: 'معركة حجر ورقة مقص',
                isActive: true
            },
            {
                name: 'Tic-Tac-Toe Plus',
                nameAr: 'إكس أو بلس',
                slug: 'tictactoe',
                description: '4x6 grid, 4 in a row wins',
                descriptionAr: 'شبكة 4x6، 4 متتالية تفوز',
                isActive: true
            },
            {
                name: 'Pattern Lock',
                nameAr: 'قفل النمط',
                slug: 'pattern',
                description: 'Memorize and redraw patterns',
                descriptionAr: 'احفظ وأعد رسم الأنماط',
                isActive: true
            },
            {
                name: 'Banker',
                nameAr: 'المصرفي',
                slug: 'banker',
                description: 'Risk vs reward - race to 200 points',
                descriptionAr: 'مخاطرة مقابل مكافأة - سباق إلى 200 نقطة',
                isActive: true
            }
        ]

        // Delete ALL existing games first
        await prisma.game.deleteMany({})

        // Then create only the 7 new games
        for (const gameData of games) {
            await prisma.game.create({
                data: gameData
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Admin recovered (admin/admin) and 7 Games seeded.',
            adminId: admin.id
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
