'use client'

import { useState } from 'react'
import TurnBasedWrapper from './TurnBasedWrapper'

interface BankerTurnBasedProps {
    matchId: string
    seed: string
    userId: string
    lang: 'fr' | 'ar'
    onResultSubmitted: () => void
}

const BRIEFCASES = [
    { number: 1, value: 10, color: '#3b82f6' },
    { number: 2, value: 50, color: '#8b5cf6' },
    { number: 3, value: 100, color: '#ec4899' },
    { number: 4, value: 500, color: '#f59e0b' },
    { number: 5, value: 1000, color: '#10b981' }
]

export default function BankerTurnBased({ matchId, seed, userId, lang, onResultSubmitted }: BankerTurnBasedProps) {
    const [selectedBriefcase, setSelectedBriefcase] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const handleMove = async (moveData: any) => {
        // This is handled by TurnBasedWrapper
    }

    const handleSelectBriefcase = (briefcaseNumber: number, onSubmitMove: (data: any) => void) => {
        setSelectedBriefcase(briefcaseNumber)
        setSubmitted(true)
        onSubmitMove({ briefcase: briefcaseNumber })
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
                    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                    padding: '40px'
                }}>
                    {/* Title */}
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        color: '#fbbf24',
                        marginBottom: '20px',
                        textShadow: '0 4px 12px rgba(251, 191, 36, 0.5)',
                        textAlign: 'center'
                    }}>
                        {lang === 'ar' ? '💼 لعبة البنك' : '💼 Banker Game'}
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '1.1rem',
                        marginBottom: '40px',
                        textAlign: 'center',
                        maxWidth: '500px'
                    }}>
                        {lang === 'ar'
                            ? 'اختر حقيبة واحدة. القيمة الأعلى تفوز!'
                            : 'Choisissez une mallette. La plus haute valeur gagne!'}
                    </p>

                    {/* Selected Briefcase Display */}
                    {selectedBriefcase && (
                        <div style={{
                            fontSize: '6rem',
                            marginBottom: '30px',
                            animation: 'bounce 0.6s ease'
                        }}>
                            💼
                        </div>
                    )}

                    {/* Waiting Message */}
                    {submitted && (
                        <div style={{
                            fontSize: '1.5rem',
                            color: '#fbbf24',
                            marginBottom: '30px',
                            animation: 'pulse 1.5s infinite',
                            textAlign: 'center'
                        }}>
                            {lang === 'ar' ? '⏳ في انتظار الخصم...' : "⏳ En attente de l'adversaire..."}
                        </div>
                    )}

                    {/* Briefcase Grid */}
                    {!submitted && isMyTurn && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '20px',
                            maxWidth: '700px',
                            width: '100%'
                        }}>
                            {BRIEFCASES.map((briefcase) => (
                                <button
                                    key={briefcase.number}
                                    onClick={() => handleSelectBriefcase(briefcase.number, onSubmitMove)}
                                    style={{
                                        background: `linear-gradient(135deg, ${briefcase.color} 0%, ${briefcase.color}dd 100%)`,
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        borderRadius: '15px',
                                        padding: '30px 20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)'
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                >
                                    <div style={{ fontSize: '3rem' }}>💼</div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}>
                                        #{briefcase.number}
                                    </div>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        color: 'rgba(255,255,255,0.9)',
                                        fontWeight: 600
                                    }}>
                                        {briefcase.value} TND
                                    </div>
                                </button>
                            ))}
                        </div>
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
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
                </div>
            )}
        </TurnBasedWrapper>
    )
}
