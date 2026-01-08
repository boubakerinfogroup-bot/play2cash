'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, clearToken } from '@/lib/api-client'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('language')

    // Clear token and call logout API
    clearToken()
    authAPI.logout().catch(() => { }) // Ignore errors

    // Redirect to login
    router.push('/login')
  }, [router])

  return (
    <div className="container">
      <div className="spinner"></div>
    </div>
  )
}
