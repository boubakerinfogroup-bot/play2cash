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
    <div className="admin-panel">
      <div className="header">
        <div className="header-content">
          <div className="logo">Admin Panel</div>
        </div>
      </div>
      <div className="admin-panel-main">
        <AdminSidebar />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}
