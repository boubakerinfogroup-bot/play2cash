'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { matchesAPI } from '@/lib/api-client'

// Lazy load games
const FastMath = dynamic(() => import('./FastMath'), { ssr: false })
const MemoryGrid = dynamic(() => import('./MemoryGrid'), { ssr: false })
const MemoryCard = dynamic(() => import('./MemoryCard'), { ssr: false })
const Trivia = dynamic(() => import('./Trivia'), { ssr: false })
const ColorRun = dynamic(() => import('./ColorRun'), { ssr: false })
const LogicMaze = dynamic(() => import('./LogicMaze'), { ssr: false })

interface GameWrapperProps {
  matchId: string
  gameSlug: string
  gameSeed: string
  userId: string
  lang: 'fr' | 'ar'
}

export default function GameWrapper({ matchId, gameSlug, gameSeed, userId, lang }: GameWrapperProps) {
  const router = useRouter()
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleResultSubmitted = () => {
    setHasSubmitted(true)
    // Poll for match completion
    const interval = setInterval(() => {
      matchesAPI.get(matchId)
        .then(data => {
          if (data.match && data.match.status === 'COMPLETED') {
            clearInterval(interval)
            router.push(`/result?match=${matchId}`)
          }
        })
        .catch(() => { })
    }, 2000)

    return () => clearInterval(interval)
  }

  if (hasSubmitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h2>{lang === 'ar' ? 'تم إرسال النتيجة' : 'Résultat envoyé'}</h2>
        <p>{lang === 'ar' ? 'في انتظار الخصم...' : 'En attente de l\'adversaire...'}</p>
        <div className="spinner"></div>
      </div>
    )
  }

  // Render game based on slug
  switch (gameSlug) {
    case 'fast-math':
      return <FastMath matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'memory-grid':
      return <MemoryGrid matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'memory-card':
      return <MemoryCard matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'trivia':
      return <Trivia matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'color-run':
      return <ColorRun matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'logic-maze':
      return <LogicMaze matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    default:
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>{lang === 'ar' ? 'اللعبة غير متاحة بعد' : 'Jeu non disponible'}</p>
        </div>
      )
  }
}

