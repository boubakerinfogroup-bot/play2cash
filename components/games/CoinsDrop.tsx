'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface CoinsDropProps {
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

interface Coin {
    id: number
    x: number
    y: number
    speed: number
}

export default function CoinsDrop({ onComplete, isActive, matchId }: CoinsDropProps) {
    const [coins, setCoins] = useState<Coin[]>([])
    const [score, setScore] = useState(0)
    const [missedCoins, setMissedCoins] = useState(0)
    const [isGameOver, setIsGameOver] = useState(false)
    const randomGen = useRef<SeededRandom | null>(null)
    const coinIdRef = useRef(0)
    const gameLoopRef = useRef<number | null>(null)
    const MAX_MISSED = 5

    useEffect(() => {
        if (matchId) {
            const seed = parseInt(matchId.replace(/\D/g, '').slice(0, 9)) || 12345
            randomGen.current = new SeededRandom(seed)
        }
    }, [matchId])

    useEffect(() => {
        if (isActive && !isGameOver) {
            startGame()
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
        }
    }, [isActive])

    const startGame = () => {
        setCoins([])
        setScore(0)
        setMissedCoins(0)
        setIsGameOver(false)
        gameLoop()
    }

    const gameLoop = () => {
        const rng = randomGen.current || { next: () => Math.random() }

        // Spawn rate increases with score
        const spawnChance = Math.min(0.03 + (score * 0.0001), 0.08)

        if (rng.next() < spawnChance) {
            const baseSpeed = 1.5 + (score * 0.01) // Speed increases with score
            const newCoin: Coin = {
                id: coinIdRef.current++,
                x: rng.next() * 90 + 5,
                y: -5,
                speed: baseSpeed + (rng.next() * 0.5)
            }
            setCoins(prev => [...prev, newCoin])
        }

        // Move coins down
        setCoins(prev => {
            const updated = prev.map(coin => ({ ...coin, y: coin.y + coin.speed }))

            // Check for missed coins
            const nowMissed = updated.filter(c => c.y > 105).length
            if (nowMissed > 0) {
                setMissedCoins(prevMissed => {
                    const newMissed = prevMissed + nowMissed
                    if (newMissed >= MAX_MISSED) {
                        handleGameOver()
                    }
                    return newMissed
                })
            }

            return updated.filter(coin => coin.y < 105)
        })

        if (!isGameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop)
        }
    }

    const handleCoinTap = (coinId: number) => {
        setCoins(prev => prev.filter(c => c.id !== coinId))
        setScore(prev => prev + 10)
    }

    const handleGameOver = () => {
        setIsGameOver(true)
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
        onComplete(score)
    }

    if (!isActive) return null

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Stats - Arabic */}
            <div style={{
                background: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-around',
                direction: 'rtl',
                boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>الدولارات</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{score / 10}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>الفائتة</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>
                        {missedCoins}/{MAX_MISSED}
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div style={{
                height: '500px',
                background: 'linear-gradient(to bottom, #dbeafe 0%, #f1f5f9 100%)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid #cbd5e1'
            }}>
                {/* Coins */}
                {coins.map(coin => (
                    <button
                        key={coin.id}
                        onClick={() => handleCoinTap(coin.id)}
                        style={{
                            position: 'absolute',
                            left: `${coin.x}%`,
                            top: `${coin.y}%`,
                            width: '60px',
                            height: '60px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            transform: 'translate(-50%, -50%)',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                            transition: 'transform 0.1s',
                            padding: 0
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(0.9)'
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                        }}
                    >
                        <Image
                            src="/assets/dollar.png"
                            alt="Dollar"
                            width={60}
                            height={60}
                            style={{ display: 'block' }}
                            priority
                        />
                    </button>
                ))}

                {/* Game Over */}
                {isGameOver && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '15px',
                        direction: 'rtl'
                    }}>
                        <div style={{ fontSize: '3rem' }}>💵</div>
                        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                            فاتك الكثير من الدولارات!
                        </div>
                        <div style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 700 }}>
                            الدولارات المجموعة: {score / 10}
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions - Arabic */}
            <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                direction: 'rtl',
                marginTop: '16px'
            }}>
                💡 اضغط على الدولارات قبل أن تسقط! لا تفوت {MAX_MISSED}!
            </div>
        </div>
    )
}
