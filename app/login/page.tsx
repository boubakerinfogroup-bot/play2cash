'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '15%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(40px)',
        animation: 'float 7s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '10%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(45px)',
        animation: 'float 9s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '30%',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.6)',
        animation: 'particle 12s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '25%',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.5)',
        animation: 'particle 15s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '40%',
        left: '40%',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.4)',
        animation: 'particle 10s ease-in-out infinite',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px' }}>
        <div className="glass-card" style={{
          maxWidth: '480px',
          width: '100%',
          padding: '48px 32px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px' }}>
            <img
              src="/logo.svg"
              alt="Play2Cash"
              style={{
                width: '180px',
                height: 'auto',
                margin: '0 auto',
                display: 'block',
                filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.4))'
              }}
            />
          </div>

          {/* Language Flags */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginBottom: '40px'
          }}>
            <button
              onClick={() => setLang('fr')}
              style={{
                background: lang === 'fr' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(0,0,0,0.05)',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: lang === 'fr' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                transform: lang === 'fr' ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <img src="/french.png" alt="Français" width="32" height="24" style={{ borderRadius: '4px' }} />
            </button>
            <button
              onClick={() => setLang('ar')}
              style={{
                background: lang === 'ar' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(0,0,0,0.05)',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: lang === 'ar' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                transform: lang === 'ar' ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <img src="/arabic.png" alt="العربية" width="32" height="24" style={{ borderRadius: '4px' }} />
            </button>
          </div>

          {/* Login Title */}
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {lang === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
          </h2>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#475569'
              }}>
                {lang === 'ar' ? 'الاسم' : 'Nom'}
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid rgba(0,0,0,0.1)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#475569'
              }}>
                WhatsApp
              </label>
              <input
                type="tel"
                className="form-control"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                placeholder="+216 00 000 000"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid rgba(0,0,0,0.1)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#475569'
              }}>
                Email
              </label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="hello@example.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid rgba(0,0,0,0.1)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '16px',
                fontSize: '1.1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transform: loading ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? '...' : (lang === 'ar' ? 'ابدأ اللعب 🚀' : 'Commencer à jouer 🚀')}
            </button>
          </form>
        </div>

        {/* WhatsApp Support Button */}
        <a
          href="https://wa.me/21629616525"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '20px',
            padding: '14px 28px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '50px',
            textDecoration: 'none',
            color: '#25D366',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }}
        >
          <img src="/whatsapp.png" alt="WhatsApp" width="24" height="24" />
          <span>{lang === 'ar' ? 'الدعم عبر واتساب' : 'Support WhatsApp'}</span>
        </a>

        {/* Copyright */}
        <p style={{
          marginTop: '32px',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.9rem',
          textAlign: 'center',
          fontWeight: 500
        }}>
          © 2026 Play2Cash. {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}.
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes particle {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-50px) translateX(30px);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}
