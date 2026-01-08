'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface MemoryCardProps {
  matchId: string
  seed: string
  userId: string
  lang: 'fr' | 'ar'
  onResultSubmitted: () => void
}

const SYMBOLS = ['🍎', '🍌', '🍇', '🍊', '🦁', '🐯', '🐼', '🦊', '⚽', '🏀', '🎮', '🎸', '🚗', '✈️', '🚀', '⭐']

export default function MemoryCard({ matchId, seed, userId, lang, onResultSubmitted }: MemoryCardProps) {
  const router = useRouter()
  const [cards, setCards] = useState<number[]>([])
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [firstFlipped, setFirstFlipped] = useState<number | null>(null)
  const [pairsMatched, setPairsMatched] = useState(0)
  const startTimeRef = useRef<number>(0)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    startTimeRef.current = Date.now()
    initializeCards()

    heartbeatIntervalRef.current = setInterval(() => {
      fetch('/api/games/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action: 'heartbeat' })
      }).catch(() => { })
    }, 3000)

    checkIntervalRef.current = setInterval(() => {
      fetch('/api/games/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action: 'check' })
      })
        .then(res => res.json())
        .then(data => {
          if (data.match_completed) {
            router.push(`/result?match=${matchId}`)
          } else if (data.opponent_finished) {
            endGame()
          }
        })
        .catch(() => { })
    }, 2000)

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
    }
  }, [matchId, router])

  const initializeCards = () => {
    const pairs = Array.from({ length: 16 }, (_, i) => Math.floor(i / 2))
    const shuffled = [...pairs].sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }

  const handleFlip = (index: number) => {
    if (matched.has(index) || flipped.has(index)) return

    const newFlipped = new Set(flipped)
    newFlipped.add(index)
    setFlipped(newFlipped)

    if (firstFlipped === null) {
      setFirstFlipped(index)
    } else {
      if (cards[firstFlipped] === cards[index]) {
        const newMatched = new Set([...matched, firstFlipped, index])
        setMatched(newMatched)
        setFlipped(new Set())
        setFirstFlipped(null)
        setPairsMatched(prev => prev + 1)

        if (newMatched.size >= cards.length) {
          endGame()
        }
      } else {
        setTimeout(() => {
          setFlipped(new Set())
          setFirstFlipped(null)
        }, 1000)
      }
    }
  }

  const endGame = async () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    const totalTime = (Date.now() - startTimeRef.current) / 1000
    const score = (pairsMatched + 1) * 100 - totalTime / 10

    try {
      await fetch('/api/games/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          score,
          gameData: {
            pairs_matched: pairsMatched + 1,
            total_time: totalTime
          }
        })
      })

      onResultSubmitted()
    } catch (error) {
      console.error('Error submitting result:', error)
    }
  }

  return (
    <div className="game-area">
      <div className="game-score">
        {lang === 'ar' ? `الأزواج: ${pairsMatched}/8` : `Pairs: ${pairsMatched}/8`}
      </div>
      <div className="memory-card-grid">
        {cards.map((symbolIndex, index) => (
          <div
            key={index}
            className={`memory-card ${flipped.has(index) || matched.has(index) ? 'flipped' : ''} ${matched.has(index) ? 'matched' : ''}`}
            onClick={() => handleFlip(index)}
          >
            {flipped.has(index) || matched.has(index) ? SYMBOLS[symbolIndex] : '?'}
          </div>
        ))}
      </div>
    </div>
  )
}

