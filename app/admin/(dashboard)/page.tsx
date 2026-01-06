import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth'

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Tableau de bord</h1>
      <p style={{ color: '#64748b', marginBottom: '40px' }}>Bienvenue dans votre espace d'administration.</p>

      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: 'white' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👋</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Bienvenue, Admin</h2>
        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
          Utilisez le menu latéral pour gérer les utilisateurs, valider les dépôts et traiter les demandes de retrait.
        </p>
      </div>
    </>
  )
}

