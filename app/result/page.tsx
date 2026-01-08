'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { User } from '@/lib/types'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import { matchesAPI } from '@/lib/api-client'
import { useBalance } from '@/contexts/BalanceContext'
import Confetti from '@/components/Confetti'

import { Suspense } from 'react'

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match')
  const { refreshBalance } = useBalance()

  const [user, setUser] = useState<User | null>(null)
  const [match, setMatch] = useState<any>(null)
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [loading, setLoading] = useState(true)

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
      loadResult(matchId)
    } else {
      router.push('/')
    }
  }, [matchId, router])

  const loadResult = async (id: string) => {
    try {
      const data = await matchesAPI.get(id)

      if (data.match) {
        setMatch(data.match)
        // Refresh balance after match completes
        await refreshBalance()
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading result:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  // Play sounds
  useEffect(() => {
    if (!match || !user) return

    const iWon = match.winnerId === user.id
    const tie = !match.winnerId

    if (iWon) {
      const winSound = new Audio('/assets/sounds/win.mp3')
      winSound.volume = 0.7
      winSound.play().catch(() => { })
    } else if (!tie) {
      const loseSound = new Audio('/assets/sounds/lose.mp3')
      loseSound.volume = 0.7
      loseSound.play().catch(() => { })
    }
  }, [match, user])

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'ar' : 'fr'
    setLang(newLang)
    localStorage.setItem('language', newLang)
    window.location.reload()
  }

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

  const myPlayer = match.players.find((p: any) => p.userId === user.id)
  const opponentPlayer = match.players.find((p: any) => p.userId !== user.id)
  const iWon = match.winnerId === user.id
  const tie = !match.winnerId

  return (
    <div className={lang === 'ar' ? 'arabic-text' : ''}>
      {iWon && <Confetti />}
      <Header user={user} lang={lang} />

      <div className="container" style={{ paddingBottom: '100px' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '20px auto', textAlign: 'center', padding: '40px 24px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#64748b' }}>
            {match.gameName}
          </h1>

          {tie ? (
            <div style={{ animation: 'bounce 1s infinite' }}>
              <div style={{ fontSize: '80px', margin: '0 auto 20px', lineHeight: 1 }}>🤝</div>
              <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {lang === 'ar' ? 'تعادل!' : 'Match nul!'}
              </h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#64748b' }}>
                {lang === 'ar' ? 'تم استرداد المبلغ' : 'Montant remboursé'}
              </p>
            </div>
          ) : iWon ? (
            <div style={{ animation: 'bounce 1s infinite' }}>
              <div style={{ fontSize: '80px', margin: '0 auto 20px', lineHeight: 1 }}>🎉</div>
              <h2 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {lang === 'ar' ? 'فوز!' : 'Victoire!'}
              </h2>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '30px' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '4px', color: '#059669', fontWeight: 600 }}>
                  {lang === 'ar' ? 'رصيدك الجديد' : 'Nouveau solde'}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
                  {formatCurrency(user.balance, lang)}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '80px', margin: '0 auto 20px', lineHeight: 1 }}>😢</div>
              <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {lang === 'ar' ? 'خسارة!' : 'Défaite!'}
              </h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#64748b' }}>
                {lang === 'ar' ? 'حظاً أوفر في المرة القادمة!' : 'Bonne chance la prochaine fois!'}
              </p>
            </div>
          )}

          <div style={{ marginTop: '30px', padding: '24px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#1e293b' }}>
              {lang === 'ar' ? 'النتائج' : 'Résultats'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>{myPlayer?.userName || user.name}</p>
                <p style={{ fontSize: '1.5rem', color: '#4f46e5', fontWeight: 'bold' }}>
                  {myPlayer?.score || 0}
                </p>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>{opponentPlayer?.userName || 'Opponent'}</p>
                <p style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: 'bold' }}>
                  {opponentPlayer?.score || 0}
                </p>
              </div>
            </div>
            <p style={{ color: '#94a3b8', marginTop: '20px', fontSize: '0.85rem' }}>
              {lang === 'ar' ? `المبلغ المراهن: ${formatCurrency(match.stake, lang)}` : `Mise: ${formatCurrency(match.stake, lang)}`}
            </p>
          </div>

          <div style={{ marginTop: '40px' }}>
            <Link href="/" className="btn" style={{ width: '100%', padding: '16px 32px', fontSize: '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>🏠</span>
              {lang === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Retour à l\'accueil'}
            </Link>
          </div>
        </div>
      </div>

      <MobileNav lang={lang} onToggleLang={toggleLang} />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="container flex-center" style={{ minHeight: '80vh' }}><div className="spinner"></div></div>}>
      <ResultContent />
    </Suspense>
  )
}
