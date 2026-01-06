'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, t } from '@/lib/utils'
import type { User } from '@/lib/auth'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'

export default function GamePage() {
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

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card">
            <h2 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '22px' }}>
              {lang === 'ar' ? 'كيف تريد اللعب؟' : 'Comment voulez-vous jouer?'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href={`/create?game=${game.slug}`} className="btn btn-success" style={{ textDecoration: 'none' }}>
                {t('create_challenge', lang)}
              </Link>

              <Link href={`/lobby?game=${game.slug}`} className="btn" style={{ textDecoration: 'none' }}>
                {t('join_lobby', lang)}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <MobileNav lang={lang} onToggleLang={toggleLang} />
    </div>
  )
}
