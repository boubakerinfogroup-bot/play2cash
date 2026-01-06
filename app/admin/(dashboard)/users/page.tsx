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

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        loadUsers()
      } else {
        alert(result.error || 'Erreur')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur')
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
    <div className="container">
      <h1 className="page-title">
        Gérer les utilisateurs
        <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '8px' }}>v2.5</span>
      </h1>

      {/* Manual Top-up/Withdraw by Account ID */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--primary-color)', color: 'white' }}>
        <h2 style={{ color: 'white', marginBottom: '16px' }}>Gestion rapide par ID Compte</h2>

        {error && (
          <div className="alert alert-error" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--danger-color)' }}>{error}</div>
        )}

        {success && (
          <div className="alert alert-success" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--success-color)' }}>{success}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <form onSubmit={(e) => handleManualAction('manual_topup', e)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={manualAccountId}
              onChange={(e) => setManualAccountId(e.target.value)}
              className="form-control"
              placeholder="ID Compte (ex: P2C-00001)"
              required
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
            />
            <button type="submit" className="btn btn-success">
              Recharger
            </button>
          </form>

          <form onSubmit={(e) => handleManualAction('manual_withdraw', e)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={manualAccountId}
              onChange={(e) => setManualAccountId(e.target.value)}
              className="form-control"
              placeholder="ID Compte (ex: P2C-00001)"
              required
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
            />
            <button type="submit" className="btn btn-danger">
              Retirer
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
      <div className="mobile-only-cards">
        <style jsx>{`
          .desktop-table { display: block; }
          .mobile-only-cards { display: none; }
          @media (max-width: 768px) {
            .desktop-table { display: none !important; }
            .mobile-only-cards { display: flex !important; flexDirection: column; gap: 16px; }
          }
        `}</style>

        {users.map((user) => (
          <div key={user.id} style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>{user.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>{user.accountId || 'ID?'}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {formatCurrency(user.balance)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>📱</span>
              <span style={{ fontWeight: 600, color: '#475569' }}>{user.whatsapp}</span>
            </div>

            <button
              onClick={() => {
                setSelectedUser(user)
                setTopupModal(true)
              }}
              className="btn"
              style={{
                width: '100%',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
              }}
            >
              <span>💰</span> Recharger le compte
            </button>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="desktop-table" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
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
      </div>

      {/* Top-up Modal */}
      {topupModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setTopupModal(false)}
        >
          <div className="card" style={{ maxWidth: '400px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedUser?.name}</h2>
            <form onSubmit={handleTopup}>
              <div className="form-group">
                <label>Montant</label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="form-control"
                  min="0.01"
                  step="0.01"
                  required
                  autoFocus
                />
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-success">
                Recharger
              </button>
              <button
                type="button"
                onClick={() => {
                  setTopupModal(false)
                  setError('')
                  setTopupAmount('')
                }}
                className="btn btn-secondary mt-2"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

