'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface MemoryGridProps {
  matchId: string
  seed: string
  userId: string
  lang: 'fr' | 'ar'
  onResultSubmitted: () => void
}

export default function MemoryGrid({ matchId, seed, userId, lang, onResultSubmitted }: MemoryGridProps) {
  const router = useRouter()
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [level, setLevel] = useState(1)
  const [showing, setShowing] = useState(false)
  const [status, setStatus] = useState(lang === 'ar' ? 'شاهد التسلسل...' : 'Watch the sequence...')
  const startTimeRef = useRef<number>(0)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    startTimeRef.current = Date.now()
    generateSequence()

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

  const generateSequence = () => {
    const newSeq = Array.from({ length: level + 2 }, () => Math.floor(Math.random() * 9))
    setSequence(newSeq)
    setUserSequence([])
    showSequence()
  }

  const showSequence = () => {
    setShowing(true)
    setStatus(lang === 'ar' ? 'شاهد التسلسل...' : 'Watch the sequence...')

    const cells = document.querySelectorAll('.memory-cell')
    cells.forEach((c: Element) => c.classList.remove('active'))

    sequence.forEach((cellIndex, i) => {
      setTimeout(() => {
        const cell = cells[cellIndex] as HTMLElement
        if (cell) {
          cell.classList.add('active')
          setTimeout(() => {
            cell.classList.remove('active')
          }, 500)
        }
      }, i * 600)
    })

    setTimeout(() => {
      setShowing(false)
      setStatus(lang === 'ar' ? 'كرر التسلسل' : 'Repeat the sequence')
      setUserSequence([])
    }, sequence.length * 600 + 500)
  }

  const handleCellClick = (index: number) => {
    if (showing) return

    const newUserSeq = [...userSequence, index]
    setUserSequence(newUserSeq)

    const cell = document.querySelector(`[data-index="${index}"]`) as HTMLElement
    if (cell) {
      cell.classList.add('selected')
      setTimeout(() => {
        cell.classList.remove('selected')
      }, 300)
    }

    if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
      // Wrong answer
      if (cell) {
        cell.classList.add('wrong')
      }
      setTimeout(() => {
        endGame()
      }, 1000)
      return
    }

    if (newUserSeq.length === sequence.length) {
      // Level complete
      setLevel(prev => prev + 1)
      setTimeout(() => {
        generateSequence()
      }, 1000)
    }
  }

  const endGame = async () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    const score = level * 10

    try {
      await fetch('/api/games/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          score,
          gameData: { sequence_length: level }
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
        {lang === 'ar' ? `المستوى: ${level}` : `Level: ${level}`}
      </div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '600' }}>{status}</h2>
      <div className="memory-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className="memory-cell"
            data-index={i}
            onClick={() => handleCellClick(i)}
          >
            {userSequence.includes(i) ? '✓' : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

