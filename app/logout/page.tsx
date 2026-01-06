'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('language')

    // Clear session (would need API call to clear server-side session)
    fetch('/api/auth/logout', { method: 'POST' })
      .catch(() => {}) // Ignore errors

    // Redirect to login
    router.push('/login')
  }, [router])

  return (
    <div className="container">
      <div className="spinner"></div>
    </div>
  )
}
