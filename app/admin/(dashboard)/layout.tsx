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
      <AdminSidebar />
      <main style={{ marginLeft: '280px', padding: '40px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
