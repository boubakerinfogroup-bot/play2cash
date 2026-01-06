'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export default function AdminDepositsPage() {
  const router = useRouter()
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionModal, setActionModal] = useState<{ id: string; action: string } | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    loadDeposits()
  }, [])

  const loadDeposits = async () => {
    try {
      const response = await fetch('/api/admin/deposits')
      const data = await response.json()
      if (data.deposits) {
        setDeposits(data.deposits)
      }
    } catch (error) {
      console.error('Error loading deposits:', error)
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
      const response = await fetch('/api/admin/deposits', {
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
        loadDeposits()
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
      <h1 className="page-title">Demandes de dépôt</h1>

      {deposits.length === 0 ? (
        <div className="card">
          <p className="text-center">Aucune demande en attente</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>ID Compte</th>
                <th>Montant</th>
                <th>WhatsApp</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit.id}>
                  <td>{deposit.userName}</td>
                  <td>{deposit.accountId || 'N/A'}</td>
                  <td>{formatCurrency(deposit.amount)}</td>
                  <td>{deposit.whatsapp}</td>
                  <td>{new Date(deposit.createdAt).toLocaleString('fr-FR')}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => handleAction(deposit.id, 'approve')}
                        className="btn btn-success btn-small"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleAction(deposit.id, 'reject')}
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
      )}

      {/* Action Modal */}
      {actionModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setActionModal(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '500px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{actionModal.action === 'approve' ? 'Approuver' : 'Rejeter'} la demande</h2>
            <div className="form-group">
              <label>Notes (optionnel):</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="form-control"
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={confirmAction}
                className={`btn ${actionModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
              >
                Confirmer
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="btn btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
