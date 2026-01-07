'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'
import { formatCurrency, t } from '@/lib/utils'
import type { User } from '@/lib/auth'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [games, setGames] = useState<any[]>([])
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user')
    const langStr = localStorage.getItem('language') || 'fr'

    if (!userStr) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userStr))
    setLang(langStr as 'fr' | 'ar')

    // Load games
    loadGames()
  }, [router])

  const loadGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()

      if (data.games) {
        setGames(data.games)
      }
    } catch (error) {
      console.error('Error loading games:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'ar' : 'fr'
    setLang(newLang)
    localStorage.setItem('language', newLang)
    // Reload page to apply language change
    window.location.reload()
  }

  const gameIcons: Record<string, string> = {
    'memory': '🧠',
    'rocket': '🚀',
    'sequence': '🎯',
    'rps': '✊',
    'tictactoe': '⭕',
    'pattern': '🔒',
    'banker': '💰'
  }

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={lang === 'ar' ? 'arabic-text' : ''}>
      <Header user={user} lang={lang} />

      <div className="container">


        <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', gap: '12px', maxWidth: '600px', margin: '0 auto 20px' }}>
          <Link href="/lobby" className="btn" style={{ flex: 1 }}>
            {lang === 'ar' ? '🎮 جميع الغرف الحية' : '🎮 Toutes les salles'}
          </Link>
          <Link href="/test-game" className="btn" style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            {lang === 'ar' ? '🎯 تدريب' : '🎯 Entraînement'}
          </Link>
        </div>

        <div className="game-grid">
          {games.map((game, index) => {
            const iconSrc = gameIcons[game.slug]
            const isImage = iconSrc && iconSrc.endsWith('.png')
            return (
              <Link
                key={game.id}
                href={`/game?slug=${game.slug}`}
                className="game-card glass-card animate-slide-up"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
                  {isImage ? (
                    <img src={iconSrc} alt={game.name} className="game-icon" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '80px' }}>{iconSrc || '🎮'}</span>
                  )}
                </div>
                <h3 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                  {lang === 'ar' && game.nameAr ? game.nameAr : game.name}
                </h3>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px', fontSize: '0.95rem' }}>
                  {lang === 'ar' && game.descriptionAr ? game.descriptionAr : game.description}
                </p>
                <div className="btn" style={{ width: '100%', marginTop: 'auto' }}>
                  {t('play', lang)}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <Link href="/" className="active">
          <img src="/home.png" alt="Home" width="24" height="24" />
          <span>{lang === 'ar' ? 'الرئيسية' : 'Accueil'}</span>
        </Link>
        <Link href="/profile">
          <img src="/profile.png" alt="Profile" width="24" height="24" />
          <span>{t('profile', lang)}</span>
        </Link>
        <a href="#" onClick={(e) => { e.preventDefault(); toggleLang(); }}>
          <img src={lang === 'ar' ? '/french.png' : '/arabic.png'} alt={lang === 'ar' ? 'Français' : 'العربية'} width="24" height="24" style={{ borderRadius: '2px' }} />
          <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
        </a>
      </nav>

      {/* DEBUG BUTTON - Only in development */}
      <Link
        href="/test-game"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.5)',
          cursor: 'pointer',
          zIndex: 9999,
          textDecoration: 'none',
          border: '3px solid white'
        }}
        title="Test Games"
      >
        🎮
      </Link>
    </div>
  )
}

