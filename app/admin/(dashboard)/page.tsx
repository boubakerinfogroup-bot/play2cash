import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin-auth'
import DashboardContent from './DashboardContent'

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  return <DashboardContent />
}
