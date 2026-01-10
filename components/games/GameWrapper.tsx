'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { matchesAPI } from '@/lib/api-client'

// Lazy load the actual 7 games
const BankerGame = dynamic(() => import('./BankerGame'), { ssr: false })
const MemoryGame = dynamic(() => import('./MemoryGame'), { ssr: false })
const PatternLock = dynamic(() => import('./PatternLock'), { ssr: false })
const RockPaperScissors = dynamic(() => import('./RockPaperScissors'), { ssr: false })
const RocketGame = dynamic(() => import('./RocketGame'), { ssr: false })
const SequencePad = dynamic(() => import('./SequencePad'), { ssr: false })
const TicTacToePlus = dynamic(() => import('./TicTacToePlus'), { ssr: false })

// Turn-based game components
const RPSTurnBased = dynamic(() => import('./RPSTurnBased'), { ssr: false })
const TicTacToeTurnBased = dynamic(() => import('./TicTacToeTurnBased'), { ssr: false })
const BankerTurnBased = dynamic(() => import('./BankerTurnBased'), { ssr: false })

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
        <p>{lang === 'ar' ? 'في انتظار الخصم...' : "En attente de l'adversaire..."}</p>
        <div className="spinner"></div>
      </div>
    )
  }

  // Render game based on slug
  switch (gameSlug) {
    // Time-based games (simultaneous play)
    case 'banker-game':
      return <BankerGame matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'memory-game':
    case 'memory-cards':
      return <MemoryGame matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'pattern-lock':
      return <PatternLock matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'rock-paper-scissors':
      return <RockPaperScissors matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'rocket-game':
      return <RocketGame matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'sequence-pad':
      return <SequencePad matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'tic-tac-toe-plus':
      return <TicTacToePlus matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />

    // Turn-based games (sequential play)
    case 'rps-turn-based':
      return <RPSTurnBased matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'tictactoe-turn-based':
      return <TicTacToeTurnBased matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />
    case 'banker-turn-based':
      return <BankerTurnBased matchId={matchId} seed={gameSeed} userId={userId} lang={lang} onResultSubmitted={handleResultSubmitted} />

    default:
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>{lang === 'ar' ? 'اللعبة غير متاحة بعد' : `Jeu non disponible (${gameSlug})`}</p>
        </div>
      )
  }
}

