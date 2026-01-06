// Seed database with default games and admin account
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Insert games
  const games = [
    {
      name: 'Fast Math Duel',
      nameAr: 'مباراة الرياضيات السريعة',
      description: 'Résolvez des calculs mathématiques. Le premier à répondre incorrectement deux fois perd.',
      descriptionAr: 'حل المسائل الرياضية. أول من يجيب خطأ مرتين يخسر.',
      slug: 'fast-math',
      isActive: true,
    },
    {
      name: 'Memory Grid',
      nameAr: 'مباراة الذاكرة',
      description: 'Retournez les tuiles pour trouver les paires. Le plus rapide à compléter gagne.',
      descriptionAr: 'اقلب البلاط لإيجاد الأزواج. الأسرع في الإكمال يفوز.',
      slug: 'memory-grid',
      isActive: true,
    },
    {
      name: 'Memory Card',
      nameAr: 'بطاقات الذاكرة',
      description: 'Trouvez les paires de cartes avec des symboles/images. Le premier à tout apparier gagne.',
      descriptionAr: 'ابحث عن أزواج البطاقات بالرموز/الصور. أول من يطابق كل شيء يفوز.',
      slug: 'memory-card',
      isActive: true,
    },
    {
      name: 'Trivia Duel',
      nameAr: 'المعلومات العامة',
      description: 'Répondez aux questions de culture générale. Le premier à répondre incorrectement deux fois perd.',
      descriptionAr: 'أجب على أسئلة الثقافة العامة. أول من يجيب خطأ مرتين يخسر.',
      slug: 'trivia',
      isActive: true,
    },
    {
      name: 'Color Run',
      nameAr: 'سباق الألوان',
      description: 'Tapez/glissez sur les tuiles de la bonne couleur en évitant les mauvaises. Score le plus élevé gagne.',
      descriptionAr: 'اضغط/اسحب على البلاط باللون الصحيح وتجنب الخطأ. أعلى نتيجة تفوز.',
      slug: 'color-run',
      isActive: true,
    },
    {
      name: 'Logic Maze',
      nameAr: 'متاهة المنطق',
      description: 'Naviguez un personnage à travers un labyrinthe le plus rapidement possible. Le plus rapide gagne.',
      descriptionAr: 'وجه شخصية عبر متاهة بأسرع ما يمكن. الأسرع يفوز.',
      slug: 'logic-maze',
      isActive: true,
    },
  ]

  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: game,
    })
  }

  console.log('✅ Games seeded')

  // Create admin account
  const passwordHash = await bcrypt.hash('admin', 10)
  await prisma.adminAccount.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
    },
  })

  console.log('✅ Admin account created (username: admin, password: admin)')
  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

