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
    <div className="container" style={{ maxWidth: '100%', padding: '16px' }}>
      <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '24px' }}>
        Revenus & Statistiques
        <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '8px' }}>v4.0</span>
      </h1>

      {/* Stats Cards - Vertical on Mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100%, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <style jsx>{`
          @media (min-width: 768px) {
            div { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>

        <div className="card" style={{ textAlign: 'center', padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '1rem', opacity: 0.8, fontWeight: 500 }}>Revenus Totaux</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', marginTop: '8px', lineHeight: 1 }}>
            {formatCurrency(total)}
          </p>
        </div>

        {stats && (
          <>
            <div className="card" style={{ textAlign: 'center', padding: '24px', borderRadius: '20px', background: 'white', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Matchs Joués</h3>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: '#4f46e5', marginTop: '8px' }}>
                {stats.totalMatches || 0}
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '24px', borderRadius: '20px', background: 'white', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Total Mises</h3>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: '#4f46e5', marginTop: '8px' }}>
                {formatCurrency(stats.totalStakes || 0)}
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '24px', borderRadius: '20px', background: 'white', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', color: '#64748b' }}>Total Paiements</h3>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444', marginTop: '8px' }}>
                {formatCurrency(stats.totalPayouts || 0)}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label htmlFor="period" style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: 600 }}>Période:</label>
        <select
          id="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="form-control"
          style={{ width: '100%', maxWidth: '100%', padding: '16px', fontSize: '1rem', borderRadius: '12px' }}
        >
          <option value="all">Tout</option>
          <option value="today">Aujourd'hui</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
        </select>
      </div>

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

        {revenue.length === 0 ? (
          <div className="card text-center" style={{ padding: '32px' }}>Aucun revenu pour cette période</div>
        ) : (
          revenue.map((r) => (
            <div key={r.id} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.2rem' }}>{r.gameName}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px' }}>#{r.matchId}</div>
              </div>

              {/* Commission Hero */}
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '16px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '4px', fontWeight: 600 }}>Commission (5%)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803d' }}>{formatCurrency(r.amount)}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2px' }}>Mise</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(r.stake)}</div>
                </div>
                <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#991b1b', marginBottom: '2px' }}>Paiement</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#dc2626' }}>{formatCurrency(r.payout)}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Gagnant</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{r.winnerName || '-'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right' }}>
                  {new Date(r.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="desktop-table table-responsive" style={{
        background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), overflow: 'hidden' }}>
          <table style = {{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <th style={{ padding: '16px', textAlign: 'left' }}>ID Match</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Jeu</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Mise</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Commission</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Paiement</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Gagnant</th>
          <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
        </tr>
      </thead>
      <tbody>
        {revenue.length === 0 ? (
          <tr>
            <td colSpan={7} className="text-center" style={{ padding: '32px', color: '#64748b' }}>Aucun revenu pour cette période</td>
          </tr>
        ) : (
          revenue.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px' }}>{r.matchId}</td>
              <td style={{ padding: '16px' }}>{r.gameName}</td>
              <td style={{ padding: '16px' }}>{formatCurrency(r.stake)}</td>
              <td style={{ padding: '16px', color: 'var(--success-color)', fontWeight: 'bold' }}>
                {formatCurrency(r.amount)}
              </td>
              <td style={{ padding: '16px', color: '#ef4444' }}>{formatCurrency(r.payout)}</td>
              <td style={{ padding: '16px' }}>{r.winnerName || '-'}</td>
              <td style={{ padding: '16px' }}>{new Date(r.createdAt).toLocaleString('fr-FR')}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
      </div >
    </div >
  )
}
