'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface FastMathProps {
  matchId: string
  seed: string
  userId: string
  lang: 'fr' | 'ar'
  onResultSubmitted: () => void
}

export default function FastMath({ matchId, seed, userId, lang, onResultSubmitted }: FastMathProps) {
  const router = useRouter()
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const startTimeRef = useRef<number>(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const answerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Start game
    startTimeRef.current = Date.now()
    setGameStarted(true)
    generateQuestion()

    // Timer countdown
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Heartbeat (every 3 seconds)
    heartbeatIntervalRef.current = setInterval(() => {
      fetch('/api/games/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action: 'heartbeat' })
      }).catch(() => { })
    }, 3000)

    // Check opponent (every 2 seconds)
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
            // Opponent finished first
            endGame()
          }
        })
        .catch(() => { })
    }, 2000)

    // Block page leave
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [matchId, router])

  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 50) + 1
    const num2 = Math.floor(Math.random() * 50) + 1
    const operations = ['+', '-', '*']
    const op = operations[Math.floor(Math.random() * operations.length)]

    let q = `${num1} ${op} ${num2}`
    let ans = 0

    if (op === '+') ans = num1 + num2
    else if (op === '-') ans = num1 - num2
    else ans = num1 * num2

    setQuestion(q)
    setCurrentAnswer(ans)
    setAnswer('')
    setFeedback('')
    setTimeout(() => answerInputRef.current?.focus(), 100)
  }

  const handleAnswerSubmit = () => {
    const userAns = parseInt(answer)
    if (isNaN(userAns)) return

    if (userAns === currentAnswer) {
      setCorrectCount((prev) => prev + 1)
      setFeedback(lang === 'ar' ? 'صحيح!' : 'Correct!')
      setTimeout(() => {
        setFeedback('')
        generateQuestion()
      }, 1000)
    } else {
      setFeedback(
        lang === 'ar'
          ? `خطأ! الإجابة الصحيحة: ${currentAnswer}`
          : `Incorrect! Correct answer: ${currentAnswer}`
      )
      setTimeout(() => {
        setFeedback('')
        generateQuestion()
      }, 1500)
    }
  }

  const endGame = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    const totalTime = (Date.now() - startTimeRef.current) / 1000
    const score = correctCount * 100 - totalTime / 100

    try {
      await fetch('/api/games/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          score,
          gameData: {
            correct_answers: correctCount,
            total_time: totalTime
          }
        })
      })

      onResultSubmitted()
    } catch (error) {
      console.error('Error submitting result:', error)
    }
  }

  useEffect(() => {
    if (timeLeft <= 0 && gameStarted) {
      endGame()
    }
  }, [timeLeft, gameStarted])

  return (
    <div className="game-area">
      <div className="game-timer">{timeLeft}</div>
      <div className="game-score">
        {lang === 'ar' ? `النقاط: ${correctCount}` : `Points: ${correctCount}`}
      </div>
      <div className="game-question">{question}</div>
      <input
        ref={answerInputRef}
        type="number"
        className="game-input"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleAnswerSubmit()
          }
        }}
        placeholder="?"
        autoFocus
      />
      {feedback && (
        <div
          className={`game-feedback ${feedback.includes('Correct') || feedback.includes('صحيح') ? 'correct' : 'wrong'
            }`}
        >
          {feedback}
        </div>
      )}
    </div>
  )
}

