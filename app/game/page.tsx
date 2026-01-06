'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, t } from '@/lib/utils'
import type { User } from '@/lib/auth'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'

import { Suspense } from 'react'

function GameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')

  const [user, setUser] = useState<User | null>(null)
  const [game, setGame] = useState<any>(null)
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

    // Load game
    if (slug) {
      loadGame(slug)
    } else {
      router.push('/')
    }
  }, [slug, router])

  const loadGame = async (gameSlug: string) => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()

      if (data.games) {
        const foundGame = data.games.find((g: any) => g.slug === gameSlug)
        if (foundGame) {
          setGame(foundGame)
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Error loading game:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'ar' : 'fr'
    setLang(newLang)
    localStorage.setItem('language', newLang)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!game || !user) {
    return null
  }

  return (
    <div className={lang === 'ar' ? 'arabic-text' : ''}>
      <Header user={user} lang={lang} />

      <div className="container">
        <h1 className="page-title">
          {lang === 'ar' && game.nameAr ? game.nameAr : game.name}
        </h1>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

          {/* Create Option */}
          <Link href={`/create?game=${game.slug}`} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{
              padding: '32px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '80px', height: '80px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', marginBottom: '24px'
              }}>
                +
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                {t('create_challenge', lang)}
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
                {lang === 'ar'
                  ? 'أنشئ غرفتك الخاصة، اختر المبلغ وانتظر منافساً.'
                  : 'Créez votre propre salle, choisissez le montant et attendez un adversaire.'}
              </p>
              <div className="btn btn-success" style={{ marginTop: '24px', width: '100%' }}>
                {lang === 'ar' ? 'إنشاء' : 'Créer'}
              </div>
            </div>
          </Link>

          {/* Join Option */}
          <Link href={`/lobby?game=${game.slug}`} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{
              padding: '32px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '80px', height: '80px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#4f46e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', marginBottom: '24px'
              }}>
                ⚔️
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                {t('join_lobby', lang)}
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
                {lang === 'ar'
                  ? 'تصفح الغرف المتاحة وانضم لتحدي لاعبين آخرين.'
                  : 'Parcourez les salles disponibles et défiez d\'autres joueurs.'}
              </p>
              <div className="btn" style={{ marginTop: '24px', width: '100%', background: 'var(--gradient-btn)' }}>
                {lang === 'ar' ? 'انضمام' : 'Rejoindre'}
              </div>
            </div>
          </Link>

        </div>
      </div>

      <MobileNav lang={lang} onToggleLang={toggleLang} />
    </div>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="container"><div className="spinner"></div></div>}>
      <GameContent />
    </Suspense>
  )
}
