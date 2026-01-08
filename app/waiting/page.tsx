'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, t } from '@/lib/utils'
import type { User } from '@/lib/types'
import Header from '@/components/Header'

import { Suspense } from 'react'

function WaitingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match')

  const [user, setUser] = useState<User | null>(null)
  const [match, setMatch] = useState<any>(null)
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [canCancel, setCanCancel] = useState(false)
  const [shareLink, setShareLink] = useState('')

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
      const link = `${window.location.origin}/join?match=${matchId}`
      setShareLink(link)
    } else {
      router.push('/')
    }
  }, [matchId, router])

  useEffect(() => {
    if (!match) return

    // Calculate time since match creation
    const createdAt = new Date(match.createdAt)
    const now = new Date()
    const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
    const remaining = Math.max(0, 60 - elapsedSeconds)

    setCanCancel(remaining === 0)
    setTimeRemaining(remaining)

    // Update timer every second
    const interval = setInterval(() => {
      const now = new Date()
      const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000)
      const remaining = Math.max(0, 60 - elapsedSeconds)

      setCanCancel(remaining === 0)
      setTimeRemaining(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [match])

  const loadMatch = async (id: string) => {
    try {
      const response = await fetch(`/api/matches/${id}`)
      const data = await response.json()

      if (data.match) {
        // Check if user is creator
        if (data.match.createdBy !== user?.id) {
          router.push('/')
          return
        }

        // Redirect if already active
        if (data.match.status === 'ACTIVE') {
          router.push(`/play?match=${id}`)
          return
        }

        // Redirect if cancelled
        if (data.match.status === 'CANCELLED') {
          router.push('/')
          return
        }

        setMatch(data.match)
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

  // Poll match status every 3 seconds
  useEffect(() => {
    if (!matchId) return

    const interval = setInterval(() => {
      fetch(`/api/matches/${matchId}`)
        .then(res => res.json())
        .then(data => {
          if (data.match) {
            if (data.match.status === 'ACTIVE') {
              router.push(`/play?match=${matchId}`)
            } else if (data.match.status === 'CANCELLED') {
              router.push('/')
            }
          }
        })
        .catch(err => console.error('Error checking match:', err))
    }, 3000)

    return () => clearInterval(interval)
  }, [matchId, router])

  const handleCancel = async () => {
    if (!canCancel || !matchId) {
      alert(lang === 'ar' ? 'يجب الانتظار دقيقة واحدة قبل الإلغاء' : 'Vous devez attendre 1 minute avant d\'annuler')
      return
    }

    const stake = formatCurrency(match.stake)
    const msg1 = lang === 'ar'
      ? `هل أنت متأكد من إلغاء الغرفة؟\n\nسيتم استرجاع: ${stake}`
      : `Êtes-vous sûr de vouloir annuler cette salle?\n\nVous récupérerez: ${stake}`

    if (!confirm(msg1)) {
      return
    }

    setTimeout(() => {
      const msg2 = lang === 'ar'
        ? `⚠️ تأكيد نهائي!\n\nإلغاء الغرفة واسترجاع ${stake}?`
        : `⚠️ Confirmation finale!\n\nAnnuler la salle et récupérer ${stake}?`

      if (!confirm(msg2)) {
        return
      }

      doCancel()
    }, 300)
  }

  const doCancel = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/cancel`, {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        // Update user balance
        if (user && match) {
          const updatedUser = { ...user, balance: user.balance + match.stake }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }

        router.push('/?cancelled=success')
      } else {
        alert(result.error || (lang === 'ar' ? 'خطأ في الإلغاء' : 'Erreur lors de l\'annulation'))
      }
    } catch (err: any) {
      alert(err.message || (lang === 'ar' ? 'خطأ في الإلغاء' : 'Erreur lors de l\'annulation'))
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      alert(lang === 'ar' ? 'تم نسخ الرابط بنجاح' : 'Lien copié avec succès!')
    })
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

  const percentage = Math.min(100, (timeRemaining / 60) * 100)

  return (
    <div className={lang === 'ar' ? 'arabic-text' : ''}>
      <Header user={user} lang={lang} />
      <div className="container">
        <div style={{ padding: '20px 0' }}>
          <h2 className="gradient-text" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '8px' }}>
            {t('waiting_opponent', lang)}
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
            {lang === 'ar' ? 'شارك الرابط ليدخل خصمك' : 'Partagez le lien pour qu\'un adversaire rejoigne'}
          </p>

          <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '32px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              {lang === 'ar' && match.gameName ? match.gameName : match.gameName}
            </h3>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#4f46e5' }}>
                {formatCurrency(match.stake, lang)}
              </span>
            </div>

            {/* Share Section */}
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{lang === 'ar' ? 'رابط المشاركة:' : 'Lien de partage:'}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  readOnly
                  value={shareLink}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '0.9rem' }}
                />
                <button
                  onClick={copyLink}
                  className="btn"
                  style={{ padding: '0 16px', borderRadius: '12px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  📋
                </button>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent((lang === 'ar' ? 'انضم إلى تحديي على Play to Cash: ' : 'Rejoignez mon défi sur Play to Cash: ') + shareLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
                style={{ marginTop: '16px', width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem' }}
              >
                <span>WhatsApp</span> 🚀
              </a>
            </div>

            <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
            <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '32px' }}>
              {lang === 'ar' ? 'في انتظار انضمام الخصم...' : 'En attente de l\'adversaire...'}
            </p>

            {/* Timer Box */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: canCancel ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
              border: `1px solid ${canCancel ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`,
              borderRadius: '16px'
            }}>
              <div style={{ fontSize: '0.9rem', color: canCancel ? '#166534' : '#854d0e', marginBottom: '8px', fontWeight: 600 }}>
                {lang === 'ar' ? 'إلغاء الغرفة متاح في' : 'Annulation possible dans'}
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: canCancel ? '#16a34a' : '#ca8a04',
                fontFamily: 'monospace',
                lineHeight: 1
              }}>
                {canCancel ? '✓' : `00:${timeRemaining.toString().padStart(2, '0')}`}
              </div>
              {/* Progress Bar */}
              {!canCancel && (
                <div style={{ height: '6px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percentage}%`, background: '#ca8a04', transition: 'width 1s linear' }} />
                </div>
              )}
            </div>

            {/* Cancel Button */}
            <form onSubmit={(e) => { e.preventDefault(); handleCancel(); }}>
              <button
                type="submit"
                className="btn"
                disabled={!canCancel}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: canCancel ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#e2e8f0',
                  color: canCancel ? 'white' : '#94a3b8',
                  fontWeight: 700,
                  cursor: canCancel ? 'pointer' : 'not-allowed',
                  boxShadow: canCancel ? '0 10px 20px rgba(239, 68, 68, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {lang === 'ar' ? 'إلغاء الغرفة' : 'Annuler la salle'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: canCancel ? '#16a34a' : '#64748b' }}>
              {canCancel
                ? (lang === 'ar' ? '✓ يمكنك الآن إلغاء الغرفة واسترجاع المبلغ' : '✓ Vous pouvez maintenant annuler et être remboursé')
                : (lang === 'ar' ? 'يمكنك الإلغاء إذا لم ينضم أحد خلال دقيقة' : 'Annulation possible si personne ne rejoint dans 1 minute')
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WaitingPage() {
  return (
    <Suspense fallback={<div className="container flex-center" style={{ minHeight: '80vh' }}><div className="spinner"></div></div>}>
      <WaitingContent />
    </Suspense>
  )
}


