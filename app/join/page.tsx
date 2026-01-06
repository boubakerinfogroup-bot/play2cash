'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('user')

    if (!userStr) {
      router.push('/login')
      return
    }

    if (matchId) {
      joinMatch(matchId)
    } else {
      router.push('/')
    }
  }, [matchId, router])

  const joinMatch = async (id: string) => {
    try {
      const response = await fetch('/api/matches/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: id })
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/play?match=${id}`)
      } else {
        // Redirect to lobby with error
        router.push(`/lobby?error=${encodeURIComponent(result.error || 'Failed to join')}`)
      }
    } catch (error) {
      router.push('/lobby?error=join_failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return null
}

