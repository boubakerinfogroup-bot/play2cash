import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth'

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Tableau de bord</h1>
        <p style={{ color: '#64748b' }}>Bienvenue, Admin. Que voulez-vous gérer ?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <a href="/admin/deposits" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.2s', background: 'white', cursor: 'pointer' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💰</div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px' }}>Dépôts</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Gérer les demandes</p>
          </div>
        </a>

        <a href="/admin/withdrawals" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.2s', background: 'white', cursor: 'pointer' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💸</div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px' }}>Retraits</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Valider les paiements</p>
          </div>
        </a>

        <a href="/admin/users" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.2s', background: 'white', cursor: 'pointer' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px' }}>Utilisateurs</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Voir les joueurs</p>
          </div>
        </a>

        <a href="/admin/revenue" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.2s', background: 'white', cursor: 'pointer' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📈</div>
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px' }}>Revenus</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Statistiques</p>
          </div>
        </a>
      </div>
    </>
  )
}

