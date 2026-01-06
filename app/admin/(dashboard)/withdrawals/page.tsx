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
    <div className="container" style={{ maxWidth: '100%', padding: '16px' }}>
      <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '24px' }}>
        Demandes de retrait
        <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '8px' }}>v4.0</span>
      </h1>

      {withdrawals.length === 0 ? (
        <div className="card">
          <p className="text-center">Aucune demande en attente</p>
        </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="mobile-only-cards" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <style jsx>{`
              .desktop-table { display: none; }
              .mobile-only-cards { display: flex; }
              @media (min-width: 769px) {
                .desktop-table { display: block; }
                .mobile-only-cards { display: none; }
              }
            `}</style>

            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Header: Amount is King (Red) */}
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Retrait demandé</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ef4444', lineHeight: '1' }}>{formatCurrency(withdrawal.amount)}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '12px' }}>
                    {new Date(withdrawal.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>

                {/* User Info Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>Utilisateur</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{withdrawal.userName}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>Solde Actuel</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                        {formatCurrency(withdrawal.userBalance)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>WhatsApp</div>
                      <div style={{ fontWeight: 600, color: '#475569' }}>{withdrawal.whatsapp}</div>
                    </div>
                  </div>
                </div>

                {/* Actions Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>

                  <div style={{ background: '#fffbeb', color: '#b45309', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>
                    ⚠️ Vérifiez le solde avant de valider
                  </div>

                  <button
                    onClick={() => handleAction(withdrawal.id, 'approve')}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <span>✅</span> Confirmer paiement
                  </button>
                  <button
                    onClick={() => handleAction(withdrawal.id, 'reject')}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '16px',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <span>❌</span> Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="desktop-table table-responsive" style={{
            background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), overflow: 'hidden' }}>
              <table style = {{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left' }}>Utilisateur</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Montant</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Solde actuel</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>WhatsApp</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px' }}>{withdrawal.userName}</td>
                <td style={{ padding: '16px', fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(withdrawal.amount)}</td>
                <td style={{ padding: '16px', color: '#10b981' }}>{formatCurrency(withdrawal.userBalance)}</td>
                <td style={{ padding: '16px' }}>{withdrawal.whatsapp}</td>
                <td style={{ padding: '16px' }}>{new Date(withdrawal.createdAt).toLocaleString('fr-FR')}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAction(withdrawal.id, 'approve')}
                      className="btn btn-success btn-small"
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleAction(withdrawal.id, 'reject')}
                      className="btn btn-danger btn-small"
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
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
      )
}
    </div >
  )
}
