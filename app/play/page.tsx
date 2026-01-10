'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { User } from '@/lib/types'
import GameWrapper from '@/components/games/GameWrapper'
import { matchesAPI } from '@/lib/api-client'
import { useQuitPrevention } from '@/hooks/useQuitPrevention'

import { Suspense } from 'react'

function PlayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match')

  const [user, setUser] = useState<User | null>(null)
  const [match, setMatch] = useState<any>(null)
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  // Quit prevention - enabled when game is active
  useQuitPrevention({
    enabled: gameStarted && !!match && match.status === 'ACTIVE',
    matchId: matchId || undefined,
    onQuit: async () => {
      // Process forfeit
      if (matchId) {
        try {
          await matchesAPI.cancel(matchId)
        } catch (error) {
          console.error('Forfeit error:', error)
        }
        router.push(`/result?match=${matchId}`)
      }
    }
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    const langStr = localStorage.getItem('language') || 'fr'

    if (!userStr) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userStr))
    setLang(langStr as 'fr' | 'ar')

    if (matchId) {
      loadMatch(matchId)
    } else {
      router.push('/')
    }
  }, [matchId, router])

  const loadMatch = async (id: string) => {
    try {
      const data = await matchesAPI.get(id)

      if (data.match) {
        // Check if user is in this match
        const userInMatch = data.match.players.some((p: any) => p.userId === user?.id)

        if (!userInMatch) {
          router.push('/')
          return
        }

        // Redirect if completed
        if (data.match.status === 'COMPLETED') {
          router.push(`/result?match=${id}`)
          return
        }

        // If not COUNTDOWN or ACTIVE yet, wait
        if (data.match.status !== 'ACTIVE' && data.match.status !== 'COUNTDOWN') {
          router.push(`/waiting?match=${id}`)
          return
        }

        setMatch(data.match)

        // Always show countdown for clear game start indication
        startCountdown()
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading match:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(3)

    setTimeout(() => setCountdown(2), 1000)
    setTimeout(() => setCountdown(1), 2000)
    setTimeout(() => {
      setCountdown(null)
      setGameStarted(true)
    }, 3000)
  }

  // Poll match status
  useEffect(() => {
    if (!matchId || !gameStarted) return

    const interval = setInterval(() => {
      matchesAPI.get(matchId)
        .then(data => {
          if (data.match && data.match.status === 'COMPLETED') {
            router.push(`/result?match=${matchId}`)
          }
        })
        .catch(err => console.error('Error checking match:', err))
    }, 2000)

    return () => clearInterval(interval)
  }, [matchId, gameStarted, router])

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!match || !user) {
    return null
  }

  // Show countdown overlay
  if (countdown !== null) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div className="glass-card" style={{
          padding: '60px',
          textAlign: 'center',
          animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>
            {lang === 'ar' ? '🎮 استعد للعب!' : '🎮 Préparez-vous!'}
          </h2>
          <div style={{
            fontSize: '120px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '20px 0',
            fontFamily: 'var(--font-jakarta)',
            textShadow: '0 10px 30px rgba(234, 179, 8, 0.3)'
          }}>
            {countdown}
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '1.25rem', marginTop: '20px' }}>
            {lang === 'ar' ? 'اللعبة ستبدأ قريباً...' : 'Le jeu commence bientôt...'}
          </p>
        </div>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  // Find game slug and seed from match
  const gameSlug = (match as any).gameSlug || (match as any).game?.slug || ''
  const gameSeed = (match as any).gameSeed || (match as any).game_seed || ''

  // Game area - load the specific game component
  return (
    <div className={lang === 'ar' ? 'arabic-text' : ''} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Simplified Glass Header for Gameplay */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg" alt="Play to Cash" className="logo-img" style={{ height: '32px', width: 'auto' }} />
        </Link>
        <div style={{
          padding: '8px 16px',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '20px',
          color: '#4f46e5',
          fontWeight: 700,
          boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.2)'
        }}>
          {formatCurrency(user.balance, lang)}
        </div>
      </div>

      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div className="glass-card" style={{ flex: 1, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <GameWrapper
            matchId={matchId || ''}
            gameSlug={gameSlug}
            gameSeed={gameSeed}
            userId={user.id}
            lang={lang}
          />
        </div>
      </div>
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="container flex-center" style={{ minHeight: '80vh' }}><div className="spinner"></div></div>}>
      <PlayContent />
    </Suspense>
  )
}

