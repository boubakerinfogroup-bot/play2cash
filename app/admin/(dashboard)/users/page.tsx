'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [topupModal, setTopupModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [topupAmount, setTopupAmount] = useState('')
  const [manualAccountId, setManualAccountId] = useState('')
  const [manualAmount, setManualAmount] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      setError('Montant invalide')
      return
    }

    try {
      const response = await fetch('/api/admin/users/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(topupAmount)
        })
      })

      const result = await response.json()
      if (result.success) {
        setTopupModal(false)
        setTopupAmount('')
        setSelectedUser(null)
        setSuccess('Recharge effectuée avec succès')
        loadUsers()
      } else {
        setError(result.error || 'Erreur')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur')
    }
  }

  const handleManualAction = async (actionType: 'manual_topup' | 'manual_withdraw', e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!manualAccountId || !manualAmount || parseFloat(manualAmount) <= 0) {
      setError('Champs requis')
      return
    }

    try {
      const response = await fetch('/api/admin/users/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: manualAccountId,
          amount: parseFloat(manualAmount),
          action: actionType
        })
      })

      const result = await response.json()
      if (result.success) {
        setSuccess(result.message || 'Opération effectuée avec succès')
        setManualAccountId('')
        setManualAmount('')
        setTimeout(() => setSuccess(''), 5000)
        loadUsers()
      } else {
        setError(result.error || 'Erreur')
        setTimeout(() => setError(''), 5000)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur')
      setTimeout(() => setError(''), 5000)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '100%', padding: '16px' }}>
      <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '24px' }}>
        Gérer les utilisateurs
        <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '8px' }}>v4.0</span>
      </h1>

      {/* Manual Top-up/Withdraw by Account ID */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--primary-color)', color: 'white', border: 'none' }}>
        <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '1.2rem' }}>Gestion rapide</h2>

        {error && (
          <div className="alert alert-error" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--danger-color)' }}>{error}</div>
        )}

        {success && (
          <div className="alert alert-success" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--success-color)' }}>{success}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <form onSubmit={(e) => handleManualAction('manual_topup', e)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontWeight: 'bold' }}>Recharge Directe</div>
            <input
              type="text"
              value={manualAccountId}
              onChange={(e) => setManualAccountId(e.target.value)}
              className="form-control"
              placeholder="ID Compte (ex: P2C-00001)"
              required
              style={{ background: 'white' }}
            />
            <input
              type="number"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="form-control"
              min="0.01"
              step="0.01"
              placeholder="Montant"
              required
              style={{ background: 'white' }}
            />
            <button type="submit" className="btn" style={{ background: '#10b981', color: 'white', border: 'none' }}>
              Recharger
            </button>
          </form>
        </div>
      </div>

      {error && !success && (
        <div className="alert alert-error">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      {/* Mobile View (Cards) */}
      <div className="mobile-only-cards" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <style jsx>{`
          .desktop-table { display: none; } /* Force hide table on mobile */
          .mobile-only-cards { display: flex; }
          
          @media (min-width: 769px) {
            .desktop-table { display: block; }
            .mobile-only-cards { display: none; }
          }
        `}</style>

        {users.join ? null : null /* dummy check to ensure array */}
        {users.map((user) => (
          <div key={user.id} style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joueur</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{user.name}</div>
              </div>
            </div>

            {/* Details - Vertical Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ID Compte</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', color: '#475569', fontWeight: 600, alignSelf: 'flex-start' }}>
                  {user.accountId || 'N/A'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>WhatsApp</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>{user.whatsapp}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Solde Actuel</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{formatCurrency(user.balance)}</div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                setSelectedUser(user)
                setTopupModal(true)
              }}
              className="btn"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                justifyContent: 'center',
                background: 'var(--gradient-btn)',
                color: 'white',
                fontSize: '1.1rem',
                marginTop: '8px'
              }}
            >
              Recharger
            </button>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="desktop-table" style={{
        background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), overflow: 'hidden', marginTop: '24px' }}>
          <div style = {{ overflowX: 'auto' }
      } >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Joueur</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Contact</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Solde</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>ID: {user.accountId || 'N/A'}</div>
                </td>
                <td style={{ padding: '16px', color: '#475569' }}>{user.whatsapp}</td>
                <td style={{ padding: '16px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(user.balance)}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button
                    onClick={() => {
                      setSelectedUser(user)
                      setTopupModal(true)
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#059669',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Recharger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div >

    {/* Top-up Modal */ }
  {
    topupModal && (
      <div className="modal-overlay" onClick={() => setTopupModal(false)}>
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '32px', background: 'white' }} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Recharger {selectedUser?.name}</h2>
          <form onSubmit={handleTopup}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#64748b' }}>Montant</label>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="form-control"
                style={{ fontSize: '1.2rem', padding: '16px' }}
                min="0.01"
                step="0.01"
                required
                autoFocus
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => {
                  setTopupModal(false)
                  setError('')
                  setTopupAmount('')
                }}
                className="btn"
                style={{ width: '100%', justifyContent: 'center', background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
    </div >
  )
}
