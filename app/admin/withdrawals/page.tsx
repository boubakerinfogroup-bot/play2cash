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
          <div className="table-responsive">
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
        )}
      </div>
  )
}

