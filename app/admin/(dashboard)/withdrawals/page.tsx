'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function AdminWithdrawalsPage() {
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionModal, setActionModal] = useState<{ id: string; action: string } | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const loadWithdrawals = async () => {
    try {
      const response = await fetch('/api/admin/withdrawals')
      const data = await response.json()
      if (data.withdrawals) {
        setWithdrawals(data.withdrawals)
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (id: string, action: string) => {
    setActionModal({ id, action })
    setAdminNotes('')
  }

  const confirmAction = async () => {
    if (!actionModal) return

    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: actionModal.id,
          action: actionModal.action,
          notes: adminNotes || null
        })
      })

      const result = await response.json()
      if (result.success) {
        setActionModal(null)
        setAdminNotes('')
        loadWithdrawals()
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
      <h1 className="page-title">Demandes de retrait</h1>

      {withdrawals.length === 0 ? (
        <div className="card">
          <p className="text-center">Aucune demande en attente</p>
        </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="mobile-only-cards">
            <style jsx>{`
              .desktop-table { display: block; }
              .mobile-only-cards { display: none; }
              @media (max-width: 768px) {
                .desktop-table { display: none !important; }
                .mobile-only-cards { display: flex !important; flexDirection: column; gap: 12px; }
              }
            `}</style>

            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{withdrawal.userName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                      Solde: {formatCurrency(withdrawal.userBalance)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.2rem' }}>{formatCurrency(withdrawal.amount)}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.9rem', color: '#475569' }}>
                  <span>📞</span>
                  <span>{withdrawal.whatsapp}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
                  {new Date(withdrawal.createdAt).toLocaleString('fr-FR')}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    onClick={() => handleAction(withdrawal.id, 'approve')}
                    style={{
                      padding: '12px', borderRadius: '8px', background: 'var(--success-color)', color: 'white', border: 'none', fontWeight: 600
                    }}
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleAction(withdrawal.id, 'reject')}
                    style={{
                      padding: '12px', borderRadius: '8px', background: 'var(--danger-color)', color: 'white', border: 'none', fontWeight: 600
                    }}
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="desktop-table table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>ID Compte</th>
                  <th>Montant</th>
                  <th>Solde actuel</th>
                  <th>WhatsApp</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td>{withdrawal.userName}</td>
                    <td>{withdrawal.accountId || 'N/A'}</td>
                    <td>{formatCurrency(withdrawal.amount)}</td>
                    <td>{formatCurrency(withdrawal.userBalance)}</td>
                    <td>{withdrawal.whatsapp}</td>
                    <td>{new Date(withdrawal.createdAt).toLocaleString('fr-FR')}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => handleAction(withdrawal.id, 'approve')}
                          className="btn btn-success btn-small"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => handleAction(withdrawal.id, 'reject')}
                          className="btn btn-danger btn-small"
                        >
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

