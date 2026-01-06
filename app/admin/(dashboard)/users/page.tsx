'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [topupModal, setTopupModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [topupAmount, setTopupAmount] = useState('')
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
        setTimeout(() => setSuccess(''), 3000)
        loadUsers()
      } else {
        setError(result.error || 'Erreur')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        .desktop-table { display: block; }
        .mobile-cards { display: none; }
        
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; }
        }
      `}</style>

      <div style={{ padding: '16px', maxWidth: '100%' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', color: '#1e293b' }}>
          Gérer les utilisateurs
          <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '8px', color: '#64748b' }}>v5.0</span>
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Total: {users.length} utilisateurs</p>

        {success && (
          <div style={{
            background: '#f0fdf4',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid #bbf7d0'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Mobile Cards View */}
        <div className="mobile-cards" style={{ flexDirection: 'column', gap: '16px' }}>
          {users.map((user) => (
            <div key={user.id} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9'
            }}>
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{user.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                    <span style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                      {user.accountId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    WhatsApp
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>
                    {user.whatsapp}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Solde Actuel
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                    {formatCurrency(user.balance)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedUser(user)
                  setTopupModal(true)
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                💰 Recharger
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="desktop-table">
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Joueur</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Contact</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Solde</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{user.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                        ID: {user.accountId || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#475569' }}>{user.whatsapp}</td>
                    <td style={{ padding: '16px', fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>
                      {formatCurrency(user.balance)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setTopupModal(true)
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.9rem'
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
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999
          }}
          onClick={() => {
            setTopupModal(false)
            setError('')
            setTopupAmount('')
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#1e293b' }}>
              Recharger
            </h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>{selectedUser?.name}</p>

            <form onSubmit={handleTopup}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                  Montant (TND)
                </label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                  min="0.01"
                  step="0.01"
                  required
                  autoFocus
                  placeholder="0.00"
                />
              </div>

              {error && (
                <div style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTopupModal(false)
                    setError('')
                    setTopupAmount('')
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
