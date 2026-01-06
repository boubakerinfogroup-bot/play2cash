'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, whatsapp, email, language: lang })
      })

      const result = await response.json()

      if (result.success && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('language', lang)
        router.push('/')
        router.refresh()
      } else {
        setError(result.error || 'Erreur lors de la connexion')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  const toggleLang = () => {
    setLang(prev => prev === 'fr' ? 'ar' : 'fr')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative localized Background Elements for Login only */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(40px)',
        zIndex: -1
      }} />

      <div className="glass-card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '48px 32px',
        textAlign: 'center'
      }}>
        <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '8px', lineHeight: 1.1 }}>
          Play2Cash
        </h1>
        <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '1.1rem' }}>
          {lang === 'ar' ? 'الجيل القادم من الألعاب المهارية' : 'Next Gen Skill Gaming'}
        </p>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>
          {lang === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>
              {lang === 'ar' ? 'الاسم' : 'Nom'}
            </label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>
              WhatsApp
            </label>
            <input
              type="tel"
              className="form-control"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              placeholder="+216 00 000 000"
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="hello@example.com"
            />
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? '...' : (lang === 'ar' ? 'ابدأ اللعب 🚀' : 'Commencer à jouer 🚀')}
          </button>
        </form>

        <button
          onClick={toggleLang}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            marginTop: '32px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '32px auto 0'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🌐</span>
          {lang === 'ar' ? 'Switch to French' : 'Switch to Arabic'}
        </button>
      </div>
    </div>
  )
}
