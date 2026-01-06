'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, t, getAllowedStakes } from '@/lib/utils'
import type { User } from '@/lib/auth'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import BottomSheet from '@/components/BottomSheet'

export default function LobbyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameSlug = searchParams.get('game')

  const [user, setUser] = useState<User | null>(null)
  const [game, setGame] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [stakeFilter, setStakeFilter] = useState<number | ''>('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const allowedStakes = getAllowedStakes()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    const langStr = localStorage.getItem('language') || 'fr'

    if (!userStr) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userStr))
    setLang(langStr as 'fr' | 'ar')

    if (gameSlug) {
      loadGame(gameSlug)
    }

    loadMatches()
  }, [gameSlug, router, stakeFilter])

  const loadGame = async (slug: string) => {
    try {
      const response = await fetch(`/api/games/${slug}`)
      const data = await response.json()
      if (data.game) {
        setGame(data.game)
      }
    } catch (error) {
      console.error('Error loading game:', error)
    }
  }

  const loadMatches = async () => {
    try {
      const params = new URLSearchParams()
      if (game?.id) {
        params.append('gameId', game.id)
      }
      if (stakeFilter) {
        params.append('stake', String(stakeFilter))
      }

      const response = await fetch(`/api/matches/open?${params.toString()}`)
      const data = await response.json()

      if (data.matches) {
        const filtered = data.matches.filter((m: any) => m.createdBy !== user?.id)
        setMatches(filtered)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      loadMatches()
    }, 5000)

    return () => clearInterval(interval)
  }, [game, stakeFilter, user])

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'ar' : 'fr'
    setLang(newLang)
    localStorage.setItem('language', newLang)
    window.location.reload()
  }

  // Filter Options for BottomSheet
  const filterOptions = [
    { label: lang === 'ar' ? 'الكل' : 'Tous', value: '' },
    ...allowedStakes.map(s => ({ label: formatCurrency(s, lang), value: s }))
  ]

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={lang === 'ar' ? 'arabic-text' : ''}>
      <Header user={user} lang={lang} />

      <div className="container">
        {game && (
          <h1 className="gradient-text" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '32px' }}>
            {lang === 'ar' ? game.nameAr : game.name}
          </h1>
        )}

        {searchParams.get('error') && (
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto 20px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#dc2626', textAlign: 'center' }}>
            ⚠️ {decodeURIComponent(searchParams.get('error') as string)}
          </div>
        )}

        <div className="glass-card" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
          {/* Header Row: Title & Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {lang === 'ar' ? 'جميع الغرف' : 'Salles disponibles'}
            </h2>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="btn"
              style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', boxShadow: 'none' }}
            >
              {stakeFilter ? formatCurrency(Number(stakeFilter), lang) : (lang === 'ar' ? 'تصفية 🔽' : 'Filtrer 🔽')}
            </button>
          </div>

          {/* List of Matches */}
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>
                {lang === 'ar' ? 'لا توجد تحديات متاحة حالياً' : 'Aucun défi disponible pour le moment'}
              </p>
              <Link href="/" className="btn" style={{ width: '100%' }}>
                {lang === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Retour à l\'accueil'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matches.map((match) => (
                <div key={match.id} style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      background: 'var(--gradient-main)',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 'bold'
                    }}>
                      VS
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{match.createdByName}</div>
                      <div style={{ color: '#6366f1', fontWeight: 600 }}>{formatCurrency(match.stake, lang)}</div>
                    </div>
                  </div>

                  <Link
                    href={`/join?match=${match.id}`}
                    onClick={async (e) => {
                      // Logic handled in join page usually, or here
                    }}
                    className="btn"
                    style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  >
                    {lang === 'ar' ? 'لعب' : 'Jouer'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={lang === 'ar' ? 'تصفية حسب المبلغ' : 'Filtrer par mise'}
        options={filterOptions}
        onSelect={(val) => setStakeFilter(val)}
        selectedValue={stakeFilter}
      />

      <MobileNav lang={lang} onToggleLang={toggleLang} />
    </div>
  )
}
