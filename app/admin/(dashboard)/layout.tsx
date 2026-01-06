import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          PLAY2CASH ADMIN
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="/admin" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 600 }}>Dashboard</a>
        </div>
      </nav>

      <main style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
