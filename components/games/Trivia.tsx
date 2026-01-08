'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface TriviaProps {
  matchId: string
  seed: string
  userId: string
  lang: 'fr' | 'ar'
  onResultSubmitted: () => void
}

const QUESTIONS = {
  fr: [
    { q: 'Quelle est la capitale de la France?', a: 'Paris', options: ['Paris', 'Lyon', 'Marseille'] },
    { q: 'Combien de continents y a-t-il?', a: '7', options: ['5', '7', '9'] },
    { q: 'Quel est le plus grand océan?', a: 'Pacifique', options: ['Atlantique', 'Pacifique', 'Indien'] },
    { q: 'Quelle est la planète la plus proche du soleil?', a: 'Mercure', options: ['Vénus', 'Mercure', 'Terre'] },
    { q: 'Combien de côtés a un triangle?', a: '3', options: ['3', '4', '5'] },
    { q: 'Quelle est la couleur du ciel par temps clair?', a: 'Bleu', options: ['Bleu', 'Rouge', 'Vert'] },
    { q: 'Combien de minutes dans une heure?', a: '60', options: ['30', '60', '90'] },
    { q: 'Quel est le symbole chimique de l\'eau?', a: 'H2O', options: ['H2O', 'CO2', 'O2'] },
    { q: 'Quelle est la capitale de la Tunisie?', a: 'Tunis', options: ['Tunis', 'Sfax', 'Sousse'] },
    { q: 'Combien de jours dans une semaine?', a: '7', options: ['5', '7', '10'] },
  ],
  ar: [
    { q: 'ما هي عاصمة فرنسا?', a: 'باريس', options: ['باريس', 'ليون', 'مرسيليا'] },
    { q: 'كم عدد القارات?', a: '7', options: ['5', '7', '9'] },
    { q: 'ما هو أكبر محيط?', a: 'الهادئ', options: ['الأطلسي', 'الهادئ', 'الهندي'] },
    { q: 'ما هي أقرب كوكب للشمس?', a: 'عطارد', options: ['الزهرة', 'عطارد', 'الأرض'] },
    { q: 'كم عدد أضلاع المثلث?', a: '3', options: ['3', '4', '5'] },
    { q: 'ما لون السماء في يوم صاف?', a: 'أزرق', options: ['أزرق', 'أحمر', 'أخضر'] },
    { q: 'كم دقيقة في الساعة?', a: '60', options: ['30', '60', '90'] },
    { q: 'ما هو الرمز الكيميائي للماء?', a: 'H2O', options: ['H2O', 'CO2', 'O2'] },
    { q: 'ما هي عاصمة تونس?', a: 'تونس', options: ['تونس', 'صفاقس', 'سوسة'] },
    { q: 'كم يوم في الأسبوع?', a: '7', options: ['5', '7', '10'] },
  ]
}

export default function Trivia({ matchId, seed, userId, lang, onResultSubmitted }: TriviaProps) {
  const router = useRouter()
  const [questions] = useState(QUESTIONS[lang])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const startTimeRef = useRef<number>(0)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    startTimeRef.current = Date.now()

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

  const handleAnswer = (option: string) => {
    if (selectedOption || showFeedback) return

    const question = questions[currentQuestion]
    const isCorrect = option === question.a

    setSelectedOption(option)
    setShowFeedback(true)

    if (isCorrect) {
      setCorrect(prev => prev + 1)
    } else {
      setWrong(prev => prev + 1)
      if (wrong + 1 >= 2) {
        // 2 wrong answers = game over
        setTimeout(() => {
          endGame()
        }, 1500)
        return
      }
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedOption(null)
        setShowFeedback(false)
      } else {
        endGame()
      }
    }, 1500)
  }

  const endGame = async () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    const score = (correct * 100) - (wrong * 500)

    try {
      await fetch('/api/games/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          score,
          gameData: {
            wrong_answers: wrong,
            correct_answers: correct
          }
        })
      })

      onResultSubmitted()
    } catch (error) {
      console.error('Error submitting result:', error)
    }
  }

  if (currentQuestion >= questions.length) {
    return null
  }

  const question = questions[currentQuestion]
  const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5)

  return (
    <div className="game-area">
      <div className="trivia-stats">
        <div className="trivia-stat correct">
          {lang === 'ar' ? `صحيح: ${correct}` : `Correct: ${correct}`}
        </div>
        <div className="trivia-stat wrong">
          {lang === 'ar' ? `خطأ: ${wrong}/2` : `Wrong: ${wrong}/2`}
        </div>
      </div>
      <div className="trivia-question">{question.q}</div>
      <div className="trivia-options">
        {shuffledOptions.map((option, index) => (
          <button
            key={index}
            className={`trivia-option ${showFeedback && selectedOption === option
                ? option === question.a
                  ? 'correct'
                  : 'wrong'
                : ''
              }`}
            onClick={() => handleAnswer(option)}
            disabled={!!selectedOption || showFeedback}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

