'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ColorRunProps {
  matchId: string
  userId: string
  lang: 'fr' | 'ar'
  onResultSubmitted: () => void
}

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
const COLOR_NAMES = {
  fr: { red: 'Rouge', blue: 'Bleu', green: 'Vert', yellow: 'Jaune', purple: 'Violet', orange: 'Orange' },
  ar: { red: 'أحمر', blue: 'أزرق', green: 'أخضر', yellow: 'أصفر', purple: 'بنفسجي', orange: 'برتقالي' }
}

export default function ColorRun({ matchId, userId, lang, onResultSubmitted }: ColorRunProps) {
  const router = useRouter()
  const [targetColor, setTargetColor] = useState<string>('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const startTimeRef = useRef<number>(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    startTimeRef.current = Date.now()
    generateTiles()

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    heartbeatIntervalRef.current = setInterval(() => {
      fetch('/api/games/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action: 'heartbeat' })
      }).catch(() => {})
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
        .catch(() => {})
    }, 2000)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
    }
  }, [matchId, router])

  const generateTiles = () => {
    const newTarget = COLORS[Math.floor(Math.random() * COLORS.length)]
    setTargetColor(newTarget)
  }

  const handleTileClick = (color: string) => {
    if (color === targetColor) {
      setScore(prev => prev + 1)
      generateTiles()
    } else {
      // Wrong color - end game
      endGame()
    }
  }

  const endGame = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    try {
      await fetch('/api/games/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          score,
          gameData: { score }
        })
      })

      onResultSubmitted()
    } catch (error) {
      console.error('Error submitting result:', error)
    }
  }

  useEffect(() => {
    if (timeLeft <= 0) {
      endGame()
    }
  }, [timeLeft])

  const tileColors = Array.from({ length: 9 }, () => COLORS[Math.floor(Math.random() * COLORS.length)])

  return (
    <div className="game-area">
      <div className="game-timer">{timeLeft}</div>
      <div className="game-score">
        {lang === 'ar' ? `النتيجة: ${score}` : `Score: ${score}`}
      </div>
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          margin: '20px 0',
          padding: '20px',
          borderRadius: 'var(--radius)',
          background: targetColor,
          color: 'white',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {lang === 'ar' ? `اضغط على: ${COLOR_NAMES.ar[targetColor as keyof typeof COLOR_NAMES.ar]}` : `Tap: ${COLOR_NAMES.fr[targetColor as keyof typeof COLOR_NAMES.fr]}`}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '400px', margin: '30px auto' }}>
        {tileColors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(color)}
            style={{
              aspectRatio: '1',
              background: color,
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              minHeight: '100px',
              transition: 'var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          />
        ))}
      </div>
    </div>
  )
}
