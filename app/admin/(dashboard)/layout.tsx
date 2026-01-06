import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth'
import AdminNavbar from '@/components/AdminNavbar'

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
      <AdminNavbar />

      <main style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
