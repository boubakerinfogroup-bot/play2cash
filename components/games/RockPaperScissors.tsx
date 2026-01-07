'use client'

import { useState, useEffect } from 'react'

interface RPSProps {
    onComplete: (score: number) => void
    isActive: boolean
    matchId?: string
}

type Choice = 'rock' | 'paper' | 'scissors' | null

export default function RockPaperScissors({ onComplete, isActive, matchId }: RPSProps) {
    const [playerChoice, setPlayerChoice] = useState<Choice>(null)
    const [opponentChoice, setOpponentChoice] = useState<Choice>(null)
    const [playerWins, setPlayerWins] = useState(0)
    const [opponentWins, setOpponentWins] = useState(0)
    const [currentRound, setCurrentRound] = useState(1)
    const [isRevealed, setIsRevealed] = useState(false)
    const [isGameOver, setIsGameOver] = useState(false)
    const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null)

    useEffect(() => {
        if (isActive && !isGameOver) {
            // Reset game
            setPlayerChoice(null)
            setOpponentChoice(null)
            setPlayerWins(0)
            setOpponentWins(0)
            setCurrentRound(1)
            setIsRevealed(false)
            setRoundResult(null)
        }
    }, [isActive])

    const makeChoice = (choice: Choice) => {
        if (playerChoice || isGameOver) return

        setPlayerChoice(choice)

        // Simulate opponent choice (in real game, this comes from server)
        setTimeout(() => {
            const choices: Choice[] = ['rock', 'paper', 'scissors']
            const oppChoice = choices[Math.floor(Math.random() * 3)]
            setOpponentChoice(oppChoice)
            setIsRevealed(true)

            // Determine winner
            const result = determineWinner(choice!, oppChoice!)
            setRoundResult(result)

            setTimeout(() => {
                handleRoundEnd(result)
            }, 2000)
        }, 1000)
    }

    const determineWinner = (player: Choice, opponent: Choice): 'win' | 'lose' | 'draw' => {
        if (player === opponent) return 'draw'
        if (
            (player === 'rock' && opponent === 'scissors') ||
            (player === 'paper' && opponent === 'rock') ||
            (player === 'scissors' && opponent === 'paper')
        ) {
            return 'win'
        }
        return 'lose'
    }

    const handleRoundEnd = (result: 'win' | 'lose' | 'draw') => {
        if (result === 'win') {
            const newWins = playerWins + 1
            setPlayerWins(newWins)
            if (newWins === 8) { // First to 8 wins (best of 15)
                endGame(true)
                return
            }
        } else if (result === 'lose') {
            const newWins = opponentWins + 1
            setOpponentWins(newWins)
            if (newWins === 8) { // First to 8 wins (best of 15)
                endGame(false)
                return
            }
        }
        // Draw doesn't count, don't increment round

        if (result !== 'draw') {
            setCurrentRound(prev => prev + 1)
        }

        // Reset for next round
        setTimeout(() => {
            setPlayerChoice(null)
            setOpponentChoice(null)
            setIsRevealed(false)
            setRoundResult(null)
        }, 1000)
    }

    const endGame = (playerWon: boolean) => {
        setIsGameOver(true)
        onComplete(playerWon ? 1000 : 100)
    }

    if (!isActive) return null

    const getChoiceEmoji = (choice: Choice) => {
        switch (choice) {
            case 'rock': return '✊'
            case 'paper': return '✋'
            case 'scissors': return '✌️'
            default: return '❓'
        }
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Score - Arabic */}
            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-around',
                direction: 'rtl',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>أنت</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{playerWins}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>الجولة {currentRound}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>الخصم</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{opponentWins}</div>
                </div>
            </div>

            {/* Game Area */}
            <div style={{
                height: '400px',
                background: 'linear-gradient(to bottom, #f3e8ff 0%, #e0e7ff 100%)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '40px'
            }}>
                {!isRevealed ? (
                    <>
                        <div style={{ fontSize: '3rem', opacity: playerChoice ? 0.3 : 1 }}>
                            {playerChoice ? getChoiceEmoji(playerChoice) : '❓'}
                        </div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#64748b',
                            direction: 'rtl'
                        }}>
                            {playerChoice ? 'في انتظار الخصم...' : 'اختر خيارك!'}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Revealed */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>أنت</div>
                            <div style={{ fontSize: '4rem' }}>{getChoiceEmoji(playerChoice)}</div>
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: roundResult === 'win' ? '#10b981' : roundResult === 'lose' ? '#ef4444' : '#f59e0b'
                        }}>
                            {roundResult === 'win' && '🎉 فزت!'}
                            {roundResult === 'lose' && '😔 خسرت'}
                            {roundResult === 'draw' && '🤝 تعادل'}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>الخصم</div>
                            <div style={{ fontSize: '4rem' }}>{getChoiceEmoji(opponentChoice)}</div>
                        </div>
                    </>
                )}

                {/* Game Over */}
                {isGameOver && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '20px',
                        direction: 'rtl',
                        zIndex: 10
                    }}>
                        <div style={{ fontSize: '4rem' }}></div>
                        <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800 }}>
                            {playerWins > opponentWins ? 'فزت بالمباراة!' : 'خسرت المباراة'}
                        </div>
                        <div style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>
                            {playerWins} - {opponentWins}
                        </div>
                    </div>
                )}
            </div>

            {/* Choice Buttons */}
            {!playerChoice && !isGameOver && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginTop: '20px'
                }}>
                    <button
                        onClick={() => makeChoice('rock')}
                        style={{
                            padding: '24px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 800,
                            fontSize: '3rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                            transition: 'transform 100ms',
                            userSelect: 'none'
                        }}
                    >
                        ✊
                    </button>
                    <button
                        onClick={() => makeChoice('paper')}
                        style={{
                            padding: '24px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 800,
                            fontSize: '3rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                            transition: 'transform 100ms',
                            userSelect: 'none'
                        }}
                    >
                        ✋
                    </button>
                    <button
                        onClick={() => makeChoice('scissors')}
                        style={{
                            padding: '24px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 800,
                            fontSize: '3rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                            transition: 'transform 100ms',
                            userSelect: 'none'
                        }}
                    >
                        ✌️
                    </button>
                </div>
            )}

            {/* Instructions - Arabic */}
            <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                direction: 'rtl',
                marginTop: '16px'
            }}>
                💡 اختر حجر أو ورقة أو مقص - أول من يفوز بجولتين يربح!
            </div>
        </div>
    )
}
