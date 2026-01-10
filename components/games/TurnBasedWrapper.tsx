'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface TurnBasedWrapperProps {
    matchId: string
    userId: string
    lang: 'fr' | 'ar'
    onMove: (moveData: any) => Promise<void>
    children: (props: {
        isMyTurn: boolean
        timeRemaining: number
        onSubmitMove: (moveData: any) => void
    }) => React.ReactNode
}

export default function TurnBasedWrapper({
    matchId,
    userId,
    lang,
    onMove,
    children
}: TurnBasedWrapperProps) {
    const router = useRouter()
    const [gameState, setGameState] = useState<any>(null)
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [showWarning, setShowWarning] = useState(false)
    const [warningMessage, setWarningMessage] = useState('')
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const warningIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Poll game state
    useEffect(() => {
        const pollState = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/turn-based/${matchId}/state`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                const data = await response.json()

                if (data.success && data.gameState) {
                    setGameState(data.gameState)

                    // Check if match is completed
                    if (data.gameState.status === 'COMPLETED') {
                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
                        if (warningIntervalRef.current) clearInterval(warningIntervalRef.current)
                        router.push(`/result?match=${matchId}`)
                    }

                    // Calculate time remaining
                    if (data.gameState.turnDeadline) {
                        const remaining = Math.floor((new Date(data.gameState.turnDeadline).getTime() - Date.now()) / 1000)
                        setTimeRemaining(Math.max(0, remaining))
                    }
                }
            } catch (error) {
                console.error('Poll state error:', error)
            }
        }

        pollState()
        pollIntervalRef.current = setInterval(pollState, 2000)

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            if (warningIntervalRef.current) clearInterval(warningIntervalRef.current)
        }
    }, [matchId, router])

    // Timeout warnings
    useEffect(() => {
        const isMyTurn = gameState?.currentTurn === userId

        if (isMyTurn && timeRemaining > 0) {
            // Show warnings at 50s, 40s, 30s, 20s, 10s
            if ([50, 40, 30, 20, 10].includes(timeRemaining)) {
                setWarningMessage(
                    lang === 'ar'
                        ? `لديك ${timeRemaining} ثانية للعب!`
                        : `Vous avez ${timeRemaining} secondes pour jouer!`
                )
                setShowWarning(true)

                setTimeout(() => setShowWarning(false), 3000)
            }

            // Final warning at 5s
            if (timeRemaining === 5) {
                setWarningMessage(
                    lang === 'ar'
                        ? '⚠️ 5 ثوانٍ فقط متبقية!'
                        : '⚠️ Seulement 5 secondes restantes!'
                )
                setShowWarning(true)
            }
        }
    }, [timeRemaining, gameState, userId, lang])

    const handleSubmitMove = async (moveData: any) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/turn-based/${matchId}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ moveData })
            })

            const data = await response.json()

            if (!data.success) {
                if (data.timeout) {
                    // Player forfeited due to timeout
                    router.push(`/result?match=${matchId}`)
                } else {
                    throw new Error(data.error || 'Failed to submit move')
                }
            }

            // If completed, redirect to result
            if (data.completed) {
                router.push(`/result?match=${matchId}`)
            }
        } catch (error: any) {
            console.error('Submit move error:', error)
            alert(error.message)
        }
    }

    if (!gameState) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="spinner"></div>
                <p>{lang === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</p>
            </div>
        )
    }

    const isMyTurn = gameState.currentTurn === userId

    return (
        <>
            {children({
                isMyTurn,
                timeRemaining,
                onSubmitMove: handleSubmitMove
            })}

            {/* Timeout Warning Popup */}
            {showWarning && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    padding: '20px 40px',
                    background: timeRemaining <= 10 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    animation: 'shake 0.5s ease-in-out',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textAlign: 'center'
                }}>
                    {warningMessage}
                </div>
            )}

            {/* Turn Indicator */}
            <div style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                padding: '12px 24px',
                background: isMyTurn ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(100, 116, 139, 0.9)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: 100
            }}>
                {isMyTurn
                    ? (lang === 'ar' ? `دورك (${timeRemaining}s)` : `Votre tour (${timeRemaining}s)`)
                    : (lang === 'ar' ? 'دور الخصم' : "Tour de l'adversaire")
                }
            </div>

            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-50%) rotate(-5deg); }
          75% { transform: translateX(-50%) rotate(5deg); }
        }
      `}</style>
        </>
    )
}
