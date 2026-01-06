'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, t, getAllowedStakes } from '@/lib/utils'
import type { User } from '@/lib/auth'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import BottomSheet from '@/components/BottomSheet'

export default function CreateChallengePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameSlug = searchParams.get('game')

  const [user, setUser] = useState<User | null>(null)
  const [game, setGame] = useState<any>(null)
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [stake, setStake] = useState<number | ''>('')
  const [isStakeOpen, setIsStakeOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
    } else {
      router.push('/')
    }
  }, [gameSlug, router])

  const loadGame = async (slug: string) => {
    try {
      const response = await fetch(`/api/games/${slug}`)
      const data = await response.json()

      if (data.game) {
        setGame(data.game)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading game:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!stake || !game) {
      setError(lang === 'ar' ? 'يرجى اختيار المبلغ' : 'Veuillez choisir un montant')
      return
    }

    if (!allowedStakes.includes(Number(stake))) {
      setError(lang === 'ar' ? 'المبلغ المحدد غير مسموح به' : 'Le montant spécifié n\'est pas autorisé')
      return
    }

    if (user && user.balance < Number(stake)) {
      setError(lang === 'ar' ? 'رصيدك غير كافٍ' : 'Solde insuffisant')
      return
    }

    // Interactive confirmation via native confirm for now, can be modalized later
    const stakeText = formatCurrency(Number(stake))
    if (!confirm(lang === 'ar' ? `إنشاء غرفة بـ ${stakeText}؟` : `Créer une salle pour ${stakeText}?`)) return

    createMatch()
  }

  const createMatch = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/matches/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          stake: Number(stake)
        })
      })

      const result = await response.json()

      if (result.success && result.matchId) {
        if (user) {
          const updatedUser = { ...user, balance: user.balance - Number(stake) }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
        router.push(`/waiting?match=${result.matchId}`)
      } else {
        setError(result.error || (lang === 'ar' ? 'خطأ في إنشاء التحدي' : 'Erreur lors de la création du défi'))
      }
    } catch (err: any) {
      setError(err.message || (lang === 'ar' ? 'خطأ في إنشاء التحدي' : 'Erreur lors de la création du défi'))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLang = () => {
    const newLang = lang === 'fr' ? 'ar' : 'fr'
    setLang(newLang)
    localStorage.setItem('language', newLang)
    window.location.reload()
  }

  // Stake Options
  const stakeOptions = allowedStakes.map(s => ({
    label: formatCurrency(s, lang),
    value: s,
    disabled: user ? user.balance < s : true,
    description: user && user.balance < s ? (lang === 'ar' ? 'رصيد غير كافٍ' : 'Solde insuffisant') : undefined
  }))

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!game || !user) return null

  return (
    <div className={lang === 'ar' ? 'arabic-text' : ''}>
      <Header user={user} lang={lang} />

      <div className="container" style={{ paddingBottom: '100px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '32px' }}>
          {lang === 'ar' ? 'إنشاء تحدٍ' : 'Créer un défi'}
        </h1>

        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '32px' }}>
          {error && (
            <div className="alert" style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              {lang === 'ar' ? game.nameAr : game.name}
            </h2>
            <p style={{ color: '#64748b' }}>
              {lang === 'ar' ? 'اختر مبلغ الرهان' : 'Choisissez votre mise'}
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div
              onClick={() => setIsStakeOpen(true)}
              className="form-control"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                fontSize: '1.1rem',
                border: '2px solid #e2e8f0'
              }}
            >
              <span>{stake ? formatCurrency(Number(stake), lang) : (lang === 'ar' ? 'اختر المبلغ' : 'Sélectionner le montant')}</span>
              <span style={{ color: '#6366f1' }}>▼</span>
            </div>
          </div>

          <div className="alert" style={{ background: 'rgba(255, 243, 205, 0.5)', border: '1px solid rgba(255, 193, 7, 0.3)', padding: '16px', marginBottom: '24px', borderRadius: '16px', fontSize: '0.9rem', color: '#856404' }}>
            <strong>✨ {lang === 'ar' ? 'تنبيه:' : 'Note:'}</strong>{' '}
            {lang === 'ar' ? 'يمكنك إلغاء الغرفة بعد دقيقة واحدة.' : 'Annulation possible après 1 minute.'}
          </div>

          <button
            onClick={handleSubmit}
            className="btn"
            style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}
            disabled={submitting || !stake}
          >
            {submitting
              ? (lang === 'ar' ? 'جارٍ...' : 'Chargement...')
              : (lang === 'ar' ? 'إنشاء التحدي' : 'Créer le défi')
            }
          </button>
        </div>
      </div>

      <BottomSheet
        isOpen={isStakeOpen}
        onClose={() => setIsStakeOpen(false)}
        title={lang === 'ar' ? 'اختر مبلغ الرهان' : 'Choisissez la mise'}
        options={stakeOptions}
        onSelect={(val) => setStake(val)}
        selectedValue={stake}
      />

      <MobileNav lang={lang} onToggleLang={toggleLang} />
    </div>
  )
}
