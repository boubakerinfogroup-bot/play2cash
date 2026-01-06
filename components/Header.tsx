'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { User } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface HeaderProps {
  user: User | null
  lang?: 'fr' | 'ar'
}

export default function Header({ user, lang = 'fr' }: HeaderProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="header glass">
      {/* Left: Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
        <img src="/logo.svg" alt="P2C" className="logo-img" style={{ height: '32px', width: 'auto' }} />
      </Link>

      {/* Center: Balance Pill */}
      {user && (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1
        }}>
          <div className="balance-pill">
            <span>{formatCurrency(user.balance, lang)}</span>
            <svg
              onClick={handleRefresh}
              className="refresh-icon"
              style={{ transform: isRefreshing ? 'rotate(360deg)' : 'none' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
              <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
            </svg>
          </div>
        </div>
      )}

      {/* Right: Actions */}
      {user && (
        <div className="user-info" style={{ zIndex: 10 }}>
          <Link href="/logout" className="icon-btn" title={lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}>
            <img src="/logout.png" alt="Logout" width="20" height="20" />
          </Link>
        </div>
      )}
    </div>
  )
}
