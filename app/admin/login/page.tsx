'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const result = await response.json()

      if (result.success) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(result.error || 'Invalid credentials')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-game)' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: '20%', left: '20%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.3, borderRadius: '50%', zIndex: -1 }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '20%', width: '250px', height: '250px', background: 'var(--secondary)', filter: 'blur(100px)', opacity: 0.3, borderRadius: '50%', zIndex: -1 }} />

      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '48px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Portal</h1>
          <p style={{ color: '#64748b' }}>Accès sécurisé réservé aux administrateurs</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '24px',
            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9V14M12 21.0002L12.01 20.9998M2.00002 11.9998C2.00002 17.5226 6.47717 21.9998 12 21.9998C17.5228 21.9998 22 17.5226 22 11.9998C22 6.47693 17.5228 1.99977 12 1.99977C6.47717 1.99977 2.00002 6.47693 2.00002 11.9998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b' }}>Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
              autoFocus
              placeholder="admin"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b' }}>Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
              placeholder="••••••••"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            />
          </div>

          <button
            type="submit"
            className="btn"
            style={{ width: '100%', padding: '16px', background: 'var(--gradient-btn)', fontSize: '1.1rem' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}></span>
                Connexion...
              </span>
            ) : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          <p>Protected by Play2Cash Security</p>
        </div>
      </div>
    </div>
  )
}

