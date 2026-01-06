import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth'

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <>
      <h1 className="page-title">Tableau de bord</h1>
      <div style={{ marginTop: '30px' }}>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Bienvenue dans le panneau d'administration. Utilisez le menu de gauche pour naviguer.
        </p>
      </div>
    </>
  )
}

