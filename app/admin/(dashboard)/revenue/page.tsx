'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function AdminRevenuePage() {
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [revenue, setRevenue] = useState<any[]>([])
  const [period, setPeriod] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRevenue()
  }, [period])

  const loadRevenue = async () => {
    try {
      const response = await fetch(`/api/admin/revenue?period=${period}`)
      const data = await response.json()
      if (data.total !== undefined) {
        setTotal(data.total)
        setStats(data.stats || null)
        setRevenue(data.revenue || [])
      }
    } catch (error) {
      console.error('Error loading revenue:', error)
    } finally {
      setLoading(false)
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
      <h1 className="page-title">Revenus & Statistiques</h1>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Revenus Totaux</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success-color)', marginTop: '8px' }}>
            {formatCurrency(total)}
          </p>
        </div>

        {stats && (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3>Matchs Joués</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '8px' }}>
                {stats.totalMatches || 0}
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <h3>Total Mises</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '8px' }}>
                {formatCurrency(stats.totalStakes || 0)}
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <h3>Total Paiements</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '8px' }}>
                {formatCurrency(stats.totalPayouts || 0)}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label htmlFor="period">Période:</label>
        <select
          id="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="form-control"
          style={{ maxWidth: '200px' }}
        >
          <option value="all">Tout</option>
          <option value="today">Aujourd'hui</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
        </select>
      </div>

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

        {revenue.length === 0 ? (
          <div className="card text-center">Aucun revenu pour cette période</div>
        ) : (
          revenue.map((r) => (
            <div key={r.id} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.gameName}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>#{r.matchId}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Mise</div>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(r.stake)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Commission</div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(r.amount)}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '0.85rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Gagnant: {r.winnerName || '-'}</span>
                <span>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="desktop-table table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID Match</th>
              <th>Jeu</th>
              <th>Mise</th>
              <th>Commission (5%)</th>
              <th>Paiement Gagnant</th>
              <th>Gagnant</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {revenue.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">Aucun revenu pour cette période</td>
              </tr>
            ) : (
              revenue.map((r) => (
                <tr key={r.id}>
                  <td>{r.matchId}</td>
                  <td>{r.gameName}</td>
                  <td>{formatCurrency(r.stake)}</td>
                  <td style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>
                    {formatCurrency(r.amount)}
                  </td>
                  <td>{formatCurrency(r.payout)}</td>
                  <td>{r.winnerName || '-'}</td>
                  <td>{new Date(r.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

