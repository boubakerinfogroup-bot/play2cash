'use client'

import { useState, useEffect, useRef } from 'react'

interface BalanceGameProps {
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

export default function BalanceGame({ onComplete, isActive, matchId }: BalanceGameProps) {
    const [ballX, setBallX] = useState(50) // Ball position (percentage)
    const [ballVelocityX, setBallVelocityX] = useState(0) // Ball horizontal velocity
    const [platformAngle, setPlatformAngle] = useState(0) // Platform tilt angle in degrees
    const [score, setScore] = useState(0)
    const [isGameOver, setIsGameOver] = useState(false)
    const [controlDirection, setControlDirection] = useState(0) // -1, 0, 1

    const randomGen = useRef<SeededRandom | null>(null)
    const gameLoopRef = useRef<number | null>(null)
    const platformPhaseRef = useRef(0)
    const timeRef = useRef(0)

    // Physics constants
    const GRAVITY = 0.8 // Gravity effect based on platform angle
    const CONTROL_FORCE = 0.6 // Force applied by user controls
    const FRICTION = 0.94 // Velocity damping
    const MAX_VELOCITY = 3 // Maximum ball velocity
    const BALL_SIZE = 20 // Ball diameter in pixels
    const PLATFORM_WIDTH = 300 // Platform width in pixels
    const MAX_ANGLE = 25 // Maximum platform tilt in degrees

    useEffect(() => {
        if (matchId) {
            const seed = parseInt(matchId.replace(/\D/g, '').slice(0, 9)) || 12345
            randomGen.current = new SeededRandom(seed)
        }
    }, [matchId])

    useEffect(() => {
        if (isActive && !isGameOver) {
            // Reset game
            setBallX(50)
            setBallVelocityX(0)
            setPlatformAngle(0)
            setScore(0)
            platformPhaseRef.current = 0
            timeRef.current = 0
            gameLoop()
        }

        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
        }
    }, [isActive])

    const gameLoop = () => {
        if (isGameOver) return

        timeRef.current += 0.016 // ~60fps

        // Update platform angle (continuous tilting motion)
        const rng = randomGen.current || { next: () => Math.random() }
        platformPhaseRef.current += 0.02

        // Mix of sine waves for organic movement
        const tilt1 = Math.sin(platformPhaseRef.current) * MAX_ANGLE * 0.7
        const tilt2 = Math.sin(platformPhaseRef.current * 1.7) * MAX_ANGLE * 0.3
        const newAngle = tilt1 + tilt2
        setPlatformAngle(newAngle)

        // Physics simulation
        setBallX(prev => {
            setBallVelocityX(vel => {
                // Apply gravity based on platform angle (steeper = stronger force)
                const gravityForce = Math.sin((newAngle * Math.PI) / 180) * GRAVITY

                // Apply user control
                const controlForce = controlDirection * CONTROL_FORCE

                // Update velocity
                let newVel = vel + gravityForce + controlForce

                // Apply friction
                newVel *= FRICTION

                // Clamp velocity
                newVel = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVel))

                return newVel
            })

            return prev
        })

        // Update ball position based on velocity
        setBallX(prev => {
            setBallVelocityX(vel => {
                const newX = prev + vel

                // Check if ball fell off platform (0-100 range)
                if (newX < 0 || newX > 100) {
                    handleGameOver()
                    return vel
                }

                // Increment score (survived another frame)
                setScore(s => s + 1)

                return vel
            })

            return prev
        })

        gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    const handleGameOver = () => {
        setIsGameOver(true)
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
        onComplete(score)
    }

    const handleControlStart = (direction: number) => {
        setControlDirection(direction)
    }

    const handleControlEnd = () => {
        setControlDirection(0)
    }

    if (!isActive) return null

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '10px'
        }}>
            {/* Score - Arabic */}
            <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center',
                direction: 'rtl',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>النقاط</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{score}</div>
            </div>

            {/* Game Area */}
            <div style={{
                height: '400px',
                background: 'linear-gradient(to bottom, #dbeafe 0%, #e0e7ff 100%)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Platform */}
                <div style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${platformAngle}deg)`,
                    transformOrigin: 'center bottom',
                    transition: 'transform 50ms linear'
                }}>
                    {/* Vertical line (platform) */}
                    <div style={{
                        width: '8px',
                        height: '200px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(59, 130, 246, 0.5)'
                    }} />

                    {/* Ball */}
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: `translateX(calc(-50% + ${(ballX - 50) * 3}px))`,
                        width: `${BALL_SIZE}px`,
                        height: `${BALL_SIZE}px`,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, #ef4444, #dc2626)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)',
                        transition: 'transform 50ms linear'
                    }} />
                </div>

                {/* Game Over Overlay */}
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
                        <div style={{ fontSize: '3rem' }}>⚖️</div>
                        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                            سقطت الكرة!
                        </div>
                        <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 700 }}>
                            النقاط: {score}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginTop: '20px'
            }}>
                <button
                    onTouchStart={() => handleControlStart(-1)}
                    onTouchEnd={handleControlEnd}
                    onMouseDown={() => handleControlStart(-1)}
                    onMouseUp={handleControlEnd}
                    onMouseLeave={handleControlEnd}
                    disabled={isGameOver}
                    style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    ← يسار
                </button>
                <button
                    onTouchStart={() => handleControlStart(1)}
                    onTouchEnd={handleControlEnd}
                    onMouseDown={() => handleControlStart(1)}
                    onMouseUp={handleControlEnd}
                    onMouseLeave={handleControlEnd}
                    disabled={isGameOver}
                    style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    يمين →
                </button>
            </div>

            {/* Instructions - Arabic */}
            <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
                direction: 'rtl',
                marginTop: '16px'
            }}>
                💡 اضغط يساراً ويميناً لتحافظ على توازن الكرة!
            </div>
        </div>
    )
}
