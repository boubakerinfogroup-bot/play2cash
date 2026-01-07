'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface RocketGameProps {
    onComplete: (score: number) => void
    isActive: boolean
    matchId?: string // For synchronized gameplay
}

// Seeded random number generator for fair synchronized gameplay
class SeededRandom {
    private seed: number

    constructor(seed: number) {
        this.seed = seed
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280
        return this.seed / 233280
    }
}

interface Obstacle {
    x: number;
    y: number;
    id: number;
}

export default function RocketGame({ onComplete, isActive, matchId }: RocketGameProps) {
    const [rocketX, setRocketX] = useState(50)
    const [obstacles, setObstacles] = useState<Obstacle[]>([])
    const [score, setScore] = useState(0)
    const [speed, setSpeed] = useState(1)
    const [isGameOver, setIsGameOver] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const randomGen = useRef<SeededRandom | null>(null)
    const obstacleCounterRef = useRef(0)
    const gameLoopRef = useRef<number | null>(null)
    const spawnRate = 0.02
    const startTimeRef = useRef<number>(0)

    // Initialize seeded random for fair gameplay
    useEffect(() => {
        if (matchId) {
            // Use match ID to create seed - both players get same obstacles!
            const seed = parseInt(matchId.replace(/\D/g, '').slice(0, 9)) || 12345
            randomGen.current = new SeededRandom(seed)
        }
    }, [matchId])

    // Start game
    useEffect(() => {
        if (isActive && !isGameOver) {
            setRocketX(50)
            setObstacles([])
            setScore(0)
            setSpeed(1)
            obstacleCounterRef.current = 0
            startTimeRef.current = Date.now()
            gameLoop()
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
        }
    }, [isActive, isGameOver])

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (isGameOver) return
        setIsDragging(true)
        handleTouchMove(e) // Handle initial position immediately
    }

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDragging || isGameOver) return

        const touch = 'touches' in e ? e.touches[0] : e
        const container = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const relativeX = ((touch.clientX - container.left) / container.width) * 100
        const clampedX = Math.max(10, Math.min(90, relativeX))
        setRocketX(clampedX)
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
    }

    const gameLoop = () => {
        if (isGameOver) return

        const elapsedTime = Date.now() - startTimeRef.current

        // Update speed based on time
        setSpeed(1 + Math.floor(elapsedTime / 10000) * 0.1)

        // Move obstacles down
        setObstacles(prev => {
            const moved = prev
                .map(obs => ({ ...obs, y: obs.y + speed }))
                .filter(obs => obs.y < 110)

            // Only spawn obstacles AFTER 5 seconds
            if (elapsedTime > 5000) {
                const rng = randomGen.current || { next: () => Math.random() }

                if (rng.next() < spawnRate) {
                    const newX = rng.next() * 80 + 10
                    moved.push({
                        x: newX,
                        y: -5,
                        id: obstacleCounterRef.current++
                    })
                }
            }

            return moved
        })

        // Increase score and difficulty GRADUALLY
        setScore(prev => {
            const newScore = prev + 1

            // Every 100 points: increase speed slightly
            if (newScore % 100 === 0) {
                setSpeed(s => Math.min(s + 0.2, 7))
            }

            // Every 80 points: increase obstacle spawn rate
            if (newScore % 80 === 0) {
                setSpawnRate(r => Math.min(r + 0.005, 0.055))
            }

            return newScore
        })

        gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    // Check collisions
    useEffect(() => {
        if (isGameOver) return

        obstacles.forEach(obs => {
            //Rocket is at bottom (85% Y position)
            const rocketY = 85

            // Check if obstacle is near rocket's vertical position
            if (obs.y > 78 && obs.y < 92) {
                // Check horizontal collision
                const collision = Math.abs(rocketX - obs.x) < 10
                if (collision) {
                    handleGameOver()
                }
            }
        })
    }, [obstacles, rocketX])

    const handleGameOver = () => {
        setIsGameOver(true)
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current)
        }
        onComplete(score)
    }

    // Touch/Click controls - move rocket left or right
    const handleScreenTouch = (e: React.TouchEvent | React.MouseEvent) => {
        if (isGameOver) return

        const touch = 'touches' in e ? e.touches[0] : e
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const clickX = ((touch.clientX - rect.left) / rect.width) * 100

        setRocketX(Math.max(10, Math.min(90, clickX)))
    }

    if (!isActive) return null

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Score Display - Arabic */}
            <div style={{
                background: '#1e293b',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '15px',
                textAlign: 'center',
                direction: 'rtl'
            }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>النقاط</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>{score}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                    السرعة: {speed.toFixed(1)}x
                </div>
            </div>

            {/* Game Area */}
            <div
                onTouchMove={handleScreenTouch}
                onMouseMove={handleScreenTouch}
                style={{
                    width: '100%',
                    height: '500px',
                    background: 'linear-gradient(to top, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '2px solid #475569',
                    touchAction: 'none',
                    cursor: 'none'
                }}
            >
                {/* Animated Stars Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none'
                }}>
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${(i * 37) % 100}%`,
                                top: `${(i * 53) % 100}%`,
                                width: '2px',
                                height: '2px',
                                background: 'white',
                                borderRadius: '50%',
                                opacity: 0.3 + ((i % 5) * 0.15),
                                animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite ${i * 0.2}s`
                            }}
                        />
                    ))}
                </div>

                {/* Rocket - Using PNG */}
                <div style={{
                    position: 'absolute',
                    left: `${rocketX}%`,
                    bottom: '15%',
                    transform: 'translateX(-50%)',
                    transition: 'left 0.1s ease-out',
                    filter: 'drop-shadow(0 0 10px #10b981)'
                }}>
                    <Image
                        src="/assets/rocket.png"
                        alt="Rocket"
                        width={50}
                        height={50}
                        style={{ display: 'block' }}
                        priority
                    />
                </div>

                {/* Obstacles - Broken Squares */}
                {obstacles.map(obs => (
                    <div
                        key={obs.id}
                        style={{
                            position: 'absolute',
                            left: `${obs.x}%`,
                            top: `${obs.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '35px',
                            height: '35px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '2px'
                        }}
                    >
                        {/* Broken square made of bright pieces for visibility */}
                        <div style={{ width: '14px', height: '14px', background: '#f97316', borderRadius: '2px' }} />
                        <div style={{ width: '14px', height: '14px', background: '#ea580c', borderRadius: '2px' }} />
                        <div style={{ width: '14px', height: '14px', background: '#dc2626', borderRadius: '2px' }} />
                        <div style={{ width: '14px', height: '14px', background: '#b91c1c', borderRadius: '2px' }} />
                    </div>
                ))}

                {/* Game Over - Arabic */}
                {isGameOver && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: '15px',
                        direction: 'rtl'
                    }}>
                        <div style={{ fontSize: '3rem' }}>💥</div>
                        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                            اصطدام!
                        </div>
                        <div style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 700 }}>
                            النقاط: {score}
                        </div>
                    </div>
                )}            </div>

            {/* Instructions - Arabic */}
            <div style={{
                marginTop: '12px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.8rem',
                direction: 'rtl'
            }}>
                💡 اضغط واسحب يساراً ويميناً لتفادي الصخور!
            </div>

            {/* Star Animation CSS */}
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
            `}</style>
        </div>
    )
}
