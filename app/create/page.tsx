'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, t, getAllowedStakes } from '@/lib/utils'
import type { User } from '@/lib/types'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import BottomSheet from '@/components/BottomSheet'
import { gamesAPI, matchesAPI } from '@/lib/api-client'

import { Suspense } from 'react'
import PopupModal from '@/components/PopupModal'
import ConfirmModal from '@/components/ConfirmModal'

function CreateContent() {
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
  const [showConfirm, setShowConfirm] = useState(false)

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
      const data = await gamesAPI.get(slug)

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

    // Show confirmation popup instead of browser confirm
    setShowConfirm(true)
  }

  const createMatch = async () => {
    setSubmitting(true)
    try {
      const result = await matchesAPI.create(game.id, Number(stake))

      if (result.success && result.matchId) {
        // NOTE: Balance is NOT deducted here - only when match starts
        // Redirect to waiting room
        router.push(`/waiting-room/${result.matchId}`)
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
            <label style={{ display: 'block', marginBottom: '16px', fontWeight: 600, color: '#1e293b' }}>
              {lang === 'ar' ? 'المبلغ (د.ت)' : 'Montant (TND)'}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {allowedStakes.map((s) => {
                const isSelected = stake === s
                const isDisabled = user ? user.balance < s : true
                return (
                  <button
                    key={s}
                    onClick={() => setStake(s)}
                    disabled={isDisabled}
                    style={{
                      padding: '16px 8px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(99, 102, 241, 0.1)' : (isDisabled ? '#f1f5f9' : 'white'),
                      color: isSelected ? '#4f46e5' : (isDisabled ? '#94a3b8' : '#334155'),
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      opacity: isDisabled ? 0.7 : 1
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            {user && stake && user.balance < Number(stake) && (
              <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '8px', fontWeight: 500 }}>
                {lang === 'ar' ? 'رصيد غير كافٍ' : 'Solde insuffisant'}
              </p>
            )}
          </div>

          <div className="alert" style={{ background: 'rgba(255, 243, 205, 0.5)', border: '1px solid rgba(255, 193, 7, 0.3)', padding: '16px', marginBottom: '24px', borderRadius: '16px', fontSize: '0.9rem', color: '#856404', display: 'flex', gap: '8px' }}>
            <span>✨</span>
            <div>
              <strong>{lang === 'ar' ? 'تنبيه:' : 'Note:'}</strong>{' '}
              {lang === 'ar' ? 'يمكنك إلغاء الغرفة بعد دقيقة واحدة.' : 'Annulation possible après 1 minute.'}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="btn"
            style={{
              width: '100%',
              fontSize: '1.1rem',
              padding: '16px',
              background: submitting || !stake ? '#cbd5e1' : 'var(--gradient-btn)',
              transform: submitting || !stake ? 'none' : undefined,
              boxShadow: submitting || !stake ? 'none' : '0 10px 20px -5px rgba(79, 70, 229, 0.3)'
            }}
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

      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={createMatch}
        onCancel={() => setShowConfirm(false)}
        title={lang === 'ar' ? 'تأكيد' : 'Confirmation'}
        message={lang === 'ar' ? 'هل تريد إنشاء غرفة بهذا المبلغ؟' : 'Créer une salle avec cette mise ?'}
        confirmText={lang === 'ar' ? 'نعم، إنشاء' : 'Oui, créer'}
        cancelText={lang === 'ar' ? 'إلغاء' : 'Annuler'}
        stake={Number(stake)}
      />

      <MobileNav lang={lang} onToggleLang={toggleLang} />
    </div>
  )
}

export default function CreateChallengePage() {
  return (
    <Suspense fallback={<div className="container flex-center" style={{ minHeight: '80vh' }}><div className="spinner"></div></div>}>
      <CreateContent />
    </Suspense>
  )
}
