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
    const [ballX, setBallX] = useState(50) // Ball position (percentage 0-100)
    const [ballY, setBallY] = useState(0) // Ball height above platform
    const [ballVelocityX, setBallVelocityX] = useState(0)
    const [ballVelocityY, setBallVelocityY] = useState(0)
    const [platformAngle, setPlatformAngle] = useState(0) // Platform tilt angle in degrees
    const [score, setScore] = useState(0)
    const [isGameOver, setIsGameOver] = useState(false)
    const [isFalling, setIsFalling] = useState(false)
    const [controlDirection, setControlDirection] = useState(0) // -1, 0, 1

    const randomGen = useRef<SeededRandom | null>(null)
    const gameLoopRef = useRef<number | null>(null)
    const platformPhaseRef = useRef(0)

    // Physics constants
    const GRAVITY = 0.5 // Downward acceleration
    const PLATFORM_TILT_GRAVITY = 0.3 // Horizontal force from platform tilt
    const CONTROL_FORCE = 0.4 // Force from user controls
    const FRICTION = 0.92 // Velocity damping when on platform
    const AIR_RESISTANCE = 0.98 // Damping when falling
    const MAX_VELOCITY = 4
    const BALL_RADIUS = 15
    const PLATFORM_WIDTH = 80 // Percentage of screen
    const MAX_ANGLE = 20 // Maximum platform tilt

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
            setBallY(0)
            setBallVelocityX(0)
            setBallVelocityY(0)
            setPlatformAngle(0)
            setScore(0)
            setIsFalling(false)
            platformPhaseRef.current = 0
            gameLoop()
        }

        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
        }
    }, [isActive])

    const gameLoop = () => {
        if (isGameOver) return

        // Update platform angle (continuous organic tilting)
        platformPhaseRef.current += 0.015
        const tilt1 = Math.sin(platformPhaseRef.current) * MAX_ANGLE * 0.6
        const tilt2 = Math.sin(platformPhaseRef.current * 1.3 + 1) * MAX_ANGLE * 0.4
        const newAngle = tilt1 + tilt2
        setPlatformAngle(newAngle)

        // Update ball physics
        setBallX(prevX => {
            let newX = prevX
            let newY = 0
            let newVelX = 0
            let newVelY = 0

            setBallY(prevY => {
                setBallVelocityX(prevVelX => {
                    setBallVelocityY(prevVelY => {
                        // Check if ball is on platform or falling
                        const platformLeft = (100 - PLATFORM_WIDTH) / 2
                        const platformRight = platformLeft + PLATFORM_WIDTH
                        const onPlatform = prevX >= platformLeft && prevX <= platformRight && prevY <= 0.5

                        if (onPlatform && !isFalling) {
                            // Ball is on platform
                            newY = 0

                            // Apply gravity based on platform tilt
                            const tiltForce = Math.sin((newAngle * Math.PI) / 180) * PLATFORM_TILT_GRAVITY

                            // Apply user control
                            const controlForce = controlDirection * CONTROL_FORCE

                            // Update horizontal velocity
                            newVelX = prevVelX + tiltForce + controlForce
                            newVelX *= FRICTION // Apply friction
                            newVelX = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVelX))

                            newVelY = 0

                            // Update position
                            newX = prevX + newVelX

                            // Check if ball rolled off platform
                            if (newX < platformLeft || newX > platformRight) {
                                setIsFalling(true)
                            }

                            // Increment score
                            setScore(s => s + 1)
                        } else {
                            // Ball is falling
                            setIsFalling(true)

                            // Apply gravity
                            newVelY = prevVelY + GRAVITY
                            newVelX = prevVelX * AIR_RESISTANCE

                            // Update position
                            newX = prevX + newVelX
                            newY = prevY + newVelY

                            // Check if ball fell off screen
                            if (newY > 100) {
                                handleGameOver()
                            }
                        }

                        return newVelY
                    })
                    return newVelX
                })
                return newY
            })
            return newX
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

    const platformLeft = (100 - PLATFORM_WIDTH) / 2
    const platformRight = platformLeft + PLATFORM_WIDTH

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
                border: '3px solid #cbd5e1'
            }}>
                {/* Platform (horizontal line at 60% height) */}
                <div style={{
                    position: 'absolute',
                    top: '60%',
                    left: '50%',
                    width: `${PLATFORM_WIDTH}%`,
                    transform: `translateX(-50%) rotate(${platformAngle}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 50ms linear'
                }}>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(59, 130, 246, 0.5)',
                        position: 'relative'
                    }}>
                        {/* Platform edge markers */}
                        <div style={{
                            position: 'absolute',
                            left: '-4px',
                            top: '-6px',
                            width: '4px',
                            height: '20px',
                            background: '#2563eb',
                            borderRadius: '2px'
                        }} />
                        <div style={{
                            position: 'absolute',
                            right: '-4px',
                            top: '-6px',
                            width: '4px',
                            height: '20px',
                            background: '#2563eb',
                            borderRadius: '2px'
                        }} />
                    </div>
                </div>

                {/* Ball */}
                <div style={{
                    position: 'absolute',
                    left: `${ballX}%`,
                    top: `calc(60% - ${ballY}px - ${BALL_RADIUS + 4}px)`,
                    transform: 'translateX(-50%)',
                    width: `${BALL_RADIUS * 2}px`,
                    height: `${BALL_RADIUS * 2}px`,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, #ef4444, #dc2626)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)',
                    transition: 'all 16ms linear',
                    zIndex: 10
                }} />

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
                        direction: 'rtl',
                        zIndex: 20
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
                        background: controlDirection === -1
                            ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        transform: controlDirection === -1 ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 100ms'
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
                        background: controlDirection === 1
                            ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        transform: controlDirection === 1 ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 100ms'
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
                💡 اضغط يساراً ويميناً لمنع الكرة من السقوط!
            </div>
        </div>
    )
}
