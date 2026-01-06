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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.2, zIndex: -1
            }} />
            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '8px', zIndex: 1, position: 'relative' }}>
              {lang === 'ar' && game.nameAr ? game.nameAr : game.name}
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>

            {/* Create Option */}
            <Link href={`/create?game=${game.slug}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{
                padding: '40px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = '#10b981'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'; }}
              >
                <div style={{
                  width: '100px', height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '48px', marginBottom: '24px',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>
                  {t('create_challenge', lang)}
                </h2>
              </div>
            </Link>

            {/* Join Option */}
            <Link href={`/lobby?game=${game.slug}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{
                padding: '40px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = '#4f46e5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'; }}
              >
                <div style={{
                  width: '100px', height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '40px', marginBottom: '24px',
                  boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13.1999L12 21.9999L21 13.1999M3 6.60001L12 15.4L21 6.60001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>
                  {t('join_lobby', lang)}
                </h2>
              </div>
            </Link>

          </div>
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
