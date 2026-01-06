'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface LogicMazeProps {
  matchId: string
  userId: string
  lang: 'fr' | 'ar'
  onResultSubmitted: () => void
}

const MAZE = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 0, 1],
  [0, 0, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 0, 1, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

export default function LogicMaze({ matchId, userId, lang, onResultSubmitted }: LogicMazeProps) {
  const router = useRouter()
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 })
  const [startTime] = useState(Date.now())
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
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
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
    }
  }, [matchId, router])

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    setPlayerPos(prev => {
      let newRow = prev.row
      let newCol = prev.col

      if (direction === 'up' && newRow > 0) newRow--
      if (direction === 'down' && newRow < 7) newRow++
      if (direction === 'left' && newCol > 0) newCol--
      if (direction === 'right' && newCol < 7) newCol++

      if (MAZE[newRow][newCol] === 1) {
        // Hit a wall
        return prev
      }

      const newPos = { row: newRow, col: newCol }

      // Check if reached end
      if (newRow === 7 && newCol === 7) {
        setTimeout(() => {
          endGame()
        }, 100)
      }

      return newPos
    })
  }

  const endGame = async () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    const completionTime = (Date.now() - startTime) / 1000
    const score = 10000 / completionTime

    try {
      await fetch('/api/games/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          score,
          gameData: { completion_time: completionTime }
        })
      })

      onResultSubmitted()
    } catch (error) {
      console.error('Error submitting result:', error)
    }
  }

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1)

  return (
    <div className="game-area">
      <div className="game-score" style={{ marginBottom: '20px' }}>
        {lang === 'ar' ? `الوقت: ${elapsedTime}s` : `Time: ${elapsedTime}s`}
      </div>
      <div style={{ maxWidth: '400px', margin: '20px auto', background: 'var(--text-primary)', padding: '4px', borderRadius: 'var(--radius)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px' }}>
          {MAZE.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isPlayer = playerPos.row === rowIndex && playerPos.col === colIndex
              const isEnd = rowIndex === 7 && colIndex === 7
              const isWall = cell === 1

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    aspectRatio: '1',
                    background: isWall
                      ? 'var(--text-primary)'
                      : isPlayer
                      ? 'var(--primary-color)'
                      : isEnd
                      ? 'var(--success-color)'
                      : 'var(--card-bg)',
                    borderRadius: isPlayer ? '50%' : '4px',
                    minHeight: '40px',
                    transition: 'all 0.2s'
                  }}
                />
              )
            })
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '300px', margin: '30px auto' }}>
        <div></div>
        <button
          className="btn"
          onClick={() => movePlayer('up')}
          style={{ fontSize: '2rem', padding: '16px', minHeight: '60px' }}
        >
          ↑
        </button>
        <div></div>
        <button
          className="btn"
          onClick={() => movePlayer('left')}
          style={{ fontSize: '2rem', padding: '16px', minHeight: '60px' }}
        >
          ←
        </button>
        <button
          className="btn"
          onClick={() => movePlayer('down')}
          style={{ fontSize: '2rem', padding: '16px', minHeight: '60px' }}
        >
          ↓
        </button>
        <button
          className="btn"
          onClick={() => movePlayer('right')}
          style={{ fontSize: '2rem', padding: '16px', minHeight: '60px' }}
        >
          →
        </button>
      </div>
    </div>
  )
}
