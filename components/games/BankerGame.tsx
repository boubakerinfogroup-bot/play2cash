'use client'

import { useState, useEffect, useRef } from 'react'
import seedrandom from 'seedrandom'

interface BankerGameProps {
    matchId: string
    seed: string
    userId: string
    lang: 'fr' | 'ar'
    onResultSubmitted: () => void
}



interface Round {
    safe: number
    riskWin: number
    riskLose: number
    outcome: boolean // true = win, false = lose
}

export default function BankerGame({ matchId, seed, userId, lang, onResultSubmitted }: BankerGameProps) {
    const [playerStack, setPlayerStack] = useState(0)
    const [opponentStack, setOpponentStack] = useState(0)
    const [currentRound, setCurrentRound] = useState(0)
    const [rounds, setRounds] = useState<Round[]>([])
    const [playerChoice, setPlayerChoice] = useState<'safe' | 'risk' | null>(null)
    const [opponentChoice, setOpponentChoice] = useState<'safe' | 'risk' | null>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const [isGameOver, setIsGameOver] = useState(false)

    const randomGen = useRef<(() => number) | null>(null)

    useEffect(() => {
        // Initialize seeded RNG with the seed prop
        randomGen.current = seedrandom(seed)
        generateRounds()
    }, [seed])

    useEffect(() => {
        if (!isGameOver) {
            resetGame()
        }
    }, [])

    const generateRounds = () => {
        const rng = randomGen.current || (() => Math.random())
        const newRounds: Round[] = []

        // Balanced scenarios - risk is roughly 2x safe with equal downside
        const scenarios = [
            { safe: 10, riskWin: 20, riskLose: -10 },
            { safe: 12, riskWin: 24, riskLose: -12 },
            { safe: 15, riskWin: 30, riskLose: -15 },
            { safe: 8, riskWin: 16, riskLose: -8 },
            { safe: 18, riskWin: 36, riskLose: -18 },
            { safe: 20, riskWin: 40, riskLose: -20 },
            { safe: 14, riskWin: 28, riskLose: -14 },
            { safe: 16, riskWin: 32, riskLose: -16 },
            { safe: 22, riskWin: 44, riskLose: -22 },
            { safe: 25, riskWin: 50, riskLose: -25 }
        ]

        for (let i = 0; i < 5; i++) {
            const scenario = scenarios[Math.floor(rng() * scenarios.length)]
            newRounds.push({
                safe: scenario.safe,
                riskWin: scenario.riskWin,
                riskLose: scenario.riskLose,
                outcome: rng() > 0.5 // 50/50 chance
            })
        }

        setRounds(newRounds)
    }

    const resetGame = () => {
        setOpponentStack(0)
        setCurrentRound(0)
        setPlayerChoice(null)
        setOpponentChoice(null)
        setIsRevealed(false)
        setIsGameOver(false)
    }

    const makeChoice = (choice: 'safe' | 'risk') => {
        if (playerChoice || isGameOver) return

        setPlayerChoice(choice)

        // Simulate opponent choice
        setTimeout(() => {
            const oppChoice: 'safe' | 'risk' = Math.random() > 0.5 ? 'safe' : 'risk'
            setOpponentChoice(oppChoice)
            setIsRevealed(true)

            setTimeout(() => {
                resolveRound(choice, oppChoice)
            }, 2000)
        }, 800)
    }

    const resolveRound = (pChoice: 'safe' | 'risk', oChoice: 'safe' | 'risk') => {
        const round = rounds[currentRound]

        // Player result
        let playerChange = 0
        if (pChoice === 'safe') {
            playerChange = round.safe
        } else {
            playerChange = round.outcome ? round.riskWin : round.riskLose
        }

        // Opponent result (same outcomes apply)
        let opponentChange = 0
        if (oChoice === 'safe') {
            opponentChange = round.safe
        } else {
            opponentChange = round.outcome ? round.riskWin : round.riskLose
        }

        const newPlayerStack = playerStack + playerChange
        const newOpponentStack = opponentStack + opponentChange

        setPlayerStack(newPlayerStack)
        setOpponentStack(newOpponentStack)

        setTimeout(() => {
            if (currentRound === 4) {
                // Game over - check who reached 200 first or has higher score
                endGame(newPlayerStack >= 200 || (newPlayerStack > newOpponentStack && currentRound === 4))
            } else if (newPlayerStack >= 200 || newOpponentStack >= 200) {
                // Someone reached 200 mid-game
                endGame(newPlayerStack >= 200)
            } else {
                // Next round
                setCurrentRound(prev => prev + 1)
                setPlayerChoice(null)
                setOpponentChoice(null)
                setIsRevealed(false)
            }
        }, 2000)
    }

    const endGame = (playerWon: boolean) => {
        setIsGameOver(true)
        onResultSubmitted()
    }

    if (rounds.length === 0) return null

    const round = rounds[currentRound]

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Stacks */}
            <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-around',
                direction: 'rtl',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>رصيدك</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{playerStack}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>الجولة {currentRound + 1}/5</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>الخصم</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{opponentStack}</div>
                </div>
            </div>

            {/* Game Area */}
            <div style={{
                background: 'linear-gradient(to bottom, #fef3c7 0%, #fef3c7 100%)',
                borderRadius: '20px',
                padding: '20px',
                border: '3px solid #cbd5e1',
                marginBottom: '20px',
                minHeight: '300px'
            }}>
                {!isRevealed ? (
                    <>
                        {/* Round Options */}
                        <div style={{
                            display: 'grid',
                            gap: '16px'
                        }}>
                            <button
                                onClick={() => makeChoice('safe')}
                                style={{
                                    padding: '24px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                    textAlign: 'center',
                                    direction: 'rtl'
                                }}
                            >
                                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', opacity: 0.9 }}>آمن</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>+{round.safe}</div>
                            </button>

                            <button
                                onClick={() => makeChoice('risk')}
                                style={{
                                    padding: '24px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                                    textAlign: 'center',
                                    direction: 'rtl'
                                }}
                            >
                                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', opacity: 0.9 }}>مخاطرة</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>+{round.riskWin}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '-8px' }}>{round.riskLose}</div>
                            </button>
                        </div>

                        {playerChoice && (
                            <div style={{
                                textAlign: 'center',
                                direction: 'rtl',
                                padding: '40px 20px',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: '#64748b'
                            }}>
                                اخترت: {playerChoice === 'safe' ? `+${round.safe}` : `+${round.riskWin} / ${round.riskLose}`}
                                <div style={{ marginTop: '16px', fontSize: '1rem', opacity: 0.7 }}>
                                    في انتظار الخصم...
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Results */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            direction: 'rtl'
                        }}>
                            <div style={{
                                padding: '20px',
                                background: playerChoice === 'safe' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>أنت</div>
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                                    {playerChoice === 'safe' ? '🏦' : '🎲'}
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 900,
                                    color: (playerChoice === 'safe' ? round.safe : (round.outcome ? round.riskWin : round.riskLose)) > 0 ? '#10b981' : '#ef4444'
                                }}>
                                    {playerChoice === 'safe' ? `+${round.safe}` : (round.outcome ? `+${round.riskWin}` : round.riskLose)}
                                </div>
                            </div>

                            <div style={{
                                padding: '20px',
                                background: opponentChoice === 'safe' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>الخصم</div>
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                                    {opponentChoice === 'safe' ? '🏦' : '🎲'}
                                </div>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 900,
                                    color: (opponentChoice === 'safe' ? round.safe : (round.outcome ? round.riskWin : round.riskLose)) > 0 ? '#10b981' : '#ef4444'
                                }}>
                                    {opponentChoice === 'safe' ? `+${round.safe}` : (round.outcome ? `+${round.riskWin}` : round.riskLose)}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: round.outcome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '12px',
                            textAlign: 'center',
                            direction: 'rtl',
                            fontWeight: 700,
                            color: round.outcome ? '#10b981' : '#ef4444'
                        }}>
                            {round.outcome ? '✅ المخاطرة نجحت!' : '❌ المخاطرة فشلت!'}
                        </div>
                    </>
                )}
            </div>

            {/* Game Over */}
            {isGameOver && (
                <div style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    borderRadius: '20px',
                    padding: '30px',
                    textAlign: 'center',
                    direction: 'rtl'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
                        {playerStack > opponentStack ? '🏆' : '💔'}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
                        {playerStack > opponentStack ? 'فزت!' : 'خسرت'}
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#f59e0b' }}>
                        {playerStack} - {opponentStack}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                direction: 'rtl'
            }}>
                💡 اختر بحكمة - أعلى رصيد بعد 5 جولات يفوز!
            </div>
        </div>
    )
}
