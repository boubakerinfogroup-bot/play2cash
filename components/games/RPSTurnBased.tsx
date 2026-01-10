'use client'

import { useState } from 'react'
import TurnBasedWrapper from './TurnBasedWrapper'

interface RPSTurnBasedProps {
    matchId: string
    seed: string
    userId: string
    lang: 'fr' | 'ar'
    onResultSubmitted: () => void
}

type Choice = 'rock' | 'paper' | 'scissors'

export default function RPSTurnBased({ matchId, seed, userId, lang, onResultSubmitted }: RPSTurnBasedProps) {
    const [myChoice, setMyChoice] = useState<Choice | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const handleMove = async (moveData: any) => {
        // This is handled by TurnBasedWrapper
    }

    const handleSubmitChoice = (choice: Choice, onSubmitMove: (data: any) => void) => {
        setMyChoice(choice)
        setSubmitted(true)
        onSubmitMove({ choice })
    }

    const getEmoji = (choice: Choice) => {
        switch (choice) {
            case 'rock': return '✊'
            case 'paper': return '✋'
            case 'scissors': return '✌️'
        }
    }

    return (
        <TurnBasedWrapper
            matchId={matchId}
            userId={userId}
            lang={lang}
            onMove={handleMove}
        >
            {({ isMyTurn, timeRemaining, onSubmitMove }) => (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '40px',
                    position: 'relative'
                }}>
                    {/* Title */}
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: 'white',
                        marginBottom: '40px',
                        textAlign: 'center',
                        textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        {lang === 'ar' ? 'حجر ورقة مقص' : 'Pierre Papier Ciseaux'}
                    </h1>

                    {/* Status Message */}
                    {submitted && !isMyTurn && (
                        <div style={{
                            fontSize: '1.5rem',
                            color: 'white',
                            marginBottom: '30px',
                            animation: 'pulse 1.5s infinite',
                            textAlign: 'center'
                        }}>
                            {lang === 'ar' ? '⏳ في انتظار الخصم...' : "⏳ En attente de l'adversaire..."}
                        </div>
                    )}

                    {/* Choice Display (if submitted) */}
                    {myChoice && (
                        <div style={{
                            fontSize: '8rem',
                            marginBottom: '40px',
                            transform: submitted ? 'scale(1.2)' : 'scale(1)',
                            transition: 'transform 0.3s ease'
                        }}>
                            {getEmoji(myChoice)}
                        </div>
                    )}

                    {/* Choice Buttons */}
                    {!submitted && isMyTurn && (
                        <div style={{
                            display: 'flex',
                            gap: '30px',
                            marginBottom: '30px'
                        }}>
                            {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
                                <button
                                    key={choice}
                                    onClick={() => handleSubmitChoice(choice, onSubmitMove)}
                                    style={{
                                        fontSize: '6rem',
                                        background: 'rgba(255,255,255,0.15)',
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        borderRadius: '20px',
                                        padding: '30px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)'
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)'
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                                    }}
                                >
                                    {getEmoji(choice)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Instructions */}
                    {!submitted && isMyTurn && (
                        <p style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '1.25rem',
                            textAlign: 'center',
                            maxWidth: '500px'
                        }}>
                            {lang === 'ar'
                                ? 'اختر خيارك قبل انتهاء الوقت!'
                                : 'Choisissez votre coup avant la fin du temps!'}
                        </p>
                    )}

                    {!isMyTurn && !submitted && (
                        <p style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '1.5rem',
                            textAlign: 'center'
                        }}>
                            {lang === 'ar' ? 'دور الخصم...' : "Tour de l'adversaire..."}
                        </p>
                    )}

                    <style jsx>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.6; }
            }
          `}</style>
                </div>
            )}
        </TurnBasedWrapper>
    )
}
