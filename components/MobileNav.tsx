'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { t } from '@/lib/utils'

interface MobileNavProps {
  lang: 'fr' | 'ar'
  onToggleLang: () => void
}

export default function MobileNav({ lang, onToggleLang }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="mobile-nav">
      <Link href="/" className={pathname === '/' ? 'active' : ''}>
        <img src="/home.png" alt="Home" width="24" height="24" />
        <span>{lang === 'ar' ? 'الرئيسية' : 'Accueil'}</span>
      </Link>
      <Link href="/profile" className={pathname === '/profile' ? 'active' : ''}>
        <img src="/profile.png" alt="Profile" width="24" height="24" />
        <span>{t('profile', lang)}</span>
      </Link>
      <a href="https://wa.me/21629616525" target="_blank" rel="noopener noreferrer">
        <img src="/whatsapp.png" alt="WhatsApp" width="24" height="24" />
        <span>WhatsApp</span>
      </a>
      <a href="#" onClick={(e) => { e.preventDefault(); onToggleLang(); }} className={pathname === '/lang-toggle' ? 'active' : ''}>
        <img
          src={lang === 'ar' ? '/french.png' : '/arabic.png'}
          alt={lang === 'ar' ? 'Français' : 'العربية'}
          width="24"
          height="24"
          style={{ borderRadius: '2px', objectFit: 'cover', display: 'block' }}
        />
        <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
      </a>
    </nav>
  )
}

