'use client'

import { useState, useEffect, useRef } from 'react'

interface PatternLockProps {
    onComplete: (score: number) => void
    isActive: boolean
    matchId?: string
}

class SeededRandom {
    private seed: number
    constructor(seed: number) { this.seed = seed }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280
        return this.seed / 233280
    }
}

export default function PatternLock({ onComplete, isActive, matchId }: PatternLockProps) {
    const [pattern, setPattern] = useState<number[]>([])
    const [playerPattern, setPlayerPattern] = useState<number[]>([])
    const [isShowingPattern, setIsShowingPattern] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentRound, setCurrentRound] = useState(1)
    const [playerWins, setPlayerWins] = useState(0)
    const [opponentWins, setOpponentWins] = useState(0)
    const [isGameOver, setIsGameOver] = useState(false)
    const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

    const randomGen = useRef<SeededRandom | null>(null)
    const touchedDots = useRef<Set<number>>(new Set())

    useEffect(() => {
        if (matchId) {
            const seed = parseInt(matchId.replace(/\D/g, '').slice(0, 9)) || 12345
            randomGen.current = new SeededRandom(seed)
        }
    }, [matchId])

    useEffect(() => {
        if (isActive && !isGameOver) {
            startNewRound()
        }
    }, [isActive, currentRound])

    const startNewRound = () => {
        // Generate pattern (length increases with round)
        const patternLength = Math.min(3 + currentRound, 8)
        const newPattern: number[] = []
        const rng = randomGen.current || { next: () => Math.random() }

        while (newPattern.length < patternLength) {
            const dot = Math.floor(rng.next() * 9)
            if (!newPattern.includes(dot)) {
                newPattern.push(dot)
            }
        }

        setPattern(newPattern)
        setPlayerPattern([])
        setResult(null)
        setIsDrawing(false)
        touchedDots.current.clear()

        // Show pattern
        setIsShowingPattern(true)
        setTimeout(() => {
            setIsShowingPattern(false)
        }, 2000 + (patternLength * 300))
    }

    const handleDotTouch = (dot: number) => {
        if (isShowingPattern || result !== null || touchedDots.current.has(dot)) return

        if (!isDrawing) {
            setIsDrawing(true)
        }

        touchedDots.current.add(dot)
        setPlayerPattern(prev => [...prev, dot])

        // Check if pattern is complete
        if (playerPattern.length + 1 === pattern.length) {
            checkPattern([...playerPattern, dot])
        }
    }

    const checkPattern = (userPattern: number[]) => {
        const correct = JSON.stringify(userPattern) === JSON.stringify(pattern)
        setResult(correct ? 'correct' : 'wrong')

        setTimeout(() => {
            if (correct) {
                handleRoundEnd(true)
            } else {
                handleRoundEnd(false)
            }
        }, 1500)
    }

    const handleRoundEnd = (playerCorrect: boolean) => {
        if (playerCorrect) {
            const newWins = playerWins + 1
            setPlayerWins(newWins)
            if (newWins === 2) {
                endGame(true)
                return
            }
            setCurrentRound(prev => prev + 1)
        } else {
            const newWins = opponentWins + 1
            setOpponentWins(newWins)
            if (newWins === 2) {
                endGame(false)
                return
            }
            setCurrentRound(prev => prev + 1)
        }
    }

    const endGame = (playerWon: boolean) => {
        setIsGameOver(true)
        onComplete(playerWon ? 1000 : 100)
    }

    if (!isActive) return null

    const getDotPosition = (index: number) => {
        const row = Math.floor(index / 3)
        const col = index % 3
        return { x: col * 33.33 + 16.65, y: row * 33.33 + 16.65 }
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Score */}
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
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>النقاط</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{playerWins}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>النمط {currentRound}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{pattern.length} نقاط</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>الخصم</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{opponentWins}</div>
                </div>
            </div>

            {/* Pattern Grid */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                borderRadius: '20px',
                padding: '20px',
                border: '3px solid #6366f1',
                marginBottom: '20px',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {isShowingPattern && (
                    <div style={{
                        textAlign: 'center',
                        direction: 'rtl',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: '#a5b4fc'
                    }}>
                        احفظ النمط...
                    </div>
                )}

                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '300px',
                    aspectRatio: '1'
                }}>
                    {/* SVG for lines */}
                    <svg
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                        }}
                    >
                        {/* Show pattern during reveal */}
                        {isShowingPattern && pattern.map((dot, index) => {
                            if (index === 0) return null
                            const from = getDotPosition(pattern[index - 1])
                            const to = getDotPosition(dot)
                            return (
                                <line
                                    key={index}
                                    x1={`${from.x}%`}
                                    y1={`${from.y}%`}
                                    x2={`${to.x}%`}
                                    y2={`${to.y}%`}
                                    stroke="#a78bfa"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                            )
                        })}
                        {/* Show player pattern */}
                        {!isShowingPattern && playerPattern.map((dot, index) => {
                            if (index === 0) return null
                            const from = getDotPosition(playerPattern[index - 1])
                            const to = getDotPosition(dot)
                            return (
                                <line
                                    key={index}
                                    x1={`${from.x}%`}
                                    y1={`${from.y}%`}
                                    x2={`${to.x}%`}
                                    y2={`${to.y}%`}
                                    stroke={result === 'correct' ? '#10b981' : result === 'wrong' ? '#ef4444' : '#60a5fa'}
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                            )
                        })}
                    </svg>

                    {/* Dots */}
                    {[...Array(9)].map((_, index) => {
                        const pos = getDotPosition(index)
                        const isActive = isShowingPattern && pattern.includes(index)
                        const isTouched = playerPattern.includes(index)

                        return (
                            <div
                                key={index}
                                onTouchStart={() => handleDotTouch(index)}
                                onClick={() => handleDotTouch(index)}
                                style={{
                                    position: 'absolute',
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: isActive || isTouched ? '40px' : '28px',
                                    height: isActive || isTouched ? '40px' : '28px',
                                    borderRadius: '50%',
                                    background: isActive
                                        ? '#a78bfa'
                                        : isTouched
                                            ? result === 'correct' ? '#10b981' : result === 'wrong' ? '#ef4444' : '#60a5fa'
                                            : '#e0e7ff',
                                    cursor: !isShowingPattern && result === null ? 'pointer' : 'default',
                                    transition: 'all 200ms',
                                    border: '4px solid #312e81',
                                    boxShadow: (isActive || isTouched) ? '0 0 20px rgba(167, 139, 250, 0.6)' : '0 2px 8px rgba(0,0,0,0.3)',
                                    userSelect: 'none'
                                }}
                            />
                        )
                    })}
                </div>
                )}
            </div>

            {/* Result */}
            {result && !isGameOver && (
                <div style={{
                    padding: '16px',
                    background: result === 'correct' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `2px solid ${result === 'correct' ? '#10b981' : '#ef4444'}`,
                    borderRadius: '16px',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: result === 'correct' ? '#10b981' : '#ef4444',
                    fontSize: '1.2rem',
                    direction: 'rtl',
                    marginBottom: '16px'
                }}>
                    {result === 'correct' ? '✅ صحيح!' : '❌ خطأ!'}
                </div>
            )}

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
                        {playerWins > opponentWins ? '🏆' : '💔'}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
                        {playerWins > opponentWins ? 'فزت!' : 'خسرت'}
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
                💡 احفظ النمط ثم ارسمه! الأنماط تزداد صعوبة
            </div>
        </div>
    )
}
